// Кубышка: вклады и инвестиции. Цены бумаг берём из бесплатных источников раз в сутки (один запрос на тикер для всех).
import { toEur, fromEur, round2, baseSql } from './rates.js';

const UA = { 'user-agent': 'Mozilla/5.0 (compatible; potracheno/1.0)' };
const TICKER_RE = /^[A-Za-z0-9.\-^=:]{1,24}$/;
const DAY = 864e5;
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY);

// ---------- источники цен ----------
async function yahoo(ticker) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=5d&interval=1d`, { headers: UA });
  if (!r.ok) return null;
  const m = (await r.json())?.chart?.result?.[0]?.meta;
  if (!m || !(m.regularMarketPrice > 0) || !m.currency) return null;
  let { regularMarketPrice: price, currency } = m;
  if (currency === 'GBp' || currency === 'GBX') { price /= 100; currency = 'GBP'; } // лондонские бумаги — в пенсах
  return { price, currency: String(currency).toUpperCase(), source: 'yahoo' };
}
async function moex(sec) {
  const r = await fetch(`https://iss.moex.com/iss/engines/stock/markets/shares/securities/${encodeURIComponent(sec)}.json?iss.meta=off&iss.only=marketdata&marketdata.columns=BOARDID,LAST,MARKETPRICE`, { headers: UA });
  if (!r.ok) return null;
  const rows = (await r.json())?.marketdata?.data || [];
  const row = rows.find((x) => x[0] === 'TQBR' && (x[1] || x[2])) || rows.find((x) => x[1] || x[2]);
  const price = row && (row[1] || row[2]);
  return price > 0 ? { price, currency: 'RUB', source: 'moex' } : null;
}
async function stooq(ticker) {
  const sym = (ticker.includes('.') ? ticker : `${ticker}.us`).toLowerCase();
  const r = await fetch(`https://stooq.com/q/l/?s=${encodeURIComponent(sym)}&f=sc&h&e=csv`, { headers: UA });
  if (!r.ok) return null;
  const line = (await r.text()).trim().split('\n')[1] || '';
  const price = Number(line.split(',')[1]);
  return price > 0 ? { price, currency: null, source: 'stooq' } : null; // валюта в этом источнике не указана
}
export async function fetchQuote(ticker) {
  try {
    if (ticker.startsWith('MOEX:')) return await moex(ticker.slice(5));
    const y = await yahoo(ticker).catch(() => null);
    return y || (await stooq(ticker).catch(() => null));
  } catch { return null; }
}

// Обновляем устаревшие цены (старше 20 часов); за запуск — не больше limit тикеров (лимит внешних запросов)
export async function updatePrices(env, { limit = 30, tickers = null } = {}) {
  const stale = `(p.at IS NULL OR p.at < datetime('now', '-20 hours')) AND (p.tried IS NULL OR p.tried < datetime('now', '-3 hours'))`;
  const { results } = tickers
    ? { results: tickers.map((t) => ({ ticker: t })) }
    : await env.DB.prepare(`SELECT DISTINCT h.ticker FROM holdings h LEFT JOIN prices p ON p.ticker = h.ticker WHERE h.ticker IS NOT NULL AND ${stale} LIMIT ?`).bind(limit).all();
  let ok = 0, failed = 0;
  for (const { ticker } of results) {
    const q = await fetchQuote(ticker);
    if (q) {
      await env.DB.prepare(`INSERT INTO prices (ticker, price, currency, source, at, tried) VALUES (?1, ?2, ?3, ?4, datetime('now'), datetime('now'))
        ON CONFLICT(ticker) DO UPDATE SET price = ?2, currency = COALESCE(?3, currency), source = ?4, at = datetime('now'), tried = datetime('now')`)
        .bind(ticker, q.price, q.currency, q.source).run();
      ok++;
    } else {
      await env.DB.prepare(`INSERT INTO prices (ticker, tried) VALUES (?1, datetime('now')) ON CONFLICT(ticker) DO UPDATE SET tried = datetime('now')`).bind(ticker).run();
      failed++;
    }
  }
  return { checked: results.length, ok, failed };
}

// ---------- расчёт позиции ----------
function compute(h, price, today) {
  let value, note = null;
  if (h.kind === 'saving') {
    const end = h.ends && h.ends < today ? h.ends : today;
    const days = Math.max(0, daysBetween(h.accr_from || h.opened, end));
    value = h.principal * (1 + ((h.rate || 0) / 100) * days / 365);
  } else if (h.ticker) {
    value = price && price.price ? h.qty * price.price : null;
    note = price && price.at ? price.at.slice(0, 10) : null;
  } else {
    value = h.value;
    note = h.value_at ? h.value_at.slice(0, 10) : null;
  }
  const gain = value === null ? null : value - h.invested;
  const days = Math.max(1, daysBetween(h.opened, today));
  let yearly = null;
  if (h.kind === 'saving') yearly = h.rate || 0;
  else if (value !== null && h.invested > 0 && days >= 60) yearly = (Math.pow(value / h.invested, 365 / days) - 1) * 100;
  return { value, gain, pct: value !== null && h.invested > 0 ? (gain / h.invested) * 100 : null, yearly, updated: note, days };
}

