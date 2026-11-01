-- Storage for the DemoEngine (stand-in chat engine used for demos and tests).
CREATE TABLE demo_workspaces (
  ref TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  paused INTEGER NOT NULL DEFAULT 0,
  ai_enabled INTEGER NOT NULL DEFAULT 1,
  channels TEXT NOT NULL DEFAULT '{"messenger":true,"instagram":true,"whatsapp":true,"website":true}',
  config TEXT NOT NULL DEFAULT '{}',
  config_pushes INTEGER NOT NULL DEFAULT 0,
  fail_mode TEXT NOT NULL DEFAULT 'none',
  ai_replies INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE demo_conversations (
  id TEXT PRIMARY KEY,
  workspace_ref TEXT NOT NULL,
  channel TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_ref TEXT NOT NULL,
  handler TEXT NOT NULL DEFAULT 'ai',
  unread INTEGER NOT NULL DEFAULT 0,
  last_at TEXT NOT NULL
);
CREATE INDEX idx_demo_conv_ws ON demo_conversations(workspace_ref, last_at);
CREATE TABLE demo_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  direction TEXT NOT NULL,
  kind TEXT NOT NULL,
  text TEXT,
  url TEXT,
  payload TEXT,
  by_who TEXT NOT NULL,
  at TEXT NOT NULL
);
CREATE INDEX idx_demo_msg_conv ON demo_messages(conversation_id, at);
