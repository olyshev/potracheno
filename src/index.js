// Потрачено — сервер мини-аппа учёта расходов (Cloudflare Worker).
// Маршруты:
//   /api/*          — API для мини-аппа (авторизация через подпись Telegram initData)
//   /bot/webhook    — входящие сообщения боту (фото чеков, быстрый ввод «4,50 кофе», /start, /report)
//   /admin/setup    — разовая настройка бота после деплоя (?key=ADMIN_KEY)
//   /admin/stats    — простая статистика для владельца (?key=ADMIN_KEY)
//   cron            — регулярные платежи (каждый час) и рассылка итогов месяца (1–2 числа)
import { verifyInitData, webhookSecret } from './auth.js';
import { CATEGORIES, INCOME_CATEGORIES, isCategory, isCategoryFor, categorizeByRules, categorizeIncome, catLabel } from './categories.js';
import { materialize, upcoming, listRules, createRule, dueDate, periodOf, resumeState, datesInRange, localToday, localHour, localDate, validTz } from './recurring.js';
import { normalizeMerchant } from './brands.js';
import { runNudges } from './nudges.js';
import { shiftMonth } from './report.js';
const prevMonth = (m) => shiftMonth(m, -1);
import { getRates, isCurrency, toEur, fromEur, round2, CURRENCIES } from './rates.js';
import { parseDocument, receiptToDraft, transactionsToDraft, suggestCategory } from './ai.js';
import { monthSummary, reportText, runMonthlyReports, MONTH_RE, money } from './report.js';
import { tg, sendDocument, downloadFile, openAppKeyboard } from './telegram.js';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
const fail = (status, code, message) => json({ error: code, message }, status);

const today = () => new Date().toISOString().slice(0, 10);
const thisMonth = () => today().slice(0, 7);
const langOf = (code) => (['ru', 'uk', 'be', 'kk', 'uz', 'ky', 'hy', 'ka', 'az', 'tg'].includes(String(code || '').slice(0, 2)) ? 'ru' : 'en');
const validDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= '2000-01-01' && d <= addDays(today(), 1);
function addDays(day, n) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const validAmount = (n) => typeof n === 'number' && isFinite(n) && n > 0 && n < 1e9;
const validDay = (d) => Number.isInteger(d) && d >= 1 && d <= 31;
const kindOf = (k) => (k === 'income' ? 'income' : 'expense');

// ---------- пользователи и лимиты ----------

async function upsertUser(env, tgUser, extra = {}) {
  if (extra.tz && validTz(extra.tz)) {
    await env.DB.prepare('UPDATE users SET tz = ? WHERE id = ? AND (tz IS NULL OR tz != ?)').bind(extra.tz, tgUser.id, extra.tz).run();
  }
  await env.DB.prepare(
    `INSERT INTO users (id, first_name, username, lang, last_seen, can_message)
     VALUES (?1, ?2, ?3, ?4, datetime('now'), ?5)
     ON CONFLICT(id) DO UPDATE SET first_name = ?2, username = ?3, last_seen = datetime('now'), nudge_stage = 0,
       can_message = MAX(can_message, ?5)`
  ).bind(tgUser.id, tgUser.first_name || '', tgUser.username || '', langOf(tgUser.language_code), extra.canMessage ? 1 : 0).run();
  if (extra.tz && validTz(extra.tz)) await env.DB.prepare('UPDATE users SET tz = ? WHERE id = ? AND tz IS NULL').bind(extra.tz, tgUser.id).run();
  return env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(tgUser.id).first();
}

async function getUsage(env, userId) {
  const row = await env.DB.prepare('SELECT scans, suggests, bonus, shared FROM usage WHERE user_id = ? AND month = ?').bind(userId, thisMonth()).first();
  return { scans: row?.scans || 0, suggests: row?.suggests || 0, bonus: row?.bonus || 0, shared: !!row?.shared };
}
async function bumpUsage(env, userId, field) {
  await env.DB.prepare(
    `INSERT INTO usage (user_id, month, ${field}) VALUES (?, ?, 1)
     ON CONFLICT(user_id, month) DO UPDATE SET ${field} = ${field} + 1`
  ).bind(userId, thisMonth()).run();
}
const scanLimit = (env, usage) => Number(env.FREE_SCANS_PER_MONTH || 60) + (usage?.bonus || 0);
const SHARE_BONUS = 5;

async function authUser(request, env) {
  const h = request.headers.get('authorization') || '';
  if (env.DEV_MODE === '1' && h === 'tma dev') {
    return { id: Number(env.DEV_USER_ID || 1), first_name: 'Dev', username: 'dev', language_code: 'ru' };
  }
  if (!h.startsWith('tma ')) return null;
  return verifyInitData(h.slice(4), env.BOT_TOKEN);
}

// ---------- запись трат ----------

