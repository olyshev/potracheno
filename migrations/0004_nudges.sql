-- Напоминания о неактивности
ALTER TABLE users ADD COLUMN nudge_stage INTEGER NOT NULL DEFAULT 0;  -- сколько дней тишины уже «отмечено» сообщением (0, 2, 3, 5, 7)
ALTER TABLE users ADD COLUMN nudges INTEGER NOT NULL DEFAULT 1;       -- присылать ли напоминания
