// Нейросеть: распознавание чеков, скриншотов из банковских приложений и выписок, подсказка категории.
// Используется Claude API с принудительным вызовом инструмента — так ответ всегда приходит строгим JSON.
import { CATEGORY_IDS, CATEGORIES, INCOME_CATEGORIES, INCOME_IDS } from './categories.js';

const API = 'https://api.anthropic.com/v1/messages';

const CATEGORY_GUIDE = CATEGORIES.map((c) => `${c.id} = ${c.en}`).join('; ');
const INCOME_GUIDE = INCOME_CATEGORIES.map((c) => `${c.id} = ${c.en}`).join('; ');

const DOCUMENT_TOOL = {
  name: 'record_document',
  description: 'Record what the uploaded image(s) or PDF contain: a single purchase receipt, or a list of bank/card transactions.',
  input_schema: {
    type: 'object',
    properties: {
      doc_type: {
        type: 'string', enum: ['receipt', 'transactions', 'other'],
        description: 'receipt = one purchase with line items (paper receipt, invoice, bill). transactions = a list of operations from a bank app, card history, account statement or certificate. other = neither, or unreadable.',
      },
      // --- чек
      merchant: { type: 'string', description: 'receipt only: store or company name as printed, short' },
      date: { type: 'string', description: 'receipt only: purchase date YYYY-MM-DD, empty string if not visible' },
      currency: { type: 'string', description: 'ISO 4217 code. Infer from symbols, country, language (€ in Spain → EUR, ₽/руб → RUB)' },
      total: { type: 'number', description: 'receipt only: final amount actually paid, after discounts' },
      items: {
        type: 'array',
        description: 'receipt only: line items. Discounts as negative amounts. Max 60 items; merge trivial duplicates.',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Short human-readable item name in the receipt language' },
            amount: { type: 'number', description: 'Line total paid for this item' },
            category: { type: 'string', enum: CATEGORY_IDS },
          },
          required: ['name', 'amount', 'category'],
        },
      },
      // --- операции
      source: { type: 'string', description: 'transactions only: bank or app name if visible, short' },
      transactions: {
        type: 'array',
        description: 'transactions only: every completed operation visible, oldest or newest first — any order. Max 300.',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'YYYY-MM-DD' },
            description: { type: 'string', description: 'Merchant or counterparty, cleaned up and short (e.g. "Mercadona", "Glovo", "Перевод от Анны"). No card numbers, no long reference codes.' },
            amount: { type: 'number', description: 'Positive number: amount charged or received in the account currency' },
            currency: { type: 'string', description: 'ISO 4217 code of that amount' },
            kind: { type: 'string', enum: ['expense', 'income', 'transfer'], description: 'transfer = moving money between the user’s own accounts/cards/savings, card top-ups, investment account funding, ATM cash withdrawal' },
            category: { type: 'string', enum: [...CATEGORY_IDS, ...INCOME_IDS], description: 'expense category for expenses, income category for income, "other" for transfers' },
          },
          required: ['date', 'description', 'amount', 'currency', 'kind', 'category'],
        },
      },
    },
    required: ['doc_type'],
  },
};

const documentSystem = (today) => `You read photos of shopping receipts, screenshots of banking apps and card histories, and bank statements (images or PDF), and extract them precisely. Today is ${today}.

Expense categories: ${CATEGORY_GUIDE}.
Income categories: ${INCOME_GUIDE}.

Category hints: food or grocery delivery services (Glovo, Uber Eats, Just Eat, Deliveroo, Wolt, Яндекс Еда, Самокат, Купер) → delivery; ride-hailing and taxis (Uber rides, Cabify, Bolt, FreeNow, Yango, Яндекс Go) → taxi; per-minute car rental (Zity, Share Now, Free2Move, WiBLE, Делимобиль, Яндекс Драйв, Ситидрайв) → carsharing; public transport, trains, e-scooters → transport; fuel, parking, tolls, car service → car; supermarkets → groceries; restaurants, bars, coffee shops → cafe; gyms, fitness clubs, pools, sports classes and coaches, sports equipment and stores (Decathlon), padel/tennis courts, ski passes → sport; streaming and apps → subscriptions.

For a receipt (doc_type=receipt):
- Categorize each line item on its own: in a supermarket, food → groceries, detergent → household, shampoo → beauty, pet food → pets.
- A restaurant or bar bill is entirely "cafe". A pharmacy receipt is "health" unless items are clearly cosmetics.
- Use the amount actually charged per line (quantity × unit price). Ignore VAT tables, change given, card slips.
- If there are no readable items, return one item with the merchant name and the total.

For transactions (doc_type=transactions):
- Include only completed operations. Skip declined, cancelled, reversed and pending-then-cancelled ones, and skip balance lines, fees summaries and totals rows.
- If several screenshots overlap, list each real operation only once.
- Dates often lack a year: use the most recent past date that fits (never a date after today). Resolve relative labels like "Сегодня", "Вчера", "Today", "Hoy", "Ayer" against today.
- Money out → expense; money in → income (salary → salary, refunds and cashback → refund, transfers from other people → transfer_in, interest/dividends → investments).
- Moving money between the user's own accounts, cards or savings, topping up a card or wallet, funding a brokerage account, ATM cash withdrawals → kind=transfer, category=other.
- Amounts are positive; the kind carries the direction.

Never invent numbers you cannot read. If the content is neither a receipt nor transactions, set doc_type=other.`;

