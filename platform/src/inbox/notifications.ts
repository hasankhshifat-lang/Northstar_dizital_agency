import type { Channel, Env, TenantRow } from "../env";
import { getEngine } from "../engine/registry";
import { tenantDb } from "../lib/db";
import { canSend } from "../followups/rule24h";
import { orderHooks } from "../orders/service";
import { bumpUsage } from "../usage";

/** Send the receipt on "confirmed" and tracking on "shipped" into the order's chat, when allowed. */
orderHooks.push(async (env: Env, tenantId: string, e) => {
  if (e.type !== "status" || (e.to !== "confirmed" && e.to !== "shipped")) return;
  const o = e.order;
  if (!o.conversation_id || !o.channel || !o.customer_id) return;
  const t = await env.DB.prepare("SELECT * FROM tenants WHERE id=?").bind(tenantId).first<TenantRow>();
  if (!t || t.status !== "active" || !t.engine_workspace_ref) return;
  if (e.to === "confirmed" && !t.notify_on_confirmed) return;
  if (e.to === "shipped" && !t.notify_on_shipped) return;
  const tdb = tenantDb(env.DB, tenantId);
  const ch = await tdb.first<{ n: number }>("SELECT COUNT(*) AS n FROM tenant_channels WHERE tenant_id=?1 AND channel=?2 AND enabled=1", o.channel);
  if (!ch?.n) return;
  const li = await tdb.first<{ last_inbound_at: string }>("SELECT last_inbound_at FROM customer_last_inbound WHERE tenant_id=?1 AND customer_id=?2 AND channel=?3", o.customer_id, o.channel);
  if (!canSend({ channel: o.channel as Channel, lastInboundAt: li?.last_inbound_at, now: new Date() }).ok) return;
  await getEngine(env, t).sendMessage(t.engine_workspace_ref, o.conversation_id, {
    kind: "receipt",
    order: { number: o.number, total: o.total, status: o.status, items: o.items.map((i) => ({ name: i.name_snapshot, qty: i.qty, unit_price: i.unit_price })), tracking: o.tracking_number, courier: o.courier },
  });
  await bumpUsage(env.DB, tenantId, "outbound_messages");
});
