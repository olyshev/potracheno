-- Картинки для публикации в историях (хранятся неделю), бонусные сканы и реферальная метка
CREATE TABLE share_images (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  data TEXT NOT NULL,              -- JPEG в base64
  created_at TEXT DEFAULT (datetime('now'))
);
ALTER TABLE usage ADD COLUMN bonus INTEGER NOT NULL DEFAULT 0;   -- дополнительные сканы в этом месяце
ALTER TABLE usage ADD COLUMN shared INTEGER NOT NULL DEFAULT 0;  -- бонус за шеринг в этом месяце уже получен
ALTER TABLE users ADD COLUMN referred_by INTEGER;                -- по чьей ссылке пришёл
