-- начисление процентов по вкладу: m — ежемесячно (капитализация), d — ежедневно, y — ежегодно
ALTER TABLE holdings ADD COLUMN compound TEXT NOT NULL DEFAULT 'm';
