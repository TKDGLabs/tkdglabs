(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* ---------- recruiting: hide bar, swap card after the deadline ---------- */
  const isPast = (iso) => iso && Date.now() > new Date(iso).getTime();
  const recruitBar = $("#recruitBar");
  if (recruitBar && isPast(recruitBar.dataset.until)) recruitBar.hidden = true;
  const jobOpen = $("#jobOpen");
  const jobClosed = $("#jobClosed");
  if (jobOpen && jobClosed && isPast(jobOpen.dataset.until)) {
    jobOpen.hidden = true;
    jobClosed.hidden = false;
  }

  /* ---------- nav ---------- */
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const menuLinks = $$("#navMenu a");
  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  };
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-solid", y > 8);
    if (!nav.classList.contains("is-open")) {
      if (y > lastY + 6 && y > 480) nav.classList.add("is-hidden");
      else if (y < lastY - 6 || y < 480) nav.classList.remove("is-hidden");
    }
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- orb video ---------- */
  const orbVideo = $("#orbVideo");
  const saveData = navigator.connection && navigator.connection.saveData;
  if (orbVideo && !reduce && !saveData) {
    const source = orbVideo.querySelector("source[data-src]");
    source.src = source.dataset.src;
    orbVideo.load();
    orbVideo.play().catch(() => {});
  }

  /* ---------- inquiry form: mail on desktop, text message on phones ---------- */
  const form = $("#inquiryForm");
  const result = $("#inquiryResult");
  const hint = $("#channelHint");
  const EMAIL = "contact@tkdglabs.com";
  const PHONE = "050714633664";
  form?.addEventListener("change", (e) => {
    if (e.target.name === "purpose" && hint) hint.hidden = e.target.value !== "채널 운영";
  });
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const purpose = data.get("purpose");
    const name = (data.get("name") || "").trim();
    const org = (data.get("org") || "").trim() || "-";
    const contact = (data.get("contact") || "").trim();
    const message = (data.get("message") || "").trim();
    const say = (text, type) => {
      result.textContent = text;
      result.classList.remove("is-error", "is-ok");
      if (type) result.classList.add(type);
    };
    if (!purpose) return say("문의 목적을 골라 주세요.", "is-error");
    if (!name || !contact || !message) return say("이름, 연락처, 내용을 적어 주세요.", "is-error");
    const body = [`[TKDG Labs 문의] ${purpose}`, "", `이름: ${name}`, `소속·직함: ${org}`, `연락처: ${contact}`, "", message].join("\n");
    const isPhone = window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 900;
    if (isPhone) {
      window.location.href = `sms:${PHONE}?body=${encodeURIComponent(body)}`;
      say("문자 작성창을 열었습니다. 보내기를 누르시면 접수됩니다.", "is-ok");
    } else {
      const subject = `[TKDG Labs 문의] ${purpose} - ${name}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      say("메일 작성창을 열었습니다. 보내기를 누르시면 접수됩니다.", "is-ok");
    }
  });

  if (!hasGsap) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* in-page links: smooth, offset by the sticky nav */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains("skip")) return;
    const id = a.getAttribute("href");
    const target = id === "#top" ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    const navH = nav.offsetHeight;
    if (lenis) lenis.scrollTo(id === "#top" ? 0 : target, { offset: -navH + 1, duration: 1.2 });
    else window.scrollTo({ top: id === "#top" ? 0 : target.getBoundingClientRect().top + window.scrollY - navH, behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", id);
  });

  /* active menu item */
  menuLinks.forEach((a) => {
    const sec = $(a.getAttribute("href"));
    if (!sec || a.classList.contains("nav__cta")) return;
    ScrollTrigger.create({
      trigger: sec,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: (self) => a.classList.toggle("is-active", self.isActive),
    });
  });

  /* ---------- cursor ---------- */
  const cursor = $(".cursor");
  if (cursor && finePointer && !reduce) {
    const cx = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3" });
    window.addEventListener("mousemove", (e) => {
      cursor.classList.add("is-on");
      cx(e.clientX);
      cy(e.clientY);
    }, { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      cursor.classList.toggle("is-big", !!t.closest("a, button, summary, .chips label, .svc, .brandrow"));
      cursor.classList.toggle("is-light", !!t.closest(".foot, .recruit"));
    });
  }

  /* ---------- magnetic round button ---------- */
  if (finePointer && !reduce) {
    $$(".orb-btn").forEach((btn) => {
      const mx = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3" });
      const my = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.35);
        my((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      btn.addEventListener("mouseleave", () => { mx(0); my(0); });
    });
  }

  /* ---------- service hover preview ---------- */
  const preview = $("#svcPreview");
  if (preview && finePointer && !reduce) {
    gsap.set(preview, { xPercent: -50, yPercent: -50, rotate: -4, scale: 0.85 });
    const px = gsap.quickTo(preview, "x", { duration: 0.45, ease: "power3" });
    const py = gsap.quickTo(preview, "y", { duration: 0.45, ease: "power3" });
    const list = $("#svcs");
    list.addEventListener("mousemove", (e) => { px(e.clientX + 150); py(e.clientY); });
    $$(".svc", list).forEach((row) => {
      const img = new Image();
      img.src = row.dataset.img;
      row.addEventListener("mouseenter", () => {
        preview.src = row.dataset.img;
        preview.classList.add("is-on");
        gsap.to(preview, { scale: 1, rotate: 0, duration: 0.4, ease: "power3.out" });
      });
    });
    list.addEventListener("mouseleave", () => {
      preview.classList.remove("is-on");
      gsap.to(preview, { scale: 0.85, rotate: -4, duration: 0.3 });
    });
  }

  if (reduce) return;

  /* ---------- hero: one entrance sequence ---------- */
  const heroWords = $$(".hero__word");
  const orb = $(".hero__orb");
  const shapes = $$(".hero__shapes i");
  const photo = $(".hero__photo");
  const photoImg = $(".hero__photo img");
  gsap.set(heroWords, { yPercent: 108 });
  gsap.set(orb, { scale: 0, rotate: -90 });
  gsap.set([".hero__note", ".hero__lead"], { autoAlpha: 0, y: 24 });
  gsap.set(shapes, { scale: 0, transformOrigin: "50% 50%" });
  gsap.set(photo, { clipPath: "inset(100% 0% 0% 0%)" });
  gsap.set(photoImg, { scale: 1.25 });

  const intro = () =>
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .to(heroWords, { yPercent: 0, duration: 1.3, stagger: 0.12 }, 0.05)
      .to(orb, { scale: 1, rotate: 0, duration: 1.2 }, 0.35)
      .to(shapes, { scale: 1, duration: 0.9, stagger: 0.1, ease: "back.out(2)" }, 0.6)
      .to([".hero__note", ".hero__lead"], { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 }, 0.55)
      .to(photo, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" }, 0.5)
      .to(photoImg, { scale: 1, duration: 1.8 }, 0.5);

  let started = false;
  const start = () => { if (!started) { started = true; intro(); } };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);

  /* photo drifts as the page scrolls */
  gsap.fromTo(photoImg, { yPercent: -6 }, {
    yPercent: 6, ease: "none",
    scrollTrigger: { trigger: photo, start: "top bottom", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__shapes", {
    rotate: 180, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- headings: line reveal ---------- */
  const revealLines = (el) => {
    if (!window.SplitText) return;
    window.SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 105, duration: 1.1, stagger: 0.09, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }),
    });
  };
  const splitTargets = [".about__title", ".sec-head h2", ".quote blockquote", ".job h2", ".contact__title"];
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    splitTargets.forEach((s) => $$(s).forEach(revealLines));
    ScrollTrigger.refresh();
  });

  /* ---------- marquee: loops, speeds up with the scroll ---------- */
  const track = $("#marquee");
  if (track) {
    const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
    ScrollTrigger.create({
      trigger: ".marquee",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const v = Math.min(Math.abs(self.getVelocity()) / 220, 5);
        gsap.to(loop, { timeScale: 1 + v, duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: 1, duration: 1, delay: 0.2 });
      },
    });
  }

  /* ---------- proof: counters and bars ---------- */
  $$("[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const pre = el.dataset.prefix || "";
    const suf = el.dataset.suffix || "";
    const finalText = el.textContent;
    el.setAttribute("aria-label", finalText);
    const o = { v: 0 };
    el.textContent = pre + (0).toFixed(dec) + suf;
    gsap.to(o, {
      v: end, duration: 1.8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      onUpdate: () => (el.textContent = pre + o.v.toFixed(dec) + suf),
      onComplete: () => (el.textContent = finalText),
    });
  });
  $$(".bars").forEach((b) => {
    gsap.from($$(".bar__fill", b), {
      scaleX: 0, duration: 1.4, ease: "expo.out", stagger: 0.15,
      scrollTrigger: { trigger: b, start: "top 85%", once: true },
    });
  });

  /* ---------- method: the line fills and lights each step ---------- */
  const steps = $("#steps");
  if (steps) {
    const items = $$("li", steps);
    gsap.fromTo(steps, { "--p": 0 }, {
      "--p": 1, ease: "none",
      scrollTrigger: {
        trigger: steps, start: "top 80%", end: "top 35%", scrub: 0.4,
        onUpdate: (self) => items.forEach((li, i) => li.classList.toggle("is-on", self.progress >= (i + 0.2) / items.length)),
      },
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
