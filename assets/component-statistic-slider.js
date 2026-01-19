(() => {
  const initCarousel = (root) => {
    const $root = window.jQuery;
    if (!$root || !root) return;

    const $track = $root(root).find('[data-statistic-slider-carousel]');
    if (!$track.length || $track.data('slick-initialized')) return;

    const $prevArrow = $root(root).find('[data-statistic-slider-prev]');
    const $nextArrow = $root(root).find('[data-statistic-slider-next]');
    const $progressBar = $root(root).find('[data-statistic-slider-progress]');
    const autoplaySpeed = 5000;

    const startProgress = () => {
      if (!$progressBar.length) return;
      $progressBar.css({ transition: 'none', width: '0%' });
      $progressBar[0].offsetHeight;
      $progressBar.css({
        transition: `width ${autoplaySpeed}ms linear`,
        width: '100%',
      });
    };

    $track.on('init', () => {
      startProgress();
    });

    $track.on('afterChange', () => {
      startProgress();
    });

    $track.slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: true,
      prevArrow: $prevArrow.length ? $prevArrow : undefined,
      nextArrow: $nextArrow.length ? $nextArrow : undefined,
      infinite: true,
      autoplay: true,
      autoplaySpeed,
    });
  };

  const initAll = (root = document) => {
    root.querySelectorAll('.statistic-slider').forEach((section) => {
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
