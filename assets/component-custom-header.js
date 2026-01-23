(() => {
  const initLinkAnimation = (header) => {
    if (!window.gsap) return;

    const links = header.querySelectorAll('.custom-header__link:not(.dropdown-toggle)');
    links.forEach((link) => {
      if (link.dataset.animated === 'true') return;
      link.dataset.animated = 'true';

      const text = link.querySelector('.custom-header__link-text');
      if (!text) return;

      const clone = text.cloneNode(true);
      clone.classList.add('custom-header__link-text--clone');
      link.appendChild(clone);

      const animate = (toY) => {
        window.gsap.killTweensOf([text, clone]);
        window.gsap.to([text, clone], {
          yPercent: toY,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      link.addEventListener('mouseenter', () => animate(-100));
      link.addEventListener('mouseleave', () => animate(0));
    });
  };

  const initHeader = (header) => {
    if (!header || header.dataset.customHeaderInitialized === 'true') return;
    header.dataset.customHeaderInitialized = 'true';

    let lastScrollY = window.scrollY;
    let ticking = false;
    const hideOffset = 80;

    const update = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      if (currentScrollY <= 0) {
        header.classList.remove('is-hidden');
      } else if (scrollingDown && currentScrollY > hideOffset) {
        header.classList.add('is-hidden');
      } else if (!scrollingDown) {
        header.classList.remove('is-hidden');
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    initLinkAnimation(header);
  };

  const init = (root = document) => {
    root.querySelectorAll('[data-custom-header]').forEach(initHeader);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', (event) => {
    init(event.target);
  });
})();