const MAX_DOC_TOKENS = 16000;

// files: [{ data: base64, media_type: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf' }]
export async function parseDocument(env, files, today) {
  if (env.MOCK_AI === '1') return files.some((f) => f.media_type === 'application/pdf') ? mockTransactions(today) : mockReceipt();
  const content = files.map((f) => f.media_type === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: f.data } }
    : { type: 'image', source: { type: 'base64', media_type: f.media_type, data: f.data } });
  content.push({ type: 'text', text: files.length > 1 ? `Extract these ${files.length} files as one document.` : 'Extract this.' });
  return callClaude(env, {
    max_tokens: MAX_DOC_TOKENS,
    system: documentSystem(today),
    tools: [DOCUMENT_TOOL],
    tool_choice: { type: 'tool', name: 'record_document' },
    messages: [{ role: 'user', content }],
  });
}

const SUGGEST_TOOL = {
  name: 'set_category',
  description: 'Pick the spending category for a short expense description.',
  input_schema: {
    type: 'object',
    properties: { category: { type: 'string', enum: CATEGORY_IDS } },
    required: ['category'],
  },
};

async function callClaude(env, body) {
  const r = await fetch(API, {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: env.CLAUDE_MODEL || 'claude-haiku-5-5', ...body }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`AI ${r.status}: ${t.slice(0, 300)}`);
  }
  const j = await r.json();
  const tool = (j.content || []).find((c) => c.type === 'tool_use');
  if (!tool) throw new Error('AI returned no structured result');
  return tool.input;
}

export async function suggestCategory(env, text) {
  if (env.MOCK_AI === '1') return 'other';
  const input = await callClaude(env, {
    max_tokens: 100,
    system: `Classify a personal expense description into one category. Categories: ${CATEGORY_GUIDE}. The text may be in any language.`,
    tools: [SUGGEST_TOOL],
    tool_choice: { type: 'tool', name: 'set_category' },
    messages: [{ role: 'user', content: String(text).slice(0, 200) }],
  });
  return CATEGORY_IDS.includes(input.category) ? input.category : 'other';
}

// Нормализуем ответ нейросети в черновик для экрана подтверждения: суммы сгруппированы по категориям,
// а расхождение между суммой позиций и итогом (округления, скидки на весь чек) уходит в крупнейшую категорию.
export function receiptToDraft(parsed, fallbackCurrency) {
  if (!parsed || parsed.doc_type !== 'receipt') return null;
  const total = Math.abs(Number(parsed.total) || 0);
  let items = (Array.isArray(parsed.items) ? parsed.items : [])
    .map((i) => ({
      name: String(i.name || '').slice(0, 80),
      amount: Number(i.amount) || 0,
      category: CATEGORY_IDS.includes(i.category) ? i.category : 'other',
    }))
    .filter((i) => i.amount !== 0)
    .slice(0, 80);
  if (!items.length && total) items = [{ name: parsed.merchant || '—', amount: total, category: 'other' }];
  if (!items.length) return null;

  const groups = {};
  for (const it of items) {
    groups[it.category] ||= { category: it.category, amount: 0, items: [] };
    groups[it.category].amount += it.amount;
    groups[it.category].items.push(it);
  }
  let list = Object.values(groups).filter((g) => g.amount > 0.004);
  const sum = list.reduce((s, g) => s + g.amount, 0);
  if (total > 0 && list.length && Math.abs(sum - total) > 0.009) {
    const biggest = list.reduce((a, b) => (b.amount > a.amount ? b : a));
    biggest.amount += total - sum;
    if (biggest.amount <= 0) list = [{ category: biggest.category, amount: total, items: items }];
  }
  list.forEach((g) => (g.amount = Math.round(g.amount * 100) / 100));
  list.sort((a, b) => b.amount - a.amount);

  const date = /^\d{4}-\d{2}-\d{2}$/.test(parsed.date || '') ? parsed.date : null;
  const currency = /^[A-Z]{3}$/.test(parsed.currency || '') ? parsed.currency : fallbackCurrency;
  return {
    merchant: String(parsed.merchant || '').slice(0, 60),
    date,
    currency,
    total: Math.round(list.reduce((s, g) => s + g.amount, 0) * 100) / 100,
    groups: list,
  };
}

