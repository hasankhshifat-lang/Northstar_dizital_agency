-- D1 database: northstar-whatsapp-inbox (id 59bce3ce-ccd8-4a08-9145-82946f72e188)
CREATE TABLE IF NOT EXISTS inbox (
  message_id TEXT PRIMARY KEY,
  from_number TEXT NOT NULL,
  to_phone_number_id TEXT,
  to_display_number TEXT,
  contact_name TEXT,
  type TEXT,
  text TEXT,
  button_payload TEXT,
  wa_timestamp INTEGER,
  received_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inbox_from ON inbox(from_number, wa_timestamp);

-- One row per prospect. status: new | contacted | followup_1 | followup_2 | replied | opted_out
CREATE TABLE IF NOT EXISTS contacts (
  phone TEXT PRIMARY KEY,
  name TEXT,
  sender_phone_number_id TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  opted_out INTEGER NOT NULL DEFAULT 0,
  last_outbound_at TEXT,
  last_outbound_template TEXT,
  followups_sent INTEGER NOT NULL DEFAULT 0,
  last_inbound_at TEXT,
  last_inbound_text TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS outbound_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  sender_phone_number_id TEXT,
  template_name TEXT,
  message_type TEXT,
  wa_message_id TEXT,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);
