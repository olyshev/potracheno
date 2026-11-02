-- разовая рассылка «в приложении появились награды»: получат только те, кто уже был в базе на момент запуска
ALTER TABLE users ADD COLUMN awards_announced INTEGER NOT NULL DEFAULT 1;
UPDATE users SET awards_announced = 0 WHERE can_message = 1;
