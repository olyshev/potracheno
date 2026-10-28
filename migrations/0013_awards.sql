-- Награды за суммарные траты по категориям: одна награда на категорию, получена навсегда
CREATE TABLE IF NOT EXISTS awards (
  user_id INTEGER NOT NULL,
  award_id TEXT NOT NULL,
  earned_at TEXT DEFAULT (datetime('now')),
  seen INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, award_id)
);