function mockReceipt() {
  return {
    doc_type: 'receipt',
    merchant: 'Mercadona',
    date: new Date().toISOString().slice(0, 10),
    currency: 'EUR',
    total: 38.47,
    items: [
      { name: 'Leche entera 6x1L', amount: 5.82, category: 'groceries' },
      { name: 'Pan de molde', amount: 1.35, category: 'groceries' },
      { name: 'Pollo filetes', amount: 6.9, category: 'groceries' },
      { name: 'Tomate rama', amount: 2.14, category: 'groceries' },
      { name: 'Aceite oliva virgen extra 1L', amount: 8.95, category: 'groceries' },
      { name: 'Detergente líquido', amount: 6.5, category: 'household' },
      { name: 'Champú', amount: 2.8, category: 'beauty' },
      { name: 'Comida gato', amount: 4.01, category: 'pets' },
    ],
  };
}

// Операции из выписки → черновик для экрана проверки
export function transactionsToDraft(parsed, fallbackCurrency, today) {
  if (!parsed || parsed.doc_type !== 'transactions' || !Array.isArray(parsed.transactions)) return null;
  const items = parsed.transactions.slice(0, 300).map((t) => {
    const kind = ['expense', 'income', 'transfer'].includes(t.kind) ? t.kind : 'expense';
    let category = String(t.category || '');
    if (kind === 'income' && !INCOME_IDS.includes(category)) category = 'other_income';
    if (kind !== 'income' && !CATEGORY_IDS.includes(category)) category = 'other';
    const date = /^\d{4}-\d{2}-\d{2}$/.test(t.date || '') && t.date <= today ? t.date : today;
    return {
      date, kind, category,
      note: String(t.description || '').trim().slice(0, 80),
      amount: Math.round(Math.abs(Number(t.amount) || 0) * 100) / 100,
      currency: /^[A-Z]{3}$/.test(t.currency || '') ? t.currency : (/^[A-Z]{3}$/.test(parsed.currency || '') ? parsed.currency : fallbackCurrency),
    };
  }).filter((t) => t.amount > 0);
  if (!items.length) return null;
  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { source: String(parsed.source || '').slice(0, 40), items };
}

function mockTransactions(today) {
  const d = (n) => { const x = new Date(`${today}T00:00:00Z`); x.setUTCDate(x.getUTCDate() - n); return x.toISOString().slice(0, 10); };
  return {
    doc_type: 'transactions', source: 'BBVA', currency: 'EUR',
    transactions: [
      { date: d(0), description: 'Glovo', amount: 23.9, currency: 'EUR', kind: 'expense', category: 'delivery' },
      { date: d(0), description: 'Cabify', amount: 12.4, currency: 'EUR', kind: 'expense', category: 'taxi' },
      { date: d(1), description: 'Zity', amount: 18.75, currency: 'EUR', kind: 'expense', category: 'carsharing' },
      { date: d(1), description: 'Mercadona', amount: 38.47, currency: 'EUR', kind: 'expense', category: 'groceries' },
      { date: d(2), description: 'Перевод на накопительный счёт', amount: 500, currency: 'EUR', kind: 'transfer', category: 'other' },
      { date: d(3), description: 'Bizum от Анны', amount: 30, currency: 'EUR', kind: 'income', category: 'transfer_in' },
      { date: d(4), description: 'Spotify', amount: 10.99, currency: 'EUR', kind: 'expense', category: 'subscriptions' },
      { date: d(5), description: 'Repsol', amount: 55, currency: 'EUR', kind: 'expense', category: 'car' },
    ],
  };
}
