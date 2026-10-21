-- Доходы и регулярные платежи
ALTER TABLE entries ADD COLUMN kind TEXT NOT NULL DEFAULT 'expense';   -- expense | income
ALTER TABLE entries ADD COLUMN recurring_id TEXT;                      -- из какого регулярного правила создана запись

CREATE TABLE recurring (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,               -- expense | income
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  note TEXT,
  day INTEGER NOT NULL,             -- число месяца 1–31; если в месяце меньше дней — последний день
  last_month TEXT,                  -- YYYY-MM, за который запись уже создана
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_recurring_user ON recurring(user_id);
CREATE INDEX idx_recurring_due ON recurring(active, last_month);
-- защита от дублей: одно правило — одна запись на дату
CREATE UNIQUE INDEX idx_entries_recurring_date ON entries(recurring_id, date) WHERE recurring_id IS NOT NULL;
