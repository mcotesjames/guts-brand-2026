(() => {
  const initSection = (section) => {
    if (!section) return;
    const rows = section.querySelectorAll('[data-custom-testimonials-row]');
    if (!rows.length) return;

    rows.forEach((row) => {
      if (row.dataset.customTestimonialsBound === 'true') return;
      row.dataset.customTestimonialsBound = 'true';

      row.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'touch') return;
        row.classList.toggle('is-paused');
      });
    });
  };

  const initAll = (root = document) => {
    root.querySelectorAll('[data-custom-testimonials]').forEach((section) => {
      initSection(section);
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
