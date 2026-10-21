-- Защита от повторной обработки одного и того же сообщения боту (Telegram повторяет запрос, если ответ задержался)
CREATE TABLE processed_updates (
  update_id INTEGER PRIMARY KEY,
  at TEXT DEFAULT (datetime('now'))
);
