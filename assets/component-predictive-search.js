(() => {
  const MIN_QUERY_LENGTH = 2;
  const MAX_PRODUCTS = 6;
  const MAX_NON_PRODUCTS = 3;

  const formatMoney = (cents) => {
    if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
      return window.Shopify.formatMoney(cents);
    }
    const amount = Number(cents || 0) / 100;
    return `$${amount.toFixed(2)}`;
  };

  const buildUrl = (query) => {
    const params = new URLSearchParams({
      q: query,
      'resources[type]': 'product,page,article',
      'resources[limit]': String(MAX_PRODUCTS),
      'resources[options][unavailable_products]': 'last',
      'resources[options][fields]': 'title,product_type,variants.title'
    });
    return `/search/suggest.json?${params.toString()}`;
  };

  const createItem = (item, type) => {
    if (!item) return '';
    if (type === 'product') {
      const image = item.image
        ? `<span class="predictive-search__image"><img src="${item.image}" alt="${item.title || ''}"></span>`
        : '';
      const price = item.price ? `<span class="predictive-search__price">${formatMoney(item.price)}</span>` : '';
      return `
        <li class="predictive-search__item" role="option">
          <a class="predictive-search__link" href="${item.url}">
            ${image}
            <span class="predictive-search__meta">
              <span class="predictive-search__title">${item.title || ''}</span>
              ${price}
            </span>
          </a>
        </li>
      `;
    }
    return `
      <li class="predictive-search__item" role="option">
        <a class="predictive-search__link" href="${item.url}">
          <span class="predictive-search__title">${item.title || ''}</span>
        </a>
      </li>
    `;
  };

  const renderSection = (label, itemsHtml) => {
    if (!itemsHtml) return '';
    return `
      <div class="predictive-search__section">
        <div class="predictive-search__section-title">${label}</div>
        <ul class="predictive-search__list" role="listbox">
          ${itemsHtml}
        </ul>
      </div>
    `;
  };

  const initForm = (form) => {
    if (form.dataset.predictiveSearchInitialized === 'true') return;
    form.dataset.predictiveSearchInitialized = 'true';

    const input = form.querySelector('input[type="search"][name="q"]');
    if (!input) return;

    form.classList.add('predictive-search-form');

    const dropdown = document.createElement('div');
    dropdown.className = 'predictive-search';
    dropdown.setAttribute('aria-hidden', 'true');
    form.appendChild(dropdown);

    let controller = null;
    let debounceTimer = null;

    const hide = () => {
      dropdown.classList.remove('is-active');
      dropdown.setAttribute('aria-hidden', 'true');
      dropdown.innerHTML = '';
    };

    const show = (html) => {
      dropdown.innerHTML = html;
      dropdown.classList.add('is-active');
      dropdown.setAttribute('aria-hidden', 'false');
    };

    const fetchResults = async (query) => {
      if (controller) controller.abort();
      controller = new AbortController();
      const response = await fetch(buildUrl(query), { signal: controller.signal });
      if (!response.ok) return null;
      return response.json();
    };

    const handleInput = async () => {
      const query = input.value.trim();
      if (query.length < MIN_QUERY_LENGTH) {
        hide();
        return;
      }

      const data = await fetchResults(query);
      if (!data || !data.resources || !data.resources.results) {
        hide();
        return;
      }

      const results = data.resources.results;
      const products = (results.products || []).slice(0, MAX_PRODUCTS);
      const pages = (results.pages || []).slice(0, MAX_NON_PRODUCTS);
      const articles = (results.articles || []).slice(0, MAX_NON_PRODUCTS);

      const productItems = products.map((item) => createItem(item, 'product')).join('');
      const pageItems = pages.map((item) => createItem(item, 'page')).join('');
      const articleItems = articles.map((item) => createItem(item, 'article')).join('');

      const html =
        renderSection('Products', productItems) +
        renderSection('Pages', pageItems) +
        renderSection('Articles', articleItems);

      if (html.trim().length) {
        show(html);
      } else {
        show('<div class="predictive-search__empty">No results</div>');
      }
    };

    input.addEventListener('input', () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(handleInput, 250);
    });

    input.addEventListener('focus', () => {
      if (dropdown.innerHTML) {
        dropdown.classList.add('is-active');
        dropdown.setAttribute('aria-hidden', 'false');
      }
    });

    form.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        hide();
        input.blur();
      }
    });

    document.addEventListener('click', (event) => {
      if (!form.contains(event.target)) hide();
    });
  };

  const initAll = () => {
    document.querySelectorAll('form[role="search"]').forEach(initForm);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', initAll);
})();
