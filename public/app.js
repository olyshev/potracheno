/* Потрачено — клиент мини-аппа. Без сборки и фреймворков: один файл, работает в Telegram и в браузере (режим разработки). */
(() => {
  const tg = window.Telegram && window.Telegram.WebApp;
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  const initData = tg && tg.initData ? tg.initData : (isLocal ? 'dev' : '');
  if (tg && tg.initData) {
    document.documentElement.setAttribute('data-tg', '');
    // тема Telegram может не совпадать с темой устройства
    const syncScheme = () => document.documentElement.toggleAttribute('data-dark', tg.colorScheme === 'dark');
    syncScheme();
    tg.onEvent && tg.onEvent('themeChanged', syncScheme);
  }

  // ---------- тексты ----------
  const T = {
    ru: {
      addManual: 'Вручную', addReceipt: 'Скан', spent: 'Потрачено', entries: (n) => `${n} ${plural(n, ['запись', 'записи', 'записей'])}`,
      vs: (m) => `к ${m}`, same: 'как в прошлом месяце', categories: 'Категории', history: 'История', showAll: 'Все',
      menu: 'Меню', profile: 'Профиль', profileSub: 'Итоги недели и месяца', catEditor: 'Категории', catEditorSub: 'Переименовать, удалить, добавить',
      settingsSub: 'Валюта, язык, уведомления', expensesTab: 'Расходы', incomesTab: 'Доходы', editCat: 'Категория', deleteCat: 'Удалить категорию',
      confirmDeleteCat: (n) => `Удалить категорию «${n}»? Уже записанные траты в ней останутся, но выбрать её больше будет нельзя.`, ownCat: 'своя',
      weekResults: 'Итоги недели', monthResults: 'Итоги месяца', openStory: 'Смотреть историю', notEnough: 'Пока мало данных: нужно хотя бы несколько трат.',
      spentLbl: 'Потрачено', incomeLbl: 'Доходы', balanceLbl: 'Остаток', usualLbl: 'Обычно', topLbl: 'Больше всего', vsPrev: 'к прошлому месяцу', vsUsual: 'к обычной неделе',
      firstEntryHint: 'Добавьте первую трату', daysWithUs: (n) => `Слежу за деньгами уже ${n} ${plural(n, ['день', 'дня', 'дней'])}`,
      tabHome: 'Главная', tabStats: 'Статистика', spentIn: (m) => `Потрачено в ${{ 'январь': 'январе', 'февраль': 'феврале', 'март': 'марте', 'апрель': 'апреле', 'май': 'мае', 'июнь': 'июне', 'июль': 'июле', 'август': 'августе', 'сентябрь': 'сентябре', 'октябрь': 'октябре', 'ноябрь': 'ноябре', 'декабрь': 'декабре' }[String(m).toLowerCase()] || m}`,
      earnedIn: (m) => `Заработано в ${{ 'январь': 'январе', 'февраль': 'феврале', 'март': 'марте', 'апрель': 'апреле', 'май': 'мае', 'июнь': 'июне', 'июль': 'июле', 'август': 'августе', 'сентябрь': 'сентябре', 'октябрь': 'октябре', 'ноябрь': 'ноябре', 'декабрь': 'декабре' }[String(m).toLowerCase()] || m}`,
      repeatShort: 'регулярно', receiptShort: 'чек', byDay: 'По дням', noData: 'За этот месяц пока ничего нет', vsUsualShort: 'к обычной',
      leftShare: (n) => `осталось ${n}% дохода`, overShort: 'расходы больше доходов',
      newCat: 'Новая категория', createCat: 'Создать', catNameLabel: 'Название', catNamePh: 'Например, хобби', catIcon: 'Значок', tooManyCats: 'Слишком много своих категорий', moreCats: 'Ещё', restAll: 'Всё остальное', limits: 'Лимиты', limitsSub: 'Сколько готовы тратить в месяц. Сдвиньте вправо до конца, чтобы снять лимит', perMonth: '/ мес', noLimit: 'Без лимита', noLimitShort: 'без лимита', limSpent: (s, l) => `Потрачено ${s} · осталось ${l}`, limOver: (s, o) => `Потрачено ${s} · <b>больше на ${o}</b>`, addLimit: 'Добавить лимит', limitFor: 'Лимит на категорию', limitTaken: 'Серые — уже с лимитом', limitsEmpty: 'Задайте, сколько готовы тратить в месяц на кафе, такси или покупки, — приложение покажет, сколько осталось.', addPayment: 'Добавить платёж', paymentKindQ: 'Какой регулярный платёж добавить?', addIncomeShort: 'Добавить доход', today: 'Сегодня', yesterday: 'Вчера', tomorrow: 'Завтра', otherDate: 'Другая дата', pickDate: 'Выбрать', emptyTitle: 'Пока пусто',
      emptyText: 'Сфотографируйте чек или внесите сумму вручную. Ещё можно просто отправить фото чека боту в чат.',
      emptyPast: 'В этом месяце записей нет.',
      newExpense: 'Новая трата', amount: 'Сумма', note: 'Что купили', notePh: 'Например, кофе', date: 'Дата',
      category: 'Категория', save: 'Сохранить', cancel: 'Отмена', close: 'Закрыть', done: 'Готово',
      reading: 'Читаю…', readingSub: 'Чек — 5–15 секунд, выписка — до минуты', receipt: 'Чек', merchant: 'Магазин', currency: 'Валюта',
      total: 'Итого', addGroup: '+ Добавить категорию', mismatch: (d) => `Сумма отличается от чека на ${d}`,
      notReceipt: 'Не нашёл здесь ни чека, ни операций. Попробуйте снять ровнее и при хорошем свете.',
      onePdf: 'Выберите один PDF или несколько картинок', tooBig: 'Файл слишком большой — до 9 МБ',
      txTitle: 'Операции', txFound: (a, b) => `Найдено ${a}, выбрано ${b}. Снимите галочку с лишнего, нажмите на значок, чтобы сменить категорию.`,
      txDup: 'уже есть', txTransfer: 'перевод между своими', txTransferShort: 'Перевод',
      txSave: (n) => `Добавить ${n} ${plural(n, ['операцию', 'операции', 'операций'])}`,
      limit: 'Лимит распознавания чеков на этот месяц исчерпан. Суммы можно вносить вручную.',
      aiError: 'Не получилось распознать чек. Попробуйте ещё раз.', netError: 'Нет связи с сервером',
      saved: 'Сохранено', deleted: 'Удалено', edit: 'Изменить трату', delete: 'Удалить',
      confirmDelete: 'Удалить эту трату?', settings: 'Настройки', baseCurrency: 'Валюта учёта',
      baseNote: 'Все суммы пересчитываются в эту валюту по курсу на день траты.',
      scans: 'Распознано чеков', reports: 'Итоги месяца в чате', reportsOn: 'Включены', reportsOff: 'Выключены',
      export: 'Выгрузить все траты (CSV)', exported: 'Файл отправлен в чат с ботом', exportFail: 'Сначала напишите боту /start',
      deleteAll: 'Удалить все мои данные', confirmDeleteAll: 'Удалить все траты и настройки без возможности восстановления?',
      language: 'Язык', chooseCurrency: 'Валюта', welcomeTitle: 'В какой валюте считать?', welcomeText: 'Траты в других валютах будут пересчитываться в неё. Поменять можно в настройках.',
      openInTg: 'Откройте приложение из Telegram', ai: 'ИИ', from: 'из', receiptFrom: (m) => `Чек ${m}`,
      allowReports: 'Разрешите боту писать вам — 1-го числа он пришлёт итоги месяца.',
      maxDay: (x) => `макс. ${x} в день`,
      nudges: 'Напоминания, если давно не заходили',
      shareTitle: 'Поделиться', shareMaking: 'Готовим карточку…', shareStory: 'Опубликовать в истории Telegram', shareSave: 'Сохранить картинку',
      shareHint: (n) => `После публикации — +${n} сканов чеков в этом месяце`, shareBonus: (n) => `+${n} сканов на этот месяц 🎁`,
      shareNoStory: 'Обновите Telegram, чтобы публиковать истории. Пока можно сохранить картинку',
      addIncome: 'Доход', addExpense: 'Расход', expense: 'Расход', incomeKind: 'Доход',
      newIncome: 'Новый доход', incomeNote: 'Откуда', incomeNotePh: 'Например, зарплата',
      balance: 'Остаток', balanceOf: (m) => `Остаток за ${m}`, income: 'Доходы', expenses: 'Расходы',
      spentOf: (a, b) => `потрачено ${a} из ${b}`, overspent: (x) => `Перерасход ${x}`,
      projected: 'Прогноз на конец месяца', addIncomeHint: 'Добавьте доход — и здесь будет видно, сколько осталось',
      repeat: 'Повторять', repeatDay: 'Число месяца',
      pWeek: 'Каждую неделю', p2weeks: 'Каждые 2 недели', pMonth: 'Раз в месяц',
      weekdays: ['по воскресеньям', 'по понедельникам', 'по вторникам', 'по средам', 'по четвергам', 'по пятницам', 'по субботам'],
      weekHint: (wd) => `Начиная с даты записи, ${wd}`, everyDay: (d) => `каждое ${d}-е`,
      lastDayHint: 'Если в месяце нет такого числа — в последний день',
      upcoming: 'Ожидается в этом месяце', recurring: 'Регулярные платежи', howto: 'Как пользоваться', recurringEmpty: 'Пока нет регулярных платежей. Выберите, как часто повторять, когда добавляете зарплату, аренду или подписку — дальше приложение будет вносить их само.',
      recIncome: 'Регулярные доходы', recExpense: 'Регулярные расходы', next: (d) => `→ ${d}`, paused: 'на паузе',
      editRule: 'Регулярный платёж', pause: 'Поставить на паузу', resume: 'Возобновить', deleteRule: 'Больше не повторять',
      confirmDeleteRule: 'Больше не повторять этот платёж? Уже внесённые записи останутся.',
      ruleNote: 'Изменения действуют на следующие месяцы. Уже внесённые записи не меняются.',
      applyToRule: 'Сумма изменилась. Обновить её и для следующих месяцев?', onlyThis: 'Только здесь', alsoNext: 'И дальше',
      editIncome: 'Изменить доход', confirmDeleteIncome: 'Удалить этот доход?',
      emptyTextIncome: 'Начните с дохода: внесите зарплату и отметьте, что она повторяется. Дальше добавляйте траты, фотографируйте чеки или загружайте скриншоты из банка и выписки — приложение покажет, сколько осталось.',
      auto: 'внесено автоматически',
    },
    en: {
      addManual: 'Manual', addReceipt: 'Scan', spent: 'Spent', entries: (n) => `${n} ${n === 1 ? 'entry' : 'entries'}`,
      vs: (m) => `vs ${m}`, same: 'same as last month', categories: 'Categories', history: 'History', showAll: 'All',
      menu: 'Menu', profile: 'Profile', profileSub: 'Week and month results', catEditor: 'Categories', catEditorSub: 'Rename, delete, add',
      settingsSub: 'Currency, language, notifications', expensesTab: 'Expenses', incomesTab: 'Income', editCat: 'Category', deleteCat: 'Delete category',
      confirmDeleteCat: (n) => `Delete "${n}"? Existing entries keep it, but you won't be able to pick it anymore.`, ownCat: 'custom',
      weekResults: 'Week results', monthResults: 'Month results', openStory: 'View story', notEnough: 'Not enough data yet: add a few expenses first.',
      spentLbl: 'Spent', incomeLbl: 'Income', balanceLbl: 'Left', usualLbl: 'Usually', topLbl: 'Top category', vsPrev: 'vs last month', vsUsual: 'vs a usual week',
      firstEntryHint: 'Add your first expense', daysWithUs: (n) => `Tracking my money for ${n} day${n === 1 ? '' : 's'}`,
      tabHome: 'Home', tabStats: 'Statistics', spentIn: (m) => `Spent in ${m}`, earnedIn: (m) => `Earned in ${m}`,
      repeatShort: 'recurring', receiptShort: 'receipt', byDay: 'By day', noData: 'Nothing here for this month yet', vsUsualShort: 'vs usual',
      leftShare: (n) => `${n}% of income left`, overShort: 'spent more than earned',
      newCat: 'New category', createCat: 'Create', catNameLabel: 'Name', catNamePh: 'e.g. Hobby', catIcon: 'Icon', tooManyCats: 'Too many custom categories', moreCats: 'More', restAll: 'Everything else', limits: 'Limits', limitsSub: 'How much you’re ready to spend per month. Slide all the way right to remove a limit', perMonth: '/ mo', noLimit: 'No limit', noLimitShort: 'no limit', limSpent: (s, l) => `Spent ${s} · ${l} left`, limOver: (s, o) => `Spent ${s} · <b>${o} over</b>`, addLimit: 'Add limit', limitFor: 'Limit for a category', limitTaken: 'Grey ones already have a limit', limitsEmpty: 'Set how much you’re ready to spend per month on cafes, taxis or shopping — the app will show what’s left.', addPayment: 'Add payment', paymentKindQ: 'What kind of recurring payment?', addIncomeShort: 'Add income', today: 'Today', yesterday: 'Yesterday', tomorrow: 'Tomorrow', otherDate: 'Other date', pickDate: 'Pick', emptyTitle: 'Nothing here yet',
      emptyText: 'Snap a receipt or add an amount manually. You can also just send a receipt photo to the bot.',
      emptyPast: 'No entries this month.',
      newExpense: 'New expense', amount: 'Amount', note: 'What was it', notePh: 'e.g. coffee', date: 'Date',
      category: 'Category', save: 'Save', cancel: 'Cancel', close: 'Close', done: 'Done',
      reading: 'Reading…', readingSub: 'A receipt takes 5–15 seconds, a statement up to a minute', receipt: 'Receipt', merchant: 'Store', currency: 'Currency',
      total: 'Total', addGroup: '+ Add category', mismatch: (d) => `Differs from the receipt by ${d}`,
      notReceipt: "I couldn't find a receipt or transactions here. Try a straighter photo in good light.",
      onePdf: 'Pick one PDF or several images', tooBig: 'The file is too large — up to 9 MB',
      txTitle: 'Transactions', txFound: (a, b) => `Found ${a}, selected ${b}. Untick what you don't need; tap an icon to change the category.`,
      txDup: 'already recorded', txTransfer: 'between your accounts', txTransferShort: 'Transfer',
      txSave: (n) => `Add ${n} transaction${n === 1 ? '' : 's'}`,
      limit: "You've reached this month's receipt limit. You can still add amounts manually.",
      aiError: "Couldn't read the receipt. Please try again.", netError: 'No connection to the server',
      saved: 'Saved', deleted: 'Deleted', edit: 'Edit expense', delete: 'Delete',
      confirmDelete: 'Delete this expense?', settings: 'Settings', baseCurrency: 'Main currency',
      baseNote: 'All amounts are converted to this currency at the rate of the day.',
      scans: 'Receipts scanned', reports: 'Monthly wrap-up in chat', reportsOn: 'On', reportsOff: 'Off',
      export: 'Export all expenses (CSV)', exported: 'The file was sent to your chat with the bot', exportFail: 'Send /start to the bot first',
      deleteAll: 'Delete all my data', confirmDeleteAll: 'Delete all expenses and settings permanently?',
      language: 'Language', chooseCurrency: 'Currency', welcomeTitle: 'Which currency do you count in?', welcomeText: 'Expenses in other currencies will be converted to it. You can change it in settings.',
      openInTg: 'Open the app from Telegram', ai: 'AI', from: 'of', receiptFrom: (m) => `Receipt ${m}`,
      allowReports: 'Let the bot message you — it will send a wrap-up on the 1st of each month.',
      maxDay: (x) => `max ${x} a day`,
      nudges: "Reminders when you've been away",
      shareTitle: 'Share', shareMaking: 'Making your card…', shareStory: 'Post to Telegram story', shareSave: 'Save image',
      shareHint: (n) => `Post it and get +${n} receipt scans this month`, shareBonus: (n) => `+${n} scans this month 🎁`,
      shareNoStory: 'Update Telegram to post stories. You can save the image for now',
      addIncome: 'Income', addExpense: 'Expense', expense: 'Expense', incomeKind: 'Income',
      newIncome: 'New income', incomeNote: 'Source', incomeNotePh: 'e.g. salary',
      balance: 'Left over', balanceOf: (m) => `Left over in ${m}`, income: 'Income', expenses: 'Expenses',
      spentOf: (a, b) => `spent ${a} of ${b}`, overspent: (x) => `Overspent by ${x}`,
      projected: 'End-of-month forecast', addIncomeHint: 'Add your income to see how much is left',
      repeat: 'Repeat', repeatDay: 'Day of month',
      pWeek: 'Every week', p2weeks: 'Every 2 weeks', pMonth: 'Every month',
      weekdays: ['on Sundays', 'on Mondays', 'on Tuesdays', 'on Wednesdays', 'on Thursdays', 'on Fridays', 'on Saturdays'],
      weekHint: (wd) => `Starting from the entry date, ${wd}`, everyDay: (d) => `monthly on ${d}`,
      lastDayHint: "If a month is shorter, it's the last day",
      upcoming: 'Coming up this month', recurring: 'Recurring payments', howto: 'How to use', recurringEmpty: 'No recurring payments yet. Pick how often to repeat when adding your salary, rent or a subscription — the app will add them for you from then on.',
      recIncome: 'Recurring income', recExpense: 'Recurring expenses', next: (d) => `→ ${d}`, paused: 'paused',
      editRule: 'Recurring payment', pause: 'Pause', resume: 'Resume', deleteRule: 'Stop repeating',
      confirmDeleteRule: 'Stop repeating this payment? Entries already added will stay.',
      ruleNote: 'Changes apply to future months. Entries already added stay as they are.',
      applyToRule: 'The amount changed. Update it for future months too?', onlyThis: 'Just this one', alsoNext: 'Future too',
      editIncome: 'Edit income', confirmDeleteIncome: 'Delete this income?',
      emptyTextIncome: 'Start with your income: add your salary and mark it as recurring. Then add expenses, snap receipts or upload banking-app screenshots and statements — the app will show how much is left.',
      auto: 'added automatically',
    },
  };
  const MONTHS = {
    ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
    ruGen: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    ruPrep: ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'],
    ruDat: ['январю', 'февралю', 'марту', 'апрелю', 'маю', 'июню', 'июлю', 'августу', 'сентябрю', 'октябрю', 'ноябрю', 'декабрю'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  };
  const pctLabel = (x) => (x > 0 && x < 0.01 ? '<1%' : `${Math.round(x * 100)}%`);
  function plural(n, [one, few, many]) {
    const a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return one;
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
    return many;
  }

  // ---------- состояние ----------
  const state = {
    lang: 'ru', me: null, month: null, today: null, data: null, filter: null,
    cats: [], incomeCats: [], catMap: {}, currencies: [], lastCurrency: null,
  };
  const t = (k, ...a) => { const v = (T[state.lang] || T.en)[k]; return typeof v === 'function' ? v(...a) : v; };
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cat = (id) => state.catMap[id] || state.catMap.other || { emoji: '📦', ru: id, en: id };
  const catName = (id) => cat(id)[state.lang === 'ru' ? 'ru' : 'en'];
  // свои категории встают перед «Другое»
  const catsOf = (kind) => {
    const base = kind === 'income' ? state.incomeCats : state.cats;
    const own = (state.custom || []).filter((c) => c.kind === kind).map((c) => state.catMap[c.id]);
    const i = base.findIndex((c) => c.id === (kind === 'income' ? 'other_income' : 'other'));
    const all = i < 0 ? [...base, ...own] : [...base.slice(0, i), ...own, ...base.slice(i)];
    return all.filter((c) => !isHidden(c.id)).map((c) => state.catMap[c.id] || c);
  };
  // ---------- иконки категорий: кружок пастельного цвета с линейной иконкой (свои категории — со своим эмодзи) ----------
  const ico = (name, size = 24, color) => (window.ICONS ? window.ICONS.icon(name, size, color) : '');
  // Цвет кружка категории — по группе (везде, кроме статистики: там цвета диаграммы)
  const TINTS = ['#FFF957', '#A2B7FF', '#FFE1D0', '#E3F5EA', '#FFE8ED', '#C1E378', '#EAEEFF'];
  const GROUPS = {
    0: ['groceries', 'cafe', 'delivery', 'investments', 'rent_in'], // еда; доходы: капитал
    1: ['transport', 'taxi', 'carsharing', 'fuel', 'car_service', 'car_goods'], // транспорт
    2: ['housing', 'utilities', 'household'], // дом
    3: ['health', 'beauty', 'sport'], // здоровье и спорт
    4: ['clothes', 'shopping', 'gifts', 'benefits', 'refund', 'gift_in', 'transfer_in', 'other_income'], // покупки; доходы: поступления
    5: ['fun', 'subscriptions', 'travel', 'education', 'salary', 'freelance', 'business'], // досуг и развитие; доходы: работа
    6: ['kids', 'pets', 'savings', 'other'], // близкие и прочее
  };
  const TINT_OF = Object.fromEntries(Object.entries(GROUPS).flatMap(([g, ids]) => ids.map((id) => [id, Number(g)])));
  const tintOf = (id) => TINTS[TINT_OF[id] ?? ([...String(id)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % TINTS.length)];
  function catIco(id, size = 44) {
    const c = cat(id);
    const name = window.ICONS && window.ICONS.CAT[id];
    const pe = state.prefs && state.prefs[id] && state.prefs[id].emoji;
    const ownEmoji = c.custom || (pe && state.baseCats[id] && pe !== state.baseCats[id].emoji);
    const inner = name && !ownEmoji ? ico(name, Math.round(size * 0.5), '#000') : esc(c.emoji);
    return `<span class="ci s${size}" style="background:${tintOf(id)}">${inner}</span>`;
  }
  const isHidden = (id) => !!(state.prefs && state.prefs[id] && state.prefs[id].hidden);
  // применить переименование стандартной категории
  const applyPref = (id) => {
    const p = state.prefs[id], orig = state.baseCats[id];
    if (!orig) return;
    state.catMap[id] = p && (p.name || p.emoji) ? { ...orig, emoji: p.emoji || orig.emoji, ru: p.name || orig.ru, en: p.name || orig.en, renamed: true } : orig;
  };
  const addCustomCat = (c) => {
    if (!state.custom.some((x) => x.id === c.id)) state.custom.push(c);
    state.catMap[c.id] = { id: c.id, emoji: c.emoji, ru: c.name, en: c.name, custom: true, kind: c.kind };
  };
  const dayMonth = (d) => {
    const n = Number(d.slice(8, 10)), m = Number(d.slice(5, 7)) - 1;
    return state.lang === 'ru' ? `${n} ${MONTHS.ruGen[m]}` : `${MONTHS.en[m]} ${n}`;
  };
  const signed = (n, cur) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${money(Math.abs(n), cur)}`;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* приватный режим */ } },
  };

  function money(n, cur, opts = {}) {
    try {
      return new Intl.NumberFormat(state.lang === 'ru' ? 'ru-RU' : 'en-GB', {
        style: 'currency', currency: cur || state.me.base_currency,
        maximumFractionDigits: opts.round || Math.abs(n) >= 10000 ? 0 : 2,
        minimumFractionDigits: opts.round || Math.abs(n) >= 10000 ? 0 : (Number.isInteger(n) ? 0 : 2),
      }).format(n);
    } catch { return `${n.toFixed(2)} ${cur}`; }
  }
  const parseAmount = (s) => {
    const n = Number(String(s).replace(/\s/g, '').replace(',', '.'));
    return isFinite(n) ? n : NaN;
  };

  // ---------- сеть ----------
  // часовой пояс устройства: по нему сервер считает «сегодня», регулярные платежи и время историй
  const TZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } })();
  async function api(path, opts = {}) {
    const res = await fetch(`/api${path}`, {
      method: opts.method || 'GET',
      headers: { authorization: `tma ${initData}`, 'x-tz': TZ, ...(opts.body ? { 'content-type': 'application/json' } : {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(data.error || `HTTP ${res.status}`); e.code = data.error; e.status = res.status; throw e; }
    return data;
  }

  // ---------- телеграм-обвязка ----------
  const haptic = (type) => { try { tg && tg.HapticFeedback && (type === 'select' ? tg.HapticFeedback.selectionChanged() : tg.HapticFeedback.notificationOccurred(type)); } catch { /* */ } };
  function confirmBox(text) {
    return new Promise((resolve) => {
      if (tg && tg.showConfirm && tg.isVersionAtLeast && tg.isVersionAtLeast('6.2') && tg.initData) tg.showConfirm(text, resolve);
      else resolve(window.confirm(text));
    });
  }
  // Вопрос с двумя вариантами: resolve(true) — второй (основной) вариант
  function choiceBox(text, noLabel, yesLabel) {
    return new Promise((resolve) => {
      if (tg && tg.showPopup && tg.initData && tg.isVersionAtLeast('6.2')) {
        tg.showPopup({ message: text, buttons: [{ id: 'no', type: 'default', text: noLabel }, { id: 'yes', type: 'default', text: yesLabel }] },
          (id) => resolve(id === 'yes' ? true : id === 'no' ? false : null));
      } else resolve(window.confirm(`${text}\n\nOK — ${yesLabel}`));
    });
  }
  let toastTimer;
  function toast(text) {
    const el = $('#toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  // ---------- шторки ----------
  const sheets = [];
  function openSheet(html, { onClose, cls = '' } = {}) {
    const backdrop = document.createElement('div');
    backdrop.className = 'sheet-backdrop';
    const sheet = document.createElement('div');
    sheet.className = `sheet ${cls}`.trim();
    sheet.innerHTML = `<div class="sheet-grip"></div>${html}`;
    $('#sheets').append(backdrop, sheet);
    const entry = { sheet, backdrop, onClose };
    sheets.push(entry);
    backdrop.addEventListener('click', () => closeSheet(entry));
    requestAnimationFrame(() => { backdrop.classList.add('open'); sheet.classList.add('open'); });
    updateBackButton();
    return entry;
  }
  function closeSheet(entry = sheets[sheets.length - 1]) {
    if (!entry) return;
    const i = sheets.indexOf(entry);
    if (i >= 0) sheets.splice(i, 1);
    entry.sheet.classList.remove('open');
    entry.backdrop.classList.remove('open');
    setTimeout(() => { entry.sheet.remove(); entry.backdrop.remove(); }, 260);
    entry.onClose && entry.onClose();
    updateBackButton();
  }
  function updateBackButton() {
    if (!tg || !tg.BackButton || !tg.initData) return;
    if (sheets.length) tg.BackButton.show(); else tg.BackButton.hide();
  }
  if (tg && tg.BackButton) tg.BackButton.onClick(() => closeSheet());

  // ---------- истории ----------
  // Каждая история — набор картинок 1080×1920 в public/stories/<папка>/. langs — для каких языков показывать
  // (текст «зашит» в картинки). Новую историю достаточно добавить в этот список.
  const STORIES = [
    {
      id: 'howto-v1', langs: ['ru', 'en'], duration: 6000, days: 7, // в ленте — первую неделю, потом только в настройках
      title: { ru: 'С чего начать', en: 'Getting started' },
      cover: 'stories/howto/cover.webp',
      get slides() { return Array.from({ length: 12 }, (_, i) => `stories/howto2/${state.lang === 'ru' ? '' : 'en/'}${i + 1}.webp?v=2`); },
    },
  ];
  const seenStory = (id) => (state.me.seenStories || []).includes(id);
  const storyLang = (s) => !s.langs || s.langs.includes(state.lang);
  const visibleStories = () => STORIES.filter((s) => storyLang(s) && !(s.days && (state.daysSinceStart || 0) >= s.days));

  function renderStories() {
    const el = $('#storiesRow');
    const list = visibleStories().map((s, k) => [s, k]).sort((a, b) => (Number(seenStory(a[0].id)) - Number(seenStory(b[0].id))) || (a[1] - b[1])).map((x) => x[0]);
    if (!list.length) { el.innerHTML = ''; return; }
    // плитка: [иконка, фон, цвет иконки] по типу истории
    const tile = (s) => (s.id.startsWith('milestone') ? ['gifts', '#ffffff', '#000'] : s.id.startsWith('week-sum') ? ['statistic', '#4d72f5', '#fff']
      : s.id.startsWith('week-plan') ? ['calendar', '#000', '#fff957'] : s.id.startsWith('month') ? ['payment', '#ffb08a', '#000'] : ['education', '#ffffff', '#000']);
    el.innerHTML = `<div class="stories">${list.map((s) => {
      const [ic, bg, fg] = tile(s);
      return `
      <button class="story-tile ${seenStory(s.id) ? 'seen' : ''}" data-story="${s.id}" aria-label="${esc(s.title[state.lang] || s.title.ru)}">
        <span class="st-ring"><span class="st-tile" style="background:${bg}">${ico(ic, 26, fg)}</span></span>
        <span class="st-label">${esc(s.title[state.lang] || s.title.ru)}</span>
      </button>`;
    }).join('')}</div>`;
    el.querySelectorAll('[data-story]').forEach((b) => b.addEventListener('click', () => {
      haptic('select');
      openStory(STORIES.find((s) => s.id === b.dataset.story));
    }));
  }

  function markStorySeen(story) {
    if (seenStory(story.id)) return;
    state.me.seenStories = [...(state.me.seenStories || []), story.id];
    api('/stories/seen', { method: 'POST', body: { id: story.id } }).catch(() => {});
    renderStories();
  }

  // Полноэкранный просмотр: полоски прогресса, тап справа — дальше, слева — назад,
  // удержание — пауза, свайп вниз или крестик — закрыть. Возвращает промис, который выполнится при закрытии.
  function openStory(story, start = 0) {
    return new Promise((resolve) => {
      if (!story) return resolve();
      const n = story.slides.length, dur = story.duration || 6000;
      let i = start, elapsed = 0, paused = false, last = performance.now(), raf = 0, closed = false;
      story.slides.forEach((src) => { if (typeof src === 'string') { const im = new Image(); im.src = src; } }); // заранее подгружаем картинки

      const v = document.createElement('div');
      v.className = 'story-viewer';
      v.innerHTML = `
        <img class="sv-bg" alt=""><img class="sv-img" alt=""><div class="sv-html"></div>
        <div class="sv-bars">${story.slides.map(() => '<div><i></i></div>').join('')}</div>
        <button class="sv-close" aria-label="${t('close')}">×</button>
        <div class="sv-touch"></div>`;
      const img = $('.sv-img', v), bars = [...v.querySelectorAll('.sv-bars i')];
      const entry = { sheet: v, backdrop: document.createElement('div'), onClose: () => { closed = true; cancelAnimationFrame(raf); removeEventListener('resize', fit); resolve(); } };
      document.body.append(v);
      sheets.push(entry); updateBackButton();
      requestAnimationFrame(() => v.classList.add('open'));
      markStorySeen(story);

      const bg = $('.sv-bg', v), box = $('.sv-html', v);
      // html-слайд рисуется в 1080×1920 и масштабируется: на телефоне — на весь экран, на широком — целиком
      const fit = () => {
        const page = box.firstElementChild; if (!page) return;
        const vw = innerWidth, vh = innerHeight;
        const k = vw / vh <= 9 / 16 ? Math.max(vw / 1080, vh / 1920) : Math.min(vw / 1080, vh / 1920);
        page.style.transform = `translate(-50%, -50%) scale(${k})`;
      };
      const fitNumbers = () => box.querySelectorAll('.wr-num').forEach((n) => {
        let f = parseFloat(getComputedStyle(n).fontSize);
        while (n.scrollWidth > n.clientWidth && f > 60) { f -= 4; n.style.fontSize = `${f}px`; }
      });
      addEventListener('resize', fit);
      const show = () => {
        const sl = story.slides[i];
        if (typeof sl === 'string') {
          box.innerHTML = ''; img.hidden = bg.hidden = false;
          img.src = sl; bg.src = sl;
        } else {
          img.hidden = bg.hidden = true; img.removeAttribute('src');
          box.innerHTML = sl.html; fit();
          (document.fonts ? document.fonts.ready : Promise.resolve()).then(fitNumbers);
          if (sl.onShow) sl.onShow(box, () => closeSheet(entry));
        }
        bars.forEach((b, k) => { b.style.width = k < i ? '100%' : '0%'; });
      };
      const next = () => { if (i < n - 1) { i++; elapsed = 0; show(); } else closeSheet(entry); };
      const prev = () => { if (i > 0) i--; elapsed = 0; show(); };
      const loop = (now) => {
        if (closed) return;
        const hold = typeof story.slides[i] === 'object' && story.slides[i].hold;
        if (!paused && !hold && (img.hidden || img.complete)) elapsed += now - last;
        last = now;
        bars[i].style.width = hold ? '100%' : `${Math.min(100, (elapsed / dur) * 100)}%`;
        if (!hold && elapsed >= dur) next();
        raf = requestAnimationFrame(loop);
      };

      // касания: короткий тап — листать, удержание — пауза, свайп вниз — закрыть
      const touch = $('.sv-touch', v);
      let down = null;
      touch.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; paused = true; });
      touch.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dy = e.clientY - down.y;
        if (dy > 0) { v.style.transform = `translateY(${dy}px)`; v.style.opacity = String(Math.max(0.4, 1 - dy / 600)); }
      });
      const up = (e) => {
        if (!down) return;
        const dy = e.clientY - down.y, dt = performance.now() - down.t, dx = Math.abs(e.clientX - down.x);
        paused = false; v.style.transform = ''; v.style.opacity = '';
        if (dy > 90) closeSheet(entry);
        else if (dt < 300 && dx < 20 && Math.abs(dy) < 20) { haptic('select'); (e.clientX < innerWidth * 0.3 ? prev : next)(); }
        down = null;
      };
      touch.addEventListener('pointerup', up);
      touch.addEventListener('pointercancel', () => { down = null; paused = false; v.style.transform = ''; v.style.opacity = ''; });
      $('.sv-close', v).addEventListener('click', () => closeSheet(entry));
      document.addEventListener('keydown', function onKey(e) {
        if (closed) return document.removeEventListener('keydown', onKey);
        if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev(); else if (e.key === 'Escape') closeSheet(entry);
      });

      show();
      raf = requestAnimationFrame(loop);
    });
  }

  // ---------- персональная история «Ваш месяц» ----------
  // Собирается из данных прошлого месяца; висит в ленте весь следующий месяц.
  // Правила: меньше 5 трат — истории нет; нет прошлого месяца для сравнения — без слайда 2;
  // нет доходов — без слайдов 3 и 4.
  const CAT_ACC = {
    groceries: 'продукты', cafe: 'кафе и рестораны', delivery: 'доставку', transport: 'транспорт', taxi: 'такси',
    carsharing: 'каршеринг', fuel: 'топливо', car_service: 'обслуживание авто', car_goods: 'товары для авто',
    housing: 'жильё', utilities: 'связь и ЖКУ', health: 'здоровье', beauty: 'уход и гигиену', household: 'дом и быт',
    clothes: 'одежду и обувь', shopping: 'покупки', fun: 'развлечения', sport: 'спорт', subscriptions: 'подписки',
    travel: 'путешествия', education: 'обучение', kids: 'детей', pets: 'питомцев', savings: 'инвестиции и сбережения', gifts: 'подарки', other: 'прочее',
  };
  // Суммы для слайдов: обычные пробелы (в шрифте Unbounded неразрывный пробел нулевой ширины)
  const wrMoney = (n, cur) => {
    try {
      return new Intl.NumberFormat(state.lang === 'ru' ? 'ru-RU' : 'en-GB', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(Math.abs(n)).replace(/[  ]/g, ' ');
    } catch { return `${Math.round(Math.abs(n))} ${cur}`; }
  };

  // Творительный падеж месяцев: «по сравнению с августом»
  const MONTHS_RU_INS = ['январём', 'февралём', 'мартом', 'апрелем', 'маем', 'июнем', 'июлем', 'августом', 'сентябрём', 'октябрём', 'ноябрём', 'декабрём'];
  const w3Ill = (name, style) => `<img class="w2-ill" src="illus/${name}.svg" alt="" style="${style}">`;
  const w3Tag = (title, sub = '') => `<div class="w2-tag">${title}${sub ? `<small>${sub}</small>` : ''}</div>`;
  const w3Ci = (icon, bg) => `<div class="w2-ci" style="background:${bg}">${ico(icon, 62, '#000')}</div>`;

  function buildMonthStory(s) {
    const cur = s.base, ru = isRu();
    const expenseCount = s.categories.reduce((a, c) => a + c.count, 0);
    if (expenseCount < 5 || !s.total) return null;
    const mi = Number(s.month.slice(5, 7)) - 1;
    const name = ru ? MONTHS.ru[mi] : MONTHS.en[mi];
    const hasPrev = s.prevTotal > 0;
    const pct = hasPrev ? Math.round(Math.abs(s.total - s.prevTotal) / s.prevTotal * 100) : 0;
    const less = !hasPrev || s.total <= s.prevTotal;
    const result = s.income - s.total;
    const top = s.categories[0];
    const busiest = s.days.reduce((b, v, d) => (v > b.v ? { v, d } : b), { v: 0, d: 0 });
    const user = state.me.first_name || '';
    const T = w3Tag(ru ? `Ваш ${name}` : `Your ${name}`, ru ? 'итоги месяца' : 'monthly recap');
    const wrap = (body, top = 470) => `<div class="w2-wrap" style="top:${top}px">${body}</div>`;
    const big = (n, sign = false) => `<div class="w2-num">${bigMoney(n, cur, sign)}</div>`;
    const out = [];
    out.push({ html: w2Page('#fff957', '#000', w3Ill('wallet', 'right:-150px;bottom:30px;width:540px;transform:rotate(-14deg)') + T
      + wrap(`<div class="w3-cap">${ru ? `В ${MONTHS.ruPrep[mi]}<br>вы потратили` : `In ${name}<br>you spent`}</div>${big(s.total)}`)) });
    if (hasPrev) {
      const prevName = ru ? MONTHS_RU_INS[(mi + 11) % 12] : MONTHS.en[(mi + 11) % 12];
      const diff = Math.abs(s.total - s.prevTotal);
      const pill = diff >= 1 ? `<div class="w2-pill w3-pill">${ico(less ? 'trend_down' : 'trend_up', 52, '#000')} ${ru ? `на ${esc(money(diff, cur, { round: true }))} ${less ? 'меньше' : 'больше'}` : `${esc(money(diff, cur, { round: true }))} ${less ? 'less' : 'more'}`}</div>` : '';
      out.push({ html: w2Page(less ? '#8fd9ae' : '#ffb08a', '#000', w3Ill('note', 'right:-140px;bottom:120px;width:520px;transform:rotate(-16deg)') + T
        + wrap(`<div class="w3-cap">${ru ? `По сравнению<br>с ${prevName}` : `Compared<br>to ${prevName}`}</div>
          <div class="w2-num">${pct === 0 ? '' : less ? '−' : '+'}${pct}<span class="fr">%</span></div>${pill}
          <div class="w3-small">${esc(money(s.total, cur, { round: true }))} ${ru ? 'против' : 'vs'} ${esc(money(s.prevTotal, cur, { round: true }))}</div>`)) });
    }
    if (s.income > 0) {
      out.push({ html: w2Page('#4d72f5', '#fff', w3Ill('coin', 'right:-110px;bottom:200px;width:480px;transform:rotate(12deg)')
        + w3Ill('star', 'right:330px;bottom:520px;width:150px;transform:rotate(-12deg)') + T
        + wrap(`<div class="w3-cap">${ru ? `В ${MONTHS.ruPrep[mi]}<br>вы заработали` : `In ${name}<br>you earned`}</div>${big(s.income)}`)) });
      out.push({ html: w2Page('#000', '#fff', w3Ill('dollar', 'right:-60px;bottom:180px;width:400px;transform:rotate(12deg)') + T
        + wrap(`<div class="w3-cap">${ru ? 'Финансовый<br>результат месяца' : 'Your balance<br>for the month'}</div>
          <div style="color:${result >= 0 ? '#fff957' : '#ffb08a'}">${big(result, true)}</div>
          <div class="w3-facts" style="width:760px">
            <div class="w3-fact">${w3Ci('plus', '#8fd9ae')}<div>${esc(money(s.income, cur, { round: true }))} ${ru ? 'доходов' : 'income'}</div></div>
            <div class="w3-fact">${w3Ci('minus', '#ffb08a')}<div>${esc(money(s.total, cur, { round: true }))} ${ru ? 'расходов' : 'spending'}</div></div></div>`)) });
    }
    const topName = ru ? (CAT_ACC[top.category] || catName(top.category).toLowerCase()) : catName(top.category);
    out.push({ html: w2Page('#fff', '#000', w3Ill('ruble', 'right:-80px;bottom:200px;width:380px;transform:rotate(-12deg)') + T
      + wrap(`<div class="w3-cap">${ru ? 'Больше всего вы<br>тратили на' : 'You spent<br>the most on'}</div>
        <div class="w2-card w2-top" style="margin-top:60px">${w2Ico(top.category)}<div><div class="w2-v">${esc(topName)}</div>
          <div class="w2-k" style="margin-top:6px">${Math.round(top.amount / s.total * 100)}% ${ru ? 'всех трат' : 'of all spending'}</div></div></div>
        <div style="margin-top:40px">${big(top.amount)}</div>`)) });
    if (busiest.v > 0) {
      out.push({ html: w2Page('#ffb08a', '#000', w3Ill('euro', 'right:-70px;bottom:190px;width:380px;transform:rotate(12deg)') + T
        + wrap(`<div class="w3-cap">${ru ? 'Самый дорогой<br>день месяца' : 'Your priciest<br>day of the month'}</div>
          <div class="w3-big" style="margin-top:40px">${busiest.d + 1}</div><div class="w3-unit">${ru ? MONTHS.ruGen[mi] : name}</div>
          <div class="w2-pill w3-pill">${ru ? 'вы потратили' : 'you spent'} ${esc(money(busiest.v, cur, { round: true }))}</div>`)) });
    }
    const nm = user ? `, ${esc(user)}` : '';
    const finalText = ru ? (less ? `Так держать${nm}!` : `Отличная работа${nm}! Давайте постараемся в ${MONTHS.ruPrep[(mi + 1) % 12]}.`)
      : (less ? `Keep it up${nm}!` : `Great job${nm}! Let’s do even better in ${MONTHS.en[(mi + 1) % 12]}.`);
    out.push({ html: w2Page('#fff957', '#000', w3Ill('star', 'right:120px;top:1150px;width:300px;transform:rotate(-12deg)')
      + w3Ill('coin', 'left:-120px;bottom:120px;width:460px;transform:rotate(14deg)') + T
      + wrap(`<div class="w3-big" style="font-size:${finalText.length > 26 ? 104 : 150}px;letter-spacing:-5px;line-height:1.02">${finalText}</div>`, 560)) });
    // призыв поделиться: кнопка открывает карточку с типажом; слайд не листается сам
    out.push({ hold: true, html: w2Page('#000', '#fff', T + wrap(`<div class="w3-cap" style="font-size:62px">${ru
        ? 'Узнайте свой финансовый типаж и поделитесь с друзьями — а мы подарим 5 сканов'
        : 'Discover your money personality and share it with friends — we’ll give you 5 free scans'}</div>`, 400)
      + '<div class="w3-prev" style="background:#fff957"><img data-preview alt=""></div>'
      + w3Ill('star', 'right:90px;top:1300px;width:200px;transform:rotate(12deg)')
      + `<button class="w3-btn" data-share>${ru ? 'Я в деле!' : 'I’m in!'}</button>`),
      onShow: (root, close) => {
        const img = root.querySelector('[data-preview]');
        if (img && !img.src) drawShareCard(shareData(s)).then((c) => { img.src = c.toDataURL('image/jpeg', 0.8); }).catch(() => {});
        const b = root.querySelector('[data-share]');
        if (b) b.addEventListener('click', () => { haptic('select'); close(); openShareSheet(s); });
      } });
    return { id: `month-${s.month}`, duration: 5000, title: { ru: `Ваш ${MONTHS.ru[mi]}`, en: `Your ${MONTHS.en[mi]}` }, slides: out, dynamic: 'month' };
  }

  // ---------- шеринг: карточка «Мой типаж месяца» ----------
  const BOT_USERNAME = 'potrachenbot';
  const ARCHETYPES = {
    groceries: ['Домашний шеф', '1f9d1-200d-1f373'], cafe: ['Гурман', '1f37d'], delivery: ['Друг всех курьеров', '1f6f5'],
    taxi: ['Passenger princess', '1f451'], carsharing: ['Искатель каршеринга', '1f699'], fuel: ['Директор заправки', '26fd'],
    housing: ['Домосед', '1f6cb'], clothes: ['Ценитель good fabric', '1f9f5'], shopping: ['Директор по покупкам', '1f6cd'],
    fun: ['Главный по веселью', '1f973'], sport: ['Киборг', '1f9be'], travel: ['Путешественник', '1f9f3'],
    subscriptions: ['Любимый подписчик', '1f37f'], education: ['Своего рода учёный', '1f9d1-200d-1f52c'], pets: ['Котопёс', '1f43e'],
    kids: ['Супер-родитель', '1f9b8'], savings: ['Акционер', '1f4c8'], gifts: ['Гуманист', '1f49d'],
  };
  const DEFAULT_ARCHETYPE = ['Финансовый стратег', '265f'];
  const ARCHETYPES_EN = {
    groceries: 'Home chef', cafe: 'Foodie', delivery: 'Every courier’s best friend', taxi: 'Passenger princess', carsharing: 'Carsharing hunter',
    fuel: 'Gas station regular', housing: 'Homebody', clothes: 'Good fabric connoisseur', shopping: 'Chief shopping officer', fun: 'Life of the party',
    sport: 'Cyborg', travel: 'Globetrotter', subscriptions: 'Favorite subscriber', education: 'A scholar of sorts', pets: 'Pet parent',
    kids: 'Super parent', savings: 'Shareholder', gifts: 'Humanist',
  };

  // Данные карточки из сводки месяца: без сумм, только проценты и достижения. Факт: [значок, фон, текст]
  function shareData(s) {
    const mi = Number(s.month.slice(5, 7)) - 1;
    const top = s.categories[0];
    const ru = state.lang === 'ru';
    const title = ru ? (ARCHETYPES[top.category] || DEFAULT_ARCHETYPE)[0] : (ARCHETYPES_EN[top.category] || 'Financial strategist');
    const facts = [];
    if (s.prevTotal > 0 && s.total < s.prevTotal) {
      const p = Math.round((s.prevTotal - s.total) / s.prevTotal * 100);
      facts.push(['trend_down', '#8fd9ae', ru ? `−${p}% трат к ${MONTHS.ruDat[(mi + 11) % 12]}` : `−${p}% spending vs ${MONTHS.en[(mi + 11) % 12]}`]);
    }
    if (s.income > 0 && s.income > s.total) {
      const p = Math.round((s.income - s.total) / s.income * 100);
      facts.push(['wallet', '#eaeeff', ru ? `Месяц в плюсе: осталось ${p}% дохода` : `Month in the black: ${p}% of income left`]);
    }
    facts.push([top.category, tintOf(top.category), ru ? `Больше всего — на ${CAT_ACC[top.category] || catName(top.category).toLowerCase()}` : `Spent the most on ${catName(top.category).toLowerCase()}`]);
    const tracked = s.days.filter((v) => v > 0).length;
    if (facts.length < 3) facts.push(['calendar', '#ffe1d0', ru ? `Учёт вёлся ${tracked} дней из ${s.days.length}` : `Tracked ${tracked} of ${s.days.length} days`]);
    return { month: ru ? MONTHS.ru[mi] : MONTHS.en[mi], title, cat: top.category, facts: facts.slice(0, 3) };
  }

  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function wrapLines(ctx, text, maxW) {
    const words = text.split(' '), lines = [];
    let line = '';
    for (const w of words) {
      const t = line ? `${line} ${w}` : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  }
  function spaced(ctx, text, x, y, gap) { for (const ch of text) { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + gap; } }

  // ---- рисование карточек (стиль историй: плоский цвет, чёрная обводка, жёсткая тень) ----
  const svgImg = (svg) => loadImg(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))}`);
  const cvFonts = () => Promise.all(['800 40px Man', '700 40px Man'].map((f) => (document.fonts ? document.fonts.load(f, 'АаZz') : null)));
  function cvBox(ctx, x, y, w, h, r, fill, sh = 12) {
    ctx.fillStyle = '#000'; rr(ctx, x + sh * 0.85, y + sh, w, h, r); ctx.fill();
    ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.stroke();
  }
  // кружок со значком: id категории или имя иконки из набора
  async function cvIcon(ctx, id, x, y, d, bg) {
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x + d / 2, y + d / 2, d / 2 - 2.5, 0, 2 * Math.PI); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.stroke();
    let name = null, emoji = null;
    if (window.ICONS.CAT[id] !== undefined || state.custom && state.custom.some((c) => c.id === id)) {
      const c = cat(id), pe = state.prefs && state.prefs[id] && state.prefs[id].emoji;
      const own = c.custom || (pe && state.baseCats[id] && pe !== state.baseCats[id].emoji);
      if (window.ICONS.CAT[id] && !own) name = window.ICONS.CAT[id]; else emoji = c.emoji;
    } else name = id;
    if (name) {
      const im = await svgImg(window.ICONS.icon(name, 96, '#000')).catch(() => null);
      if (im) ctx.drawImage(im, x + d * 0.25, y + d * 0.25, d * 0.5, d * 0.5);
    } else if (emoji) {
      ctx.font = `${Math.round(d * 0.48)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#000';
      ctx.fillText(emoji, x + d / 2, y + d * 0.67); ctx.textAlign = 'left';
    }
  }
  async function cvIll(ctx, name, x, y, w, deg) {
    const im = await loadImg(`illus/${name}.svg`).catch(() => null);
    if (!im) return;
    const h = w * (im.naturalHeight / im.naturalWidth || 1);
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(deg * Math.PI / 180); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
  }
  const setLs = (ctx, px) => { if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`; };
  // логотип и кнопка «Считаю деньги в @бот» внизу карточки
  function cvFooter(ctx, W, H, fg, pill, pillText, accent) {
    const L = 110, CW = W - 2 * L, ctaH = 126, ctaY = H - 150 - ctaH;
    ctx.fillStyle = fg; setLs(ctx, -1); ctx.font = '800 50px Man'; ctx.fillText('потрачено', L, ctaY - 96); setLs(ctx, 0);
    ctx.globalAlpha = 0.6; ctx.font = '800 22px Man'; spaced(ctx, BRAND_SUB(), L, ctaY - 58, 7); ctx.globalAlpha = 1;
    ctx.fillStyle = pill; rr(ctx, L, ctaY, CW, ctaH, 44); ctx.fill();
    const a = state.lang === 'ru' ? 'Считаю деньги в ' : 'I track money with ', b = `@${BOT_USERNAME}`;
    let fs = 46;
    do { fs -= 2; ctx.font = `800 ${fs}px Man`; } while (ctx.measureText(a + b).width > CW - 80 && fs > 30);
    const tw = ctx.measureText(a + b).width, tx = L + (CW - tw) / 2, ty = ctaY + ctaH / 2 + fs * 0.36;
    ctx.fillStyle = pillText; ctx.fillText(a, tx, ty);
    ctx.fillStyle = accent; ctx.fillText(b, tx + ctx.measureText(a).width, ty);
  }

  // Карточка «Мой типаж месяца» 1080×1920
  async function drawShareCard(d) {
    await cvFonts();
    const W = 1080, H = 1920, L = 110, CW = W - 2 * L, ru = state.lang === 'ru';
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff957'; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    await cvIll(ctx, 'star', W - 90 - 170, 150, 170, 14);
    ctx.fillStyle = '#000'; setLs(ctx, -0.5); ctx.font = '800 44px Man'; ctx.fillText(ru ? `Мой ${d.month}` : `My ${d.month}`, L, 232);
    await cvIcon(ctx, d.cat, L, 340, 128, '#fff');
    ctx.globalAlpha = 0.7; ctx.fillStyle = '#000'; ctx.font = '800 46px Man'; setLs(ctx, -1);
    ctx.fillText(ru ? 'Мой типаж' : 'My money', L + 158, 396); ctx.fillText(ru ? 'месяца' : 'personality', L + 158, 450); ctx.globalAlpha = 1;
    // типаж: не больше двух строк, слово не разрывается
    let fs = 150, lines;
    for (;;) {
      ctx.font = `800 ${fs}px Man`; setLs(ctx, -fs * 0.04);
      lines = wrapLines(ctx, d.title, CW);
      const tooWide = d.title.split(' ').some((w) => ctx.measureText(w).width > CW);
      if ((lines.length <= 2 && !tooWide) || fs <= 80) break;
      fs -= 6;
    }
    let y = 520 + fs * 0.8;
    lines.forEach((ln, k) => ctx.fillText(ln, L - 4, y + k * fs * 0.98));
    y += (lines.length - 1) * fs * 0.98 + fs * 0.2 + 70;
    setLs(ctx, 0);
    for (const [icon, bg, text] of d.facts) {
      ctx.font = '800 42px Man';
      const tl = wrapLines(ctx, text, CW - 34 - 96 - 30 - 34);
      const h = Math.max(152, 56 + tl.length * 50);
      cvBox(ctx, L, y, CW, h, 44, '#fff', 12);
      await cvIcon(ctx, icon, L + 34, y + (h - 96) / 2, 96, bg);
      ctx.fillStyle = '#000'; ctx.font = '800 42px Man';
      const ty = y + h / 2 - (tl.length - 1) * 25 + 15;
      tl.forEach((ln, k) => ctx.fillText(ln, L + 34 + 96 + 30, ty + k * 50));
      y += h + 26;
    }
    cvFooter(ctx, W, H, '#000', '#000', '#fff', '#fff957');
    return c;
  }

  async function grantShareBonus(milestone = null) {
    try {
      const r = await api('/share/bonus', { method: 'POST', body: milestone ? { milestone } : {} });
      state.me.scans = r.scans;
      if (milestone) state.me.milestonesShared = [...(state.me.milestonesShared || []), milestone];
      else state.me.sharedThisMonth = true;
      if (r.granted) { haptic('success'); toast(t('shareBonus', r.bonus)); }
    } catch { /* бонус не критичен */ }
  }

  // Окно «Поделиться»: превью карточки, публикация в истории Telegram и сохранение картинки (для Instagram)
  async function openShareSheet(summary) {
    const d = shareData(summary);
    const storyText = state.lang === 'ru' ? `Мой типаж месяца — ${d.title}. Считаю деньги в @${BOT_USERNAME}` : `My money personality this month: ${d.title}. I track money with @${BOT_USERNAME}`;
    return openShareCard({ draw: () => drawShareCard(d), storyText,
      file: `potracheno-${summary.month}.jpg`, hint: !state.me.sharedThisMonth, milestone: null });
  }
  // draw — рисует canvas; milestone — номер юбилея (бонус за юбилей) или null (бонус за итоги месяца)
  async function openShareCard({ draw, storyText, file, hint, milestone }) {
    const sh = openSheet(`<div class="loading"><div class="spinner"></div><b>${t('shareMaking')}</b></div>`);
    let canvas;
    try { canvas = await draw(); } catch (e) { closeSheet(sh); toast(t('netError')); return; }
    const jpeg = canvas.toDataURL('image/jpeg', 0.88);
    let uploaded = null;
    const upload = async () => {
      if (uploaded) return uploaded;
      const r = await api('/share/image', { method: 'POST', body: { data: jpeg.split(',')[1] } });
      uploaded = r.url; return uploaded;
    };
    const canStory = !!(tg && tg.initData && tg.shareToStory && tg.isVersionAtLeast('7.8'));
    const canDownload = !!(tg && tg.initData && tg.downloadFile && tg.isVersionAtLeast('8.0'));
    sh.sheet.innerHTML = `<div class="sheet-grip"></div>
      <div class="sheet-head"><h2>${t('shareTitle')}</h2><button class="close">${t('close')}</button></div>
      <img class="share-preview" src="${jpeg}" alt="">
      ${hint ? `<div class="note" style="margin:0 4px 12px;text-align:center">🎁 ${t('shareHint', state.me.shareBonus || 5)}</div>` : ''}
      <button class="btn btn-primary btn-block" id="shStory">${t('shareStory')}</button>
      <button class="btn btn-secondary btn-block" id="shSave" style="margin-top:8px">${t('shareSave')}</button>`;
    $('.close', sh.sheet).addEventListener('click', () => closeSheet(sh));
    $('#shStory', sh.sheet).addEventListener('click', async (ev) => {
      const btn = ev.currentTarget; btn.disabled = true;
      try {
        const mediaUrl = await upload();
        if (canStory) {
          const params = { text: storyText };
          // кликабельная ссылка в истории доступна только с Telegram Premium
          if (tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.is_premium) {
            params.widget_link = { url: `https://t.me/${BOT_USERNAME}?start=ref_${state.me.id}`, name: 'Потрачено' };
          }
          tg.shareToStory(mediaUrl, params);
          grantShareBonus(milestone);
        } else {
          toast(t('shareNoStory'));
        }
      } catch { toast(t('netError')); }
      btn.disabled = false;
    });
    $('#shSave', sh.sheet).addEventListener('click', async (ev) => {
      const btn = ev.currentTarget; btn.disabled = true;
      try {
        if (canDownload) {
          tg.downloadFile({ url: await upload(), file_name: file });
        } else {
          const a = document.createElement('a'); a.href = jpeg; a.download = file; document.body.append(a); a.click(); a.remove();
        }
        grantShareBonus(milestone);
      } catch { toast(t('netError')); }
      btn.disabled = false;
    });
  }

  // ---------- юбилеи: месяц, 100/200/300 дней, год ----------
  const MILESTONES = [
    { d: 30, n: '1', unit: 'месяц', phrase: 'Уже целый месяц', title: 'Месяц с нами', bg: '#fff957', fg: '#000' },
    { d: 100, n: '100', unit: 'дней', phrase: '100 дней', title: '100 дней', bg: '#4d72f5', fg: '#fff' },
    { d: 200, n: '200', unit: 'дней', phrase: '200 дней', title: '200 дней', bg: '#ffb08a', fg: '#000' },
    { d: 300, n: '300', unit: 'дней', phrase: '300 дней', title: '300 дней', bg: '#8fd9ae', fg: '#000' },
    { d: 365, n: '1', unit: 'год', phrase: 'Целый год', title: 'Год с нами', bg: '#000', fg: '#fff' },
  ];
  const MILESTONES_EN = {
    30: { unit: 'month', phrase: 'A whole month', title: 'One month with us' }, 100: { unit: 'days', phrase: '100 days', title: '100 days' },
    200: { unit: 'days', phrase: '200 days', title: '200 days' }, 300: { unit: 'days', phrase: '300 days', title: '300 days' },
    365: { unit: 'year', phrase: 'A whole year', title: 'One year with us' },
  };
  const msT = (m) => (state.lang === 'ru' ? m : { ...m, ...MILESTONES_EN[m.d] });
  // конфетти: [x, y, цвет, поворот]; кусочки цвета фона не рисуем
  const CONFETTI = [[140, 1240, '#fff957', -20], [860, 1080, '#8fd9ae', 30], [300, 1560, '#ffb08a', 60], [760, 1450, '#ff8fb1', 15],
    [560, 1250, '#4d72f5', 45], [930, 1640, '#ffffff', 70], [640, 1700, '#8fd9ae', 20]];
  const confOf = (m) => CONFETTI.filter((x) => x[2] !== m.bg);
  // кнопка внизу карточки: на тёмном фоне — белая, на светлом — чёрная
  const msDark = (m) => m.fg === '#fff';
  // текущий юбилей — неделю после наступления
  function currentMilestone() {
    const days = state.daysTracking;
    if (!days) return null;
    return MILESTONES.find((m) => days >= m.d && days < m.d + 7) || null;
  }

  async function drawMilestoneCard(m0) {
    await cvFonts();
    const m = msT(m0), ru = state.lang === 'ru';
    const W = 1080, H = 1920, L = 110;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = m.bg; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    for (const [x, y, col, r] of confOf(m)) {
      ctx.save(); ctx.translate(x + 23, y + 10); ctx.rotate(r * Math.PI / 180);
      ctx.fillStyle = col; rr(ctx, -23, -10, 46, 20, 8); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.restore();
    }
    await cvIll(ctx, 'star', W - 110 - 300, 1080, 300, 12);
    ctx.fillStyle = m.fg; setLs(ctx, -0.5); ctx.font = '800 44px Man'; ctx.fillText(ru ? 'Мой юбилей' : 'My milestone', L, 232);
    const big = m.n.length < 3 ? 420 : 330;
    ctx.font = `800 ${big}px Man`; setLs(ctx, -big * 0.045); ctx.fillText(m.n, L - 8, 400 + big * 0.74);
    const unitY = 400 + big * 0.9 + 112;
    ctx.font = '800 120px Man'; setLs(ctx, -4); ctx.fillText(m.unit, L - 4, unitY);
    ctx.font = '700 52px Man'; setLs(ctx, -0.5);
    ctx.fillText(ru ? 'слежу за деньгами' : 'of tracking my money', L, unitY + 110);
    setLs(ctx, 0);
    cvFooter(ctx, W, H, m.fg, msDark(m) ? '#fff' : '#000', msDark(m) ? '#000' : '#fff', msDark(m) ? '#4d72f5' : '#fff957');
    return c;
  }
  function shareMilestone(m) {
    const mt = msT(m);
    const storyText = state.lang === 'ru' ? `${m.n} ${m.unit} слежу за деньгами в @${BOT_USERNAME} 🎉` : `${m.n} ${mt.unit} of tracking my money with @${BOT_USERNAME} 🎉`;
    return openShareCard({ draw: () => drawMilestoneCard(m), storyText,
      file: `potracheno-${m.d}.jpg`, hint: !(state.me.milestonesShared || []).includes(m.d), milestone: m.d });
  }
  function buildMilestoneStory(m0) {
    const ru = state.lang === 'ru', m = msT(m0);
    const conf = confOf(m).map(([x, y, col, r]) => `<div class="w3-conf" style="left:${x}px;top:${y}px;background:${col};transform:rotate(${r}deg)"></div>`).join('');
    const T = w3Tag(ru ? 'Юбилей' : 'Milestone');
    const text = ru ? `${m.phrase} вы следите за деньгами. Это не только привычка, но повод гордиться собой. Отличная работа!`
      : `${m.phrase} of tracking your money. It’s not just a habit — it’s something to be proud of. Great job!`;
    const congrats = w2Page(m.bg, m.fg, conf + w3Ill('star', 'right:110px;top:1250px;width:320px;transform:rotate(12deg)') + T
      + `<div class="w2-wrap" style="top:400px"><div class="w3-big" style="font-size:${m.n.length < 3 ? 420 : 330}px">${m.n}</div><div class="w3-unit">${m.unit}</div>
        <div class="w3-txt" style="width:820px">${text}</div></div>`);
    const bonus = !(state.me.milestonesShared || []).includes(m.d);
    const cta = { hold: true, html: w2Page('#000', '#fff', T + `<div class="w2-wrap" style="top:400px"><div class="w3-cap" style="font-size:62px">${ru
        ? `Поделитесь достижением с друзьями${bonus ? ' — а мы подарим 5 сканов' : ''}`
        : `Share your achievement with friends${bonus ? ' and get 5 free scans' : ''}`}</div></div>
      <div class="w3-prev" style="background:${m.bg}"><img data-preview alt=""></div>
      <button class="w3-btn" data-share>${ru ? 'Поделиться' : 'Share'}</button>`),
      onShow: (root, close) => {
        const img = root.querySelector('[data-preview]');
        if (img && !img.src) drawMilestoneCard(m0).then((c) => { img.src = c.toDataURL('image/jpeg', 0.8); }).catch(() => {});
        const b = root.querySelector('[data-share]');
        if (b) b.addEventListener('click', () => { haptic('select'); close(); shareMilestone(m0); });
      } };
    return { id: `milestone-${m.d}`, duration: 6000, dynamic: 'milestone', title: { ru: m0.title, en: MILESTONES_EN[m0.d].title }, slides: [{ html: congrats }, cta] };
  }
  function loadMilestoneStory() {
    const m = currentMilestone();
    for (let i = STORIES.length - 1; i >= 0; i--) if (STORIES[i].dynamic === 'milestone') STORIES.splice(i, 1);
    if (m) { STORIES.unshift(buildMilestoneStory(m)); renderStories(); }
  }

  // ---------- недельные истории: «План на неделю» и «Итоги недели» ----------
  const WEEKDAYS_ACC = ['в воскресенье', 'в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу'];
  const dayWord = (date, today) => {
    const ru = state.lang === 'ru';
    if (date === today) return ru ? 'сегодня' : 'today';
    const tm = new Date(`${today}T00:00:00Z`); tm.setUTCDate(tm.getUTCDate() + 1);
    if (date === tm.toISOString().slice(0, 10)) return ru ? 'завтра' : 'tomorrow';
    return (ru ? WEEKDAYS_ACC : WEEKDAYS_EN)[new Date(`${date}T00:00:00Z`).getUTCDay()];
  };
  const isCyr = (w) => /^[а-яё]/i.test(w);
  const isRu = () => state.lang === 'ru';
  const BRAND_SUB = () => (isRu() ? 'БЮДЖЕТ-БОТ' : 'BUDGET BOT');
  const WEEKDAYS_EN = ['on Sunday', 'on Monday', 'on Tuesday', 'on Wednesday', 'on Thursday', 'on Friday', 'on Saturday'];
  const lowerFirst = (w) => (isCyr(w) ? w.charAt(0).toLowerCase() + w.slice(1) : w);
  // «Аренда» → «на аренду». Склоняем только одно слово; составные названия идут через тире
  function accusative(word) {
    const w = lowerFirst(word);
    if (/[^аеёиоуыэюяй]а$/i.test(w)) return w.slice(0, -1) + 'у';
    if (/[^аеёиоуыэюя]я$/i.test(w)) return w.slice(0, -1) + 'ю';
    return w;
  }
  function planLine(it, income, today) {
    const day = `<span class="wk-day">${dayWord(it.date, today)}</span>`;
    const note = (it.note || '').trim();
    if (!isRu()) return `${esc(note || catName(it.category))} ${day}`;
    if (income) return `${esc(note ? lowerFirst(note) : catName(it.category).toLowerCase())} ${day}`;
    if (!note) return `на ${esc(CAT_ACC[it.category] || catName(it.category).toLowerCase())} ${day}`;
    if (/^\S+$/.test(note) && !/\d/.test(note)) return `на ${esc(accusative(note))} ${day}`;
    return `— ${esc(note)} ${day}`;
  }
  // ---- новые недельные истории (стиль приложения: жёлтый/чёрный/синий, Manrope, иллюстрации) ----
  const w2Logo = () => `<div class="w2-logo">потрачено<span>${BRAND_SUB()}</span></div>`;
  const w2Range = (a, b) => (a.slice(5, 7) === b.slice(5, 7) ? `${Number(a.slice(8, 10))}–${dayMonth(b)}` : `${dayMonth(a)} – ${dayMonth(b)}`);
  function w2Ico(id) {
    const c = cat(id), name = window.ICONS && window.ICONS.CAT[id];
    const pe = state.prefs && state.prefs[id] && state.prefs[id].emoji;
    const own = c.custom || (pe && state.baseCats[id] && pe !== state.baseCats[id].emoji);
    return `<div class="w2-ci" style="background:${tintOf(id)}">${name && !own ? ico(name, 62, '#000') : `<span style="font-size:64px">${esc(c.emoji)}</span>`}</div>`;
  }
  const w2Page = (bg, color, body) => `<div class="wr w2" style="background:${bg};color:${color}">${body}${w2Logo()}</div>`;

  function buildPlanStory(w) {
    const slides = [];
    const tag = `<div class="w2-tag">${isRu() ? 'План на неделю' : 'Week plan'}<small>${esc(w2Range(w.today, w.week.to))}</small></div>`;
    const rows = (list, income) => list.map((it) => `<div class="w2-card w2-row">${w2Ico(it.category)}
      <div><div class="w2-amt">${esc(money(it.amount, it.currency))}</div><div class="w2-what">${planLine(it, income, w.today)}</div></div></div>`).join('');
    if (w.plan.expenses.length) {
      slides.push({ html: w2Page('#000', '#fff', `<img class="w2-ill" src="illus/note.svg" alt="" style="right:-150px;top:-60px;width:520px;transform:rotate(-18deg)">${tag}
        <div class="w2-wrap" style="top:440px"><div class="w2-cap">${isRu() ? 'Запланированные<br>расходы' : 'Planned<br>expenses'}</div><div class="w2-rows">${rows(w.plan.expenses, false)}</div></div>`) });
    }
    if (w.plan.incomes.length) {
      slides.push({ html: w2Page('#4d72f5', '#fff', `<img class="w2-ill" src="illus/coin.svg" alt="" style="right:-110px;bottom:200px;width:480px;transform:rotate(12deg)">
        <img class="w2-ill" src="illus/star.svg" alt="" style="right:330px;bottom:520px;width:150px;transform:rotate(-12deg)">${tag}
        <div class="w2-wrap" style="top:440px"><div class="w2-cap">${isRu() ? 'Запланированные<br>доходы' : 'Planned<br>income'}</div><div class="w2-rows">${rows(w.plan.incomes, true)}</div></div>`) });
    }
    if (!slides.length) return null;
    return { id: `week-plan-${w.week.from}`, duration: 6000, dynamic: 'week', title: { ru: 'План на неделю', en: 'Week plan' }, slides };
  }

  function buildWeekSummaryStory(w) {
    const s = w.summary;
    if (!s) return null;
    let pill = '';
    if (s.avg) {
      const pct = Math.round(Math.abs(s.spent - s.avg) / s.avg * 100);
      const less = s.spent <= s.avg;
      const ru = isRu();
      pill = pct === 0 ? `<div class="w2-pill">${ru ? 'как обычно' : 'same as usual'}</div>`
        : `<div class="w2-pill">${ico(less ? 'trend_down' : 'trend_up', 52, '#000')} ${ru ? `на ${pct}% ${less ? 'меньше' : 'больше'}, чем обычно` : `${pct}% ${less ? 'less' : 'more'} than usual`}</div>`;
    }
    return {
      id: `week-sum-${w.week.from}`, duration: 6000, dynamic: 'week', title: { ru: 'Итоги недели', en: 'Week recap' },
      slides: [{ html: w2Page('#fff957', '#000', `<img class="w2-ill" src="illus/wallet.svg" alt="" style="right:-150px;bottom:30px;width:540px;transform:rotate(-14deg)">
        <div class="w2-tag">${isRu() ? 'Итоги недели' : 'Week recap'}<small>${esc(w2Range(s.from, s.to))}</small></div>
        <div class="w2-wrap" style="top:470px"><div class="w2-cap">${isRu() ? 'На прошлой неделе<br>вы потратили' : 'Last week<br>you spent'}</div>
          <div class="w2-num">${bigMoney(s.spent, w.base)}</div>${pill}
          <div class="w2-card w2-top">${w2Ico(s.top.category)}<div><div class="w2-k">${isRu() ? 'Категория #1' : 'Top category'}</div><div class="w2-v">${esc(isRu() ? catName(s.top.category).toLowerCase() : catName(s.top.category))}</div></div></div>
        </div>`) }],
    };
  }

  async function loadWeeklyStories() {
    try {
      const w = await api('/weekly');
      for (let i = STORIES.length - 1; i >= 0; i--) if (STORIES[i].dynamic === 'week') STORIES.splice(i, 1);
      // порядок в ленте: «План на неделю», «Итоги недели», затем остальные
      [buildWeekSummaryStory(w), buildPlanStory(w)].forEach((st) => { if (st) STORIES.unshift(st); });
      renderStories();
    } catch { /* недельные истории не критичны */ }
  }

  // История за прошлый месяц: подгружаем сводку и добавляем в начало ленты
  // В ленте — с 1-го по 7-е число по местному времени; по кнопке из сообщения бота открывается всегда
  async function loadMonthStory(force = false) {
    if (!force && Number(state.today.slice(8, 10)) > 7) return null;
    const prev = shiftMonth(state.today.slice(0, 7), -1);
    try {
      const { summary } = await api(`/summary?month=${prev}`);
      const story = buildMonthStory(summary);
      const i = STORIES.findIndex((x) => x.dynamic === 'month');
      if (i >= 0) STORIES.splice(i, 1);
      // месячная история — после недельных
      if (story) STORIES.splice(STORIES.filter((x) => x.dynamic === 'week').length, 0, story);
      renderStories();
      return story;
    } catch { return null; }
  }

  // ---------- главный экран ----------
  function monthTitle(m) {
    const [y, mm] = m.split('-').map(Number);
    const name = (state.lang === 'ru' ? MONTHS.ru : MONTHS.en)[mm - 1];
    return y === Number(state.today.slice(0, 4)) ? name : `${name} ${y}`;
  }
  function shiftMonth(m, d) {
    const [y, mm] = m.split('-').map(Number);
    const x = new Date(Date.UTC(y, mm - 1 + d, 1));
    return x.toISOString().slice(0, 7);
  }

  async function loadMonth() {
    $('#monthLabel').textContent = monthTitle(state.month);
    $('#nextMonth').disabled = state.month >= state.today.slice(0, 7);
    try {
      state.data = await api(`/summary?month=${state.month}`);
      if (!state.daysTracking && (state.data.entries || []).some((e) => e.source !== 'recurring')) state.daysTracking = 1; // первая запись — сегодня
      render();
    } catch (e) {
      toast(t('netError'));
    }
  }

  // сумма крупно: целая часть большая, копейки и валюта мельче
  function bigMoney(n, cur, withSign = false) {
    const str = money(Math.abs(n), cur);
    const m = str.match(/^(.*?\d)([.,]\d{2})?(\s*\D*)$/) || [null, str, '', ''];
    const sign = withSign ? (n > 0 ? '+' : n < 0 ? '−' : '') : (n < 0 ? '−' : '');
    // символ валюты перед числом (например, $) оставляем как есть
    if (/^\D/.test(str)) return `${sign ? `<span class="sg">${sign}</span>` : ''}${esc(str)}`;
    return `${sign ? `<span class="sg">${sign}</span>` : ''}${esc(m[1])}<span class="fr">${esc((m[2] || '') + (m[3] || ''))}</span>`;
  }

  function render() {
    const { summary: s, entries } = state.data;
    const base = s.base;
    const [, mm] = s.month.split('-').map(Number);
    const isCurrent = s.month === state.today.slice(0, 7);
    const monthIn = (state.lang === 'ru' ? MONTHS.ru : MONTHS.en)[mm - 1];

    // динамика расходов к прошлому месяцу
    let delta = '';
    const pct = s.prevTotal > 0 ? Math.round(((s.total - s.prevTotal) / s.prevTotal) * 100) : 0;
    if (s.prevTotal > 0 && s.total > 0 && Math.abs(pct) <= 300) {
      const prevIdx = (mm + 10) % 12;
      const prevName = state.lang === 'ru' ? MONTHS.ruDat[prevIdx] : MONTHS.en[prevIdx];
      delta = pct === 0 ? t('same') : `${pct > 0 ? '▲' : '▼'} ${Math.abs(pct)}% ${t('vs', prevName)}`;
    }
    const forecast = s.projected !== null && s.projected !== undefined
      ? `<div class="h-forecast">${t('projected')}: <b>${signed(s.projected, base)}</b></div>` : '';

    // ---- жёлтая шапка: остаток (если есть доходы) или сколько потрачено
    if (s.income > 0) {
      $('#hero').innerHTML = `
        <div class="h-label">${esc(t('balanceOf', monthIn))}</div>
        <div class="h-num num ${s.balance < 0 ? 'neg' : ''}">${bigMoney(s.balance, base, true)}</div>
        <div class="h-chips"><span class="h-chip">${t('income')} <b>${signed(s.income, base)}</b></span>
          <span class="h-chip">${t('expenses')} <b>${signed(-s.total, base)}</b></span></div>${forecast}`;
    } else {
      $('#hero').innerHTML = `
        <div class="h-label">${t('spent')}</div>
        <div class="h-num num">${bigMoney(s.total, base)}</div>
        <div class="h-chips"><span class="h-chip">${t('entries', s.count)}</span>${delta ? `<span class="h-chip">${esc(delta)}</span>` : ''}
          ${isCurrent && s.count ? `<button class="h-chip" id="heroAddIncome">+ ${t('addIncomeShort')}</button>` : ''}</div>${forecast}`;
      const hint = $('#heroAddIncome');
      if (hint) hint.addEventListener('click', () => openManual('income'));
    }

    // ---- пусто
    if (!s.categories.length && !s.incomeCategories.length) {
      $('#categoriesSection').innerHTML = `<div class="empty"><div class="big">${ico('invoice', 30, '#000')}</div>
        <b>${isCurrent ? t('emptyTitle') : t('emptyPast')}</b>${isCurrent ? esc(t('emptyTextIncome')) : ''}</div>`;
      $('#incomeSection').innerHTML = '';
      $('#upcomingSection').innerHTML = '';
      $('#entriesSection').innerHTML = '';
      renderStats();
      return;
    }

    // ---- категории: горизонтальные «таблетки», нажатие фильтрует историю
    const chips = (list, kind) => `<div class="chips-row">${list.map((c) => `
      <button class="cchip ${kind === 'income' ? 'inc' : ''} ${state.filter === c.category ? 'selected' : ''}" data-cat="${c.category}">
        ${catIco(c.category, 32)}${esc(catName(c.category))} <em class="num">${kind === 'income' ? '+' : ''}${money(c.amount, base, { round: true })}</em></button>`).join('')}</div>`;
    $('#categoriesSection').innerHTML = s.categories.length
      ? `<div class="section-title"><span>${esc(t('spentIn', monthIn))}</span><span class="num">${money(s.total, base)}</span></div>${chips(s.categories, 'expense')}` : '';
    $('#incomeSection').innerHTML = s.incomeCategories.length
      ? `<div class="section-title"><span>${t('income')}</span><span class="num">${money(s.income, base)}</span></div>${chips(s.incomeCategories, 'income')}` : '';
    document.querySelectorAll('#categoriesSection [data-cat], #incomeSection [data-cat]').forEach((b) => b.addEventListener('click', () => {
      haptic('select');
      state.filter = state.filter === b.dataset.cat ? null : b.dataset.cat;
      render();
      if (state.filter) $('#entriesSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));

    // ---- ожидается в этом месяце
    const up = s.upcoming || [];
    $('#upcomingSection').innerHTML = up.length ? `
      <div class="section-title"><span>${t('upcoming')}</span><button id="allRules">${t('showAll')}</button></div>
      <div class="list">${up.map((u) => `
        <button class="row" data-rule="${u.id}">
          ${catIco(u.category)}
          <div class="row-main">
            <div class="row-title">${esc(u.note || catName(u.category))}</div>
            <div class="row-sub">${esc(dayMonth(u.date))} · ${esc(t('repeatShort'))}</div>
          </div>
          <div class="row-amount num ${u.kind === 'income' ? 'pos-text' : ''}">${u.kind === 'income' ? '+' : '−'}${money(u.amount, u.currency)}${u.currency !== base ? `<small>≈ ${money(u.amount_base, base)}</small>` : ''}</div>
        </button>`).join('')}</div>` : '';
    if (up.length) {
      $('#allRules').addEventListener('click', openRecurringList);
      $('#upcomingSection').querySelectorAll('[data-rule]').forEach((b) => b.addEventListener('click', async () => {
        const { rules } = await api('/recurring').catch(() => ({ rules: [] }));
        const r = rules.find((x) => x.id === b.dataset.rule);
        if (r) openRuleEditor(r);
      }));
    }

    // ---- история по дням
    const list = state.filter ? entries.filter((e) => e.category === state.filter) : entries;
    const byDay = {};
    for (const e of list) (byDay[e.date] ||= []).push(e);
    const dayLabel = (d) => {
      if (d === state.today) return t('today');
      const y = new Date(`${state.today}T00:00:00Z`); y.setUTCDate(y.getUTCDate() - 1);
      if (d === y.toISOString().slice(0, 10)) return t('yesterday');
      return dayMonth(d);
    };
    const val = (e) => (e.kind === 'income' ? e.amount_base : -e.amount_base);
    $('#entriesSection').innerHTML = `
      <div class="section-title"><span>${state.filter ? esc(catName(state.filter)) : t('history')}</span>
        ${state.filter ? `<button id="clearFilter">${t('showAll')}</button>` : ''}</div>
      ${Object.entries(byDay).map(([d, items]) => {
        const dayTotal = items.reduce((a, e) => a + val(e), 0);
        return `
        <div class="day-title"><span>${dayLabel(d)}</span><span class="num">${signed(dayTotal, base)}</span></div>
        <div class="list">${items.map((e) => {
          const inc = e.kind === 'income';
          const rec = e.recurring_id && e.rec_active ? ` · ${t('repeatShort')}` : '';
          return `
          <button class="row" data-id="${e.id}">
            ${catIco(e.category)}
            <div class="row-main">
              <div class="row-title">${esc(e.note || e.merchant || catName(e.category))}</div>
              <div class="row-sub">${esc(catName(e.category))}${e.source === 'receipt' ? ` · ${t('receiptShort')}` : ''}${rec}</div>
            </div>
            <div class="row-amount num ${inc ? 'pos-text' : ''}">${inc ? '+' : '−'}${e.currency !== base
              ? `${money(e.amount, e.currency)}<small>≈ ${money(e.amount_base, base)}</small>`
              : money(e.amount, e.currency)}</div>
          </button>`;
        }).join('')}
        </div>`;
      }).join('')}`;
    const clear = $('#clearFilter');
    if (clear) clear.addEventListener('click', () => { state.filter = null; render(); });
    $('#entriesSection').querySelectorAll('[data-id]').forEach((b) => b.addEventListener('click', () => {
      const e = entries.find((x) => x.id === b.dataset.id);
      if (e) openEntryEditor(e);
    }));
    renderStats();
  }

  // ---------- вкладки ----------
  function switchTab(tab) {
    if (state.tab === tab) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    state.tab = tab;
    haptic('select');
    document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    $('#viewHome').hidden = tab !== 'home';
    $('#viewStats').hidden = tab !== 'stats';
    $('#viewProfile').hidden = tab !== 'profile';
    window.scrollTo(0, 0);
    if (tab === 'stats') renderStats();
    if (tab === 'profile') renderProfile();
    paintChrome();
  }
  // цвет шапки Telegram: жёлтый на главной, цвет фона на остальных вкладках
  function paintChrome() {
    if (!tg) return;
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#ffffff';
    try { tg.setHeaderColor(state.tab === 'home' || !state.tab ? '#fff957' : bg); } catch { /* */ }
    try { tg.setBackgroundColor(bg); } catch { /* */ }
    try { if (tg.setBottomBarColor) tg.setBottomBarColor(bg); } catch { /* */ }
  }

  // ---------- статистика ----------
  function renderStats() {
    const el = $('#viewStats');
    if (!el || !state.data || state.tab !== 'stats') return;
    const s = state.data.summary, base = s.base;
    const kind = state.statKind || 'expense';
    const list = kind === 'income' ? s.incomeCategories : s.categories;
    const total = kind === 'income' ? s.income : s.total;
    const [, mm] = s.month.split('-').map(Number);
    const monthName = (state.lang === 'ru' ? MONTHS.ru : MONTHS.en)[mm - 1];
    // -1 — выбран серый кусок «всё остальное»
    const sel = state.statSel === -1 && list.length > 6 ? -1 : Math.min(Math.max(state.statSel || 0, 0), Math.max(0, list.length - 1));
    // кольцо: до 6 крупных категорий своим цветом, остальное — одним серым куском.
    // Значки и полоски категорий на этом экране красятся в цвет своего куска, чтобы кольцо читалось.
    const COLORS = ['#4d72f5', '#fff957', '#ffb08a', '#8fd9ae', '#ff8fb1', '#b59cff'];
    const REST = '#a3a7b0';
    const colOf = (i) => (i < COLORS.length ? COLORS[i] : REST);
    const parts = list.slice(0, COLORS.length).map((c, i) => ({ frac: c.amount / (total || 1), col: COLORS[i], i }));
    const rest = list.slice(COLORS.length).reduce((a, c) => a + c.amount, 0);
    if (rest > 0) parts.push({ frac: rest / (total || 1), col: REST, i: -1 });
    const stIco = (id, i, size) => {
      const h = catIco(id, size).replace(/style="background:[^"]*"/, `style="background:${colOf(i)}"`);
      return i === 0 ? h.replace(/#000/g, '#fff') : h; // на синем значок белый
    };
    const R = 100, C = 2 * Math.PI * R;
    let off = 0, bubble = '';
    const arcs = parts.map((p) => {
      const L = Math.max(0.5, p.frac * C - (parts.length > 1 ? 5 : 0));
      const mid = (off + p.frac * C / 2) / C * 2 * Math.PI - Math.PI / 2;
      if (p.i === sel && p.frac < 0.999) bubble = `<div class="pct-bub" style="left:${118 + Math.cos(mid) * R}px;top:${118 + Math.sin(mid) * R}px">${pctLabel(p.frac)}</div>`;
      const arc = `<circle cx="118" cy="118" r="${R}" fill="none" stroke="${p.col}" stroke-width="${p.i === sel ? 30 : 24}" stroke-linecap="${parts.length > 1 ? 'round' : 'butt'}"
        stroke-dasharray="${L} ${C - L}" stroke-dashoffset="${-off}" transform="rotate(-90 118 118)" data-i="${p.i}"/>`;
      off += p.frac * C;
      return arc;
    }).join('');
    const cur = list[sel];
    const prevIdx = (mm + 10) % 12;
    const prevName = state.lang === 'ru' ? MONTHS.ruDat[prevIdx] : MONTHS.en[prevIdx];
    const prevTotal = kind === 'income' ? s.prevIncome : s.prevTotal;
    let chg = '';
    if (prevTotal > 0 && total > 0) {
      const p = Math.round((total - prevTotal) / prevTotal * 100);
      if (Math.abs(p) <= 300) {
        const good = kind === 'income' ? p >= 0 : p <= 0;
        chg = `<span class="chg ${good ? '' : 'bad'}">${p > 0 ? '▲' : p < 0 ? '▼' : ''} ${p > 0 ? '+' : p < 0 ? '−' : ''}${Math.abs(p)}% ${esc(t('vs', prevName))}</span>`;
      }
    }
    const isCurrent = s.month === state.today.slice(0, 7);
    el.innerHTML = `
      <div class="pg-top"><h1>${t('tabStats')}</h1></div>
      <div class="st-month"><button id="stPrev" aria-label="‹">‹</button><span>${esc(monthTitle(s.month))}</span><button id="stNext" ${isCurrent ? 'disabled' : ''} aria-label="›">›</button></div>
      <div class="seg" id="stKind"><button data-k="expense" class="${kind === 'expense' ? 'active' : ''}">${t('expensesTab')}</button><button data-k="income" class="${kind === 'income' ? 'active' : ''}">${t('incomesTab')}</button></div>
      ${list.length ? `
      <div class="donut"><svg width="236" height="236">${arcs}</svg>${bubble}
        <div class="mid">${sel === -1 ? `<span class="ci s52" style="background:${REST}">${ico('other', 26, '#000')}</span><b>${t('restAll')}</b><span class="num">${money(rest, base, { round: rest >= 1000 })}</span>`
          : cur ? `${stIco(cur.category, sel, 52)}<b>${esc(catName(cur.category))}</b><span class="num">${money(cur.amount, base, { round: cur.amount >= 1000 })}</span>` : ''}</div></div>
      <div class="st-total"><b class="num">${bigMoney(total, base).replace('class="fr"', 'class="fr" style="font-size:21px"')}</b>
        <div><span>${esc(kind === 'income' ? t('earnedIn', monthName) : t('spentIn', monthName))}</span>${chg}</div></div>
      <div class="st-list">${list.map((c, i) => `
        <button class="st-row ${i === sel ? 'sel' : ''}" data-i="${i}">${stIco(c.category, i, 44)}
          <div class="n"><b>${esc(catName(c.category))}</b><div class="bar"><i style="width:${Math.max(2, c.amount / (list[0].amount || 1) * 100)}%;background:${colOf(i)}"></i></div></div>
          <div class="a num">${money(c.amount, base)}<small>${pctLabel(c.amount / (total || 1))}</small></div></button>`).join('')}</div>
      ${kind === 'expense' && s.total ? `<div class="st-chart"><div class="section-title" style="margin:0"><span>${t('byDay')}</span></div>${dailyChart(s.days, isCurrent ? Number(state.today.slice(8, 10)) : s.days.length, base)}</div>` : ''}`
      : `<div class="empty"><div class="big">${ico('statistic', 30, '#000')}</div><b>${t('noData')}</b></div>`}
      <div class="spacer"></div>`;
    $('#stPrev', el).addEventListener('click', () => { state.month = shiftMonth(state.month, -1); state.filter = null; state.statSel = 0; haptic('select'); loadMonth(); });
    $('#stNext', el).addEventListener('click', () => { state.month = shiftMonth(state.month, 1); state.filter = null; state.statSel = 0; haptic('select'); loadMonth(); });
    el.querySelectorAll('#stKind button').forEach((b) => b.addEventListener('click', () => { state.statKind = b.dataset.k; state.statSel = 0; haptic('select'); renderStats(); }));
    el.querySelectorAll('.st-row, .donut circle').forEach((b) => b.addEventListener('click', () => {
      state.statSel = Number(b.dataset.i); haptic('select'); renderStats();
    }));
    bindChart(el);
  }

  // ---------- профиль ----------
  function renderProfile() {
    const el = $('#viewProfile');
    const me = state.me;
    const initial = (me.first_name || '?').trim().charAt(0).toUpperCase();
    const hasHowto = STORIES.some((x) => x.id === 'howto-v1' && storyLang(x));
    const mi = (id, icon, title, sub = '') => `<button class="pf-mi" id="${id}"><span class="c">${ico(icon, 19)}</span><b>${title}</b><small>${sub}</small>${ico('chevron', 16, 'var(--hint)')}</button>`;
    el.innerHTML = `
      <div class="pg-top"><h1>${t('profile')}</h1></div>
      <div class="pf-me"><div class="pf-ava">${esc(initial)}</div><div><b>${esc(me.first_name || '')}</b>
        <small>${state.daysTracking ? t('daysWithUs', state.daysTracking) : t('firstEntryHint')}</small></div></div>
      <div class="pf-cards"><div class="pf-cd" id="pfWeek"><div class="t">${t('weekResults')}</div><div class="pf-loading" style="margin-top:10px"></div></div>
        <div class="pf-cd" id="pfMonth"><div class="t">${t('monthResults')}</div><div class="pf-loading" style="margin-top:10px"></div></div></div>
      <div class="pf-menu">
        ${mi('pmLimits', 'payment', t('limits'), state.limitsCount ? String(state.limitsCount) : '')}
        ${mi('pmCats', 'other', t('catEditor'))}
        ${mi('pmRec', 'recurring', t('recurring'))}
        ${hasHowto ? mi('pmHowto', 'education', t('howto')) : ''}
        ${mi('pmSettings', 'settings', t('settings'))}
      </div>
      <div class="spacer"></div>`;
    $('#pmLimits', el).addEventListener('click', () => openLimits());
    $('#pmCats', el).addEventListener('click', () => openCategoryEditor());
    $('#pmRec', el).addEventListener('click', () => openRecurringList());
    if ($('#pmHowto', el)) $('#pmHowto', el).addEventListener('click', () => openStory(STORIES.find((x) => x.id === 'howto-v1')));
    $('#pmSettings', el).addEventListener('click', openSettings);
    const topRow = (id) => (id ? `<div class="tp">${catIco(id, 32)}<span>${esc(catName(id))}</span></div>` : '');
    const range = (a, b) => (a.slice(5, 7) === b.slice(5, 7) ? `${Number(a.slice(8, 10))}–${dayMonth(b)}` : `${dayMonth(a)} – ${dayMonth(b)}`);
    api('/weekly?all=1').then((w) => {
      const box = $('#pfWeek', el), s = w.summary;
      if (!box) return;
      if (!s) { box.innerHTML = `<div class="t">${t('weekResults')}</div><div class="e">${t('notEnough')}</div>`; return; }
      const story = buildWeekSummaryStory(w);
      const p = s.avg ? Math.round((s.spent - s.avg) / s.avg * 100) : null;
      box.innerHTML = `<div class="t">${t('weekResults')}</div><div class="p">${range(s.from, s.to)}</div>
        <div class="v num">${money(s.spent, w.base, { round: s.spent >= 1000 })}</div>
        ${p !== null ? `<div class="s ${p <= 0 ? 'g' : 'r'}">${p > 0 ? '+' : p < 0 ? '−' : ''}${Math.abs(p)}% ${t('vsUsualShort')}</div>` : ''}
        ${topRow(s.top.category)}${story ? `<button class="btn btn-outline" data-s="w">${t('openStory')}</button>` : ''}`;
      if (story) $('[data-s="w"]', box).addEventListener('click', () => openStory(story));
    }).catch(() => { const b = $('#pfWeek', el); if (b) b.innerHTML = `<div class="t">${t('weekResults')}</div><div class="e">${t('netError')}</div>`; });
    const prev = shiftMonth(state.today.slice(0, 7), -1);
    api(`/summary?month=${prev}`).then(({ summary: s }) => {
      const box = $('#pfMonth', el);
      if (!box) return;
      if (!s || (!s.total && !s.income)) { box.innerHTML = `<div class="t">${t('monthResults')}</div><div class="e">${t('notEnough')}</div>`; return; }
      const mi2 = Number(prev.slice(5, 7)) - 1;
      const story = buildMonthStory(s);
      const sub = s.income > 0
        ? `<div class="s ${s.balance >= 0 ? 'g' : 'r'}">${s.balance >= 0 ? t('leftShare', Math.round(s.balance / s.income * 100)) : t('overShort')}</div>`
        : (s.prevTotal > 0 ? `<div class="s ${s.total <= s.prevTotal ? 'g' : 'r'}">${s.total <= s.prevTotal ? '−' : '+'}${Math.abs(Math.round((s.total - s.prevTotal) / s.prevTotal * 100))}% ${t('vsPrev')}</div>` : '');
      box.innerHTML = `<div class="t">${t('monthResults')}</div><div class="p">${(state.lang === 'ru' ? MONTHS.ru : MONTHS.en)[mi2]}</div>
        <div class="v num">${s.income > 0 ? signed(s.balance, s.base) : money(s.total, s.base, { round: s.total >= 1000 })}</div>${sub}
        ${topRow(s.categories[0] && s.categories[0].category)}${story ? `<button class="btn btn-outline" data-s="m">${t('openStory')}</button>` : ''}`;
      if (story) $('[data-s="m"]', box).addEventListener('click', () => openStory(story));
    }).catch(() => { const b = $('#pfMonth', el); if (b) b.innerHTML = `<div class="t">${t('monthResults')}</div><div class="e">${t('netError')}</div>`; });
  }

  // Столбики по дням: одна серия, цвет кнопки Telegram, будущие дни не рисуются.
  function dailyChart(days, upto, base) {
    const W = 300, H = 72, gap = 2;
    const n = days.length;
    const bw = (W - gap * (n - 1)) / n;
    const max = Math.max(...days, 0.01);
    const bars = days.map((v, i) => {
      if (i >= upto) return '';
      const x = i * (bw + gap);
      const h = v > 0 ? Math.max(3, (v / max) * (H - 4)) : 0;
      const r = Math.min(2, bw / 2, h);
      const y = H - h;
      const path = h ? `M${x},${H} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${H} Z` : '';
      return `${path ? `<path class="bar" d="${path}"/>` : ''}<rect class="hit" x="${x - gap / 2}" y="0" width="${bw + gap}" height="${H}" data-i="${i}" data-v="${v}"/>`;
    }).join('');
    const lastDay = n;
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${t('spent')}">
      <line class="base" x1="0" x2="${W}" y1="${H - 0.5}" y2="${H - 0.5}"/>${bars}</svg>
      <div class="chart-axis num"><span>1</span><span>${t('maxDay', money(max, base, { round: true }))}</span><span>${lastDay}</span></div></div>`;
  }
  function bindChart(root = document) {
    const tip = $('#tooltip');
    const [, mm] = state.month.split('-').map(Number);
    root.querySelectorAll('.chart .hit').forEach((r) => {
      const show = () => {
        const b = r.getBoundingClientRect();
        const day = Number(r.dataset.i) + 1;
        const label = state.lang === 'ru' ? `${day} ${MONTHS.ruGen[mm - 1]}` : `${MONTHS.en[mm - 1]} ${day}`;
        tip.textContent = `${label}: ${money(Number(r.dataset.v), state.data.summary.base)}`;
        tip.style.left = `${Math.min(Math.max(b.left + b.width / 2, 70), innerWidth - 70)}px`;
        tip.style.top = `${b.top - 6}px`;
        tip.hidden = false;
      };
      r.addEventListener('pointerenter', show);
      r.addEventListener('pointerdown', show);
      r.addEventListener('pointerleave', () => (tip.hidden = true));
    });
    document.addEventListener('scroll', () => (tip.hidden = true), { passive: true, once: true });
  }

  // ---------- своя категория ----------
  // Окно с названием и значком; возвращает id новой категории (или null, если закрыли)
  // editId — редактирование существующей категории (тогда есть кнопка «Удалить»); возвращает id или null
  function createCategory(kind = 'expense', editId = null) {
    return new Promise((resolve) => {
      const ex = editId ? cat(editId) : null;
      let created = null, emoji = ex ? ex.emoji : state.customEmoji[0];
      const icons = ex && !state.customEmoji.includes(ex.emoji) ? [ex.emoji, ...state.customEmoji] : state.customEmoji;
      const canDelete = ex && !['other', 'other_income'].includes(editId);
      const sh = openSheet(`
        <div class="sheet-head"><h2>${ex ? t('editCat') : t('newCat')}</h2><button class="close">${t('cancel')}</button></div>
        <div class="field"><label for="ncName">${t('catNameLabel')}</label><input id="ncName" maxlength="30" autocomplete="off" placeholder="${t('catNamePh')}" value="${ex ? esc(catName(editId)) : ''}"></div>
        <div class="label-row"><span>${t('catIcon')}</span></div>
        <div class="emoji-grid" id="ncEmoji">${icons.map((e) => `<button class="emoji-btn ${e === emoji ? 'active' : ''}" data-e="${e}">${e}</button>`).join('')}</div>
        <button class="btn btn-primary btn-block" id="ncSave" ${ex ? '' : 'disabled'}>${ex ? t('save') : t('createCat')}</button>
        ${canDelete ? `<button class="btn btn-danger btn-block" id="ncDel" style="margin-top:6px">${t('deleteCat')}</button>` : ''}`, { onClose: () => resolve(created) });
      const S = sh.sheet, nameEl = $('#ncName', S), save = $('#ncSave', S);
      if (!ex) setTimeout(() => nameEl.focus(), 280);
      const del = $('#ncDel', S);
      if (del) del.addEventListener('click', async () => {
        if (!(await confirmBox(t('confirmDeleteCat', catName(editId))))) return;
        try {
          await api(`/categories/${editId}`, { method: 'DELETE' });
          state.prefs[editId] = { ...(state.prefs[editId] || {}), category_id: editId, hidden: 1 };
          created = editId; haptic('success'); closeSheet(sh);
        } catch { toast(t('netError')); }
      });
      $('.close', S).addEventListener('click', () => closeSheet(sh));
      nameEl.addEventListener('input', () => { save.disabled = !nameEl.value.trim(); });
      nameEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !save.disabled) save.click(); });
      S.querySelectorAll('[data-e]').forEach((b) => b.addEventListener('click', () => {
        emoji = b.dataset.e; haptic('select');
        S.querySelectorAll('[data-e]').forEach((x) => x.classList.toggle('active', x === b));
      }));
      save.addEventListener('click', async () => {
        const name = nameEl.value.trim();
        if (!name) return;
        save.disabled = true;
        try {
          if (ex) {
            await api(`/categories/${editId}`, { method: 'PATCH', body: { name, emoji } });
            if (ex.custom) addCustomCat({ ...state.custom.find((c) => c.id === editId), name, emoji });
            else { state.prefs[editId] = { ...(state.prefs[editId] || {}), category_id: editId, name, emoji }; applyPref(editId); }
            const cc = state.custom.find((c) => c.id === editId);
            if (cc) { cc.name = name; cc.emoji = emoji; }
            created = editId; haptic('success'); closeSheet(sh);
            return;
          }
          const r = await api('/categories', { method: 'POST', body: { kind, name, emoji } });
          addCustomCat(r.category);
          if (state.prefs[r.category.id]) state.prefs[r.category.id].hidden = 0;
          created = r.category.id;
          haptic('success');
          closeSheet(sh);
        } catch (e) {
          save.disabled = false;
          toast(e.code === 'too_many' ? t('tooManyCats') : t('netError'));
        }
      });
    });
  }
  const newCatChip = () => `<button class="chip chip-new" data-new>➕ ${t('createCat').toLowerCase()}</button>`;

  // ---------- выбор категории / валюты ----------
  function pickCategory(current, kind = 'expense') {
    return new Promise((resolve) => {
      let picked = null;
      const sh = openSheet(`
        <div class="sheet-head"><h2>${t('category')}</h2><button class="close">${t('close')}</button></div>
        <div class="cgrid">${catsOf(kind).map((c) => `
          <button class="cg ${c.id === current ? 'on' : ''}" data-c="${c.id}">${catIco(c.id, 52)}<span>${esc(catName(c.id))}</span></button>`).join('')}
          <button class="cg more" data-new><span class="ci s52">${ico('plus', 22)}</span><span>${t('createCat')}</span></button>
        </div>`, { onClose: () => resolve(picked) });
      $('.close', sh.sheet).addEventListener('click', () => closeSheet(sh));
      $('[data-new]', sh.sheet).addEventListener('click', async () => {
        const id = await createCategory(kind);
        if (id) { picked = id; closeSheet(sh); }
      });
      sh.sheet.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => {
        picked = b.dataset.c; haptic('select'); closeSheet(sh);
      }));
    });
  }
  function pickCurrency(current, title) {
    return new Promise((resolve) => {
      let picked = null;
      const sh = openSheet(`
        <div class="sheet-head"><h2>${esc(title || t('chooseCurrency'))}</h2><button class="close">${t('close')}</button></div>
        <div class="cur-grid">${state.currencies.map((c) => `
          <button class="chip ${c === current ? 'active' : ''}" data-c="${c}">${c}</button>`).join('')}</div>`,
      { onClose: () => resolve(picked) });
      $('.close', sh.sheet).addEventListener('click', () => closeSheet(sh));
      sh.sheet.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => {
        picked = b.dataset.c; haptic('select'); closeSheet(sh);
      }));
    });
  }

  // ---------- выбор повторения: каждую неделю / каждые 2 недели / раз в месяц ----------
  // Ни одна кнопка не выбрана — запись разовая; повторное нажатие на выбранную снимает выбор.
  // Возвращает HTML блока и функцию, которая привязывает события и отдаёт текущее значение.
  const weekdayOf = (date) => new Date(`${date}T00:00:00Z`).getUTCDay();
  function periodText(period, day, weekday) {
    if (period === 'month') return t('everyDay', day);
    const wd = weekday === null || weekday === undefined ? '' : `, ${t('weekdays')[weekday]}`;
    return `${t(period === 'week' ? 'pWeek' : 'p2weeks').toLowerCase()}${wd}`;
  }
  function repeatBlock(prefix, { period = null, day = 1, date, ruleMode = false }) {
    const html = `
      <div class="rep-wrap">
        <div class="label-row"><span>${t('repeat')}</span></div>
        <div class="periods" id="${prefix}Periods" role="radiogroup">
          ${['week', '2weeks', 'month'].map((p) => `<button type="button" class="chip ${p === period ? 'active' : ''}" data-p="${p}" role="radio" aria-checked="${p === period}">${t({ week: 'pWeek', '2weeks': 'p2weeks', month: 'pMonth' }[p])}</button>`).join('')}
        </div>
        <div class="rep-day field" id="${prefix}RepDay" ${period === 'month' ? '' : 'hidden'}>
          <label for="${prefix}Day">${t('repeatDay')}</label>
          <select id="${prefix}Day">${Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}" ${i + 1 === day ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
          <div class="rep-hint" id="${prefix}Hint" ${day > 28 ? '' : 'hidden'}>${t('lastDayHint')}</div>
        </div>
        <div class="rep-hint rep-week" id="${prefix}WeekHint" ${period === 'week' || period === '2weeks' ? '' : 'hidden'}></div>
      </div>`;
    const bind = (S, onDateChange) => {
      let cur = period, touched = false, d = date;
      const sel = $(`#${prefix}Day`, S), hint = $(`#${prefix}Hint`, S), wrap = $(`#${prefix}RepDay`, S), wk = $(`#${prefix}WeekHint`, S);
      const draw = () => {
        S.querySelectorAll(`#${prefix}Periods [data-p]`).forEach((b) => { b.classList.toggle('active', b.dataset.p === cur); b.setAttribute('aria-checked', String(b.dataset.p === cur)); });
        wrap.hidden = cur !== 'month';
        wk.hidden = !(cur === 'week' || cur === '2weeks');
        if (!wk.hidden && d) {
          const wd = t('weekdays')[weekdayOf(d)];
          wk.textContent = ruleMode ? wd.charAt(0).toUpperCase() + wd.slice(1) : t('weekHint', wd);
        }
      };
      S.querySelectorAll(`#${prefix}Periods [data-p]`).forEach((b) => b.addEventListener('click', () => {
        cur = cur === b.dataset.p && !ruleMode ? null : b.dataset.p; haptic('select'); draw();
      }));
      sel.addEventListener('change', () => { touched = true; hint.hidden = Number(sel.value) <= 28; });
      // число и день недели по умолчанию следуют за датой записи, пока пользователь не выбрал число сам
      if (onDateChange) onDateChange((nd) => {
        if (!nd) return;
        d = nd;
        if (!touched) { sel.value = String(Number(nd.slice(8, 10))); hint.hidden = Number(sel.value) <= 28; }
        draw();
      });
      draw();
      return () => ({ on: !!cur, period: cur, day: Number(sel.value) });
    };
    return { html, bind };
  }

  // ---------- ручной ввод ----------
  // ---------- выбор даты колесом ----------
  // Горизонтальное колесо на 8 дней: три дня до вчера, вчера, сегодня, завтра и ещё три дня вперёд.
  // По краям — «Другая дата»: если докрутить до края (или нажать), открывается обычный календарь.
  // Значение хранится в скрытом <input type="date">, поэтому остальной код работает с ним как раньше.
  const shiftDay = (d, n) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const WD = { ru: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
  // center — дата по центру колеса (для новой записи — сегодня, для старой — её дата);
  // words — подписи «Вчера / Сегодня / Завтра» (только для новой записи)
  function dateWheelHtml(id, center = state.today) {
    return `<div class="field dw" id="${id}Wrap"><label>${t('date')}</label>
      <div class="dw-box"><div class="dw-band"></div><div class="dw-track" id="${id}Track"></div></div>
      <input id="${id}" type="hidden" value="${center}"></div>`;
  }
  function bindDateWheel(S, id, { center: c0 = state.today, words = true } = {}) {
    const track = $(`#${id}Track`, S), input = $(`#${id}`, S);
    const days = [-3, -2, -1, 0, 1, 2, 3, 4].map((n) => shiftDay(c0, n));
    const wd = (d) => WD[state.lang === 'ru' ? 'ru' : 'en'][new Date(`${d}T00:00:00Z`).getUTCDay()];
    const word = words ? { [-1]: t('yesterday'), 0: t('today'), 1: t('tomorrow') } : {};
    let custom = null; // дата вне колеса, выбранная в календаре
    const item = (d, n) => {
      const w = word[n];
      const main = w || dayMonth(d);
      const sub = w ? (state.lang === 'ru' ? `${Number(d.slice(8, 10))} ${MONTHS.ruGen[Number(d.slice(5, 7)) - 1].slice(0, 3)}` : dayMonth(d)) : wd(d);
      return `<div class="dw-item" data-d="${d}"><b>${esc(main)}</b><small>${esc(sub)}</small></div>`;
    };
    const edge = (side) => {
      const c = custom && ((side === 'L' && custom < days[0]) || (side === 'R' && custom > days[7])) ? custom : null;
      return `<div class="dw-item dw-edge" data-edge="${side}">${c ? `<b>${esc(dayMonth(c))}</b><small>${esc(wd(c))}</small>` : `<b class="dw-cal">${ico('calendar', 22)}</b><small>${t('otherDate')}</small>`}
        <input type="date" class="dw-native" aria-label="${t('otherDate')}" value="${c || c0}"></div>`;
    };
    const draw = () => { track.innerHTML = edge('L') + days.map((d, k) => item(d, k - 3)).join('') + edge('R'); bindNative(); };
    const items = () => [...track.children];
    const center = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = null, bd = Infinity;
      for (const el of items()) { const c = el.offsetLeft + el.offsetWidth / 2, dd = Math.abs(c - mid); if (dd < bd) { bd = dd; best = el; } }
      return best;
    };
    const scrollTo = (el, smooth) => track.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2, behavior: smooth ? 'smooth' : 'auto' });
    const select = (d, smooth = true) => {
      if (input.value !== d) { input.value = d; input.dispatchEvent(new Event('change')); }
      const inWheel = days.includes(d);
      custom = inWheel ? null : d;
      if (!inWheel) draw();
      const el = inWheel ? track.querySelector(`[data-d="${d}"]`) : track.querySelector(`[data-edge="${d < days[0] ? 'L' : 'R'}"]`);
      requestAnimationFrame(() => { scrollTo(el, smooth); paint(); });
    };
    // вид «колеса»: чем дальше от центра, тем мельче и прозрачнее
    const paint = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      const c = center();
      for (const el of items()) {
        el.classList.toggle('on', el === c);
        const k = Math.min(1, Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid) / (track.clientWidth / 2));
        el.style.opacity = String(1 - k * 0.55);
        el.style.transform = `scale(${1 - k * 0.2})`;
      }
    };
    let last = null, settle = 0, pickerAt = 0;
    const onSettled = () => {
      const el = center();
      if (!el) return;
      if (el.dataset.d) { if (input.value !== el.dataset.d) { custom = null; input.value = el.dataset.d; input.dispatchEvent(new Event('change')); } return; }
      // докрутили до края — открываем календарь (если браузер разрешит без нажатия; иначе по нажатию на край)
      const ni = $('.dw-native', el);
      if (custom && ((el.dataset.edge === 'L' && custom < days[0]) || (el.dataset.edge === 'R' && custom > days[7]))) return;
      if (Date.now() - pickerAt < 1500) return;
      pickerAt = Date.now();
      try { ni.showPicker(); } catch { /* откроется по нажатию */ }
    };
    track.addEventListener('scroll', () => {
      paint();
      const el = center();
      if (el && el !== last) { last = el; haptic('select'); }
      clearTimeout(settle); settle = setTimeout(onSettled, 140);
    }, { passive: true });
    track.addEventListener('click', (e) => {
      const el = e.target.closest('.dw-item');
      if (el && el.dataset.d) select(el.dataset.d);
    });
    function bindNative() {
      for (const ni of track.querySelectorAll('.dw-native')) {
        ni.addEventListener('change', () => { if (ni.value) select(ni.value); });
        // закрыли календарь без выбора — возвращаемся на прежнюю дату
        ni.addEventListener('blur', () => setTimeout(() => { const el = center(); if (el && el.dataset.edge && !custom) select(input.value); }, 200));
      }
    }
    draw();
    requestAnimationFrame(() => { scrollTo(track.querySelector(`[data-d="${c0}"]`), false); paint(); last = center(); });
    return input;
  }

  function openManual(startKind = 'expense', opts = {}) {
    let kind = startKind;
    let currency = state.lastCurrency || state.me.base_currency;
    let category = null, suggested = null, userPicked = false, timer = null, seq = 0;
    const rep = repeatBlock('m', { period: opts.period || null, day: Number(state.today.slice(8, 10)), date: state.today });
    const sh = openSheet(`
      <div class="sheet-head"><h2 id="mTitle"></h2><button class="close xbtn" aria-label="${t('cancel')}">${ico('close', 18)}</button></div>
      ${dateWheelHtml('mDate')}
      <div class="field amount-field">
        <span class="sign" id="mSign"></span>
        <input id="mAmount" inputmode="decimal" placeholder="0" autocomplete="off" aria-label="${t('amount')}">
        <button class="cur-btn" id="mCur"><span>${currency}</span>${ico('chevdown', 14)}</button>
      </div>
      <div class="field"><label for="mNote" id="mNoteLabel"></label><input id="mNote" maxlength="120" autocomplete="off"></div>
      <div class="label-row"><span>${t('category')}</span></div>
      <div class="cgrid" id="mCats"></div>
      ${rep.html}
      <div class="save-bar"><button class="btn btn-primary btn-block" id="mSave">${t('save')}</button></div>`);
    const S = sh.sheet;
    const amountEl = $('#mAmount', S), noteEl = $('#mNote', S), dateEl = bindDateWheel(S, 'mDate');
    setTimeout(() => amountEl.focus(), 280);
    $('.close', S).addEventListener('click', () => closeSheet(sh));
    const getRepeat = rep.bind(S, (cb) => dateEl.addEventListener('change', () => cb(dateEl.value)));

    const drawCats = () => {
      // сначала выбранная/подсказанная категория, потом частые в этом месяце, потом остальные
      const summary = state.data?.summary;
      const used = ((kind === 'income' ? summary?.incomeCategories : summary?.categories) || []).map((c) => c.category);
      const order = [...new Set([category, suggested, ...used, ...catsOf(kind).map((c) => c.id)].filter(Boolean))];
      // сетка по пять: 8 категорий + «Ещё» + «Создать» (если «Ещё» не нужно — 9 категорий)
      const LIMIT = order.length > 9 ? 8 : 9;
      $('#mCats', S).innerHTML = order.slice(0, LIMIT).map((id) => `
        <button class="cg ${id === category ? 'on' : ''}" data-c="${id}">${catIco(id, 52)}<span>${esc(catName(id))}</span>
        ${id === suggested && !userPicked && kind === 'expense' ? `<span class="ai">AI</span>` : ''}</button>`).join('') +
        (order.length > LIMIT ? `<button class="cg more" data-more><span class="ci s52">${ico('other', 22)}</span><span>${t('moreCats')}</span></button>` : '') +
        `<button class="cg more" data-new><span class="ci s52">${ico('plus', 22)}</span><span>${t('createCat')}</span></button>`;
      $('#mCats', S).querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => {
        category = b.dataset.c; userPicked = true; haptic('select'); drawCats();
      }));
      const more = $('[data-more]', S);
      if (more) more.addEventListener('click', async () => {
        const c = await pickCategory(category, kind);
        if (c) { category = c; userPicked = true; drawCats(); }
      });
      $('[data-new]', S).addEventListener('click', async () => {
        const id = await createCategory(kind);
        if (id) { category = id; userPicked = true; drawCats(); }
      });
    };
    const setKind = (k) => {
      kind = k; category = null; suggested = null; userPicked = false;
      $('#mTitle', S).textContent = k === 'income' ? t('newIncome') : t('newExpense');
      $('#mNoteLabel', S).textContent = k === 'income' ? t('incomeNote') : t('note');
      noteEl.placeholder = k === 'income' ? t('incomeNotePh') : t('notePh');
      $('#mSign', S).textContent = k === 'income' ? '+' : '−';
      $('#mSign', S).className = `sign ${k === 'income' ? 'pos-text' : ''}`;
      drawCats();
    };
    setKind(kind);

    noteEl.addEventListener('input', () => {
      clearTimeout(timer);
      if (userPicked || kind !== 'expense') return;
      const text = noteEl.value.trim();
      if (text.length < 2) return;
      timer = setTimeout(async () => {
        const my = ++seq;
        try {
          const r = await api('/suggest', { method: 'POST', body: { text } });
          if (my !== seq || userPicked || kind !== 'expense') return;
          if (r.category && r.category !== 'other') { suggested = r.category; category = r.category; drawCats(); }
        } catch { /* подсказка не критична */ }
      }, 650);
    });
    $('#mCur', S).addEventListener('click', async () => {
      const c = await pickCurrency(currency);
      if (c) { currency = c; $('#mCur span', S).textContent = c; }
    });
    $('#mSave', S).addEventListener('click', async () => {
      const amount = parseAmount(amountEl.value);
      if (!(amount > 0)) { haptic('error'); amountEl.focus(); return; }
      const btn = $('#mSave', S); btn.disabled = true;
      const repeat = getRepeat();
      const date = dateEl.value || state.today;
      try {
        await api('/entries', {
          method: 'POST',
          body: { kind, amount, currency, note: noteEl.value.trim(), category, date, recurring: repeat.on ? { period: repeat.period, day: repeat.day } : null },
        });
        state.lastCurrency = currency; store.set('lastCurrency', currency);
        haptic('success'); toast(t('saved')); closeSheet(sh);
        state.month = date.slice(0, 7);
        loadMonth();
        if (opts.onSaved) opts.onSaved();
      } catch (e) {
        btn.disabled = false; haptic('error'); toast(t('netError'));
      }
    });
  }

  // ---------- чек, скриншоты банка, выписки ----------
  const loadImage = (file) => new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.onload = () => { URL.revokeObjectURL(url); res(i); };
    i.onerror = (e) => { URL.revokeObjectURL(url); rej(e); };
    i.src = url;
  });
  function toJpeg(img, sx, sy, sw, sh, maxSide) {
    const scale = Math.min(1, maxSide / Math.max(sw, sh));
    const c = document.createElement('canvas');
    c.width = Math.round(sw * scale); c.height = Math.round(sh * scale);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.85);
  }
  // Длинный скриншот (прокрутка истории операций) режем на куски с нахлёстом, чтобы текст не стал мелким
  async function prepareImage(file) {
    const img = await loadImage(file);
    const w = img.naturalWidth, h = img.naturalHeight;
    if (h / w <= 2.4) return [toJpeg(img, 0, 0, w, h, 1800)];
    const part = Math.round(w * 2), step = Math.round(part * 0.88), out = [];
    for (let y = 0; y < h && out.length < 6; y += step) out.push(toJpeg(img, 0, y, w, Math.min(part, h - y), 1600));
    return out;
  }
  const readBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  async function onScanFiles(fileList) {
    const files = [...(fileList || [])];
    if (!files.length) return;
    const sh = openSheet(`<div class="loading" id="rBody"><div class="spinner"></div><b>${t('reading')}</b><div>${t('readingSub')}</div></div>`);
    const showError = (msg) => {
      haptic('error');
      sh.sheet.innerHTML = `<div class="sheet-grip"></div><div class="empty"><div class="big">🤔</div><b>${esc(msg)}</b></div>
        <button class="btn btn-secondary btn-block" id="rClose">${t('close')}</button>`;
      $('#rClose', sh.sheet).addEventListener('click', () => closeSheet(sh));
    };
    try {
      const pdfs = files.filter((f) => f.type === 'application/pdf');
      const images = files.filter((f) => f.type !== 'application/pdf');
      if (pdfs.length > 1 || (pdfs.length && images.length)) return showError(t('onePdf'));
      const payload = [];
      let preview = null;
      if (pdfs.length) {
        if (pdfs[0].size > 9_000_000) return showError(t('tooBig'));
        payload.push({ data: await readBase64(pdfs[0]), media_type: 'application/pdf' });
      } else {
        for (const f of images.slice(0, 5)) {
          for (const dataUrl of await prepareImage(f)) {
            preview ||= dataUrl;
            payload.push({ data: dataUrl.split(',')[1], media_type: 'image/jpeg' });
          }
        }
        if (payload.length > 8) payload.length = 8;
      }
      const body = $('#rBody', sh.sheet);
      if (body) body.insertAdjacentHTML('afterbegin', preview ? `<img class="receipt-preview" src="${preview}" alt="">` : `<div class="big" style="font-size:44px;margin-bottom:8px">📄</div>`);
      const r = await api('/scan', { method: 'POST', body: { files: payload } });
      if (!sheets.includes(sh)) return; // пользователь закрыл, пока ждали
      state.me.scansUsed = (state.me.scansUsed || 0) + 1;
      if (r.type === 'transactions') renderTxReview(sh, r.draft);
      else renderReceiptReview(sh, r.draft);
    } catch (e) {
      showError(e.code === 'not_receipt' ? t('notReceipt') : e.code === 'limit' ? t('limit') : e.code === 'too_big' ? t('tooBig') : e.status ? t('aiError') : t('netError'));
    }
  }

  // Экран проверки операций из выписки: новые отмечены, дубли и переводы между своими счетами — нет
  function renderTxReview(sh, draft) {
    const items = draft.items.map((it, i) => ({ ...it, i, on: !it.duplicate && it.kind !== 'transfer' }));
    const S = sh.sheet;
    const sumLine = () => {
      const on = items.filter((x) => x.on);
      const curs = [...new Set(on.map((x) => x.currency))];
      if (curs.length !== 1) return '';
      const exp = on.filter((x) => x.kind !== 'income').reduce((a, x) => a + x.amount, 0);
      const inc = on.filter((x) => x.kind === 'income').reduce((a, x) => a + x.amount, 0);
      return [exp ? signed(-exp, curs[0]) : '', inc ? `<span class="pos-text">${signed(inc, curs[0])}</span>` : ''].filter(Boolean).join(' · ');
    };
    const draw = () => {
      const n = items.filter((x) => x.on).length;
      S.innerHTML = `<div class="sheet-grip"></div>
        <div class="sheet-head"><h2>${t('txTitle')}${draft.source ? ` · ${esc(draft.source)}` : ''}</h2><button class="close">${t('cancel')}</button></div>
        <div class="note" style="margin:-6px 4px 12px">${esc(t('txFound', items.length, n))}</div>
        <div class="card list tx-list">${items.map((x) => {
          const inc = x.kind === 'income';
          const tag = x.duplicate ? t('txDup') : x.kind === 'transfer' ? t('txTransfer') : '';
          return `
          <div class="row tx-row ${x.on ? '' : 'off'}" data-i="${x.i}">
            <input type="checkbox" class="tx-check" ${x.on ? 'checked' : ''} aria-label="${esc(x.note)}">
            <button class="emoji-btn2" data-act="cat" aria-label="${t('category')}">${catIco(x.category, 36)}</button>
            <div class="row-main" data-act="toggle">
              <div class="row-title">${esc(x.note || catName(x.category))}</div>
              <div class="row-sub">${esc(dayMonth(x.date))} · ${esc(x.kind === 'transfer' ? t('txTransferShort') : catName(x.category))}</div>${tag ? `<div class="row-sub tag">${esc(tag)}</div>` : ''}
            </div>
            <div class="row-amount num ${inc ? 'pos-text' : ''}">${inc ? '+' : '−'}${money(x.amount, x.currency)}</div>
          </div>`;
        }).join('')}</div>
        <div class="receipt-total"><span>${t('total')}</span><span class="num">${sumLine() || '—'}</span></div>
        <button class="btn btn-primary btn-block" id="txSave" ${n ? '' : 'disabled'}>${esc(t('txSave', n))}</button>`;
      $('.close', S).addEventListener('click', () => closeSheet(sh));
      S.querySelectorAll('.tx-row').forEach((row) => {
        const x = items[Number(row.dataset.i)];
        const toggle = () => { x.on = !x.on; haptic('select'); draw(); };
        $('.tx-check', row).addEventListener('change', toggle);
        $('[data-act="toggle"]', row).addEventListener('click', toggle);
        $('[data-act="cat"]', row).addEventListener('click', async () => {
          const c = await pickCategory(x.category, x.kind === 'income' ? 'income' : 'expense');
          if (c) { x.category = c; if (x.kind === 'transfer') x.kind = 'expense'; x.on = true; draw(); }
        });
      });
      $('#txSave', S).addEventListener('click', async () => {
        const chosen = items.filter((x) => x.on).map((x) => ({
          date: x.date, amount: x.amount, currency: x.currency, note: x.note,
          kind: x.kind === 'income' ? 'income' : 'expense', category: x.category,
        }));
        if (!chosen.length) return;
        const btn = $('#txSave', S); btn.disabled = true;
        try {
          await api('/transactions/save', { method: 'POST', body: { items: chosen } });
          haptic('success'); toast(t('saved')); closeSheet(sh);
          state.month = chosen.map((x) => x.date).sort().at(-1).slice(0, 7);
          loadMonth();
        } catch { btn.disabled = false; haptic('error'); toast(t('netError')); }
      });
    };
    draw();
  }

  function renderReceiptReview(sh, draft) {
    const d = { ...draft, groups: draft.groups.map((g) => ({ ...g, open: false })) };
    const originalTotal = draft.total;
    const S = sh.sheet;
    const draw = () => {
      const sum = d.groups.reduce((a, g) => a + (Number(g.amount) || 0), 0);
      const diff = Math.round((sum - originalTotal) * 100) / 100;
      S.innerHTML = `<div class="sheet-grip"></div>
        <div class="sheet-head"><h2>${t('receipt')}</h2><button class="close">${t('cancel')}</button></div>
        <div class="field"><label>${t('merchant')}</label><input id="rMerchant" value="${esc(d.merchant)}" maxlength="60"></div>
        <div class="inline-fields">
          <div class="field"><label>${t('date')}</label><input id="rDate" type="date" value="${d.date}" max="${state.today}"></div>
          <div class="field"><label>${t('currency')}</label><button class="cur-btn" id="rCur" style="margin:4px 0 10px">${d.currency}</button></div>
        </div>
        <div class="label-row"><span>${t('categories')}</span></div>
        ${d.groups.map((g, i) => `
          <div class="group" data-g="${i}">
            <div class="group-head">
              <button class="group-cat" data-act="cat">${catIco(g.category, 32)}<span>${esc(catName(g.category))}</span></button>
              <input class="group-amount num" data-act="amount" inputmode="decimal" value="${(Number(g.amount) || 0).toFixed(2).replace('.', state.lang === 'ru' ? ',' : '.')}">
              <button class="group-del" data-act="del" aria-label="${t('delete')}">×</button>
            </div>
            ${g.items && g.items.length ? `<div class="group-items">${(g.open ? g.items : g.items.slice(0, 3)).map((it) => `
              <div><span>${esc(it.name)}</span><span class="num">${money(it.amount, d.currency)}</span></div>`).join('')}
              ${!g.open && g.items.length > 3 ? `<div><button data-act="more" style="color:var(--link)">+ ${g.items.length - 3}</button></div>` : ''}
            </div>` : ''}
          </div>`).join('')}
        <button class="add-group" id="rAdd">${t('addGroup')}</button>
        <div class="receipt-total"><span>${t('total')}</span><span class="num">${money(sum, d.currency)}</span></div>
        ${Math.abs(diff) >= 0.01 && originalTotal > 0 ? `<div class="mismatch">${t('mismatch', money(Math.abs(diff), d.currency))}</div>` : ''}
        <button class="btn btn-primary btn-block" id="rSave">${t('save')}</button>`;
      bind();
    };
    const bind = () => {
      $('.close', S).addEventListener('click', () => closeSheet(sh));
      $('#rMerchant', S).addEventListener('input', (e) => (d.merchant = e.target.value));
      $('#rDate', S).addEventListener('change', (e) => (d.date = e.target.value || d.date));
      $('#rCur', S).addEventListener('click', async () => { const c = await pickCurrency(d.currency); if (c) { d.currency = c; draw(); } });
      S.querySelectorAll('[data-g]').forEach((el) => {
        const g = d.groups[Number(el.dataset.g)];
        $('[data-act="cat"]', el).addEventListener('click', async () => {
          const c = await pickCategory(g.category);
          if (c) {
            const same = d.groups.find((x) => x !== g && x.category === c);
            if (same) { same.amount = Math.round(((Number(same.amount) || 0) + (Number(g.amount) || 0)) * 100) / 100; same.items = [...(same.items || []), ...(g.items || [])]; d.groups.splice(d.groups.indexOf(g), 1); }
            else g.category = c;
            draw();
          }
        });
        const amountInput = $('[data-act="amount"]', el);
        amountInput.addEventListener('change', () => { const v = parseAmount(amountInput.value); g.amount = v > 0 ? v : 0; draw(); });
        $('[data-act="del"]', el).addEventListener('click', () => { d.groups.splice(d.groups.indexOf(g), 1); draw(); });
        const more = $('[data-act="more"]', el);
        if (more) more.addEventListener('click', () => { g.open = true; draw(); });
      });
      $('#rAdd', S).addEventListener('click', async () => {
        const c = await pickCategory(null);
        if (c && !d.groups.find((x) => x.category === c)) { d.groups.push({ category: c, amount: 0, items: [] }); draw(); }
      });
      $('#rSave', S).addEventListener('click', async () => {
        const groups = d.groups.filter((g) => Number(g.amount) > 0).map((g) => ({
          category: g.category, amount: Number(g.amount),
          note: d.merchant || (g.items && g.items.length === 1 ? g.items[0].name : ''),
        }));
        if (!groups.length) { haptic('error'); return; }
        const btn = $('#rSave', S); btn.disabled = true;
        try {
          await api('/receipt/save', { method: 'POST', body: { merchant: d.merchant, date: d.date, currency: d.currency, groups } });
          haptic('success'); toast(t('saved')); closeSheet(sh);
          state.month = d.date.slice(0, 7); loadMonth();
        } catch { btn.disabled = false; haptic('error'); toast(t('netError')); }
      });
    };
    draw();
  }

  // ---------- редактирование записи ----------
  function openEntryEditor(e) {
    const inc = e.kind === 'income';
    let category = e.category, currency = e.currency;
    const hadRule = !!(e.recurring_id && e.rec_active !== null && e.rec_active !== undefined);
    const rep = repeatBlock('e', { period: hadRule ? (e.rec_period || 'month') : null, day: e.rec_day || Number(e.date.slice(8, 10)), date: e.date });
    const sh = openSheet(`
      <div class="sheet-head"><h2>${inc ? t('editIncome') : t('edit')}</h2><button class="close xbtn" aria-label="${t('cancel')}">${ico('close', 18)}</button></div>
      <div class="field amount-field">
        <span class="sign ${inc ? 'pos-text' : ''}">${inc ? '+' : '−'}</span>
        <input id="eAmount" inputmode="decimal" value="${String(e.amount).replace('.', state.lang === 'ru' ? ',' : '.')}" aria-label="${t('amount')}">
        <button class="cur-btn" id="eCur">${currency}</button>
      </div>
      <div class="field"><label>${inc ? t('incomeNote') : t('note')}</label><input id="eNote" value="${esc(e.note || '')}" maxlength="120"></div>
      <div class="field" style="padding:12px 14px"><button class="group-cat" id="eCat" style="width:100%">${catIco(category, 32)}<span>${esc(catName(category))}</span></button></div>
      ${dateWheelHtml('eDate', e.date)}
      ${rep.html}
      ${e.source === 'recurring' ? `<div class="note" style="margin:-4px 4px 14px">🔁 ${t('auto')}</div>` : ''}
      <button class="btn btn-primary btn-block" id="eSave">${t('save')}</button>
      <button class="btn btn-danger btn-block" id="eDel" style="margin-top:6px">${t('delete')}</button>`);
    const S = sh.sheet;
    bindDateWheel(S, 'eDate', { center: e.date, words: false });
    const getRepeat = rep.bind(S, (cb) => $('#eDate', S).addEventListener('change', (ev) => cb(ev.target.value)));
    $('.close', S).addEventListener('click', () => closeSheet(sh));
    $('#eCat', S).addEventListener('click', async () => {
      const c = await pickCategory(category, e.kind);
      if (c) { category = c; $('#eCat', S).innerHTML = `${catIco(c, 32)}<span>${esc(catName(c))}</span>`; }
    });
    $('#eCur', S).addEventListener('click', async () => { const c = await pickCurrency(currency); if (c) { currency = c; $('#eCur', S).textContent = c; } });
    $('#eSave', S).addEventListener('click', async () => {
      const amount = parseAmount($('#eAmount', S).value);
      if (!(amount > 0)) { haptic('error'); return; }
      const repeat = getRepeat();
      const body = { amount, currency, category, note: $('#eNote', S).value, date: $('#eDate', S).value };
      if (repeat.on) body.recurring = { period: repeat.period, day: repeat.day };
      else if (hadRule) body.recurring = false;
      // если у регулярного платежа поменялась сумма — спросить, менять ли её в следующих месяцах
      if (hadRule && repeat.on && (amount !== e.amount || currency !== e.currency)) {
        const ans = await choiceBox(t('applyToRule'), t('onlyThis'), t('alsoNext'));
        if (ans === null) return;
        body.apply_to_rule = ans;
      } else if (hadRule && repeat.on && (category !== e.category || body.note !== (e.note || ''))) {
        body.apply_to_rule = true;
      }
      try {
        await api(`/entries/${e.id}`, { method: 'PATCH', body });
        haptic('success'); toast(t('saved')); closeSheet(sh); loadMonth();
      } catch { haptic('error'); toast(t('netError')); }
    });
    $('#eDel', S).addEventListener('click', async () => {
      if (!(await confirmBox(inc ? t('confirmDeleteIncome') : t('confirmDelete')))) return;
      try { await api(`/entries/${e.id}`, { method: 'DELETE' }); haptic('success'); toast(t('deleted')); closeSheet(sh); loadMonth(); }
      catch { toast(t('netError')); }
    });
  }

  // ---------- регулярные платежи ----------
  // ---------- лимиты по категориям ----------
  // Шкала слайдера: от «минимума» шагом 50 € (до 1000 €), дальше шагом 100 € до 2000 €, правее — «без лимита».
  // Для других валют — те же ступени, умноженные на примерный курс и округлённые до «красивых» чисел.
  const LIMIT_FACTOR = { RUB: 100, UAH: 50, KZT: 500, BYN: 4, TRY: 40, AMD: 400, GEL: 3, RSD: 100, PLN: 4, CZK: 25, HUF: 400, SEK: 10, NOK: 10,
    DKK: 7.5, CNY: 8, JPY: 150, THB: 40, IDR: 17000, VND: 25000, INR: 100, MXN: 20, BRL: 6, ARS: 1000, UZS: 14000, KGS: 100, AZN: 2, MDL: 20,
    AED: 4, ILS: 4, CAD: 1.5 };
  const niceNum = (x) => { const p = 10 ** Math.floor(Math.log10(x)); const m = x / p; return [10, 5, 2.5, 2, 1].find((k) => k <= m * 1.0001) * p; };
  function limitLadder(cur) {
    const f = LIMIT_FACTOR[cur] || 1, min = niceNum(25 * f), step = niceNum(50 * f);
    const out = [min];
    for (let v = step; v <= step * 20; v += step) if (v > min) out.push(v);
    for (let v = step * 22; v <= step * 40; v += step * 2) out.push(v);
    return out;
  }
  const nearestIdx = (lad, v) => lad.reduce((b, x, i) => (Math.abs(x - v) < Math.abs(lad[b] - v) ? i : b), 0);

  async function openLimits() {
    const sh = openSheet(`
      <div class="sheet-head"><h2>${t('limits')}</h2><button class="close">${t('done')}</button></div>
      <div class="note" style="margin:-4px 4px 14px">${esc(t('limitsSub'))}</div>
      <div id="lmBody"><div class="loading"><div class="spinner"></div></div></div>
      <div class="save-bar"><button class="btn btn-primary btn-block" id="lmAdd">${ico('plus', 20)}${t('addLimit')}</button></div>`);
    $('.close', sh.sheet).addEventListener('click', () => closeSheet(sh));
    let data;
    try { data = await api('/cat-limits'); } catch { $('#lmBody', sh.sheet).innerHTML = `<div class="empty">${t('netError')}</div>`; return; }
    const base = data.base, lad = limitLadder(base), N = lad.length;
    const known = new Set(catsOf('expense').map((c) => c.id));
    // список карточек: { category, idx } — idx === N означает «без лимита»
    const items = data.limits.filter((l) => known.has(l.category)).map((l) => ({ category: l.category, idx: nearestIdx(lad, l.amount) }));
    const fmt = (v) => money(v, base, { round: true });
    const valHtml = (it) => (it.idx >= N ? t('noLimit') : `${esc(fmt(lad[it.idx]))}<small> ${t('perMonth')}</small>`);
    const progHtml = (it) => {
      if (it.idx >= N) return '';
      const lim = lad[it.idx], spent = data.spent[it.category] || 0, p = spent / lim * 100;
      const col = p >= 100 ? '#E53D60' : p >= 80 ? '#F98646' : 'var(--text)';
      return `${spent > lim ? t('limOver', esc(fmt(spent)), esc(fmt(spent - lim))) : esc(t('limSpent', fmt(spent), fmt(lim - spent)))}
        <div class="lm-bar"><i style="width:${Math.min(100, p)}%;background:${col}"></i></div>`;
    };
    const card = (it) => `<div class="lm-head">${catIco(it.category, 40)}<b>${esc(catName(it.category))}</b>
        <span class="lm-val ${it.idx >= N ? 'off' : ''}">${valHtml(it)}</span></div>
      <input type="range" class="lm-range" min="0" max="${N}" step="1" value="${it.idx}" style="--p:${it.idx / N * 100}%" aria-label="${esc(catName(it.category))}">
      <div class="lm-ends"><span>${esc(fmt(lad[0]))}</span><span>${t('noLimitShort')}</span></div>
      <div class="lm-prog">${progHtml(it)}</div>`;
    const body = $('#lmBody', sh.sheet);
    const save = async (it) => {
      try {
        await api('/cat-limits', { method: 'POST', body: { category: it.category, amount: it.idx >= N ? null : lad[it.idx] } });
        state.limitsCount = items.filter((x) => x.idx < N).length;
      } catch { toast(t('netError')); }
    };
    // слайдер не перерисовываем, пока его тянут: обновляем только подписи и заливку
    const bindCard = (el, it) => {
      let timer = null;
      const r = $('.lm-range', el), val = $('.lm-val', el), prog = $('.lm-prog', el);
      r.addEventListener('input', () => {
        const v = Number(r.value);
        if (v !== it.idx) haptic('select');
        it.idx = v;
        r.style.setProperty('--p', `${v / N * 100}%`);
        val.innerHTML = valHtml(it); val.classList.toggle('off', v >= N);
        prog.innerHTML = progHtml(it);
        clearTimeout(timer); timer = setTimeout(() => save(it), 500);
      });
    };
    const draw = () => {
      body.innerHTML = items.length ? items.map((it, i) => `<div class="lm-card" data-i="${i}">${card(it)}</div>`).join('')
        : `<div class="empty"><div class="big">${ico('payment', 28, '#000')}</div>${esc(t('limitsEmpty'))}</div>`;
      body.querySelectorAll('.lm-card').forEach((el) => bindCard(el, items[Number(el.dataset.i)]));
    };
    draw();
    $('#lmAdd', sh.sheet).addEventListener('click', () => {
      const taken = new Set(items.filter((x) => x.idx < N).map((x) => x.category));
      const pick = openSheet(`
        <div class="sheet-head"><h2>${t('limitFor')}</h2><button class="close">${t('close')}</button></div>
        ${taken.size ? `<div class="note" style="margin:-4px 4px 12px">${t('limitTaken')}</div>` : ''}
        <div class="cgrid">${catsOf('expense').map((c) => `
          <button class="cg ${taken.has(c.id) ? 'lm-taken' : ''}" data-c="${c.id}" ${taken.has(c.id) ? 'disabled' : ''}>${catIco(c.id, 52)}<span>${esc(catName(c.id))}</span></button>`).join('')}</div>`);
      $('.close', pick.sheet).addEventListener('click', () => closeSheet(pick));
      pick.sheet.querySelectorAll('[data-c]:not([disabled])').forEach((b) => b.addEventListener('click', () => {
        const id = b.dataset.c;
        haptic('select'); closeSheet(pick);
        // стартовое значение — ближайшая ступень не ниже средних трат за 3 месяца, иначе около 200 €
        const avg = data.avg[id] || 0;
        let idx = avg > 0 ? lad.findIndex((v) => v >= avg) : nearestIdx(lad, niceNum(200 * (LIMIT_FACTOR[base] || 1)));
        if (idx < 0) idx = N - 1;
        const ex = items.find((x) => x.category === id);
        const it = ex || { category: id, idx };
        it.idx = idx;
        if (!ex) items.push(it);
        draw(); save(it);
        const el = body.querySelector(`.lm-card[data-i="${items.indexOf(it)}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }));
    });
  }

  async function openRecurringList() {
    const sh = openSheet(`
      <div class="sheet-head"><h2>${t('recurring')}</h2><button class="close">${t('done')}</button></div>
      <div id="recBody"><div class="loading"><div class="spinner"></div></div></div>
      <div class="save-bar"><button class="btn btn-secondary btn-block" id="recAdd">${ico('plus', 20)}${t('addPayment')}</button></div>`);
    $('.close', sh.sheet).addEventListener('click', () => closeSheet(sh));
    const refresh = () => { closeSheet(sh); openRecurringList(); };
    $('#recAdd', sh.sheet).addEventListener('click', async () => {
      const income = await choiceBox(t('paymentKindQ'), t('expense'), t('incomeKind'));
      if (income === null) return;
      openManual(income ? 'income' : 'expense', { period: 'month', onSaved: refresh });
    });
    let rules = [];
    try { ({ rules } = await api('/recurring')); } catch { $('#recBody', sh.sheet).innerHTML = `<div class="empty">${t('netError')}</div>`; return; }
    const base = state.me.base_currency;
    const block = (list, title, kind) => !list.length ? '' : `
      <div class="section-title"><span>${title}</span><span class="num">${signed((kind === 'income' ? 1 : -1) * list.filter((r) => r.active).reduce((a, r) => a + r.amount_base, 0), base)}</span></div>
      <div class="list rules-list">${list.map((r) => `
        <button class="row ${r.active ? '' : 'muted'}" data-rule="${r.id}">
          ${catIco(r.category)}
          <div class="row-main">
            <div class="row-title">${esc(r.note || catName(r.category))}</div>
            <div class="row-sub">${esc(periodText(r.period || 'month', r.day, r.weekday))} · ${r.active ? esc(t('next', dayMonth(r.next))) : t('paused')}</div>
          </div>
          <div class="row-amount num ${kind === 'income' ? 'pos-text' : ''}">${kind === 'income' ? '+' : '−'}${money(r.amount, r.currency)}${r.currency !== base ? `<small>≈ ${money(r.amount_base, base)}</small>` : ''}</div>
        </button>`).join('')}</div>`;
    $('#recBody', sh.sheet).innerHTML = rules.length
      ? block(rules.filter((r) => r.kind === 'income'), t('recIncome'), 'income') + block(rules.filter((r) => r.kind === 'expense'), t('recExpense'), 'expense')
      : `<div class="empty"><div class="big">${ico('recurring', 28, '#000')}</div>${esc(t('recurringEmpty'))}</div>`;
    sh.sheet.querySelectorAll('[data-rule]').forEach((b) => b.addEventListener('click', () => {
      const r = rules.find((x) => x.id === b.dataset.rule);
      if (r) openRuleEditor(r, refresh);
    }));
  }
  function openRuleEditor(r, onChange) {
    const inc = r.kind === 'income';
    let category = r.category, currency = r.currency;
    const rep = repeatBlock('r', { period: r.period || 'month', day: r.day, date: r.next || state.today, ruleMode: true });
    const sh = openSheet(`
      <div class="sheet-head"><h2>${t('editRule')}</h2><button class="close">${t('cancel')}</button></div>
      <div class="field amount-field">
        <span class="sign ${inc ? 'pos-text' : ''}">${inc ? '+' : '−'}</span>
        <input id="rAmount" inputmode="decimal" value="${String(r.amount).replace('.', state.lang === 'ru' ? ',' : '.')}" aria-label="${t('amount')}">
        <button class="cur-btn" id="rCur">${currency}</button>
      </div>
      <div class="field"><label>${inc ? t('incomeNote') : t('note')}</label><input id="rNote" value="${esc(r.note || '')}" maxlength="120"></div>
      <div class="field" style="padding:12px 14px"><button class="group-cat" id="rCat" style="width:100%">${catIco(category, 32)}<span>${esc(catName(category))}</span></button></div>
      ${rep.html}
      <div class="note">${t('ruleNote')}</div>
      <button class="btn btn-primary btn-block" id="rSave">${t('save')}</button>
      <button class="btn btn-secondary btn-block" id="rPause" style="margin-top:8px">${r.active ? t('pause') : t('resume')}</button>
      <button class="btn btn-danger btn-block" id="rDel" style="margin-top:6px">${t('deleteRule')}</button>`);
    const S = sh.sheet;
    const done = () => { closeSheet(sh); loadMonth(); onChange && onChange(); };
    const getRepeat = rep.bind(S);
    $('.close', S).addEventListener('click', () => closeSheet(sh));
    $('#rCat', S).addEventListener('click', async () => {
      const c = await pickCategory(category, r.kind);
      if (c) { category = c; $('#rCat', S).innerHTML = `${catIco(c, 32)}<span>${esc(catName(c))}</span>`; }
    });
    $('#rCur', S).addEventListener('click', async () => { const c = await pickCurrency(currency); if (c) { currency = c; $('#rCur', S).textContent = c; } });
    $('#rSave', S).addEventListener('click', async () => {
      const amount = parseAmount($('#rAmount', S).value);
      if (!(amount > 0)) { haptic('error'); return; }
      try {
        await api(`/recurring/${r.id}`, { method: 'PATCH', body: { amount, currency, category, note: $('#rNote', S).value, period: getRepeat().period, day: getRepeat().day } });
        haptic('success'); toast(t('saved')); done();
      } catch { toast(t('netError')); }
    });
    $('#rPause', S).addEventListener('click', async () => {
      try { await api(`/recurring/${r.id}`, { method: 'PATCH', body: { active: !r.active } }); haptic('success'); done(); }
      catch { toast(t('netError')); }
    });
    $('#rDel', S).addEventListener('click', async () => {
      if (!(await confirmBox(t('confirmDeleteRule')))) return;
      try { await api(`/recurring/${r.id}`, { method: 'DELETE' }); haptic('success'); toast(t('deleted')); done(); }
      catch { toast(t('netError')); }
    });
  }

  // ---------- настройки ----------
  // ---------- боковое меню ----------
  function openMenu() {
    const me = state.me;
    const initial = (me.first_name || '?').trim().charAt(0).toUpperCase();
    const item = (id, icon, title, sub) => `<button class="menu-item" id="${id}"><span class="menu-ico">${icon}</span>
      <span class="menu-txt"><b>${title}</b><small>${sub}</small></span><span class="menu-chev">›</span></button>`;
    const sh = openSheet(`
      <div class="menu-user"><div class="menu-ava">${esc(initial)}</div><div><b>${esc(me.first_name || '')}</b>
        <small>${state.daysTracking ? t('daysWithUs', state.daysTracking) : t('firstEntryHint')}</small></div></div>
      <div class="menu-list">
        ${item('mnProfile', '👤', t('profile'), t('profileSub'))}
        ${item('mnCats', '🗂️', t('catEditor'), t('catEditorSub'))}
        ${item('mnSettings', '⚙️', t('settings'), t('settingsSub'))}
      </div>
      <div class="menu-foot">потрачено <span>бюджет-бот</span></div>`, { cls: 'drawer' });
    const go = (fn) => () => { closeSheet(sh); setTimeout(fn, 120); };
    $('#mnProfile', sh.sheet).addEventListener('click', go(openProfile));
    $('#mnCats', sh.sheet).addEventListener('click', go(() => openCategoryEditor()));
    $('#mnSettings', sh.sheet).addEventListener('click', go(openSettings));
  }

  // ---------- профиль: итоги недели и месяца ----------
  function openProfile() {
    const sh = openSheet(`
      <div class="sheet-head"><h2>${t('profile')}</h2><button class="close">${t('done')}</button></div>
      <div class="label-row"><span>${t('weekResults')}</span></div>
      <div class="card pf-card" id="pfWeek"><div class="pf-loading"></div></div>
      <div class="label-row"><span>${t('monthResults')}</span></div>
      <div class="card pf-card" id="pfMonth"><div class="pf-loading"></div></div>`);
    const S = sh.sheet;
    $('.close', S).addEventListener('click', () => closeSheet(sh));
    const stat = (label, value, cls = '') => `<div class="pf-stat"><small>${label}</small><b class="${cls}">${value}</b></div>`;
    const top = (id) => id ? `<div class="pf-top"><span>${cat(id).emoji}</span><div><small>${t('topLbl')}</small><b>${esc(catName(id))}</b></div></div>` : '';
    const change = (curV, prevV, label) => {
      if (!prevV) return '';
      const pct = Math.round((curV - prevV) / prevV * 100);
      return `<div class="pf-change ${pct <= 0 ? 'good' : 'bad'}">${pct <= 0 ? '📉' : '📈'} ${pct > 0 ? '+' : pct < 0 ? '−' : ''}${Math.abs(pct)}% ${label}</div>`;
    };
    const storyBtn = (id) => `<button class="btn btn-secondary btn-block pf-story" data-story="${id}">${t('openStory')}</button>`;
    const range = (a, b) => (a.slice(5, 7) === b.slice(5, 7) ? `${Number(a.slice(8, 10))}–${dayMonth(b)}` : `${dayMonth(a)} – ${dayMonth(b)}`);

    api('/weekly?all=1').then((w) => {
      const el = $('#pfWeek', S), s = w.summary;
      if (!s) { el.innerHTML = `<div class="pf-empty">${t('notEnough')}</div>`; return; }
      const story = buildWeekSummaryStory(w);
      el.innerHTML = `<div class="pf-period">${range(s.from, s.to)}</div>
        <div class="pf-stats">${stat(t('spentLbl'), money(s.spent, w.base))}${s.avg ? stat(t('usualLbl'), money(s.avg, w.base)) : ''}</div>
        ${s.avg ? change(s.spent, s.avg, t('vsUsual')) : ''}${top(s.top.category)}${story ? storyBtn('w') : ''}`;
      if (story) $('[data-story="w"]', el).addEventListener('click', () => openStory(story));
    }).catch(() => { $('#pfWeek', S).innerHTML = `<div class="pf-empty">${t('netError')}</div>`; });

    const prev = shiftMonth(state.today.slice(0, 7), -1);
    api(`/summary?month=${prev}`).then(({ summary: s }) => {
      const el = $('#pfMonth', S);
      if (!s || (!s.total && !s.income)) { el.innerHTML = `<div class="pf-empty">${t('notEnough')}</div>`; return; }
      const mi = Number(prev.slice(5, 7)) - 1;
      const story = buildMonthStory(s);
      el.innerHTML = `<div class="pf-period">${state.lang === 'ru' ? MONTHS.ru[mi] : MONTHS.en[mi]} ${prev.slice(0, 4)}</div>
        <div class="pf-stats">${stat(t('spentLbl'), money(s.total, s.base))}${stat(t('incomeLbl'), money(s.income, s.base), 'pos')}${stat(t('balanceLbl'), signed(s.balance, s.base), s.balance >= 0 ? 'pos' : 'neg')}</div>
        ${change(s.total, s.prevTotal, t('vsPrev'))}${top(s.categories[0] && s.categories[0].category)}${story ? storyBtn('m') : ''}`;
      if (story) $('[data-story="m"]', el).addEventListener('click', () => openStory(story));
    }).catch(() => { $('#pfMonth', S).innerHTML = `<div class="pf-empty">${t('netError')}</div>`; });
  }

  // ---------- редактор категорий ----------
  function openCategoryEditor(kind = 'expense') {
    const sh = openSheet(`
      <div class="sheet-head"><h2>${t('catEditor')}</h2><button class="close">${t('done')}</button></div>
      <div class="seg" id="ceTabs"><button data-k="expense">${t('expensesTab')}</button><button data-k="income">${t('incomesTab')}</button></div>
      <div class="card list" id="ceList"></div>
      <button class="btn btn-secondary btn-block" id="ceAdd">➕ ${t('newCat')}</button>`);
    const S = sh.sheet;
    let changed = false;
    const draw = () => {
      S.querySelectorAll('#ceTabs button').forEach((b) => b.classList.toggle('active', b.dataset.k === kind));
      $('#ceList', S).innerHTML = catsOf(kind).map((c) => `<button class="row ce-row" data-c="${c.id}">
        <span class="ce-name">${catIco(c.id, 36)}${esc(catName(c.id))}${c.custom ? ` <span class="ce-badge">${t('ownCat')}</span>` : ''}</span>
        <span class="settings-value">›</span></button>`).join('');
      S.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', async () => {
        if (await createCategory(kind, b.dataset.c)) { changed = true; draw(); }
      }));
    };
    S.querySelectorAll('#ceTabs button').forEach((b) => b.addEventListener('click', () => { kind = b.dataset.k; haptic('select'); draw(); }));
    $('#ceAdd', S).addEventListener('click', async () => { if (await createCategory(kind)) { changed = true; draw(); } });
    $('.close', S).addEventListener('click', () => closeSheet(sh));
    sh.onClose = () => { if (changed) loadMonth(); };
    draw();
  }

  function openSettings() {
    const me = state.me;
    const sh = openSheet(`
      <div class="sheet-head"><h2>${t('settings')}</h2><button class="close">${t('done')}</button></div>
      <div class="card list settings-list">
        <button class="row" id="sCur"><span>${t('baseCurrency')}</span><span class="settings-value">${me.base_currency} ›</span></button>
        <button class="row" id="sLang"><span>${t('language')}</span><span class="settings-value">${state.lang === 'ru' ? 'Русский' : 'English'} ›</span></button>
      </div>
      <div class="note">${t('baseNote')}</div>
      <div class="card list settings-list">
        <div class="row"><span>${t('scans')}</span><span class="settings-value num">${me.scansUsed} ${t('from')} ${me.scans}</span></div>
        <button class="row" id="sReports"><span>${t('reports')}</span><span class="settings-value">${me.can_message ? t('reportsOn') : t('reportsOff')} ›</span></button>
        <button class="row" id="sNudges"><span>${t('nudges')}</span><span class="settings-value">${me.nudges ? t('reportsOn') : t('reportsOff')} ›</span></button>
      </div>
      <div class="set-actions">
        <button class="btn btn-block btn-invert" id="sExport">${t('export')}</button>
        <button class="btn btn-block btn-red" id="sDelete">${t('deleteAll')}</button>
      </div>`);
    const S = sh.sheet;
    $('.close', S).addEventListener('click', () => closeSheet(sh));
    $('#sCur', S).addEventListener('click', async () => {
      const c = await pickCurrency(me.base_currency, t('baseCurrency'));
      if (c && c !== me.base_currency) {
        await api('/settings', { method: 'POST', body: { base_currency: c } }).catch(() => toast(t('netError')));
        me.base_currency = c; state.lastCurrency = c; store.set('lastCurrency', c);
        closeSheet(sh); loadMonth(); openSettings();
      }
    });

    $('#sLang', S).addEventListener('click', async () => {
      state.lang = state.lang === 'ru' ? 'en' : 'ru';
      await api('/settings', { method: 'POST', body: { lang: state.lang } }).catch(() => {});
      applyStatic(); closeSheet(sh); loadMonth(); renderStories(); openSettings();
    });
    $('#sReports', S).addEventListener('click', async () => {
      if (me.can_message) {
        await api('/settings', { method: 'POST', body: { can_message: false } }).catch(() => {});
        me.can_message = false; closeSheet(sh); openSettings();
      } else {
        requestWriteAccess(true).then(() => { closeSheet(sh); openSettings(); });
      }
    });
    $('#sNudges', S).addEventListener('click', async () => {
      const v = !me.nudges;
      if (v && !me.can_message) await requestWriteAccess(true);
      await api('/settings', { method: 'POST', body: { nudges: v } }).catch(() => toast(t('netError')));
      me.nudges = v; closeSheet(sh); openSettings();
    });
    $('#sExport', S).addEventListener('click', async () => {
      try { await api('/export', { method: 'POST' }); toast(t('exported')); haptic('success'); }
      catch (e) { toast(e.code === 'cant_message' ? t('exportFail') : t('netError')); }
    });
    $('#sDelete', S).addEventListener('click', async () => {
      if (!(await confirmBox(t('confirmDeleteAll')))) return;
      try {
        await api('/me', { method: 'DELETE' }); haptic('success'); toast(t('deleted'));
        closeSheet(sh);
        if (tg && tg.close && tg.initData) setTimeout(() => tg.close(), 800); else location.reload();
      } catch { toast(t('netError')); }
    });
  }

  // Разрешение боту писать первым — нужно для ежемесячных итогов.
  function requestWriteAccess(force) {
    return new Promise((resolve) => {
      if (!tg || !tg.initData || !tg.requestWriteAccess || !tg.isVersionAtLeast('6.9')) return resolve(false);
      if (!force && store.get('askedWrite')) return resolve(false);
      store.set('askedWrite', '1');
      tg.requestWriteAccess(async (granted) => {
        if (granted) {
          state.me.can_message = true;
          await api('/settings', { method: 'POST', body: { can_message: true } }).catch(() => {});
        }
        resolve(granted);
      });
    });
  }

  function openWelcome() {
    return new Promise((resolve) => {
      const popular = ['EUR', 'USD', 'RUB', 'GBP', 'AED', 'TRY', 'RSD', 'GEL', 'KZT', 'AMD', 'CHF', 'PLN'];
      const list = [...new Set([state.me.base_currency, ...popular, ...state.currencies])];
      const sh = openSheet(`
        <div class="sheet-head"><h2>${t('welcomeTitle')}</h2></div>
        <div class="note" style="margin:-6px 4px 14px">${t('welcomeText')}</div>
        <div class="cur-grid">${list.map((c) => `<button class="chip ${c === state.me.base_currency ? 'active' : ''}" data-c="${c}">${c}</button>`).join('')}</div>
        <button class="btn btn-primary btn-block" id="wOk" style="margin-top:16px">${t('done')}</button>`, { onClose: resolve });
      let chosen = state.me.base_currency;
      sh.sheet.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => {
        chosen = b.dataset.c; haptic('select');
        sh.sheet.querySelectorAll('[data-c]').forEach((x) => x.classList.toggle('active', x === b));
      }));
      $('#wOk', sh.sheet).addEventListener('click', async () => {
        if (chosen !== state.me.base_currency) {
          await api('/settings', { method: 'POST', body: { base_currency: chosen } }).catch(() => {});
          state.me.base_currency = chosen; state.lastCurrency = chosen; store.set('lastCurrency', chosen);
        }
        store.set('welcomed', '1');
        closeSheet(sh);
      });
    });
  }

  function applyStatic() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  }

  // ---------- запуск ----------
  // ---------- заставка ----------
  // Монетка крутится, пока грузятся данные, но не меньше ~1 с, чтобы успела долететь до центра
  const splashAt = performance.now();
  let splashGone = false;
  async function hideSplash(instant = false) {
    const el = document.getElementById('splash');
    if (!el || splashGone) return;
    splashGone = true;
    if (instant) { el.remove(); return; }
    const wait = 1000 - (performance.now() - splashAt);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    el.classList.add('done');
    $('#app').classList.add('app-in');
    setTimeout(() => { el.remove(); $('#app').classList.remove('app-in'); }, 1000);
  }
  setTimeout(() => hideSplash(), 12000);
  // подпись на заставке — на языке Telegram, пока настройки пользователя ещё не загружены
  try {
    const lc = tg && tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user.language_code : '';
    const st = document.getElementById('splashText');
    if (st && lc && !/^(ru|uk|be|kk)/.test(lc)) st.firstChild.textContent = 'Loading';
  } catch { /* */ } // на всякий случай — не держим заставку вечно

  async function start() {
    if (tg) { tg.ready(); tg.expand(); try { tg.disableVerticalSwipes && tg.isVersionAtLeast('7.7') && tg.disableVerticalSwipes(); } catch { /* */ } }
    if (!initData) {
      hideSplash(true);
      document.body.innerHTML = `<div class="blocker"><div class="big">📱</div><p>${T.ru.openInTg}<br>${T.en.openInTg}</p></div>`;
      return;
    }
    let me;
    try { me = await api('/me'); } catch (e) {
      hideSplash(true);
      document.body.innerHTML = `<div class="blocker"><div class="big">⚠️</div><p>${e.status === 401 ? `${T.ru.openInTg}<br>${T.en.openInTg}` : 'Network error'}</p></div>`;
      return;
    }
    state.me = { ...me.user, scans: me.limits.scans, scansUsed: me.limits.scansUsed, seenStories: me.seenStories || [],
      shareBonus: me.limits.shareBonus, sharedThisMonth: me.limits.sharedThisMonth, milestonesShared: me.milestonesShared || [] };
    state.lang = me.user.lang === 'en' ? 'en' : 'ru';
    state.cats = me.categories;
    state.incomeCats = me.income_categories || [];
    state.catMap = Object.fromEntries([...me.categories, ...state.incomeCats].map((c) => [c.id, c]));
    state.baseCats = { ...state.catMap };
    state.custom = [];
    state.customEmoji = me.custom_emoji || ['🏷️'];
    (me.custom_categories || []).forEach(addCustomCat);
    state.prefs = Object.fromEntries((me.category_prefs || []).map((p) => [p.category_id, p]));
    Object.keys(state.prefs).forEach(applyPref);
    state.currencies = me.currencies;
    state.today = me.today;
    state.daysSinceStart = me.daysSinceStart || 0;
    state.daysTracking = me.daysTracking || null;
    state.limitsCount = me.limitsCount || 0;
    state.month = me.today.slice(0, 7);
    state.lastCurrency = store.get('lastCurrency') || me.user.base_currency;
    if (!state.currencies.includes(state.lastCurrency)) state.lastCurrency = me.user.base_currency;
    applyStatic();

    $('#prevMonth').addEventListener('click', () => { state.month = shiftMonth(state.month, -1); state.filter = null; haptic('select'); loadMonth(); });
    $('#nextMonth').addEventListener('click', () => { state.month = shiftMonth(state.month, 1); state.filter = null; haptic('select'); loadMonth(); });
    // иконки в разметке (кнопки, вкладки)
    document.querySelectorAll('[data-ico]').forEach((el) => { el.innerHTML = ico(el.dataset.ico, el.classList.contains('act-c') ? 30 : 22); });
    document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
    state.tab = 'home';
    paintChrome();
    if (tg && tg.onEvent) tg.onEvent('themeChanged', () => {
      document.documentElement.setAttribute('data-theme', tg.colorScheme === 'dark' ? 'dark' : 'light');
      paintChrome();
    });
    $('#addManual').addEventListener('click', () => openManual('expense'));
    $('#addIncome').addEventListener('click', () => openManual('income'));
    $('#addReceipt').addEventListener('click', () => { const f = $('#fileInput'); f.value = ''; f.click(); });
    $('#fileInput').addEventListener('change', (e) => onScanFiles(e.target.files));

    await loadMonth();
    renderStories();
    const startParam = tg && tg.initDataUnsafe ? tg.initDataUnsafe.start_param : '';
    const wantMonth = new URLSearchParams(location.search).get('story') === 'month' || startParam === 'month';
    const storiesP = (me.hasEntries ? Promise.all([loadMonthStory(wantMonth), loadWeeklyStories()]) : Promise.resolve([null]))
      .then((r) => { loadMilestoneStory(); return r; }); // юбилей — первым в ленте
    // убираем заставку, когда загрузились и истории (но ждём их не дольше 1,5 с)
    await Promise.race([storiesP, new Promise((r) => setTimeout(r, 1500))]);
    await hideSplash();
    const [monthStory] = await storiesP;
    if (!me.hasEntries && !store.get('welcomed')) await openWelcome();
    // новичкам сразу показываем историю «Как пользоваться»
    const howto = visibleStories().find((s) => s.id === 'howto-v1');  // скрыта через неделю — тогда и не открываем
    if (howto && !me.hasEntries && !seenStory(howto.id)) await openStory(howto);
    // из ежемесячного сообщения бота: сразу открыть историю за прошлый месяц
    if (monthStory && wantMonth) await openStory(monthStory);
    if (!state.me.can_message) requestWriteAccess(false);
  }

  start();
})();
