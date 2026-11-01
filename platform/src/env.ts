export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  BOOTSTRAP_TOKEN: string;
  /** Public base URL for setup links; when unset, the address the request came in on is used. */
  APP_URL?: string;
  TEST?: string;
}

export type Feature = "inbox" | "ai_agent" | "orders" | "followups";
export type Channel = "messenger" | "instagram" | "whatsapp" | "website";
export const FEATURES: Feature[] = ["inbox", "ai_agent", "orders", "followups"];
export const CHANNELS: Channel[] = ["messenger", "instagram", "whatsapp", "website"];

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "agency_admin" | "client_owner";
  tenantId: string | null;
}

export interface TenantRow {
  id: string;
  business_name: string;
  slug: string;
  status: "active" | "suspended" | "deleted";
  suspended_reason: string | null;
  plan_label: string | null;
  engine: string;
  engine_workspace_ref: string | null;
  notify_on_confirmed: number;
  notify_on_shipped: number;
  deleted_at: string | null;
  created_at: string;
}

export interface TenantContext extends TenantRow {
  features: Feature[];
  channels: Channel[];
}

export type Vars = { user: SessionUser; tenant: TenantContext; sessionId: string };
export type AppEnv = { Bindings: Env; Variables: Vars };
