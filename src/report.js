// Сводка за месяц (для экрана и для бота) и ежемесячная рассылка итогов.
import { catLabel, customMap } from './categories.js';
import { getRates, fromEur } from './rates.js';
import { tg, openAppKeyboard } from './telegram.js';
import { localToday, localHour } from './recurring.js';

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}
export const daysInMonth = (month) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

async function totalsByCategory(env, userId, month) {
  const { results } = await env.DB.prepare(
    `SELECT kind, category, SUM(amount_eur) AS eur, COUNT(*) AS n FROM entries
     WHERE user_id = ? AND date >= ? AND date <= ? GROUP BY kind, category`
  ).bind(userId, `${month}-01`, `${month}-31`).all();
  return results;
}

export async function monthSummary(env, userId, month, base) {
  const rates = await getRates(env);
  const conv = (eur) => Math.round(fromEur(eur, base, rates) * 100) / 100;
  const prevMonth = shiftMonth(month, -1);
  const [cur, prev, daily, custom] = await Promise.all([
    totalsByCategory(env, userId, month),
    totalsByCategory(env, userId, prevMonth),
    env.DB.prepare(
      `SELECT date, SUM(amount_eur) AS eur FROM entries WHERE user_id = ? AND kind = 'expense' AND date >= ? AND date <= ? GROUP BY date`
    ).bind(userId, `${month}-01`, `${month}-31`).all(),
    env.DB.prepare('SELECT id, kind, name, emoji FROM custom_categories WHERE user_id = ?').bind(userId).all(),
  ]);
  const prevMap = Object.fromEntries(prev.map((r) => [`${r.kind}:${r.category}`, conv(r.eur)]));
  const rows = cur.map((r) => ({ kind: r.kind, category: r.category, amount: conv(r.eur), count: r.n, prev: prevMap[`${r.kind}:${r.category}`] || 0 }))
    .sort((a, b) => b.amount - a.amount);
  const categories = rows.filter((r) => r.kind !== 'income');
  const incomeCategories = rows.filter((r) => r.kind === 'income');
  const sum = (list) => list.reduce((s, c) => s + c.amount, 0);
  const total = sum(categories);
  const income = sum(incomeCategories);
  const prevTotal = prev.filter((r) => r.kind !== 'income').reduce((s, r) => s + conv(r.eur), 0);
  const prevIncome = prev.filter((r) => r.kind === 'income').reduce((s, r) => s + conv(r.eur), 0);
  const r2 = (n) => Math.round(n * 100) / 100;
  const days = Array.from({ length: daysInMonth(month) }, () => 0);
  for (const r of daily.results) days[Number(r.date.slice(8, 10)) - 1] = conv(r.eur);
  return {
    custom: customMap(custom.results),
    month, base,
    total: r2(total),            // расходы
    income: r2(income),          // доходы
    balance: r2(income - total), // остаток месяца
    prevTotal: r2(prevTotal),
    prevIncome: r2(prevIncome),
    count: rows.reduce((s, c) => s + c.count, 0),
    categories, incomeCategories, days,
  };
}

