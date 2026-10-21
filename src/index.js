// Потрачено — сервер мини-аппа учёта расходов (Cloudflare Worker).
// Маршруты:
//   /api/*          — API для мини-аппа (авторизация через подпись Telegram initData)
//   /bot/webhook    — входящие сообщения боту (фото чеков, быстрый ввод «4,50 кофе», /start, /report)
//   /admin/setup    — разовая настройка бота после деплоя (?key=ADMIN_KEY)
//   /admin/stats    — простая статистика для владельца (?key=ADMIN_KEY)
//   cron            — регулярные платежи (каждый час) и рассылка итогов месяца (1–2 числа)
import { verifyInitData, webhookSecret } from './auth.js';
import { CATEGORIES, INCOME_CATEGORIES, isCategory, isCategoryFor, categorizeByRules, categorizeIncome, catLabel } from './categories.js';
import { materialize, upcoming, listRules, createRule, dueDate } from './recurring.js';
import { shiftMonth } from './report.js';
const prevMonth = (m) => shiftMonth(m, -1);
import { getRates, isCurrency, toEur, fromEur, round2, CURRENCIES } from './rates.js';
import { parseReceipt, receiptToDraft, suggestCategory } from './ai.js';
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
  await env.DB.prepare(
    `INSERT INTO users (id, first_name, username, lang, last_seen, can_message)
     VALUES (?1, ?2, ?3, ?4, datetime('now'), ?5)
     ON CONFLICT(id) DO UPDATE SET first_name = ?2, username = ?3, last_seen = datetime('now'),
       can_message = MAX(can_message, ?5)`
  ).bind(tgUser.id, tgUser.first_name || '', tgUser.username || '', langOf(tgUser.language_code), extra.canMessage ? 1 : 0).run();
  return env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(tgUser.id).first();
}

async function getUsage(env, userId) {
  const row = await env.DB.prepare('SELECT scans, suggests FROM usage WHERE user_id = ? AND month = ?').bind(userId, thisMonth()).first();
  return { scans: row?.scans || 0, suggests: row?.suggests || 0 };
}
async function bumpUsage(env, userId, field) {
  await env.DB.prepare(
    `INSERT INTO usage (user_id, month, ${field}) VALUES (?, ?, 1)
     ON CONFLICT(user_id, month) DO UPDATE SET ${field} = ${field} + 1`
  ).bind(userId, thisMonth()).run();
}
const scanLimit = (env) => Number(env.FREE_SCANS_PER_MONTH || 60);

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
  if (stmts.length) await env.DB.batch(stmts);
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

async function scanReceipt(env, user, base64, mediaType) {
  const usage = await getUsage(env, user.id);
  if (usage.scans >= scanLimit(env)) return { error: 'limit' };
  let parsed;
  try {
    parsed = await parseReceipt(env, base64, mediaType);
  } catch (e) {
    console.error('receipt parse failed', e.message);
    return { error: 'ai' };
  }
  await bumpUsage(env, user.id, 'scans');
  const draft = receiptToDraft(parsed, user.base_currency || 'EUR');
  if (!draft) return { error: 'not_receipt' };
  const rates = await getRates(env);
  if (!isCurrency(draft.currency, rates)) draft.currency = user.base_currency || 'EUR';
  if (!draft.date || !validDate(draft.date)) draft.date = today();
  return { draft, scansLeft: Math.max(0, scanLimit(env) - usage.scans - 1) };
}

// ---------- API мини-аппа ----------

