-- История стоимости инвестиционных позиций: снимок на каждый день, когда цена/стоимость обновлялась
CREATE TABLE IF NOT EXISTS holding_values (
  holding_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  value REAL NOT NULL,
  PRIMARY KEY (holding_id, date)
);
CREATE INDEX IF NOT EXISTS idx_hv_user ON holding_values (user_id);
-- старт графика: стоимость в день первой покупки = вложенная сумма
INSERT OR IGNORE INTO holding_values (holding_id, user_id, date, value)
  SELECT id, user_id, opened, invested FROM holdings WHERE kind = 'invest' AND invested > 0;