export function money(n, cur, lang) {
  try {
    return new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-GB', {
      style: 'currency', currency: cur, maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${cur}`;
  }
}

const MONTHS = {
  ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  ruGen: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  ruDat: ['январю', 'февралю', 'марту', 'апрелю', 'маю', 'июню', 'июлю', 'августу', 'сентябрю', 'октябрю', 'ноябрю', 'декабрю'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const mIdx = (month) => Number(month.slice(5, 7)) - 1;

export function reportText(s, lang) {
  const ru = lang === 'ru';
  const i = mIdx(s.month);
  const m = (n) => money(n, s.base, lang);
  const esc = (t) => String(t).replace(/[<&>]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  const lines = [];
  lines.push(ru ? `📊 <b>Итоги: ${MONTHS.ru[i]} ${s.month.slice(0, 4)}</b>` : `📊 <b>${MONTHS.en[i]} ${s.month.slice(0, 4)} wrap-up</b>`);
  lines.push('');
  let delta = '';
  if (s.prevTotal > 0) {
    const pct = Math.round(((s.total - s.prevTotal) / s.prevTotal) * 100);
    const p = (i + 11) % 12;
    delta = pct === 0 ? (ru ? ` — как в прошлом месяце` : ` — same as last month`)
      : ` (${pct > 0 ? '▲' : '▼'} ${Math.abs(pct)}% ${ru ? `к ${MONTHS.ruDat[p]}` : `vs ${MONTHS.en[p]}`})`;
  }
  if (s.income > 0) {
    lines.push(`💰 ${ru ? 'Доходы' : 'Income'}: <b>${m(s.income)}</b>`);
    lines.push(`💸 ${ru ? 'Расходы' : 'Expenses'}: <b>${m(s.total)}</b>${delta}`);
    lines.push(s.balance >= 0
      ? `✅ ${ru ? 'Осталось' : 'Left over'}: <b>${m(s.balance)}</b> · ${Math.round((s.balance / s.income) * 100)}% ${ru ? 'дохода' : 'of income'}`
      : `⚠️ ${ru ? 'Перерасход' : 'Overspent'}: <b>${m(-s.balance)}</b>`);
  } else {
    lines.push(`${ru ? 'Потрачено' : 'Spent'}: <b>${m(s.total)}</b>${delta}`);
  }
  lines.push(ru ? `В среднем ${m(s.total / s.days.length)} в день` : `${m(s.total / s.days.length)} per day on average`);
  lines.push('');
  const top = s.categories.slice(0, 6);
  for (const c of top) {
    const share = s.total ? Math.round((c.amount / s.total) * 100) : 0;
    lines.push(`${esc(catLabel(c.category, lang, s.custom))} — ${m(c.amount)} · ${share}%`);
  }
  const rest = s.categories.slice(6).reduce((a, c) => a + c.amount, 0);
  if (rest > 0) lines.push(`${ru ? '… остальное' : '… the rest'} — ${m(rest)}`);

  if (s.prevTotal > 0) {
    const changes = s.categories.map((c) => ({ ...c, diff: c.amount - c.prev })).filter((c) => c.prev > 0 || c.amount > 0);
    const up = changes.filter((c) => c.diff > 0).sort((a, b) => b.diff - a.diff)[0];
    const down = changes.filter((c) => c.diff < 0).sort((a, b) => a.diff - b.diff)[0];
    if (up || down) lines.push('');
    if (up && up.diff >= s.total * 0.03) lines.push(`${ru ? '📈 Выросло больше всего' : '📈 Grew the most'}: ${esc(catLabel(up.category, lang, s.custom))} +${m(up.diff)}`);
    if (down && -down.diff >= s.total * 0.03) lines.push(`${ru ? '📉 Сэкономили' : '📉 Saved'}: ${esc(catLabel(down.category, lang, s.custom))} −${m(-down.diff)}`);
  }
  const busiest = s.days.reduce((best, v, d) => (v > best.v ? { v, d } : best), { v: 0, d: 0 });
  if (busiest.v > 0) {
    lines.push(ru ? `🗓 Самый дорогой день: ${busiest.d + 1} ${MONTHS.ruGen[i]} — ${m(busiest.v)}` : `🗓 Priciest day: ${MONTHS.en[i]} ${busiest.d + 1} — ${m(busiest.v)}`);
  }
  return lines.join('\n');
}

// Рассылка итогов прошлого месяца — 1–3 числа с 10:00 по местному времени пользователя.
// Расписание запускает её каждые 10 минут в последние и первые дни месяца по UTC; за раз — не больше REPORT_BATCH
// сообщений (лимит внешних запросов бесплатного тарифа Cloudflare — 50).
// Пора ли отправлять отчёт за month: с 10:00 1-го до конца 3-го числа по местному времени, за прошедший местный месяц
export function reportDue(tz, month) {
  const local = localToday(tz);
  if (Number(local.slice(8, 10)) > 3 || (local.endsWith('-01') && localHour(tz) < 10)) return false;
  return shiftMonth(local.slice(0, 7), -1) === month;
}

export async function runMonthlyReports(env) {
  const batch = Number(env.REPORT_BATCH || 40);
  const utcDay = new Date().getUTCDate(), utcMonth = new Date().toISOString().slice(0, 7);
  // в последний день месяца по UTC у восточных поясов уже наступило 1-е — им отчёт за текущий UTC-месяц, иначе за прошлый
  const target = utcDay >= 28 ? utcMonth : shiftMonth(utcMonth, -1);
  const appUrl = (await env.DB.prepare(`SELECT value FROM settings WHERE key = 'app_url'`).first())?.value;
  const { results: cands } = await env.DB.prepare(
    `SELECT u.id, u.lang, u.base_currency, u.tz FROM users u
     WHERE u.can_message = 1
       AND NOT EXISTS (SELECT 1 FROM reports_sent r WHERE r.user_id = u.id AND r.month = ?1)
       AND EXISTS (SELECT 1 FROM entries e WHERE e.user_id = u.id AND e.date >= ?1 || '-01' AND e.date <= ?1 || '-31')
     LIMIT 3000`
  ).bind(target).all();
  const users = [];
  for (const u of cands) {
    if (!reportDue(u.tz, target)) continue;
    users.push({ ...u, month: target });
    if (users.length >= batch) break;
  }

  let sent = 0;
  for (const u of users) {
    const s = await monthSummary(env, u.id, u.month, u.base_currency || 'EUR');
    const payload = { chat_id: u.id, text: reportText(s, u.lang), parse_mode: 'HTML' };
    // русским пользователям — кнопка сразу на персональную историю месяца (если трат достаточно)
    const expenseCount = s.categories.reduce((a, c) => a + c.count, 0);
    if (appUrl) payload.reply_markup = u.lang === 'ru' && expenseCount >= 5
      ? openAppKeyboard(`${appUrl}/?story=month`, '📊 Посмотреть историю месяца')
      : openAppKeyboard(appUrl, u.lang === 'ru' ? 'Открыть подробно' : 'Open details');
    const r = await tg(env, 'sendMessage', payload);
    let status = r.ok ? 'sent' : 'failed';
    if (!r.ok && r.error_code === 403) {
      status = 'blocked';
      await env.DB.prepare('UPDATE users SET can_message = 0 WHERE id = ?').bind(u.id).run();
    }
    if (!r.ok && r.error_code === 429) break; // упёрлись в лимит Telegram — продолжим через 10 минут
    await env.DB.prepare('INSERT OR REPLACE INTO reports_sent (user_id, month, status) VALUES (?, ?, ?)').bind(u.id, u.month, status).run();
    if (r.ok) sent++;
  }
  return { candidates: cands.length, processed: users.length, sent };
}
