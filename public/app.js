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
      daysWithUs: (n) => `Слежу за деньгами уже ${n} ${plural(n, ['день', 'дня', 'дней'])}`,
      newCat: 'Новая категория', createCat: 'Создать', catNameLabel: 'Название', catNamePh: 'Например, хобби', catIcon: 'Значок', tooManyCats: 'Слишком много своих категорий', today: 'Сегодня', yesterday: 'Вчера', tomorrow: 'Завтра', otherDate: 'Другая дата', pickDate: 'Выбрать', emptyTitle: 'Пока пусто',
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
      daysWithUs: (n) => `Tracking my money for ${n} day${n === 1 ? '' : 's'}`,
      newCat: 'New category', createCat: 'Create', catNameLabel: 'Name', catNamePh: 'e.g. Hobby', catIcon: 'Icon', tooManyCats: 'Too many custom categories', today: 'Today', yesterday: 'Yesterday', tomorrow: 'Tomorrow', otherDate: 'Other date', pickDate: 'Pick', emptyTitle: 'Nothing here yet',
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
      id: 'howto-v1', langs: ['ru'], duration: 6000, days: 7, // в ленте — первую неделю, потом только в настройках
      title: { ru: 'С чего начать', en: 'Getting started' },
      cover: 'stories/howto/cover.webp',
      slides: [1, 2, 3, 4, 5, 6, 7].map((n) => `stories/howto/${n}.webp`),
    },
  ];
  const seenStory = (id) => (state.me.seenStories || []).includes(id);
  const storyLang = (s) => !s.langs || s.langs.includes(state.lang);
  const visibleStories = () => STORIES.filter((s) => storyLang(s) && !(s.days && (state.daysSinceStart || 0) >= s.days));

  function renderStories() {
    const el = $('#storiesRow');
    const list = visibleStories().map((s, k) => [s, k]).sort((a, b) => (Number(seenStory(a[0].id)) - Number(seenStory(b[0].id))) || (a[1] - b[1])).map((x) => x[0]);
    if (!list.length) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="stories">${list.map((s) => `
      <button class="story-tile ${seenStory(s.id) ? 'seen' : ''}" data-story="${s.id}" aria-label="${esc(s.title[state.lang] || s.title.ru)}">
        ${s.coverHtml || `<span class="story-img" style="background-image:url('${s.cover}')"></span>`}
        <span class="story-title">${esc(s.title[state.lang] || s.title.ru)}</span>
      </button>`).join('')}</div>`;
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
  const twemoji = (e) => [...e].map((c) => c.codePointAt(0).toString(16)).filter((c) => c !== 'fe0f').join('-');
  const emojiImg = (code, size) => `<img src="stories/emoji/${code}.svg" alt="" style="width:${size}px;height:${size}px">`;
  // Суммы для слайдов: обычные пробелы (в шрифте Unbounded неразрывный пробел нулевой ширины)
  const wrMoney = (n, cur) => {
    try {
      return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(Math.abs(n)).replace(/[  ]/g, ' ');
    } catch { return `${Math.round(Math.abs(n))} ${cur}`; }
  };

  function buildMonthStory(s) {
    const cur = s.base;
    const nw = (n) => `<span style="white-space:nowrap">${wrMoney(n, cur)}</span>`; // сумма в подписи не разрывается
    const expenseCount = s.categories.reduce((a, c) => a + c.count, 0);
    if (expenseCount < 5 || !s.total) return null;
    const [y, mm] = s.month.split('-').map(Number);
    const mi = mm - 1;
    const name = MONTHS.ru[mi], prep = MONTHS.ruPrep[mi], gen = MONTHS.ruGen[mi];
    const prevPrep = MONTHS.ruPrep[(mi + 11) % 12], nextPrep = MONTHS.ruPrep[(mi + 1) % 12];
    const hasPrev = s.prevTotal > 0;
    const pct = hasPrev ? Math.round(Math.abs(s.total - s.prevTotal) / s.prevTotal * 100) : 0;
    const less = !hasPrev || s.total <= s.prevTotal;
    const result = s.income - s.total;
    const top = s.categories[0];
    const busiest = s.days.reduce((b, v, d) => (v > b.v ? { v, d } : b), { v: 0, d: 0 });
    const user = state.me.first_name || '';
    const G = {
      blue: 'linear-gradient(165deg,#2a78d6 0%,#163f73 45%,#0e0e10 100%)',
      green: 'linear-gradient(165deg,#1f9d63 0%,#10533a 45%,#0e0e10 100%)',
      red: 'linear-gradient(165deg,#d9483f 0%,#6e2420 45%,#0e0e10 100%)',
      violet: 'linear-gradient(165deg,#6250d6 0%,#2f2770 45%,#0e0e10 100%)',
      amber: 'linear-gradient(165deg,#e8962a 0%,#7a4a12 45%,#0e0e10 100%)',
      final: 'linear-gradient(165deg,#2a78d6 0%,#1f9d63 55%,#0e0e10 100%)',
    };
    const slide = (bg, blob, body, stickers) => ({ html: `<div class="wr" style="background:${bg}">
      <div class="wr-blob" style="${blob}"></div><div class="wr-tag">Ваш ${name}</div>${body}${stickers}
      <div class="wr-logo">потрачено<span>БЮДЖЕТ-БОТ</span></div></div>` });
    const st = (code, size, pos) => `<div class="wr-sticker" style="${pos}">${emojiImg(code, size)}</div>`;
    const out = [];
    out.push(slide(G.blue, 'width:700px;height:700px;right:-220px;top:1050px;background:rgba(90,156,240,.35)',
      `<div class="wr-wrap"><div class="wr-num">${wrMoney(s.total, cur)}</div><div class="wr-cap">вы потратили<br>в ${prep}</div></div>`,
      st('1f4b8', 300, 'right:110px;top:1240px;transform:rotate(12deg)')));
    if (hasPrev) {
      out.push(slide(less ? G.green : G.red, 'width:640px;height:640px;left:-200px;top:1150px;background:rgba(255,255,255,.12)',
        `<div class="wr-wrap"><div class="wr-num">${less ? '−' : '+'}${pct}%</div><div class="wr-cap">Это на ${pct}% ${less ? 'меньше' : 'больше'}, чем в ${prevPrep}</div>
         <div class="wr-small">${nw(s.total)} против ${nw(s.prevTotal)}</div></div>`,
        st(less ? '1f4c9' : '1f4c8', 290, 'right:120px;top:1260px;transform:rotate(-8deg)')));
    }
    if (s.income > 0) {
      out.push(slide(G.violet, 'width:720px;height:720px;right:-240px;top:980px;background:rgba(144,133,233,.3)',
        `<div class="wr-wrap"><div class="wr-num">${wrMoney(s.income, cur)}</div><div class="wr-cap">вы заработали<br>в ${prep}</div></div>`,
        st('1f4b0', 300, 'right:120px;top:1250px;transform:rotate(10deg)')));
      out.push(slide(result >= 0 ? G.green : G.red, 'width:760px;height:760px;left:-260px;top:1080px;background:rgba(255,255,255,.1)',
        `<div class="wr-wrap"><div class="wr-num">${result >= 0 ? '+' : '−'}${wrMoney(result, cur)}</div><div class="wr-cap">финансовый результат за месяц</div>
         <div class="wr-small">${nw(s.income)} доходов − ${nw(s.total)} расходов</div></div>`,
        st(result >= 0 ? '1f3c6' : '1f62c', 290, 'right:120px;top:1270px;transform:rotate(-10deg)')));
    }
    out.push(slide(G.amber, 'width:700px;height:700px;right:-200px;top:1120px;background:rgba(255,200,120,.22)',
      `<div class="wr-wrap" style="top:470px"><div class="wr-cap" style="margin-top:0">Больше всего вы тратили на ${CAT_ACC[top.category] || catName(top.category).toLowerCase()}</div>
       <div class="wr-num" style="margin-top:50px">${wrMoney(top.amount, cur)}</div>
       <div class="wr-small">${Math.round(top.amount / s.total * 100)}% всех трат за месяц</div></div>`,
      st(twemoji(cat(top.category).emoji), 320, 'right:130px;top:1240px;transform:rotate(8deg)')));
    if (busiest.v > 0) {
      out.push(slide(G.blue, 'width:700px;height:700px;left:-220px;top:1120px;background:rgba(90,156,240,.3)',
        `<div class="wr-wrap" style="top:470px"><div class="wr-cap" style="margin-top:0">Самый дорогой день месяца —</div>
         <div class="wr-num" style="margin-top:40px;font-size:260px">${busiest.d + 1}</div><div class="wr-num wr-mid">${gen}</div>
         <div class="wr-cap">Тогда вы потратили ${nw(busiest.v)}</div></div>`,
        st('1f525', 280, 'right:120px;top:1300px;transform:rotate(-8deg)')));
    }
    const finalText = less ? `Так держать${user ? `, ${esc(user)}` : ''}!` : `Отличная работа${user ? `, ${esc(user)}` : ''}! Давайте постараемся в ${nextPrep}.`;
    out.push(slide(G.final, 'width:760px;height:760px;right:-240px;top:1060px;background:rgba(255,255,255,.12)',
      `<div class="wr-wrap" style="top:560px"><div class="wr-cap" style="font-size:${less ? 96 : 84}px;line-height:1.1;margin-top:0">${finalText}</div></div>`,
      st(less ? '1f64c' : '1f4aa', 300, `right:120px;top:1250px;transform:rotate(${less ? -8 : 8}deg)`) + st('1f389', 150, 'left:150px;top:1380px;transform:rotate(-14deg)')));
    // призыв поделиться: кнопка «Я в деле!» открывает карточку с типажом; слайд не листается сам
    out.push({ hold: true, html: `<div class="wr" style="background:linear-gradient(165deg,#6250d6 0%,#2a78d6 50%,#0e0e10 100%)">
      <div class="wr-blob" style="width:760px;height:760px;left:-260px;top:1000px;background:rgba(255,255,255,.1)"></div>
      <div class="wr-tag">Ваш ${name}</div>
      <div class="wr-wrap" style="top:330px"><div class="wr-cap" style="font-size:64px;line-height:1.15;margin-top:0">Узнайте свой финансовый типаж и поделитесь результатами с друзьями, а мы подарим вам 5 сканов</div></div>
      <img src="stories/share-teaser.webp" alt="" style="position:absolute;left:330px;top:900px;width:420px;border-radius:36px;transform:rotate(-6deg);box-shadow:0 0 0 8px #fff,18px 22px 0 8px rgba(0,0,0,.35)">
      ${st('1f381', 220, 'right:120px;top:1180px;transform:rotate(14deg)')}
      <button class="wr-action" data-share>Я в деле!</button>
      <div class="wr-logo">потрачено<span>БЮДЖЕТ-БОТ</span></div></div>`,
      onShow: (root, close) => {
        const b = root.querySelector('[data-share]');
        if (b) b.addEventListener('click', () => { haptic('select'); close(); openShareSheet(s); });
      } });
    return {
      id: `month-${s.month}`, langs: ['ru'], duration: 5000,
      title: { ru: `Ваш ${name}`, en: `Your ${MONTHS.en[mi]}` },
      coverHtml: `<span class="story-img wr-cover">${emojiImg('1f4b8', 40)}</span>`,
      slides: out, dynamic: 'month',
    };
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

  // Данные карточки из сводки месяца: без сумм, только проценты и достижения
  function shareData(s) {
    const mi = Number(s.month.slice(5, 7)) - 1;
    const top = s.categories[0];
    const [title, icon] = ARCHETYPES[top.category] || DEFAULT_ARCHETYPE;
    const facts = [];
    if (s.prevTotal > 0 && s.total < s.prevTotal) {
      facts.push(['1f4c9', `−${Math.round((s.prevTotal - s.total) / s.prevTotal * 100)}% трат к ${MONTHS.ruDat[(mi + 11) % 12]}`]);
    }
    if (s.income > 0 && s.income > s.total) facts.push(['2705', `Месяц в плюсе: осталось ${Math.round((s.income - s.total) / s.income * 100)}% дохода`]);
    facts.push([twemoji(cat(top.category).emoji), `Больше всего — на ${CAT_ACC[top.category] || catName(top.category).toLowerCase()}`]);
    if (facts.length < 3) facts.push(['1f4d2', `Учёт вёлся ${s.days.filter((v) => v > 0).length} дней из ${s.days.length}`]);
    return { month: MONTHS.ru[mi], title, icon, facts: facts.slice(0, 3) };
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

  // Рисуем карточку 1080×1920 на canvas (тот же макет, что согласовали)
  async function drawShareCard(d) {
    await Promise.all(['900 100px WrU', '800 40px WrM', '700 40px WrM'].map((f) => (document.fonts ? document.fonts.load(f) : null)));
    const W = 1080, H = 1920, L = 110, R = W - 110, CW = R - L;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, W * 0.45, H);
    g.addColorStop(0, '#2a78d6'); g.addColorStop(0.35, '#1a4f8f'); g.addColorStop(0.7, '#10213a'); g.addColorStop(1, '#0e0e10');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const blob = (x, y, r, col) => { const rg = ctx.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = rg; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); };
    blob(-20, 1390, 520, 'rgba(31,157,99,.38)'); blob(1000, 60, 420, 'rgba(120,180,255,.35)');
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic';
    // «Мой октябрь»
    ctx.font = '900 46px WrU'; ctx.globalAlpha = 0.9; ctx.fillText(`Мой ${d.month}`, L, 246); ctx.globalAlpha = 1;
    // иконка в плашке + «Мой типаж месяца»
    const ico = await loadImg(`stories/emoji/${d.icon}.svg`).catch(() => null);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; rr(ctx, L + 8, 346, 150, 150, 40); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; rr(ctx, L, 336, 150, 150, 40); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 4; ctx.stroke();
    if (ico) ctx.drawImage(ico, L + 23, 359, 104, 104);
    ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.font = '800 42px WrM';
    ctx.fillText('Мой типаж', L + 176, 402); ctx.fillText('месяца', L + 176, 452);
    // типаж: максимум две строки, слово не разрывается
    let fs = 116, lines;
    for (;;) {
      ctx.font = `900 ${fs}px WrU`;
      lines = wrapLines(ctx, d.title, CW);
      const tooWide = d.title.split(' ').some((w) => ctx.measureText(w).width > CW);
      if ((lines.length <= 2 && !tooWide) || fs <= 64) break;
      fs -= 4;
    }
    ctx.fillStyle = '#fff';
    let y = 522 + fs * 0.82;
    lines.forEach((ln, k) => ctx.fillText(ln, L - 4, y + k * fs * 1.02));
    y += (lines.length - 1) * fs * 1.02 + fs * 0.2 + 80;
    // факты
    for (const [code, text] of d.facts) {
      ctx.font = '800 40px WrM';
      const tl = wrapLines(ctx, text, CW - 68 - 64 - 26);
      const h = Math.max(120, 56 + tl.length * 48);
      ctx.fillStyle = 'rgba(0,0,0,.3)'; rr(ctx, L + 8, y + 10, CW, h, 36); ctx.fill();
      ctx.fillStyle = 'rgba(40,60,100,.55)'; rr(ctx, L, y, CW, h, 36); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 3; ctx.stroke();
      const im = await loadImg(`stories/emoji/${code}.svg`).catch(() => null);
      if (im) ctx.drawImage(im, L + 34, y + (h - 64) / 2, 64, 64);
      ctx.fillStyle = '#fff';
      const ty = y + h / 2 - (tl.length - 1) * 24 + 14;
      tl.forEach((ln, k) => ctx.fillText(ln, L + 34 + 64 + 26, ty + k * 48));
      y += h + 20;
    }
    // логотип и кнопка с адресом бота
    const ctaH = 122, ctaY = H - 140 - ctaH;
    ctx.fillStyle = '#fff'; ctx.font = '900 50px WrU'; ctx.fillText('потрачено', L, ctaY - 70);
    ctx.fillStyle = '#8fbaf5'; ctx.font = '800 22px WrM'; spaced(ctx, 'БЮДЖЕТ-БОТ', L, ctaY - 34, 7);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(ctx, L + 9, ctaY + 11, CW, ctaH, 34); ctx.fill();
    ctx.fillStyle = '#fff'; rr(ctx, L, ctaY, CW, ctaH, 34); ctx.fill();
    ctx.font = '800 46px WrM';
    const a = 'Считаю деньги в ', b = `@${BOT_USERNAME}`;
    const tw = ctx.measureText(a + b).width, tx = L + (CW - tw) / 2, tyy = ctaY + ctaH / 2 + 16;
    ctx.fillStyle = '#111'; ctx.fillText(a, tx, tyy);
    ctx.fillStyle = '#2a78d6'; ctx.fillText(b, tx + ctx.measureText(a).width, tyy);
    return c;
  }

  async function grantShareBonus() {
    try {
      const r = await api('/share/bonus', { method: 'POST' });
      state.me.scans = r.scans; state.me.sharedThisMonth = true;
      if (r.granted) { haptic('success'); toast(t('shareBonus', r.bonus)); }
    } catch { /* бонус не критичен */ }
  }

  // Окно «Поделиться»: превью карточки, публикация в истории Telegram и сохранение картинки (для Instagram)
  async function openShareSheet(summary) {
    const d = shareData(summary);
    const sh = openSheet(`<div class="loading"><div class="spinner"></div><b>${t('shareMaking')}</b></div>`);
    let canvas;
    try { canvas = await drawShareCard(d); } catch (e) { closeSheet(sh); toast(t('netError')); return; }
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
      ${state.me.sharedThisMonth ? '' : `<div class="note" style="margin:0 4px 12px;text-align:center">🎁 ${t('shareHint', state.me.shareBonus || 5)}</div>`}
      <button class="btn btn-primary btn-block" id="shStory">${t('shareStory')}</button>
      <button class="btn btn-secondary btn-block" id="shSave" style="margin-top:8px">${t('shareSave')}</button>`;
    $('.close', sh.sheet).addEventListener('click', () => closeSheet(sh));
    $('#shStory', sh.sheet).addEventListener('click', async (ev) => {
      const btn = ev.currentTarget; btn.disabled = true;
      try {
        const mediaUrl = await upload();
        if (canStory) {
          const params = { text: `Мой типаж месяца — ${d.title}. Считаю деньги в @${BOT_USERNAME}` };
          // кликабельная ссылка в истории доступна только с Telegram Premium
          if (tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.is_premium) {
            params.widget_link = { url: `https://t.me/${BOT_USERNAME}?start=ref_${state.me.id}`, name: 'Потрачено' };
          }
          tg.shareToStory(mediaUrl, params);
          grantShareBonus();
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
          tg.downloadFile({ url: await upload(), file_name: `potracheno-${summary.month}.jpg` });
        } else {
          const a = document.createElement('a'); a.href = jpeg; a.download = `potracheno-${summary.month}.jpg`; document.body.append(a); a.click(); a.remove();
        }
        grantShareBonus();
      } catch { toast(t('netError')); }
      btn.disabled = false;
    });
  }

  // ---------- недельные истории: «План на неделю» и «Итоги недели» ----------
  const WEEKDAYS_ACC = ['в воскресенье', 'в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу'];
  const dayWord = (date, today) => {
    if (date === today) return 'сегодня';
    const tm = new Date(`${today}T00:00:00Z`); tm.setUTCDate(tm.getUTCDate() + 1);
    if (date === tm.toISOString().slice(0, 10)) return 'завтра';
    return WEEKDAYS_ACC[new Date(`${date}T00:00:00Z`).getUTCDay()];
  };
  const isCyr = (w) => /^[а-яё]/i.test(w);
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
    if (income) return `${esc(note ? lowerFirst(note) : catName(it.category).toLowerCase())} ${day}`;
    if (!note) return `на ${esc(CAT_ACC[it.category] || catName(it.category).toLowerCase())} ${day}`;
    if (/^\S+$/.test(note) && !/\d/.test(note)) return `на ${esc(accusative(note))} ${day}`;
    return `— ${esc(note)} ${day}`;
  }
  const wkPage = (bg, tag, body) => `<div class="wr" style="background:${bg}"><div class="wr-tag">${tag}</div>${body}
    <div class="wr-logo">потрачено<span>БЮДЖЕТ-БОТ</span></div></div>`;

  function buildPlanStory(w) {
    const slides = [];
    const rows = (list, income) => list.map((it) => `<div class="wk-row">${emojiImg(twemoji(cat(it.category).emoji), 84)}
      <div><div class="wk-amt">${wrMoney(it.amount, it.currency)}</div><div class="wk-what">${planLine(it, income, w.today)}</div></div></div>`).join('');
    if (w.plan.expenses.length) {
      slides.push({ html: wkPage('linear-gradient(170deg,#1f7a8c 0%,#123f4a 50%,#0e0e10 100%)', 'План на неделю',
        `<div class="wr-wrap" style="top:400px"><div class="wr-cap" style="margin-top:0">Запланированные расходы</div><div class="wk-rows">${rows(w.plan.expenses, false)}</div></div>`) });
    }
    if (w.plan.incomes.length) {
      slides.push({ html: wkPage('linear-gradient(170deg,#1f9d63 0%,#10533a 50%,#0e0e10 100%)', 'План на неделю',
        `<div class="wr-wrap" style="top:400px"><div class="wr-cap" style="margin-top:0">Запланированные доходы</div><div class="wk-rows">${rows(w.plan.incomes, true)}</div></div>`) });
    }
    if (!slides.length) return null;
    return {
      id: `week-plan-${w.week.from}`, langs: ['ru'], duration: 6000, dynamic: 'week',
      title: { ru: 'План на неделю', en: 'Week plan' },
      coverHtml: `<span class="story-img wk-cover" style="background:linear-gradient(165deg,#1f7a8c,#1f9d63)">${emojiImg('1f5d3', 40)}</span>`,
      slides,
    };
  }

  function buildWeekSummaryStory(w) {
    const s = w.summary;
    if (!s) return null;
    let pill = '';
    if (s.avg) {
      const pct = Math.round(Math.abs(s.spent - s.avg) / s.avg * 100);
      const less = s.spent <= s.avg;
      pill = pct === 0 ? `<div class="wk-pill">как обычно</div>`
        : `<div class="wk-pill">${emojiImg(less ? '1f4c9' : '1f4c8', 56)} на ${pct}% ${less ? 'меньше' : 'больше'}, чем обычно</div>`;
    }
    return {
      id: `week-sum-${w.week.from}`, langs: ['ru'], duration: 6000, dynamic: 'week',
      title: { ru: 'Итоги недели', en: 'Week recap' },
      coverHtml: `<span class="story-img wk-cover" style="background:linear-gradient(165deg,#1d5fae,#12345f)">${emojiImg('1f4ca', 40)}</span>`,
      slides: [{ html: wkPage('linear-gradient(170deg,#1d5fae 0%,#12345f 50%,#0e0e10 100%)', 'Итоги недели',
        `<div class="wr-wrap" style="top:470px"><div class="wr-cap" style="margin-top:0">На прошлой неделе вы потратили</div>
         <div class="wr-num" style="margin-top:40px">${wrMoney(s.spent, w.base)}</div>${pill}
         <div class="wk-top">${emojiImg(twemoji(cat(s.top.category).emoji), 110)}<div><div class="wk-k">Категория #1</div>
         <div class="wk-v">${esc(catName(s.top.category).toLowerCase())}</div></div></div></div>`) }],
    };
  }

  async function loadWeeklyStories() {
    if (state.lang !== 'ru') return;
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
    if (state.lang !== 'ru') return;
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
      render();
    } catch (e) {
      toast(t('netError'));
    }
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
    if (s.prevTotal > 0 && s.total > 0 && Math.abs(pct) <= 300) { // при почти пустом прошлом месяце процент бессмыслен
      const prevIdx = (mm + 10) % 12;
      const prevName = state.lang === 'ru' ? MONTHS.ruDat[prevIdx] : MONTHS.en[prevIdx];
      delta = pct === 0 ? `<span>${t('same')}</span>`
        : `<span class="delta num">${pct > 0 ? '▲' : '▼'} ${Math.abs(pct)}%</span><span>${t('vs', prevName)}</span>`;
    }
    const chart = s.total ? dailyChart(s.days, isCurrent ? Number(state.today.slice(8, 10)) : s.days.length, base) : '';

    // ---- главный блок: остаток, если есть доходы; иначе — сколько потрачено
    if (s.income > 0) {
      const share = s.total / s.income;
      const over = s.balance < 0;
      $('#hero').innerHTML = `
        <div class="hero-label">${esc(t('balanceOf', monthIn))}</div>
        <div class="hero-total num ${over ? 'neg' : ''}">${signed(s.balance, base)}</div>
        <div class="meter ${over ? 'over' : ''}" role="img" aria-label="${esc(t('spentOf', money(s.total, base), money(s.income, base)))}">
          <i style="width:${Math.min(100, Math.max(share > 0 ? 1.5 : 0, share * 100))}%"></i></div>
        <div class="hero-meta">${over ? `<span class="neg-text">${esc(t('overspent', money(-s.balance, base)))}</span>` : `<span>${esc(t('spentOf', money(s.total, base, { round: s.income >= 1000 }), money(s.income, base, { round: s.income >= 1000 })))}</span>`}</div>
        <div class="hero-split">
          <div><span>${t('income')}</span><b class="num pos-text">${signed(s.income, base)}</b></div>
          <div><span>${t('expenses')}</span><b class="num">${signed(-s.total, base)}</b>${delta ? `<div class="hero-meta small">${delta}</div>` : ''}</div>
        </div>
        ${s.projected !== null && s.projected !== undefined ? `<div class="forecast"><span>${t('projected')}</span><b class="num ${s.projected < 0 ? 'neg-text' : ''}">${signed(s.projected, base)}</b></div>` : ''}
        ${chart}`;
    } else {
      $('#hero').innerHTML = `
        <div class="hero-label">${t('spent')}</div>
        <div class="hero-total num">${money(s.total, base)}</div>
        <div class="hero-meta">${delta}${delta ? '<span>·</span>' : ''}<span>${t('entries', s.count)}</span></div>
        ${isCurrent && s.count ? `<button class="hint-link" id="heroAddIncome">💰 ${t('addIncomeHint')}</button>` : ''}
        ${s.projected !== null && s.projected !== undefined ? `<div class="forecast"><span>${t('projected')}</span><b class="num ${s.projected < 0 ? 'neg-text' : ''}">${signed(s.projected, base)}</b></div>` : ''}
        ${chart}`;
      const hint = $('#heroAddIncome');
      if (hint) hint.addEventListener('click', () => openManual('income'));
    }
    bindChart();

    // ---- ожидается в этом месяце
    const up = s.upcoming || [];
    $('#upcomingSection').innerHTML = up.length ? `
      <div class="section-title"><span>${t('upcoming')}</span><button id="allRules">${t('showAll')}</button></div>
      <div class="card list">${up.map((u) => `
        <button class="row" data-rule="${u.id}">
          <div class="emoji ${u.kind === 'income' ? 'inc' : ''}">${cat(u.category).emoji}</div>
          <div class="row-main">
            <div class="row-title">${esc(u.note || catName(u.category))}</div>
            <div class="row-sub">🔁 ${esc(dayMonth(u.date))}</div>
          </div>
          <div class="row-amount num ${u.kind === 'income' ? 'pos-text' : ''}">${u.kind === 'income' ? '+' : ''}${money(u.amount, u.currency)}${u.currency !== base ? `<small>≈ ${money(u.amount_base, base)}</small>` : ''}</div>
        </button>`).join('')}</div>` : '';
    if (up.length) {
      $('#allRules').addEventListener('click', openRecurringList);
      $('#upcomingSection').querySelectorAll('[data-rule]').forEach((b) => b.addEventListener('click', async () => {
        const { rules } = await api('/recurring').catch(() => ({ rules: [] }));
        const r = rules.find((x) => x.id === b.dataset.rule);
        if (r) openRuleEditor(r);
      }));
    }

    // ---- пусто
    if (!s.categories.length && !s.incomeCategories.length) {
      $('#categoriesSection').innerHTML = `<div class="empty"><div class="big">🧾</div>
        <b>${isCurrent ? t('emptyTitle') : t('emptyPast')}</b>${isCurrent ? esc(t('emptyTextIncome')) : ''}</div>`;
      $('#incomeSection').innerHTML = '';
      $('#entriesSection').innerHTML = '';
      return;
    }

    // ---- категории расходов и доходов
    const catList = (list, total, kind) => {
      const top = list[0]?.amount || 1;
      return `<div class="card list">${list.map((c) => `
        <button class="row ${state.filter === c.category ? 'selected' : ''}" data-cat="${c.category}">
          <div class="emoji ${kind === 'income' ? 'inc' : ''}">${cat(c.category).emoji}</div>
          <div class="row-main">
            <div class="row-title">${esc(catName(c.category))}</div>
            <div class="share ${kind === 'income' ? 'inc' : ''}"><i style="width:${Math.max(2, (c.amount / top) * 100)}%"></i></div>
          </div>
          <div class="row-amount num ${kind === 'income' ? 'pos-text' : ''}">${kind === 'income' ? '+' : ''}${money(c.amount, base)}<small>${pctLabel(c.amount / (total || 1))}</small></div>
        </button>`).join('')}</div>`;
    };
    $('#categoriesSection').innerHTML = s.categories.length
      ? `<div class="section-title"><span>${t('spent')}</span><span class="num">${money(s.total, base)}</span></div>${catList(s.categories, s.total, 'expense')}` : '';
    $('#incomeSection').innerHTML = s.incomeCategories.length
      ? `<div class="section-title"><span>${t('income')}</span><span class="num">${money(s.income, base)}</span></div>${catList(s.incomeCategories, s.income, 'income')}` : '';
    document.querySelectorAll('#categoriesSection [data-cat], #incomeSection [data-cat]').forEach((b) => b.addEventListener('click', () => {
      haptic('select');
      state.filter = state.filter === b.dataset.cat ? null : b.dataset.cat;
      render();
      if (state.filter) $('#entriesSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));

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
        <div class="card list">${items.map((e) => {
          const inc = e.kind === 'income';
          const rec = e.recurring_id && e.rec_active ? ' · 🔁' : '';
          return `
          <button class="row" data-id="${e.id}">
            <div class="emoji ${inc ? 'inc' : ''}">${cat(e.category).emoji}</div>
            <div class="row-main">
              <div class="row-title">${esc(e.note || e.merchant || catName(e.category))}</div>
              <div class="row-sub">${esc(catName(e.category))}${e.source === 'receipt' ? ' · 🧾' : ''}${rec}</div>
            </div>
            <div class="row-amount num ${inc ? 'pos-text' : ''}">${inc ? '+' : ''}${e.currency !== base
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
  function bindChart() {
    const tip = $('#tooltip');
    const [, mm] = state.month.split('-').map(Number);
    $('#hero').querySelectorAll('.hit').forEach((r) => {
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
        <div class="chips">${catsOf(kind).map((c) => `
          <button class="chip ${c.id === current ? 'active' : ''}" data-c="${c.id}">${c.emoji} ${esc(catName(c.id))}</button>`).join('')}
          ${newCatChip()}
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
      <div class="field toggle-field">
        <div class="rep-title">🔁 ${t('repeat')}</div>
        <div class="periods" id="${prefix}Periods" role="radiogroup">
          ${['week', '2weeks', 'month'].map((p) => `<button type="button" class="chip ${p === period ? 'active' : ''}" data-p="${p}" role="radio" aria-checked="${p === period}">${t({ week: 'pWeek', '2weeks': 'p2weeks', month: 'pMonth' }[p])}</button>`).join('')}
        </div>
        <div class="rep-day" id="${prefix}RepDay" ${period === 'month' ? '' : 'hidden'}>
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
      return `<div class="dw-item dw-edge" data-edge="${side}">${c ? `<b>${esc(dayMonth(c))}</b><small>${esc(wd(c))}</small>` : `<b>🗓️</b><small>${t('otherDate')}</small>`}
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
      for (const el of items()) {
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

  function openManual(startKind = 'expense') {
    let kind = startKind;
    let currency = state.lastCurrency || state.me.base_currency;
    let category = null, suggested = null, userPicked = false, timer = null, seq = 0;
    const rep = repeatBlock('m', { day: Number(state.today.slice(8, 10)), date: state.today });
    const sh = openSheet(`
      <div class="sheet-head"><h2 id="mTitle"></h2><button class="close">${t('cancel')}</button></div>
      ${dateWheelHtml('mDate')}
      <div class="field amount-field">
        <span class="sign" id="mSign"></span>
        <input id="mAmount" inputmode="decimal" placeholder="0" autocomplete="off" aria-label="${t('amount')}">
        <button class="cur-btn" id="mCur">${currency}</button>
      </div>
      <div class="field"><label for="mNote" id="mNoteLabel"></label><input id="mNote" maxlength="120" autocomplete="off"></div>
      <div class="label-row"><span>${t('category')}</span></div>
      <div class="chips" id="mCats"></div>
      ${rep.html}
      <button class="btn btn-primary btn-block" id="mSave">${t('save')}</button>`);
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
      const LIMIT = 9;
      $('#mCats', S).innerHTML = order.slice(0, LIMIT).map((id) => `
        <button class="chip ${id === category ? 'active' : ''}" data-c="${id}">${cat(id).emoji} ${esc(catName(id))}
        ${id === suggested && !userPicked && kind === 'expense' ? `<span class="ai">${t('ai')}</span>` : ''}</button>`).join('') +
        (order.length > LIMIT ? `<button class="chip" data-more>…</button>` : '') + newCatChip();
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
      if (c) { currency = c; $('#mCur', S).textContent = c; }
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
            <button class="emoji ${inc ? 'inc' : ''}" data-act="cat" aria-label="${t('category')}">${cat(x.category).emoji}</button>
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
              <button class="group-cat" data-act="cat"><span>${cat(g.category).emoji}</span><span>${esc(catName(g.category))}</span></button>
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
      <div class="sheet-head"><h2>${inc ? t('editIncome') : t('edit')}</h2><button class="close">${t('cancel')}</button></div>
      <div class="field amount-field">
        <span class="sign ${inc ? 'pos-text' : ''}">${inc ? '+' : '−'}</span>
        <input id="eAmount" inputmode="decimal" value="${String(e.amount).replace('.', state.lang === 'ru' ? ',' : '.')}" aria-label="${t('amount')}">
        <button class="cur-btn" id="eCur">${currency}</button>
      </div>
      <div class="field"><label>${inc ? t('incomeNote') : t('note')}</label><input id="eNote" value="${esc(e.note || '')}" maxlength="120"></div>
      <div class="field" style="padding:12px 14px"><button class="group-cat" id="eCat" style="width:100%"><span>${cat(category).emoji}</span><span>${esc(catName(category))}</span></button></div>
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
      if (c) { category = c; $('#eCat', S).innerHTML = `<span>${cat(c).emoji}</span><span>${esc(catName(c))}</span>`; }
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
  async function openRecurringList() {
    let rules = [];
    try { ({ rules } = await api('/recurring')); } catch { toast(t('netError')); return; }
    const base = state.me.base_currency;
    const block = (list, title, kind) => !list.length ? '' : `
      <div class="section-title"><span>${title}</span><span class="num">${signed((kind === 'income' ? 1 : -1) * list.filter((r) => r.active).reduce((a, r) => a + r.amount_base, 0), base)}</span></div>
      <div class="card list rules-list">${list.map((r) => `
        <button class="row ${r.active ? '' : 'muted'}" data-rule="${r.id}">
          <div class="emoji ${kind === 'income' ? 'inc' : ''}">${cat(r.category).emoji}</div>
          <div class="row-main">
            <div class="row-title">${esc(r.note || catName(r.category))}</div>
            <div class="row-sub">${esc(periodText(r.period || 'month', r.day, r.weekday))} · ${r.active ? esc(t('next', dayMonth(r.next))) : t('paused')}</div>
          </div>
          <div class="row-amount num ${kind === 'income' ? 'pos-text' : ''}">${kind === 'income' ? '+' : ''}${money(r.amount, r.currency)}${r.currency !== base ? `<small>≈ ${money(r.amount_base, base)}</small>` : ''}</div>
        </button>`).join('')}</div>`;
    const sh = openSheet(`
      <div class="sheet-head"><h2>${t('recurring')}</h2><button class="close">${t('done')}</button></div>
      ${rules.length ? block(rules.filter((r) => r.kind === 'income'), t('recIncome'), 'income') + block(rules.filter((r) => r.kind === 'expense'), t('recExpense'), 'expense')
        : `<div class="empty"><div class="big">🔁</div>${esc(t('recurringEmpty'))}</div>`}`);
    $('.close', sh.sheet).addEventListener('click', () => closeSheet(sh));
    sh.sheet.querySelectorAll('[data-rule]').forEach((b) => b.addEventListener('click', () => {
      const r = rules.find((x) => x.id === b.dataset.rule);
      if (r) openRuleEditor(r, () => { closeSheet(sh); openRecurringList(); });
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
      <div class="field" style="padding:12px 14px"><button class="group-cat" id="rCat" style="width:100%"><span>${cat(category).emoji}</span><span>${esc(catName(category))}</span></button></div>
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
      if (c) { category = c; $('#rCat', S).innerHTML = `<span>${cat(c).emoji}</span><span>${esc(catName(c))}</span>`; }
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
        <small>${t('daysWithUs', (state.daysSinceStart || 0) + 1)}</small></div></div>
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
      const story = state.lang === 'ru' ? buildWeekSummaryStory(w) : null;
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
      const story = state.lang === 'ru' ? buildMonthStory(s) : null;
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
        <span class="ce-name"><span class="ce-ico">${c.emoji}</span>${esc(catName(c.id))}${c.custom ? ` <span class="ce-badge">${t('ownCat')}</span>` : ''}</span>
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
        <button class="row" id="sRec"><span>🔁 ${t('recurring')}</span><span class="settings-value">›</span></button>
        ${STORIES.some((x) => x.id === 'howto-v1' && storyLang(x)) ? `<button class="row" id="sHowto"><span>📖 ${t('howto')}</span><span class="settings-value">›</span></button>` : ''}
      </div>
      <div class="card list settings-list">
        <div class="row"><span>${t('scans')}</span><span class="settings-value num">${me.scansUsed} ${t('from')} ${me.scans}</span></div>
        <button class="row" id="sReports"><span>${t('reports')}</span><span class="settings-value">${me.can_message ? t('reportsOn') : t('reportsOff')} ›</span></button>
        <button class="row" id="sNudges"><span>${t('nudges')}</span><span class="settings-value">${me.nudges ? t('reportsOn') : t('reportsOff')} ›</span></button>
      </div>
      <div class="card list settings-list">
        <button class="row" id="sExport"><span style="color:var(--link)">${t('export')}</span><span></span></button>
        <button class="row" id="sDelete"><span style="color:var(--danger)">${t('deleteAll')}</span><span></span></button>
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
    $('#sRec', S).addEventListener('click', () => openRecurringList());
    const hb = $('#sHowto', S);
    if (hb) hb.addEventListener('click', () => { closeSheet(sh); openStory(STORIES.find((x) => x.id === 'howto-v1')); });
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
      shareBonus: me.limits.shareBonus, sharedThisMonth: me.limits.sharedThisMonth };
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
    state.month = me.today.slice(0, 7);
    state.lastCurrency = store.get('lastCurrency') || me.user.base_currency;
    if (!state.currencies.includes(state.lastCurrency)) state.lastCurrency = me.user.base_currency;
    applyStatic();

    $('#prevMonth').addEventListener('click', () => { state.month = shiftMonth(state.month, -1); state.filter = null; haptic('select'); loadMonth(); });
    $('#nextMonth').addEventListener('click', () => { state.month = shiftMonth(state.month, 1); state.filter = null; haptic('select'); loadMonth(); });
    $('#openMenu').addEventListener('click', () => { haptic('select'); openMenu(); });
    $('#addManual').addEventListener('click', () => openManual('expense'));
    $('#addIncome').addEventListener('click', () => openManual('income'));
    $('#addReceipt').addEventListener('click', () => { const f = $('#fileInput'); f.value = ''; f.click(); });
    $('#fileInput').addEventListener('change', (e) => onScanFiles(e.target.files));

    await loadMonth();
    renderStories();
    const startParam = tg && tg.initDataUnsafe ? tg.initDataUnsafe.start_param : '';
    const wantMonth = new URLSearchParams(location.search).get('story') === 'month' || startParam === 'month';
    const storiesP = me.hasEntries ? Promise.all([loadMonthStory(wantMonth), loadWeeklyStories()]) : Promise.resolve([null]);
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