async function insertEntries(env, userId, rows) {
  const rates = await getRates(env);
  const stmts = rows.map((r) =>
    env.DB.prepare(
      `INSERT INTO entries (id, user_id, date, amount, currency, amount_eur, category, note, merchant, receipt_id, source, kind, recurring_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(r.id || crypto.randomUUID(), userId, r.date, round2(r.amount), r.currency, toEur(r.amount, r.currency, rates),
      r.category, r.note || null, r.merchant || null, r.receipt_id || null, r.source || 'manual', kindOf(r.kind), r.recurring_id || null)
  );
  for (let i = 0; i < stmts.length; i += 100) await env.DB.batch(stmts.slice(i, i + 100));
}

async function deleteRule(env, userId, ruleId) {
  await env.DB.batch([
    env.DB.prepare('UPDATE entries SET recurring_id = NULL WHERE recurring_id = ? AND user_id = ?').bind(ruleId, userId),
    env.DB.prepare('DELETE FROM recurring WHERE id = ? AND user_id = ?').bind(ruleId, userId),
  ]);
}

async function pickCategory(env, userId, text) {
  const byRule = categorizeByRules(text);
  if (byRule) return { category: byRule, by: 'rules' };
  if (!text || text.trim().length < 2 || !env.ANTHROPIC_API_KEY) return { category: 'other', by: 'default' };
  const usage = await getUsage(env, userId);
  if (usage.suggests >= Number(env.FREE_SUGGESTS_PER_MONTH || 400)) return { category: 'other', by: 'limit' };
  try {
    const category = await suggestCategory(env, text);
    await bumpUsage(env, userId, 'suggests');
    return { category, by: 'ai' };
  } catch (e) {
    console.warn('suggest failed', e.message);
    return { category: 'other', by: 'error' };
  }
}

const MEDIA = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
// Проверка присланных файлов: до 8 картинок или один PDF, в сумме не больше ~10 МБ
function validFiles(files) {
  if (!Array.isArray(files) || !files.length || files.length > 8) return null;
  const out = files.map((f) => ({ data: String(f?.data || ''), media_type: MEDIA.includes(f?.media_type) ? f.media_type : 'image/jpeg' }));
  if (out.some((f) => f.data.length < 100)) return null;
  if (out.filter((f) => f.media_type === 'application/pdf').length > 1) return null;
  if (out.reduce((a, f) => a + f.data.length, 0) > 14_000_000) return 'too_big';
  return out;
}

// Отмечаем операции, которые уже есть в учёте: та же сумма, валюта и вид, дата ±2 дня.
// Чек, разложенный по категориям, сравниваем по общей сумме.
async function markDuplicates(env, userId, items) {
  const dates = items.map((i) => i.date).sort();
  const { results } = await env.DB.prepare(
    `SELECT date, kind, currency, amount, receipt_id FROM entries WHERE user_id = ? AND date >= ? AND date <= ?`
  ).bind(userId, addDays(dates[0], -2), addDays(dates.at(-1), 2)).all();
  const candidates = [];
  const receipts = {};
  for (const e of results) {
    candidates.push({ date: e.date, kind: e.kind, currency: e.currency, amount: e.amount });
    if (e.receipt_id) {
      const r = (receipts[e.receipt_id] ||= { date: e.date, kind: e.kind, currency: e.currency, amount: 0, parts: 0 });
      r.amount += e.amount; r.parts++;
    }
  }
  for (const r of Object.values(receipts)) if (r.parts > 1) candidates.push(r);
  const dayDiff = (a, b) => Math.abs((Date.parse(a) - Date.parse(b)) / 86400000);
  for (const it of items) {
    if (it.kind === 'transfer') continue;
    const i = candidates.findIndex((c) => !c.used && c.kind === it.kind && c.currency === it.currency
      && Math.abs(c.amount - it.amount) < 0.01 && dayDiff(c.date, it.date) <= 2);
    if (i >= 0) { candidates[i].used = true; it.duplicate = true; }
  }
  return items;
}

async function scanDocument(env, user, files) {
  const usage = await getUsage(env, user.id);
  if (usage.scans >= scanLimit(env, usage)) return { error: 'limit' };
  let parsed;
  try {
    parsed = await parseDocument(env, files, localToday(user.tz));
  } catch (e) {
    console.error('document parse failed', e.message);
    return { error: 'ai' };
  }
  await bumpUsage(env, user.id, 'scans');
  const rates = await getRates(env);
  const base = user.base_currency || 'EUR';
  const scansLeft = Math.max(0, scanLimit(env, usage) - usage.scans - 1);
  if (parsed?.doc_type === 'transactions') {
    const draft = transactionsToDraft(parsed, base, localToday(user.tz));
    if (!draft) return { error: 'not_receipt' };
    draft.items.forEach((i) => { if (!isCurrency(i.currency, rates)) i.currency = base; });
    await markDuplicates(env, user.id, draft.items);
    return { type: 'transactions', draft, scansLeft };
  }
  const draft = receiptToDraft(parsed, base);
  if (!draft) return { error: 'not_receipt' };
  if (!isCurrency(draft.currency, rates)) draft.currency = base;
  if (!draft.date || !validDate(draft.date)) draft.date = localToday(user.tz);
  return { type: 'receipt', draft, scansLeft };
}

// ---------- API мини-аппа ----------

async function handleApi(request, env, url) {
  const tgUser = await authUser(request, env);
  if (!tgUser) return fail(401, 'unauthorized', 'Open the app from Telegram');
  const user = await upsertUser(env, tgUser, { tz: request.headers.get('x-tz') });
  const now = localToday(user.tz), curMonth = now.slice(0, 7); // «сегодня» по времени пользователя
  const path = url.pathname.replace(/^\/api/, '');
  const method = request.method;
  const body = method === 'POST' || method === 'PATCH' ? await request.json().catch(() => ({})) : {};

  if (path === '/me' && method === 'GET') {
    const [usage, cnt, views] = await Promise.all([
      getUsage(env, user.id),
      env.DB.prepare('SELECT COUNT(*) AS n FROM entries WHERE user_id = ?').bind(user.id).first(),
      env.DB.prepare('SELECT story_id FROM story_views WHERE user_id = ?').bind(user.id).all(),
    ]);
    return json({
      user: { id: user.id, first_name: user.first_name, lang: user.lang, base_currency: user.base_currency, can_message: !!user.can_message, nudges: user.nudges !== 0 },
      categories: CATEGORIES,
      income_categories: INCOME_CATEGORIES,
      currencies: CURRENCIES,
      limits: { scans: scanLimit(env, usage), scansUsed: usage.scans, shareBonus: SHARE_BONUS, sharedThisMonth: usage.shared },
      hasEntries: cnt.n > 0,
      seenStories: views.results.map((v) => v.story_id),
      today: now,
      // сколько дней прошло с первого запуска — «С чего начать» показываем первую неделю
      daysSinceStart: Math.max(0, Math.floor((Date.parse(`${now}T00:00:00Z`) - Date.parse(`${localDate(user.created_at, user.tz)}T00:00:00Z`)) / 864e5)),
    });
  }

  if (path === '/settings' && method === 'POST') {
    const rates = await getRates(env);
    if (body.base_currency !== undefined) {
      if (!isCurrency(body.base_currency, rates)) return fail(400, 'bad_currency');
      await env.DB.prepare('UPDATE users SET base_currency = ? WHERE id = ?').bind(body.base_currency, user.id).run();
    }
    if (body.lang === 'ru' || body.lang === 'en') {
      await env.DB.prepare('UPDATE users SET lang = ? WHERE id = ?').bind(body.lang, user.id).run();
    }
    if (typeof body.nudges === 'boolean') {
      await env.DB.prepare('UPDATE users SET nudges = ? WHERE id = ?').bind(body.nudges ? 1 : 0, user.id).run();
    }
    if (typeof body.can_message === 'boolean') {
      await env.DB.prepare('UPDATE users SET can_message = ? WHERE id = ?').bind(body.can_message ? 1 : 0, user.id).run();
    }
    return json({ ok: true });
  }

  if (path === '/summary' && method === 'GET') {
    const month = MONTH_RE.test(url.searchParams.get('month') || '') ? url.searchParams.get('month') : curMonth;
    const base = user.base_currency || 'EUR';
    await materialize(env, user.id); // регулярные платежи, у которых наступил день
    const isCurrent = month === curMonth;
    const [summary, list, rates, next] = await Promise.all([
      monthSummary(env, user.id, month, base),
      env.DB.prepare(
        `SELECT e.id, e.date, e.amount, e.currency, e.amount_eur, e.category, e.note, e.merchant, e.receipt_id, e.source, e.kind,
                e.recurring_id, r.day AS rec_day, r.active AS rec_active, r.period AS rec_period
         FROM entries e LEFT JOIN recurring r ON r.id = e.recurring_id
         WHERE e.user_id = ? AND e.date >= ? AND e.date <= ? ORDER BY e.date DESC, e.created_at DESC LIMIT 1000`
      ).bind(user.id, `${month}-01`, `${month}-31`).all(),
      getRates(env),
      isCurrent ? upcoming(env, user.id, base, now) : [],
    ]);
    const entries = list.results.map((e) => ({ ...e, amount_base: round2(fromEur(e.amount_eur, base, rates)) }));
    // прогноз: остаток к концу месяца с учётом регулярных платежей, которые ещё впереди
    const upIncome = next.filter((u) => u.kind === 'income').reduce((a, u) => a + u.amount_base, 0);
    const upExpense = next.filter((u) => u.kind === 'expense').reduce((a, u) => a + u.amount_base, 0);
    summary.upcoming = next;
    summary.projected = next.length ? round2(summary.balance + upIncome - upExpense) : null;
    return json({ summary, entries });
  }

  if (path === '/entries' && method === 'POST') {
    const rates = await getRates(env);
    const kind = kindOf(body.kind);
    const amount = Number(body.amount);
    const currency = body.currency || user.base_currency;
    if (!validAmount(amount)) return fail(400, 'bad_amount');
    if (!isCurrency(currency, rates)) return fail(400, 'bad_currency');
    const date = validDate(body.date) ? body.date : now;
    const note = String(body.note || '').trim().slice(0, 120);
    const category = isCategoryFor(kind, body.category) ? body.category
      : kind === 'income' ? categorizeIncome(note) : (await pickCategory(env, user.id, note)).category;
    let recurring_id = null;
    if (body.recurring) {
      const day = validDay(Number(body.recurring.day)) ? Number(body.recurring.day) : Number(date.slice(8, 10));
      // эту запись создаём сейчас, правило подхватит следующие
      recurring_id = await createRule(env, user.id, { kind, amount, currency, category, note, day, period: periodOf(body.recurring.period), date });
    }
    await insertEntries(env, user.id, [{ date, amount, currency, category, note, kind, recurring_id, source: 'manual' }]);
    return json({ ok: true, category, recurring_id });
  }

  if (path === '/recurring' && method === 'GET') {
    return json({ rules: await listRules(env, user.id, user.base_currency || 'EUR', now) });
  }
  const ruleMatch = path.match(/^\/recurring\/([0-9a-f-]{36})$/);
  if (ruleMatch && method === 'PATCH') {
    const r = await env.DB.prepare('SELECT * FROM recurring WHERE id = ? AND user_id = ?').bind(ruleMatch[1], user.id).first();
    if (!r) return fail(404, 'not_found');
    const rates = await getRates(env);
    const amount = body.amount !== undefined ? Number(body.amount) : r.amount;
    const currency = body.currency || r.currency;
    if (!validAmount(amount)) return fail(400, 'bad_amount');
    if (!isCurrency(currency, rates)) return fail(400, 'bad_currency');
    const day = validDay(Number(body.day)) ? Number(body.day) : r.day;
    const period = body.period !== undefined ? periodOf(body.period) : r.period;
    const active = typeof body.active === 'boolean' ? (body.active ? 1 : 0) : r.active;
    let st = { last_month: r.last_month, last_date: r.last_date };
    // После паузы или смены периода задним числом ничего не создаём: следующий платёж — в будущем
    if ((active && !r.active) || period !== r.period) {
      const last = r.last_date || (await env.DB.prepare('SELECT MAX(date) AS d FROM entries WHERE recurring_id = ? AND user_id = ?').bind(r.id, user.id).first())?.d || now;
      st = resumeState({ period, day, lastDate: last }, now);
    }
    await env.DB.prepare(
      `UPDATE recurring SET amount = ?, currency = ?, category = ?, note = ?, day = ?, active = ?, period = ?, last_month = ?, last_date = ? WHERE id = ? AND user_id = ?`
    ).bind(round2(amount), currency, isCategoryFor(r.kind, body.category) ? body.category : r.category,
      body.note !== undefined ? String(body.note).trim().slice(0, 120) : r.note, day, active, period, st.last_month, st.last_date, r.id, user.id).run();
    return json({ ok: true });
  }
  if (ruleMatch && method === 'DELETE') {
    await deleteRule(env, user.id, ruleMatch[1]);
    return json({ ok: true });
  }

  const entryMatch = path.match(/^\/entries\/([0-9a-f-]{36})$/);
  if (entryMatch && method === 'PATCH') {
    const id = entryMatch[1];
    const e = await env.DB.prepare('SELECT * FROM entries WHERE id = ? AND user_id = ?').bind(id, user.id).first();
    if (!e) return fail(404, 'not_found');
    const rates = await getRates(env);
    const amount = body.amount !== undefined ? Number(body.amount) : e.amount;
    const currency = body.currency || e.currency;
    if (!validAmount(amount)) return fail(400, 'bad_amount');
    if (!isCurrency(currency, rates)) return fail(400, 'bad_currency');
    const changedMoney = amount !== e.amount || currency !== e.currency;
    const category = isCategoryFor(e.kind, body.category) ? body.category : e.category;
    const note = body.note !== undefined ? String(body.note).trim().slice(0, 120) : e.note;
    const date = validDate(body.date) ? body.date : e.date;
    let recurringId = e.recurring_id;
    const stmts = [];

    // Повтор: false — забыть правило; { day } — создать или поменять число; apply_to_rule — новая сумма и для будущих месяцев
    if (body.recurring === false && recurringId) {
      await deleteRule(env, user.id, recurringId);
      recurringId = null;
    } else if (body.recurring && typeof body.recurring === 'object') {
      const day = validDay(Number(body.recurring.day)) ? Number(body.recurring.day) : Number(date.slice(8, 10));
      const period = periodOf(body.recurring.period);
      const rule = recurringId ? await env.DB.prepare('SELECT * FROM recurring WHERE id = ? AND user_id = ?').bind(recurringId, user.id).first() : null;
      if (rule) {
        if (period !== rule.period || (period === 'month' && day !== rule.day)) {
          // последняя уже внесённая запись правила — опора для следующего платежа
          const last = (await env.DB.prepare('SELECT MAX(date) AS d FROM entries WHERE recurring_id = ? AND user_id = ?').bind(rule.id, user.id).first())?.d || date;
          const st = period === 'month'
            ? { last_month: last.slice(0, 7) >= curMonth ? curMonth : (period === rule.period ? rule.last_month : last.slice(0, 7)), last_date: null }
            : resumeState({ period, day, lastDate: last }, now);
          stmts.push(env.DB.prepare('UPDATE recurring SET day = ?, period = ?, last_month = ?, last_date = ? WHERE id = ?').bind(day, period, st.last_month, st.last_date, rule.id));
        }
      } else if (period === 'month') {
        const lastMonth = date.slice(0, 7) > curMonth ? curMonth : (date.slice(0, 7) < curMonth && dueDate(curMonth, day) <= now ? prevMonth(curMonth) : date.slice(0, 7));
        recurringId = await createRule(env, user.id, { kind: e.kind, amount, currency, category, note, day, period, date, lastMonth });
      } else {
        recurringId = await createRule(env, user.id, { kind: e.kind, amount, currency, category, note, day, period, date, lastDate: resumeState({ period, day, lastDate: date }, now).last_date });
      }
    }
    if (body.apply_to_rule && recurringId) {
      stmts.push(env.DB.prepare('UPDATE recurring SET amount = ?, currency = ?, category = ?, note = ? WHERE id = ? AND user_id = ?')
        .bind(round2(amount), currency, category, note, recurringId, user.id));
    }
    stmts.push(env.DB.prepare(
      `UPDATE entries SET amount = ?, currency = ?, amount_eur = ?, category = ?, note = ?, date = ?, recurring_id = ? WHERE id = ? AND user_id = ?`
    ).bind(round2(amount), currency, changedMoney ? toEur(amount, currency, rates) : e.amount_eur, category, note, date, recurringId, id, user.id));
    await env.DB.batch(stmts);
    return json({ ok: true, recurring_id: recurringId });
  }
  if (entryMatch && method === 'DELETE') {
    await env.DB.prepare('DELETE FROM entries WHERE id = ? AND user_id = ?').bind(entryMatch[1], user.id).run();
    return json({ ok: true });
  }

  if (path === '/share/image' && method === 'POST') {
    const data = String(body.data || '');
    if (!/^[A-Za-z0-9+/=]+$/.test(data.slice(0, 200)) || data.length < 1000 || data.length > 1_900_000) return fail(400, 'bad_image');
    const id = crypto.randomUUID().replace(/-/g, '');
    await env.DB.prepare('INSERT INTO share_images (id, user_id, data) VALUES (?, ?, ?)').bind(id, user.id, data).run();
    return json({ ok: true, url: `${url.origin}/share/${id}.jpg` });
  }

  if (path === '/share/bonus' && method === 'POST') {
    // +5 сканов раз в календарный месяц за попытку поделиться (Telegram не сообщает, опубликована ли история)
    const res = await env.DB.prepare(
      `INSERT INTO usage (user_id, month, bonus, shared) VALUES (?1, ?2, ?3, 1)
       ON CONFLICT(user_id, month) DO UPDATE SET bonus = bonus + ?3, shared = 1 WHERE shared = 0`
    ).bind(user.id, thisMonth(), SHARE_BONUS).run();
    const usage = await getUsage(env, user.id);
    return json({ ok: true, granted: res.meta.changes > 0, bonus: SHARE_BONUS, scans: scanLimit(env, usage), scansUsed: usage.scans });
  }

  if (path === '/weekly' && method === 'GET') {
    // Недели — с понедельника по воскресенье по местному времени. Итоги прошлой недели живут понедельник и вторник
    // (с 00:00 понедельника до 00:00 среды), план — на текущую неделю, обновляется в понедельник.
    const base = user.base_currency || 'EUR';
    const rates = await getRates(env);
    const dow = (new Date(`${now}T00:00:00Z`).getUTCDay() + 6) % 7; // 0 = понедельник
    const weekStart = addDays(now, -dow), weekEnd = addDays(weekStart, 6);
    const lastStart = addDays(weekStart, -7), lastEnd = addDays(weekStart, -1), histStart = addDays(weekStart, -35);
    const conv = (eur) => round2(fromEur(eur, base, rates));

    // повседневные траты: без регулярных платежей (аренда, подписки и т. п.)
    const { results: daily } = await env.DB.prepare(
      `SELECT date, category, amount_eur FROM entries
       WHERE user_id = ? AND kind = 'expense' AND recurring_id IS NULL AND date >= ? AND date <= ?`
    ).bind(user.id, histStart, lastEnd).all();
    const last = daily.filter((e) => e.date >= lastStart);
    let summary = null;
    if (dow <= 1 && last.length >= 3) {
      const byCat = {};
      for (const e of last) byCat[e.category] = (byCat[e.category] || 0) + e.amount_eur;
      const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
      // «обычно» — средняя неделя из четырёх предыдущих, в которых были траты
      const weeks = [];
      for (let k = 1; k <= 4; k++) {
        const ws = addDays(lastStart, -7 * k), we = addDays(ws, 6);
        const list = daily.filter((e) => e.date >= ws && e.date <= we);
        if (list.length) weeks.push(list.reduce((a, e) => a + e.amount_eur, 0));
      }
      const avg = weeks.length ? weeks.reduce((a, b) => a + b, 0) / weeks.length : 0;
      summary = {
        from: lastStart, to: lastEnd, count: last.length,
        spent: conv(last.reduce((a, e) => a + e.amount_eur, 0)), avg: avg ? conv(avg) : null,
        top: { category: top[0], amount: conv(top[1]) },
      };
    }

    // план: платежи по регулярным правилам с сегодняшнего дня до конца недели
    const { results: rules } = await env.DB.prepare('SELECT * FROM recurring WHERE user_id = ? AND active = 1').bind(user.id).all();
    const plan = { expenses: [], incomes: [] };
    for (const r of rules) {
      for (const date of datesInRange(r, now, weekEnd)) {
        (r.kind === 'income' ? plan.incomes : plan.expenses).push({
          date, amount: r.amount, currency: r.currency, category: r.category, note: r.note,
          amount_base: conv(toEur(r.amount, r.currency, rates)),
        });
      }
    }
    for (const k of ['expenses', 'incomes']) plan[k] = plan[k].sort((a, b) => b.amount_base - a.amount_base).slice(0, 3);
    return json({ today: now, week: { from: weekStart, to: weekEnd }, base, summary, plan });
  }

  if (path === '/stories/seen' && method === 'POST') {
    const id = String(body.id || '');
    if (!/^[a-z0-9-]{1,40}$/.test(id)) return fail(400, 'bad_id');
    await env.DB.prepare('INSERT OR IGNORE INTO story_views (user_id, story_id) VALUES (?, ?)').bind(user.id, id).run();
    return json({ ok: true });
  }

  if (path === '/suggest' && method === 'POST') {
    return json(await pickCategory(env, user.id, String(body.text || '').slice(0, 120)));
  }

  if ((path === '/scan' || path === '/receipt/scan') && method === 'POST') {
    // /receipt/scan — старый формат с одной картинкой, оставлен для совместимости
    const files = validFiles(body.files || (body.image ? [{ data: body.image, media_type: body.media_type }] : null));
    if (files === 'too_big') return fail(413, 'too_big');
    if (!files) return fail(400, 'no_image');
    const r = await scanDocument(env, user, files);
    if (r.error === 'limit') return fail(429, 'limit', 'Monthly receipt limit reached');
    if (r.error === 'not_receipt') return fail(422, 'not_receipt');
    if (r.error) return fail(502, 'ai_error');
    return json(r);
  }

  if (path === '/receipt/save' && method === 'POST') {
    const rates = await getRates(env);
    const currency = body.currency;
    if (!isCurrency(currency, rates)) return fail(400, 'bad_currency');
    const groups = (Array.isArray(body.groups) ? body.groups : [])
      .map((g) => ({ category: g.category, amount: Number(g.amount), note: String(g.note || '').slice(0, 120) }))
      .filter((g) => isCategory(g.category) && validAmount(g.amount));
    if (!groups.length || groups.length > 20) return fail(400, 'bad_groups');
    const date = validDate(body.date) ? body.date : now;
    const merchant = normalizeMerchant(body.merchant).slice(0, 60);
    const receipt_id = crypto.randomUUID();
    await insertEntries(env, user.id, groups.map((g) => ({
      date, amount: g.amount, currency, category: g.category, note: g.note || merchant, merchant, receipt_id, source: 'receipt',
    })));
    return json({ ok: true, receipt_id });
  }

  if (path === '/transactions/save' && method === 'POST') {
    const rates = await getRates(env);
    const items = (Array.isArray(body.items) ? body.items : []).slice(0, 300).map((i) => {
      const kind = kindOf(i.kind);
      return {
        kind, amount: Number(i.amount), currency: i.currency,
        category: isCategoryFor(kind, i.category) ? i.category : (kind === 'income' ? 'other_income' : 'other'),
        note: normalizeMerchant(i.note).slice(0, 120), date: validDate(i.date) ? i.date : now, source: 'statement',
      };
    }).filter((i) => validAmount(i.amount) && isCurrency(i.currency, rates));
    if (!items.length) return fail(400, 'bad_items');
    await insertEntries(env, user.id, items);
    return json({ ok: true, saved: items.length });
  }

  if (path === '/export' && method === 'POST') {
    const { results } = await env.DB.prepare(
      `SELECT date, kind, amount, currency, amount_eur, category, note, merchant, source FROM entries WHERE user_id = ? ORDER BY date`
    ).bind(user.id).all();
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = '\ufeffdate,type,amount,currency,amount_eur,category,note,merchant,source\n' +
      results.map((r) => [r.date, r.kind, r.amount, r.currency, r.amount_eur, catLabel(r.category, user.lang).replace(/^\S+\s/, ''), r.note, r.merchant, r.source].map(q).join(',')).join('\n');
    const res = await sendDocument(env, user.id, `expenses-${now}.csv`, csv, user.lang === 'ru' ? 'Все ваши доходы и траты' : 'All your income and expenses');
    if (!res.ok) return fail(409, 'cant_message', 'Start the bot first');
    return json({ ok: true });
  }

  if (path === '/me' && method === 'DELETE') {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM entries WHERE user_id = ?').bind(user.id),
      env.DB.prepare('DELETE FROM recurring WHERE user_id = ?').bind(user.id),
      env.DB.prepare('DELETE FROM story_views WHERE user_id = ?').bind(user.id),
      env.DB.prepare('DELETE FROM share_images WHERE user_id = ?').bind(user.id),
      // счётчики текущего месяца оставляем: иначе удаление данных обнуляло бы лимит сканов и бонус за шеринг
      env.DB.prepare('DELETE FROM usage WHERE user_id = ? AND month != ?').bind(user.id, thisMonth()),
      env.DB.prepare('DELETE FROM reports_sent WHERE user_id = ?').bind(user.id),
      env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id),
    ]);
    return json({ ok: true });
  }

  return fail(404, 'not_found');
}

// ---------- бот ----------

const BOT_TEXT = {
  ru: {
    start: (name) => `Привет${name ? `, ${name}` : ''}! Это приложение поможет вести учёт расходов и доходов.\n\nМожно указывать покупки вручную, а можно прислать фото чека, скрин из банка или выписку — алгоритм разберёт операции по категориям и включит в список.\n\nДобавьте постоянные расходы на аренду, подписки или страховку — приложение запомнит дату и сумму, чтобы вам не пришлось вводить их из раза в раз.\n\nКаждого 1-го числа бот будет присылать итоги месяца.\n\nЗапускайте приложение, чтобы перестать жить от зарплаты до зарплаты:`,
    startBtn: 'Вперёд!',
    open: 'Открыть',
    reading: '🔍 Читаю…',
    savedTx: (n, exp, inc, skipped) => `✅ Внёс ${n} ${n % 10 === 1 && n % 100 !== 11 ? 'операцию' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'операции' : 'операций'}${exp ? `\n💸 Расходы: ${exp}` : ''}${inc ? `\n💰 Доходы: ${inc}` : ''}${skipped ? `\n\nПропустил ${skipped} — уже были в учёте или это переводы между своими счетами. Проверить можно в приложении.` : ''}`,
    nothingNew: 'Все операции отсюда уже есть в учёте 👌',
    saved: (d) => `✅ Записал чек${d.merchant ? ` «${d.merchant}»` : ''} на ${d.total}:\n${d.lines}`,
    savedManual: (sum, cat) => `✅ ${sum} — ${cat}`,
    savedIncome: (sum, cat) => `💰 Доход ${sum} — ${cat}`,
    notReceipt: 'Не нашёл здесь ни чека, ни операций. Попробуйте снять ровнее и при хорошем свете.',
    limit: (n) => `В этом месяце уже распознано ${n} чеков — это лимит. Суммы можно вносить вручную.`,
    aiError: 'Не получилось распознать чек, попробуйте ещё раз чуть позже.',
    help: 'Пришлите фото чека или напишите сумму с описанием, например: <code>12,90 продукты</code>. Доход — с плюсом: <code>+2500 зарплата</code>',
    empty: 'В этом месяце пока нет записей.',
    fix: 'Поправить',
  },
  en: {
    start: (name) => `Hi${name ? `, ${name}` : ''}! This app helps you keep track of your expenses and income.\n\nYou can add purchases manually, or send a photo of a receipt, a screenshot from your banking app or a statement — the algorithm will sort the transactions into categories and add them to your list.\n\nAdd your regular expenses like rent, subscriptions or insurance — the app will remember the date and amount, so you don't have to enter them again and again.\n\nOn the 1st of every month the bot will send you a monthly summary.\n\nOpen the app and stop living paycheck to paycheck:`,
    startBtn: 'Let’s go!',
    open: 'Open',
    reading: '🔍 Reading…',
    savedTx: (n, exp, inc, skipped) => `✅ Added ${n} transaction${n === 1 ? '' : 's'}${exp ? `\n💸 Expenses: ${exp}` : ''}${inc ? `\n💰 Income: ${inc}` : ''}${skipped ? `\n\nSkipped ${skipped} — already recorded or transfers between your own accounts. You can review them in the app.` : ''}`,
    nothingNew: 'Everything here is already recorded 👌',
    saved: (d) => `✅ Saved${d.merchant ? ` “${d.merchant}”` : ''}, ${d.total}:\n${d.lines}`,
    savedManual: (sum, cat) => `✅ ${sum} — ${cat}`,
    savedIncome: (sum, cat) => `💰 Income ${sum} — ${cat}`,
    notReceipt: "I couldn't find a receipt or transactions here. Try a straighter photo in good light.",
    limit: (n) => `You've scanned ${n} receipts this month — that's the limit. You can still add amounts manually.`,
    aiError: "Couldn't read the receipt, please try again a bit later.",
    help: 'Send a photo of a receipt or type an amount with a note, e.g. <code>12.90 groceries</code>. Income starts with a plus: <code>+2500 salary</code>',
    empty: 'No entries this month yet.',
    fix: 'Edit',
  },
};

const SYMBOLS = { '€': 'EUR', '$': 'USD', '₽': 'RUB', 'р': 'RUB', 'руб': 'RUB', '£': 'GBP', '₺': 'TRY', '₸': 'KZT', '₾': 'GEL', 'евро': 'EUR', 'долл': 'USD' };
// «4,50 кофе», «€12 обед», «120 USD отель», «1 200 руб такси»
export function parseQuickEntry(text) {
  let t = text.trim();
  const income = /^\+/.test(t);
  if (income) t = t.slice(1).trim();
  const m = t.match(/^([€$₽£₺₸₾])?\s*(\d{1,3}(?:[  ]\d{3})+|\d+)(?:[.,](\d{1,2}))?\s*(?:([A-Za-z]{3}|[€$₽£₺₸₾]|руб\.?|р\.?|евро|долл\.?)(?=\s|$))?\s*(.*)$/i);
  if (!m) return null;
  const amount = Number(`${m[2].replace(/[  ]/g, '')}.${m[3] || '0'}`);
  const token = m[1] || m[4] || null;
  let cur = null;
  if (token) {
    const key = token.toLowerCase().replace(/\.$/, '');
    cur = SYMBOLS[token] || SYMBOLS[key] || token.toUpperCase();
  }
  // «15 bus ticket»: три латинские буквы, которые не валюта, возвращаем в описание (решает вызывающий код)
  return { amount, currency: cur, token: m[4] || null, note: (m[5] || '').trim(), income };
}

async function handleUpdate(env, update) {
  const appUrl = (await env.DB.prepare(`SELECT value FROM settings WHERE key = 'app_url'`).first())?.value;

  if (update.my_chat_member) {
    const st = update.my_chat_member.new_chat_member?.status;
    const from = update.my_chat_member.from;
    if (from && update.my_chat_member.chat?.type === 'private') {
      await env.DB.prepare('UPDATE users SET can_message = ? WHERE id = ?').bind(st === 'kicked' ? 0 : 1, from.id).run();
    }
    return;
  }
  const msg = update.message;
  if (!msg || !msg.from || msg.chat?.type !== 'private') return;
  const user = await upsertUser(env, msg.from, { canMessage: true });
  const L = BOT_TEXT[user.lang] || BOT_TEXT.en;
  const kb = appUrl ? openAppKeyboard(appUrl, L.open) : undefined;
  const reply = (text, extra = {}) => tg(env, 'sendMessage', { chat_id: msg.chat.id, text, parse_mode: 'HTML', ...extra });

  const text = (msg.text || '').trim();
  if (text.startsWith('/start')) {
    const ref = (text.match(/^\/start\s+ref_(\d+)/) || [])[1];
    // запоминаем, кто пригласил: только для новых пользователей (первые 10 минут) и не самого себя
    if (ref && Number(ref) !== user.id && !user.referred_by) {
      await env.DB.prepare(`UPDATE users SET referred_by = ? WHERE id = ? AND referred_by IS NULL AND created_at > datetime('now', '-10 minutes')`).bind(Number(ref), user.id).run();
    }
  }
  if (text.startsWith('/start')) return reply(L.start((msg.from.first_name || '').replace(/[<&>]/g, '')), { reply_markup: appUrl ? openAppKeyboard(appUrl, L.startBtn) : undefined });
  if (text.startsWith('/report')) {
    const s = await monthSummary(env, user.id, localToday(user.tz).slice(0, 7), user.base_currency || 'EUR');
    return reply(s.count ? reportText(s, user.lang) : L.empty, { reply_markup: kb });
  }

  // Фото чека, скриншот банка или выписка: как фото, картинка-файл или PDF
  const photo = msg.photo?.length ? msg.photo[msg.photo.length - 1] : null;
  const doc = msg.document && /^(image\/(jpeg|png|webp)|application\/pdf)$/.test(msg.document.mime_type || '') ? msg.document : null;
  if (photo || doc) {
    const fileSize = (photo || doc).file_size || 0;
    if (fileSize > 9_500_000) return reply(L.aiError);
    const status = await reply(L.reading);
    const { base64 } = await downloadFile(env, (photo || doc).file_id);
    const mediaType = doc ? doc.mime_type : 'image/jpeg';
    const r = await scanDocument(env, user, [{ data: base64, media_type: mediaType }]);
    let out;
    if (r.error === 'limit') out = L.limit(scanLimit(env, await getUsage(env, user.id)));
    else if (r.error === 'not_receipt') out = L.notReceipt;
    else if (r.error) out = L.aiError;
    else if (r.type === 'transactions') {
      // без экрана проверки вносим только новые расходы и доходы; дубли и переводы между своими счетами пропускаем
      const items = r.draft.items;
      const take = items.filter((i) => !i.duplicate && i.kind !== 'transfer');
      await insertEntries(env, user.id, take.map((i) => ({ ...i, source: 'statement' })));
      const base = user.base_currency || 'EUR';
      const rates = await getRates(env);
      const sum = (k) => take.filter((i) => i.kind === k).reduce((a, i) => a + fromEur(toEur(i.amount, i.currency, rates), base, rates), 0);
      const exp = sum('expense'), inc = sum('income');
      out = take.length
        ? L.savedTx(take.length, exp ? money(exp, base, user.lang) : '', inc ? money(inc, base, user.lang) : '', items.length - take.length)
        : L.nothingNew;
    } else {
      const d = r.draft;
      const receipt_id = crypto.randomUUID();
      await insertEntries(env, user.id, d.groups.map((g) => ({
        date: d.date, amount: g.amount, currency: d.currency, category: g.category,
        note: d.merchant, merchant: d.merchant, receipt_id, source: 'receipt',
      })));
      const lines = d.groups.map((g) => `${catLabel(g.category, user.lang)} — ${money(g.amount, d.currency, user.lang)}`).join('\n');
      out = L.saved({ merchant: d.merchant.replace(/[<&>]/g, ''), total: money(d.total, d.currency, user.lang), lines });
    }
    if (status.ok) {
      return tg(env, 'editMessageText', { chat_id: msg.chat.id, message_id: status.result.message_id, text: out, parse_mode: 'HTML', reply_markup: kb });
    }
    return reply(out, { reply_markup: kb });
  }

  // Быстрый ввод суммы текстом
  const q = text && !text.startsWith('/') ? parseQuickEntry(text) : null;
  if (q && validAmount(q.amount)) {
    const rates = await getRates(env);
    const known = q.currency && isCurrency(q.currency, rates);
    const currency = known ? q.currency : user.base_currency || 'EUR';
    if (!known && q.token) q.note = `${q.token} ${q.note}`.trim();
    const kind = q.income ? 'income' : 'expense';
    const category = q.income ? categorizeIncome(q.note) : (await pickCategory(env, user.id, q.note)).category;
    await insertEntries(env, user.id, [{ date: localToday(user.tz), amount: q.amount, currency, category, note: q.note, kind, source: 'manual' }]);
    return reply((q.income ? L.savedIncome : L.savedManual)(money(q.amount, currency, user.lang), catLabel(category, user.lang)) + (q.note ? ` · ${q.note.replace(/[<&>]/g, '')}` : ''), { reply_markup: kb });
  }
  return reply(L.help, { reply_markup: kb });
}

// ---------- разовые задачи обслуживания (запускаются при публикации, каждая — один раз) ----------
const MAINTENANCE = {
  // Переименовать уже внесённые записи из чеков и выписок в бренды крупных сетей
  brands_v1: async (env) => {
    const { results } = await env.DB.prepare(
      `SELECT id, note, merchant FROM entries WHERE source IN ('receipt', 'statement') AND (note IS NOT NULL OR merchant IS NOT NULL)`
    ).all();
    const stmts = [];
    for (const e of results) {
      const note = e.note ? normalizeMerchant(e.note) : e.note;
      const merchant = e.merchant ? normalizeMerchant(e.merchant) : e.merchant;
      if (note !== e.note || merchant !== e.merchant) {
        stmts.push(env.DB.prepare('UPDATE entries SET note = ?, merchant = ? WHERE id = ?').bind(note, merchant, e.id));
      }
    }
    for (let i = 0; i < stmts.length; i += 100) await env.DB.batch(stmts.slice(i, i + 100));
    return { renamed: stmts.length };
  },
  // «Авто и топливо» разделили на «Топливо», «Обслуживание авто» и «Товары для авто»; парковки и платные дороги — в «Транспорт»
  split_car_v1: async (env) => {
    const pick = (text) => {
      const c = categorizeByRules(text);
      return ['fuel', 'car_service', 'car_goods', 'transport'].includes(c) ? c : 'car_service';
    };
    const stmts = [];
    const { results: entries } = await env.DB.prepare(`SELECT id, note, merchant FROM entries WHERE category = 'car'`).all();
    for (const e of entries) stmts.push(env.DB.prepare('UPDATE entries SET category = ? WHERE id = ?').bind(pick(`${e.note || ''} ${e.merchant || ''}`), e.id));
    const { results: rules } = await env.DB.prepare(`SELECT id, note FROM recurring WHERE category = 'car'`).all();
    for (const r of rules) stmts.push(env.DB.prepare('UPDATE recurring SET category = ? WHERE id = ?').bind(pick(r.note || ''), r.id));
    for (let i = 0; i < stmts.length; i += 100) await env.DB.batch(stmts.slice(i, i + 100));
    return { entries: entries.length, rules: rules.length };
  },
};

async function runMaintenance(env) {
  const done = {};
  for (const [key, job] of Object.entries(MAINTENANCE)) {
    const flag = `job:${key}`;
    if (await env.DB.prepare('SELECT 1 FROM settings WHERE key = ?').bind(flag).first()) continue;
    done[key] = await job(env);
    await env.DB.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, datetime('now'))`).bind(flag).run();
  }
  return { ok: true, done };
}

// ---------- админка ----------

// Подключает вебхук бота, если он не указывает на приложение. Вызывается при публикации и раз в час (самовосстановление).
async function ensureWebhook(env, origin, force = false) {
  const info = await tg(env, 'getWebhookInfo', {});
  const hookUrl = `${origin}/bot/webhook`;
  const before = info.ok ? { url: info.result.url, pending: info.result.pending_update_count, last_error: info.result.last_error_message } : info;
  if (info.ok && info.result.url === hookUrl && !force) return { ok: true, result: 'unchanged', before };
  const r = await tg(env, 'setWebhook', { url: hookUrl, secret_token: await webhookSecret(env), allowed_updates: ['message', 'my_chat_member'] });
  return { ...r, before };
}

async function handleAdmin(request, env, url) {
  if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) return fail(403, 'forbidden');
  const origin = url.origin;
  if (url.pathname === '/admin/setup') {
    const results = {};
    // Вебхук переставляем, только если он не указывает на нас: так публикация не сбрасывает сообщения в очереди
    results.webhook = await ensureWebhook(env, origin, url.searchParams.get('force') === '1');
    results.menu = await tg(env, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'Открыть', web_app: { url: origin } } });
    results.commands_ru = await tg(env, 'setMyCommands', {
      commands: [{ command: 'start', description: 'Начать' }, { command: 'report', description: 'Итоги текущего месяца' }], language_code: 'ru',
    });
    results.commands = await tg(env, 'setMyCommands', {
      commands: [{ command: 'start', description: 'Start' }, { command: 'report', description: 'This month so far' }],
    });
    await env.DB.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('app_url', ?)`).bind(origin).run();
    const ok = Object.values(results).every((r) => r.ok);
    return json({ ok, app_url: origin, results }, ok ? 200 : 500);
  }
  if (url.pathname === '/admin/stats') {
    const q = (sql, ...b) => env.DB.prepare(sql).bind(...b).first();
    const m = thisMonth();
    return json({
      users: (await q('SELECT COUNT(*) n FROM users')).n,
      active_this_month: (await q('SELECT COUNT(DISTINCT user_id) n FROM entries WHERE date >= ?', `${m}-01`)).n,
      entries: (await q('SELECT COUNT(*) n FROM entries')).n,
      recurring_rules: (await q('SELECT COUNT(*) n FROM recurring WHERE active = 1')).n,
      scans_this_month: (await q('SELECT COALESCE(SUM(scans),0) n FROM usage WHERE month = ?', m)).n,
      can_message: (await q('SELECT COUNT(*) n FROM users WHERE can_message = 1')).n,
    });
  }
  if (url.pathname === '/admin/run-reports') return json(await runMonthlyReports(env));
  if (url.pathname === '/admin/maintenance') return json(await runMaintenance(env));
  if (url.pathname === '/admin/run-nudges') return json(await runNudges(env, { anyHour: url.searchParams.get('any_hour') === '1' }));
  return fail(404, 'not_found');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith('/api/')) return await handleApi(request, env, url);
      if (url.pathname === '/bot/webhook' && request.method === 'POST') {
        if (request.headers.get('x-telegram-bot-api-secret-token') !== (await webhookSecret(env))) return fail(403, 'forbidden');
        const update = await request.json();
        // Длинная выписка читается дольше, чем живёт фоновая задача, поэтому обрабатываем сразу,
        // а от повторов Telegram защищаемся по update_id.
        if (update.update_id) {
          const ins = await env.DB.prepare('INSERT OR IGNORE INTO processed_updates (update_id) VALUES (?)').bind(update.update_id).run();
          if (!ins.meta.changes) return json({ ok: true });
        }
        try { await handleUpdate(env, update); } catch (e) { console.error('update failed', e.stack || e.message); }
        return json({ ok: true });
      }
      if (url.pathname.startsWith('/admin/')) return await handleAdmin(request, env, url);
      const shareMatch = url.pathname.match(/^\/share\/([0-9a-f]{32})\.jpg$/);
      if (shareMatch) {
        const row = await env.DB.prepare('SELECT data FROM share_images WHERE id = ?').bind(shareMatch[1]).first();
        if (!row) return new Response('Not found', { status: 404 });
        const bytes = Uint8Array.from(atob(row.data), (c) => c.charCodeAt(0));
        return new Response(bytes, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400' } });
      }
      return env.ASSETS.fetch(request);
    } catch (e) {
      console.error(e.stack || e.message);
      return fail(500, 'server_error');
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      // расписание — каждые 10 минут; почасовые задачи выполняем в первые 10 минут часа
      const hourly = new Date(event.scheduledTime || Date.now()).getUTCMinutes() < 10;
      if (hourly) {
      // регулярные платежи: несколько порций за запуск, остальное доберут следующие запуски
      let created = 0;
      for (let i = 0; i < 5; i++) {
        const n = await materialize(env, null, 300);
        created += n;
        if (n === 0) break;
      }
      if (created) console.log('recurring created', created);
      await env.DB.prepare(`DELETE FROM processed_updates WHERE at < datetime('now', '-3 days')`).run();
      await env.DB.prepare(`DELETE FROM share_images WHERE created_at < datetime('now', '-7 days')`).run();
      const appUrl = (await env.DB.prepare(`SELECT value FROM settings WHERE key = 'app_url'`).first())?.value;
      if (appUrl && env.BOT_TOKEN) {
        const w = await ensureWebhook(env, appUrl);
        if (w.result !== 'unchanged') console.log('webhook', JSON.stringify(w).slice(0, 300));
      }
      }
      const day = new Date().getUTCDate(), lastDay = new Date(Date.now() + 864e5).getUTCDate() === 1;
      // итоги месяца — с последнего дня месяца по 4-е число по UTC: так покрываются все часовые пояса
      if (lastDay || day <= 4) {
        const r = await runMonthlyReports(env);
        if (r.processed) console.log('reports', JSON.stringify(r));
      }
      if (hourly) {
        // напоминания: внутри сами проверяют местный час и дату пользователя
        const n = await runNudges(env);
        if (n.sent) console.log('nudges', JSON.stringify(n));
      }
    })());
  },
};
