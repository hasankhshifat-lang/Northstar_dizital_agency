import type { Env } from "../env";

export interface InboundEvent {
  tenantId: string;
  customerId: string;
  conversationId: string;
  channel: string;
  text?: string;
  intent?: string;
  productCode?: string;
}

/** Subscribers to incoming customer messages (e.g. follow-ups cancel/schedule). Failures are logged, never thrown. */
export const inboundHooks: ((env: Env, e: InboundEvent) => Promise<void>)[] = [];

export async function fireInbound(env: Env, e: InboundEvent) {
  for (const h of inboundHooks) {
    try { await h(env, e); } catch (err) { console.error("inbound hook failed", err); }
  }
}
