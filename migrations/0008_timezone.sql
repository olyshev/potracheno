-- Часовой пояс пользователя (берётся с устройства при открытии приложения)
ALTER TABLE users ADD COLUMN tz TEXT;
