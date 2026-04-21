/* ============================================================
   NAYNAWA AUTO MAINTENANCE WORKSHOP
   script.js — subtle motion + slider + counters
   ============================================================ */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  /* Header solid-on-scroll */
  const header = document.getElementById("site-header");
  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 14);
  };
  window.addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();

  /* Mobile nav */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("nav-toggle");
  const setNavOpen = (open) => {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => setNavOpen(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => {
      const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
      if (a) setNavOpen(false);
    });
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (!nav.contains(target) && !navToggle.contains(target)) setNavOpen(false);
    });
  }

  /* Scroll reveal */
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  revealEls.forEach((el, idx) => {
    el.style.transitionDelay = `${Math.min(260, (idx % 6) * 60)}ms`;
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* Counters */
  const counterEls = Array.from(document.querySelectorAll("[data-count-to]"));
  const animateCounter = (el) => {
    const raw = el.getAttribute("data-count-to") ?? "";
    const target = Number(raw);
    if (!Number.isFinite(target)) return;

    const decimals = Number(el.getAttribute("data-decimals") ?? "0");
    const suffix = el.getAttribute("data-suffix") ?? "";

    const duration = 1200;
    const start = performance.now();
    const from = 0;

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const value = from + (target - from) * ease;
      const out = decimals > 0 ? value.toFixed(decimals) : String(Math.floor(value));
      el.textContent = `${out}${suffix}`;
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (counterEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      counterEls.forEach((el) => {
        const suffix = el.getAttribute("data-suffix") ?? "";
        el.textContent = `${el.getAttribute("data-count-to")}${suffix}`;
      });
    } else {
      const counterIO = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        },
        { threshold: 0.55 }
      );
      counterEls.forEach((el) => counterIO.observe(el));
    }
  }

  /* Testimonials slider */
  const slider = document.querySelector("[data-slider]");
  if (slider) {
    const track = slider.querySelector("[data-track]");
    const btnPrev = slider.querySelector("[data-prev]");
    const btnNext = slider.querySelector("[data-next]");
    const dotsWrap = slider.querySelector("[data-dots]");
    const slides = track ? Array.from(track.children) : [];
    let index = 0;
    let timer = null;

    const clampIndex = (i) => {
      const len = slides.length || 1;
      return ((i % len) + len) % len;
    };

    const renderDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = `dot-btn${i === index ? " is-active" : ""}`;
        b.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
        b.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(b);
      });
    };

    const apply = () => {
      if (!track) return;
      track.style.transform = `translateX(-${index * 100}%)`;
      if (dotsWrap) {
        const dots = dotsWrap.querySelectorAll(".dot-btn");
        dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
      }
    };

    const goTo = (i) => {
      index = clampIndex(i);
      apply();
      restart();
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const restart = () => {
      stop();
      if (prefersReducedMotion) return;
      timer = window.setInterval(next, 5500);
    };

    renderDots();
    apply();
    restart();

    btnNext?.addEventListener("click", next);
    btnPrev?.addEventListener("click", prev);

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", restart);

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });
  }

  /* Micro-interaction: subtle 3D tilt for cards (desktop only) */
  const canHover = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false;
  if (!prefersReducedMotion && canHover) {
    const tiltEls = Array.from(document.querySelectorAll(".card"));
    const maxDeg = 6;

    const onMove = (el, e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * (maxDeg * 2);
      const rx = -(py - 0.5) * (maxDeg * 2);
      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    };

    for (const el of tiltEls) {
      el.addEventListener("pointermove", (e) => onMove(el, e));
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    }
  }
})();
