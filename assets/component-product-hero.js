(() => {
  const formatMoney = (cents) => {
    if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
      return window.Shopify.formatMoney(cents);
    }
    const amount = Number(cents || 0) / 100;
    return `$${amount.toFixed(2)}`;
  };

  const initSection = (section) => {
    const $root = window.jQuery;
    if (!$root || !section) return;

    const $section = $root(section);
    const $track = $section.find('[data-product-hero-track]');
    const $thumbs = $section.find('[data-product-hero-thumbs]');
    if (!$track.length || $track.data('slick-initialized')) return;

    const $prev = $section.find('[data-product-hero-prev]');
    const $next = $section.find('[data-product-hero-next]');
    const $variantInput = $section.find('[data-product-hero-variant]');
    const optionGroups = Array.from(section.querySelectorAll('[data-option-name]'));
    const form = section.querySelector('[data-product-hero-form]');
    const priceEl = section.querySelector('[data-product-hero-price]');
    const qtyInput = section.querySelector('.product-hero__qty-input');
    const variantsScript = section.querySelector('[data-product-hero-variants]');
    const variants = variantsScript ? JSON.parse(variantsScript.textContent || '[]') : [];

    const getSelectedValueByNames = (names) => {
      const match = optionGroups.find((group) => {
        const name = group.dataset.optionName.toLowerCase();
        return names.some((entry) => name.includes(entry));
      });
      if (!match) return null;
      const active = match.querySelector('.product-hero__option-button.is-active');
      return active ? active.dataset.optionValue : null;
    };

    const getSelectedVariant = () => {
      if (!variants.length) return null;
      return variants.find((variant) =>
        optionGroups.every((group) => {
          const index = Number(group.dataset.optionIndex);
          const active = group.querySelector('.product-hero__option-button.is-active');
          if (!active) return false;
          return variant.options[index] === active.dataset.optionValue;
        })
      );
    };

    const getSlideColor = (el) => {
      if (el && el.dataset && el.dataset.color) return el.dataset.color;
      const child = el ? el.querySelector('[data-color]') : null;
      return child ? child.dataset.color : '';
    };

    const relinkNav = () => {
      $track.slick('setOption', 'asNavFor', $thumbs, true);
      $thumbs.slick('setOption', 'asNavFor', $track, true);
      $thumbs.slick('setOption', 'focusOnSelect', true, true);
    };

    const applyFilter = (colorValue) => {
      const currentIndex = $track.hasClass('slick-initialized')
        ? $track.slick('slickCurrentSlide')
        : 0;
      $track.slick('slickUnfilter');
      $thumbs.slick('slickUnfilter');

      if (!colorValue) {
        relinkNav();
        return;
      }

      const normalized = String(colorValue).trim().toLowerCase();
      const matching = $track.find('.product-hero__slide').filter((_, el) => {
        return String(getSlideColor(el)).trim() === normalized;
      });

      if (!matching.length) {
        relinkNav();
        return;
      }

      $track.slick('slickFilter', (_, el) => {
        return String(getSlideColor(el)).trim() === normalized;
      });
      $thumbs.slick('slickFilter', (_, el) => {
        return String(getSlideColor(el)).trim() === normalized;
      });
      const maxIndex = matching.length - 1;
      const nextIndex = Math.max(0, Math.min(currentIndex, maxIndex));
      $track.slick('setOption', 'initialSlide', nextIndex, true);
      $thumbs.slick('setOption', 'initialSlide', nextIndex, true);
      $track.slick('refresh');
      $thumbs.slick('refresh');
      $track.slick('slickGoTo', nextIndex, true);
      $thumbs.slick('slickGoTo', nextIndex, true);
      $track.slick('setPosition');
      $thumbs.slick('setPosition');
      relinkNav();
    };

    $thumbs.slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      infinite: false,
      variableWidth: true,
      asNavFor: $track,
      focusOnSelect: true,
      centerMode: true,
      responsive: [
        {
          breakpoint: 900,
          settings: {
            variableWidth: true,
            slidesToShow: 3,
          },
        },
      ],
    });

    $track.slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: true,
      prevArrow: $prev.length ? $prev : undefined,
      nextArrow: $next.length ? $next : undefined,
      infinite: false,
      variableWidth: true,
      asNavFor: $thumbs,
      responsive: [
        {
          breakpoint: 900,
          settings: {
            variableWidth: false,
          },
        },
      ],
    });

    const handleResize = () => {
      if ($track.hasClass('slick-initialized')) {
        $track.slick('setPosition');
      }
      if ($thumbs.hasClass('slick-initialized')) {
        $thumbs.slick('setPosition');
      }
    };

    const updateFromOptions = () => {
      const variant = getSelectedVariant();
      if (variant && $variantInput.length) {
        $variantInput.val(variant.id);
      }
      if (variant && priceEl) {
        priceEl.textContent = formatMoney(variant.price);
      }
      const colorValue = getSelectedValueByNames(['color', 'colour', 'couleur']);
      if (!colorValue) {
        applyFilter(null);
        return;
      }
      applyFilter(colorValue);
    };

    const updateOptionGroup = (group, value) => {
      const buttons = group.querySelectorAll('.product-hero__option-button');
      buttons.forEach((button) => {
        const isActive = button.dataset.optionValue === value;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      const display = group.querySelector('[data-option-value-display]');
      if (display) display.textContent = value;
    };

    if (optionGroups.length) {
      optionGroups.forEach((group) => {
        group.addEventListener('click', (event) => {
          const button = event.target.closest('.product-hero__option-button');
          if (!button) return;
          updateOptionGroup(group, button.dataset.optionValue);
          updateFromOptions();
        });
      });
      updateFromOptions();
    }

    if (form) {
      const submitButton = form.querySelector('.product-hero__add-to-cart');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const variantId = $variantInput.val();
        if (!variantId) return;
        const quantity = Math.max(Number(qtyInput?.value || 1), 1);
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity }),
        });
        if (!response.ok) return;
        const cartResponse = await fetch('/cart.js');
        if (!cartResponse.ok) return;
        const cart = await cartResponse.json();
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
        if (submitButton) {
          const original = submitButton.dataset.originalLabel || submitButton.textContent;
          submitButton.dataset.originalLabel = original;
          submitButton.textContent = 'ADDED';
          submitButton.classList.add('is-added');
          window.setTimeout(() => {
            submitButton.textContent = original;
            submitButton.classList.remove('is-added');
          }, 3000);
        }
      });
    }

    const qtyWrap = section.querySelector('[data-product-hero-qty]');
    if (qtyWrap && qtyInput) {
      qtyWrap.addEventListener('click', (event) => {
        const button = event.target.closest('[data-qty-change]');
        if (!button) return;
        const delta = Number(button.dataset.qtyChange || 0);
        const current = Number(qtyInput.value || 1);
        const next = Math.max(current + delta, 1);
        qtyInput.value = next;
      });
    }

    window.addEventListener('resize', handleResize);

    if (window.Shopify && window.Shopify.designMode) {
      document.addEventListener('shopify:section:unload', (event) => {
        if (event.target !== section) return;
        window.removeEventListener('resize', handleResize);
      });
    }
  };

  const initAll = (root = document) => {
    root.querySelectorAll('[data-product-hero]').forEach((section) => {
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
