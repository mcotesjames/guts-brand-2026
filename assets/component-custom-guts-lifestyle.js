(() => {
  const initSection = (section) => {
    if (!section || !window.gsap) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) return;

    const items = Array.from(section.querySelectorAll('[data-guts-lifestyle-reveal]'));
    if (!items.length) return;

    const isMobile = window.matchMedia('(max-width: 768px)');
    const duration = 1;
    const ease = 'power3.inOut';
    const headings = Array.from(section.querySelectorAll('.custom-guts-lifestyle__heading'));
    const parallaxTargets = items
      .map((item) => item.querySelector('img'))
      .filter(Boolean);
    let parallaxInstances = [];

    const fitHeadings = () => {
      if (!window.textFit || !headings.length) return;
      headings.forEach((heading) => {
        window.textFit(heading, {
          multiLine: false,
          alignVert: false,
          alignHoriz: false,
          widthOnly: true,
          maxFontSize: 126,
          minFontSize: 14,
        });
      });
    };

    const revealItem = (item, delay = 0) => {
      if (item.dataset.revealed === 'true') return;
      const overlay = item.querySelector('.custom-guts-lifestyle__reveal');
      if (!overlay) return;
      item.dataset.revealed = 'true';
      window.gsap.to(overlay, {
        yPercent: 100,
        duration,
        ease,
        delay,
      });
    };

    const buildObserver = (targets, onReveal) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            onReveal(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.1 }
      );

      targets.forEach((target) => observer.observe(target));
      return observer;
    };

    const initParallax = () => {
      if (!window.simpleParallax || !parallaxTargets.length) return;
      parallaxInstances.forEach((instance) => instance.destroy());
      parallaxInstances = [];

      const configs = [
        { scale: 1.08, orientation: 'up', delay: 0.35 },
        { scale: 1.14, orientation: 'down', delay: 0.25 },
        { scale: 1.2, orientation: 'up', delay: 0.15 },
        { scale: 1.12, orientation: 'down', delay: 0.45 },
      ];

      parallaxTargets.forEach((image, index) => {
        const config = configs[index % configs.length];
        const instance = new window.simpleParallax(image, {
          ...config,
          overflow: true,
          disableOnMobile: true,
        });
        parallaxInstances.push(instance);
      });
    };

    let observer = null;

    const initDesktop = () => {
      if (observer) observer.disconnect();
      observer = buildObserver([section], () => {
        items.forEach((item, index) => {
          revealItem(item, index * 0.2);
        });
      });
    };

    const initMobile = () => {
      if (observer) observer.disconnect();
      observer = buildObserver(items, (item) => {
        revealItem(item, 0);
      });
    };

    const handleMode = () => {
      fitHeadings();
      initParallax();
      if (isMobile.matches) {
        initMobile();
      } else {
        initDesktop();
      }
    };

    handleMode();
    isMobile.addEventListener('change', handleMode);
    window.addEventListener('resize', fitHeadings);

    if (window.Shopify && window.Shopify.designMode) {
      document.addEventListener('shopify:section:unload', (event) => {
        if (event.target !== section) return;
        if (observer) observer.disconnect();
        isMobile.removeEventListener('change', handleMode);
        window.removeEventListener('resize', fitHeadings);
        parallaxInstances.forEach((instance) => instance.destroy());
        parallaxInstances = [];
      });
    }
  };

  const initAll = (root = document) => {
    root.querySelectorAll('.custom-guts-lifestyle').forEach((section) => {
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
