import type { Channel, Env } from "../env";
import { tenantDb, type TenantDb } from "../lib/db";
import { canSend } from "./rule24h";

export type Audience =
  | { type: "recent24h" }
  | { type: "tag"; value: string }
  | { type: "bought_product"; value: string }
  | { type: "inactive_days"; value: number };

export interface Recipient { customerId: string; channel: string; conversationId: string }
export type ExcludeReason = "NO_CHAT" | "CHANNEL_DISABLED" | "OUTSIDE_24H";

async function audienceCustomerIds(tdb: TenantDb, a: Audience, now: Date): Promise<string[]> {
  let rows: { id: string }[];
  switch (a.type) {
    case "recent24h":
      rows = await tdb.all("SELECT DISTINCT customer_id AS id FROM customer_last_inbound WHERE tenant_id=?1 AND last_inbound_at > ?2", new Date(now.getTime() - 24 * 3600_000).toISOString());
      break;
    case "tag":
      rows = await tdb.all("SELECT id FROM customers WHERE tenant_id=?1 AND tags LIKE ?2", `%${JSON.stringify(a.value)}%`);
      break;
    case "bought_product":
      rows = await tdb.all("SELECT DISTINCT o.customer_id AS id FROM orders o JOIN order_items i ON i.order_id=o.id WHERE o.tenant_id=?1 AND i.product_id=?2 AND o.status != 'cancelled' AND o.customer_id IS NOT NULL", a.value);
      break;
    case "inactive_days":
      rows = await tdb.all("SELECT id FROM customers WHERE tenant_id=?1 AND last_order_at IS NOT NULL AND last_order_at < ?2", new Date(now.getTime() - a.value * 86400_000).toISOString());
      break;
  }
  return rows.map((r) => r.id);
}

/** Who a broadcast would reach right now, by channel, and who is excluded and why. */
export async function resolveAudience(env: Env, tenantId: string, audience: Audience, enabledChannels: Channel[], now = new Date()) {
  const tdb = tenantDb(env.DB, tenantId);
  const ids = await audienceCustomerIds(tdb, audience, now);
  const recipients: Recipient[] = [];
  const excluded = new Map<ExcludeReason, number>();
  const bump = (r: ExcludeReason) => excluded.set(r, (excluded.get(r) ?? 0) + 1);
  for (const id of ids) {
    const chats = await tdb.all<{ channel: string; conversation_id: string | null; last_inbound_at: string }>(
      "SELECT channel, conversation_id, last_inbound_at FROM customer_last_inbound WHERE tenant_id=?1 AND customer_id=?2 AND conversation_id IS NOT NULL ORDER BY last_inbound_at DESC", id,
    );
    if (!chats.length) { bump("NO_CHAT"); continue; }
    const usable = chats.filter((ch) => enabledChannels.includes(ch.channel as Channel));
    if (!usable.length) { bump("CHANNEL_DISABLED"); continue; }
    const open = usable.find((ch) => canSend({ channel: ch.channel, lastInboundAt: ch.last_inbound_at, now }).ok);
    if (!open) { bump("OUTSIDE_24H"); continue; }
    recipients.push({ customerId: id, channel: open.channel, conversationId: open.conversation_id! });
  }
  const by_channel: Record<string, number> = {};
  for (const r of recipients) by_channel[r.channel] = (by_channel[r.channel] ?? 0) + 1;
  return { recipients, by_channel, excluded: [...excluded].map(([reason, count]) => ({ reason, count })) };
}
