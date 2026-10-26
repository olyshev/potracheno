-- Свои категории пользователя (id вида u_xxxxxxxx)
CREATE TABLE IF NOT EXISTS custom_categories (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL DEFAULT 'expense',
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_custom_categories_user ON custom_categories(user_id);
