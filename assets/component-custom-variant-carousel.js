(() => {
  const initCarousel = (root) => {
    const $root = window.jQuery;
    if (!$root || !root) return;

    const $track = $root(root).find('[data-variant-carousel]');
    if (!$track.length || $track.data('slick-initialized')) return;

    $track.slick({
      slidesToShow: 3,
      slidesToScroll: 3,
      arrows: true,
      dots: true,
      infinite: false,
      responsive: [
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 576,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });
  };

  const initAll = (root = document) => {
    root.querySelectorAll('.custom-variant-carousel').forEach((section) => {
      initCarousel(section);
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
