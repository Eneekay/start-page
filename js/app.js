(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

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

    greetingWidget.innerHTML =
      '<div class="greeting-text">' + escapeHtml(phrase) + ', ' + escapeHtml(name) + '</div>' +
      '<div class="greeting-meta"><span class="lang-name">' + escapeHtml(lang.english) + '</span> (' + escapeHtml(lang.native) + ')<br>“' + escapeHtml(englishPhrase) + ', ' + escapeHtml(name) + '”</div>' +
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

  /* ---------- science fact (with sci-fi decode refresh) ---------- */

  var factEl = document.getElementById('fact');
  var factRefreshBtn = document.getElementById('factRefresh');
  var FACTS = window.SCIENCE_FACTS || [];
  var lastFactIndex = -1;
  var SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#$%&01';

  function scrambleFactText(target) {
    factEl.classList.add('is-decoding');
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
      factEl.textContent = out;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        factEl.textContent = target;
        factEl.classList.remove('is-decoding');
      }
    }
    requestAnimationFrame(frame);
  }

  function showRandomFact(animate) {
    if (!FACTS.length || !factEl) return;
    var index = Math.floor(Math.random() * FACTS.length);
    if (FACTS.length > 1 && index === lastFactIndex) {
      index = (index + 1) % FACTS.length;
    }
    lastFactIndex = index;
    var target = FACTS[index];
    if (animate && !reduceMotion) {
      scrambleFactText(target);
    } else {
      factEl.textContent = target;
    }
  }

  showRandomFact(false);

  if (factRefreshBtn) {
    factRefreshBtn.addEventListener('click', function () {
      if (!reduceMotion) {
        factRefreshBtn.classList.add('is-spinning');
        setTimeout(function () { factRefreshBtn.classList.remove('is-spinning'); }, 650);
      }
      showRandomFact(true);
    });
  }

  /* ---------- Greek nameday ---------- */

  var namedayTodayEl = document.getElementById('namedayToday');
  var namedayTomorrowEl = document.getElementById('namedayTomorrow');
  var NAMEDAYS = window.GREEK_NAMEDAYS || {};

  function namedayKey(d) {
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return mm + '-' + dd;
  }

  function renderNamedays() {
    var today = new Date();
    var tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    var todayNames = NAMEDAYS[namedayKey(today)];
    var tomorrowNames = NAMEDAYS[namedayKey(tomorrow)];

    if (namedayTodayEl) {
      namedayTodayEl.textContent = todayNames && todayNames.length ? todayNames.join(', ') : 'No major nameday';
    }
    if (namedayTomorrowEl) {
      namedayTomorrowEl.textContent = tomorrowNames && tomorrowNames.length ? tomorrowNames.join(', ') : 'No major nameday';
    }
  }

  renderNamedays();

  /* ---------- weather ---------- */

  var WEATHER_KEY = 'startpage_location';
  var weatherBody = document.getElementById('weatherBody');
  var lastWeatherCoords = null;
  var weatherRefreshTimer = null;

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

  function renderWeather(current, locationName) {
    if (!weatherBody) return;
    var info = WEATHER_CODES[current.weather_code] || { desc: 'Unknown', cat: 'cloudy' };
    var category = info.cat === 'clear' ? (current.is_day ? 'clear-day' : 'clear-night') : info.cat;
    var temp = Math.round(current.temperature_2m);
    var feelsLike = Math.round(current.apparent_temperature);
    var humidity = Math.round(current.relative_humidity_2m);
    var wind = Math.round(current.wind_speed_10m);

    weatherBody.innerHTML =
      '<div class="weather-icon">' + getWeatherIconSvg(category) + '</div>' +
      '<div class="weather-temp">' + temp + '°</div>' +
      '<div class="weather-desc">' + escapeHtml(info.desc) + '</div>' +
      '<div class="weather-location">' + escapeHtml(locationName) + '</div>' +
      '<div class="weather-meta">Feels like ' + feelsLike + '° · ' + humidity + '% humidity · ' + wind + ' km/h wind</div>' +
      '<button type="button" class="weather-change-link" id="weatherChangeBtn">change location</button>';

    var changeBtn = document.getElementById('weatherChangeBtn');
    if (changeBtn) changeBtn.addEventListener('click', function () { showLocationForm(); });
  }

  function loadWeather(lat, lon, name) {
    lastWeatherCoords = { lat: lat, lon: lon, name: name };
    setWeatherStatus('Loading weather…');
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(lat) +
      '&longitude=' + encodeURIComponent(lon) +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=auto';

    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('weather request failed'); return r.json(); })
      .then(function (data) { renderWeather(data.current, name); })
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

  /* ---------- network canvas ---------- */

  var canvas = document.getElementById('network-canvas');
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var width = 0;
  var height = 0;
  var particles = [];
  var mouse = { x: -9999, y: -9999, active: false };

  var LINK_DIST = 150;
  var MOUSE_DIST = 190;
  var DOT_COLOR = '111, 194, 255';
  var LINE_COLOR = '111, 194, 255';
  var MOUSE_LINE_COLOR = '255, 122, 51';

  function particleCount() {
    var area = width * height;
    return Math.max(30, Math.min(110, Math.round(area / 18000)));
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

  function step() {
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
