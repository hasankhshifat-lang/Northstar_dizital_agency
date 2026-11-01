-- Northstar platform schema (spec §3). Money = integer poisha. Times = UTC ISO strings.

CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
  suspended_reason TEXT,
  plan_label TEXT,
  engine TEXT NOT NULL DEFAULT 'demo',
  engine_workspace_ref TEXT,
  notify_on_confirmed INTEGER NOT NULL DEFAULT 1,
  notify_on_shipped INTEGER NOT NULL DEFAULT 1,
  deleted_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('agency_admin','client_owner')),
  tenant_id TEXT REFERENCES tenants(id),
  name TEXT NOT NULL,
  phone TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_users_tenant ON users(tenant_id);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE setup_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE TABLE login_attempts (
  key TEXT NOT NULL,
  at TEXT NOT NULL
);
CREATE INDEX idx_login_attempts ON login_attempts(key, at);

CREATE TABLE tenant_features (
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  feature TEXT NOT NULL CHECK (feature IN ('inbox','ai_agent','orders','followups')),
  enabled INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, feature)
);

CREATE TABLE tenant_channels (
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  channel TEXT NOT NULL CHECK (channel IN ('messenger','instagram','whatsapp','website')),
  enabled INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, channel)
);

CREATE TABLE tenant_counters (
  tenant_id TEXT PRIMARY KEY REFERENCES tenants(id),
  next_order_number INTEGER NOT NULL DEFAULT 1001
);

CREATE TABLE plan_presets (
  label TEXT PRIMARY KEY,
  features TEXT NOT NULL,
  channels TEXT NOT NULL
);

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  tenant_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_audit_tenant ON audit_log(tenant_id, created_at);

CREATE TABLE engine_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  command TEXT NOT NULL,
  payload TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','failed')),
  last_error TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_engine_jobs_due ON engine_jobs(status, next_attempt_at);
CREATE INDEX idx_engine_jobs_tenant ON engine_jobs(tenant_id);

CREATE TABLE agent_config (
  tenant_id TEXT PRIMARY KEY REFERENCES tenants(id),
  profile TEXT NOT NULL DEFAULT '{}',
  tone TEXT NOT NULL DEFAULT '{}',
  rules TEXT NOT NULL DEFAULT '{}',
  push_due_at TEXT,
  updated_at TEXT
);

CREATE TABLE faqs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_faqs_tenant ON faqs(tenant_id);

CREATE TABLE unanswered_questions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  normalized_text TEXT NOT NULL,
  sample_text TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  last_asked_at TEXT NOT NULL,
  resolved_faq_id TEXT,
  UNIQUE (tenant_id, normalized_text)
);

CREATE TABLE conversation_state (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  engine_conversation_id TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('open','later','done')),
  snooze_until TEXT,
  UNIQUE (tenant_id, engine_conversation_id)
);

CREATE TABLE quick_replies (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL
);
CREATE INDEX idx_quick_replies_tenant ON quick_replies(tenant_id);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name_bn TEXT,
  name_en TEXT,
  description TEXT,
  category TEXT,
  price INTEGER NOT NULL,
  sale_price INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden')),
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, code)
);

CREATE TABLE product_variants (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id),
  label TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_tenant ON product_variants(tenant_id);

CREATE TABLE product_images (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id),
  r2_key TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_images_product ON product_images(product_id);

CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phones TEXT NOT NULL DEFAULT '[]',
  addresses TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  engine_contact_refs TEXT NOT NULL DEFAULT '[]',
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  last_order_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_customers_tenant ON customers(tenant_id);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  number INTEGER NOT NULL,
  customer_id TEXT REFERENCES customers(id),
  source TEXT NOT NULL CHECK (source IN ('ai','inbox','manual')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','confirmed','packed','shipped','delivered','cancelled','returned')),
  subtotal INTEGER NOT NULL,
  delivery_charge INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  address TEXT,
  courier TEXT,
  tracking_number TEXT,
  notes TEXT,
  return_condition TEXT CHECK (return_condition IN ('good','in_transit','damaged','unknown')),
  conversation_id TEXT,
  channel TEXT,
  created_at TEXT NOT NULL,
  confirmed_at TEXT,
  packed_at TEXT,
  shipped_at TEXT,
  delivered_at TEXT,
  cancelled_at TEXT,
  returned_at TEXT,
  UNIQUE (tenant_id, number)
);
CREATE INDEX idx_orders_tenant ON orders(tenant_id, created_at);
CREATE INDEX idx_orders_customer ON orders(customer_id);

CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_id TEXT NOT NULL REFERENCES orders(id),
  product_id TEXT,
  variant_id TEXT,
  name_snapshot TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0)
);
CREATE INDEX idx_items_order ON order_items(order_id);

CREATE TABLE followup_rules (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('price_no_order','order_unconfirmed','delivered_thanks','win_back')),
  enabled INTEGER NOT NULL DEFAULT 0,
  delay_minutes INTEGER NOT NULL,
  message_template TEXT NOT NULL,
  offer_text TEXT,
  whatsapp_template_name TEXT,
  UNIQUE (tenant_id, type)
);

CREATE TABLE broadcasts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  audience TEXT NOT NULL,
  message TEXT NOT NULL,
  product_id TEXT,
  scheduled_for TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','sending','sent')),
  created_at TEXT NOT NULL
);
CREATE INDEX idx_broadcasts_tenant ON broadcasts(tenant_id);

CREATE TABLE followup_sends (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  rule_id TEXT,
  broadcast_id TEXT,
  dedup_key TEXT,
  customer_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  conversation_id TEXT,
  message TEXT,
  product_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','sent','skipped','cancelled','failed')),
  skip_reason TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  scheduled_for TEXT NOT NULL,
  sent_at TEXT,
  UNIQUE (tenant_id, dedup_key)
);
CREATE INDEX idx_sends_due ON followup_sends(status, scheduled_for);
CREATE INDEX idx_sends_customer ON followup_sends(tenant_id, customer_id);

CREATE TABLE customer_last_inbound (
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  conversation_id TEXT,
  last_inbound_at TEXT NOT NULL,
  PRIMARY KEY (tenant_id, customer_id, channel)
);

CREATE TABLE usage_monthly (
  tenant_id TEXT NOT NULL,
  month TEXT NOT NULL,
  ai_replies INTEGER NOT NULL DEFAULT 0,
  conversations INTEGER NOT NULL DEFAULT 0,
  outbound_messages INTEGER NOT NULL DEFAULT 0,
  orders INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, month)
);