const norm = (v, from, base, rates) => (v === null || v === undefined ? null : from === base ? v : fromEur(toEur(v, from, rates), base, rates));

async function build(env, user, rates, today) {
  const base = user.base_currency || 'EUR';
  const [hl, pl] = await Promise.all([
    env.DB.prepare('SELECT * FROM holdings WHERE user_id = ? ORDER BY opened DESC, created_at DESC').bind(user.id).all(),
    env.DB.prepare('SELECT p.* FROM prices p WHERE p.ticker IN (SELECT ticker FROM holdings WHERE user_id = ? AND ticker IS NOT NULL)').bind(user.id).all(),
  ]);
  const prices = Object.fromEntries(pl.results.map((p) => [p.ticker, p]));
  const items = hl.results.map((h) => {
    const c = compute(h, prices[h.ticker], today);
    const b = (v) => (v === null ? null : round2(norm(v, h.currency, base, rates)));
    return {
      id: h.id, kind: h.kind, name: h.name, currency: h.currency, ticker: h.ticker, qty: h.qty, rate: h.rate, ends: h.ends, opened: h.opened,
      invested: round2(h.invested), value: c.value === null ? null : round2(c.value), gain: c.gain === null ? null : round2(c.gain),
      pct: c.pct === null ? null : Math.round(c.pct * 10) / 10, yearly: c.yearly === null ? null : Math.round(c.yearly * 10) / 10,
      updated: c.updated, price: prices[h.ticker] ? prices[h.ticker].price : null, priceFail: !!h.ticker && !(prices[h.ticker] && prices[h.ticker].price),
      value_base: b(c.value), invested_base: b(h.invested), gain_base: b(c.gain),
    };
  });
  const sum = (kind, f) => round2(items.filter((i) => i.kind === kind).reduce((s, i) => s + (i[f] || 0), 0));
  const totals = {
    savings: sum('saving', 'value_base'), invest: sum('invest', 'value_base'),
    invested: round2(sum('saving', 'invested_base') + sum('invest', 'invested_base')),
    gain: round2(sum('saving', 'gain_base') + sum('invest', 'gain_base')),
  };
  totals.total = round2(totals.savings + totals.invest);
  totals.pct = totals.invested > 0 ? Math.round((totals.gain / totals.invested) * 1000) / 10 : null;
  totals.investInvested = sum('invest', 'invested_base');
  totals.investGain = sum('invest', 'gain_base');
  totals.investPct = totals.investInvested > 0 ? Math.round((totals.investGain / totals.investInvested) * 1000) / 10 : null;
  totals.savingsGain = sum('saving', 'gain_base');
  // подушка: на сколько месяцев обычных расходов хватит сбережений (средние траты за 3 прошлых месяца)
  const bs = baseSql(base, rates);
  const m0 = `${today.slice(0, 7)}-01`, m3 = new Date(Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 4, 1)).toISOString().slice(0, 10);
  const row = await env.DB.prepare(`SELECT SUM(${bs.expr}) AS s FROM entries WHERE user_id = ? AND kind = 'expense' AND date >= ? AND date < ?`).bind(...bs.args, user.id, m3, m0).first();
  const avg = row && row.s ? row.s / 3 : 0;
  totals.cushion = avg > 0 && totals.savings > 0 ? Math.round((totals.savings / avg) * 10) / 10 : null;
  return { base, items, totals };
}

