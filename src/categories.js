// Категории расходов. id — стабильный ключ в базе, менять нельзя; подписи и эмодзи — можно.
export const CATEGORIES = [
  { id: 'groceries',     emoji: '🛒', ru: 'Продукты',        en: 'Groceries' },
  { id: 'cafe',          emoji: '☕', ru: 'Кафе и рестораны', en: 'Cafes & restaurants' },
  { id: 'transport',     emoji: '🚇', ru: 'Транспорт',       en: 'Transport' },
  { id: 'car',           emoji: '🚗', ru: 'Авто и топливо',  en: 'Car & fuel' },
  { id: 'housing',       emoji: '🏠', ru: 'Жильё',           en: 'Housing' },
  { id: 'utilities',     emoji: '💡', ru: 'Связь и ЖКУ',     en: 'Utilities & phone' },
  { id: 'health',        emoji: '💊', ru: 'Здоровье',        en: 'Health' },
  { id: 'beauty',        emoji: '🧴', ru: 'Уход и гигиена',  en: 'Personal care' },
  { id: 'household',     emoji: '🧽', ru: 'Дом и быт',       en: 'Household' },
  { id: 'clothes',       emoji: '👕', ru: 'Одежда и обувь',  en: 'Clothes' },
  { id: 'shopping',      emoji: '🛍️', ru: 'Покупки',         en: 'Shopping' },
  { id: 'fun',           emoji: '🎟️', ru: 'Развлечения',     en: 'Entertainment' },
  { id: 'subscriptions', emoji: '📺', ru: 'Подписки',        en: 'Subscriptions' },
  { id: 'travel',        emoji: '✈️', ru: 'Путешествия',     en: 'Travel' },
  { id: 'education',     emoji: '📚', ru: 'Обучение',        en: 'Education' },
  { id: 'kids',          emoji: '🧸', ru: 'Дети',            en: 'Kids' },
  { id: 'pets',          emoji: '🐾', ru: 'Питомцы',         en: 'Pets' },
  { id: 'gifts',         emoji: '🎁', ru: 'Подарки',         en: 'Gifts' },
  { id: 'other',         emoji: '📦', ru: 'Другое',          en: 'Other' },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
export const isCategory = (id) => CATEGORY_IDS.includes(id);
export const catLabel = (id, lang) => {
  const c = CATEGORIES.find((x) => x.id === id) || INCOME_CATEGORIES.find((x) => x.id === id) || CATEGORIES.at(-1);
  return `${c.emoji} ${lang === 'ru' ? c.ru : c.en}`;
};

// Быстрые правила для ручного ввода: если подпись совпала, нейросеть не нужна.
const RULES = {
  groceries: ['продукт', 'магазин', 'пятёрочк', 'пятерочк', 'перекрёст', 'перекрест', 'вкусвилл', 'ашан', 'лента', 'магнит', 'супермаркет', 'mercadona', 'carrefour', 'lidl', 'aldi', 'dia ', 'alcampo', 'eroski', 'supermercado', 'grocer', 'supermarket', 'фрукт', 'овощ', 'хлеб', 'молоко', 'мясо', 'рыба'],
  cafe: ['кафе', 'кофе', 'ресторан', 'обед', 'ужин', 'завтрак', ' бар ', 'пицц', 'суши', 'бургер', 'доставка еды', 'coffee', 'cafe', 'café', 'restaurant', 'bar ', 'cerveza', 'cañas', 'menú', 'glovo', 'uber eats', 'just eat', 'deliveroo', 'starbucks', 'mcdonald', 'kfc', 'lunch', 'dinner', 'breakfast'],
  transport: ['метро', 'автобус', 'такси', 'электричк', 'поезд', 'проездн', 'uber', 'cabify', 'bolt', 'renfe', 'metro', 'bus', 'taxi', 'abono', 'yango', 'яндекс го', 'самокат'],
  car: ['бензин', 'заправк', 'топливо', 'парковк', 'мойка', 'шиномонтаж', 'автосервис', 'gasolina', 'repsol', 'cepsa', 'galp', 'parking', 'fuel', 'petrol', 'itv', 'peaje'],
  housing: ['аренд', 'ипотек', 'квартир', 'alquiler', 'rent', 'mortgage', 'hipoteca', 'comunidad'],
  utilities: ['свет', 'электричеств', 'газ ', 'вода', 'интернет', 'связь', 'телефон', 'мобильн', 'жкх', 'жку', 'iberdrola', 'endesa', 'naturgy', 'movistar', 'vodafone', 'orange', 'digi', 'internet', 'electricity', 'water bill'],
  health: ['аптек', 'лекарств', 'врач', 'клиник', 'стоматолог', 'анализ', 'farmacia', 'pharmacy', 'doctor', 'dentist', 'clinic', 'médico', 'medico'],
  beauty: ['парикмах', 'стрижк', 'маникюр', 'косметик', 'шампун', 'barber', 'peluquer', 'haircut', 'sephora', 'druni', 'primor'],
  household: ['хозтовар', 'ikea', 'leroy', 'бытов', 'уборк', 'чистящ', 'ferreter', 'bauhaus', 'cleaning'],
  clothes: ['одежд', 'обувь', 'кроссовк', 'куртк', 'zara', 'h&m', 'mango', 'uniqlo', 'primark', 'pull&bear', 'bershka', 'decathlon', 'nike', 'adidas', 'ropa', 'zapatos', 'clothes', 'shoes'],
  shopping: ['amazon', 'aliexpress', 'ozon', 'озон', 'wildberries', 'вайлдберриз', 'fnac', 'media markt', 'mediamarkt', 'el corte', 'электроник', 'техник'],
  fun: ['кино', 'театр', 'концерт', 'музей', 'выставк', 'билет', 'боулинг', ' игр', 'cine', 'teatro', 'concierto', 'museo', 'cinema', 'concert', 'museum', 'steam', 'playstation'],
  subscriptions: ['подписк', 'netflix', 'spotify', 'youtube', 'apple', 'icloud', 'chatgpt', 'claude', 'disney', 'hbo', 'max ', 'yandex plus', 'яндекс плюс', 'subscription', 'gym', 'спортзал', 'фитнес', 'gimnasio'],
  travel: ['отель', 'гостиниц', 'авиабилет', 'перелёт', 'перелет', 'airbnb', 'booking', 'hotel', 'ryanair', 'vueling', 'iberia', 'flight', 'hostel'],
  education: ['курс', 'обучени', 'урок', 'репетитор', 'книг', 'школ', 'универ', 'academia', 'curso', 'course', 'book', 'libro', 'udemy', 'coursera'],
  kids: ['детск', 'ребён', 'ребен', 'садик', 'игрушк', 'подгузник', 'kids', 'toys', 'juguete', 'pañal'],
  pets: ['корм', 'ветеринар', 'кошк', 'кот ', 'собак', 'зоомагазин', 'tiendanimal', 'kiwoko', 'veterinar', 'pet ', 'pets'],
  gifts: ['подарок', 'подарк', 'цветы', 'букет', 'regalo', 'flores', 'gift', 'flowers'],
};

export function categorizeByRules(text) {
  if (!text) return null;
  const t = ` ${String(text).toLowerCase()} `;
  for (const [cat, words] of Object.entries(RULES)) {
    if (words.some((w) => t.includes(w))) return cat;
  }
  return null;
}

// Категории доходов. id не пересекаются с расходными.
export const INCOME_CATEGORIES = [
  { id: 'salary',       emoji: '💼', ru: 'Зарплата',              en: 'Salary' },
  { id: 'freelance',    emoji: '🧑‍💻', ru: 'Подработка и фриланс', en: 'Side work & freelance' },
  { id: 'business',     emoji: '🏢', ru: 'Бизнес',                en: 'Business' },
  { id: 'investments',  emoji: '📈', ru: 'Инвестиции и проценты', en: 'Investments & interest' },
  { id: 'rent_in',      emoji: '🔑', ru: 'Сдача в аренду',        en: 'Rental income' },
  { id: 'benefits',     emoji: '🏛️', ru: 'Пособия и пенсия',      en: 'Benefits & pension' },
  { id: 'refund',       emoji: '↩️', ru: 'Возвраты и кешбэк',     en: 'Refunds & cashback' },
  { id: 'gift_in',      emoji: '🎁', ru: 'Подарки',               en: 'Gifts received' },
  { id: 'transfer_in',  emoji: '🔄', ru: 'Переводы',              en: 'Transfers' },
  { id: 'other_income', emoji: '💰', ru: 'Другой доход',          en: 'Other income' },
];
export const INCOME_IDS = INCOME_CATEGORIES.map((c) => c.id);
export const isCategoryFor = (kind, id) => (kind === 'income' ? INCOME_IDS : CATEGORY_IDS).includes(id);

const INCOME_RULES = {
  salary: ['зарплат', 'зп', 'аванс', 'оклад', 'премия', 'бонус', 'salary', 'payroll', 'nómina', 'nomina', 'sueldo', 'wage'],
  freelance: ['фриланс', 'подработ', 'заказ', 'гонорар', 'инвойс', 'freelance', 'invoice', 'factura', 'client', 'клиент'],
  business: ['бизнес', 'выручка', 'business', 'revenue'],
  investments: ['дивиденд', 'процент', 'купон', 'вклад', 'депозит', 'dividend', 'interest', 'coupon', 'intereses'],
  rent_in: ['аренда', 'квартирант', 'жильц', 'rent', 'alquiler', 'inquilino'],
  benefits: ['пособ', 'пенси', 'стипенд', 'pension', 'pensión', 'benefit', 'paro', 'subsidio'],
  refund: ['возврат', 'кешбэк', 'кэшбэк', 'cashback', 'refund', 'devolución', 'devolucion', 'reembolso'],
  gift_in: ['подарил', 'подарок', 'gift', 'regalo'],
  transfer_in: ['перевод', 'вернул', 'долг', 'transfer', 'bizum', 'transferencia'],
};
export function categorizeIncome(text) {
  const t = ` ${String(text || '').toLowerCase()} `;
  for (const [cat, words] of Object.entries(INCOME_RULES)) if (words.some((w) => t.includes(w))) return cat;
  return 'other_income';
}
