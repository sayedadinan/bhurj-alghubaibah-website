/* ============================================================
   BURJ AL GHUBAIBAH AUTO MAINTENANCE WORKSHOP
   script.js — Interactivity & UX
   ============================================================ */

(function () {
  'use strict';

  /* ---------- ELEMENTS ---------- */
  const nav       = document.getElementById('top-nav');
  const toggle    = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');
  const allLinks  = navLinks ? navLinks.querySelectorAll('a[href^="#"]') : [];

  /* ---------- NAV SCROLL SHADOW ---------- */
  function handleNavScroll() {
    if (!nav) return;
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ---------- MOBILE HAMBURGER ---------- */
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    allLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- SMOOTH SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = (nav ? nav.offsetHeight : 0);
      const targetY   = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

  /* ---------- SCROLL REVEAL (IntersectionObserver) ---------- */
  const revealItems = document.querySelectorAll(
    '.service-card, .why-card, .review-card, .stat-item, .contact-item, .why-card'
  );

  const revealStyle = document.createElement('style');
  revealStyle.textContent = `
    .reveal-item {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .reveal-item.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(revealStyle);

  revealItems.forEach(function (el, i) {
    el.classList.add('reveal-item');
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback
    revealItems.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- STATS COUNTER ANIMATION ---------- */
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    const text = el.childNodes[0] ? el.childNodes[0].textContent.trim() : '';
    const target = parseFloat(text);
    if (isNaN(target)) return;

    const isDecimal = text.includes('.');
    const duration  = 1400;
    const start     = performance.now();
    const from      = 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const current  = from + (target - from) * ease;
      el.childNodes[0].textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(function (el) { statsObs.observe(el); });
  }

  /* ---------- STICKY MOBILE BAR HIDE ON TOP ---------- */
  const stickyBar = document.getElementById('sticky-mobile-bar');
  function handleStickyBar() {
    if (!stickyBar) return;
    stickyBar.style.transform = window.scrollY < 100 ? 'translateY(100%)' : 'translateY(0)';
    stickyBar.style.transition = 'transform 0.3s';
  }
  window.addEventListener('scroll', handleStickyBar, { passive: true });
  handleStickyBar();

  /* ---------- ACTIVE NAV LINK HIGHLIGHT ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');

  function highlightNav() {
    let current = '';
    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) current = section.getAttribute('id');
    });
    navAnchors.forEach(function (a) {
      a.style.color = a.getAttribute('href') === '#' + current
        ? 'var(--red-light)'
        : '';
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ---------- PHONE NUMBER CLICK TRACKING (console) ---------- */
  document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      console.log('[BurjAuto] Call initiated:', this.href);
    });
  });

  document.querySelectorAll('a[href^="https://wa.me"]').forEach(function (el) {
    el.addEventListener('click', function () {
      console.log('[BurjAuto] WhatsApp opened:', this.href);
    });
  });

})();
