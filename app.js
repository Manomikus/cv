const body = document.body;
const html = document.documentElement;
const langButtons = document.querySelectorAll("[data-lang-btn]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const counters = document.querySelectorAll(".stat-value[data-target]");
const revealElements = document.querySelectorAll(".reveal");
const scrollProgressBar = document.getElementById("scroll-progress-bar");
const presentationToggle = document.getElementById("presentation-toggle");

let currentLanguage = "fr";

const applyLanguage = (lang) => {
  const target = lang === "en" ? "en" : "fr";
  currentLanguage = target;

  body.classList.toggle("lang-fr", target === "fr");
  body.classList.toggle("lang-en", target === "en");
  html.lang = target;

  langButtons.forEach((button) => {
    const isActive = button.dataset.langBtn === target;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  window.localStorage.setItem("cv-language", target);
  updatePresentationButtonLabel();
};

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.langBtn);
  });
});

const savedLanguage = window.localStorage.getItem("cv-language");
applyLanguage(savedLanguage || "fr");

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

const animateCounter = (element) => {
  const target = Number(element.dataset.target || 0);
  const suffix = element.dataset.suffix || "";
  const duration = 1300;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);

    element.textContent = `${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

counters.forEach((counter) => {
  counterObserver.observe(counter);
});

const navSections = Array.from(navLinks)
  .map((link) => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    if (!targetId) {
      return null;
    }
    return document.getElementById(targetId);
  })
  .filter((section) => section instanceof HTMLElement);

const updateActiveNavLink = () => {
  if (!navLinks.length || !navSections.length) {
    return;
  }

  const probeY = window.scrollY + window.innerHeight * 0.35;
  let activeSectionId = navSections[0].id;

  navSections.forEach((section) => {
    if (section.offsetTop <= probeY) {
      activeSectionId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeSectionId}`;
    link.classList.toggle("is-active", isActive);
  });
};

function updatePresentationButtonLabel() {
  if (!presentationToggle) {
    return;
  }

  const isPresentationMode = body.classList.contains("presentation-mode");
  const text =
    currentLanguage === "fr"
      ? isPresentationMode
        ? "Quitter le mode presentation"
        : "Mode presentation"
      : isPresentationMode
        ? "Exit presentation mode"
        : "Presentation mode";

  presentationToggle.textContent = text;
  presentationToggle.classList.toggle("is-active", isPresentationMode);
}

function setPresentationMode(enabled) {
  body.classList.toggle("presentation-mode", enabled);
  window.localStorage.setItem("cv-v1-presentation-mode", enabled ? "on" : "off");
  updatePresentationButtonLabel();
}

if (presentationToggle) {
  const savedMode = window.localStorage.getItem("cv-v1-presentation-mode");
  setPresentationMode(savedMode === "on");

  presentationToggle.addEventListener("click", () => {
    const nextState = !body.classList.contains("presentation-mode");
    setPresentationMode(nextState);
  });
}

const updateScrollProgress = () => {
  if (!scrollProgressBar) {
    return;
  }

  const top = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = height > 0 ? Math.min(top / height, 1) : 0;

  scrollProgressBar.style.width = `${ratio * 100}%`;
};

let scrollTicking = false;
const onScroll = () => {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;
  requestAnimationFrame(() => {
    updateScrollProgress();
    updateActiveNavLink();
    scrollTicking = false;
  });
};

updateScrollProgress();
updateActiveNavLink();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  updateScrollProgress();
  updateActiveNavLink();
});
