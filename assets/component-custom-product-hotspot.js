(() => {
  const initSection = (section) => {
    if (!section || section.dataset.hotspotInitialized === 'true') return;
    section.dataset.hotspotInitialized = 'true';

    const dots = Array.from(section.querySelectorAll('[data-hotspot-dot]'));
    const cards = Array.from(section.querySelectorAll('[data-hotspot-card], [data-hotspot-mobile-card]'));
    const lines = Array.from(section.querySelectorAll('.custom-product-hotspot__line'));
    if (!dots.length || !cards.length) return;

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    const setActive = (blockId) => {
      dots.forEach((dot) => {
        dot.classList.toggle('is-active', dot.dataset.blockId === blockId);
      });
      cards.forEach((card) => {
        card.classList.toggle('is-active', card.dataset.blockId === blockId);
      });
      lines.forEach((line) => {
        line.classList.toggle('is-active', line.dataset.blockId === blockId);
      });
    };

    const clearActive = () => {
      dots.forEach((dot) => dot.classList.remove('is-active'));
      cards.forEach((card) => card.classList.remove('is-active'));
      lines.forEach((line) => line.classList.remove('is-active'));
    };

    const defaultId = dots[0]?.dataset.blockId;
    if (defaultId && isMobile()) setActive(defaultId);

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        if (isMobile()) {
          setActive(dot.dataset.blockId);
        }
      });

      dot.addEventListener('mouseenter', () => {
        if (!isMobile()) setActive(dot.dataset.blockId);
      });

      dot.addEventListener('mouseleave', () => {
        if (!isMobile()) clearActive();
      });

      dot.addEventListener('focus', () => {
        if (!isMobile()) setActive(dot.dataset.blockId);
      });

      dot.addEventListener('blur', () => {
        if (!isMobile()) clearActive();
      });
    });
  };

  const initAll = (root = document) => {
    root.querySelectorAll('.custom-product-hotspot').forEach(initSection);
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
