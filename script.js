// Brandon Chan · scroll progress, reveals, smart header, sliding nav underline, sports strip and card glow
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bar = document.querySelector('.progress');
  var xp = document.querySelector('.xp');
  var rows = [].slice.call(document.querySelectorAll('.xp-row'));
  var header = document.querySelector('.site-header');
  var links = [].slice.call(document.querySelectorAll('.site-header a.navlink'));
  var navBar = document.querySelector('.nav-bar');
  var spy = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var small = window.matchMedia('(max-width: 640px)'); // the header isn't sticky on phones
  var lastY = window.scrollY;
  var queued = false;
  var activeLink = -2;

  // Slide the single nav underline under link i (or fade it out when no section is active)
  function moveNavBar(i) {
    if (!navBar || i === activeLink) return;
    activeLink = i;
    if (i < 0) { navBar.classList.remove('on'); return; }
    var a = links[i];
    navBar.style.transform = 'translate(' + a.offsetLeft + 'px, ' + (a.offsetTop + a.offsetHeight + 4) + 'px) scaleX(' + a.offsetWidth / 100 + ')';
    navBar.classList.add('on');
  }

  // Everything that follows the scroll runs once per frame: measure first, then write
  function update() {
    queued = false;
    var h = document.documentElement, vh = window.innerHeight, y = window.scrollY;
    var max = h.scrollHeight - h.clientHeight;
    var active = -1;
    spy.forEach(function (sec, i) {
      if (!sec) return;
      var r = sec.getBoundingClientRect();
      if (r.top <= vh * 0.35 && r.bottom > vh * 0.35) active = i;
    });
    var xpRect = xp ? xp.getBoundingClientRect() : null;
    var rowTops = rows.map(function (row) { return row.getBoundingClientRect().top; });

    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    // Hide the header while scrolling down, bring it back on the way up
    var dy = y - lastY;
    if (!reduce && !small.matches && Math.abs(dy) > 4) {
      header.classList.toggle('hide', dy > 0 && y > 160 && !header.contains(document.activeElement));
    }
    if (y < 160) header.classList.remove('hide');
    lastY = y;
    // Highlight the nav link for the section on screen (none in the hero or at the contact block)
    links.forEach(function (a, i) { a.classList.toggle('active', i === active); });
    moveNavBar(active);
    // Experience timeline fills and lights its rows as you scroll
    if (xpRect) {
      xp.style.setProperty('--fill', Math.min(1, Math.max(0, (vh * 0.7 - xpRect.top) / xpRect.height)));
      rows.forEach(function (row, i) { row.classList.toggle('lit', rowTops[i] + 30 < vh * 0.7); });
    }
  }
  function requestUpdate() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', function () { activeLink = -2; requestUpdate(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { activeLink = -2; requestUpdate(); });
  update();

  if (!('IntersectionObserver' in window)) return;

  // The hero's looping animations (heart-rate blip, track streaks) pause while the hero is off screen
  var hero = document.querySelector('.hero');
  if (hero) new IntersectionObserver(function (e) { hero.classList.toggle('offscreen', !e[0].isIntersecting); }).observe(hero);

  if (reduce) return;

  // Scroll reveals replay every time: an element animates in when it comes on screen,
  // resets once it's fully off screen, and animates in again the next time you scroll to it
  // (scrolling down or back up). Things already on screen at load don't animate the first time.
  var vh = window.innerHeight;
  function watch(nodes, onIn, onOut) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { (e.isIntersecting ? onIn : onOut)(e.target); });
    });
    nodes.forEach(function (el) { io.observe(el); });
  }

  // Sections and cards fade up (cards in the same group arrive one after another)
  var els = [].slice.call(document.querySelectorAll('.rv'));
  els.forEach(function (el) { if (el.getBoundingClientRect().top < vh) el.dataset.skip = '1'; });
  watch(els, function (el) {
    if (el.dataset.skip) return;
    var sibs = [].slice.call(el.parentNode.children).filter(function (c) { return c.classList.contains('rv'); });
    el.style.animationDelay = (Math.max(0, sibs.indexOf(el)) % 6) * 80 + 'ms';
    el.classList.add('in');
  }, function (el) {
    delete el.dataset.skip;
    el.classList.remove('in'); // off screen: ready to play again
  });

  // Big headings: wrap each in a mask and slide it up when it scrolls into view
  var heads = [].slice.call(document.querySelectorAll('.rh'));
  heads.forEach(function (el) {
    el.innerHTML = '<span class="rh-m"><span class="rh-i">' + el.innerHTML + '</span></span>';
    if (el.closest('.rv')) el.querySelector('.rh-i').style.transitionDelay = '.15s'; // let its card arrive first
    if (el.getBoundingClientRect().top < vh) el.classList.add('in'); // on screen at load: show it straight away
    el.classList.add('armed');
  });
  watch(heads, function (el) { el.classList.add('in'); }, function (el) { el.classList.remove('in'); });

  // Sports strip: drifts on its own, speeds up and leans while you scroll, and reverses when
  // you scroll back up. The width is measured once (and on resize), and the frame loop only
  // runs while the strip is on screen.
  var strip = document.querySelector('.strip');
  var track = strip && strip.querySelector('.track');
  if (track) {
    strip.classList.add('js');
    var pos = 0, vel = 0, dir = 1, prevY = window.scrollY, running = false;
    var setWidth = track.firstElementChild.offsetWidth;
    window.addEventListener('resize', function () { setWidth = track.firstElementChild.offsetWidth; });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setWidth = track.firstElementChild.offsetWidth; });
    function tick() {
      if (!running) return;
      var y = window.scrollY, dy = y - prevY;
      prevY = y;
      vel += (dy - vel) * 0.12; // smoothed scroll speed (px per frame)
      if (Math.abs(dy) > 0.5) dir = dy > 0 ? 1 : -1;
      var speed = 0.55 + Math.min(Math.abs(vel) * 0.5, 14);
      pos = ((pos + speed * dir) % setWidth + setWidth) % setWidth;
      var skew = Math.max(-8, Math.min(8, -vel * 0.35));
      track.style.transform = 'translateX(' + -pos + 'px) skewX(' + skew + 'deg)';
      requestAnimationFrame(tick);
    }
    new IntersectionObserver(function (e) {
      var on = e[0].isIntersecting;
      if (on && !running) { running = true; prevY = window.scrollY; vel = 0; requestAnimationFrame(tick); }
      if (!on) running = false;
    }).observe(strip);
  }

  // Service cards: the glow follows the cursor (mouse/trackpad only)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    [].slice.call(document.querySelectorAll('.svc')).forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
})();
