(function () {
  const FLASH_KEY = "gymhelper-toast-flash";

  const typeClassMap = {
    success: "alert-success",
    error: "alert-error",
    warning: "alert-warning",
    info: "alert-info",
  };

  const ensureContainer = () => {
    let container = document.getElementById("gymhelper-toast-container");
    if (container) return container;

    container = document.createElement("div");
    container.id = "gymhelper-toast-container";
    container.className = "toast toast-top toast-end z-[120]";
    document.body.appendChild(container);
    return container;
  };

  const removeToast = (toast) => {
    if (!(toast instanceof HTMLElement)) return;

    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-1");

    window.setTimeout(() => {
      toast.remove();
    }, 180);
  };

  const notify = (message, options = {}) => {
    const { type = "info", duration = 2600 } = options;
    const container = ensureContainer();

    const toast = document.createElement("div");
    const resolvedTypeClass = typeClassMap[type] || typeClassMap.info;

    toast.className = `alert ${resolvedTypeClass} w-[min(22rem,calc(100vw-1.25rem))] shadow-lg pointer-events-auto transition-all duration-200 ease-out opacity-0 translate-y-1`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("opacity-0", "translate-y-1");
      toast.classList.add("opacity-100", "translate-y-0");
    });

    if (duration > 0) {
      window.setTimeout(() => removeToast(toast), duration);
    }

    return toast;
  };

  const flash = (message, type = "info") => {
    try {
      sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, type }));
    } catch (_error) {
      // Ignore storage errors.
    }
  };

  const consumeFlash = () => {
    try {
      const raw = sessionStorage.getItem(FLASH_KEY);
      if (!raw) return;

      sessionStorage.removeItem(FLASH_KEY);
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.message !== "string") return;

      notify(parsed.message, { type: parsed.type || "info" });
    } catch (_error) {
      // Ignore storage parse errors.
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    consumeFlash();
  });

  window.GymFeedback = {
    notify,
    flash,
  };
})();
