import type { Channel, Env, Feature } from "../env";
import { CHANNELS, FEATURES } from "../env";
import { newId, randomToken, sha256Hex } from "../lib/crypto";
import { ApiError } from "../lib/errors";
import { addHours, nowIso } from "../lib/time";

export const SETUP_TOKEN_HOURS = 72;

/** Extra rows other modules seed for every new tenant (e.g. default follow-up rules). */
export const tenantSeeders: ((db: D1Database, tenantId: string) => D1PreparedStatement[])[] = [];

function slugify(name: string): string {
  const s = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return s || "shop";
}

async function uniqueSlug(db: D1Database, name: string): Promise<string> {
  const base = slugify(name);
  for (let i = 1; i < 1000; i++) {
    const slug = i === 1 ? base : `${base}-${i}`;
    const hit = await db.prepare("SELECT 1 FROM tenants WHERE slug=?").bind(slug).first();
    if (!hit) return slug;
  }
  return `${base}-${randomToken(4).toLowerCase()}`;
}

export async function presetSwitches(db: D1Database, label?: string | null): Promise<{ features: Feature[]; channels: Channel[] }> {
  if (label) {
    const p = await db.prepare("SELECT features, channels FROM plan_presets WHERE label=?").bind(label).first<{ features: string; channels: string }>();
    if (p) return { features: JSON.parse(p.features), channels: JSON.parse(p.channels) };
  }
  return { features: [...FEATURES], channels: [...CHANNELS] };
}

export async function issueSetupToken(env: Env, userId: string): Promise<string> {
  const token = randomToken(32);
  await env.DB.prepare("INSERT INTO setup_tokens (token_hash,user_id,expires_at) VALUES (?,?,?)")
    .bind(await sha256Hex(token), userId, addHours(nowIso(), SETUP_TOKEN_HOURS)).run();
  return `${env.APP_URL.replace(/\/$/, "")}/setup/${token}`;
}

export async function provisionTenant(env: Env, input: { business_name: string; owner_name: string; email: string; phone?: string; plan_label?: string | null }) {
  const db = env.DB;
  const email = input.email.toLowerCase().trim();
  if (await db.prepare("SELECT 1 FROM users WHERE email=?").bind(email).first()) {
    throw new ApiError(400, "VALIDATION", { issues: [{ path: ["email"], message: "Email already in use" }] });
  }
  const tenantId = newId();
  const userId = newId();
  const now = nowIso();
  const slug = await uniqueSlug(db, input.business_name);
  const sw = await presetSwitches(db, input.plan_label);
  const stmts: D1PreparedStatement[] = [
    db.prepare("INSERT INTO tenants (id,business_name,slug,status,plan_label,engine,created_at) VALUES (?,?,?,?,?,?,?)")
      .bind(tenantId, input.business_name, slug, "active", input.plan_label ?? null, "demo", now),
    db.prepare("INSERT INTO tenant_counters (tenant_id) VALUES (?)").bind(tenantId),
    db.prepare("INSERT INTO agent_config (tenant_id, updated_at) VALUES (?,?)").bind(tenantId, now),
    db.prepare("INSERT INTO users (id,email,role,tenant_id,name,phone,created_at) VALUES (?,?,?,?,?,?,?)")
      .bind(userId, email, "client_owner", tenantId, input.owner_name, input.phone ?? null, now),
    ...FEATURES.map((f) => db.prepare("INSERT INTO tenant_features (tenant_id,feature,enabled) VALUES (?,?,?)").bind(tenantId, f, sw.features.includes(f) ? 1 : 0)),
    ...CHANNELS.map((ch) => db.prepare("INSERT INTO tenant_channels (tenant_id,channel,enabled) VALUES (?,?,?)").bind(tenantId, ch, sw.channels.includes(ch) ? 1 : 0)),
    ...tenantSeeders.flatMap((s) => s(db, tenantId)),
  ];
  await db.batch(stmts);
  return { tenantId, userId, setupUrl: await issueSetupToken(env, userId) };
}
