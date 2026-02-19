(function () {
  const STORAGE_KEY = "gymhelper-theme";
  const THEME_LIGHT = "gym-light";
  const THEME_DARK = "gym-dark";

  const isValidTheme = (value) => value === THEME_LIGHT || value === THEME_DARK;

  const safeGetStoredTheme = () => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return isValidTheme(value) ? value : null;
    } catch (_error) {
      return null;
    }
  };

  const safeSetStoredTheme = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_error) {
      // Ignore storage write errors.
    }
  };

  const resolveSystemTheme = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? THEME_DARK : THEME_LIGHT;
  };

  const getCurrentTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    return isValidTheme(current) ? current : THEME_LIGHT;
  };

  const syncThemeToggles = (currentTheme) => {
    const nextThemeLabel = currentTheme === THEME_DARK ? "라이트" : "다크";

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-label", `테마 변경 (${nextThemeLabel})`);
      button.setAttribute("data-current-theme", currentTheme);

      const label = button.querySelector("[data-theme-label]");
      if (label) {
        label.textContent = nextThemeLabel;
      }
    });
  };

  const applyTheme = (theme, options = {}) => {
    const { persist = true } = options;
    const targetTheme = isValidTheme(theme) ? theme : THEME_LIGHT;

    document.documentElement.setAttribute("data-theme", targetTheme);
    syncThemeToggles(targetTheme);

    if (persist) {
      safeSetStoredTheme(targetTheme);
    }
  };

  const toggleTheme = () => {
    const nextTheme = getCurrentTheme() === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    applyTheme(nextTheme, { persist: true });
  };

  const bindThemeToggleEvents = () => {
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      if (button.dataset.themeBound === "true") return;

      button.dataset.themeBound = "true";
      button.addEventListener("click", toggleTheme);
    });
  };

  const hydrateUserName = async () => {
    const targets = Array.from(document.querySelectorAll("[data-user-name]"));
    if (targets.length === 0) return;

    try {
      const response = await fetch("/api/users/getUserName", {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) return;

      const data = await response.json();
      if (!data.success || !data.username) return;

      targets.forEach((target) => {
        target.textContent = data.username;
      });
    } catch (_error) {
      // Ignore username hydrate errors.
    }
  };

  const initializeTheme = () => {
    const storedTheme = safeGetStoredTheme();
    const initialTheme = storedTheme || resolveSystemTheme();
    applyTheme(initialTheme, { persist: Boolean(storedTheme) });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    bindThemeToggleEvents();
    hydrateUserName();
  });

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (event) => {
    if (safeGetStoredTheme()) return;
    applyTheme(event.matches ? THEME_DARK : THEME_LIGHT, { persist: false });
  });

  window.GymTheme = {
    applyTheme,
    toggleTheme
  };
})();

