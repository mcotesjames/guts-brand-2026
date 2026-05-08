(() => {
  const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const haversineMiles = (lat1, lng1, lat2, lng2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const r = 3958.8;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return r * c;
  };

  const parseRadius = (value) => {
    const fallbackValue = '20-mi';
    const [amount, unit] = String(value || fallbackValue).split('-');
    const radius = Number(amount) || 0;
    return { radius, unit: unit || 'mi' };
  };

  const formatDistance = (miles, unit) => {
    if (!Number.isFinite(miles)) return 'Distance: —';
    if (unit === 'km') {
      const km = miles * 1.60934;
      return `Distance: ${km.toFixed(1)} km`;
    }
    return `Distance: ${miles.toFixed(1)} mi`;
  };

  const initSection = (section) => {
    if (!section || section.dataset.stockistInitialized === 'true') return;
    section.dataset.stockistInitialized = 'true';

    const list = section.querySelector('[data-stockist-list]');
    const mapEl = section.querySelector('[data-stockist-map]');
    const form = section.querySelector('[data-stockist-search]');
    const radiusSelect = section.querySelector('[data-stockist-radius]');
    const typeSelect = section.querySelector('[data-stockist-type]');
    if (!list || !mapEl || !form || !radiusSelect) return;

    const cards = Array.from(section.querySelectorAll('[data-stockist-card]'));
    const emptyState = section.querySelector('[data-stockist-empty]');
    if (!cards.length) return;

    const stores = cards.map((card) => {
      const lat = toNumber(card.dataset.storeLat);
      const lng = toNumber(card.dataset.storeLng);
      return {
        id: card.dataset.storeId,
        name: card.dataset.storeName,
        address: card.dataset.storeAddress,
        phone: card.dataset.storePhone,
        url: card.dataset.storeUrl,
        type: card.dataset.storeType || 'shop',
        lat,
        lng,
        card,
        marker: null,
      };
    });

    const geocoder = new google.maps.Geocoder();

    // mapId is required for AdvancedMarkerElement. Replace 'DEMO_MAP_ID' with a
    // real Map ID from Google Cloud Console to re-enable custom map styling
    // (cloud-based styles replace the legacy `styles` array below).
    const map = new google.maps.Map(mapEl, {
      center: { lat: 46.2276, lng: 2.2137 },
      zoom: 5,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      mapId: '411467539389485bfab19106',
    });
    let searchCircle = null;

    const resetBtn = document.createElement('button');
    resetBtn.className = 'custom-stockist-locator__reset';
    resetBtn.type = 'button';
    resetBtn.textContent = 'Reset';
    mapEl.appendChild(resetBtn);

    const createDefaultContent = () => {
      const url = section.dataset.markerDefault;
      if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = 'width:24px;height:32px;display:block';
        return img;
      }
      const dot = document.createElement('div');
      dot.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#000;border:1px solid #000';
      return dot;
    };

    const createActiveContent = () => {
      const url = section.dataset.markerActive;
      if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = 'width:36px;height:48px;display:block';
        return img;
      }
      const dot = document.createElement('div');
      dot.style.cssText = 'width:20px;height:20px;border-radius:50%;background:#f0c000;border:1px solid #f0c000';
      return dot;
    };

    const scrollCardIntoView = (card) => {
      if (!list || !card) return;
      const listRect = list.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const offsetTop = cardRect.top - listRect.top + list.scrollTop;
      list.scrollTo({ top: offsetTop, behavior: 'smooth' });
    };

    const setActiveStore = (store, { scrollToCard = false } = {}) => {
      stores.forEach((item) => {
        const isActive = item === store;
        item.card.classList.toggle('is-active', isActive);
        const cta = item.card.querySelector('.custom-stockist-locator__cta');
        if (cta) {
          cta.classList.toggle('custom-button--secondary', isActive);
          cta.classList.toggle('custom-button--primary', !isActive);
        }
        if (item.marker) {
          item.marker.content = isActive ? createActiveContent() : createDefaultContent();
        }
      });
      if (store.marker) {
        map.panTo(store.marker.position);
        map.setZoom(11);
      }
      if (scrollToCard) {
        scrollCardIntoView(store.card);
      }
    };

    const ensureMarker = (store) => {
      if (!Number.isFinite(store.lat) || !Number.isFinite(store.lng)) return;
      store.marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: store.lat, lng: store.lng },
        title: store.name,
        content: createDefaultContent(),
        gmpClickable: true,
      });
      store.marker.addEventListener('gmp-click', () => {
        setActiveStore(store, { scrollToCard: true });
      });
    };

    const geocodeStore = (store) =>
      new Promise((resolve) => {
        if (Number.isFinite(store.lat) && Number.isFinite(store.lng)) {
          ensureMarker(store);
          resolve();
          return;
        }
        if (!store.address) {
          resolve();
          return;
        }
        geocoder.geocode({ address: store.address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            store.lat = location.lat();
            store.lng = location.lng();
            ensureMarker(store);
          }
          resolve(); 
        });
      });

    const parseTypes = (value) => {
      const raw = String(value || '').trim();
      if (!raw) return [];
      if (raw.startsWith('[')) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((entry) => String(entry).trim().toLowerCase()).filter(Boolean);
          }
        } catch (error) {
          return [];
        }
      }
      return raw
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);
    };

    const matchesType = (store, selectedType) => {
      const normalizedType = String(selectedType || 'all').trim().toLowerCase();
      if (normalizedType === 'all') return true;
      const types = parseTypes(store.type);
      return types.includes(normalizedType);
    };

    const updateEmptyState = () => {
      if (!emptyState) return;
      const hasVisible = cards.some((card) => card.style.display !== 'none');
      emptyState.hidden = hasVisible;
    };

    const setClosestStoreActive = (origin, radiusData, selectedType) => {
      if (!origin) return;
      let closestStore = null;
      let closestDistance = Infinity;
      stores.forEach((store) => {
        if (!matchesType(store, selectedType)) return;
        if (!Number.isFinite(store.lat) || !Number.isFinite(store.lng)) return;
        const miles = haversineMiles(origin.lat, origin.lng, store.lat, store.lng);
        const withinRadius =
          radiusData.radius === 0 ||
          miles <= (radiusData.unit === 'km' ? radiusData.radius / 1.60934 : radiusData.radius);
        if (!withinRadius) return;
        if (miles < closestDistance) {
          closestDistance = miles;
          closestStore = store;
        }
      });
      if (closestStore) {
        setActiveStore(closestStore, { scrollToCard: true });
      }
    };

    const updateListVisibility = (radiusData, filterOrigin, distanceOrigin, selectedType) => {
      const { radius, unit } = radiusData;
      stores.forEach((store) => {
        const distanceEl = store.card.querySelector('[data-stockist-distance]');
        const matchesSelectedType = matchesType(store, selectedType);
        if (store.marker) store.marker.map = matchesSelectedType ? map : null;
        if (!matchesSelectedType) {
          store.card.style.display = 'none';
          return;
        }
        if (!Number.isFinite(store.lat) || !Number.isFinite(store.lng)) {
          store.card.style.display = 'none';
          return;
        }
        const filterMiles = haversineMiles(
          filterOrigin.lat,
          filterOrigin.lng,
          store.lat,
          store.lng
        );
        const distanceMiles = distanceOrigin
          ? haversineMiles(distanceOrigin.lat, distanceOrigin.lng, store.lat, store.lng)
          : filterMiles;
        const withinRadius = radius === 0 || filterMiles <= (unit === 'km' ? radius / 1.60934 : radius);
        store.card.style.display = withinRadius ? 'flex' : 'none';
        if (distanceEl) distanceEl.textContent = formatDistance(distanceMiles, unit);
      });
      updateEmptyState();
    };

    const applyTypeOnly = (selectedType) => {
      stores.forEach((store) => {
        const isVisible = matchesType(store, selectedType);
        store.card.style.display = isVisible ? 'flex' : 'none';
        if (store.marker) store.marker.map = isVisible ? map : null;
      });
      updateEmptyState();
    };

    const updateDistancesEmpty = () => {
      stores.forEach((store) => {
        const distanceEl = store.card.querySelector('[data-stockist-distance]');
        if (distanceEl) distanceEl.textContent = 'Distance: —';
      });
    };

    const updateDistancesOnly = (origin, unit = 'mi') => {
      stores.forEach((store) => {
        const distanceEl = store.card.querySelector('[data-stockist-distance]');
        if (!distanceEl) return;
        if (!Number.isFinite(store.lat) || !Number.isFinite(store.lng)) {
          distanceEl.textContent = 'Distance: —';
          return;
        }
        const miles = haversineMiles(origin.lat, origin.lng, store.lat, store.lng);
        distanceEl.textContent = formatDistance(miles, unit);
      });
    };

    const fitMapToStores = () => {
      const bounds = new google.maps.LatLngBounds();
      let hasBounds = false;
      stores.forEach((store) => {
        if (!Number.isFinite(store.lat) || !Number.isFinite(store.lng)) return;
        bounds.extend({ lat: store.lat, lng: store.lng });
        hasBounds = true;
      });
      if (hasBounds) {
        map.fitBounds(bounds);
      }
    };

    const initMarkers = async () => {
      for (const store of stores) {
        await geocodeStore(store);
      }
      const firstWithMarker = stores.find((store) => store.marker);
      if (firstWithMarker) {
        map.setCenter({ lat: firstWithMarker.lat, lng: firstWithMarker.lng });
        map.setZoom(9);
      }
    };

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const store = stores.find((item) => item.card === card);
        if (store) setActiveStore(store);
      });
    });

    let hasSearch = false;
    let filterOrigin = null;

    const getSelectedType = () => {
      if (!typeSelect) return 'all';
      return typeSelect.value || 'all';
    };

    const applyFilters = () => {
      const selectedType = getSelectedType();
      if (filterOrigin) {
        const radiusData = parseRadius(radiusSelect.value);
        updateListVisibility(radiusData, filterOrigin, filterOrigin, selectedType);
        setClosestStoreActive(filterOrigin, radiusData, selectedType);
        return;
      }
      applyTypeOnly(selectedType);
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      hasSearch = true;
      const addressInput = form.querySelector('input');
      const address = addressInput.value.trim();
      if (!address) return;
      const radiusData = parseRadius(radiusSelect.value);
      geocoder.geocode({ address }, (results, status) => {
        if (status !== 'OK' || !results[0]) return;
        const location = results[0].geometry.location;
        const origin = { lat: location.lat(), lng: location.lng() };
        filterOrigin = origin;
        const radiusMiles = radiusData.unit === 'km' ? radiusData.radius / 1.60934 : radiusData.radius;
        const radiusMeters = radiusMiles * 1609.34;
        if (!searchCircle) {
          searchCircle = new google.maps.Circle({
            map,
            center: origin,
            radius: radiusMeters,
            fillColor: '#f0c000',
            fillOpacity: 0.08,
            strokeColor: '#f0c000',
            strokeOpacity: 0.5,
            strokeWeight: 1,
          });
        } else {
          searchCircle.setCenter(origin);
          searchCircle.setRadius(radiusMeters);
        }
        map.fitBounds(searchCircle.getBounds());
        const selectedType = getSelectedType();
        updateListVisibility(radiusData, origin, origin, selectedType);
        setClosestStoreActive(origin, radiusData, selectedType);
      });
    });

    if (typeSelect) {
      typeSelect.addEventListener('change', () => {
        applyFilters();
      });
    }

    radiusSelect.addEventListener('change', () => {
      applyFilters();
      if (filterOrigin) {
        updateDistancesOnly(filterOrigin, parseRadius(radiusSelect.value).unit);
      }
    });

    const resetSearch = () => {
      const addressInput = form.querySelector('input');
      if (addressInput) addressInput.value = '';
      radiusSelect.value = '10-km';
      if (typeSelect) typeSelect.value = 'all';
      hasSearch = false;
      filterOrigin = null;
      if (searchCircle) {
        searchCircle.setMap(null);
        searchCircle = null;
      }
      stores.forEach((item) => {
        item.card.classList.remove('is-active');
        const cta = item.card.querySelector('.custom-stockist-locator__cta');
        if (cta) {
          cta.classList.remove('custom-button--secondary');
          cta.classList.add('custom-button--primary');
        }
        if (item.marker) item.marker.content = createDefaultContent();
      });
      updateDistancesEmpty();
      applyTypeOnly('all');
      fitMapToStores();
    };

    resetBtn.addEventListener('click', resetSearch);

    updateDistancesEmpty();
    let pendingOrigin = null;
    const markersReady = initMarkers().then(() => {
      if (pendingOrigin) {
        filterOrigin = pendingOrigin;
        updateListVisibility(
          parseRadius(radiusSelect.value),
          pendingOrigin,
          pendingOrigin,
          getSelectedType()
        );
        return;
      }
      stores.forEach((store) => {
        store.card.style.display = 'flex';
        if (store.marker) store.marker.map = map;
      });
      applyTypeOnly(getSelectedType());
      if (!hasSearch) {
        fitMapToStores();
      }
    });

    pendingOrigin = null;
    updateEmptyState();
  };

  const initAll = (root = document) => {
    root.querySelectorAll('.custom-stockist-locator').forEach(initSection);
  };

  const waitForMaps = () => {
    if (window.google && window.google.maps && window.google.maps.marker) {
      initAll();
      return;
    }
    setTimeout(waitForMaps, 200);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForMaps);
  } else {
    waitForMaps();
  }

  document.addEventListener('shopify:section:load', (event) => {
    if (window.google && window.google.maps) {
      initAll(event.target);
    }
  });
})();
