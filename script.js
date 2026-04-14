const progressBar = document.getElementById("progressBar");
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelectorAll(".site-nav a");
const pageSections = document.querySelectorAll("main section[id]");
const heroVideo = document.getElementById("heroVideo");

if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.defaultMuted = true;

  const heroVideoCandidates = [
    "./assets/office-hero-under25mb-1080-h264-noaudio.mp4",
    "./assets/videos/office-hero-under25mb-1080-h264-noaudio.mp4",
    "./office-hero-under25mb-1080-h264-noaudio.mp4",
  ];
  let heroVideoCandidateIndex = 0;
  const heroVideoSource = heroVideo.querySelector("source");

  const applyHeroVideoSource = (src) => {
    if (heroVideoSource) {
      heroVideoSource.src = src;
      heroVideoSource.setAttribute("src", src);
    } else {
      heroVideo.src = src;
    }
    heroVideo.load();
  };

  const tryPlayHeroVideo = () => {
    heroVideo.play().catch(() => {});
  };

  const tryNextHeroVideoSource = () => {
    heroVideoCandidateIndex += 1;
    if (heroVideoCandidateIndex < heroVideoCandidates.length) {
      applyHeroVideoSource(heroVideoCandidates[heroVideoCandidateIndex]);
      tryPlayHeroVideo();
    }
  };

  applyHeroVideoSource(heroVideoCandidates[heroVideoCandidateIndex]);

  heroVideo.addEventListener("loadeddata", tryPlayHeroVideo);
  heroVideo.addEventListener("error", tryNextHeroVideoSource);
  heroVideo.addEventListener("stalled", () => {
    if (heroVideo.readyState < 2) tryNextHeroVideoSource();
  });
  window.addEventListener("pageshow", tryPlayHeroVideo);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") tryPlayHeroVideo();
  });
  tryPlayHeroVideo();
}

const updateProgress = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = `${ratio}%`;
};

const updateHeaderState = () => {
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 20);
};

const refreshGlobalUI = () => {
  updateProgress();
  updateHeaderState();
};

window.addEventListener("scroll", refreshGlobalUI, { passive: true });
window.addEventListener("resize", refreshGlobalUI);
updateProgress();
updateHeaderState();

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    link.classList.toggle("is-active", targetId === id);
  });
};

setActiveNav(window.location.hash ? window.location.hash.replace("#", "") : "");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteHeader.classList.toggle("is-open", !expanded);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    if (targetId) setActiveNav(targetId);

    if (window.innerWidth <= 840) {
      siteHeader.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    }
  });
});

const revealTargets = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealTargets.forEach((target, index) => {
  target.style.transitionDelay = `${Math.min(index * 35, 250)}ms`;
  revealObserver.observe(target);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.id);
      }
    });
  },
  {
    threshold: 0.45,
    rootMargin: "-16% 0px -46% 0px",
  }
);

pageSections.forEach((section) => sectionObserver.observe(section));

const teamCards = document.querySelector(".team-cards");
const memberCards = Array.from(document.querySelectorAll("[data-member-card]"));

if (teamCards && memberCards.length > 0) {
  const syncMemberCardsState = () => {
    const activeCard = memberCards.find((card) => card.classList.contains("is-active"));
    teamCards.classList.toggle("has-active", Boolean(activeCard));
    memberCards.forEach((card) => {
      const trigger = card.querySelector(".member-card__trigger");
      if (trigger) {
        trigger.setAttribute("aria-expanded", String(card.classList.contains("is-active")));
      }
    });
  };

  const setActiveMemberCard = (targetCard) => {
    const alreadyActive = targetCard.classList.contains("is-active");
    memberCards.forEach((card) => card.classList.remove("is-active"));
    if (!alreadyActive) targetCard.classList.add("is-active");
    syncMemberCardsState();
  };

  memberCards.forEach((card) => {
    const trigger = card.querySelector(".member-card__trigger");
    if (!trigger) return;
    trigger.addEventListener("click", () => setActiveMemberCard(card));
  });

  syncMemberCardsState();
}

const proposalForm = document.getElementById("proposalForm");
const proposalResult = document.getElementById("proposalResult");

if (proposalForm && proposalResult) {
  const businessPhoneRaw = "050714633664";
  const businessPhoneDisplay = "0507-1463-3664";

  const setProposalMessage = (message, type) => {
    proposalResult.textContent = message;
    proposalResult.classList.remove("is-success", "is-error");
    if (type) proposalResult.classList.add(type);
  };

  const createSmsHref = (text) => `sms:${businessPhoneRaw}?body=${encodeURIComponent(text)}`;

  proposalForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!proposalForm.checkValidity()) {
      proposalForm.reportValidity();
      setProposalMessage("필수 항목을 모두 입력해주세요.", "is-error");
      return;
    }

    const formData = new FormData(proposalForm);
    const submitButton = proposalForm.querySelector('button[type="submit"]');
    const serviceNeeds = Array.from(
      proposalForm.querySelectorAll('input[name="serviceNeeds"]:checked')
    ).map((input) => input.value);

    if (serviceNeeds.length === 0) {
      setProposalMessage("필요 지원 항목을 최소 1개 이상 선택해주세요.", "is-error");
      return;
    }

    const payload = {
      submittedAtKst: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      clientType: formData.get("clientType") || "-",
      serviceNeeds,
      budget: formData.get("budget") || "-",
      timeline: formData.get("timeline") || "-",
      region: formData.get("region") || "-",
      specialRequest: formData.get("specialRequest") || "없음",
      contactName: formData.get("contactName") || "-",
      contactOrg: formData.get("contactOrg") || "-",
      contactPhone: formData.get("contactPhone") || "-",
      source: window.location.href,
    };

    const requestSummary = [
      "[TKDG Labs 제안 요청]",
      "",
      `의뢰 주체: ${payload.clientType}`,
      `필요 지원: ${serviceNeeds.join(", ")}`,
      `예산 범위: ${payload.budget}`,
      `희망 기간: ${payload.timeline}`,
      `지역: ${payload.region}`,
      `특별 요청 사항: ${payload.specialRequest}`,
      "",
      `담당자 성명: ${payload.contactName}`,
      `소속·직함: ${payload.contactOrg}`,
      `연락처: ${payload.contactPhone}`,
    ];
    requestSummary.push(`접수 시각(KST): ${payload.submittedAtKst}`);
    requestSummary.push(`유입 URL: ${payload.source}`);
    const summaryText = requestSummary.join("\n");

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "접수 중...";
      }

      const smsHref = createSmsHref(summaryText);
      setProposalMessage(`문자 메시지 창으로 이동합니다. (${businessPhoneDisplay})`, "is-success");
      window.location.href = smsHref;
      proposalForm.reset();
    } catch (_) {
      setProposalMessage("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "is-error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "제안 요청서 보내기";
      }
    }
  });
}
