// Регулярные доходы и расходы. Периодичность:
//  — month: «сумма N каждое D-е число» (31-е в коротком месяце — последний день);
//  — week / 2weeks: каждые 7 / 14 дней от даты последней записи (тот же день недели).
// В нужный день правило само создаёт запись. Делается это двумя путями:
//  — раз в час по расписанию для всех пользователей;
//  — при открытии приложения для конкретного пользователя (на случай, если расписание ещё не сработало).
// От дублей защищает уникальный индекс (recurring_id, date) и INSERT OR IGNORE.
import { getRates, toEur, fromEur, round2 } from './rates.js';

export const today = () => new Date().toISOString().slice(0, 10);
export const thisMonth = () => today().slice(0, 7);
export const PERIODS = ['week', '2weeks', 'month'];
export const periodOf = (p) => (PERIODS.includes(p) ? p : 'month');
const STEP = { week: 7, '2weeks': 14 };

export function nextMonth(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
}
export function daysIn(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
export function addDays(day, n) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
// Дата платежа в конкретном месяце: 31-е в ноябре превращается в 30-е.
export const dueDate = (month, day) => `${month}-${String(Math.min(day, daysIn(month))).padStart(2, '0')}`;

const MAX_BACKFILL = 12; // если правило долго не срабатывало — догоняем не больше 12 платежей

// Какие даты нужно создать для правила к сегодняшнему дню.
export function pendingDates(rule, now = today()) {
  const out = [];
  if (STEP[rule.period]) {
    if (!rule.last_date) return out;
    let d = addDays(rule.last_date, STEP[rule.period]);
    for (let i = 0; i < MAX_BACKFILL && d <= now; i++, d = addDays(d, STEP[rule.period])) out.push({ date: d, month: d.slice(0, 7) });
    return out;
  }
  const cur = now.slice(0, 7);
  let m = rule.last_month ? nextMonth(rule.last_month) : cur;
  for (let i = 0; i < MAX_BACKFILL && m <= cur; i++, m = nextMonth(m)) {
    const d = dueDate(m, rule.day);
    if (d > now) break;
    out.push({ month: m, date: d });
  }
  return out;
}

// Следующие даты платежей после сегодняшнего дня (не позже `until`)
export function futureDates(rule, now = today(), until = null) {
  const out = [];
  if (STEP[rule.period]) {
    let d = addDays(rule.last_date || now, STEP[rule.period]);
    while (d <= now) d = addDays(d, STEP[rule.period]);
    for (let i = 0; i < 6 && (!until || d <= until); i++, d = addDays(d, STEP[rule.period])) {
      out.push(d);
      if (!until) break;
    }
    return out;
  }
  let m = rule.last_month ? nextMonth(rule.last_month) : now.slice(0, 7);
  let d = dueDate(m, rule.day);
  while (d <= now) { m = nextMonth(m); d = dueDate(m, rule.day); }
  if (!until || d <= until) out.push(d);
  return out;
}

export async function materialize(env, userId = null, limit = 300) {
  const now = today();
  const cur = now.slice(0, 7);
  const [y, m] = cur.split('-').map(Number);
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  // выбираем только правила, которым действительно пора
  const where = `active = 1 AND (
      (period = 'month' AND (last_month IS NULL OR last_month < ?1) AND (last_month IS NULL OR last_month < ?2 OR MIN(day, ?3) <= ?4))
      OR (period = 'week' AND last_date IS NOT NULL AND date(last_date, '+7 days') <= ?5)
      OR (period = '2weeks' AND last_date IS NOT NULL AND date(last_date, '+14 days') <= ?5)
    )${userId ? ' AND user_id = ?6' : ''}`;
  const stmt = env.DB.prepare(`SELECT * FROM recurring WHERE ${where} LIMIT ${Number(limit) | 0}`);
  const args = [cur, prev, daysIn(cur), Number(now.slice(8, 10)), now];
  const { results: rules } = await stmt.bind(...args, ...(userId ? [userId] : [])).all();
  if (!rules.length) return 0;

  const rates = await getRates(env);
  const stmts = [];
  let created = 0;
  for (const r of rules) {
    const dates = pendingDates(r, now);
    if (!dates.length) continue;
    for (const { date } of dates) {
      stmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO entries (id, user_id, date, amount, currency, amount_eur, category, note, source, kind, recurring_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'recurring', ?, ?)`
      ).bind(crypto.randomUUID(), r.user_id, date, r.amount, r.currency, toEur(r.amount, r.currency, rates), r.category, r.note, r.kind, r.id));
      created++;
    }
    const last = dates.at(-1);
    stmts.push(STEP[r.period]
      ? env.DB.prepare('UPDATE recurring SET last_date = ? WHERE id = ?').bind(last.date, r.id)
      : env.DB.prepare('UPDATE recurring SET last_month = ? WHERE id = ?').bind(last.month, r.id));
  }
  // D1 выполняет batch как одну транзакцию; режем на куски, чтобы не упереться в лимиты
  for (let i = 0; i < stmts.length; i += 80) await env.DB.batch(stmts.slice(i, i + 80));
  return created;
}

// Платежи, которые ещё впереди в текущем месяце (для прогноза на главном экране).
// Недельное правило может дать несколько платежей до конца месяца.
export async function upcoming(env, userId, base) {
  const now = today();
  const monthEnd = dueDate(now.slice(0, 7), 31);
  const { results } = await env.DB.prepare(
    `SELECT * FROM recurring WHERE user_id = ? AND active = 1`
  ).bind(userId).all();
  const rates = await getRates(env);
  const out = [];
  for (const r of results) {
    for (const date of futureDates(r, now, monthEnd)) {
      out.push({
        id: r.id, kind: r.kind, amount: r.amount, currency: r.currency, category: r.category, note: r.note,
        day: r.day, period: r.period, date,
        amount_base: round2(fromEur(toEur(r.amount, r.currency, rates), base, rates)),
      });
    }
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export async function listRules(env, userId, base) {
  const now = today();
  const { results } = await env.DB.prepare(
    `SELECT * FROM recurring WHERE user_id = ? ORDER BY kind DESC, active DESC, day`
  ).bind(userId).all();
  const rates = await getRates(env);
  return results.map((r) => ({
    id: r.id, kind: r.kind, amount: r.amount, currency: r.currency, category: r.category, note: r.note,
    day: r.day, period: r.period, weekday: r.last_date ? new Date(`${r.last_date}T00:00:00Z`).getUTCDay() : null,
    active: !!r.active, next: r.active ? futureDates(r, now)[0] || null : null,
    amount_base: round2(fromEur(toEur(r.amount, r.currency, rates), base, rates)),
  }));
}

// date — дата первой записи по правилу (она создаётся отдельно, сразу)
export async function createRule(env, userId, { kind, amount, currency, category, note, day, period, date, lastMonth, lastDate }) {
  const id = crypto.randomUUID();
  const p = periodOf(period);
  const lm = lastMonth !== undefined ? lastMonth : (p === 'month' ? date.slice(0, 7) : null);
  const ld = lastDate !== undefined ? lastDate : (p === 'month' ? null : date);
  await env.DB.prepare(
    `INSERT INTO recurring (id, user_id, kind, amount, currency, category, note, day, last_month, period, last_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, userId, kind, round2(amount), currency, category, note || null, day, lm, p, ld).run();
  return id;
}

// Состояние правила после смены периода или возобновления после паузы:
// пропущенное задним числом не создаём, следующий платёж — в будущем.
export function resumeState({ period, day, lastDate }, now = today()) {
  if (STEP[period]) {
    let d = lastDate || now;
    while (addDays(d, STEP[period]) < now) d = addDays(d, STEP[period]);
    // если опорная дата в будущем (так не бывает, но на всякий случай) — отсчитываем от сегодня
    if (d > now) d = now;
    return { last_date: d, last_month: null };
  }
  const cur = now.slice(0, 7);
  const [y, m] = cur.split('-').map(Number);
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  return { last_month: dueDate(cur, day) < now ? cur : prev, last_date: null };
}

// Плановые платежи правила в промежутке [from, to] по расписанию (включая сегодняшний, даже если запись уже создана)
export function datesInRange(rule, from, to) {
  const out = [];
  if (STEP[rule.period]) {
    if (!rule.last_date) return out;
    let d = rule.last_date;
    while (d < from) d = addDays(d, STEP[rule.period]);
    while (d > from && addDays(d, -STEP[rule.period]) >= from) d = addDays(d, -STEP[rule.period]);
    for (; d <= to; d = addDays(d, STEP[rule.period])) if (d >= from) out.push(d);
    return out;
  }
  const months = [...new Set([from.slice(0, 7), to.slice(0, 7)])];
  for (const m of months) { const d = dueDate(m, rule.day); if (d >= from && d <= to) out.push(d); }
  return out;
}
