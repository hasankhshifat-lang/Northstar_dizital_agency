import type { Channel, Feature, TenantContext, TenantRow } from "../env";

export async function loadTenantContext(db: D1Database, tenantId: string): Promise<TenantContext | null> {
  const t = await db.prepare("SELECT * FROM tenants WHERE id=?").bind(tenantId).first<TenantRow>();
  if (!t) return null;
  const [f, ch] = await db.batch([
    db.prepare("SELECT feature FROM tenant_features WHERE tenant_id=? AND enabled=1 ORDER BY feature").bind(tenantId),
    db.prepare("SELECT channel FROM tenant_channels WHERE tenant_id=? AND enabled=1 ORDER BY channel").bind(tenantId),
  ]);
  return {
    ...t,
    features: (f.results as { feature: Feature }[]).map((r) => r.feature),
    channels: (ch.results as { channel: Channel }[]).map((r) => r.channel),
  };
}