async function handleApi(request, env, url) {
  const tgUser = await authUser(request, env);
  if (!tgUser) return fail(401, 'unauthorized', 'Open the app from Telegram');
  const user = await upsertUser(env, tgUser);
  const path = url.pathname.replace(/^\/api/, '');
  const method = request.method;
  const body = method === 'POST' || method === 'PATCH' ? await request.json().catch(() => ({})) : {};

  if (path === '/me' && method === 'GET') {
    const [usage, cnt] = await Promise.all([
      getUsage(env, user.id),
      env.DB.prepare('SELECT COUNT(*) AS n FROM entries WHERE user_id = ?').bind(user.id).first(),
    ]);
    return json({
      user: { id: user.id, first_name: user.first_name, lang: user.lang, base_currency: user.base_currency, can_message: !!user.can_message },
      categories: CATEGORIES,
      income_categories: INCOME_CATEGORIES,
      currencies: CURRENCIES,
      limits: { scans: scanLimit(env), scansUsed: usage.scans },
      hasEntries: cnt.n > 0,
      today: today(),
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
    if (typeof body.can_message === 'boolean') {
      await env.DB.prepare('UPDATE users SET can_message = ? WHERE id = ?').bind(body.can_message ? 1 : 0, user.id).run();
    }
    return json({ ok: true });
  }

  if (path === '/summary' && method === 'GET') {
    const month = MONTH_RE.test(url.searchParams.get('month') || '') ? url.searchParams.get('month') : thisMonth();
    const base = user.base_currency || 'EUR';
    await materialize(env, user.id); // регулярные платежи, у которых наступил день
    const isCurrent = month === thisMonth();
    const [summary, list, rates, next] = await Promise.all([
      monthSummary(env, user.id, month, base),
      env.DB.prepare(
        `SELECT e.id, e.date, e.amount, e.currency, e.amount_eur, e.category, e.note, e.merchant, e.receipt_id, e.source, e.kind,
                e.recurring_id, r.day AS rec_day, r.active AS rec_active
         FROM entries e LEFT JOIN recurring r ON r.id = e.recurring_id
         WHERE e.user_id = ? AND e.date >= ? AND e.date <= ? ORDER BY e.date DESC, e.created_at DESC LIMIT 1000`
      ).bind(user.id, `${month}-01`, `${month}-31`).all(),
      getRates(env),
      isCurrent ? upcoming(env, user.id, base) : [],
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
    const date = validDate(body.date) ? body.date : today();
    const note = String(body.note || '').trim().slice(0, 120);
    const category = isCategoryFor(kind, body.category) ? body.category
      : kind === 'income' ? categorizeIncome(note) : (await pickCategory(env, user.id, note)).category;
    let recurring_id = null;
    if (body.recurring) {
      const day = validDay(Number(body.recurring.day)) ? Number(body.recurring.day) : Number(date.slice(8, 10));
      // запись этого месяца создаём сейчас, правило подхватит следующие месяцы
      recurring_id = await createRule(env, user.id, { kind, amount, currency, category, note, day, lastMonth: date.slice(0, 7) });
    }
    await insertEntries(env, user.id, [{ date, amount, currency, category, note, kind, recurring_id, source: 'manual' }]);
    return json({ ok: true, category, recurring_id });
  }

  if (path === '/recurring' && method === 'GET') {
    return json({ rules: await listRules(env, user.id, user.base_currency || 'EUR') });
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
    const active = typeof body.active === 'boolean' ? (body.active ? 1 : 0) : r.active;
    let last = r.last_month;
    // После паузы задним числом ничего не создаём: если в этом месяце день платежа уже прошёл,
    // следующий платёж будет в следующем месяце, иначе — в этом.
    if (active && !r.active) last = dueDate(thisMonth(), day) < today() ? thisMonth() : prevMonth(thisMonth());
    await env.DB.prepare(
      `UPDATE recurring SET amount = ?, currency = ?, category = ?, note = ?, day = ?, active = ?, last_month = ? WHERE id = ? AND user_id = ?`
    ).bind(round2(amount), currency, isCategoryFor(r.kind, body.category) ? body.category : r.category,
      body.note !== undefined ? String(body.note).trim().slice(0, 120) : r.note, day, active, last, r.id, user.id).run();
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
      const rule = recurringId ? await env.DB.prepare('SELECT id FROM recurring WHERE id = ? AND user_id = ?').bind(recurringId, user.id).first() : null;
      if (rule) {
        stmts.push(env.DB.prepare('UPDATE recurring SET day = ? WHERE id = ?').bind(day, rule.id));
      } else {
        const lastMonth = date.slice(0, 7) > thisMonth() ? thisMonth() : (date.slice(0, 7) < thisMonth() && dueDate(thisMonth(), day) <= today() ? prevMonth(thisMonth()) : date.slice(0, 7));
        recurringId = await createRule(env, user.id, { kind: e.kind, amount, currency, category, note, day, lastMonth });
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

  if (path === '/suggest' && method === 'POST') {
    return json(await pickCategory(env, user.id, String(body.text || '').slice(0, 120)));
  }

  if (path === '/receipt/scan' && method === 'POST') {
    const mediaType = ['image/jpeg', 'image/png', 'image/webp'].includes(body.media_type) ? body.media_type : 'image/jpeg';
    if (typeof body.image !== 'string' || body.image.length < 100) return fail(400, 'no_image');
    if (body.image.length > 6_500_000) return fail(413, 'too_big');
    const r = await scanReceipt(env, user, body.image, mediaType);
    if (r.error === 'limit') return fail(429, 'limit', `Monthly limit of ${scanLimit(env)} receipts reached`);
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
    const date = validDate(body.date) ? body.date : today();
    const merchant = String(body.merchant || '').trim().slice(0, 60);
    const receipt_id = crypto.randomUUID();
    await insertEntries(env, user.id, groups.map((g) => ({
      date, amount: g.amount, currency, category: g.category, note: g.note || merchant, merchant, receipt_id, source: 'receipt',
    })));
    return json({ ok: true, receipt_id });
  }

  if (path === '/export' && method === 'POST') {
    const { results } = await env.DB.prepare(
      `SELECT date, kind, amount, currency, amount_eur, category, note, merchant, source FROM entries WHERE user_id = ? ORDER BY date`
    ).bind(user.id).all();
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = '\ufeffdate,type,amount,currency,amount_eur,category,note,merchant,source\n' +
      results.map((r) => [r.date, r.kind, r.amount, r.currency, r.amount_eur, catLabel(r.category, user.lang).replace(/^\S+\s/, ''), r.note, r.merchant, r.source].map(q).join(',')).join('\n');
    const res = await sendDocument(env, user.id, `expenses-${today()}.csv`, csv, user.lang === 'ru' ? 'Все ваши доходы и траты' : 'All your income and expenses');
    if (!res.ok) return fail(409, 'cant_message', 'Start the bot first');
    return json({ ok: true });
  }

  if (path === '/me' && method === 'DELETE') {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM entries WHERE user_id = ?').bind(user.id),
      env.DB.prepare('DELETE FROM recurring WHERE user_id = ?').bind(user.id),
      env.DB.prepare('DELETE FROM usage WHERE user_id = ?').bind(user.id),
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
    start: (name) => `Привет${name ? `, ${name}` : ''}! Я помогаю вести учёт расходов.\n\n📷 Пришлите фото чека — я разберу его по категориям.\n✏️ Или напишите сумму и что купили, например: <code>4,50 кофе</code> или <code>120 USD отель</code>.\n💰 Доход — с плюсом: <code>+2500 зарплата</code>.\n📊 1-го числа пришлю итоги месяца.\n\nВсё подробно — в приложении:`,
    open: 'Открыть',
    reading: '🔍 Читаю чек…',
    saved: (d) => `✅ Записал чек${d.merchant ? ` «${d.merchant}»` : ''} на ${d.total}:\n${d.lines}`,
    savedManual: (sum, cat) => `✅ ${sum} — ${cat}`,
    savedIncome: (sum, cat) => `💰 Доход ${sum} — ${cat}`,
    notReceipt: 'Не похоже на чек. Попробуйте сфотографировать ровнее и при хорошем свете.',
    limit: (n) => `В этом месяце уже распознано ${n} чеков — это лимит. Суммы можно вносить вручную.`,
    aiError: 'Не получилось распознать чек, попробуйте ещё раз чуть позже.',
    help: 'Пришлите фото чека или напишите сумму с описанием, например: <code>12,90 продукты</code>. Доход — с плюсом: <code>+2500 зарплата</code>',
    empty: 'В этом месяце пока нет записей.',
    fix: 'Поправить',
  },
  en: {
    start: (name) => `Hi${name ? `, ${name}` : ''}! I help you track your spending.\n\n📷 Send a photo of a receipt and I'll split it into categories.\n✏️ Or type an amount and what it was, e.g. <code>4.50 coffee</code> or <code>120 USD hotel</code>.\n💰 Income starts with a plus: <code>+2500 salary</code>.\n📊 On the 1st I'll send you a monthly wrap-up.\n\nEverything else is in the app:`,
    open: 'Open',
    reading: '🔍 Reading the receipt…',
    saved: (d) => `✅ Saved${d.merchant ? ` “${d.merchant}”` : ''}, ${d.total}:\n${d.lines}`,
    savedManual: (sum, cat) => `✅ ${sum} — ${cat}`,
    savedIncome: (sum, cat) => `💰 Income ${sum} — ${cat}`,
    notReceipt: "That doesn't look like a receipt. Try a straighter photo in good light.",
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
  if (text.startsWith('/start')) return reply(L.start(msg.from.first_name), { reply_markup: kb });
  if (text.startsWith('/report')) {
    const s = await monthSummary(env, user.id, thisMonth(), user.base_currency || 'EUR');
    return reply(s.count ? reportText(s, user.lang) : L.empty, { reply_markup: kb });
  }

  // Фото чека: как фото или как файл-картинка
  const photo = msg.photo?.length ? msg.photo[msg.photo.length - 1] : null;
  const doc = msg.document && /^image\/(jpeg|png|webp)$/.test(msg.document.mime_type || '') ? msg.document : null;
  if (photo || doc) {
    const fileSize = (photo || doc).file_size || 0;
    if (fileSize > 4_800_000) return reply(L.aiError);
    const status = await reply(L.reading);
    const { base64 } = await downloadFile(env, (photo || doc).file_id);
    const mediaType = doc ? doc.mime_type : 'image/jpeg';
    const r = await scanReceipt(env, user, base64, mediaType);
    let out;
    if (r.error === 'limit') out = L.limit(scanLimit(env));
    else if (r.error === 'not_receipt') out = L.notReceipt;
    else if (r.error) out = L.aiError;
    else {
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
    await insertEntries(env, user.id, [{ date: today(), amount: q.amount, currency, category, note: q.note, kind, source: 'manual' }]);
    return reply((q.income ? L.savedIncome : L.savedManual)(money(q.amount, currency, user.lang), catLabel(category, user.lang)) + (q.note ? ` · ${q.note.replace(/[<&>]/g, '')}` : ''), { reply_markup: kb });
  }
  return reply(L.help, { reply_markup: kb });
}

// ---------- админка ----------

async function handleAdmin(request, env, url) {
  if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) return fail(403, 'forbidden');
  const origin = url.origin;
  if (url.pathname === '/admin/setup') {
    const secret = await webhookSecret(env);
    const results = {};
    results.webhook = await tg(env, 'setWebhook', {
      url: `${origin}/bot/webhook`, secret_token: secret, allowed_updates: ['message', 'my_chat_member'], drop_pending_updates: true,
    });
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
        // Отвечаем Telegram сразу, а чек обрабатываем в фоне — иначе он будет слать повторы.
        ctx.waitUntil(handleUpdate(env, update).catch((e) => console.error('update failed', e.stack || e.message)));
        return json({ ok: true });
      }
      if (url.pathname.startsWith('/admin/')) return await handleAdmin(request, env, url);
      return env.ASSETS.fetch(request);
    } catch (e) {
      console.error(e.stack || e.message);
      return fail(500, 'server_error');
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      // регулярные платежи: несколько порций за запуск, остальное доберут следующие запуски
      let created = 0;
      for (let i = 0; i < 5; i++) {
        const n = await materialize(env, null, 300);
        created += n;
        if (n === 0) break;
      }
      if (created) console.log('recurring created', created);
      const day = new Date().getUTCDate();
      if (day === 1 || day === 2) console.log('reports', JSON.stringify(await runMonthlyReports(env)));
    })());
  },
};
