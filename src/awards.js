// Награды: по одной на категорию, выдаются за суммарные траты (за всё время) в категории.
// icon — имя файла public/awards/<icon>.svg; goal — порог в евро (для других валют — «красивый» эквивалент).
export const AWARDS = [
  { id: 'ladle',    icon: 'ladle',    cat: 'groceries',     goal: 1000, ru: ['Янтарная поварёшка', '«Ресторан есть у нас дома»'],            en: ['Amber Ladle', '“We have a restaurant at home”'] },
  { id: 'chef',     icon: 'chef',     cat: 'cafe',          goal: 1000, ru: ['Шеф-колпак', 'В вашем доме кухня не нужна'],                    en: ['Chef’s Hat', 'Who needs a kitchen at home?'] },
  { id: 'moped',    icon: 'moped',    cat: 'delivery',      goal: 1000, ru: ['Золотой мопед', 'Курьеры знают вас в лицо'],                    en: ['Golden Moped', 'Couriers know you by sight'] },
  { id: 'taxi',     icon: 'taxi',     cat: 'taxi',          goal: 1000, ru: ['Почётные шашки', 'Знаете, как показывать дорогу'],              en: ['Honorary Taxi Light', 'You know how to give directions'] },
  { id: 'bus',      icon: 'bus',      cat: 'transport',     goal: 500,  ru: ['Пассажир №1', 'Помните расписание всех автобусов в городе'],    en: ['Passenger No. 1', 'You remember every bus schedule in town'] },
  { id: 'carkey',   icon: 'carkey',   cat: 'carsharing',    goal: 500,  ru: ['Ключ от каршеринга', 'Кому нужна своя машина?'],                en: ['Car Sharing Key', 'Who needs their own car?'] },
  { id: 'can',      icon: 'can',      cat: 'fuel',          goal: 1000, ru: ['Рубиновая канистра', 'Эта награда снижает расход'],             en: ['Ruby Jerrycan', 'This award reduces fuel consumption'] },
  { id: 'wrench',   icon: 'wrench',   cat: 'car_service',   goal: 1000, ru: ['Серебряный ключ', 'Вам положен диплом механика'],               en: ['Silver Wrench', 'You deserve a mechanic’s diploma'] },
  { id: 'bulb',     icon: 'bulb',     cat: 'utilities',     goal: 1000, ru: ['Лампочка Ильича', 'Свет горит, интернет работает. Жизнь удалась'], en: ['Edison’s Bulb', 'Lights on, internet working. Life is good'] },
  { id: 'pill',     icon: 'pill',     cat: 'health',        goal: 1000, ru: ['Сладкая пилюля', 'Здоровье у вас одно!'],                       en: ['Sweet Pill', 'You only have one health!'] },
  { id: 'comb',     icon: 'comb',     cat: 'beauty',        goal: 500,  ru: ['Перламутровая расчёска', 'Красота требует жертв'],              en: ['Pearl Comb', 'Beauty requires sacrifice'] },
  { id: 'mop',      icon: 'mop',      cat: 'household',     goal: 500,  ru: ['Умная швабра', 'Нет ничего лучше, чем жить в чистом доме'],     en: ['Smart Mop', 'Nothing beats living in a clean home'] },
  { id: 'hanger',   icon: 'hanger',   cat: 'clothes',       goal: 1000, ru: ['Новая вешалка', 'Для тех, кто знает, что встречают по одёжке'], en: ['Brand-New Hanger', 'For those who know people judge by clothes'] },
  { id: 'ticket',   icon: 'ticket',   cat: 'fun',           goal: 1000, ru: ['VIP билет', 'Делу — время, потехе — час'],                      en: ['VIP Ticket', 'Work first, play later'] },
  { id: 'dumbbell', icon: 'dumbbell', cat: 'sport',         goal: 1000, ru: ['Золотая гантель', 'Начинайте ходить по дороге, ведь вы — машина'], en: ['Golden Dumbbell', 'Start walking the road, you’re a machine'] },
  { id: 'play',     icon: 'play',     cat: 'subscriptions', goal: 500,  ru: ['Дорогой подписчик', 'Дарим месяц подписки, чтобы сгладить удар (скоро)'], en: ['Dear Subscriber', 'We’re gifting a month of subscription to soften the blow (coming soon)'] },
  { id: 'case',     icon: 'case',     cat: 'travel',        goal: 3000, ru: ['Кожаный чемодан', 'Путешествуйте. Оно того стоит.'],            en: ['Leather Suitcase', 'Go travel. It’s worth it.'] },
  { id: 'bone',     icon: 'bone',     cat: 'pets',          goal: 500,  ru: ['Наградная косточка', 'Гав-гав, мяу-мяу!'],                      en: ['Award Bone', 'Woof-woof, meow-meow!'] },
  { id: 'piggy',    icon: 'piggy',    cat: 'savings',       goal: 1000, ru: ['Свинья-копилка', 'Эта подушка дарит крепкий сон, но спать на ней нельзя!'], en: ['Piggy Bank', 'This safety cushion gives you sound sleep, but you can’t sleep on it!'] },
];
export const AWARD_IDS = AWARDS.map((a) => a.id);

// Те же ступени «красивых» чисел, что и в лимитах: порог 1000 € в рублях — 100 000 ₽, а не 92 430 ₽
const FACTOR = { RUB: 100, UAH: 50, KZT: 500, BYN: 4, TRY: 40, AMD: 400, GEL: 3, RSD: 100, PLN: 4, CZK: 25, HUF: 400, SEK: 10, NOK: 10,
  DKK: 7.5, CNY: 8, JPY: 150, THB: 40, IDR: 17000, VND: 25000, INR: 100, MXN: 20, BRL: 6, ARS: 1000, UZS: 14000, KGS: 100, AZN: 2, MDL: 20, ALL: 100,
  AED: 4, ILS: 4, CAD: 1.5 };
export const goalIn = (goalEur, cur) => (cur === 'EUR' || !FACTOR[cur] ? goalEur : goalEur * FACTOR[cur]);
