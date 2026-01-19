(() => {
  const initAmbassadors = (root) => {
    if (!root || root.dataset.ambassadorsInit === 'true') return;
    root.dataset.ambassadorsInit = 'true';

    const items = Array.from(root.querySelectorAll('[data-ambassadors-item]'));
    if (!items.length) return;

    const setActive = (activeItem) => {
      items.forEach((item) => {
        const isActive = item === activeItem;
        item.classList.toggle('is-active', isActive);
        const toggle = item.querySelector('[data-ambassadors-toggle]');
        if (toggle) {
          toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        }
      });
    };

    if (!items.some((item) => item.classList.contains('is-active'))) {
      setActive(items[0]);
    }

    items.forEach((item) => {
      const toggle = item.querySelector('[data-ambassadors-toggle]');
      if (!toggle) return;
      toggle.addEventListener('click', () => setActive(item));
    });
  };

  const initAll = (scope = document) => {
    scope.querySelectorAll('[data-ambassadors-root]').forEach((section) => {
      initAmbassadors(section);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', (event) => {
    initAll(event.target);
  });
})();
