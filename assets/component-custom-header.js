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

    const isTouchDevice =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(hover: none)').matches;

    let lastScrollY = window.scrollY;
    let ticking = false;
    const hideOffset = 80;
    const getLightSections = () => Array.from(document.querySelectorAll('.is-light'));

    const closeSearch = () => {
      const search = header.querySelector('.custom-header__search');
      const toggle = header.querySelector('[data-bs-target^="#HeaderSearch"]');
      if (search && search.classList.contains('show')) {
        search.classList.remove('show');
      }
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    };

    const update = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      if (currentScrollY <= 0) {
        header.classList.remove('is-hidden');
      } else if (scrollingDown && currentScrollY > hideOffset) {
        header.classList.add('is-hidden');
        closeSearch();
      } else if (!scrollingDown) {
        header.classList.remove('is-hidden');
      }

      const lightSections = getLightSections();
      if (!lightSections.length) {
        header.classList.add('custom-header--solid');
      } else {
        const headerHeight = header.offsetHeight || 0;
        const isOverLight = lightSections.some((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= headerHeight && rect.bottom >= headerHeight;
        });
        header.classList.toggle('custom-header--solid', !isOverLight);
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
    window.addEventListener('resize', onScroll);

    initLinkAnimation(header);
    update();

    const offcanvas = header.querySelector('[data-custom-header-offcanvas]');
    if (offcanvas && window.bootstrap?.Offcanvas) {
      const offcanvasInstance = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
      offcanvas.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link) return;
        if (link.closest('.custom-header__offcanvas-submenu') || link.closest('.custom-header__offcanvas-menu')) {
          offcanvasInstance.hide();
        }
      });
    }

    if (isTouchDevice) {
      const dropdowns = Array.from(header.querySelectorAll('.dropdown'));
      const closeAll = () => {
        dropdowns.forEach((dropdown) => {
          dropdown.classList.remove('is-open');
          const toggle = dropdown.querySelector('.dropdown-toggle');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
      };

      dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', (event) => {
          event.preventDefault();
          const isOpen = dropdown.classList.contains('is-open');
          closeAll();
          dropdown.classList.toggle('is-open', !isOpen);
          toggle.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        });
      });

      document.addEventListener('click', (event) => {
        if (!header.contains(event.target)) closeAll();
      });
    }
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
