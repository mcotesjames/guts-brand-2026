// (() => {
//   const initHeroScroll = (section) => {
//     if (!section || !section.hasAttribute('data-custom-fullscreen-hero')) return;
//     if (!window.gsap) return;

//     const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
//     if (prefersReduced.matches) return;

//     let maxOffset = 0;
//     let start = 0;
//     let end = 0;
//     let ticking = false;
//     const setY = window.gsap.quickSetter(section, 'y', 'px');

//     const refresh = () => {
//       maxOffset = Math.min(section.offsetHeight * 0.35, window.innerHeight * 0.4);
//       start = section.offsetTop;
//       end = start + window.innerHeight;
//     };

//     const update = () => {
//       const scrollY = window.scrollY || window.pageYOffset || 0;
//       const progress = Math.min(Math.max((scrollY - start) / (end - start), 0), 1);
//       setY(-maxOffset * progress);
//       ticking = false;
//     };

//     const onScroll = () => {
//       if (ticking) return;
//       ticking = true;
//       window.requestAnimationFrame(update);
//     };

//     const onResize = () => {
//       refresh();
//       update();
//     };

//     refresh();
//     update();

//     window.addEventListener('scroll', onScroll, { passive: true });
//     window.addEventListener('resize', onResize);

//     if (window.Shopify && window.Shopify.designMode) {
//       document.addEventListener('shopify:section:unload', (event) => {
//         if (event.target !== section) return;
//         window.removeEventListener('scroll', onScroll);
//         window.removeEventListener('resize', onResize);
//         window.gsap.set(section, { clearProps: 'transform' });
//       });
//     }
//   };

//   const initAll = (root = document) => {
//     root.querySelectorAll('.custom-fullscreen-video').forEach((section) => {
//       initHeroScroll(section);
//     });
//   };

//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => initAll());
//   } else {
//     initAll();
//   }

//   document.addEventListener('shopify:section:load', (event) => {
//     initAll(event.target);
//   });
// })();
