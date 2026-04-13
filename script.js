const progressBar = document.getElementById("progressBar");
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelectorAll(".site-nav a");
const pageSections = document.querySelectorAll("main section[id]");

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

setActiveNav("about");

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
