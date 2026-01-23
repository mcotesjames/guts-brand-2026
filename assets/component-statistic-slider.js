(() => {
  const initCarousel = (root) => {
    const $root = window.jQuery;
    if (!$root || !root) return;

    const $section = $root(root);
    const $track = $section.find('[data-statistic-slider-carousel]');
    if (!$track.length || $track.data('slick-initialized')) return;

    const $prevArrow = $section.find('[data-statistic-slider-prev]');
    const $nextArrow = $section.find('[data-statistic-slider-next]');
    const $progressBar = $section.find('[data-statistic-slider-progress]');
    const autoplaySpeed = 5000;
    const fadeDuration = 400;
    let timer = null;
    let isAnimating = false;

    const startProgress = () => {
      if (!$progressBar.length) return;
      $progressBar.css({ transition: 'none', width: '0%' });
      $progressBar[0].offsetHeight;
      $progressBar.css({
        transition: `width ${autoplaySpeed}ms linear`,
        width: '100%',
      });
    };

    const scheduleNext = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        transitionTo('next');
      }, autoplaySpeed);
      startProgress();
    };

    const transitionTo = (direction) => {
      if (isAnimating) return;
      isAnimating = true;
      window.clearTimeout(timer);

      $section.addClass('statistic-slider--fading-out');

      window.setTimeout(() => {
        if (direction === 'prev') {
          $track.slick('slickPrev');
        } else if (direction === 'next') {
          $track.slick('slickNext');
        } else {
          $track.slick('slickGoTo', direction);
        }

        $section.removeClass('statistic-slider--fading-out');
        isAnimating = false;
      }, fadeDuration);
    };

    $track.on('init', () => {
      scheduleNext();
    });

    $track.on('afterChange', () => {
      scheduleNext();
    });

    $track.slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      prevArrow: $prevArrow.length ? $prevArrow : undefined,
      nextArrow: $nextArrow.length ? $nextArrow : undefined,
      infinite: true,
      autoplay: false,
      speed: 0,
      swipe: false,
      draggable: false,
      touchMove: false,
      waitForAnimate: false,
      hoverOnFocus: false,
      pauseOnHover: false
    });

    if ($prevArrow.length) {
      $prevArrow.on('click', (event) => {
        event.preventDefault();
        transitionTo('prev');
      });
    }

    if ($nextArrow.length) {
      $nextArrow.on('click', (event) => {
        event.preventDefault();
        transitionTo('next');
      });
    }

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
