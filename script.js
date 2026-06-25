/* ==========================================================
   Urban Brew Café — script.js
   - Mobile nav toggle
   - Sticky navbar + active link highlighting on scroll
   - Scroll-reveal animations (IntersectionObserver)
   - Scroll-to-top button
   - Contact form validation
   ========================================================== */

(function () {
  "use strict";

  document.documentElement.classList.add("js-enabled");

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ----- Footer year ----- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Mobile navigation toggle ----- */
  const hamburger = $("#hamburger");
  const navLinks  = $("#navLinks");
  hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("open");
  });
  // Close menu when a link is clicked
  $$(".nav-link, .nav-links .btn").forEach(link =>
    link.addEventListener("click", () => {
      hamburger?.classList.remove("active");
      navLinks?.classList.remove("open");
    })
  );

  /* ----- Sticky navbar style on scroll ----- */
  const navbar = $("#navbar");
  const scrollTopBtn = $("#scrollTop");
  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 40);
    scrollTopBtn.classList.toggle("show", y > 500);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----- Scroll-to-top ----- */
  scrollTopBtn?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  /* ----- Active navigation highlighting ----- */
  const sections = $$("section[id]");
  const linkMap  = new Map(
    $$(".nav-link").map(a => [a.getAttribute("href").slice(1), a])
  );
  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          linkMap.forEach(l => l.classList.remove("active"));
          linkMap.get(e.target.id)?.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach(s => sectionObserver.observe(s));

  /* ----- Scroll-reveal animations ----- */
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach(el => revealObserver.observe(el));

  /* ----- Contact form validation ----- */
  const form = $("#contactForm");
  if (form) {
    const fields = {
      name:    { el: $("#name"),    test: v => v.trim().length >= 2,                 msg: "Please enter your name." },
      email:   { el: $("#email"),   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: "Please enter a valid email." },
      message: { el: $("#message"), test: v => v.trim().length >= 10,                msg: "Message should be at least 10 characters." },
    };
    const validate = (key) => {
      const { el, test, msg } = fields[key];
      const wrap = el.closest(".field");
      const errorEl = wrap.querySelector(".error");
      const ok = test(el.value);
      wrap.classList.toggle("invalid", !ok);
      errorEl.textContent = ok ? "" : msg;
      return ok;
    };
    Object.keys(fields).forEach(k =>
      fields[k].el.addEventListener("input", () => {
        if (fields[k].el.closest(".field").classList.contains("invalid")) validate(k);
      })
    );
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const allValid = Object.keys(fields).map(validate).every(Boolean);
      if (!allValid) return;
      form.reset();
      const success = $("#formSuccess");
      success.classList.add("show");
      setTimeout(() => success.classList.remove("show"), 5000);
    });
  }

  /* ----- Booking modal ----- */
  const modal = $("#bookingModal");
  if (modal) {
    const formWrap   = $("#bookingFormWrap");
    const successEl  = $("#bookingSuccess");
    const bkForm     = $("#bookingForm");
    const nameEl     = $("#bk-name");
    const phoneEl    = $("#bk-phone");
    const dateEl     = $("#bk-date");
    const timeEl     = $("#bk-time");
    const partyEl    = $("#bk-party");

    // Set min date = today
    const today = new Date().toISOString().split("T")[0];
    dateEl.setAttribute("min", today);

    const openModal = () => {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-lock");
      // Reset to form view
      formWrap.hidden = false;
      successEl.hidden = true;
      setTimeout(() => nameEl.focus(), 50);
    };
    const closeModal = () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-lock");
    };

    $$("[data-open-booking]").forEach(b => b.addEventListener("click", openModal));
    $$("[data-close-booking]").forEach(b => b.addEventListener("click", closeModal));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });

    const bkFields = {
      name:  { el: nameEl,  test: v => v.trim().length >= 2,                       msg: "Please enter your name." },
      phone: { el: phoneEl, test: v => /^[+\d][\d\s\-()]{6,19}$/.test(v.trim()),   msg: "Please enter a valid phone number." },
      date:  { el: dateEl,  test: v => v && v >= today,                             msg: "Please pick a date from today onward." },
      time:  { el: timeEl,  test: v => /^\d{2}:\d{2}$/.test(v) && v >= "07:00" && v <= "22:00", msg: "Choose a time between 7:00 AM and 10:00 PM." },
      party: { el: partyEl, test: v => v !== "",                                    msg: "Please select party size." },
    };
    const validateBk = (key) => {
      const { el, test, msg } = bkFields[key];
      const wrap = el.closest(".field");
      const errorEl = wrap.querySelector(".error");
      const ok = test(el.value);
      wrap.classList.toggle("invalid", !ok);
      if (errorEl) errorEl.textContent = ok ? "" : msg;
      return ok;
    };
    Object.keys(bkFields).forEach(k =>
      bkFields[k].el.addEventListener("input", () => {
        if (bkFields[k].el.closest(".field").classList.contains("invalid")) validateBk(k);
      })
    );

    const formatDate = (iso) => {
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    };
    const formatTime = (t) => {
      const [h, m] = t.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const hr = ((h + 11) % 12) + 1;
      return `${hr}:${String(m).padStart(2, "0")} ${period}`;
    };

    bkForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const allValid = Object.keys(bkFields).map(validateBk).every(Boolean);
      if (!allValid) return;

      $("#confName").textContent  = nameEl.value.trim().split(" ")[0];
      $("#confDate").textContent  = formatDate(dateEl.value);
      $("#confTime").textContent  = formatTime(timeEl.value);
      $("#confParty").textContent = partyEl.value === "9+" ? "9+ guests" : `${partyEl.value} guest${partyEl.value === "1" ? "" : "s"}`;

      bkForm.reset();
      formWrap.hidden  = true;
      successEl.hidden = false;
    });
  }
})();