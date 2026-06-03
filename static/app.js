/* ============================================================
   SHADOW / OMNI.X  —  Shared App JS
   ============================================================ */

(function () {
  'use strict';

  /* ── Active nav item ───────────────────────────────────────── */
  function setActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(function (el) {
      const href = el.getAttribute('href') || '';
      const match =
        (path === '/'      && href === '/')     ||
        (path === '/home'  && href === '/home') ||
        (path !== '/' && path !== '/home' && href !== '/' && href !== '/home' && path.startsWith(href));
      el.classList.toggle('active', match);
    });
  }

  /* ── Page transition on nav click ──────────────────────────── */
  function initNavTransitions() {
    document.querySelectorAll('.nav-item[href]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        const href = el.getAttribute('href');
        if (!href || href === window.location.pathname) return;
        e.preventDefault();
        document.querySelector('.page')?.classList.add('page--exit');
        setTimeout(function () {
          window.location.href = href;
        }, 220);
      });
    });
  }

  /* ── Page exit animation CSS ───────────────────────────────── */
  (function injectExitCSS() {
    const style = document.createElement('style');
    style.textContent = '.page--exit{opacity:0;transform:translateY(-8px);transition:opacity 0.2s ease,transform 0.2s ease;}';
    document.head.appendChild(style);
  })();

  /* ── Toast helper ───────────────────────────────────────────── */
  window.showToast = function (msg, duration) {
    duration = duration || 2400;
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('show');
    }, duration);
  };

  /* ── Ripple effect on buttons ──────────────────────────────── */
  function initRipple() {
    document.addEventListener('pointerdown', function (e) {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const r = document.createElement('span');
      r.style.cssText = 'position:absolute;border-radius:50%;background:rgba(255,255,255,0.18);pointer-events:none;transform:scale(0);animation:ripple 0.55s linear;left:' + (x - 20) + 'px;top:' + (y - 20) + 'px;width:40px;height:40px;';
      if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(r);
      r.addEventListener('animationend', function () { r.remove(); });
    });
    const style = document.createElement('style');
    style.textContent = '@keyframes ripple{to{transform:scale(8);opacity:0;}}';
    document.head.appendChild(style);
  }

  /* ── Post action toggles (like, bookmark) ──────────────────── */
  function initPostActions() {
    document.addEventListener('click', function (e) {
      const likeBtn = e.target.closest('[data-action="like"]');
      if (likeBtn) {
        likeBtn.classList.toggle('post-action--liked');
        const count = likeBtn.querySelector('.action-count');
        if (count) {
          let n = parseInt(count.textContent, 10) || 0;
          count.textContent = likeBtn.classList.contains('post-action--liked') ? n + 1 : Math.max(0, n - 1);
        }
      }

      const bookmarkBtn = e.target.closest('[data-action="bookmark"]');
      if (bookmarkBtn) {
        bookmarkBtn.classList.toggle('post-action--saved');
        showToast(bookmarkBtn.classList.contains('post-action--saved') ? 'POST SAVED' : 'POST REMOVED');
      }
    });
  }

  /* ── Stagger animate cards/items on load ────────────────────── */
  function initStagger() {
    const items = document.querySelectorAll('.anim-stagger');
    items.forEach(function (el, i) {
      el.style.animationDelay = (i * 0.06) + 's';
      el.classList.add('anim-fadeup');
    });
  }

  /* ── Input focus label animation ─────────────────────────────── */
  function initInputLabels() {
    document.querySelectorAll('.input-group .input').forEach(function (input) {
      function update() {
        const label = input.previousElementSibling;
        if (label && label.tagName === 'LABEL') {
          label.style.color = document.activeElement === input
            ? 'var(--accent)'
            : '';
        }
      }
      input.addEventListener('focus', update);
      input.addEventListener('blur', update);
    });
  }

  /* ── Glitch effect on brand logo ─────────────────────────────── */
  function initGlitch() {
    const brand = document.querySelector('.brand');
    if (!brand) return;
    setInterval(function () {
      if (Math.random() > 0.92) {
        brand.style.textShadow = '2px 0 var(--accent), -2px 0 var(--accent2), 0 0 20px var(--accent-glow)';
        setTimeout(function () {
          brand.style.textShadow = '';
        }, 80);
      }
    }, 600);
  }

  /* ── Smooth image lazy loading ───────────────────────────────── */
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          const img = en.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });
    document.querySelectorAll('img[data-src]').forEach(function (img) { obs.observe(img); });
  }

  /* ── Character counter for textareas ────────────────────────── */
  function initCharCount() {
    document.querySelectorAll('textarea[maxlength]').forEach(function (ta) {
      const max = parseInt(ta.getAttribute('maxlength'), 10);
      const counter = document.createElement('div');
      counter.style.cssText = 'font-family:var(--font-mono);font-size:0.62rem;color:var(--text-muted);text-align:right;margin-top:4px;letter-spacing:0.08em;';
      counter.textContent = '0 / ' + max;
      ta.parentNode.insertBefore(counter, ta.nextSibling);
      ta.addEventListener('input', function () {
        const len = ta.value.length;
        counter.textContent = len + ' / ' + max;
        counter.style.color = len > max * 0.9 ? 'var(--warn)' : 'var(--text-muted)';
      });
    });
  }

  /* ── Init all ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initNavTransitions();
    initRipple();
    initPostActions();
    initStagger();
    initInputLabels();
    initGlitch();
    initLazyImages();
    initCharCount();
  });

})();
