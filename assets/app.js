(() => {
  const root = document.documentElement;
  const translations = JSON.parse(document.getElementById("site-i18n-data").textContent);
  const basePath = root.dataset.basePath || "";
  const localeButtons = document.querySelectorAll("[data-locale-button]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  const isDark = () => root.dataset.theme === "dark" ||
    (root.dataset.theme === "auto" && systemTheme.matches);
  const updateThemeToggle = () => {
    const nextTheme = isDark() ? "light" : "dark";
    const label = translations[root.lang].theme[nextTheme];
    themeToggle.dataset.nextTheme = nextTheme;
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;
  };

  const readPreference = (key) => {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  };
  const savePreference = (key, value) => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (_) {}
  };
  const translate = (locale, key) =>
    key.split(".").reduce((value, part) => value?.[part], translations[locale]);

  const applyLocale = (locale) => {
    const attributes = {
      "data-i18n": null,
      "data-i18n-src": "src",
      "data-i18n-alt": "alt",
      "data-i18n-content": "content",
      "data-i18n-aria-label": "aria-label",
      "data-i18n-title": "title",
    };
    Object.entries(attributes).forEach(([source, target]) => {
      document.querySelectorAll(`[${source}]`).forEach((node) => {
        const value = translate(locale, node.getAttribute(source));
        if (typeof value !== "string") return;
        if (!target) node.textContent = value;
        else if (target === "src") {
          const version = value.startsWith("/assets/screenshots/") ? `?v=${root.dataset.assetVersion}` : "";
          node.setAttribute(target, basePath + value + version);
        } else node.setAttribute(target, value);
      });
    });
    root.lang = locale;
    updateThemeToggle();
    localeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.localeButton === locale));
    });
  };

  const storedLocale = readPreference("shopshop-locale");
  const browserLocale = navigator.language.toLowerCase().split("-")[0];
  applyLocale(translations[storedLocale] ? storedLocale : translations[browserLocale] ? browserLocale : "en");
  themeToggle.hidden = false;
  systemTheme.addEventListener("change", updateThemeToggle);

  localeButtons.forEach((button) => button.addEventListener("click", () => {
    const locale = button.dataset.localeButton;
    applyLocale(locale);
    savePreference("shopshop-locale", locale);
  }));
  themeToggle.addEventListener("click", () => {
    const requestedTheme = isDark() ? "light" : "dark";
    const deviceTheme = systemTheme.matches ? "dark" : "light";
    // Returning to the device's appearance resumes automatic updates.
    const theme = requestedTheme === deviceTheme ? "auto" : requestedTheme;
    root.dataset.theme = theme;
    updateThemeToggle();
    savePreference("shopshop-theme", theme === "auto" ? null : theme);
  });
})();
