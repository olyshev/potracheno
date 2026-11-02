-- перенос остатка прошлых месяцев на главный экран (по умолчанию включён)
ALTER TABLE users ADD COLUMN carry_over INTEGER NOT NULL DEFAULT 1;
