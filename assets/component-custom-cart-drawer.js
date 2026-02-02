(() => {
  const drawer = document.querySelector('[data-cart-drawer]');
  if (!drawer) return;

  const overlay = drawer.querySelector('[data-cart-drawer-close]');
  const closeButtons = drawer.querySelectorAll('[data-cart-drawer-close]');
  const content = drawer.querySelector('[data-cart-drawer-content]');
  const subtotal = drawer.querySelector('[data-cart-drawer-subtotal]');

  const formatMoney = (cents, currency) => {
    const amount = Number(cents || 0) / 100;
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || 'USD',
      }).format(amount);
    } catch (error) {
      return `$${amount.toFixed(2)}`;
    }
  };

  const updateCartBadges = (count) => {
    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
      badge.textContent = count;
      badge.classList.toggle('is-hidden', count === 0);
    });
  };

  const renderCart = (cart) => {
    if (!content || !subtotal) return;
    const items = cart.items || [];
    updateCartBadges(Number(cart.item_count || 0));

    if (!items.length) {
      content.innerHTML = '<p class="custom-cart-drawer__empty">Your cart is empty.</p>';
      subtotal.textContent = formatMoney(0, cart.currency);
      return;
    }

    content.innerHTML = items
      .map((item) => {
        const image = item.image || '';
        const variantTitle = item.variant_title && item.variant_title !== 'Default Title'
          ? item.variant_title
          : '';
        return `
          <div
            class="custom-cart-drawer__item cart-item"
            data-cart-line="${item.key}"
            samitaWS-drawer-line-item-key="${item.key}"
          >
            <div>
              ${image ? `<img class="custom-cart-drawer__item-image" src="${image}" alt="${item.product_title}">` : ''}
            </div>
            <div class="cart-item__details">
              <p class="custom-cart-drawer__item-title">${item.product_title}</p>
              ${variantTitle ? `<div class="custom-cart-drawer__item-variant">${variantTitle}</div>` : ''}
              <div
                class="product-option custom-cart-drawer__item-price"
                samitaWS-drawer-product-main-price
              >
                ${formatMoney(item.final_line_price, cart.currency)}
              </div>
              <div
                class="custom-cart-drawer__qty cart-item__quantity"
                data-cart-qty
                samitaWS-drawer-line-item-qty-wrapper
              >
                <button
                  class="custom-cart-drawer__qty-btn"
                  type="button"
                  data-qty-change="-1"
                  name="minus"
                  samitaWS-drawer-line-item-qty-decrease
                >-</button>
                <input
                  class="custom-cart-drawer__qty-value quantity__input"
                  type="number"
                  inputmode="numeric"
                  name="updates[]"
                  value="${item.quantity}"
                  readonly
                  samitaWS-drawer-line-item-qty
                >
                <button
                  class="custom-cart-drawer__qty-btn"
                  type="button"
                  data-qty-change="1"
                  name="plus"
                  samitaWS-drawer-line-item-qty-increase
                >+</button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    subtotal.textContent = formatMoney(cart.total_price, cart.currency);
  };

  const fetchCart = async () => {
    const response = await fetch('/cart.js');
    if (!response.ok) return null;
    return response.json();
  };

  const updateCartLine = async (key, quantity) => {
    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity }),
    });
    if (!response.ok) return null;
    return response.json();
  };

  const openDrawer = () => {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
  };

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer();
  });

  content.addEventListener('click', async (event) => {
    const removeButton = event.target.closest('.samitaWS-drawer-line-item-remove-button');
    if (removeButton) {
      const line = event.target.closest('[data-cart-line]');
      if (!line) return;
      const cart = await updateCartLine(line.dataset.cartLine, 0);
      if (!cart) return;
      renderCart(cart);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
      return;
    }

    const button = event.target.closest('[data-qty-change]');
    if (!button) return;

    const line = event.target.closest('[data-cart-line]');
    if (!line) return;

    const delta = Number(button.dataset.qtyChange || 0);
    const qtyInput = line.querySelector('.custom-cart-drawer__qty-value');
    const currentQty = Number(qtyInput?.value || 0);
    const nextQty = Math.max(currentQty + delta, 0);

    const cart = await updateCartLine(line.dataset.cartLine, nextQty);
    if (!cart) return;
    renderCart(cart);
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
  });

  document.addEventListener('cart:updated', async (event) => {
    const cart = event.detail?.cart || (await fetchCart());
    if (!cart) return;
    renderCart(cart);
    openDrawer();
  });

  document.addEventListener('cart:open', async () => {
    const cart = await fetchCart();
    if (!cart) return;
    renderCart(cart);
    openDrawer();
  });

  document.querySelectorAll('[data-cart-drawer-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      document.dispatchEvent(new Event('cart:open'));
    });
  });
})();
