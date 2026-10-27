-- Лимиты трат по категориям на месяц. Сумма — в валюте, в которой задали, плюс эквивалент в евро
-- (чтобы пересчитать, если пользователь сменит основную валюту).
CREATE TABLE IF NOT EXISTS category_limits (
  user_id INTEGER NOT NULL,
  category_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  amount_eur REAL NOT NULL,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, category_id)
);
