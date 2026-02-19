(function () {
  const focusableSelector = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable="true"]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const modalRegistry = new Map();
  const modalStack = [];
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const scrollState = {
    count: 0,
    scrollY: 0,
    previousBodyStyles: null
  };

  let isGlobalKeydownBound = false;

  const isElement = (value) => value instanceof HTMLElement;

  const toMilliseconds = (value) => {
    const normalized = (value || '').trim();
    if (!normalized) return 0;
    if (normalized.endsWith('ms')) return Number.parseFloat(normalized) || 0;
    if (normalized.endsWith('s')) return (Number.parseFloat(normalized) || 0) * 1000;
    return Number.parseFloat(normalized) || 0;
  };

  const getTransitionDuration = (element) => {
    if (!element || reducedMotionQuery.matches) return 0;

    const styles = window.getComputedStyle(element);
    const durations = styles.transitionDuration.split(',').map(toMilliseconds);
    const delays = styles.transitionDelay.split(',').map(toMilliseconds);
    const total = Math.max(durations.length, delays.length);

    let maxDuration = 0;

    for (let index = 0; index < total; index += 1) {
      const duration = durations[index] ?? durations[durations.length - 1] ?? 0;
      const delay = delays[index] ?? delays[delays.length - 1] ?? 0;
      maxDuration = Math.max(maxDuration, duration + delay);
    }

    return maxDuration;
  };

  const getFocusableElements = (container) => {
    if (!isElement(container)) return [];

    return Array.from(container.querySelectorAll(focusableSelector)).filter((candidate) => {
      if (!(candidate instanceof HTMLElement)) return false;
      if (candidate.hasAttribute('disabled')) return false;
      if (candidate.getAttribute('aria-hidden') === 'true') return false;
      if (candidate.tabIndex < 0) return false;
      if (candidate.offsetParent === null && candidate.getClientRects().length === 0) return false;
      return true;
    });
  };

  const setInitialFocus = (entry) => {
    let focusTarget = null;

    if (entry.options.initialFocusSelector) {
      focusTarget = entry.panelEl.querySelector(entry.options.initialFocusSelector);
    }

    if (!(focusTarget instanceof HTMLElement) || focusTarget.hasAttribute('disabled')) {
      focusTarget = getFocusableElements(entry.panelEl)[0] || null;
    }

    if (!(focusTarget instanceof HTMLElement)) {
      entry.panelEl.setAttribute('tabindex', '-1');
      focusTarget = entry.panelEl;
    }

    focusTarget.focus({ preventScroll: true });
  };

  const trapFocus = (entry, event) => {
    const focusableElements = getFocusableElements(entry.panelEl);

    if (focusableElements.length === 0) {
      event.preventDefault();
      entry.panelEl.focus({ preventScroll: true });
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || !entry.panelEl.contains(active)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      }
      return;
    }

    if (active === last || !entry.panelEl.contains(active)) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  };

  const setBackgroundInteractivity = (isModalOpen) => {
    document.querySelectorAll('[data-app-shell]').forEach((shell) => {
      if (!(shell instanceof HTMLElement)) return;

      if (isModalOpen) {
        if (!shell.hasAttribute('data-modal-prev-aria-hidden')) {
          const previous = shell.getAttribute('aria-hidden');
          shell.setAttribute('data-modal-prev-aria-hidden', previous === null ? '__none__' : previous);
        }
        shell.setAttribute('aria-hidden', 'true');
        if ('inert' in shell) {
          shell.inert = true;
        }
        return;
      }

      const previous = shell.getAttribute('data-modal-prev-aria-hidden');
      if (previous === '__none__') {
        shell.removeAttribute('aria-hidden');
      } else if (previous !== null) {
        shell.setAttribute('aria-hidden', previous);
      }
      shell.removeAttribute('data-modal-prev-aria-hidden');

      if ('inert' in shell) {
        shell.inert = false;
      }
    });
  };

  const lockBodyScroll = () => {
    if (scrollState.count === 0) {
      const body = document.body;

      scrollState.scrollY = window.scrollY;
      scrollState.previousBodyStyles = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
        overflow: body.style.overflow
      };

      body.style.position = 'fixed';
      body.style.top = `-${scrollState.scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      body.style.overflow = 'hidden';

      setBackgroundInteractivity(true);
    }

    scrollState.count += 1;
  };

  const unlockBodyScroll = () => {
    if (scrollState.count === 0) return;

    scrollState.count -= 1;
    if (scrollState.count > 0) return;

    const body = document.body;
    const previous = scrollState.previousBodyStyles || {};

    body.style.position = previous.position || '';
    body.style.top = previous.top || '';
    body.style.left = previous.left || '';
    body.style.right = previous.right || '';
    body.style.width = previous.width || '';
    body.style.overflow = previous.overflow || '';

    setBackgroundInteractivity(false);
    window.scrollTo(0, scrollState.scrollY);
  };

  const getEntry = (modalEl) => {
    if (!isElement(modalEl)) return null;
    return modalRegistry.get(modalEl) || null;
  };

  const isOpenState = (state) => state === 'opening' || state === 'open';

  const topEntry = () => modalStack[modalStack.length - 1] || null;

  const removeFromStack = (entry) => {
    const index = modalStack.lastIndexOf(entry);
    if (index >= 0) {
      modalStack.splice(index, 1);
    }
  };

  const onGlobalKeydown = (event) => {
    const activeEntry = topEntry();
    if (!activeEntry) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      window.ModalManager.close(activeEntry.modalEl);
      return;
    }

    if (event.key === 'Tab') {
      trapFocus(activeEntry, event);
    }
  };

  const bindGlobalKeydown = () => {
    if (isGlobalKeydownBound) return;
    document.addEventListener('keydown', onGlobalKeydown, true);
    isGlobalKeydownBound = true;
  };

  const unbindGlobalKeydown = () => {
    if (!isGlobalKeydownBound || modalStack.length > 0) return;
    document.removeEventListener('keydown', onGlobalKeydown, true);
    isGlobalKeydownBound = false;
  };

  const attachCloseTriggers = (entry) => {
    entry.closeHandlers.forEach((dispose) => dispose());
    entry.closeHandlers = [];

    const selectors = Array.isArray(entry.options.closeSelectors) ? entry.options.closeSelectors : [];

    selectors.forEach((selector) => {
      entry.modalEl.querySelectorAll(selector).forEach((button) => {
        const clickHandler = (event) => {
          event.preventDefault();
          window.ModalManager.close(entry.modalEl);
        };

        button.addEventListener('click', clickHandler);
        entry.closeHandlers.push(() => button.removeEventListener('click', clickHandler));
      });
    });
  };

  const register = (modalEl, options = {}) => {
    if (!isElement(modalEl)) return null;

    const normalizedOptions = {
      panelSelector: options.panelSelector || '[data-modal-panel]',
      closeSelectors: options.closeSelectors || [],
      initialFocusSelector: options.initialFocusSelector || '',
      onOpen: typeof options.onOpen === 'function' ? options.onOpen : null,
      onClose: typeof options.onClose === 'function' ? options.onClose : null
    };

    const existingEntry = getEntry(modalEl);
    if (existingEntry) {
      existingEntry.options = normalizedOptions;
      attachCloseTriggers(existingEntry);
      return existingEntry;
    }

    const panelEl = modalEl.querySelector(normalizedOptions.panelSelector);
    if (!isElement(panelEl)) return null;

    const entry = {
      modalEl,
      panelEl,
      backdropEl: modalEl.querySelector('[data-modal-backdrop]'),
      options: normalizedOptions,
      closeHandlers: [],
      closeTimeout: null,
      triggerEl: null,
      isScrollLocked: false
    };

    modalEl.dataset.modalState = 'closed';
    modalEl.setAttribute('aria-hidden', 'true');

    const overlayHandler = (event) => {
      if (event.target === modalEl) {
        window.ModalManager.close(modalEl);
      }
    };

    modalEl.addEventListener('click', overlayHandler);
    entry.destroy = () => {
      modalEl.removeEventListener('click', overlayHandler);
      entry.closeHandlers.forEach((dispose) => dispose());
    };

    attachCloseTriggers(entry);
    modalRegistry.set(modalEl, entry);

    return entry;
  };

  const isOpen = (modalEl) => {
    const entry = getEntry(modalEl);
    if (!entry) return false;
    return isOpenState(entry.modalEl.dataset.modalState || 'closed');
  };

  const open = (modalEl, options = {}) => {
    const entry = getEntry(modalEl) || register(modalEl, {});
    if (!entry) return;

    const currentState = entry.modalEl.dataset.modalState || 'closed';
    if (currentState === 'open' || currentState === 'opening') return;

    if (entry.closeTimeout) {
      window.clearTimeout(entry.closeTimeout);
      entry.closeTimeout = null;
    }

    const trigger = options.triggerEl instanceof HTMLElement ? options.triggerEl : document.activeElement;
    if (trigger instanceof HTMLElement) {
      entry.triggerEl = trigger;
    }

    entry.modalEl.classList.remove('hidden');
    entry.modalEl.setAttribute('aria-hidden', 'false');
    entry.modalEl.dataset.modalState = 'opening';

    if (!modalStack.includes(entry)) {
      modalStack.push(entry);
    }

    if (!entry.isScrollLocked) {
      lockBodyScroll();
      entry.isScrollLocked = true;
    }

    bindGlobalKeydown();

    window.requestAnimationFrame(() => {
      if ((entry.modalEl.dataset.modalState || 'closed') !== 'opening') return;
      entry.modalEl.dataset.modalState = 'open';

      window.requestAnimationFrame(() => {
        if (!window.ModalManager.isOpen(entry.modalEl)) return;
        setInitialFocus(entry);
      });

      if (entry.options.onOpen) {
        entry.options.onOpen(entry.modalEl);
      }
    });
  };

  const close = (modalEl, options = {}) => {
    const entry = getEntry(modalEl);
    if (!entry) return;

    const currentState = entry.modalEl.dataset.modalState || 'closed';
    if (currentState === 'closing' || currentState === 'closed') return;

    if (entry.closeTimeout) {
      window.clearTimeout(entry.closeTimeout);
      entry.closeTimeout = null;
    }

    const restoreFocus = options.restoreFocus !== false;

    entry.modalEl.dataset.modalState = 'closing';
    entry.modalEl.setAttribute('aria-hidden', 'true');

    removeFromStack(entry);
    unbindGlobalKeydown();

    const finishClose = () => {
      entry.modalEl.classList.add('hidden');
      entry.modalEl.dataset.modalState = 'closed';

      if (entry.isScrollLocked) {
        unlockBodyScroll();
        entry.isScrollLocked = false;
      }

      if (restoreFocus && entry.triggerEl && entry.triggerEl.isConnected) {
        entry.triggerEl.focus({ preventScroll: true });
      }

      if (entry.options.onClose) {
        entry.options.onClose(entry.modalEl);
      }
    };

    const closeDelay = Math.max(
      getTransitionDuration(entry.panelEl),
      getTransitionDuration(entry.backdropEl)
    );

    if (closeDelay <= 0) {
      finishClose();
      return;
    }

    entry.closeTimeout = window.setTimeout(finishClose, closeDelay + 20);
  };

  window.ModalManager = {
    register,
    open,
    close,
    isOpen
  };
})();
