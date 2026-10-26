// Категории расходов. id — стабильный ключ в базе, менять нельзя; подписи и эмодзи — можно.
export const CATEGORIES = [
  { id: 'groceries',     emoji: '🛒', ru: 'Продукты',        en: 'Groceries' },
  { id: 'cafe',          emoji: '☕', ru: 'Кафе и рестораны', en: 'Cafes & restaurants' },
  { id: 'delivery',      emoji: '🛵', ru: 'Доставка',        en: 'Delivery' },
  { id: 'transport',     emoji: '🚇', ru: 'Транспорт',       en: 'Transport' },
  { id: 'taxi',          emoji: '🚕', ru: 'Такси',           en: 'Taxi' },
  { id: 'carsharing',    emoji: '🚙', ru: 'Каршеринг',       en: 'Car sharing' },
  { id: 'fuel',          emoji: '⛽', ru: 'Топливо',         en: 'Fuel' },
  { id: 'car_service',   emoji: '🔧', ru: 'Обслуживание авто', en: 'Car service' },
  { id: 'car_goods',     emoji: '🛞', ru: 'Товары для авто', en: 'Car accessories' },
  { id: 'housing',       emoji: '🏠', ru: 'Жильё',           en: 'Housing' },
  { id: 'utilities',     emoji: '💡', ru: 'Связь и ЖКУ',     en: 'Utilities & phone' },
  { id: 'health',        emoji: '💊', ru: 'Здоровье',        en: 'Health' },
  { id: 'beauty',        emoji: '🧴', ru: 'Уход и гигиена',  en: 'Personal care' },
  { id: 'household',     emoji: '🧽', ru: 'Дом и быт',       en: 'Household' },
  { id: 'clothes',       emoji: '👕', ru: 'Одежда и обувь',  en: 'Clothes' },
  { id: 'shopping',      emoji: '🛍️', ru: 'Покупки',         en: 'Shopping' },
  { id: 'fun',           emoji: '🎟️', ru: 'Развлечения',     en: 'Entertainment' },
  { id: 'sport',         emoji: '🏋️', ru: 'Спорт',           en: 'Sport' },
  { id: 'subscriptions', emoji: '📺', ru: 'Подписки',        en: 'Subscriptions' },
  { id: 'travel',        emoji: '✈️', ru: 'Путешествия',     en: 'Travel' },
  { id: 'education',     emoji: '📚', ru: 'Обучение',        en: 'Education' },
  { id: 'kids',          emoji: '🧸', ru: 'Дети',            en: 'Kids' },
  { id: 'pets',          emoji: '🐾', ru: 'Питомцы',         en: 'Pets' },
  { id: 'savings',       emoji: '🏦', ru: 'Инвестиции и сбережения', en: 'Investments & savings' },
  { id: 'gifts',         emoji: '🎁', ru: 'Подарки',         en: 'Gifts' },
  { id: 'other',         emoji: '📦', ru: 'Другое',          en: 'Other' },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
export const isCategory = (id) => CATEGORY_IDS.includes(id);
// custom — свои категории пользователя: { [id]: { emoji, name } }
export const catLabel = (id, lang, custom = null) => {
  if (custom && custom[id]) return `${custom[id].emoji} ${custom[id].name}`;
  const c = CATEGORIES.find((x) => x.id === id) || INCOME_CATEGORIES.find((x) => x.id === id) || CATEGORIES.at(-1);
  return `${c.emoji} ${lang === 'ru' ? c.ru : c.en}`;
};

// Быстрые правила для ручного ввода: если подпись совпала, нейросеть не нужна.
const RULES = {
  delivery: ['доставк', 'курьер', 'glovo', 'uber eats', 'ubereats', 'just eat', 'justeat', 'deliveroo', 'wolt', 'яндекс еда', 'яндекс.еда', 'яндекс лавк', 'деливери', 'delivery club', 'kuper', 'купер', 'сбермаркет', 'getir', 'gorillas', 'delivery', 'envío', 'envio', 'domicilio'],
  carsharing: ['каршеринг', 'делимобиль', 'яндекс драйв', 'ситидрайв', 'белкакар', 'zity', 'share now', 'sharenow', 'free2move', 'wible', 'getaround', 'miles mobility', 'ubeeqo', 'car sharing', 'carsharing', 'carshare'],
  sport: ['спорт', 'фитнес', 'спортзал', 'тренаж', 'тренировк', 'тренер', 'бассейн', 'йога', 'пилатес', 'теннис', 'падел', 'скалодром', 'лыж', 'сноуборд', 'секция', 'абонемент в зал', 'decathlon', 'декатлон', 'gym', 'gimnasio', 'fitness', 'basic-fit', 'basic fit', 'dreamfit', 'altafit', 'go fit', 'holmes place', 'mcfit', 'crossfit', 'yoga', 'pilates', 'padel', 'pádel', 'tenis', 'tennis', 'piscina', 'swimming', 'escalada', 'climbing', ' ski ', 'deporte', ' sport'],
  taxi: ['такси', 'uber', 'cabify', 'bolt', 'yango', 'яндекс го', 'freenow', 'free now', 'ситимобил', 'indrive', 'taxi', 'lyft', 'careem'],
  groceries: ['продукт', 'магазин', 'пятёрочк', 'пятерочк', 'перекрёст', 'перекрест', 'вкусвилл', 'ашан', 'лента', 'магнит', 'супермаркет', 'mercadona', 'carrefour', 'lidl', 'aldi', 'dia ', 'alcampo', 'eroski', 'supermercado', 'grocer', 'supermarket', 'фрукт', 'овощ', 'хлеб', 'молоко', 'мясо', 'рыба'],
  cafe: ['кафе', 'кофе', 'ресторан', 'обед', 'ужин', 'завтрак', ' бар ', 'пицц', 'суши', 'бургер', 'coffee', 'cafe', 'café', 'restaurant', 'bar ', 'cerveza', 'cañas', 'menú', 'starbucks', 'mcdonald', 'kfc', 'lunch', 'dinner', 'breakfast'],
  transport: ['парковк', 'платная дорога', 'parking', 'parquímetro', 'parquimetro', 'telpark', 'easypark', 'empark', 'peaje', 'toll', 'метро', 'автобус', 'трамва', 'электричк', 'поезд', 'проездн', 'renfe', 'metro', 'bus', 'abono', 'emt ', 'cercan', 'тройка', 'электросамокат', 'lime', 'whoosh', 'urent', 'dott', 'tier '],
  fuel: ['бензин', 'заправк', 'топливо', 'дизел', 'газпромнефт', 'лукойл', 'роснефт', 'татнефт', 'gasolina', 'gasolinera', 'gasóleo', 'gasoleo', 'diesel', 'repsol', 'cepsa', 'moeve', 'galp', ' bp ', 'shell', 'petronor', 'ballenoil', 'plenoil', 'petroprix', 'esso', 'fuel', 'petrol'],
  car_service: ['автосервис', 'шиномонтаж', 'ремонт авто', 'ремонт машин', 'запчаст', 'техобслуж', 'замена масла', 'автомастерск', 'диагностик', 'taller', 'mecánic', 'mecanic', 'recambio', ' itv', 'revisión del coche', 'midas', 'feu vert', 'car repair', 'car service', 'mechanic', 'spare parts'],
  car_goods: ['автомагазин', 'автотовар', 'шины', 'резин', 'покрышк', 'автомойк', 'мойка', 'автохим', 'коврики', 'norauto', 'aurgi', 'neumátic', 'neumatic', 'lavado', 'car wash', 'carwash', 'tyres', 'tires', 'accesorios coche'],
  housing: ['аренд', 'ипотек', 'квартир', 'alquiler', 'rent', 'mortgage', 'hipoteca', 'comunidad'],
  utilities: ['свет', 'электричеств', 'газ ', 'вода', 'интернет', 'связь', 'телефон', 'мобильн', 'жкх', 'жку', 'iberdrola', 'endesa', 'naturgy', 'movistar', 'vodafone', 'orange', 'digi', 'internet', 'electricity', 'water bill'],
  health: ['аптек', 'лекарств', 'врач', 'клиник', 'стоматолог', 'анализ', 'farmacia', 'pharmacy', 'doctor', 'dentist', 'clinic', 'médico', 'medico'],
  beauty: ['парикмах', 'стрижк', 'маникюр', 'косметик', 'шампун', 'barber', 'peluquer', 'haircut', 'sephora', 'druni', 'primor'],
  household: ['хозтовар', 'ikea', 'leroy', 'бытов', 'уборк', 'чистящ', 'ferreter', 'bauhaus', 'cleaning'],
  clothes: ['одежд', 'обувь', 'кроссовк', 'куртк', 'zara', 'h&m', 'mango', 'uniqlo', 'primark', 'pull&bear', 'bershka', 'nike', 'adidas', 'ropa', 'zapatos', 'clothes', 'shoes'],
  shopping: ['amazon', 'aliexpress', 'ozon', 'озон', 'wildberries', 'вайлдберриз', 'fnac', 'media markt', 'mediamarkt', 'el corte', 'электроник', 'техник'],
  fun: ['кино', 'театр', 'концерт', 'музей', 'выставк', 'билет', 'боулинг', ' игр', 'cine', 'teatro', 'concierto', 'museo', 'cinema', 'concert', 'museum', 'steam', 'playstation'],
  subscriptions: ['подписк', 'netflix', 'spotify', 'youtube', 'apple', 'icloud', 'chatgpt', 'claude', 'disney', 'hbo', 'max ', 'yandex plus', 'яндекс плюс', 'subscription'],
  travel: ['отель', 'гостиниц', 'авиабилет', 'перелёт', 'перелет', 'airbnb', 'booking', 'hotel', 'ryanair', 'vueling', 'iberia', 'flight', 'hostel'],
  education: ['курс', 'обучени', 'урок', 'репетитор', 'книг', 'школ', 'универ', 'academia', 'curso', 'course', 'book', 'libro', 'udemy', 'coursera'],
  kids: ['детск', 'ребён', 'ребен', 'садик', 'игрушк', 'подгузник', 'kids', 'toys', 'juguete', 'pañal'],
  pets: ['корм', 'ветеринар', 'кошк', 'кот ', 'собак', 'зоомагазин', 'tiendanimal', 'kiwoko', 'veterinar', 'pet ', 'pets'],
  savings: ['накоплен', 'накопит', 'сбережен', 'копилк', 'брокер', 'инвест', 'акций', 'облигац', 'вклад', 'депозит', ' иис', 'крипт', 'биткоин', 'bitcoin', 'crypto', 'etf', 'savings', 'ahorro', 'hucha', 'inversión', 'inversion', 'broker', 'invest', 'trade republic', 'degiro', 'interactive brokers', 'myinvestor', 'indexa', 'revolut savings', 'vault'],
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
// custom — список своих категорий пользователя ({ id, kind, … })
export const isCategoryFor = (kind, id, custom = null, hidden = null) => !(hidden && hidden.has(id))
  && ((kind === 'income' ? INCOME_IDS : CATEGORY_IDS).includes(id) || !!(custom && custom.some((c) => c.id === id && c.kind === kind)));
export const customMap = (list, prefs = []) => {
  const m = Object.fromEntries((list || []).map((c) => [c.id, { emoji: c.emoji, name: c.name, kind: c.kind }]));
  // переименованные стандартные категории
  for (const p of prefs || []) {
    if (!p.name && !p.emoji) continue;
    const base = m[p.category_id] || [...CATEGORIES, ...INCOME_CATEGORIES].find((c) => c.id === p.category_id);
    if (!base) continue;
    m[p.category_id] = { emoji: p.emoji || base.emoji, name: p.name || base.name || base.ru, kind: base.kind };
  }
  return m;
};
export const FALLBACK = { expense: 'other', income: 'other_income' };
// заменить скрытую категорию на «Другое»
export const unhide = (id, kind, hidden) => (hidden && hidden.has(id) ? FALLBACK[kind === 'income' ? 'income' : 'expense'] : id);
export const CUSTOM_LIMIT = 40;
export const CUSTOM_EMOJI = ['🏷️', '💡', '🎨', '🎮', '🎸', '📚', '💊', '🍷', '🍺', '✂️', '💅', '🌿', '🛠️', '⚽', '✈️', '🏍️', '👶', '💻', '📱', '💸', '🧾', '🐶', '🏖️', '❤️'];

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
