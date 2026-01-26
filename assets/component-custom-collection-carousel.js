(() => {
  const initCarousel = (root) => {
    const $root = window.jQuery;
    if (!$root || !root) return;

    const $track = $root(root).find('[data-collection-carousel]');
    if (!$track.length || $track.data('slick-initialized')) return;

    const updateDots = (event, slickInstance) => {
      const slick = slickInstance || $track.slick('getSlick');
      if (!slick || !slick.$dots) return;
      const $dots = slick.$dots.find('li');
      if (!$dots.length) return;

      const maxDots = Math.min(7, $dots.length);
      const maxDistance = Math.floor(maxDots / 2);
      const activeIndex = $dots.filter('.slick-active').first().index();
      if (activeIndex < 0) return;

      let start = Math.max(0, activeIndex - maxDistance);
      let end = start + maxDots - 1;
      if (end > $dots.length - 1) {
        end = $dots.length - 1;
        start = Math.max(0, end - maxDots + 1);
      }

      $dots.each((index, dot) => {
        const $dot = $root(dot);
        const isHidden = index < start || index > end;
        const distance = Math.min(Math.abs(index - activeIndex), maxDistance);
        $dot
          .toggleClass('is-hidden', isHidden)
          .removeClass('is-distance-0 is-distance-1 is-distance-2 is-distance-3')
          .addClass(`is-distance-${distance}`);
      });
    };

    $track.on('init reInit afterChange', updateDots);

    const $prevArrow = $root(root).find('[data-collection-carousel-prev]');
    const $nextArrow = $root(root).find('[data-collection-carousel-next]');

    $track.slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: true,
      prevArrow: $prevArrow.length ? $prevArrow : undefined,
      nextArrow: $nextArrow.length ? $nextArrow : undefined,
      dots: true,
      infinite: false,
      centerMode: false,
      responsive: [
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
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

  const initAll = () => {
    document.querySelectorAll('.custom-collection-carousel').forEach((section) => {
      initCarousel(section);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', (event) => {
    initCarousel(event.target);
  });
})();
