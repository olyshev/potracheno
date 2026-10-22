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
      today: 'Сегодня', yesterday: 'Вчера', emptyTitle: 'Пока пусто',
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
      upcoming: 'Ожидается в этом месяце', recurring: 'Регулярные платежи', recurringEmpty: 'Пока нет регулярных платежей. Выберите, как часто повторять, когда добавляете зарплату, аренду или подписку — дальше приложение будет вносить их само.',
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
      today: 'Today', yesterday: 'Yesterday', emptyTitle: 'Nothing here yet',
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
      upcoming: 'Coming up this month', recurring: 'Recurring payments', recurringEmpty: 'No recurring payments yet. Pick how often to repeat when adding your salary, rent or a subscription — the app will add them for you from then on.',
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
  const catsOf = (kind) => (kind === 'income' ? state.incomeCats : state.cats);
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
  async function api(path, opts = {}) {
    const res = await fetch(`/api${path}`, {
      method: opts.method || 'GET',
      headers: { authorization: `tma ${initData}`, ...(opts.body ? { 'content-type': 'application/json' } : {}) },
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
  function openSheet(html, { onClose } = {}) {
    const backdrop = document.createElement('div');
    backdrop.className = 'sheet-backdrop';
    const sheet = document.createElement('div');
    sheet.className = 'sheet';
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

  // ---------- выбор категории / валюты ----------
  function pickCategory(current, kind = 'expense') {
    return new Promise((resolve) => {
      let picked = null;
      const sh = openSheet(`
        <div class="sheet-head"><h2>${t('category')}</h2><button class="close">${t('close')}</button></div>
        <div class="chips">${catsOf(kind).map((c) => `
          <button class="chip ${c.id === current ? 'active' : ''}" data-c="${c.id}">${c.emoji} ${esc(catName(c.id))}</button>`).join('')}
        </div>`, { onClose: () => resolve(picked) });
      $('.close', sh.sheet).addEventListener('click', () => closeSheet(sh));
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
  function openManual(startKind = 'expense') {
    let kind = startKind;
    let currency = state.lastCurrency || state.me.base_currency;
    let category = null, suggested = null, userPicked = false, timer = null, seq = 0;
    const rep = repeatBlock('m', { day: Number(state.today.slice(8, 10)), date: state.today });
    const sh = openSheet(`
      <div class="sheet-head"><h2 id="mTitle"></h2><button class="close">${t('cancel')}</button></div>
      <div class="field"><label for="mDate">${t('date')}</label><input id="mDate" type="date" value="${state.today}" max="${state.today}"></div>
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
    const amountEl = $('#mAmount', S), noteEl = $('#mNote', S), dateEl = $('#mDate', S);
    setTimeout(() => amountEl.focus(), 280);
    $('.close', S).addEventListener('click', () => closeSheet(sh));
    const getRepeat = rep.bind(S, (cb) => dateEl.addEventListener('change', () => cb(dateEl.value)));

    const drawCats = () => {
      // сначала выбранная/подсказанная категория, потом частые в этом месяце, потом остальные
      const summary = state.data?.summary;
      const used = ((kind === 'income' ? summary?.incomeCategories : summary?.categories) || []).map((c) => c.category);
      const order = [...new Set([category, suggested, ...used, ...catsOf(kind).map((c) => c.id)].filter(Boolean))];
      $('#mCats', S).innerHTML = order.slice(0, kind === 'income' ? 10 : 9).map((id) => `
        <button class="chip ${id === category ? 'active' : ''}" data-c="${id}">${cat(id).emoji} ${esc(catName(id))}
        ${id === suggested && !userPicked && kind === 'expense' ? `<span class="ai">${t('ai')}</span>` : ''}</button>`).join('') +
        (kind === 'expense' ? `<button class="chip" data-more>…</button>` : '');
      $('#mCats', S).querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => {
        category = b.dataset.c; userPicked = true; haptic('select'); drawCats();
      }));
      const more = $('[data-more]', S);
      if (more) more.addEventListener('click', async () => {
        const c = await pickCategory(category, kind);
        if (c) { category = c; userPicked = true; drawCats(); }
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
      <div class="field"><label>${t('date')}</label><input id="eDate" type="date" value="${e.date}" max="${state.today}"></div>
      ${rep.html}
      ${e.source === 'recurring' ? `<div class="note" style="margin:-4px 4px 14px">🔁 ${t('auto')}</div>` : ''}
      <button class="btn btn-primary btn-block" id="eSave">${t('save')}</button>
      <button class="btn btn-danger btn-block" id="eDel" style="margin-top:6px">${t('delete')}</button>`);
    const S = sh.sheet;
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
    $('#sLang', S).addEventListener('click', async () => {
      state.lang = state.lang === 'ru' ? 'en' : 'ru';
      await api('/settings', { method: 'POST', body: { lang: state.lang } }).catch(() => {});
      applyStatic(); closeSheet(sh); loadMonth(); openSettings();
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
  async function start() {
    if (tg) { tg.ready(); tg.expand(); try { tg.disableVerticalSwipes && tg.isVersionAtLeast('7.7') && tg.disableVerticalSwipes(); } catch { /* */ } }
    if (!initData) {
      document.body.innerHTML = `<div class="blocker"><div class="big">📱</div><p>${T.ru.openInTg}<br>${T.en.openInTg}</p></div>`;
      return;
    }
    let me;
    try { me = await api('/me'); } catch (e) {
      document.body.innerHTML = `<div class="blocker"><div class="big">⚠️</div><p>${e.status === 401 ? `${T.ru.openInTg}<br>${T.en.openInTg}` : 'Network error'}</p></div>`;
      return;
    }
    state.me = { ...me.user, scans: me.limits.scans, scansUsed: me.limits.scansUsed };
    state.lang = me.user.lang === 'en' ? 'en' : 'ru';
    state.cats = me.categories;
    state.incomeCats = me.income_categories || [];
    state.catMap = Object.fromEntries([...me.categories, ...state.incomeCats].map((c) => [c.id, c]));
    state.currencies = me.currencies;
    state.today = me.today;
    state.month = me.today.slice(0, 7);
    state.lastCurrency = store.get('lastCurrency') || me.user.base_currency;
    if (!state.currencies.includes(state.lastCurrency)) state.lastCurrency = me.user.base_currency;
    applyStatic();

    $('#prevMonth').addEventListener('click', () => { state.month = shiftMonth(state.month, -1); state.filter = null; haptic('select'); loadMonth(); });
    $('#nextMonth').addEventListener('click', () => { state.month = shiftMonth(state.month, 1); state.filter = null; haptic('select'); loadMonth(); });
    $('#openSettings').addEventListener('click', openSettings);
    $('#addManual').addEventListener('click', () => openManual('expense'));
    $('#addIncome').addEventListener('click', () => openManual('income'));
    $('#addReceipt').addEventListener('click', () => { const f = $('#fileInput'); f.value = ''; f.click(); });
    $('#fileInput').addEventListener('change', (e) => onScanFiles(e.target.files));

    await loadMonth();
    if (!me.hasEntries && !store.get('welcomed')) await openWelcome();
    if (!state.me.can_message) requestWriteAccess(false);
  }

  start();
})();
