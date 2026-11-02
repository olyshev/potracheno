// Разовое объявление о наградах в чат. Уходит всем, кто разрешил писать и был в базе до запуска,
// днём по местному времени; за один запуск — не больше батча (лимит внешних запросов на бесплатном тарифе).
import { tg, openAppKeyboard } from './telegram.js';
import { localHour } from './recurring.js';

const TEXT = {
  ru: (name) => `Привет${name ? `, ${name}` : ''}! В приложении появились награды. Посмотрите, какие и за что! 👀`,
  en: (name) => `Hi${name ? `, ${name}` : ''}! Awards have arrived in the app. Take a look at what they are and what they're for! 👀`,
};

export async function runAwardsAnnouncement(env, { anyHour = false } = {}) {
  if (env.AWARDS_ENABLED !== '1') return { skipped: 'awards_off' };
  const batch = Number(env.NUDGE_BATCH || 40);
  const appUrl = (await env.DB.prepare(`SELECT value FROM settings WHERE key = 'app_url'`).first())?.value;
  const { results } = await env.DB.prepare(
    `SELECT id, first_name, lang, tz FROM users WHERE can_message = 1 AND awards_announced = 0 LIMIT 300`
  ).all();
  let sent = 0;
  for (const u of results) {
    if (sent >= batch) break;
    if (!anyHour) { const h = localHour(u.tz); if (h < 11 || h >= 21) continue; }
    const lang = u.lang === 'ru' ? 'ru' : 'en';
    const payload = { chat_id: u.id, text: TEXT[lang]((u.first_name || '').trim()) };
    if (appUrl) payload.reply_markup = openAppKeyboard(appUrl, lang === 'ru' ? 'Открыть' : 'Open');
    const r = await tg(env, 'sendMessage', payload);
    if (!r.ok && r.error_code === 429) break;
    if (!r.ok && r.error_code === 403) {
      await env.DB.prepare('UPDATE users SET can_message = 0, awards_announced = 1 WHERE id = ?').bind(u.id).run();
      continue;
    }
    if (!r.ok) continue; // сетевой сбой — в следующий раз
    await env.DB.prepare('UPDATE users SET awards_announced = 1 WHERE id = ?').bind(u.id).run();
    sent++;
  }
  return { candidates: results.length, sent };
}
