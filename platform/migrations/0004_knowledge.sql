-- AI training material: website / Facebook page links, PDFs and pasted text. Text is extracted once and
-- pushed to the chat engine with the rest of the agent config.
CREATE TABLE knowledge_sources (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('website','facebook','pdf','text')),
  title TEXT NOT NULL,
  url TEXT,
  r2_key TEXT,
  content TEXT NOT NULL DEFAULT '',
  chars INTEGER NOT NULL DEFAULT 0,
  pages INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  added_by TEXT NOT NULL CHECK (added_by IN ('client','agency')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_knowledge_tenant ON knowledge_sources(tenant_id, created_at);
