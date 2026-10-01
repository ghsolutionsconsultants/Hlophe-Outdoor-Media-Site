/* ============================================================
   HLOPHE OUTDOOR MEDIA — Motion engine
   Progressive enhancement: if this file fails or motion is
   reduced, the site renders and functions exactly as before.
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document;
  var root = doc.documentElement;

  /* ---------- tiny helpers ---------- */
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return [].slice.call((ctx || doc).querySelectorAll(sel)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* rAF-batched scroll subscribers — one listener for the whole page */
  var readers = [], ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.pageYOffset, h = window.innerHeight;
      for (var i = 0; i < readers.length; i++) readers[i](y, h);
      ticking = false;
    });
  }
  function onScrollAdd(fn) { readers.push(fn); }

  /* ============================================================
     1. Scroll progress rail
     ============================================================ */
  function scrollRail() {
    if (REDUCED) return;
    var rail = doc.createElement('div');
    rail.id = 'scroll-rail';
    rail.innerHTML = '<span></span>';
    doc.body.appendChild(rail);
    var fill = rail.firstChild;
    onScrollAdd(function (y) {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      fill.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
    });
  }

  /* ============================================================
     2. Word-by-word heading reveal
     Splits text nodes only, so <em>, <br> and <span> survive.
     ============================================================ */
  /* Elements painted with a clipped background (gradient text) must not be
     split — the inner spans would inherit `color: transparent` with no
     background of their own and render invisible. Animate them whole. */
  function isClippedText(el) {
    try {
      var cs = getComputedStyle(el);
      return /text/.test(cs.webkitBackgroundClip || '') || /text/.test(cs.backgroundClip || '');
    } catch (e) { return false; }
  }

  function splitInto(src, dest) {
    [].slice.call(src.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var parts = child.textContent.split(/(\s+)/);
        parts.forEach(function (tok) {
          if (!tok) return;
          if (!tok.trim()) { dest.appendChild(doc.createTextNode(tok)); return; }
          var outer = doc.createElement('span'); outer.className = 'mw';
          var inner = doc.createElement('span'); inner.className = 'mw-i';
          inner.textContent = tok;
          outer.appendChild(inner);
          dest.appendChild(outer);
        });
      } else if (child.nodeName === 'BR') {
        dest.appendChild(child.cloneNode(false));
      } else if (child.nodeType === 1) {
        if (isClippedText(child)) {
          var block = getComputedStyle(child).display === 'block';
          var o = doc.createElement('span'); o.className = 'mw';
          var n = doc.createElement('span'); n.className = 'mw-i';
          if (block) { o.style.display = 'block'; n.style.display = 'block'; }
          n.appendChild(child.cloneNode(true));
          o.appendChild(n);
          dest.appendChild(o);
        } else {
          var clone = child.cloneNode(false);
          splitInto(child, clone);
          dest.appendChild(clone);
        }
      }
    });
  }

  function splitHeadings() {
    if (REDUCED) return;
    var sel = '.section-heading, .page-hero h1, .hero-title, .cta-banner h2, [data-split]';
    $$(sel).forEach(function (el) {
      if (el.dataset.splitDone) return;
      // don't touch headings that already animate themselves (e.g. the intro)
      if (el.closest('#hom-intro')) return;
      var frag = doc.createElement('div');
      splitInto(el, frag);
      el.innerHTML = frag.innerHTML;
      el.dataset.splitDone = '1';
      $$('.mw-i', el).forEach(function (w, i) {
        w.style.transitionDelay = (i * 0.045).toFixed(3) + 's';
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('split-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('[data-split-done]').forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     3. Image wipe reveal
     ============================================================ */
  function imageReveals() {
    if (REDUCED) return;
    var wraps = $$('.work-item, .svc-image-wrap, .about-img-wrap, [data-img-reveal]');
    wraps.forEach(function (w) { w.classList.add('img-reveal'); });
    if (!wraps.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    wraps.forEach(function (w) { io.observe(w); });
  }

  /* ============================================================
     4. Auto-stagger any grid of revealed children
     ============================================================ */
  function autoStagger() {
    $$('[data-stagger]').forEach(function (grid) {
      var step = parseFloat(grid.dataset.stagger) || 0.07;
      [].slice.call(grid.children).forEach(function (child, i) {
        if (!child.classList.contains('reveal')) child.classList.add('reveal');
        child.style.transitionDelay = (i * step).toFixed(3) + 's';
      });
    });

    wireReveals();
  }

  /* ------------------------------------------------------------------
     Reveal wiring.

     Two things make this fragile, so it is written to be idempotent and
     re-runnable:

     1. main.js builds its reveal observer while the document is still
        parsing, so anything tagged .reveal afterwards (everything
        autoStagger touches) is never observed by it.
     2. On the homepage the intro holds `html.intro-lock { overflow:hidden;
        height:100% }`, which clamps the document to one viewport. An
        observer created during that window never recovers once the lock
        lifts, leaving whole grids stuck at opacity:0.

     An IntersectionObserver is the obvious tool here, but observers created
     while the viewport is still settling (during the intro lock, or before
     the pane has a stable size) silently never deliver — leaving whole
     sections stuck at opacity:0. So reveals are driven by plain geometry
     inside the shared rAF scroll loop instead: deterministic, no observer
     lifecycle to go wrong, and cheap at this element count.
     ------------------------------------------------------------------ */
  var pendingReveals = [];

  function collectReveals() {
    pendingReveals = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale')
                       .filter(function (e) { return !e.classList.contains('is-visible'); });
  }

  function checkReveals() {
    if (!pendingReveals.length) return;
    var h = window.innerHeight || doc.documentElement.clientHeight || 800;
    for (var i = pendingReveals.length - 1; i >= 0; i--) {
      var e = pendingReveals[i], r = e.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;          // not laid out yet
      if (r.top < h * 0.94 && r.bottom > -40) {
        e.classList.add('is-visible');
        pendingReveals.splice(i, 1);
      }
    }
  }

  function wireReveals() { collectReveals(); checkReveals(); }

  /* Keep the pending list fresh: after the intro releases its scroll lock,
     and on a couple of early ticks while fonts/images settle the layout. */
  function watchLock() {
    onScrollAdd(checkReveals);          // evaluated in the shared rAF loop
    /* ...and again straight off the scroll event. rAF can be throttled
       (background tab, idle renderer); content must never be left hidden
       because a frame callback didn't run. The list only shrinks, so this
       costs a handful of rect reads and then nothing. */
    window.addEventListener('scroll', checkReveals, { passive: true });
    window.addEventListener('resize', checkReveals, { passive: true });
    wireReveals();

    /* Correctness must not depend on scroll events or rAF firing — some
       embedded/automated renderers deliver neither. A cheap poll guarantees
       anything that scrolls into view is shown, and retires itself once
       everything has been revealed. */
    var polls = 0;
    var poll = setInterval(function () {
      collectReveals();
      checkReveals();
      if (++polls > 120 || !pendingReveals.length) clearInterval(poll);   // ~42s cap
    }, 350);

    /* Absolute last resort: nothing stays invisible, whatever happened. */
    setTimeout(function () {
      $$('.reveal, .reveal-left, .reveal-right, .reveal-scale')
        .forEach(function (e) { e.classList.add('is-visible'); });
      clearInterval(poll);
    }, 45000);

    if (root.classList.contains('intro-lock') && window.MutationObserver) {
      var mo = new MutationObserver(function () {
        if (!root.classList.contains('intro-lock')) { mo.disconnect(); setTimeout(wireReveals, 60); }
      });
      mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    }
    [300, 1200, 2500].forEach(function (t) { setTimeout(wireReveals, t); });
    window.addEventListener('load', wireReveals);
  }

  /* ============================================================
     5. Parallax  — data-par="0.18"
     ============================================================ */
  function parallax() {
    if (REDUCED) return;
    var items = $$('[data-par]').map(function (el) {
      return { el: el, k: parseFloat(el.dataset.par) || 0.15 };
    });
    if (!items.length) return;
    onScrollAdd(function (y, h) {
      for (var i = 0; i < items.length; i++) {
        var it = items[i], r = it.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > h + 200) continue;
        var mid = r.top + r.height / 2 - h / 2;
        it.el.style.transform = 'translate3d(0,' + (-mid * it.k).toFixed(2) + 'px,0)';
      }
    });
  }

  /* ============================================================
     6. Cursor spotlight on glass surfaces
     ============================================================ */
  function spotlight() {
    if (REDUCED || window.matchMedia('(hover: none)').matches) return;
    var sel = '.glass, .glass-deep, .stat-card, .site-card, .widget, .kpi-tile, .val-card, .cov-tile, .client-logo-card';
    $$(sel).forEach(function (el) {
      if (el.dataset.spot) return;
      el.dataset.spot = '1';
      var g = doc.createElement('span');
      g.className = 'spot-glow';
      el.insertBefore(g, el.firstChild);
      el.addEventListener('mousemove', function (ev) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        el.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      });
    });
  }

  /* ============================================================
     7. Magnetic buttons
     ============================================================ */
  function magnetic() {
    if (REDUCED || window.matchMedia('(hover: none)').matches) return;
    // #fab-top drives its own show/hide with transform — leave it alone
    $$('.btn-primary, .nav-cta, .fab').forEach(function (el) {
      if (el.id === 'fab-top') return;
      el.classList.add('magnetic');
      var R = 70;
      function move(ev) {
        var r = el.getBoundingClientRect();
        var dx = ev.clientX - (r.left + r.width / 2);
        var dy = ev.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (dx * 0.22).toFixed(1) + 'px,' + (dy * 0.3).toFixed(1) + 'px)';
      }
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform 0.55s var(--ease-spring)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 560);
      });
      el.addEventListener('mouseenter', function () { el.style.transition = ''; });
      void R;
    });
  }

  /* ============================================================
     8. Sliding nav indicator
     ============================================================ */
  function navPill() {
    var wrap = $('.nav-links');
    if (!wrap || REDUCED) return;
    var pill = doc.createElement('span');
    pill.id = 'nav-pill';
    wrap.insertBefore(pill, wrap.firstChild);
    var links = $$('a:not(.nav-cta)', wrap);
    var active = $('a.active:not(.nav-cta)', wrap);

    function place(el) {
      if (!el) { wrap.classList.remove('pill-on'); return; }
      pill.style.setProperty('--px', el.offsetLeft + 'px');
      pill.style.setProperty('--pw', el.offsetWidth + 'px');
      wrap.classList.add('pill-on');
    }
    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { place(a); });
    });
    wrap.addEventListener('mouseleave', function () { place(active); });
    requestAnimationFrame(function () { place(active); });
    window.addEventListener('resize', function () { place(active); });
  }

  /* ============================================================
     9. Page transition veil
     ============================================================ */
  function pageVeil() {
    if (REDUCED) return;
    var veil = doc.createElement('div');
    veil.id = 'page-veil';
    doc.body.appendChild(veil);

    // one-shot arrival fade; never blocks input even if it stalls
    veil.classList.add('arrive');
    setTimeout(function () { veil.classList.remove('arrive'); }, 700);

    doc.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (!/\.html($|[?#])/.test(href) && href !== '/') return;
      if (/^https?:|^mailto:|^tel:|^#/.test(href)) return;
      if (a.pathname === location.pathname) return;       // same page
      e.preventDefault();
      veil.classList.add('on');
      setTimeout(function () { location.href = href; }, 240);
      // if navigation is blocked or cancelled, never stay covered
      setTimeout(function () { veil.classList.remove('on'); }, 2500);
    });

    // restore on bfcache back-navigation
    window.addEventListener('pageshow', function (ev) {
      if (ev.persisted) { veil.classList.remove('on'); veil.classList.remove('arrive'); }
    });
  }

  /* ============================================================
     10. Strapline ticker (built from data-ticker on a container)
     ============================================================ */
  function ticker() {
    $$('[data-ticker]').forEach(function (host) {
      var words = host.dataset.ticker.split('|').map(function (s) { return s.trim(); });
      function run() {
        return '<div class="ticker-item">' + words.map(function (w, i) {
          return '<span class="' + (i % 2 ? 'alt' : '') + '">' + w + '</span><i></i>';
        }).join('') + '</div>';
      }
      host.classList.add('ticker');
      host.innerHTML = '<div class="ticker-track">' + run() + run() + '</div>';
    });
  }

  /* ============================================================
     boot
     ============================================================ */
  function init() {
    try { scrollRail(); }   catch (e) {}
    try { splitHeadings(); }catch (e) {}
    try { imageReveals(); } catch (e) {}
    try { autoStagger(); }  catch (e) {}
    try { parallax(); }     catch (e) {}
    try { spotlight(); }    catch (e) {}
    try { magnetic(); }     catch (e) {}
    try { navPill(); }      catch (e) {}
    try { ticker(); }       catch (e) {}
    try { pageVeil(); }     catch (e) {}
    try { watchLock(); }    catch (e) {}
    if (readers.length) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onScroll();
    }
    root.classList.add('motion-ready');
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();

  /* let dynamically-rendered content (portfolio cards) opt in later */
  window.HOMMotion = {
    refresh: function () {
      try { spotlight(); } catch (e) {}
      try { imageReveals(); } catch (e) {}
      try { wireReveals(); } catch (e) {}
    }
  };
})();
