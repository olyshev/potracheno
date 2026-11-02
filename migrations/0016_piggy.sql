-- Кубышка: сбережения (вклады, накопительные счета) и инвестиции (бумаги по тикеру или вручную)
CREATE TABLE IF NOT EXISTS holdings (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,              -- 'saving' | 'invest'
  name TEXT NOT NULL,
  currency TEXT NOT NULL,
  invested REAL NOT NULL DEFAULT 0, -- всего вложено (в валюте позиции)
  principal REAL,                   -- сбережения: сумма, с которой идут проценты
  rate REAL,                        -- сбережения: % годовых
  accr_from TEXT,                   -- сбережения: с какой даты считаем проценты
  ends TEXT,                        -- сбережения: до какой даты (вклад)
  ticker TEXT,                      -- инвестиции: тикер для автоцены (KO, VWCE.DE, MOEX:SBER)
  qty REAL,                         -- инвестиции: количество бумаг
  value REAL,                       -- инвестиции вручную: текущая стоимость
  value_at TEXT,
  opened TEXT NOT NULL,             -- дата первого вложения
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_holdings_user ON holdings (user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_ticker ON holdings (ticker);

-- цены бумаг: одна строка на тикер для всех пользователей, обновляется раз в сутки
CREATE TABLE IF NOT EXISTS prices (
  ticker TEXT PRIMARY KEY,
  price REAL,
  currency TEXT,
  source TEXT,
  at TEXT,                          -- когда цена получена
  tried TEXT                        -- последняя попытка
);
