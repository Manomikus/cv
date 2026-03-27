const body = document.body;
const html = document.documentElement;
const langButtons = document.querySelectorAll("[data-lang-btn]");
const counters = document.querySelectorAll(".stat-value[data-target]");
const revealElements = document.querySelectorAll(".reveal");

const applyLanguage = (lang) => {
  const target = lang === "en" ? "en" : "fr";

  body.classList.toggle("lang-fr", target === "fr");
  body.classList.toggle("lang-en", target === "en");
  html.lang = target;

  langButtons.forEach((button) => {
    const isActive = button.dataset.langBtn === target;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  window.localStorage.setItem("cv-language", target);
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
