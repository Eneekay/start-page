(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- clock ---------- */

  var clockEl = document.getElementById('clock');
  var dateEl = document.getElementById('date');

  var timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });
  var dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  function tickClock() {
    var now = new Date();
    clockEl.textContent = timeFormatter.format(now);
    dateEl.textContent = dateFormatter.format(now);
  }

  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- science fact ---------- */

  var factEl = document.getElementById('fact');
  var factRefreshBtn = document.getElementById('factRefresh');
  var FACTS = window.SCIENCE_FACTS || [];
  var lastFactIndex = -1;

  function showRandomFact() {
    if (!FACTS.length || !factEl) return;
    var index = Math.floor(Math.random() * FACTS.length);
    if (FACTS.length > 1 && index === lastFactIndex) {
      index = (index + 1) % FACTS.length;
    }
    lastFactIndex = index;
    factEl.textContent = FACTS[index];
  }

  showRandomFact();

  if (factRefreshBtn) {
    factRefreshBtn.addEventListener('click', showRandomFact);
  }

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
