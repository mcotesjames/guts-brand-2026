(() => {
  let documentListenerAttached = false;

  const getVariantId = (variants, colorIndex, sizeIndex, selected) => {
    return variants.find((variant) => {
      if (!variant.available) return false;
      const colorMatch =
        colorIndex === -1 || variant.options[colorIndex] === selected.color;
      const sizeMatch =
        sizeIndex === -1 || variant.options[sizeIndex] === selected.size;
      return colorMatch && sizeMatch;
    })?.id;
  };

  const updateQuickAddState = (card) => {
    const button = card.querySelector('[data-quick-add]');
    const sizeList = card.querySelector('[data-size-list]');
    if (!button) return;

    const hasSize = button.dataset.hasSize === 'true';
    if (!hasSize) {
      button.classList.add('is-ready');
      button.classList.remove('is-awaiting-size');
      if (sizeList) sizeList.classList.remove('is-active');
      return;
    }

    const selectedSize = sizeList?.querySelector('.custom-product-card__size.is-active');
    if (selectedSize) {
      button.classList.add('is-ready');
      button.classList.remove('is-awaiting-size');
    } else {
      button.classList.remove('is-ready');
    }
  };

  const addToCart = async (variantId) => {
    if (!variantId) return;
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 })
    });
    return response.ok;
  };

  const updateCartCount = async () => {
    const response = await fetch('/cart.js');
    if (!response.ok) return;
    const cart = await response.json();
    const count = Number(cart.item_count || 0);
    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
      badge.textContent = count;
      badge.classList.toggle('is-hidden', count === 0);
    });
    return cart;
  };

  const getSelectedColor = (card) => {
    const fixedColor = card.dataset.fixedColor;
    if (fixedColor) return fixedColor;
    return card.querySelector('.custom-product-card__swatch.is-active')?.dataset.colorValue || null;
  };

  const getSelectedSize = (card) => {
    return card.querySelector('.custom-product-card__size.is-active')?.dataset.sizeValue || null;
  };

  const updateProductImage = (card, variantImages, colorIndex, sizeIndex) => {
    const img = card.querySelector('.custom-product-card__image-main');
    const hoverImg = card.querySelector('.custom-product-card__image--hover');
    if (!img) return;

    const selectedColor = getSelectedColor(card);
    const selectedSize = getSelectedSize(card);

    const findMatch = (requireSize) =>
      variantImages.find((variant) => {
        if (colorIndex !== -1 && selectedColor && variant.options[colorIndex] !== selectedColor) {
          return false;
        }
        if (requireSize && sizeIndex !== -1 && selectedSize && variant.options[sizeIndex] !== selectedSize) {
          return false;
        }
        return true;
      });

    const match = selectedSize ? findMatch(true) : findMatch(false);
    const imageSrc = match?.image;
    if (!imageSrc) return;

    img.src = imageSrc;
    img.srcset = '';

    if (hoverImg && match?.focus) {
      hoverImg.src = match.focus;
      hoverImg.srcset = '';
    }
  };

  const initCard = (card) => {
    if (card.dataset.quickAddInitialized === 'true') return;
    card.dataset.quickAddInitialized = 'true';

    const variants = JSON.parse(card.dataset.variants || '[]');
    const colorIndex = Number(card.dataset.colorIndex);
    const sizeIndex = Number(card.dataset.sizeIndex);
    const variantImages = JSON.parse(card.dataset.variantImages || '[]');
    const swatches = card.querySelectorAll('.custom-product-card__swatch');
    const sizes = card.querySelectorAll('.custom-product-card__size');
    const sizeList = card.querySelector('[data-size-list]');
    const quickAdd = card.querySelector('[data-quick-add]');

    if (swatches.length) {
      swatches.forEach((swatch, index) => {
        if (index === 0) swatch.classList.add('is-active');
        swatch.addEventListener('click', () => {
          swatches.forEach((btn) => {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-pressed', 'false');
          });
          swatch.classList.add('is-active');
          swatch.setAttribute('aria-pressed', 'true');
          updateQuickAddState(card);
          updateProductImage(card, variantImages, colorIndex, sizeIndex);
        });
      });
    }

    if (sizes.length) {
      sizes.forEach((size) => {
        size.addEventListener('click', () => {
          sizes.forEach((btn) => {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-pressed', 'false');
          });
          size.classList.add('is-active');
          size.setAttribute('aria-pressed', 'true');
          updateQuickAddState(card);
          updateProductImage(card, variantImages, colorIndex, sizeIndex);
        });
      });

      if (sizeList && Number(sizeList.dataset.sizeCount) > 4 && window.jQuery) {
        const $list = window.jQuery(sizeList);
        if (!$list.hasClass('slick-initialized')) {
          $list.slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            arrows: true,
            dots: false,
            infinite: false
          });
        }
      }
    }

    if (quickAdd) {
      quickAdd.addEventListener('click', async () => {
        const selectedColor = getSelectedColor(card);
        const selectedSize = getSelectedSize(card);
        const hasSize = quickAdd.dataset.hasSize === 'true';
        const mode = quickAdd.dataset.quickAddMode || 'product';

        if (hasSize && !selectedSize) {
          if (mode === 'variant') {
            sizeList?.classList.add('is-active');
            if (sizeList && sizeList.classList.contains('is-active')) {
              quickAdd.classList.add('is-awaiting-size');
            }
          } else {
            sizeList?.classList.add('is-active');
            quickAdd.classList.add('is-awaiting-size');
          }
          return;
        }

        const selected = {
          color: selectedColor || null,
          size: selectedSize || null
        };

        const variantId = getVariantId(variants, colorIndex, sizeIndex, selected);
        console.log(variants, colorIndex, sizeIndex, selected);
        // console.log(variantId);
        const added = await addToCart(variantId);
        if (added) {
          const cart = await updateCartCount();
          if (cart) {
            document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
          }
          quickAdd.classList.add('is-ready');
          quickAdd.classList.remove('is-awaiting-size');
          const original = quickAdd.dataset.originalLabel || quickAdd.innerHTML;
          quickAdd.dataset.originalLabel = original;
          quickAdd.textContent = 'ADDED';
          quickAdd.classList.add('is-added');
          window.setTimeout(() => {
            quickAdd.innerHTML = original;
            quickAdd.classList.remove('is-added');
          }, 3000);
        }
      });
    }

    updateQuickAddState(card);
    updateProductImage(card, variantImages, colorIndex, sizeIndex);
  };

  const initAll = (root = document) => {
    root.querySelectorAll('[data-product-card]').forEach(initCard);
    if (!documentListenerAttached) {
      documentListenerAttached = true;
      document.addEventListener('click', (event) => {
        document.querySelectorAll('[data-product-card]').forEach((card) => {
          if (card.contains(event.target)) return;
          if (card.dataset.keepSizesOpen === 'true') return;
          const sizeList = card.querySelector('[data-size-list]');
          if (!sizeList || !sizeList.classList.contains('is-active')) return;

          const quickAdd = card.querySelector('[data-quick-add]');
          sizeList.classList.remove('is-active');
          if (quickAdd) quickAdd.classList.remove('is-ready');
          if (quickAdd) quickAdd.classList.remove('is-awaiting-size');

          card.querySelectorAll('.custom-product-card__size.is-active').forEach((size) => {
            size.classList.remove('is-active');
            size.setAttribute('aria-pressed', 'false');
          });
        });
      });
    }
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
