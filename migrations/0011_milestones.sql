-- Юбилеи (месяц, 100/200/300 дней, год), за репост которых уже начислен бонус
CREATE TABLE IF NOT EXISTS milestone_shares (
  user_id INTEGER NOT NULL,
  milestone INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, milestone)
);
