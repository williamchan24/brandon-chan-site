// Brandon Chan · scroll progress, reveals, smart header, sports strip and card glow
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bar = document.querySelector('.progress');
  var xp = document.querySelector('.xp');
  var rows = [].slice.call(document.querySelectorAll('.xp-row'));
  var header = document.querySelector('.site-header');
  var links = [].slice.call(document.querySelectorAll('.site-header a.navlink'));
  var spy = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var small = window.matchMedia('(max-width: 640px)'); // the header isn't sticky on phones
  var lastY = window.scrollY;
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';

    // Hide the header while scrolling down, bring it back on the way up
    var y = window.scrollY, dy = y - lastY;
    if (!reduce && !small.matches && Math.abs(dy) > 4) {
      var hide = dy > 0 && y > 160 && !header.contains(document.activeElement);
      header.classList.toggle('hide', hide);
    }
    if (y < 160) header.classList.remove('hide');
    lastY = y;

    // Highlight the nav link for the section on screen (none in the hero or at the contact block)
    var active = -1;
    spy.forEach(function (sec, i) {
      if (!sec) return;
      var r = sec.getBoundingClientRect();
      if (r.top <= window.innerHeight * 0.35 && r.bottom > window.innerHeight * 0.35) active = i;
    });
    links.forEach(function (a, i) { a.classList.toggle('active', i === active); });
    if (xp) {
      var r = xp.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
      xp.style.setProperty('--fill', p);
      rows.forEach(function (row) { row.classList.toggle('lit', row.getBoundingClientRect().top + 30 < vh * 0.7); });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  if (reduce || !('IntersectionObserver' in window)) return;
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

  // Sports strip: two rows drift in opposite directions, speed up while you scroll,
  // lean with the scroll speed, and flip direction when you scroll back up.
  var strip = document.querySelector('.strip');
  var rowsEls = strip ? [].slice.call(strip.querySelectorAll('.track')) : [];
  if (rowsEls.length) {
    strip.classList.add('js');
    var pos = 0, vel = 0, dir = 1, prevY = window.scrollY, onScreen = true;
    new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; }).observe(strip);
    (function tick() {
      var y = window.scrollY, dy = y - prevY;
      prevY = y;
      vel += (dy - vel) * 0.12; // smoothed scroll speed (px per frame)
      if (Math.abs(dy) > 0.5) dir = dy > 0 ? 1 : -1;
      if (onScreen) {
        var speed = 0.55 + Math.min(Math.abs(vel) * 0.5, 14);
        var w = rowsEls[0].firstElementChild.offsetWidth; // one set; the row holds two, so it loops seamlessly
        pos = ((pos + speed * dir) % w + w) % w;
        var skew = Math.max(-8, Math.min(8, -vel * 0.35));
        rowsEls[0].style.transform = 'translateX(' + -pos + 'px) skewX(' + skew + 'deg)';
        if (rowsEls[1]) rowsEls[1].style.transform = 'translateX(' + (pos - w) + 'px) skewX(' + skew + 'deg)';
      }
      requestAnimationFrame(tick);
    })();
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
