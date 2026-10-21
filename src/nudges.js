// Напоминания, если человек не открывал приложение и не писал боту несколько дней.
// Каждое сообщение уходит один раз за период тишины; любая активность сбрасывает отсчёт.
import { tg, openAppKeyboard } from './telegram.js';

export const NUDGES = [
  { days: 2, ru: '🤔 Неужели вы ничего не тратили целых два дня?', en: '🤔 Have you really not spent anything for two whole days?' },
  { days: 3, ru: '🥇Медаль за три дня без операций по карте!', en: '🥇 A medal for three days without a single card payment!' },
  { days: 5, ru: '🤨 Мы не верим, что вы ничего не тратили пять дней.', en: "🤨 We don't believe you haven't spent anything in five days." },
  { days: 7, ru: '☝️Постоянство — это ключ. Не забывайте следить за деньгами, чтобы перестать их терять.', en: '☝️ Consistency is key. Keep an eye on your money so you stop losing it.' },
];

// Отправляем днём: 9:00–18:00 UTC — это 11–20 по Мадриду и 12–21 по Москве
const SEND_HOURS = [9, 18];

export async function runNudges(env, { anyHour = false } = {}) {
  const hour = new Date().getUTCHours();
  if (!anyHour && (hour < SEND_HOURS[0] || hour >= SEND_HOURS[1])) return { skipped: 'night' };
  const batch = Number(env.NUDGE_BATCH || 40); // внешних запросов за запуск на бесплатном тарифе — не больше 50
  const appUrl = (await env.DB.prepare(`SELECT value FROM settings WHERE key = 'app_url'`).first())?.value;
  // Кандидаты: можно писать, напоминания включены, есть хоть одна запись, тишина ≥ 2 дней и следующий этап ещё не отправлен
  const { results } = await env.DB.prepare(
    `SELECT u.id, u.lang, u.nudge_stage, julianday('now') - julianday(u.last_seen) AS idle
     FROM users u
     WHERE u.can_message = 1 AND u.nudges = 1 AND u.last_seen IS NOT NULL
       AND julianday('now') - julianday(u.last_seen) >= 2 AND u.nudge_stage < 7
       AND EXISTS (SELECT 1 FROM entries e WHERE e.user_id = u.id AND e.source != 'recurring')
     ORDER BY u.last_seen LIMIT ?`
  ).bind(batch).all();

  let sent = 0;
  for (const u of results) {
    // Берём самый поздний наступивший этап: если человек пропал на 4 дня к запуску функции, придёт только «3 дня»
    const due = [...NUDGES].reverse().find((n) => u.idle >= n.days);
    if (!due || due.days <= u.nudge_stage) continue;
    const payload = { chat_id: u.id, text: u.lang === 'ru' ? due.ru : due.en };
    if (appUrl) payload.reply_markup = openAppKeyboard(appUrl, u.lang === 'ru' ? 'Открыть' : 'Open');
    const r = await tg(env, 'sendMessage', payload);
    if (!r.ok && r.error_code === 429) break; // упёрлись в лимит Telegram — продолжим через час
    if (!r.ok && r.error_code === 403) {
      await env.DB.prepare('UPDATE users SET can_message = 0 WHERE id = ?').bind(u.id).run();
      continue;
    }
    if (!r.ok) continue; // сетевой сбой — попробуем в следующий час
    await env.DB.prepare('UPDATE users SET nudge_stage = ? WHERE id = ?').bind(due.days, u.id).run();
    sent++;
  }
  return { candidates: results.length, sent };
}
