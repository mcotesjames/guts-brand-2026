document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('[data-contact-faq]');

  sections.forEach((section) => {
    const filters = Array.from(section.querySelectorAll('[data-faq-filter]'));
    const items = Array.from(section.querySelectorAll('[data-faq-category]'));

    if (!filters.length) {
      items.forEach((item) => item.classList.remove('is-hidden'));
      return;
    }

    const updateIndexes = () => {
      const visibleItems = items.filter((item) => !item.classList.contains('is-hidden'));
      visibleItems.forEach((item, index) => {
        const indexEl = item.querySelector('.custom-faq__index');
        if (!indexEl) return;
        const displayIndex = String(index + 1).padStart(2, '0');
        indexEl.textContent = displayIndex;
      });
    };

    const setActive = (filter) => {
      filters.forEach((button) => {
        const isActive = button.dataset.faqFilter === filter;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      items.forEach((item) => {
        const isMatch = item.dataset.faqCategory === filter;
        item.classList.toggle('is-hidden', !isMatch);
      });

      updateIndexes();
    };

    const initialFilter = section.dataset.faqInitial || filters[0].dataset.faqFilter;
    setActive(initialFilter);

    filters.forEach((button) => {
      button.addEventListener('click', () => {
        setActive(button.dataset.faqFilter);
      });
    });
  });
});
