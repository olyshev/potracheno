-- Какие истории пользователь уже посмотрел
CREATE TABLE story_views (
  user_id INTEGER NOT NULL,
  story_id TEXT NOT NULL,
  at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, story_id)
);
