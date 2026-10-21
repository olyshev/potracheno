-- Периодичность регулярных платежей: раз в месяц (как раньше), каждую неделю, каждые 2 недели
ALTER TABLE recurring ADD COLUMN period TEXT NOT NULL DEFAULT 'month';  -- month | week | 2weeks
ALTER TABLE recurring ADD COLUMN last_date TEXT;                        -- для недельных: дата последней созданной записи
