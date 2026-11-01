import type { Channel } from "../env";

export const WINDOW_MS = 24 * 3600_000;

export type CanSend = { ok: true; viaTemplate: boolean } | { ok: false; reason: "OUTSIDE_24H" };

/**
 * Meta's messaging window: Messenger/Instagram may only message within 24h of the customer's last message;
 * WhatsApp outside 24h needs an approved template. Website chat has no such rule.
 */
export function canSend(o: { channel: Channel | string; lastInboundAt: string | null | undefined; now: Date; whatsappTemplate?: string | null }): CanSend {
  if (o.channel === "website") return { ok: true, viaTemplate: false };
  const inside = !!o.lastInboundAt && o.now.getTime() - new Date(o.lastInboundAt).getTime() < WINDOW_MS;
  if (inside) return { ok: true, viaTemplate: false };
  if (o.channel === "whatsapp" && o.whatsappTemplate) return { ok: true, viaTemplate: true };
  return { ok: false, reason: "OUTSIDE_24H" };
}
