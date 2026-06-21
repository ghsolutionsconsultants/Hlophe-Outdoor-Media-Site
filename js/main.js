/* ============================================================
   HLOPHE OUTDOOR MEDIA — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ---- Navbar scroll behaviour ---- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mark active nav link ---- */
  (function markActiveLink() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#navbar a, #mobile-menu a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href === page || (page === 'index.html' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  })();

  /* ---- Mobile menu ---- */
  const menuToggle  = document.getElementById('nav-toggle');
  const mobileMenu  = document.getElementById('mobile-menu');
  const menuClose   = document.getElementById('mobile-menu-close');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    const close = () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    };
    if (menuClose) menuClose.addEventListener('click', close);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  /* ---- Scroll reveal (Intersection Observer) ---- */
  const revealEls = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );
  if (revealEls.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -48px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  /* ---- Counter animation ---- */
  function animateCounter(el) {
    const target  = parseFloat(el.dataset.target);
    const suffix  = el.dataset.suffix || '';
    const decimal = el.dataset.decimal === 'true';
    const dur     = 1600;
    const start   = performance.now();
    const step = ts => {
      const prog = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      const val  = target * ease;
      el.textContent = (decimal ? val.toFixed(1) : Math.floor(val)) + suffix;
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const counterEls = document.querySelectorAll('[data-counter]');
  if (counterEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => obs.observe(el));
  }

  /* ---- FAB: Back to top ---- */
  const fabTop = document.getElementById('fab-top');
  if (fabTop) {
    window.addEventListener('scroll', () => {
      fabTop.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
    fabTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Particle canvas (hero only) ---- */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles, raf;

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const N = Math.min(100, Math.floor(window.innerWidth / 14));
    particles = Array.from({ length: N }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r:  Math.random() * 1.6 + 0.4,
      o:  Math.random() * 0.5 + 0.1,
    }));

    let mx = -1000, my = -1000;
    const hero = document.getElementById('hero');
    if (hero) {
      hero.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
      hero.addEventListener('mouseleave', () => { mx = -1000; my = -1000; });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        /* repel from cursor */
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          const f = (120 - dist) / 120 * 0.6;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
        /* dot */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${p.o})`;
        ctx.fill();
        /* lines */
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(124,58,237,${(1 - d / 110) * 0.09})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }

  /* ---- Service card 3-D tilt ---- */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const dx  = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      const dy  = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      card.style.transform = `perspective(700px) rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---- Gallery lightbox ---- */
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  if (lightbox && lbImg) {
    document.querySelectorAll('[data-lightbox]').forEach(item => {
      item.addEventListener('click', () => {
        lbImg.src = item.querySelector('img').src;
        lbImg.alt = item.querySelector('img').alt;
        if (lbCaption) lbCaption.textContent = item.dataset.caption || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    const closeLb = e => {
      if (!e || e.target === lightbox || e.target.closest('#lb-close')) {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
      }
    };
    document.getElementById('lb-close')?.addEventListener('click', closeLb);
    lightbox.addEventListener('click', closeLb);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb({}); });
  }

  /* ---- Contact form feedback ---- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const originalHTML = btn.innerHTML;

      btn.disabled = true;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Sending…';

      try {
        const res = await fetch('https://formspree.io/f/xdarnzjq', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });

        if (res.ok) {
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 6L9 17l-5-5"/></svg> Proposal Request Sent!';
          btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
          form.reset();
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.disabled = false;
          }, 6000);
        } else {
          throw new Error('Server error');
        }
      } catch {
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg> Failed — please try again';
        btn.style.background = 'linear-gradient(135deg, #dc2626, #ef4444)';
        btn.disabled = false;
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
        }, 5000);
      }
    });
  }

})();
