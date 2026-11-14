-- История вложений в кубышке: открытие, пополнения, снятия (сумма со знаком, в валюте позиции)
CREATE TABLE IF NOT EXISTS holding_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  holding_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,              -- 'open' | 'topup' | 'withdraw'
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  qty REAL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_hev_holding ON holding_events (holding_id, date);
-- для уже существующих позиций истории нет: одна запись «открытие» на всю вложенную сумму
INSERT INTO holding_events (holding_id, user_id, kind, date, amount, qty)
  SELECT id, user_id, 'open', opened, invested, qty FROM holdings;
