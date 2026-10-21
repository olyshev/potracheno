// Регулярные доходы и расходы: правило «сумма N каждое D-е число».
// В нужный день правило само создаёт запись. Делается это двумя путями:
//  — раз в сутки по расписанию для всех пользователей;
//  — при открытии приложения для конкретного пользователя (на случай, если расписание ещё не сработало).
// От дублей защищает уникальный индекс (recurring_id, date) и INSERT OR IGNORE.
import { getRates, toEur, fromEur, round2 } from './rates.js';

export const today = () => new Date().toISOString().slice(0, 10);
export const thisMonth = () => today().slice(0, 7);

export function nextMonth(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
}
export function daysIn(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
// Дата платежа в конкретном месяце: 31-е в ноябре превращается в 30-е.
export const dueDate = (month, day) => `${month}-${String(Math.min(day, daysIn(month))).padStart(2, '0')}`;

const MAX_BACKFILL = 12; // если правило долго не срабатывало — догоняем максимум год

// Какие даты нужно создать для правила к сегодняшнему дню.
export function pendingDates(rule, now = today()) {
  const cur = now.slice(0, 7);
  const out = [];
  let m = rule.last_month ? nextMonth(rule.last_month) : cur;
  for (let i = 0; i < MAX_BACKFILL && m <= cur; i++, m = nextMonth(m)) {
    const d = dueDate(m, rule.day);
    if (d > now) break;
    out.push({ month: m, date: d });
  }
  return out;
}

export async function materialize(env, userId = null, limit = 300) {
  const now = today();
  const cur = now.slice(0, 7);
  const [y, m] = cur.split('-').map(Number);
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  // выбираем только правила, которым действительно пора: пропущен прошлый месяц или в этом месяце день уже наступил
  const where = `active = 1 AND (last_month IS NULL OR last_month < ?1)
    AND (last_month IS NULL OR last_month < ?2 OR MIN(day, ?3) <= ?4)${userId ? ' AND user_id = ?5' : ''}`;
  const stmt = env.DB.prepare(`SELECT * FROM recurring WHERE ${where} LIMIT ${Number(limit) | 0}`);
  const args = [cur, prev, daysIn(cur), Number(now.slice(8, 10))];
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
    stmts.push(env.DB.prepare('UPDATE recurring SET last_month = ? WHERE id = ?').bind(dates.at(-1).month, r.id));
  }
  // D1 выполняет batch как одну транзакцию; режем на куски, чтобы не упереться в лимиты
  for (let i = 0; i < stmts.length; i += 80) await env.DB.batch(stmts.slice(i, i + 80));
  return created;
}

// Платежи, которые ещё впереди в текущем месяце (для прогноза на главном экране).
export async function upcoming(env, userId, base) {
  const now = today();
  const cur = now.slice(0, 7);
  const { results } = await env.DB.prepare(
    `SELECT * FROM recurring WHERE user_id = ? AND active = 1 AND (last_month IS NULL OR last_month < ?) ORDER BY day`
  ).bind(userId, cur).all();
  const rates = await getRates(env);
  return results
    .map((r) => ({ ...r, date: dueDate(cur, r.day) }))
    .filter((r) => r.date > now)
    .map((r) => ({
      id: r.id, kind: r.kind, amount: r.amount, currency: r.currency, category: r.category, note: r.note, day: r.day, date: r.date,
      amount_base: round2(fromEur(toEur(r.amount, r.currency, rates), base, rates)),
    }));
}

export async function listRules(env, userId, base) {
  const now = today();
  const { results } = await env.DB.prepare(
    `SELECT * FROM recurring WHERE user_id = ? ORDER BY kind DESC, active DESC, day`
  ).bind(userId).all();
  const rates = await getRates(env);
  return results.map((r) => {
    // ближайшая дата следующего платежа
    let m = r.last_month ? nextMonth(r.last_month) : now.slice(0, 7);
    let next = dueDate(m, r.day);
    if (!r.last_month && next < now) next = dueDate(nextMonth(m), r.day);
    return {
      id: r.id, kind: r.kind, amount: r.amount, currency: r.currency, category: r.category, note: r.note,
      day: r.day, active: !!r.active, next: r.active ? next : null,
      amount_base: round2(fromEur(toEur(r.amount, r.currency, rates), base, rates)),
    };
  });
}

export async function createRule(env, userId, { kind, amount, currency, category, note, day, lastMonth }) {
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO recurring (id, user_id, kind, amount, currency, category, note, day, last_month) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, userId, kind, round2(amount), currency, category, note || null, day, lastMonth || null).run();
  return id;
}
