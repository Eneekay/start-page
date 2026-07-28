(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function safeStorageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeStorageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignore (private mode etc.) */ }
  }

  function safeStorageRemove(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function getTimeBucket(hour) {
    if (hour >= 5 && hour <= 11) return 'morning';
    if (hour >= 12 && hour <= 16) return 'afternoon';
    if (hour >= 17 && hour <= 21) return 'evening';
    return 'night';
  }

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / 86400000); }
  function sameDate(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

  /* ---------- clock ---------- */

  var clockEl = document.getElementById('clock');
  var dateEl = document.getElementById('date');

  var timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });
  var dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  function tickClock() {
    var now = new Date();
    clockEl.textContent = timeFormatter.format(now);
    dateEl.textContent = dateFormatter.format(now);
  }

  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- greeting + name ---------- */

  var NAME_KEY = 'startpage_name';
  var greetingWidget = document.getElementById('greetingWidget');
  var ENGLISH_GREETING = {
    morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening', night: 'Good night'
  };

  function renderGreeting(name) {
    var LANGUAGES = window.GREETING_LANGUAGES || [];
    if (!LANGUAGES.length || !greetingWidget) return;
    var lang = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
    var bucket = getTimeBucket(new Date().getHours());
    var phrase = lang[bucket];
    var englishPhrase = (lang.translations && lang.translations[bucket]) || ENGLISH_GREETING[bucket];
    var pronEn = lang.pronEn && lang.pronEn[bucket];
    var pronGr = lang.pronGr && lang.pronGr[bucket];
    var pronLine = '';
    if (pronEn || pronGr) {
      pronLine = '<div class="greeting-pron">Say it: ' + (pronEn ? escapeHtml(pronEn) : '') +
        (pronEn && pronGr ? ' · ' : '') + (pronGr ? escapeHtml(pronGr) : '') + '</div>';
    }

    greetingWidget.innerHTML =
      '<div class="greeting-text">' + escapeHtml(phrase) + ', ' + escapeHtml(name) + '</div>' +
      '<div class="greeting-meta"><span class="lang-name">' + escapeHtml(lang.english) + '</span> (' + escapeHtml(lang.native) + ')<br>“' + escapeHtml(englishPhrase) + ', ' + escapeHtml(name) + '”</div>' +
      pronLine +
      '<button type="button" class="change-name-link" id="changeNameBtn">not you?</button>';

    var changeBtn = document.getElementById('changeNameBtn');
    if (changeBtn) {
      changeBtn.addEventListener('click', function () {
        safeStorageRemove(NAME_KEY);
        renderNameForm();
      });
    }
  }

  function renderNameForm() {
    if (!greetingWidget) return;
    greetingWidget.innerHTML =
      '<form class="name-form" id="nameForm" autocomplete="off">' +
        '<span class="name-prompt">What should I call you?</span>' +
        '<input type="text" class="name-input" id="nameInput" placeholder="Your name" maxlength="40" required>' +
        '<button type="submit" class="name-submit">Save</button>' +
      '</form>';

    var form = document.getElementById('nameForm');
    var input = document.getElementById('nameInput');
    if (input) input.focus();
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = input.value.trim();
        if (!name) return;
        safeStorageSet(NAME_KEY, name);
        renderGreeting(name);
      });
    }
  }

  var storedName = safeStorageGet(NAME_KEY);
  if (storedName) {
    renderGreeting(storedName);
  } else {
    renderNameForm();
  }

  /* ---------- science + animal facts (independent sections, sci-fi decode refresh) ---------- */

  var SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#$%&01';

  function scrambleTextInto(el, target) {
    el.classList.add('is-decoding');
    var duration = 550;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var revealCount = Math.floor(progress * target.length);
      var out = '';
      for (var i = 0; i < target.length; i++) {
        if (i < revealCount || target[i] === ' ') {
          out += target[i];
        } else {
          out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      el.textContent = out;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = target;
        el.classList.remove('is-decoding');
      }
    }
    requestAnimationFrame(frame);
  }

  function initFactSection(getList, textElId, refreshBtnId) {
    var textEl = document.getElementById(textElId);
    var refreshBtn = document.getElementById(refreshBtnId);
    var lastIndex = -1;

    function showRandom(animate) {
      var list = getList();
      if (!list.length || !textEl) return;
      var index = Math.floor(Math.random() * list.length);
      if (list.length > 1 && index === lastIndex) {
        index = (index + 1) % list.length;
      }
      lastIndex = index;
      var target = list[index];
      if (animate && !reduceMotion) {
        scrambleTextInto(textEl, target);
      } else {
        textEl.textContent = target;
      }
    }

    showRandom(false);

    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        if (!reduceMotion) {
          refreshBtn.classList.add('is-spinning');
          setTimeout(function () { refreshBtn.classList.remove('is-spinning'); }, 650);
        }
        showRandom(true);
      });
    }
  }

  initFactSection(function () { return window.SCIENCE_FACTS || []; }, 'scienceFactText', 'scienceFactRefresh');
  initFactSection(function () { return window.ANIMAL_FACTS || []; }, 'animalFactText', 'animalFactRefresh');

  /* ---------- calendar + Greek nameday ---------- */

  var NAMEDAYS = window.GREEK_NAMEDAYS || {};
  var calMonthLabelEl = document.getElementById('calMonthLabel');
  var calWeekdaysEl = document.getElementById('calWeekdays');
  var calGridEl = document.getElementById('calGrid');
  var calDateLabelEl = document.getElementById('calDateLabel');
  var calNamedayNamesEl = document.getElementById('calNamedayNames');
  var calPrevBtn = document.getElementById('calPrevBtn');
  var calNextBtn = document.getElementById('calNextBtn');

  var monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
  var weekdayShortFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
  var selectedDateLabelFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  var WEEKDAY_LABELS = (function () {
    // Monday-first week labels, locale-aware short names.
    var base = new Date(2023, 0, 2); // a Monday
    var labels = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(base);
      d.setDate(base.getDate() + i);
      labels.push(weekdayShortFormatter.format(d));
    }
    return labels;
  })();

  var today = new Date();
  var calendarState = {
    viewYear: today.getFullYear(),
    viewMonth: today.getMonth(),
    selected: startOfDay(today)
  };

  function namedayKey(d) { return pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }

  function updateNamedayDisplay() {
    if (!calDateLabelEl || !calNamedayNamesEl) return;
    var d = calendarState.selected;
    var isToday = sameDate(d, today);
    calDateLabelEl.textContent = isToday ? 'Today' : selectedDateLabelFormatter.format(d);
    var names = NAMEDAYS[namedayKey(d)];
    calNamedayNamesEl.textContent = names && names.length ? names.join(', ') : 'No major nameday';
  }

  function renderCalendarWeekdays() {
    if (!calWeekdaysEl) return;
    calWeekdaysEl.innerHTML = WEEKDAY_LABELS.map(function (label) {
      return '<div class="calendar-weekday">' + escapeHtml(label) + '</div>';
    }).join('');
  }

  function renderCalendar() {
    if (!calGridEl || !calMonthLabelEl) return;
    var y = calendarState.viewYear;
    var m = calendarState.viewMonth;
    calMonthLabelEl.textContent = monthFormatter.format(new Date(y, m, 1));

    var firstOfMonth = new Date(y, m, 1);
    var leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
    var daysInMonth = new Date(y, m + 1, 0).getDate();

    var html = '';
    for (var b = 0; b < leadingBlanks; b++) {
      html += '<div class="calendar-day is-empty"></div>';
    }
    for (var day = 1; day <= daysInMonth; day++) {
      var cellDate = new Date(y, m, day);
      var classes = 'calendar-day';
      if (sameDate(cellDate, today)) classes += ' is-today';
      if (sameDate(cellDate, calendarState.selected)) classes += ' is-selected';
      html += '<button type="button" class="' + classes + '" data-day="' + day + '">' + day + '</button>';
    }
    calGridEl.innerHTML = html;

    var dayButtons = calGridEl.querySelectorAll('.calendar-day:not(.is-empty)');
    dayButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var d = parseInt(btn.getAttribute('data-day'), 10);
        calendarState.selected = new Date(calendarState.viewYear, calendarState.viewMonth, d);
        renderCalendar();
        updateNamedayDisplay();
      });
    });
  }

  if (calPrevBtn) {
    calPrevBtn.addEventListener('click', function () {
      calendarState.viewMonth -= 1;
      if (calendarState.viewMonth < 0) { calendarState.viewMonth = 11; calendarState.viewYear -= 1; }
      renderCalendar();
    });
  }
  if (calNextBtn) {
    calNextBtn.addEventListener('click', function () {
      calendarState.viewMonth += 1;
      if (calendarState.viewMonth > 11) { calendarState.viewMonth = 0; calendarState.viewYear += 1; }
      renderCalendar();
    });
  }

  renderCalendarWeekdays();
  renderCalendar();
  updateNamedayDisplay();

  /* ---------- live nameday feed (best-effort; falls back to the static list above) ---------- */

  (function () {
    var CALENDAR_ID = 'ccbe68e64749103054bced1dac20560003d8b59c4327e2194c2ae149dd9e746e@group.calendar.google.com';
    var CACHE_KEY = 'startpage_namedays_feed_cache_v1';
    var MAX_AGE_MS = 24 * 60 * 60 * 1000;

    function unescapeIcsText(s) {
      return s.replace(/\\n/gi, ', ').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
    }

    function parseIcsNamedays(icsText) {
      var lines = icsText.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n');
      var result = {};
      var inEvent = false, dtstart = null, summary = null;
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf('BEGIN:VEVENT') === 0) { inEvent = true; dtstart = null; summary = null; continue; }
        if (line.indexOf('END:VEVENT') === 0) {
          if (inEvent && dtstart && summary) {
            var m = dtstart.match(/(\d{4})(\d{2})(\d{2})/);
            if (m) {
              var key = m[2] + '-' + m[3];
              var names = unescapeIcsText(summary).split(/[,/]|\bkai\b|\band\b/i)
                .map(function (s) { return s.trim(); })
                .filter(Boolean);
              if (names.length) result[key] = (result[key] || []).concat(names);
            }
          }
          inEvent = false; continue;
        }
        if (!inEvent) continue;
        if (line.indexOf('DTSTART') === 0) {
          var idx = line.indexOf(':');
          if (idx !== -1) dtstart = line.slice(idx + 1);
        } else if (line.indexOf('SUMMARY') === 0) {
          var idx2 = line.indexOf(':');
          if (idx2 !== -1) summary = line.slice(idx2 + 1);
        }
      }
      return result;
    }

    function mergeNamedays(base, extra) {
      var merged = {}, key;
      for (key in base) { if (base.hasOwnProperty(key)) merged[key] = base[key].slice(); }
      for (key in extra) {
        if (!extra.hasOwnProperty(key)) continue;
        var existing = merged[key] || [];
        var seen = {};
        existing.forEach(function (n) { seen[n] = true; });
        extra[key].forEach(function (n) {
          if (!seen[n]) { seen[n] = true; existing.push(n); }
        });
        merged[key] = existing;
      }
      return merged;
    }

    function applyLiveNamedays(parsed) {
      NAMEDAYS = mergeNamedays(window.GREEK_NAMEDAYS || {}, parsed);
      updateNamedayDisplay();
    }

    var cached = null;
    try { cached = JSON.parse(safeStorageGet(CACHE_KEY) || 'null'); } catch (e) { cached = null; }
    if (cached && cached.data && (Date.now() - cached.fetchedAt) < MAX_AGE_MS) {
      applyLiveNamedays(cached.data);
      return;
    }

    var icsUrl = 'https://calendar.google.com/calendar/ical/' + encodeURIComponent(CALENDAR_ID) + '/public/basic.ics';
    var proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(icsUrl);
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 8000) : null;

    fetch(proxyUrl, controller ? { signal: controller.signal } : undefined)
      .then(function (res) { if (!res.ok) throw new Error('bad status'); return res.text(); })
      .then(function (text) {
        if (timeoutId) clearTimeout(timeoutId);
        var parsed = parseIcsNamedays(text);
        if (Object.keys(parsed).length === 0) throw new Error('empty feed');
        safeStorageSet(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), data: parsed }));
        applyLiveNamedays(parsed);
      })
      .catch(function () {
        if (timeoutId) clearTimeout(timeoutId);
        if (cached && cached.data) applyLiveNamedays(cached.data);
      });
  })();

  /* ---------- UK bank holidays (England & Wales) ---------- */

  var bankHolidayNameEl = document.getElementById('bankHolidayName');
  var bankHolidayDateEl = document.getElementById('bankHolidayDate');
  var bankHolidayCountdownEl = document.getElementById('bankHolidayCountdown');
  var bankHolidayDateFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  function computeEasterSunday(year) {
    var a = year % 19;
    var b = Math.floor(year / 100);
    var c = year % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function nthWeekdayOfMonth(year, month, weekday, n) {
    var d = new Date(year, month, 1);
    var offset = (weekday - d.getDay() + 7) % 7;
    var day = 1 + offset + (n - 1) * 7;
    return new Date(year, month, day);
  }

  function lastWeekdayOfMonth(year, month, weekday) {
    var d = new Date(year, month + 1, 0);
    var offset = (d.getDay() - weekday + 7) % 7;
    return new Date(year, month, d.getDate() - offset);
  }

  function addWeekendSubstitute(dates, date) {
    var d = new Date(date);
    var day = d.getDay();
    if (day === 6) d.setDate(d.getDate() + 2);
    else if (day === 0) d.setDate(d.getDate() + 1);
    while (dates.some(function (existing) { return sameDate(existing.date, d); })) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  }

  function getUKBankHolidays(year) {
    var easter = computeEasterSunday(year);
    var goodFriday = new Date(easter); goodFriday.setDate(easter.getDate() - 2);
    var easterMonday = new Date(easter); easterMonday.setDate(easter.getDate() + 1);

    var holidays = [];
    holidays.push({ name: "New Year's Day", date: addWeekendSubstitute(holidays, new Date(year, 0, 1)) });
    holidays.push({ name: 'Good Friday', date: goodFriday });
    holidays.push({ name: 'Easter Monday', date: easterMonday });
    holidays.push({ name: 'Early May Bank Holiday', date: nthWeekdayOfMonth(year, 4, 1, 1) });
    holidays.push({ name: 'Spring Bank Holiday', date: lastWeekdayOfMonth(year, 4, 1) });
    holidays.push({ name: 'Summer Bank Holiday', date: lastWeekdayOfMonth(year, 7, 1) });
    holidays.push({ name: 'Christmas Day', date: addWeekendSubstitute(holidays, new Date(year, 11, 25)) });
    holidays.push({ name: 'Boxing Day', date: addWeekendSubstitute(holidays, new Date(year, 11, 26)) });

    holidays.sort(function (a, b) { return a.date - b.date; });
    return holidays;
  }

  function getNextBankHoliday(fromDate) {
    var from = startOfDay(fromDate);
    var candidates = getUKBankHolidays(from.getFullYear()).concat(getUKBankHolidays(from.getFullYear() + 1));
    for (var i = 0; i < candidates.length; i++) {
      if (startOfDay(candidates[i].date) >= from) return candidates[i];
    }
    return null;
  }

  function renderBankHoliday() {
    if (!bankHolidayNameEl) return;
    var next = getNextBankHoliday(new Date());
    if (!next) {
      bankHolidayNameEl.textContent = 'Unavailable';
      return;
    }
    var days = daysBetween(new Date(), next.date);
    bankHolidayNameEl.textContent = next.name;
    bankHolidayDateEl.textContent = bankHolidayDateFormatter.format(next.date);
    bankHolidayCountdownEl.textContent = days === 0 ? "It's today!" : days === 1 ? '1 day to go' : days + ' days to go';
  }

  renderBankHoliday();

  /* ---------- custom countdown ---------- */

  var COUNTDOWN_KEY = 'startpage_countdown';
  var countdownWidget = document.getElementById('countdownBody');
  var countdownDateFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

  function renderCountdownDisplay(data) {
    if (!countdownWidget) return;
    var target = startOfDay(new Date(data.date + 'T00:00:00'));
    var days = daysBetween(new Date(), target);
    var label = data.label ? data.label : 'Countdown';
    var number, unit;
    if (days > 0) { number = days; unit = days === 1 ? 'day to go' : 'days to go'; }
    else if (days === 0) { number = ''; unit = "It's today!"; }
    else { number = Math.abs(days); unit = Math.abs(days) === 1 ? 'day ago' : 'days ago'; }

    countdownWidget.innerHTML =
      '<div class="countdown-label">' + escapeHtml(label) + '</div>' +
      '<div class="countdown-number">' + number + '</div>' +
      '<div class="countdown-unit">' + escapeHtml(unit) + '</div>' +
      '<div class="countdown-date">' + escapeHtml(countdownDateFormatter.format(target)) + '</div>' +
      '<button type="button" class="countdown-change-link" id="countdownChangeBtn">change</button>';

    var changeBtn = document.getElementById('countdownChangeBtn');
    if (changeBtn) {
      changeBtn.addEventListener('click', function () { renderCountdownForm(data); });
    }
  }

  function renderCountdownForm(prefill) {
    if (!countdownWidget) return;
    var labelValue = prefill && prefill.label ? prefill.label : '';
    var dateValue = prefill && prefill.date ? prefill.date : '';
    countdownWidget.innerHTML =
      '<form class="countdown-form" id="countdownForm" autocomplete="off">' +
        '<span class="name-prompt">Count down to…</span>' +
        '<input type="text" class="name-input" id="countdownLabelInput" placeholder="Event name (optional)" maxlength="40" value="' + escapeHtml(labelValue) + '">' +
        '<input type="date" class="name-input" id="countdownDateInput" required value="' + escapeHtml(dateValue) + '">' +
        '<button type="submit" class="name-submit">Set</button>' +
      '</form>';

    var form = document.getElementById('countdownForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var dateInput = document.getElementById('countdownDateInput');
        var labelInput = document.getElementById('countdownLabelInput');
        if (!dateInput.value) return;
        var data = { label: labelInput.value.trim(), date: dateInput.value };
        safeStorageSet(COUNTDOWN_KEY, JSON.stringify(data));
        renderCountdownDisplay(data);
      });
    }
  }

  (function initCountdown() {
    var saved = null;
    try { saved = JSON.parse(safeStorageGet(COUNTDOWN_KEY) || 'null'); } catch (e) { saved = null; }
    if (saved && saved.date) {
      renderCountdownDisplay(saved);
    } else {
      renderCountdownForm(null);
    }
  })();

  /* ---------- on this day ---------- */

  (function renderOnThisDay() {
    var el = document.getElementById('onThisDayWidget');
    if (!el) return;
    var ON_THIS_DAY = window.ON_THIS_DAY || {};
    var mmdd = pad2(new Date().getMonth() + 1) + '-' + pad2(new Date().getDate());
    var entry = ON_THIS_DAY[mmdd];
    if (entry) {
      var yearsAgo = new Date().getFullYear() - entry.year;
      el.innerHTML =
        '<span class="widget-eyebrow">On This Day</span>' +
        '<div class="onthisday-year">' + entry.year + '</div>' +
        '<p class="onthisday-text">' + escapeHtml(entry.text) + '</p>' +
        '<div class="onthisday-ago">' + yearsAgo + ' years ago today</div>';
    } else {
      el.innerHTML =
        '<span class="widget-eyebrow">On This Day</span>' +
        '<p class="onthisday-text onthisday-text--empty">No notable historical event logged for this day yet.</p>';
    }
  })();

  /* ---------- puzzle: memory match ---------- */

  (function () {
    var puzzleWidget = document.getElementById('puzzleWidget');
    if (!puzzleWidget) return;

    function fisherShuffle(arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
      }
      return a;
    }

    function goalLine(text) {
      return '<p class="puzzle-goal">' + escapeHtml(text) + '</p>';
    }

    /* ---- Memory Match ---- */
    function initMemoryPuzzle() {
      var MEMORY_ICONS = {
        star: '<polygon points="12 2 14.9 8.6 22 9.3 16.5 14 18.2 21 12 17.3 5.8 21 7.5 14 2 9.3 9.1 8.6"></polygon>',
        heart: '<path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9z"></path>',
        moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
        sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"></path>',
        bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
        diamond: '<polygon points="12 2 22 12 12 22 2 12"></polygon>'
      };
      var ICON_KEYS = Object.keys(MEMORY_ICONS);
      var board = [], flipped = [], matched = {}, moves = 0, locked = false;

      function iconSvg(key) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + MEMORY_ICONS[key] + '</svg>';
      }
      function shuffledBoard() { return fisherShuffle(ICON_KEYS.concat(ICON_KEYS)); }
      function isSolved() { return Object.keys(matched).length === board.length; }

      function render() {
        var solved = isSolved();
        var cardsHtml = board.map(function (key, i) {
          var faceUp = matched[i] || flipped.indexOf(i) !== -1;
          var classes = 'memory-card' + (matched[i] ? ' is-matched' : '');
          return '<button type="button" class="' + classes + '" data-idx="' + i + '">' +
            (faceUp ? iconSvg(key) : '<span class="memory-card-back"></span>') +
          '</button>';
        }).join('');

        puzzleWidget.innerHTML =
          '<span class="widget-eyebrow">Puzzle — Memory Match</span>' +
          goalLine('Find all the matching pairs.') +
          '<div class="memory-grid">' + cardsHtml + '</div>' +
          '<div class="puzzle-count' + (solved ? ' puzzle-count--solved' : '') + '">' +
            (solved ? '🎉 Solved in ' + moves + (moves === 1 ? ' move!' : ' moves!') : moves + (moves === 1 ? ' move' : ' moves')) +
          '</div>' +
          '<button type="button" class="countdown-change-link" id="puzzleResetBtn">shuffle again</button>';

        if (!solved) {
          puzzleWidget.querySelectorAll('.memory-card').forEach(function (btn) {
            btn.addEventListener('click', function () {
              if (locked) return;
              var idx = parseInt(btn.getAttribute('data-idx'), 10);
              if (matched[idx] || flipped.indexOf(idx) !== -1) return;
              flipped.push(idx);
              if (flipped.length < 2) { render(); return; }
              moves++;
              render();
              var a = flipped[0], b = flipped[1];
              if (board[a] === board[b]) {
                matched[a] = true; matched[b] = true; flipped = []; render();
              } else {
                locked = true;
                setTimeout(function () { flipped = []; locked = false; render(); }, 700);
              }
            });
          });
        }
        var resetBtn = document.getElementById('puzzleResetBtn');
        if (resetBtn) {
          resetBtn.addEventListener('click', function () {
            board = shuffledBoard(); flipped = []; matched = {}; moves = 0; locked = false; render();
          });
        }
      }

      board = shuffledBoard();
      render();
    }

    /* ---- Sliding tile (8-puzzle) ---- */
    function initSlidePuzzle() {
      var board = [], moves = 0;

      function neighborsOf(idx) {
        var row = Math.floor(idx / 3), col = idx % 3;
        var result = [];
        if (row > 0) result.push(idx - 3);
        if (row < 2) result.push(idx + 3);
        if (col > 0) result.push(idx - 1);
        if (col < 2) result.push(idx + 1);
        return result;
      }
      function isSolved(b) {
        for (var i = 0; i < 8; i++) { if (b[i] !== i + 1) return false; }
        return b[8] === 0;
      }
      function shuffledBoard() {
        var b = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        var blank = 8, last = -1;
        for (var i = 0; i < 120; i++) {
          var options = neighborsOf(blank).filter(function (n) { return n !== last; });
          if (!options.length) options = neighborsOf(blank);
          var pick = options[Math.floor(Math.random() * options.length)];
          b[blank] = b[pick]; b[pick] = 0; last = blank; blank = pick;
        }
        return b;
      }

      function render() {
        var solved = isSolved(board);
        var tilesHtml = board.map(function (v, i) {
          if (v === 0) return '<div class="slide-tile slide-tile--blank"></div>';
          return '<button type="button" class="slide-tile" data-idx="' + i + '">' + v + '</button>';
        }).join('');

        puzzleWidget.innerHTML =
          '<span class="widget-eyebrow">Puzzle — Slide to Solve</span>' +
          goalLine('Slide tiles into the empty space to put them in order, 1 to 8.') +
          '<div class="slide-grid">' + tilesHtml + '</div>' +
          '<div class="puzzle-count' + (solved ? ' puzzle-count--solved' : '') + '">' +
            (solved ? '🎉 Solved in ' + moves + (moves === 1 ? ' move!' : ' moves!') : moves + (moves === 1 ? ' move' : ' moves')) +
          '</div>' +
          '<button type="button" class="countdown-change-link" id="puzzleResetBtn">shuffle again</button>';

        if (!solved) {
          puzzleWidget.querySelectorAll('.slide-tile[data-idx]').forEach(function (btn) {
            btn.addEventListener('click', function () {
              var idx = parseInt(btn.getAttribute('data-idx'), 10);
              var blank = board.indexOf(0);
              if (neighborsOf(blank).indexOf(idx) !== -1) {
                board[blank] = board[idx]; board[idx] = 0; moves++; render();
              }
            });
          });
        }
        var resetBtn = document.getElementById('puzzleResetBtn');
        if (resetBtn) {
          resetBtn.addEventListener('click', function () { board = shuffledBoard(); moves = 0; render(); });
        }
      }

      board = shuffledBoard();
      render();
    }

    /* ---- Word Scramble ---- */
    function initScramblePuzzle() {
      var WORDS = [
        'PUZZLE', 'GARDEN', 'WINDOW', 'PLANET', 'GUITAR', 'PENCIL', 'BRIDGE', 'CANDLE',
        'DRAGON', 'ISLAND', 'JACKET', 'KETTLE', 'LANTERN', 'MARBLE', 'ORANGE', 'PILLOW',
        'RIBBON', 'SILVER', 'TUNNEL', 'VELVET', 'WHISTLE', 'YELLOW', 'ANCHOR', 'BASKET',
        'CIRCUS', 'DOLPHIN', 'FOUNTAIN', 'GALAXY', 'HARBOR', 'IGLOO', 'JIGSAW', 'KINGDOM',
        'LIBRARY', 'MEADOW', 'COMPASS', 'HORIZON', 'LANTERN', 'MYSTERY', 'PATTERN'
      ];
      var word = '';
      var scrambled = '';
      var solved = false;
      var attempts = 0;

      function scrambleWord(w) {
        var letters;
        do {
          letters = fisherShuffle(w.split(''));
        } while (letters.join('') === w);
        return letters.join('');
      }

      function newWord() {
        word = WORDS[Math.floor(Math.random() * WORDS.length)];
        scrambled = scrambleWord(word);
        solved = false;
        attempts = 0;
      }

      function render(message) {
        var tilesHtml = scrambled.split('').map(function (ch) {
          return '<span class="scramble-letter">' + escapeHtml(ch) + '</span>';
        }).join('');

        puzzleWidget.innerHTML =
          '<span class="widget-eyebrow">Puzzle — Word Scramble</span>' +
          goalLine('Unscramble the letters to spell the hidden word.') +
          '<div class="scramble-tiles">' + tilesHtml + '</div>' +
          (solved
            ? '<div class="puzzle-count puzzle-count--solved">🎉 It was ' + escapeHtml(word) + '!</div>'
            : '<form class="puzzle-form" id="scrambleForm" autocomplete="off">' +
                '<input type="text" class="name-input" id="scrambleInput" maxlength="' + word.length + '" placeholder="Unscramble it" autocapitalize="characters" required>' +
                '<button type="submit" class="name-submit">Check</button>' +
              '</form>' +
              (message ? '<div class="puzzle-feedback">' + escapeHtml(message) + '</div>' : '') +
              '<div class="puzzle-count">' + (attempts ? attempts + (attempts === 1 ? ' try so far' : ' tries so far') : '') + '</div>'
          ) +
          '<button type="button" class="countdown-change-link" id="puzzleResetBtn">new word</button>';

        var form = document.getElementById('scrambleForm');
        if (form) {
          form.addEventListener('submit', function (e) {
            e.preventDefault();
            var input = document.getElementById('scrambleInput');
            var guess = input.value.trim().toUpperCase();
            attempts++;
            if (guess === word) { solved = true; render(); }
            else { render('Not quite — try again'); }
          });
        }
        var resetBtn = document.getElementById('puzzleResetBtn');
        if (resetBtn) {
          resetBtn.addEventListener('click', function () { newWord(); render(); });
        }
      }

      newWord();
      render();
    }

    /* ---- Lights Out ---- */
    function initLightsOutPuzzle() {
      var SIZE = 4;
      var cells = 0;
      var lit = [];
      var moves = 0;

      function neighborsOf(idx) {
        var row = Math.floor(idx / SIZE), col = idx % SIZE;
        var result = [idx];
        if (row > 0) result.push(idx - SIZE);
        if (row < SIZE - 1) result.push(idx + SIZE);
        if (col > 0) result.push(idx - 1);
        if (col < SIZE - 1) result.push(idx + 1);
        return result;
      }
      function toggle(state, idx) {
        neighborsOf(idx).forEach(function (n) { state[n] = !state[n]; });
      }
      function isSolved(state) { return state.every(function (v) { return !v; }); }
      function scrambledState() {
        var state = new Array(cells).fill(false);
        for (var i = 0; i < 14; i++) {
          toggle(state, Math.floor(Math.random() * cells));
        }
        return state;
      }

      function render() {
        var solved = isSolved(lit);
        var cellsHtml = lit.map(function (on, i) {
          return '<button type="button" class="lightsout-cell' + (on ? ' is-on' : '') + '" data-idx="' + i + '"></button>';
        }).join('');

        puzzleWidget.innerHTML =
          '<span class="widget-eyebrow">Puzzle — Lights Out</span>' +
          goalLine('Click cells to turn every light off.') +
          '<div class="lightsout-grid">' + cellsHtml + '</div>' +
          '<div class="puzzle-count' + (solved ? ' puzzle-count--solved' : '') + '">' +
            (solved ? '🎉 All out in ' + moves + (moves === 1 ? ' move!' : ' moves!') : moves + (moves === 1 ? ' move' : ' moves')) +
          '</div>' +
          '<button type="button" class="countdown-change-link" id="puzzleResetBtn">new puzzle</button>';

        if (!solved) {
          puzzleWidget.querySelectorAll('.lightsout-cell').forEach(function (btn) {
            btn.addEventListener('click', function () {
              var idx = parseInt(btn.getAttribute('data-idx'), 10);
              toggle(lit, idx);
              moves++;
              render();
            });
          });
        }
        var resetBtn = document.getElementById('puzzleResetBtn');
        if (resetBtn) {
          resetBtn.addEventListener('click', function () { lit = scrambledState(); moves = 0; render(); });
        }
      }

      cells = SIZE * SIZE;
      lit = scrambledState();
      render();
    }

    /* ---- Hangman ---- */
    function initHangmanPuzzle() {
      var WORDS = [
        'PUZZLE', 'GARDEN', 'WINDOW', 'PLANET', 'GUITAR', 'PENCIL', 'BRIDGE', 'CANDLE',
        'DRAGON', 'ISLAND', 'JACKET', 'KETTLE', 'LANTERN', 'MARBLE', 'ORANGE', 'PILLOW',
        'RIBBON', 'SILVER', 'TUNNEL', 'VELVET', 'WHISTLE', 'YELLOW', 'ANCHOR', 'BASKET',
        'CIRCUS', 'DOLPHIN', 'FOUNTAIN', 'GALAXY', 'HARBOR', 'IGLOO', 'JIGSAW', 'KINGDOM',
        'LIBRARY', 'MEADOW', 'COMPASS', 'HORIZON', 'MYSTERY', 'PATTERN'
      ];
      var MAX_MISSES = 6;
      var word = '', guessed = {}, misses = 0, over = false, won = false;

      function newWord() {
        word = WORDS[Math.floor(Math.random() * WORDS.length)];
        guessed = {};
        misses = 0;
        over = false;
        won = false;
      }

      function render() {
        var maskedHtml = word.split('').map(function (ch) {
          return '<span class="hangman-letter">' + (guessed[ch] || over ? ch : '') + '</span>';
        }).join('');

        var keyboardHtml = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function (letter) {
          var isGuessed = !!guessed[letter];
          var isWrong = isGuessed && word.indexOf(letter) === -1;
          var isRight = isGuessed && word.indexOf(letter) !== -1;
          var classes = 'hangman-key' + (isWrong ? ' is-wrong' : '') + (isRight ? ' is-right' : '');
          return '<button type="button" class="' + classes + '" data-letter="' + letter + '"' + (isGuessed || over ? ' disabled' : '') + '>' + letter + '</button>';
        }).join('');

        var status = won ? '🎉 You got it!' : over ? 'Out of tries — it was ' + word : (MAX_MISSES - misses) + (MAX_MISSES - misses === 1 ? ' try left' : ' tries left');

        puzzleWidget.innerHTML =
          '<span class="widget-eyebrow">Puzzle — Hangman</span>' +
          goalLine('Guess the letters before you run out of tries.') +
          '<div class="hangman-word">' + maskedHtml + '</div>' +
          '<div class="hangman-keyboard">' + keyboardHtml + '</div>' +
          '<div class="puzzle-count' + (won ? ' puzzle-count--solved' : '') + '">' + escapeHtml(status) + '</div>' +
          '<button type="button" class="countdown-change-link" id="puzzleResetBtn">new word</button>';

        if (!over) {
          puzzleWidget.querySelectorAll('.hangman-key').forEach(function (btn) {
            btn.addEventListener('click', function () {
              var letter = btn.getAttribute('data-letter');
              if (guessed[letter] || over) return;
              guessed[letter] = true;
              if (word.indexOf(letter) === -1) {
                misses++;
                if (misses >= MAX_MISSES) over = true;
              } else if (word.split('').every(function (ch) { return guessed[ch]; })) {
                over = true; won = true;
              }
              render();
            });
          });
        }
        var resetBtn = document.getElementById('puzzleResetBtn');
        if (resetBtn) resetBtn.addEventListener('click', function () { newWord(); render(); });
      }

      newWord();
      render();
    }

    /* ---- Mini Sudoku (4x4) ---- */
    function initSudokuPuzzle() {
      var BASE = [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1];
      var GIVEN_MASK = [0, 2, 5, 7, 8, 10, 13, 15];
      var PERMS = [
        [1, 2, 3, 4], [2, 1, 4, 3], [3, 4, 1, 2], [4, 3, 2, 1], [2, 3, 4, 1]
      ];

      var solutionSeed = [];
      var grid = [];
      var given = [];

      function newPuzzle() {
        var perm = PERMS[Math.floor(Math.random() * PERMS.length)];
        solutionSeed = BASE.map(function (v) { return perm[v - 1]; });
        grid = solutionSeed.map(function (v, i) { return GIVEN_MASK.indexOf(i) !== -1 ? v : 0; });
        given = GIVEN_MASK.slice();
      }

      function isSolved() {
        if (grid.indexOf(0) !== -1) return false;
        function group(indices) {
          var seen = {};
          for (var i = 0; i < indices.length; i++) {
            var v = grid[indices[i]];
            if (seen[v]) return false;
            seen[v] = true;
          }
          return true;
        }
        for (var r = 0; r < 4; r++) { if (!group([r * 4, r * 4 + 1, r * 4 + 2, r * 4 + 3])) return false; }
        for (var c = 0; c < 4; c++) { if (!group([c, c + 4, c + 8, c + 12])) return false; }
        var boxes = [[0, 1, 4, 5], [2, 3, 6, 7], [8, 9, 12, 13], [10, 11, 14, 15]];
        for (var b = 0; b < boxes.length; b++) { if (!group(boxes[b])) return false; }
        return true;
      }

      function render() {
        var solved = isSolved();
        var cellsHtml = grid.map(function (v, i) {
          var isGiven = given.indexOf(i) !== -1;
          var classes = 'sudoku-cell' + (isGiven ? ' is-given' : '');
          return '<button type="button" class="' + classes + '" data-idx="' + i + '"' + (isGiven ? ' disabled' : '') + '>' + (v || '') + '</button>';
        }).join('');

        puzzleWidget.innerHTML =
          '<span class="widget-eyebrow">Puzzle — Mini Sudoku</span>' +
          goalLine('Fill the grid so every row, column, and 2×2 box has 1–4.') +
          '<div class="sudoku-grid">' + cellsHtml + '</div>' +
          '<div class="puzzle-count' + (solved ? ' puzzle-count--solved' : '') + '">' + (solved ? '🎉 Solved!' : 'Tap a cell to cycle 1–4') + '</div>' +
          '<button type="button" class="countdown-change-link" id="puzzleResetBtn">new puzzle</button>';

        if (!solved) {
          puzzleWidget.querySelectorAll('.sudoku-cell:not(.is-given)').forEach(function (btn) {
            btn.addEventListener('click', function () {
              var idx = parseInt(btn.getAttribute('data-idx'), 10);
              grid[idx] = (grid[idx] % 4) + 1;
              render();
            });
          });
        }
        var resetBtn = document.getElementById('puzzleResetBtn');
        if (resetBtn) resetBtn.addEventListener('click', function () { newPuzzle(); render(); });
      }

      newPuzzle();
      render();
    }

    /* ---- Odd One Out ---- */
    function initOddOneOutPuzzle() {
      var SHAPES = {
        star: '<polygon points="12 2 14.9 8.6 22 9.3 16.5 14 18.2 21 12 17.3 5.8 21 7.5 14 2 9.3 9.1 8.6"></polygon>',
        heart: '<path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9z"></path>',
        moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
        sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"></path>',
        bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
        diamond: '<polygon points="12 2 22 12 12 22 2 12"></polygon>'
      };
      var SHAPE_KEYS = Object.keys(SHAPES);
      var GRID_SIZE = 9;
      var common = '', odd = '', oddIndex = 0, found = false, tries = 0;

      function shapeSvg(key) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + SHAPES[key] + '</svg>';
      }

      function newRound() {
        var picks = fisherShuffle(SHAPE_KEYS);
        common = picks[0];
        odd = picks[1];
        oddIndex = Math.floor(Math.random() * GRID_SIZE);
        found = false;
        tries = 0;
      }

      function render(message) {
        var cellsHtml = '';
        for (var i = 0; i < GRID_SIZE; i++) {
          var isOdd = i === oddIndex;
          var classes = 'oddoneout-cell' + (isOdd && found ? ' is-found' : '');
          cellsHtml += '<button type="button" class="' + classes + '" data-idx="' + i + '">' + shapeSvg(isOdd ? odd : common) + '</button>';
        }

        puzzleWidget.innerHTML =
          '<span class="widget-eyebrow">Puzzle — Odd One Out</span>' +
          goalLine('Find the one icon that\'s different from the rest.') +
          '<div class="oddoneout-grid">' + cellsHtml + '</div>' +
          '<div class="puzzle-count' + (found ? ' puzzle-count--solved' : '') + '">' +
            (found ? '🎉 Found it in ' + tries + (tries === 1 ? ' try!' : ' tries!') : (message || (tries ? tries + (tries === 1 ? ' try so far' : ' tries so far') : ''))) +
          '</div>' +
          '<button type="button" class="countdown-change-link" id="puzzleResetBtn">new round</button>';

        if (!found) {
          puzzleWidget.querySelectorAll('.oddoneout-cell').forEach(function (btn) {
            btn.addEventListener('click', function () {
              var idx = parseInt(btn.getAttribute('data-idx'), 10);
              tries++;
              if (idx === oddIndex) { found = true; render(); }
              else { render('Not that one — keep looking'); }
            });
          });
        }
        var resetBtn = document.getElementById('puzzleResetBtn');
        if (resetBtn) resetBtn.addEventListener('click', function () { newRound(); render(); });
      }

      newRound();
      render();
    }

    /* ---- Simon Says (pattern memory) ---- */
    function initSimonPuzzle() {
      var PAD_COUNT = 4;
      var sequence = [], playerStep = 0, isPlaying = false, gameOver = false, best = 0;

      function render() {
        var padsHtml = '';
        for (var i = 0; i < PAD_COUNT; i++) {
          padsHtml += '<button type="button" class="simon-pad simon-pad--' + i + '" data-idx="' + i + '"' + (isPlaying || gameOver ? ' disabled' : '') + '></button>';
        }

        var status = gameOver
          ? 'Game over — reached round ' + sequence.length
          : isPlaying
            ? 'Watch closely…'
            : sequence.length === 0
              ? 'Press start to begin'
              : 'Your turn — round ' + sequence.length;

        puzzleWidget.innerHTML =
          '<span class="widget-eyebrow">Puzzle — Simon Says</span>' +
          goalLine('Watch the pattern, then repeat it back in order.') +
          '<div class="simon-grid">' + padsHtml + '</div>' +
          '<div class="puzzle-count' + (gameOver ? ' puzzle-count--solved' : '') + '">' + escapeHtml(status) +
            (best > 0 ? ' <span class="simon-best">(best: ' + best + ')</span>' : '') +
          '</div>' +
          '<button type="button" class="countdown-change-link" id="puzzleResetBtn">' + (sequence.length === 0 && !gameOver ? 'start' : 'play again') + '</button>';

        if (!isPlaying && !gameOver) {
          puzzleWidget.querySelectorAll('.simon-pad').forEach(function (btn) {
            btn.addEventListener('click', function () {
              var idx = parseInt(btn.getAttribute('data-idx'), 10);
              btn.classList.add('is-lit');
              setTimeout(function () { btn.classList.remove('is-lit'); }, 200);

              if (idx === sequence[playerStep]) {
                playerStep++;
                if (playerStep === sequence.length) {
                  setTimeout(nextRound, 500);
                }
              } else {
                gameOver = true;
                best = Math.max(best, sequence.length - 1);
                setTimeout(render, 300);
              }
            });
          });
        }
        var resetBtn = document.getElementById('puzzleResetBtn');
        if (resetBtn) {
          resetBtn.addEventListener('click', function () {
            if (gameOver) { sequence = []; gameOver = false; }
            nextRound();
          });
        }
      }

      function playSequence() {
        isPlaying = true;
        render();
        var i = 0;
        function step() {
          if (i >= sequence.length) { isPlaying = false; render(); return; }
          var pad = puzzleWidget.querySelector('.simon-pad[data-idx="' + sequence[i] + '"]');
          if (pad) {
            pad.classList.add('is-lit');
            setTimeout(function () { pad.classList.remove('is-lit'); }, 350);
          }
          i++;
          setTimeout(step, 550);
        }
        step();
      }

      function nextRound() {
        sequence.push(Math.floor(Math.random() * PAD_COUNT));
        playerStep = 0;
        playSequence();
      }

      render();
    }

    var PUZZLES = [
      initMemoryPuzzle, initSlidePuzzle, initScramblePuzzle, initLightsOutPuzzle,
      initHangmanPuzzle, initSudokuPuzzle, initOddOneOutPuzzle, initSimonPuzzle
    ];
    PUZZLES[Math.floor(Math.random() * PUZZLES.length)]();
  })();

  /* ---------- weather ---------- */

  var WEATHER_KEY = 'startpage_location';
  var weatherBody = document.getElementById('weatherBody');
  var lastWeatherCoords = null;
  var weatherRefreshTimer = null;
  var lastDailyForecast = null;
  var forecastExpanded = false;
  var lastClimatology = null;
  var forecastDayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

  var WEATHER_CODES = {
    0: { desc: 'Clear sky', cat: 'clear' },
    1: { desc: 'Mostly clear', cat: 'clear' },
    2: { desc: 'Partly cloudy', cat: 'cloudy' },
    3: { desc: 'Overcast', cat: 'cloudy' },
    45: { desc: 'Fog', cat: 'cloudy' },
    48: { desc: 'Depositing rime fog', cat: 'cloudy' },
    51: { desc: 'Light drizzle', cat: 'drizzle' },
    53: { desc: 'Drizzle', cat: 'drizzle' },
    55: { desc: 'Dense drizzle', cat: 'drizzle' },
    56: { desc: 'Freezing drizzle', cat: 'drizzle' },
    57: { desc: 'Freezing drizzle', cat: 'drizzle' },
    61: { desc: 'Light rain', cat: 'rain' },
    63: { desc: 'Rain', cat: 'rain' },
    65: { desc: 'Heavy rain', cat: 'rain' },
    66: { desc: 'Freezing rain', cat: 'rain' },
    67: { desc: 'Freezing rain', cat: 'rain' },
    71: { desc: 'Light snow', cat: 'snow' },
    73: { desc: 'Snow', cat: 'snow' },
    75: { desc: 'Heavy snow', cat: 'snow' },
    77: { desc: 'Snow grains', cat: 'snow' },
    80: { desc: 'Light showers', cat: 'rain' },
    81: { desc: 'Showers', cat: 'rain' },
    82: { desc: 'Violent showers', cat: 'rain' },
    85: { desc: 'Snow showers', cat: 'snow' },
    86: { desc: 'Heavy snow showers', cat: 'snow' },
    95: { desc: 'Thunderstorm', cat: 'thunder' },
    96: { desc: 'Thunderstorm with hail', cat: 'thunder' },
    99: { desc: 'Thunderstorm with hail', cat: 'thunder' }
  };

  var WEATHER_ICON_PATHS = {
    'clear-day': '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"></path>',
    'clear-night': '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
    'cloudy': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>',
    'drizzle': '<line x1="8" y1="19" x2="8" y2="21"></line><line x1="8" y1="13" x2="8" y2="15"></line><line x1="16" y1="19" x2="16" y2="21"></line><line x1="16" y1="13" x2="16" y2="15"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="12" y1="15" x2="12" y2="17"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>',
    'rain': '<line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>',
    'snow': '<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="8" y1="20" x2="8.01" y2="20"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="12" y1="22" x2="12.01" y2="22"></line><line x1="16" y1="16" x2="16.01" y2="16"></line><line x1="16" y1="20" x2="16.01" y2="20"></line>',
    'thunder': '<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><polyline points="13 11 9 17 15 17 11 23"></polyline>'
  };

  function setWeatherStatus(message) {
    if (weatherBody) weatherBody.innerHTML = '<div class="widget-status">' + escapeHtml(message) + '</div>';
  }

  function getWeatherIconSvg(category) {
    var inner = WEATHER_ICON_PATHS[category] || WEATHER_ICON_PATHS.cloudy;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }

  function buildForecastHtml(daily, days) {
    var n = Math.min(days, daily.time.length);
    var html = '';
    for (var i = 0; i < n; i++) {
      var d = new Date(daily.time[i] + 'T00:00:00');
      var label = i === 0 ? 'Today' : forecastDayFormatter.format(d);
      var info = WEATHER_CODES[daily.weather_code[i]] || { desc: 'Unknown', cat: 'cloudy' };
      var category = info.cat === 'clear' ? 'clear-day' : info.cat;
      var hi = Math.round(daily.temperature_2m_max[i]);
      var lo = Math.round(daily.temperature_2m_min[i]);
      html +=
        '<div class="forecast-day">' +
          '<div class="forecast-day-label">' + escapeHtml(label) + '</div>' +
          '<div class="forecast-day-icon">' + getWeatherIconSvg(category) + '</div>' +
          '<div class="forecast-day-temps"><span class="hi">' + hi + '°</span><span class="lo">' + lo + '°</span></div>' +
        '</div>';
    }
    return html;
  }

  function renderWeather(current, daily, locationName) {
    if (!weatherBody) return;
    lastDailyForecast = daily;
    var info = WEATHER_CODES[current.weather_code] || { desc: 'Unknown', cat: 'cloudy' };
    var category = info.cat === 'clear' ? (current.is_day ? 'clear-day' : 'clear-night') : info.cat;
    var temp = Math.round(current.temperature_2m);
    var feelsLike = Math.round(current.apparent_temperature);
    var humidity = Math.round(current.relative_humidity_2m);
    var wind = Math.round(current.wind_speed_10m);
    var maxDays = daily && daily.time ? daily.time.length : 0;
    var visibleDays = forecastExpanded ? maxDays : Math.min(5, maxDays);
    var stripClass = 'forecast-strip' + (visibleDays > 5 ? ' is-scroll' : '');

    weatherBody.innerHTML =
      '<div class="weather-icon">' + getWeatherIconSvg(category) + '</div>' +
      '<div class="weather-temp">' + temp + '°</div>' +
      '<div class="weather-desc">' + escapeHtml(info.desc) + '</div>' +
      '<div class="weather-location">' + escapeHtml(locationName) + '</div>' +
      '<div class="weather-meta">Feels like ' + feelsLike + '° · ' + humidity + '% humidity · ' + wind + ' km/h wind</div>' +
      (lastClimatology ? '<div class="weather-climatology">Typically ' + lastClimatology.avgHigh + '°/' + lastClimatology.avgLow + '° today <span class="climatology-note">(1991–2020 avg)</span></div>' : '') +
      (daily && maxDays ? '<div class="' + stripClass + '" id="forecastStrip">' + buildForecastHtml(daily, visibleDays) + '</div>' : '') +
      (daily && maxDays > 5 ? '<button type="button" class="weather-more-btn" id="forecastToggleBtn">' + (forecastExpanded ? 'Show 5-day forecast' : 'Show ' + maxDays + '-day forecast') + '</button>' : '') +
      '<button type="button" class="weather-change-link" id="weatherChangeBtn">change location</button>';

    var changeBtn = document.getElementById('weatherChangeBtn');
    if (changeBtn) changeBtn.addEventListener('click', function () { showLocationForm(); });

    var toggleBtn = document.getElementById('forecastToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        forecastExpanded = !forecastExpanded;
        renderWeather(current, daily, locationName);
      });
    }
  }

  function loadClimatology(lat, lon, current, daily, name) {
    var mmdd = pad2(new Date().getMonth() + 1) + '-' + pad2(new Date().getDate());
    var cacheKey = 'startpage_climatology_' + lat.toFixed(2) + '_' + lon.toFixed(2) + '_' + mmdd;
    var cached = null;
    try { cached = JSON.parse(safeStorageGet(cacheKey) || 'null'); } catch (e) { cached = null; }
    if (cached && cached.avgHigh != null) {
      lastClimatology = cached;
      renderWeather(current, daily, name);
      return;
    }
    var url = 'https://archive-api.open-meteo.com/v1/archive?latitude=' + encodeURIComponent(lat) +
      '&longitude=' + encodeURIComponent(lon) +
      '&start_date=1991-01-01&end_date=2020-12-31&daily=temperature_2m_max,temperature_2m_min&timezone=auto';

    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('climatology request failed'); return r.json(); })
      .then(function (data) {
        var times = data.daily && data.daily.time ? data.daily.time : [];
        var highs = [];
        var lows = [];
        for (var i = 0; i < times.length; i++) {
          if (times[i].slice(5) === mmdd) {
            var hi = data.daily.temperature_2m_max[i];
            var lo = data.daily.temperature_2m_min[i];
            if (hi != null) highs.push(hi);
            if (lo != null) lows.push(lo);
          }
        }
        if (!highs.length || !lows.length) return;
        var result = {
          avgHigh: Math.round(highs.reduce(function (a, b) { return a + b; }, 0) / highs.length),
          avgLow: Math.round(lows.reduce(function (a, b) { return a + b; }, 0) / lows.length)
        };
        safeStorageSet(cacheKey, JSON.stringify(result));
        lastClimatology = result;
        renderWeather(current, daily, name);
      })
      .catch(function () { /* decorative feature — fail silently */ });
  }

  function loadWeather(lat, lon, name) {
    lastWeatherCoords = { lat: lat, lon: lon, name: name };
    lastClimatology = null;
    setWeatherStatus('Loading weather…');
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(lat) +
      '&longitude=' + encodeURIComponent(lon) +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=16&timezone=auto';

    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('weather request failed'); return r.json(); })
      .then(function (data) {
        forecastExpanded = false;
        renderWeather(data.current, data.daily, name);
        loadClimatology(lat, lon, data.current, data.daily, name);
      })
      .catch(function () { setWeatherStatus('Weather unavailable right now.'); });

    if (weatherRefreshTimer) clearInterval(weatherRefreshTimer);
    weatherRefreshTimer = setInterval(function () {
      if (lastWeatherCoords) loadWeather(lastWeatherCoords.lat, lastWeatherCoords.lon, lastWeatherCoords.name);
    }, 20 * 60 * 1000);
  }

  function reverseGeocode(lat, lon) {
    return fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lon + '&localityLanguage=en')
      .then(function (r) { return r.json(); })
      .then(function (data) { return data.city || data.locality || data.principalSubdivision || 'Your location'; })
      .catch(function () { return 'Your location'; });
  }

  function searchLocation(query) {
    return fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&name=' + encodeURIComponent(query))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.results || !data.results.length) throw new Error('not found');
        var r0 = data.results[0];
        var name = r0.name + (r0.admin1 && r0.admin1 !== r0.name ? ', ' + r0.admin1 : '') + (r0.country ? ', ' + r0.country : '');
        return { name: name, lat: r0.latitude, lon: r0.longitude };
      });
  }

  function showLocationForm(errorMessage) {
    if (!weatherBody) return;
    weatherBody.innerHTML =
      '<form class="location-form" id="locationForm" autocomplete="off">' +
        (errorMessage ? '<span class="widget-status">' + escapeHtml(errorMessage) + '</span>' : '') +
        '<input type="text" class="name-input" id="locationInput" placeholder="Enter a city" required>' +
        '<button type="submit" class="name-submit">Set</button>' +
      '</form>' +
      '<button type="button" class="weather-change-link" id="useMyLocationBtn">use my location instead</button>';

    var form = document.getElementById('locationForm');
    var input = document.getElementById('locationInput');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var query = input.value.trim();
        if (!query) return;
        setWeatherStatus('Searching…');
        searchLocation(query)
          .then(function (loc) {
            safeStorageSet(WEATHER_KEY, JSON.stringify({ name: loc.name, lat: loc.lat, lon: loc.lon }));
            loadWeather(loc.lat, loc.lon, loc.name);
          })
          .catch(function () { showLocationForm('Location not found — try another search.'); });
      });
    }
    var useMyLocationBtn = document.getElementById('useMyLocationBtn');
    if (useMyLocationBtn) {
      useMyLocationBtn.addEventListener('click', function () {
        safeStorageRemove(WEATHER_KEY);
        tryGeolocation();
      });
    }
  }

  function tryGeolocation() {
    if (!('geolocation' in navigator)) {
      showLocationForm();
      return;
    }
    setWeatherStatus('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        var lat = pos.coords.latitude;
        var lon = pos.coords.longitude;
        reverseGeocode(lat, lon).then(function (name) { loadWeather(lat, lon, name); });
      },
      function () { showLocationForm(); },
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  }

  function initWeather() {
    var saved = null;
    try { saved = JSON.parse(safeStorageGet(WEATHER_KEY) || 'null'); } catch (e) { saved = null; }
    if (saved && saved.lat != null && saved.lon != null) {
      loadWeather(saved.lat, saved.lon, saved.name);
    } else {
      tryGeolocation();
    }
  }

  initWeather();

  /* ---------- blob parallax ---------- */

  var blobs = Array.prototype.slice.call(document.querySelectorAll('.blob'));
  var blobFactors = [0.02, -0.015, 0.03];
  var pointer = { x: 0, y: 0 };
  var pointerTarget = { x: 0, y: 0 };

  function onPointerMove(e) {
    var x = ('touches' in e && e.touches.length) ? e.touches[0].clientX : e.clientX;
    var y = ('touches' in e && e.touches.length) ? e.touches[0].clientY : e.clientY;
    pointerTarget.x = x - window.innerWidth / 2;
    pointerTarget.y = y - window.innerHeight / 2;
  }

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });

  function animateBlobs() {
    pointer.x += (pointerTarget.x - pointer.x) * 0.06;
    pointer.y += (pointerTarget.y - pointer.y) * 0.06;
    blobs.forEach(function (blob, i) {
      var f = blobFactors[i % blobFactors.length];
      blob.style.transform = 'translate3d(' + (pointer.x * f) + 'px,' + (pointer.y * f) + 'px,0)';
    });
    requestAnimationFrame(animateBlobs);
  }

  if (!reduceMotion) {
    requestAnimationFrame(animateBlobs);
  }

  /* ---------- network canvas (particles + drifting asteroids) ---------- */

  var canvas = document.getElementById('network-canvas');
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var width = 0;
  var height = 0;
  var particles = [];
  var asteroids = [];
  var mouse = { x: -9999, y: -9999, active: false };

  var LINK_DIST = 150;
  var MOUSE_DIST = 190;
  var DOT_COLOR = '111, 194, 255';
  var LINE_COLOR = '111, 194, 255';
  var MOUSE_LINE_COLOR = '255, 122, 51';
  var ASTEROID_COLOR = '201, 194, 182';

  function particleCount() {
    var area = width * height;
    return Math.max(30, Math.min(110, Math.round(area / 18000)));
  }

  function asteroidCount() {
    var area = width * height;
    return Math.max(5, Math.min(14, Math.round(area / 140000)));
  }

  function makeAsteroidPoints(radius) {
    var n = 6 + Math.floor(Math.random() * 4);
    var pts = [];
    for (var i = 0; i < n; i++) {
      var angle = (i / n) * Math.PI * 2;
      var r = radius * (0.65 + Math.random() * 0.55);
      pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }
    return pts;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var count = particleCount();
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.4 + Math.random() * 1.4
      });
    }

    var aCount = asteroidCount();
    asteroids = [];
    for (var j = 0; j < aCount; j++) {
      var radius = 7 + Math.random() * 14;
      var angle = Math.random() * Math.PI * 2;
      var speed = 0.15 + Math.random() * 0.35;
      asteroids.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: radius,
        points: makeAsteroidPoints(radius),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01
      });
    }
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function onMouseLeave() {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mouseleave', onMouseLeave, { passive: true });
  window.addEventListener('resize', resize);

  function stepAsteroids() {
    for (var i = 0; i < asteroids.length; i++) {
      var a = asteroids[i];
      a.x += a.vx;
      a.y += a.vy;
      a.rotation += a.rotationSpeed;
      if (a.x - a.radius < 0) { a.x = a.radius; a.vx = -a.vx; }
      else if (a.x + a.radius > width) { a.x = width - a.radius; a.vx = -a.vx; }
      if (a.y - a.radius < 0) { a.y = a.radius; a.vy = -a.vy; }
      else if (a.y + a.radius > height) { a.y = height - a.radius; a.vy = -a.vy; }
    }
  }

  function drawAsteroids() {
    for (var i = 0; i < asteroids.length; i++) {
      var a = asteroids[i];
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);
      ctx.beginPath();
      ctx.moveTo(a.points[0].x, a.points[0].y);
      for (var j = 1; j < a.points.length; j++) ctx.lineTo(a.points[j].x, a.points[j].y);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(' + ASTEROID_COLOR + ', 0.32)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  function step() {
    stepAsteroids();

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      if (mouse.active) {
        var dx = p.x - mouse.x;
        var dy = p.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_DIST && dist > 0.01) {
          var force = (MOUSE_DIST - dist) / MOUSE_DIST * 0.04;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      p.vx *= 0.985;
      p.vy *= 0.985;
      var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      var maxSpeed = 0.9;
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    drawAsteroids();

    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var a = particles[i];
        var b = particles[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          var opacity = (1 - dist / LINK_DIST) * 0.5;
          ctx.strokeStyle = 'rgba(' + LINE_COLOR + ',' + opacity + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (mouse.active) {
        var p = particles[i];
        var mdx = p.x - mouse.x;
        var mdy = p.y - mouse.y;
        var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < MOUSE_DIST) {
          var mOpacity = (1 - mdist / MOUSE_DIST) * 0.6;
          ctx.strokeStyle = 'rgba(' + MOUSE_LINE_COLOR + ',' + mOpacity + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    for (var k = 0; k < particles.length; k++) {
      var pt = particles[k];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + DOT_COLOR + ',0.8)';
      ctx.fill();
    }
  }

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }

  resize();

  if (reduceMotion) {
    draw();
  } else {
    requestAnimationFrame(loop);
  }
})();
