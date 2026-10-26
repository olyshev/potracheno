-- Настройки категорий пользователя: переименование стандартных и скрытие (удаление) любых
CREATE TABLE IF NOT EXISTS category_prefs (
  user_id INTEGER NOT NULL,
  category_id TEXT NOT NULL,
  name TEXT,
  emoji TEXT,
  hidden INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, category_id)
);
