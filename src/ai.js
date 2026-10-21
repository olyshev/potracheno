// Нейросеть: распознавание чеков по фото и подсказка категории по описанию.
// Используется Claude API с принудительным вызовом инструмента — так ответ всегда приходит строгим JSON.
import { CATEGORY_IDS, CATEGORIES } from './categories.js';

const API = 'https://api.anthropic.com/v1/messages';

const CATEGORY_GUIDE = CATEGORIES.map((c) => `${c.id} = ${c.en}`).join('; ');

const RECEIPT_TOOL = {
  name: 'record_receipt',
  description: 'Record the structured contents of a purchase receipt.',
  input_schema: {
    type: 'object',
    properties: {
      is_receipt: { type: 'boolean', description: 'false if the image is not a receipt/invoice/bill or is unreadable' },
      merchant: { type: 'string', description: 'Store or company name as printed, short' },
      date: { type: 'string', description: 'Purchase date YYYY-MM-DD, empty string if not visible' },
      currency: { type: 'string', description: 'ISO 4217 code. Infer from symbols, country, language, tax ids (e.g. € in Spain → EUR, ₽/руб → RUB)' },
      total: { type: 'number', description: 'Final amount actually paid, after discounts' },
      items: {
        type: 'array',
        description: 'Line items. Discounts as negative amounts. Max 60 items; merge trivial duplicates.',
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
    },
    required: ['is_receipt', 'merchant', 'currency', 'total', 'items'],
  },
};

const RECEIPT_SYSTEM = `You read photos of shopping receipts, invoices and bills and extract them precisely.
Categories: ${CATEGORY_GUIDE}.
Rules:
- Categorize each line item on its own: in a supermarket, food → groceries, detergent → household, shampoo → beauty, pet food → pets.
- A restaurant or bar bill is entirely "cafe". A pharmacy receipt is "health" unless items are clearly cosmetics.
- Fuel and parking → car. Public transport and taxi → transport.
- Use the amount actually charged per line (quantity × unit price). Ignore VAT breakdown tables, change given, card slips.
- If there are no readable items, return one item with the merchant name and the total.
- Never invent numbers you cannot read. If the image is not a receipt, set is_receipt=false.`;

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

export async function parseReceipt(env, base64, mediaType) {
  if (env.MOCK_AI === '1') return mockReceipt();
  const input = await callClaude(env, {
    max_tokens: 4000,
    system: RECEIPT_SYSTEM,
    tools: [RECEIPT_TOOL],
    tool_choice: { type: 'tool', name: 'record_receipt' },
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: 'Extract this receipt.' },
      ],
    }],
  });
  return input;
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
  if (!parsed || parsed.is_receipt === false) return null;
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
    is_receipt: true,
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
