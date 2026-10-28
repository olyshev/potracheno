// Курсы валют к евро. Берём раз в день из бесплатного open.er-api.com (без ключа, есть рубль),
// храним в базе; если источник недоступен — последний сохранённый курс, в крайнем случае запасная таблица.
export const CURRENCIES = ['EUR', 'USD', 'RUB', 'GBP', 'CHF', 'AED', 'TRY', 'RSD', 'GEL', 'AMD', 'KZT', 'UAH', 'BYN', 'PLN', 'CZK', 'HUF', 'SEK', 'NOK', 'DKK', 'CAD', 'ILS', 'CNY', 'JPY', 'THB', 'IDR', 'VND', 'INR', 'MXN', 'BRL', 'ARS', 'UZS', 'KGS', 'AZN', 'MDL', 'ALL'];

// Приблизительные курсы (единиц валюты за 1 EUR) — используются только если сеть недоступна совсем.
const FALLBACK = {
  EUR: 1, USD: 1.08, RUB: 95, GBP: 0.85, CHF: 0.95, AED: 3.97, TRY: 37, RSD: 117, GEL: 2.95, AMD: 420,
  KZT: 540, UAH: 45, BYN: 3.5, PLN: 4.3, CZK: 25, HUF: 395, SEK: 11.3, NOK: 11.6, DKK: 7.46, CAD: 1.48,
  ILS: 4.0, CNY: 7.8, JPY: 165, THB: 38, IDR: 17500, VND: 27500, INR: 92, MXN: 20, BRL: 6, ARS: 1050,
  UZS: 13700, KGS: 94, AZN: 1.84, MDL: 19.3, ALL: 98,
};

let memo = null; // кэш на время жизни воркера

export async function getRates(env) {
  const day = new Date().toISOString().slice(0, 10);
  if (memo && memo.day === day) return memo.rates;
  const row = await env.DB.prepare('SELECT json FROM rates WHERE day = ?').bind(day).first();
  if (row) {
    memo = { day, rates: JSON.parse(row.json) };
    return memo.rates;
  }
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/EUR', { cf: { cacheTtl: 3600 } });
    const j = await r.json();
    if (j && j.result === 'success' && j.rates && j.rates.USD) {
      const rates = { ...FALLBACK, ...j.rates, EUR: 1 };
      await env.DB.prepare('INSERT OR REPLACE INTO rates (day, json) VALUES (?, ?)').bind(day, JSON.stringify(rates)).run();
      memo = { day, rates };
      return rates;
    }
  } catch (e) {
    console.warn('rates fetch failed', e && e.message);
  }
  const last = await env.DB.prepare('SELECT json FROM rates ORDER BY day DESC LIMIT 1').first();
  const rates = last ? JSON.parse(last.json) : FALLBACK;
  memo = { day, rates };
  return rates;
}

export const isCurrency = (c, rates) => typeof c === 'string' && /^[A-Z]{3}$/.test(c) && !!rates[c];
export const toEur = (amount, cur, rates) => round2(amount / (rates[cur] || 1));
export const fromEur = (eur, cur, rates) => eur * (rates[cur] || 1);
export const round2 = (n) => Math.round(n * 100) / 100;
