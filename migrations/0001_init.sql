CREATE TABLE users (
  id INTEGER PRIMARY KEY,           -- Telegram user id (он же chat id личного чата с ботом)
  first_name TEXT,
  username TEXT,
  lang TEXT DEFAULT 'ru',
  base_currency TEXT DEFAULT 'EUR',
  can_message INTEGER DEFAULT 0,    -- разрешил ли боту писать (для отчётов)
  created_at TEXT DEFAULT (datetime('now')),
  last_seen TEXT
);

CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,               -- YYYY-MM-DD, дата траты
  amount REAL NOT NULL,             -- в исходной валюте
  currency TEXT NOT NULL,
  amount_eur REAL NOT NULL,         -- по курсу на момент записи
  category TEXT NOT NULL,
  note TEXT,
  merchant TEXT,
  receipt_id TEXT,
  source TEXT DEFAULT 'manual',     -- manual | receipt
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_entries_user_date ON entries(user_id, date);

CREATE TABLE usage (
  user_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  scans INTEGER DEFAULT 0,
  suggests INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

CREATE TABLE rates (
  day TEXT PRIMARY KEY,
  json TEXT NOT NULL
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE reports_sent (
  user_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  status TEXT,
  PRIMARY KEY (user_id, month)
);