// ---------- API ----------
const validDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`));
const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

export async function handlePiggy(env, user, path, method, body, { json, fail, rates, today, isCurrency }) {
  if (path === '/piggy' && method === 'GET') return json(await build(env, user, rates, today));

  if (path === '/piggy/refresh' && method === 'POST') {
    const { results } = await env.DB.prepare('SELECT DISTINCT ticker FROM holdings WHERE user_id = ? AND ticker IS NOT NULL LIMIT 12').bind(user.id).all();
    const r = await updatePrices(env, { tickers: results.map((x) => x.ticker) });
    return json({ ...r, ...(await build(env, user, rates, today)) });
  }

  if (path === '/piggy' && method === 'POST') {
    const kind = body.kind === 'invest' ? 'invest' : 'saving';
    const name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (!name) return fail(400, 'bad_name');
    const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM holdings WHERE user_id = ?').bind(user.id).first();
    if (count.n >= 60) return fail(400, 'too_many');
    const opened = validDate(body.opened) ? body.opened : today;
    const row = { id: crypto.randomUUID(), kind, name, opened, currency: String(body.currency || user.base_currency || 'EUR'), invested: 0,
      principal: null, rate: null, accr_from: null, ends: null, ticker: null, qty: null, value: null, value_at: null };
    if (!isCurrency(row.currency, rates)) return fail(400, 'bad_currency');
    const invested = num(body.invested);
    if (!(invested >= 0 && invested < 1e12)) return fail(400, 'bad_amount');
    row.invested = invested;
    if (kind === 'saving') {
      if (!(invested > 0)) return fail(400, 'bad_amount');
      const rate = num(body.rate) ?? 0;
      if (!(rate >= 0 && rate <= 100)) return fail(400, 'bad_rate');
      row.principal = invested; row.rate = rate; row.accr_from = opened;
      row.ends = validDate(body.ends) && body.ends > opened ? body.ends : null;
    } else {
      const ticker = String(body.ticker || '').trim().toUpperCase().replace(/^MOEX:/, 'MOEX:');
      if (ticker) {
        if (!TICKER_RE.test(ticker)) return fail(400, 'bad_ticker');
        const qty = num(body.qty);
        if (!(qty > 0 && qty < 1e12)) return fail(400, 'bad_qty');
        const q = await fetchQuote(ticker);
        if (!q) return fail(404, 'ticker_not_found', 'Could not find a price for this ticker');
        row.ticker = ticker; row.qty = qty;
        if (q.currency) row.currency = q.currency; // валюта позиции — валюта котировки
        if (!isCurrency(row.currency, rates)) return fail(400, 'bad_currency');
        await env.DB.prepare(`INSERT INTO prices (ticker, price, currency, source, at, tried) VALUES (?1, ?2, ?3, ?4, datetime('now'), datetime('now'))
          ON CONFLICT(ticker) DO UPDATE SET price = ?2, currency = COALESCE(?3, currency), source = ?4, at = datetime('now'), tried = datetime('now')`)
          .bind(ticker, q.price, q.currency, q.source).run();
      } else {
        const value = num(body.value);
        if (!(value >= 0 && value < 1e12)) return fail(400, 'bad_amount');
        row.value = value; row.value_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
      }
    }
    await env.DB.prepare(`INSERT INTO holdings (id, user_id, kind, name, currency, invested, principal, rate, accr_from, ends, ticker, qty, value, value_at, opened)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(row.id, user.id, row.kind, row.name, row.currency, row.invested, row.principal, row.rate, row.accr_from, row.ends, row.ticker, row.qty, row.value, row.value_at, row.opened).run();
    return json({ ok: true, id: row.id });
  }

  const m = path.match(/^\/piggy\/([0-9a-f-]{36})(\/topup|\/value)?$/);
  if (!m) return null;
  const h = await env.DB.prepare('SELECT * FROM holdings WHERE id = ? AND user_id = ?').bind(m[1], user.id).first();
  if (!h) return fail(404, 'not_found');

  if (!m[2] && method === 'DELETE') {
    await env.DB.prepare('DELETE FROM holdings WHERE id = ? AND user_id = ?').bind(h.id, user.id).run();
    return json({ ok: true });
  }
  if (!m[2] && method === 'PATCH') {
    const name = String(body.name ?? h.name).replace(/\s+/g, ' ').trim().slice(0, 40);
    if (!name) return fail(400, 'bad_name');
    let rate = h.rate, ends = h.ends;
    if (h.kind === 'saving') {
      if (body.rate !== undefined) { rate = num(body.rate) ?? 0; if (!(rate >= 0 && rate <= 100)) return fail(400, 'bad_rate'); }
      if (body.ends !== undefined) ends = validDate(body.ends) ? body.ends : null;
    }
    await env.DB.prepare('UPDATE holdings SET name = ?, rate = ?, ends = ? WHERE id = ?').bind(name, rate, ends, h.id).run();
    return json({ ok: true });
  }
  // пополнение: вклад — проценты до сегодня «закрепляются» и дальше идут уже с новой суммы; бумаги — докупили qty на amount
  if (m[2] === '/topup' && method === 'POST') {
    const amount = num(body.amount);
    if (!(amount > 0 && amount < 1e12)) return fail(400, 'bad_amount');
    if (h.kind === 'saving') {
      const c = compute(h, null, today);
      await env.DB.prepare('UPDATE holdings SET principal = ?, accr_from = ?, invested = invested + ? WHERE id = ?').bind(c.value + amount, today, amount, h.id).run();
    } else if (h.ticker) {
      const qty = num(body.qty);
      if (!(qty > 0 && qty < 1e12)) return fail(400, 'bad_qty');
      await env.DB.prepare('UPDATE holdings SET qty = qty + ?, invested = invested + ? WHERE id = ?').bind(qty, amount, h.id).run();
    } else {
      await env.DB.prepare("UPDATE holdings SET invested = invested + ?, value = COALESCE(value, 0) + ?, value_at = datetime('now') WHERE id = ?").bind(amount, amount, h.id).run();
    }
    return json({ ok: true });
  }
  // ручное обновление стоимости (для позиций без тикера)
  if (m[2] === '/value' && method === 'POST') {
    if (h.kind !== 'invest' || h.ticker) return fail(400, 'not_manual');
    const value = num(body.value);
    if (!(value >= 0 && value < 1e12)) return fail(400, 'bad_amount');
    await env.DB.prepare("UPDATE holdings SET value = ?, value_at = datetime('now') WHERE id = ?").bind(value, h.id).run();
    return json({ ok: true });
  }
  return null;
}
