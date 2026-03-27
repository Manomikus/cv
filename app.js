const body = document.body;
const html = document.documentElement;
const langButtons = document.querySelectorAll("[data-lang-btn]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const counters = document.querySelectorAll(".stat-value[data-target]");
const revealElements = document.querySelectorAll(".reveal");
const scrollProgressBar = document.getElementById("scroll-progress-bar");
const presentationToggle = document.getElementById("presentation-toggle");
const contactTriggers = document.querySelectorAll("[data-contact-trigger]");
const contactMenu = document.getElementById("contact-menu");
const contactMenuPanel = contactMenu?.querySelector(".contact-menu-panel") || null;
const contactDismissButtons = contactMenu ? contactMenu.querySelectorAll("[data-contact-dismiss]") : [];
const contactActionLinks = contactMenu ? contactMenu.querySelectorAll(".contact-action") : [];
const magneticCards = document.querySelectorAll(
  ".project-card, .timeline-item, .skill-panel, .edu-card, .mission-card"
);

let currentLanguage = "fr";
let lastContactTrigger = null;
let contactHideTimer = null;

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

const positionContactMenu = () => {
  if (!contactMenuPanel || !(lastContactTrigger instanceof HTMLElement)) {
    return;
  }

  if (window.innerWidth <= 820) {
    contactMenuPanel.style.removeProperty("--contact-panel-left");
    contactMenuPanel.style.removeProperty("--contact-panel-top");
    return;
  }

  const panelWidth = Math.min(360, window.innerWidth - 24);
  const panelHeight = contactMenuPanel.offsetHeight || 360;
  const triggerRect = lastContactTrigger.getBoundingClientRect();
  const safeMargin = 12;

  let left = triggerRect.left + triggerRect.width / 2 - panelWidth / 2;
  left = Math.max(safeMargin, Math.min(left, window.innerWidth - panelWidth - safeMargin));

  let top = triggerRect.bottom + 12;
  if (top + panelHeight > window.innerHeight - safeMargin) {
    top = triggerRect.top - panelHeight - 12;
  }
  top = Math.max(safeMargin, top);

  contactMenuPanel.style.setProperty("--contact-panel-left", `${left}px`);
  contactMenuPanel.style.setProperty("--contact-panel-top", `${top}px`);
};

const closeContactMenu = (focusTrigger = true) => {
  if (!contactMenu) {
    return;
  }

  contactMenu.classList.remove("is-open");
  body.classList.remove("contact-menu-open");

  if (contactHideTimer) {
    clearTimeout(contactHideTimer);
  }

  contactHideTimer = window.setTimeout(() => {
    if (contactMenu.classList.contains("is-open")) {
      return;
    }
    contactMenu.hidden = true;
  }, 240);

  if (focusTrigger && lastContactTrigger instanceof HTMLElement) {
    lastContactTrigger.focus();
  }
};

const openContactMenu = (trigger) => {
  if (!contactMenu) {
    return;
  }

  if (contactHideTimer) {
    clearTimeout(contactHideTimer);
    contactHideTimer = null;
  }

  lastContactTrigger = trigger instanceof HTMLElement ? trigger : null;
  contactMenu.hidden = false;
  positionContactMenu();

  requestAnimationFrame(() => {
    contactMenu.classList.add("is-open");
    body.classList.add("contact-menu-open");
  });
};

contactTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openContactMenu(trigger);
  });
});

contactDismissButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeContactMenu();
  });
});

contactActionLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeContactMenu(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !contactMenu || contactMenu.hidden) {
    return;
  }
  closeContactMenu();
});

const setupMagneticCards = () => {
  magneticCards.forEach((card) => {
    const strength = Number(card.dataset.magneticStrength || 8);

    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") {
        return;
      }

      const rect = card.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;
      const offsetX = (relativeX - 0.5) * 2 * strength;
      const offsetY = (relativeY - 0.5) * 2 * strength;

      card.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      card.style.setProperty("--mx", `${Math.round(relativeX * 100)}%`);
      card.style.setProperty("--my", `${Math.round(relativeY * 100)}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "translate3d(0, 0, 0)";
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
    });
  });
};

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
    if (contactMenu && !contactMenu.hidden) {
      positionContactMenu();
    }
    scrollTicking = false;
  });
};

updateScrollProgress();
updateActiveNavLink();
setupMagneticCards();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  updateScrollProgress();
  updateActiveNavLink();
  if (contactMenu && !contactMenu.hidden) {
    positionContactMenu();
  }
});
