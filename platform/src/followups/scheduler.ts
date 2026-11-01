import type { Channel, Env, Feature, TenantRow } from "../env";
import { loadProduct, productName } from "../catalog/service";
import { getEngine } from "../engine/registry";
import { newId } from "../lib/crypto";
import { tenantDb } from "../lib/db";
import { addMinutes, nowIso } from "../lib/time";
import { bumpUsage } from "../usage";
import { resolveAudience, type Audience } from "./broadcasts";
import { canSend } from "./rule24h";
import { renderTemplate, type RuleRow } from "./rules";

export const MAX_SEND_ATTEMPTS = 3;
const RETRY_MINUTES = 5;
const BATCH = 200;

interface SendRow {
  id: string; tenant_id: string; rule_id: string | null; broadcast_id: string | null; customer_id: string; channel: string;
  conversation_id: string | null; message: string | null; product_id: string | null; context: string | null; attempts: number;
}

interface TenantState { t: TenantRow; features: Feature[]; channels: Channel[] }

async function tenantState(env: Env, cache: Map<string, TenantState | null>, id: string) {
  if (cache.has(id)) return cache.get(id)!;
  const t = await env.DB.prepare("SELECT * FROM tenants WHERE id=?").bind(id).first<TenantRow>();
  let st: TenantState | null = null;
  if (t) {
    const [f, ch] = await env.DB.batch([
      env.DB.prepare("SELECT feature FROM tenant_features WHERE tenant_id=? AND enabled=1").bind(id),
      env.DB.prepare("SELECT channel FROM tenant_channels WHERE tenant_id=? AND enabled=1").bind(id),
    ]);
    st = { t, features: (f.results as any[]).map((r) => r.feature), channels: (ch.results as any[]).map((r) => r.channel) };
  }
  cache.set(id, st);
  return st;
}

/** Turn due broadcasts into individual sends (audience resolved at send time, so the 24h window is current). */
async function expandBroadcasts(env: Env, now: Date, cache: Map<string, TenantState | null>, onlyId?: string) {
  const due = (await env.DB.prepare(
    `SELECT * FROM broadcasts WHERE status='scheduled' AND scheduled_for <= ? ${onlyId ? "AND id = ?" : ""} LIMIT 50`,
  ).bind(...(onlyId ? [nowIso(now), onlyId] : [nowIso(now)])).all<{ id: string; tenant_id: string; audience: string; message: string; product_id: string | null }>()).results;
  for (const b of due) {
    const claimed = await env.DB.prepare("UPDATE broadcasts SET status='sending' WHERE id=? AND status='scheduled'").bind(b.id).run();
    if (!claimed.meta.changes) continue;
    const st = await tenantState(env, cache, b.tenant_id);
    if (st && st.t.status === "active" && st.features.includes("followups")) {
      const { recipients } = await resolveAudience(env, b.tenant_id, JSON.parse(b.audience) as Audience, st.channels, now);
      const tdb = tenantDb(env.DB, b.tenant_id);
      const stmts = recipients.map((r) => tdb.insertStmt("followup_sends", {
        id: newId(), broadcast_id: b.id, dedup_key: `broadcast:${b.id}:${r.customerId}`, customer_id: r.customerId, channel: r.channel,
        conversation_id: r.conversationId, message: b.message, product_id: b.product_id, status: "scheduled", scheduled_for: nowIso(now),
      }));
      for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
    }
    await env.DB.prepare("UPDATE broadcasts SET status='sent' WHERE id=?").bind(b.id).run();
  }
}

/** Cron: send every due follow-up/broadcast message, skipping (with a reason) anything no longer allowed. */
export async function runScheduler(env: Env, now: Date = new Date(), opts: { broadcastId?: string } = {}) {
  const cache = new Map<string, TenantState | null>();
  await expandBroadcasts(env, now, cache, opts.broadcastId);
  const due = (await env.DB.prepare(
    `SELECT * FROM followup_sends WHERE status='scheduled' AND scheduled_for <= ? ${opts.broadcastId ? "AND broadcast_id = ?" : ""} ORDER BY scheduled_for LIMIT ${BATCH}`,
  ).bind(...(opts.broadcastId ? [nowIso(now), opts.broadcastId] : [nowIso(now)])).all<SendRow>()).results;

  for (const s of due) {
    const skip = (reason: string) => env.DB.prepare("UPDATE followup_sends SET status='skipped', skip_reason=? WHERE id=?").bind(reason, s.id).run();
    const st = await tenantState(env, cache, s.tenant_id);
    if (!st || st.t.status !== "active") { await skip("ACCOUNT_SUSPENDED"); continue; }
    if (!st.features.includes("followups")) { await skip("FEATURE_DISABLED"); continue; }
    const tdb = tenantDb(env.DB, s.tenant_id);
    const rule = s.rule_id ? await tdb.get<RuleRow>("followup_rules", s.rule_id) : null;
    if (s.rule_id && !rule?.enabled) { await skip("RULE_DISABLED"); continue; }
    if (!st.channels.includes(s.channel as Channel)) { await skip("CHANNEL_DISABLED"); continue; }
    if (!s.conversation_id || !st.t.engine_workspace_ref) { await skip("NO_CHAT"); continue; }
    const li = await tdb.first<{ last_inbound_at: string }>("SELECT last_inbound_at FROM customer_last_inbound WHERE tenant_id=?1 AND customer_id=?2 AND channel=?3", s.customer_id, s.channel);
    const allowed = canSend({ channel: s.channel, lastInboundAt: li?.last_inbound_at, now, whatsappTemplate: rule?.whatsapp_template_name });
    if (!allowed.ok) { await skip("OUTSIDE_24H"); continue; }

    const cust = await tdb.first<{ name: string }>("SELECT name FROM customers WHERE tenant_id=?1 AND id=?2", s.customer_id);
    const ctx = s.context ? JSON.parse(s.context) : {};
    const text = rule
      ? renderTemplate(rule.message_template, { name: cust?.name, product: ctx.product, order_number: ctx.order_number, offer: rule.offer_text })
      : renderTemplate(s.message ?? "", { name: cust?.name });
    try {
      const engine = getEngine(env, st.t);
      await engine.sendMessage(st.t.engine_workspace_ref, s.conversation_id, { kind: "text", text, by: "system", ...(allowed.viaTemplate ? { template: rule!.whatsapp_template_name! } : {}) });
      let sent = 1;
      if (s.product_id) {
        const p = await loadProduct(tdb, s.product_id);
        if (p) {
          await engine.sendMessage(st.t.engine_workspace_ref, s.conversation_id, { kind: "product", product: { code: p.code, name: productName(p), price: p.price, sale_price: p.sale_price, image_url: p.images[0]?.url ?? null, url: `/p/${st.t.slug}/${encodeURIComponent(p.code)}` } });
          sent++;
        }
      }
      await env.DB.prepare("UPDATE followup_sends SET status='sent', sent_at=?, attempts=attempts+1 WHERE id=?").bind(nowIso(now), s.id).run();
      await bumpUsage(env.DB, s.tenant_id, "outbound_messages", sent, now);
    } catch (e) {
      const attempts = s.attempts + 1;
      await env.DB.prepare("UPDATE followup_sends SET attempts=?, status=?, skip_reason=?, scheduled_for=? WHERE id=?")
        .bind(attempts, attempts >= MAX_SEND_ATTEMPTS ? "failed" : "scheduled", attempts >= MAX_SEND_ATTEMPTS ? "ENGINE_UNAVAILABLE" : null, addMinutes(now, RETRY_MINUTES), s.id).run();
    }
  }
}
