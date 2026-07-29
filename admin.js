/* ==========================================================
   JN ÉVÉNEMENT — Moteur de données (window.JN) connecté à VOTRE VPS
   Alimente : menus.html, menu.html, realisations.html, l'estimateur
   de budget sur index.html, et le panneau admin (double-clic logo).
   ========================================================== */
(function () {

  // ---- Configuration API VPS ---------------------------------------------
  // ⚠️ Remplace par ton nom de domaine une fois que tu l'auras (ex: https://api.tondomaine.com)
  const API_BASE = 'https://api.jennifer-evenement.com';

  const SIGNATURE_JN_B64 = 'data:image/jpeg;base64,/9j/4QDKRXhpZgAATU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAITAAMAAAABAAEAAIdpAAQAAAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAeQAAAHAAAABDAyMjGRAQAHAAAABAECAwCgAAAHAAAABDAxMDCgAQADAAAAAQABAACgAgAEAAAAAQAAA22gAwAEAAAAAQAAAX+kBgADAAAAAQAAAAAAAAAAAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYYXBwbAQAAABtbnRyUkdCIFhZWiAH5gABAAEAAAAAAABhY3NwQVBQTAAAAABBUFBMAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWFwcGwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAADBjcHJ0AAABLAAAAFB3dHB0AAABfAAAABRyWFlaAAABkAAAABRnWFlaAAABpAAAABRiWFlaAAABuAAAABRyVFJDAAABzAAAACBjaGFkAAAB7AAAACxiVFJDAAABzAAAACBnVFJDAAABzAAAACBtbHVjAAAAAAAAAAEAAAAMZW5VUwAAABQAAAAcAEQAaQBzAHAAbABhAHkAIABQADNtbHVjAAAAAAAAAAEAAAAMZW5VUwAAADQAAAAcAEMAbwBwAHkAcgBpAGcAaAB0ACAAQQBwAHAAbABlACAASQBuAGMALgAsACAAMgAwADIAMlhZWiAAAAAAAAD21QABAAAAANMsWFlaIAAAAAAAAIPfAAA9v////7tYWVogAAAAAAAASr8AALE3AAAKuVhZWiAAAAAAAAAoOAAAEQsAAMi5cGFyYQAAAAAAAwAAAAJmZgAA8qcAAA1ZAAAT0AAACltzZjMyAAAAAAABDEIAAAXe///zJgAAB5MAAP2Q///7ov///aMAAAPcAADAbv/bAIQAAQEBAQEBAgEBAgMCAgIDBAMDAwMEBQQEBAQEBQYFBQUFBQUGBgYGBgYGBgcHBwcHBwgICAgICQkJCQkJCQkJCQEBAQECAgIEAgIECQYFBgkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJ/90ABAA3/8AAEQgBfwNtAwEiAAIRAQMRAf/EAaIAAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKCxAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6AQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgsRAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/vgoooroOgKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//0P74KKKK6DoCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9H++Ciiiug6AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//S/vgoooroOgKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//0/74KKKK6DoCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9T++Ciiiug6AooooAKKKKACvym/bw/4LT/8E8v+Cb/jvSvhZ+034zaz8SarElz/AGZp9pNfXEFq5KrPcrEMRIdpwCd56hCOa/Vmv8ev/g488e3HxA/4LL/GiY3n22HSL+00qA79+xLWzgDRf8Ak3rj1qW7ESlY/1wvgv8Z/hb+0V8K9B+N/wU1q28R+FfE1ml7pupWhzDPC/wBdrKynKOjgOjgqwDKQPUq/n5/4NfPA934P/wCCLnwovLu5kuf7dl1fUlWT/lgr6jcRLHH/ALP7nf8A8Cr+gaqKQUUUUDCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9X++Ciiiug6AooooAKKKKACv8KP9qv4zT/tHftPfEX9oSeD7MfHPibVdf8AIzu8oajdy3KxZ/2A+38K/wBnv/gph8X4fgH/AME9/jR8Wjc/Y5tH8Gaw1tL/AHbqW0kitf8AyM8df41X7EXwi/4X3+2L8LvgzNbfbIfEninSrG4gX+O3luo/O/8AIW6onsZTP9n79gb4D/8ADL/7EXwm/Z2mSBbnwb4R0fSrz7N/q3vLa0jW7lX/AK6z75D7tX1xUVvH9nhSGH7iLtqWrNLBRRRQMKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoor+Uz/goL/wda/syfsK/th3/wCydpXw91Xx5H4VvFsPFGs2d9DaR2dxx50VpA8Un2t4M4k3yW6+YNm7vQJn9WdFeYfBb4t+Cvj58JPDHxw+GVz9s8PeMNKtNZ02dl2F7W8iSeFiv8J2OMivT6BhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFfh1/wAF6f8AgrXef8Ekf2TNN+JHgPS7LXfHfjDVF0bQbG+c+TF5cTz3N9KibXkit0CJsVh+8mjz8mabVieY/cWiv4zf+Ddf/g4c/aP/AOCiv7SGr/sjftfWeivrE+k3WtaNq+nxfYWl+yPEstk1vuKOfLdpUKc7Y5N3t/ZlSGgooooGFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//1v74KKKK6DoCiiigAooooA/nc/4Ol/jGfhP/AMEbvH+mwTKk3i+80zQUVv41nuUll2/8AiJ/Cv4MP+DZ34TRfFr/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KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9P++Ciiiug6AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//U/vgoooroOgKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//1f74KKKK6DoCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9b++Ciiiug6AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//Z';


  let menusCache = [];
  const expandedMenuItems = new Set();
  let photosCache = [];
  let testimonialsCache = [];
  let settingsCache = null;
  let authToken = localStorage.getItem('jn_admin_token') || null;

  function fireUpdated(kind) {
    document.dispatchEvent(new CustomEvent('jn:' + kind + '-updated'));
  }

  function authHeaders(extra) {
    const h = Object.assign({}, extra || {});
    if (authToken) h['Authorization'] = 'Bearer ' + authToken;
    return h;
  }

  async function apiGet(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error('Erreur API ' + path);
    return res.json();
  }
  async function apiPost(path, body) {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data };
    return { data };
  }
  async function apiPut(path, body) {
    const res = await fetch(API_BASE + path, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data };
    return { data };
  }
  async function apiDelete(path) {
    const res = await fetch(API_BASE + path, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data };
    return { data };
  }

  // ---- MENUS --------------------------------------------------------------
  async function fetchMenus() {
    try {
      const data = await apiGet('/api/menus');
      menusCache = (data || []).map(rowToMenu).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      fireUpdated('menus');
    } catch (err) { console.error('Erreur chargement menus:', err); }
    return menusCache;
  }

  function rowToMenu(row) {
    return {
      id: row.id,
      title: row.title,
      tagline: row.tagline,
      description: row.description,
      pricePerPerson: row.price_per_person,
      minGuests: row.min_guests,
      includes: row.includes || [],
      items: row.items || [],
      imageUrl: row.image_url || '',
      sortOrder: row.sort_order || 0
    };
  }
  function menuToRow(m) {
    return {
      id: m.id,
      title: m.title,
      tagline: m.tagline,
      description: m.description,
      price_per_person: m.pricePerPerson,
      min_guests: m.minGuests,
      includes: m.includes || [],
      items: m.items || [],
      image_url: m.imageUrl || '',
      sort_order: m.sortOrder || 0
    };
  }

  // ---- SETTINGS -------------------------------------------------------------
  const DEFAULT_SETTINGS = {
    id: 'site',
    phone: '06 60 75 27 99',
    email: 'jenniferevenement@gmail.com',
    stat1_value: '150+',
    stat1_label: 'Événements réalisés',
    stat2_value: '2500+',
    stat2_label: 'Convives servis',
    stat3_value: '5.0★',
    stat3_label: 'Note moyenne clients'
  };

  async function fetchSettings() {
    try {
      settingsCache = await apiGet('/api/settings');
      fireUpdated('settings');
    } catch (err) { console.error('Erreur chargement réglages:', err); settingsCache = settingsCache || DEFAULT_SETTINGS; }
    return settingsCache;
  }

  async function saveSettings(newSettings) {
    const { error } = await apiPut('/api/settings', newSettings);
    if (!error) { settingsCache = Object.assign({ id: 'site' }, newSettings); fireUpdated('settings'); }
    return error;
  }

  // ---- TESTIMONIALS ---------------------------------------------------------
  async function fetchTestimonials() {
    try {
      testimonialsCache = await apiGet('/api/testimonials');
      fireUpdated('testimonials');
    } catch (err) { console.error('Erreur chargement avis:', err); }
    return testimonialsCache;
  }

  // ---- PHOTOS -----------------------------------------------------------
  async function fetchPhotos() {
    try {
      photosCache = await apiGet('/api/photos');
      fireUpdated('photos');
    } catch (err) { console.error('Erreur chargement photos:', err); }
    return photosCache;
  }

  // ---- API publique (utilisée par menus.html, menu.html, index.html) ----
  window.JN = {
    getMenus: function () { return menusCache; },
    getMenu: function (id) { return menusCache.find((m) => m.id === id) || null; },
    getPhotos: function () { return photosCache; },
    getTestimonials: function () { return testimonialsCache; },
    getSettings: function () { return settingsCache || DEFAULT_SETTINGS; },
    formatEuro: function (n) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
    },
    refreshMenus: fetchMenus,
    refreshPhotos: fetchPhotos,
    ready: null
  };

  window.JN.ready = Promise.all([fetchMenus(), fetchPhotos(), fetchTestimonials(), fetchSettings()])
    .catch((err) => { console.error('API VPS indisponible, le site fonctionne en mode dégradé.', err); });

  // ---- Barre de progression de lecture (haut de page) --------------------
  function initScrollProgress() {
    const bar = document.getElementById('jn-scroll-progress');
    if (!bar) return;
    function update() {
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // ---- Applique le téléphone, l'email et les statistiques partout -------
  function applyGlobalSettings() {
    const s = window.JN.getSettings();
    const phoneDigits = (s.phone || '').replace(/[^0-9+]/g, '');

    document.querySelectorAll('a[href^="tel:"]').forEach((a) => { a.setAttribute('href', 'tel:' + phoneDigits); });
    document.querySelectorAll('[data-jn-phone-text]').forEach((el) => { el.textContent = s.phone; });
    document.querySelectorAll('[data-jn-phone]').forEach((el) => { el.textContent = s.phone; });

    if (s.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach((a) => { a.setAttribute('href', 'mailto:' + s.email); });
      document.querySelectorAll('[data-jn-email-text]').forEach((el) => { el.textContent = s.email; });
    }

    const stat1 = document.getElementById('jn-stat-1');
    const stat2 = document.getElementById('jn-stat-2');
    const stat3 = document.getElementById('jn-stat-3');
    if (stat1) { stat1.querySelector('.jn-stat-value').textContent = s.stat1_value; stat1.querySelector('.jn-stat-label').textContent = s.stat1_label; }
    if (stat2) { stat2.querySelector('.jn-stat-value').textContent = s.stat2_value; stat2.querySelector('.jn-stat-label').textContent = s.stat2_label; }
    if (stat3) { stat3.querySelector('.jn-stat-value').textContent = s.stat3_value; stat3.querySelector('.jn-stat-label').textContent = s.stat3_label; }

    document.querySelectorAll('.jn-stats-marquee .jn-stat-value').forEach((el, i) => {
      const vals = [s.stat1_value, s.stat2_value, s.stat3_value];
      const labs = [s.stat1_label, s.stat2_label, s.stat3_label];
      el.textContent = vals[i % 3];
      const lab = el.parentElement.querySelector('.jn-stat-label');
      if (lab) lab.textContent = labs[i % 3];
    });

    document.dispatchEvent(new CustomEvent('jn:stats-ready'));
  }
  document.addEventListener('jn:settings-updated', applyGlobalSettings);
  document.addEventListener('DOMContentLoaded', function () {
    if (window.JN) window.JN.ready.then(applyGlobalSettings);
  });
  if (window.JN) window.JN.ready.then(applyGlobalSettings);

  // ---- Header qui réagit au scroll + parallax léger du hero -------------
  function initPremiumScrollFx() {
    const header = document.querySelector('header');
    const hero = document.querySelector('.hero');
    let ticking = false;
    function update() {
      const y = window.scrollY || window.pageYOffset || 0;
      if (header) header.classList.toggle('jn-scrolled', y > 30);
      if (hero) hero.style.transform = 'translateY(' + Math.min(y * 0.12, 60) + 'px)';
      ticking = false;
    }
    function onScroll() { if (!ticking) { requestAnimationFrame(update); ticking = true; } }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  // ---- Fleurs de mariage roses qui tombent en décor ----------------------
  function initFallingDaisies() {
    if (document.getElementById('jn-daisy-layer')) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const style = document.createElement('style');
    style.id = 'jn-daisy-style';
    style.textContent = `
      #jn-daisy-layer{ position:absolute; top:0; left:0; width:100%; pointer-events:none; z-index:5; overflow:hidden; }
      .jn-daisy{ position:absolute; top:0; left:0; will-change:transform; }
    `;
    document.head.appendChild(style);

    const layer = document.createElement('div');
    layer.id = 'jn-daisy-layer';
    document.body.appendChild(layer);

    const daisySvg = `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="#E8A0B4" stroke="#D67A93" stroke-width="0.6">
        <ellipse cx="20" cy="8" rx="5.5" ry="8.5"/>
        <ellipse cx="20" cy="32" rx="5.5" ry="8.5"/>
        <ellipse cx="8" cy="20" rx="8.5" ry="5.5"/>
        <ellipse cx="32" cy="20" rx="8.5" ry="5.5"/>
        <ellipse cx="10.5" cy="10.5" rx="5.5" ry="8.5" transform="rotate(45 10.5 10.5)"/>
        <ellipse cx="29.5" cy="29.5" rx="5.5" ry="8.5" transform="rotate(45 29.5 29.5)"/>
        <ellipse cx="10.5" cy="29.5" rx="5.5" ry="8.5" transform="rotate(-45 10.5 29.5)"/>
        <ellipse cx="29.5" cy="10.5" rx="5.5" ry="8.5" transform="rotate(-45 29.5 10.5)"/>
      </g>
      <g fill="#F3C6D3" opacity="0.9">
        <ellipse cx="20" cy="8" rx="3" ry="5"/>
        <ellipse cx="20" cy="32" rx="3" ry="5"/>
        <ellipse cx="8" cy="20" rx="5" ry="3"/>
        <ellipse cx="32" cy="20" rx="5" ry="3"/>
      </g>
      <circle cx="20" cy="20" r="6.5" fill="#C9974E"/>
      <circle cx="20" cy="20" r="6.5" fill="none" stroke="#B14F6E" stroke-width="0.5"/>
    </svg>`;
    const daisyUrl = 'url("data:image/svg+xml,' + encodeURIComponent(daisySvg) + '")';

    const isMobile = window.innerWidth < 700;
    const COUNT = isMobile ? 40 : 75;
    const flowers = [];

    function pageHeight() {
      return Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        window.innerHeight
      );
    }
    function resizeLayer() { layer.style.height = pageHeight() + 'px'; }

    function makeFlower() {
      const size = (isMobile ? 12 : 14) + Math.random() * (isMobile ? 12 : 18);
      const el = document.createElement('div');
      el.className = 'jn-daisy';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.backgroundImage = daisyUrl;
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.opacity = (0.55 + Math.random() * 0.4).toFixed(2);
      layer.appendChild(el);
      return {
        el,
        x: Math.random() * 100,
        y: Math.random() * -pageHeight(),
        speed: 0.3 + Math.random() * 0.6,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 0.6,
        swayAmp: 15 + Math.random() * 25,
        swaySpeed: 0.0006 + Math.random() * 0.0008,
        swayOffset: Math.random() * 1000
      };
    }
    for (let i = 0; i < COUNT; i++) flowers.push(makeFlower());

    let lastResize = 0;
    function loop(t) {
      if (t - lastResize > 500) { resizeLayer(); lastResize = t; }
      const maxY = pageHeight();
      flowers.forEach((f) => {
        f.y += f.speed;
        f.rot += f.rotSpeed;
        if (f.y > maxY + 40) { f.y = -40; f.x = Math.random() * 100; }
        const sway = Math.sin(t * f.swaySpeed + f.swayOffset) * f.swayAmp;
        f.el.style.transform = 'translate(' + sway + 'px,' + f.y + 'px) rotate(' + f.rot + 'deg)';
        f.el.style.left = f.x + '%';
      });
      requestAnimationFrame(loop);
    }
    resizeLayer();
    requestAnimationFrame(loop);
    window.addEventListener('resize', resizeLayer);
    window.addEventListener('load', resizeLayer);
    if ('MutationObserver' in window) new MutationObserver(resizeLayer).observe(document.body, { childList: true, subtree: true });
  }

  // ---- Espace admin : double-clic sur le logo ----------------------------
  function buildLoginModal() {
    if (document.getElementById('jn-admin-modal')) return document.getElementById('jn-admin-modal');

    const style = document.createElement('style');
    style.textContent = `
      #jn-admin-modal{ position:fixed; inset:0; height:100vh; height:100dvh; z-index:10000; background:rgba(33,20,26,0.55); display:none; align-items:center; justify-content:center; padding:20px; overflow-y:auto; }
      #jn-admin-modal.open{ display:flex; }
      #jn-admin-box{ background:#fff; border-radius:20px; padding:36px; max-width:360px; width:100%; max-height:90vh; max-height:90dvh; overflow-y:auto; box-shadow:0 30px 60px -20px rgba(74,32,50,0.4); font-family:var(--font-body, sans-serif); margin:auto; }
      #jn-admin-box h3{ font-family:var(--font-display, serif); color:var(--text, #4A2032); margin-bottom:6px; font-size:1.3rem; }
      #jn-admin-box p{ color:var(--text-muted, #8C5D6B); font-size:0.85rem; margin-bottom:18px; }
      #jn-admin-box input{ width:100%; padding:12px 14px; border:1px solid var(--border, #ddd); border-radius:10px; font-size:0.95rem; margin-bottom:12px; }
      #jn-admin-box .jn-admin-actions{ display:flex; gap:10px; }
      #jn-admin-box button{ flex:1; padding:11px; border-radius:10px; border:none; font-weight:600; cursor:pointer; font-size:0.9rem; }
      #jn-admin-submit{ background:var(--accent, #D67A93); color:#fff; }
      #jn-admin-cancel{ background:#F1E9E4; color:var(--text, #4A2032); }
      #jn-admin-error{ color:#B14F6E; font-size:0.8rem; margin:-6px 0 12px; display:none; }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.id = 'jn-admin-modal';
    modal.innerHTML = `
      <div id="jn-admin-box">
        <h3>Espace administrateur</h3>
        <p>Connexion réservée. Entrez votre mot de passe pour continuer.</p>
        <input type="password" id="jn-admin-pass" placeholder="Mot de passe" autocomplete="off">
        <div id="jn-admin-error">Identifiants incorrects.</div>
        <div class="jn-admin-actions">
          <button id="jn-admin-cancel" type="button">Annuler</button>
          <button id="jn-admin-submit" type="button">Se connecter</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    let openedAt = 0;
    function close() {
      modal.classList.remove('open');
      document.getElementById('jn-admin-pass').value = '';
      document.getElementById('jn-admin-error').style.display = 'none';
      if (window.jcUnlockPageScroll) window.jcUnlockPageScroll();
    }
    modal.addEventListener('click', (e) => {
      // Ignore le clic "fantôme" que les navigateurs mobiles émettent juste
      // après un tap tactile — sinon le 2e tap du double-tap qui ouvre ce
      // panneau finit par le refermer instantanément (bug du flash).
      if (Date.now() - openedAt < 500) return;
      if (e.target === modal) close();
    });
    modal.__markOpened = function () { openedAt = Date.now(); };
    document.getElementById('jn-admin-cancel').addEventListener('click', () => { close(); if (window.jcUnlockPageScroll) window.jcUnlockPageScroll(); });

    async function attemptLogin() {
      const val = document.getElementById('jn-admin-pass').value;
      const btn = document.getElementById('jn-admin-submit');
      btn.disabled = true; btn.textContent = 'Connexion…';
      try {
        const res = await fetch(API_BASE + '/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: val })
        });
        const data = await res.json();
        btn.disabled = false; btn.textContent = 'Se connecter';
        if (!res.ok) {
          document.getElementById('jn-admin-error').style.display = 'block';
        } else {
          authToken = data.token;
          localStorage.setItem('jn_admin_token', authToken);
          // Sur iPhone, si on ouvre le panneau admin pendant que le clavier
          // virtuel se referme, Safari n'a pas fini de recalculer la hauteur
          // de l'écran et le panneau s'affiche mal cadré. On force la
          // fermeture du clavier et on laisse un court instant à l'écran
          // pour se stabiliser avant d'ouvrir le panneau.
          document.getElementById('jn-admin-pass').blur();
          close();
          window.scrollTo(0, 0);
          setTimeout(openAdminDashboard, 350);
        }
      } catch (err) {
        btn.disabled = false; btn.textContent = 'Se connecter';
        document.getElementById('jn-admin-error').textContent = 'Connexion au serveur impossible.';
        document.getElementById('jn-admin-error').style.display = 'block';
      }
    }
    document.getElementById('jn-admin-submit').addEventListener('click', attemptLogin);
    document.getElementById('jn-admin-pass').addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });
    return modal;
  }

  function openAdminDashboard() {
    let dash = document.getElementById('jn-admin-dash');
    if (window.jcLockPageScroll) window.jcLockPageScroll();
    if (dash) { dash.classList.add('open'); dash.scrollTop = 0; renderAdminMenuList(); renderAdminPhotoList(); renderAdminAvisList(); renderAdminCalc(); return; }

    const style = document.createElement('style');
    style.textContent = `
      #jn-admin-dash{ position:fixed; inset:0; height:100vh; height:100dvh; z-index:10001; background:var(--bg,#FDF4F3); display:none; align-items:flex-start; justify-content:center; padding:0; overflow-y:auto; -webkit-overflow-scrolling:touch; }
      #jn-admin-dash.open{ display:flex; }
      #jn-admin-panel{ background:transparent; padding:0 0 40px; max-width:920px; width:100%; min-height:100vh; box-sizing:border-box; font-family:var(--font-body, sans-serif); }
      @media (min-width:700px){ #jn-admin-panel{ padding:0 0 60px; } }

      #jn-admin-panel .jn-admin-topbar{ display:flex; justify-content:space-between; align-items:center; gap:12px; position:sticky; top:0; background:rgba(253,244,243,0.92); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px 18px; z-index:5; border-bottom:1px solid var(--border,#eee); }
      @media (min-width:700px){ #jn-admin-panel .jn-admin-topbar{ padding:22px 32px; } }
      #jn-admin-panel .jn-admin-topbar h2{ font-family:var(--font-display, serif); color:var(--text, #4A2032); font-size:1.3rem; line-height:1.15; margin:0 0 2px; }
      @media (min-width:700px){ #jn-admin-panel .jn-admin-topbar h2{ font-size:1.6rem; } }
      #jn-admin-panel .jn-admin-sub{ color:var(--text-muted,#8C5D6B); font-size:0.78rem; margin:0; }
      #jn-admin-panel .jn-admin-topbar-actions{ display:flex; gap:8px; flex-shrink:0; }
      #jn-admin-close, #jn-admin-logout{ background:#fff; border:1px solid var(--border,#eee); padding:9px 12px; border-radius:var(--radius-sm,10px); cursor:pointer; font-size:0.78rem; font-weight:600; color:var(--text,#4A2032); box-shadow:0 1px 2px rgba(74,32,50,0.06); transition:background .15s, transform .1s; white-space:nowrap; }
      #jn-admin-close:active, #jn-admin-logout:active{ transform:scale(0.96); }
      #jn-admin-logout:hover{ background:#F6DADA; color:#8B2E2E; }
      #jn-admin-close:hover{ background:var(--bg-alt,#F9E1E4); }

      #jn-admin-content{ padding:18px; }
      @media (min-width:700px){ #jn-admin-content{ padding:28px 32px; } }

      .jn-admin-tabs{ display:flex; gap:6px; margin:2px 0 18px; padding-bottom:2px; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
      .jn-admin-tabs::-webkit-scrollbar{ display:none; }
      .jn-admin-tab{ flex-shrink:0; white-space:nowrap; padding:9px 16px; cursor:pointer; font-weight:600; font-size:0.82rem; color:var(--text-muted,#8C5D6B); border-radius:999px; background:#fff; border:1px solid var(--border,#eee); transition:background .15s, color .15s, border-color .15s; }
      .jn-admin-tab.active{ color:#fff; background:var(--accent,#D67A93); border-color:var(--accent,#D67A93); box-shadow:0 4px 10px -4px rgba(214,122,147,0.6); }
      .jn-admin-tabpanel{ display:none; animation:jnFadeIn .2s ease; }
      .jn-admin-tabpanel.active{ display:block; }
      @keyframes jnFadeIn{ from{ opacity:0; transform:translateY(4px); } to{ opacity:1; transform:none; } }

      .jn-admin-menu-card{ background:#fff; border:1px solid var(--border,#eee); border-radius:var(--radius-md,16px); padding:16px; margin-bottom:14px; box-shadow:0 2px 10px -6px rgba(74,32,50,0.12); }
      .jn-admin-menu-order-bar{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }
      .jn-menu-move-up{ background:var(--bg,#FBF3F1); border:1px solid var(--border,#eee); border-radius:8px; width:32px; height:32px; font-size:0.9rem; cursor:pointer; color:var(--text,#4A2032); transition:background .15s; }
      .jn-menu-move-up:hover:not(:disabled){ background:var(--accent,#D67A93); color:#fff; }
      .jn-menu-move-up:disabled{ opacity:0.35; cursor:default; }
      .jn-menu-move-down{ background:var(--bg,#FBF3F1); border:1px solid var(--border,#eee); border-radius:8px; width:32px; height:32px; font-size:0.9rem; cursor:pointer; color:var(--text,#4A2032); transition:background .15s; }
      .jn-menu-move-down:hover:not(:disabled){ background:var(--accent,#D67A93); color:#fff; }
      .jn-menu-move-down:disabled{ opacity:0.35; cursor:default; }
      .jn-menu-position{ font-size:0.76rem; font-weight:600; color:var(--text-muted,#8C5D6B); text-transform:uppercase; letter-spacing:0.4px; }
      .jn-admin-items-toggle{ display:block; width:100%; text-align:left; background:var(--bg,#FBF3F1); border:1px solid var(--border,#eee); border-radius:10px; padding:10px 12px; font-family:var(--font-mono); font-size:0.76rem; text-transform:uppercase; letter-spacing:0.4px; margin:10px 0 0; cursor:pointer; color:var(--text,#4A2032); }
      .jn-admin-items-body{ margin-top:8px; }
      @media (min-width:700px){ .jn-admin-menu-card{ padding:20px 22px; } }
      .jn-admin-menu-card .jn-row{ display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
      .jn-admin-menu-card .jn-row:last-child{ margin-bottom:0; }
      .jn-admin-menu-card label{ font-size:0.68rem; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted,#8C5D6B); display:block; margin-bottom:5px; font-weight:600; }
      .jn-admin-menu-card input, .jn-admin-menu-card textarea, .jn-admin-menu-card select{ width:100%; max-width:100%; box-sizing:border-box; padding:11px 12px; border:1.5px solid var(--border,#ddd); border-radius:var(--radius-sm,10px); font-size:0.92rem; font-family:inherit; background:#fff; color:var(--text,#4A2032); transition:border-color .15s, box-shadow .15s; -webkit-appearance:none; appearance:none; }
      .jn-admin-menu-card select{ background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path d='M0 0l5 6 5-6z' fill='%238C5D6B'/></svg>"); background-repeat:no-repeat; background-position:right 12px center; padding-right:30px; }
      .jn-admin-menu-card input:focus, .jn-admin-menu-card textarea:focus, .jn-admin-menu-card select:focus{ outline:none; border-color:var(--accent,#D67A93); box-shadow:0 0 0 3px rgba(214,122,147,0.15); }
      .jn-admin-field{ flex:1; min-width:140px; box-sizing:border-box; max-width:100%; }
      .jn-admin-menu-actions{ display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; }
      .jn-admin-menu-actions button{ border:none; padding:10px 16px; border-radius:var(--radius-sm,10px); font-size:0.82rem; font-weight:600; cursor:pointer; transition:transform .1s, filter .15s; }
      .jn-admin-menu-actions button:active{ transform:scale(0.97); }
      .jn-admin-save{ background:var(--accent,#D67A93); color:#fff; }
      .jn-admin-save:hover{ filter:brightness(1.06); }
      .jn-admin-delete{ background:#F6DADA; color:#8B2E2E; }
      .jn-admin-delete:hover{ background:#F2C6C6; }
      #jn-admin-add-btn{ background:var(--text,#4A2032); color:#fff; border:none; padding:13px 20px; border-radius:var(--radius-sm,10px); font-weight:600; cursor:pointer; margin-top:6px; width:100%; font-size:0.9rem; transition:filter .15s, transform .1s; }
      #jn-admin-add-btn:hover{ filter:brightness(1.15); }
      #jn-admin-add-btn:active{ transform:scale(0.98); }
      @media (min-width:700px){ #jn-admin-add-btn{ width:auto; } }
      #jn-admin-saved-msg{ display:none; align-items:center; gap:8px; background:#E4F3E7; color:#2B6B3F; padding:11px 14px; border-radius:var(--radius-sm,10px); font-size:0.85rem; font-weight:600; margin-bottom:14px; }

      .jn-photo-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(110px,1fr)); gap:10px; margin-bottom:18px; }
      @media (min-width:700px){ .jn-photo-grid{ grid-template-columns:repeat(auto-fill, minmax(150px,1fr)); gap:14px; } }
      .jn-photo-card{ position:relative; border-radius:var(--radius-sm,12px); overflow:hidden; border:1px solid var(--border,#eee); aspect-ratio:1; box-shadow:0 2px 8px -4px rgba(74,32,50,0.15); }
      .jn-photo-card img{ width:100%; height:100%; object-fit:cover; display:block; }
      .jn-photo-card button{ position:absolute; top:6px; right:6px; background:rgba(139,46,46,0.85); color:#fff; border:none; width:26px; height:26px; border-radius:50%; cursor:pointer; font-size:0.8rem; backdrop-filter:blur(2px); }
      #jn-upload-zone{ border:2px dashed var(--border,#ddd); border-radius:var(--radius-md,16px); padding:28px 16px; text-align:center; color:var(--text-muted,#8C5D6B); cursor:pointer; background:#fff; font-size:0.88rem; transition:border-color .15s, background .15s; }
      #jn-upload-zone.dragover{ border-color:var(--accent,#D67A93); background:#FBF3F1; }

      /* Photo par menu */
      .jn-menu-photo{ position:relative; flex-shrink:0; width:96px; height:96px; border-radius:var(--radius-sm,10px); overflow:hidden; border:1.5px dashed var(--border,#ddd); background:var(--bg,#FBF3F1); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:border-color .15s; }
      .jn-menu-photo:hover{ border-color:var(--accent,#D67A93); }
      .jn-menu-photo img{ width:100%; height:100%; object-fit:cover; display:block; }
      .jn-menu-photo-placeholder{ font-size:0.68rem; line-height:1.4; color:var(--text-muted,#8C5D6B); text-align:center; padding:4px; }
      .jn-menu-photo-remove{ position:absolute; top:4px; right:4px; background:rgba(139,46,46,0.85); color:#fff; border:none; width:20px; height:20px; border-radius:50%; cursor:pointer; font-size:0.7rem; line-height:1; }
      .jn-menu-photo-loading{ display:none; position:absolute; inset:0; background:rgba(255,255,255,0.75); align-items:center; justify-content:center; font-size:0.75rem; color:var(--text-muted,#8C5D6B); }
      .jn-menu-photo.loading .jn-menu-photo-loading{ display:flex; }
      @media (max-width:600px){ .jn-menu-photo{ width:100%; height:150px; } }

      @media (max-width:600px){
        #jn-admin-dash{ overflow-x:hidden; }
        #jn-admin-panel{ overflow-x:hidden; max-width:100vw; box-sizing:border-box; }
        #jn-admin-content{ padding:14px 12px 90px; }
        .jn-admin-menu-card .jn-row{ flex-direction:column; gap:10px; }
        .jn-admin-field{ min-width:100%; }
        .jn-admin-menu-actions{ flex-direction:column; }
        .jn-admin-menu-actions button{ width:100%; min-height:44px; }
        #jn-admin-close, #jn-admin-logout{ min-height:38px; }
        #jn-calc-add-menu, #jn-calc-add-item, #jn-calc-add-custom{ width:100%; min-height:44px; margin-top:2px; }
        #jn-tab-calc .jn-row{ align-items:stretch !important; }
        #jn-tab-calc select, #jn-tab-calc input{ font-size:0.95rem; }
        .jn-admin-menu-card{ border-radius:14px; }
      }
    `;
    document.head.appendChild(style);

    dash = document.createElement('div');
    dash.id = 'jn-admin-dash';
    dash.innerHTML = `
      <div id="jn-admin-panel">
        <div class="jn-admin-topbar">
          <div>
            <h2>Espace admin</h2>
            <p class="jn-admin-sub">Synchronisé en direct sur tous vos appareils</p>
          </div>
          <div class="jn-admin-topbar-actions">
            <button id="jn-admin-logout" type="button">Déconnexion</button>
            <button id="jn-admin-close" type="button">Fermer ✕</button>
          </div>
        </div>
        <div id="jn-admin-content">
        <div id="jn-admin-saved-msg">✅ Modifications enregistrées.</div>
        <div class="jn-admin-tabs">
          <div class="jn-admin-tab active" data-tab="menus">🍽️ Menus</div>
          <div class="jn-admin-tab" data-tab="photos">📷 Photos</div>
          <div class="jn-admin-tab" data-tab="avis">💬 Avis</div>
          <div class="jn-admin-tab" data-tab="reglages">⚙️ Réglages</div>
          <div class="jn-admin-tab" data-tab="calc">🧮 Calculatrice</div>
        </div>
        <div class="jn-admin-tabpanel active" id="jn-tab-menus">
          <div id="jn-admin-menu-list"></div>
          <button id="jn-admin-add-btn" type="button">+ Ajouter un menu</button>
        </div>
        <div class="jn-admin-tabpanel" id="jn-tab-photos">
          <div id="jn-upload-zone">📷 Cliquez ou glissez une photo ici pour l'ajouter à la galerie "Réalisations"</div>
          <input type="file" id="jn-photo-input" accept="image/*" multiple style="display:none;">
          <div class="jn-photo-grid" id="jn-admin-photo-grid" style="margin-top:18px;"></div>
        </div>
        <div class="jn-admin-tabpanel" id="jn-tab-avis">
          <div id="jn-admin-avis-list"></div>
          <button id="jn-admin-add-avis-btn" type="button">+ Ajouter un avis</button>
        </div>
        <div class="jn-admin-tabpanel" id="jn-tab-reglages">
          <p style="color:var(--text-muted,#8C5D6B); font-size:0.9rem; margin-bottom:18px;">Ces informations sont utilisées automatiquement sur tout le site : numéro affiché/appelé partout, et chiffres clés affichés sur la page d'accueil.</p>
          <div class="jn-admin-menu-card">
            <div class="jn-row">
              <div class="jn-admin-field"><label>Numéro de téléphone</label><input type="text" id="jn-set-phone"></div>
              <div class="jn-admin-field"><label>Adresse email</label><input type="email" id="jn-set-email"></div>
            </div>
            <div class="jn-row">
              <div class="jn-admin-field"><label>Statistique 1 — valeur</label><input type="text" id="jn-set-s1v"></div>
              <div class="jn-admin-field"><label>Statistique 1 — libellé</label><input type="text" id="jn-set-s1l"></div>
            </div>
            <div class="jn-row">
              <div class="jn-admin-field"><label>Statistique 2 — valeur</label><input type="text" id="jn-set-s2v"></div>
              <div class="jn-admin-field"><label>Statistique 2 — libellé</label><input type="text" id="jn-set-s2l"></div>
            </div>
            <div class="jn-row">
              <div class="jn-admin-field"><label>Statistique 3 — valeur</label><input type="text" id="jn-set-s3v"></div>
              <div class="jn-admin-field"><label>Statistique 3 — libellé</label><input type="text" id="jn-set-s3l"></div>
            </div>
            <div class="jn-admin-menu-actions">
              <button class="jn-admin-save" type="button" id="jn-admin-save-settings">Enregistrer les réglages</button>
            </div>
          </div>
        </div>
        <div class="jn-admin-tabpanel" id="jn-tab-calc">
          <p class="jn-admin-sub" style="margin-bottom:16px;">Un client vous appelle et passe commande ? Composez sa commande ici en direct : choisissez ses menus, ajoutez les pièces ou demandes spéciales qu'il veut en plus, et le total se calcule tout seul. Vous pourrez ensuite télécharger le récapitulatif pour le lui envoyer.</p>

          <div class="jn-admin-menu-card">
            <div class="jn-row">
              <div class="jn-admin-field"><label>Nom du client</label><input type="text" id="jn-calc-client" placeholder="Ex : Mme Dupont"></div>
              <div class="jn-admin-field" style="max-width:160px;"><label>Nombre de personnes</label><input type="number" id="jn-calc-guests" min="1" value="10"></div>
              <div class="jn-admin-field" style="max-width:200px;"><label>Date de l'événement</label><input type="date" id="jn-calc-date"></div>
            </div>
          </div>

          <div class="jn-admin-menu-card">
            <label style="display:block; font-family:var(--font-mono); font-size:0.76rem; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:8px;">Ajouter un menu (prix / personne)</label>
            <div class="jn-row" style="align-items:flex-end;">
              <div class="jn-admin-field" style="flex:2;"><select id="jn-calc-menu-select"></select></div>
              <div class="jn-admin-field" style="max-width:140px;"><label>Personnes</label><input type="number" id="jn-calc-menu-guests" min="1" value="10"></div>
              <button id="jn-calc-add-menu" type="button" class="jn-admin-save" style="margin-bottom:1px;">+ Ajouter</button>
            </div>

            <label style="display:block; font-family:var(--font-mono); font-size:0.76rem; text-transform:uppercase; letter-spacing:0.4px; margin:18px 0 8px;">Ajouter une pièce / un article à la carte</label>
            <div class="jn-row" style="align-items:flex-end;">
              <div class="jn-admin-field" style="flex:2;"><select id="jn-calc-item-select"></select></div>
              <div class="jn-admin-field" style="max-width:110px;"><label>Quantité</label><input type="number" id="jn-calc-item-qty" min="1" value="1"></div>
              <button id="jn-calc-add-item" type="button" class="jn-admin-save" style="margin-bottom:1px;">+ Ajouter</button>
            </div>

            <label style="display:block; font-family:var(--font-mono); font-size:0.76rem; text-transform:uppercase; letter-spacing:0.4px; margin:18px 0 8px;">Ajouter une ligne libre (demande spéciale du client)</label>
            <div class="jn-row" style="align-items:flex-end;">
              <div class="jn-admin-field" style="flex:2;"><input type="text" id="jn-calc-custom-label" placeholder="Ex : Pièce montée supplémentaire"></div>
              <div class="jn-admin-field" style="max-width:110px;"><label>Prix unit. (€)</label><input type="number" step="0.01" id="jn-calc-custom-price" value="0"></div>
              <div class="jn-admin-field" style="max-width:100px;"><label>Quantité</label><input type="number" min="1" id="jn-calc-custom-qty" value="1"></div>
              <button id="jn-calc-add-custom" type="button" class="jn-admin-save" style="margin-bottom:1px;">+ Ajouter</button>
            </div>
          </div>

          <div id="jn-calc-lines"></div>

          <div class="jn-admin-menu-card" style="background:#FBF3F1;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:10px;">
              <div style="font-family:var(--font-mono); font-size:0.8rem; color:var(--text-muted,#8C5D6B);">Total pour <span id="jn-calc-total-guests">10</span> personne(s)</div>
              <div style="font-family:var(--font-display,serif); font-size:1.7rem; color:var(--text,#4A2032); font-weight:700;" id="jn-calc-total">0,00&nbsp;€</div>
            </div>
            <div style="font-size:0.82rem; color:var(--text-muted,#8C5D6B); margin-top:4px;" id="jn-calc-per-person"></div>
          </div>

          <div class="jn-admin-menu-card">
            <label style="display:flex; align-items:center; gap:8px; font-size:0.92rem; cursor:pointer;">
              <input type="checkbox" id="jn-calc-tva" style="width:18px; height:18px;">
              Appliquer la TVA (5,5%) sur ce devis
            </label>
            <p style="font-size:0.8rem; color:var(--text-muted,#8C5D6B); margin:8px 0 0;">Décochez si le devis doit rester en prix net (sans TVA). Un acompte de 30% sera automatiquement demandé à la signature du devis.</p>
          </div>

          <div class="jn-admin-menu-actions">
            <button id="jn-calc-reset" type="button" class="jn-admin-delete">Tout effacer</button>
            <button id="jn-calc-download" type="button" class="jn-admin-save">⬇ Télécharger le récapitulatif</button>
          </div>
        </div>
        </div>
      </div>`;
    document.body.appendChild(dash);
    // On affiche le panneau tout de suite, avant de construire le contenu.
    // Ainsi, si une erreur survient plus bas (ex: connexion serveur lente),
    // l'utilisateur reste sur l'écran admin au lieu d'être renvoyé
    // silencieusement à l'écran d'accueil.
    dash.classList.add('open');
    dash.scrollTop = 0;

    try {

    function closeDash() { dash.classList.remove('open'); if (window.jcUnlockPageScroll) window.jcUnlockPageScroll(); }
    dash.addEventListener('click', (e) => { if (e.target === dash) closeDash(); });
    document.getElementById('jn-admin-close').addEventListener('click', closeDash);
    document.getElementById('jn-admin-logout').addEventListener('click', async () => {
      try { await fetch(API_BASE + '/api/logout', { method: 'POST', headers: authHeaders() }); } catch (e) {}
      authToken = null;
      localStorage.removeItem('jn_admin_token');
      closeDash();
    });

    dash.querySelectorAll('.jn-admin-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        dash.querySelectorAll('.jn-admin-tab').forEach((t) => t.classList.remove('active'));
        dash.querySelectorAll('.jn-admin-tabpanel').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('jn-tab-' + tab.dataset.tab).classList.add('active');
      });
    });

    document.getElementById('jn-admin-add-btn').addEventListener('click', async () => {
      const newMenu = { id: 'menu-' + Date.now(), title: 'Nouveau menu', tagline: '', description: '', pricePerPerson: 20, minGuests: 10, includes: [], items: [], imageUrl: '', sortOrder: menusCache.length };
      const { error } = await apiPost('/api/menus', menuToRow(newMenu));
      if (error) { alert('Erreur lors de l\'ajout : ' + (error.error || '')); return; }
      await fetchMenus();
      renderAdminMenuList();
    });

    document.getElementById('jn-admin-add-avis-btn').addEventListener('click', async () => {
      const newAvis = { id: 'avis-' + Date.now(), author: 'Nouveau client', location: '', rating: 5, quote: 'Avis à modifier...', sort_order: testimonialsCache.length };
      const { error } = await apiPost('/api/testimonials', newAvis);
      if (error) { alert('Erreur lors de l\'ajout : ' + (error.error || '')); return; }
      await fetchTestimonials();
      renderAdminAvisList();
    });

    function fillSettingsForm() {
      const s = window.JN.getSettings();
      document.getElementById('jn-set-phone').value = s.phone || '';
      document.getElementById('jn-set-email').value = s.email || '';
      document.getElementById('jn-set-s1v').value = s.stat1_value || '';
      document.getElementById('jn-set-s1l').value = s.stat1_label || '';
      document.getElementById('jn-set-s2v').value = s.stat2_value || '';
      document.getElementById('jn-set-s2l').value = s.stat2_label || '';
      document.getElementById('jn-set-s3v').value = s.stat3_value || '';
      document.getElementById('jn-set-s3l').value = s.stat3_label || '';
    }
    fillSettingsForm();
    document.getElementById('jn-admin-save-settings').addEventListener('click', async () => {
      const error = await saveSettings({
        phone: document.getElementById('jn-set-phone').value,
        email: document.getElementById('jn-set-email').value,
        stat1_value: document.getElementById('jn-set-s1v').value,
        stat1_label: document.getElementById('jn-set-s1l').value,
        stat2_value: document.getElementById('jn-set-s2v').value,
        stat2_label: document.getElementById('jn-set-s2l').value,
        stat3_value: document.getElementById('jn-set-s3v').value,
        stat3_label: document.getElementById('jn-set-s3l').value
      });
      if (error) { alert('Erreur lors de l\'enregistrement : ' + (error.error || '')); return; }
      applyGlobalSettings();
      const msg = document.getElementById('jn-admin-saved-msg');
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 2000);
    });

    // Upload de photos
    const dropZone = document.getElementById('jn-upload-zone');
    const fileInput = document.getElementById('jn-photo-input');
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault(); dropZone.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    async function handleFiles(files) {
      for (const file of files) {
        const formData = new FormData();
        formData.append('photo', file);
        try {
          const res = await fetch(API_BASE + '/api/photos/upload', {
            method: 'POST',
            headers: authHeaders(),
            body: formData
          });
          const data = await res.json();
          if (!res.ok) { alert('Erreur upload : ' + (data.error || '')); continue; }
        } catch (err) { alert('Erreur upload : connexion au serveur impossible.'); continue; }
      }
      await fetchPhotos();
      renderAdminPhotoList();
    }

    // Calculatrice de commande
    document.getElementById('jn-calc-guests').addEventListener('input', renderAdminCalcTotals);

    document.getElementById('jn-calc-add-menu').addEventListener('click', () => {
      const sel = document.getElementById('jn-calc-menu-select');
      const menu = menusCache.find((m) => m.id === sel.value);
      if (!menu) { alert('Ajoutez d\'abord un menu depuis l\'onglet Menus.'); return; }
      const guestsForMenu = parseInt(document.getElementById('jn-calc-menu-guests').value, 10) || 1;
      const includedItems = (menu.items || []).map((it) => it.name);
      calcLines.push({ label: (menu.title || 'Menu') + ' (menu / pers.)', unitPrice: menu.pricePerPerson || 0, qty: guestsForMenu, includedItems: includedItems });
      const guestsMain = document.getElementById('jn-calc-guests');
      if (guestsMain && (!calcLines.length || calcLines.length === 1)) guestsMain.value = guestsForMenu;
      renderAdminCalcLines();
      renderAdminCalcTotals();
    });

    document.getElementById('jn-calc-add-item').addEventListener('click', () => {
      const sel = document.getElementById('jn-calc-item-select');
      if (!sel.value) { alert('Aucune pièce disponible : ajoutez des pièces à un menu depuis l\'onglet Menus.'); return; }
      const parts = sel.value.split('::');
      const menu = menusCache.find((m) => m.id === parts[0]);
      const item = menu && menu.items ? menu.items[parseInt(parts[1], 10)] : null;
      if (!item) return;
      const qty = parseInt(document.getElementById('jn-calc-item-qty').value, 10) || 1;
      calcLines.push({ label: item.name + (item.unit ? ' (' + item.unit + ')' : ''), unitPrice: item.price || 0, qty: qty });
      renderAdminCalcLines();
      renderAdminCalcTotals();
    });

    document.getElementById('jn-calc-add-custom').addEventListener('click', () => {
      const labelInput = document.getElementById('jn-calc-custom-label');
      const label = labelInput.value.trim();
      if (!label) { alert('Merci de renseigner un nom pour cette ligne.'); return; }
      const price = parseFloat(document.getElementById('jn-calc-custom-price').value) || 0;
      const qty = parseInt(document.getElementById('jn-calc-custom-qty').value, 10) || 1;
      calcLines.push({ label: label, unitPrice: price, qty: qty });
      labelInput.value = '';
      document.getElementById('jn-calc-custom-price').value = '0';
      document.getElementById('jn-calc-custom-qty').value = '1';
      renderAdminCalcLines();
      renderAdminCalcTotals();
    });

    document.getElementById('jn-calc-reset').addEventListener('click', () => {
      if (calcLines.length && !confirm('Effacer toute la commande en cours ?')) return;
      calcLines = [];
      document.getElementById('jn-calc-client').value = '';
      document.getElementById('jn-calc-date').value = '';
      document.getElementById('jn-calc-guests').value = 10;
      renderAdminCalcLines();
      renderAdminCalcTotals();
    });

    document.getElementById('jn-calc-download').addEventListener('click', downloadCalcRecap);

    renderAdminMenuList();
    renderAdminPhotoList();
    renderAdminAvisList();
    renderAdminCalc();

    } catch (err) {
      console.error('Erreur à l\'ouverture de l\'espace admin :', err);
      alert('Un souci est survenu pendant le chargement de l\'espace admin (connexion au serveur trop lente ou instable). Fermez et réessayez.');
    }
  }

  // ---- Calculatrice de commande (onglet admin) ---------------------------
  let calcLines = [];

  function calcLineTotal(line) {
    return (line.unitPrice || 0) * (line.qty || 0);
  }

  function renderAdminCalcSelectors() {
    const menuSelect = document.getElementById('jn-calc-menu-select');
    if (menuSelect) {
      menuSelect.innerHTML = menusCache.map((m) => `<option value="${m.id}">${(m.title || 'Menu')} — ${window.JN.formatEuro(m.pricePerPerson)} / pers.</option>`).join('') || '<option value="">Aucun menu — créez-en un dans l\'onglet Menus</option>';
    }
    const itemSelect = document.getElementById('jn-calc-item-select');
    if (itemSelect) {
      const opts = [];
      menusCache.forEach((m) => {
        (m.items || []).forEach((it, ii) => {
          opts.push(`<option value="${m.id}::${ii}">${m.title} — ${it.name} (${window.JN.formatEuro(it.price)}${it.unit ? ' / ' + it.unit : ''})</option>`);
        });
      });
      itemSelect.innerHTML = opts.join('') || '<option value="">Aucune pièce disponible</option>';
    }
  }

  function renderAdminCalcLines() {
    const wrap = document.getElementById('jn-calc-lines');
    if (!wrap) return;
    wrap.innerHTML = calcLines.map((l, i) => `
      <div class="jn-admin-menu-card" data-idx="${i}" style="padding:14px 16px; margin-bottom:10px;">
        <div class="jn-row" style="align-items:flex-end; margin-bottom:0;">
          <div class="jn-admin-field" style="flex:2;"><label>Article</label><input type="text" data-calc-field="label" value="${(l.label || '').replace(/"/g, '&quot;')}"></div>
          <div class="jn-admin-field" style="max-width:110px;"><label>Prix unit. (€)</label><input type="number" step="0.01" data-calc-field="unitPrice" value="${l.unitPrice}"></div>
          <div class="jn-admin-field" style="max-width:90px;"><label>Qté</label><input type="number" min="0" data-calc-field="qty" value="${l.qty}"></div>
          <div class="jn-admin-field jn-calc-line-sub" style="max-width:120px;"><label>Sous-total</label><div style="padding:9px 0; font-weight:700; color:var(--text,#4A2032);">${window.JN.formatEuro(calcLineTotal(l))}</div></div>
          <button class="jn-admin-item-delete" type="button" title="Supprimer" style="margin-bottom:9px;">✕</button>
        </div>
        ${(l.includedItems && l.includedItems.length) ? `<div style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--border,#eee); font-size:0.82rem; color:var(--text-muted,#8C5D6B);"><strong>Comprend :</strong> ${l.includedItems.map(n => n.replace(/</g, '&lt;')).join(', ')} <span style="opacity:0.7;">(sans détail de prix, affiché tel quel sur le devis client)</span></div>` : ''}
      </div>`).join('') || '<p style="color:var(--text-muted,#8C5D6B); font-size:0.9rem;">Aucun article ajouté pour le moment — utilisez les champs ci-dessus.</p>';

    wrap.querySelectorAll('.jn-admin-menu-card').forEach((card) => {
      const idx = parseInt(card.dataset.idx, 10);
      card.querySelectorAll('[data-calc-field]').forEach((f) => {
        f.addEventListener('input', () => {
          const field = f.dataset.calcField;
          calcLines[idx][field] = (field === 'unitPrice' || field === 'qty') ? (parseFloat(f.value) || 0) : f.value;
          const subEl = card.querySelector('.jn-calc-line-sub div');
          if (subEl) subEl.textContent = window.JN.formatEuro(calcLineTotal(calcLines[idx]));
          renderAdminCalcTotals();
        });
      });
      card.querySelector('.jn-admin-item-delete').addEventListener('click', () => {
        calcLines.splice(idx, 1);
        renderAdminCalcLines();
        renderAdminCalcTotals();
      });
    });
  }

  function renderAdminCalcTotals() {
    const guestsInput = document.getElementById('jn-calc-guests');
    const guests = guestsInput ? (parseInt(guestsInput.value, 10) || 0) : 0;
    const total = calcLines.reduce((sum, l) => sum + calcLineTotal(l), 0);
    const totalEl = document.getElementById('jn-calc-total');
    const guestsEl = document.getElementById('jn-calc-total-guests');
    const perPersonEl = document.getElementById('jn-calc-per-person');
    if (totalEl) totalEl.textContent = window.JN.formatEuro(total);
    if (guestsEl) guestsEl.textContent = guests || '—';
    if (perPersonEl) perPersonEl.textContent = guests > 0 ? ('Soit ' + window.JN.formatEuro(total / guests) + ' par personne') : '';
  }

  function renderAdminCalc() {
    renderAdminCalcSelectors();
    renderAdminCalcLines();
    renderAdminCalcTotals();
  }

  // Génération du PDF en texte réel via jsPDF (plus de capture d'écran / html2canvas :
  // c'était la cause des pages blanches, car cette technique dépend du rendu visuel du
  // navigateur au moment de la capture, ce qui est fragile). Ici, chaque ligne, chiffre
  // et image est dessiné directement dans le PDF, donc rien ne peut sortir "vide".
  let jsPdfLoadPromise = null;
  function loadJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve();
    if (jsPdfLoadPromise) return jsPdfLoadPromise;
    jsPdfLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => { jsPdfLoadPromise = null; reject(new Error('jsPDF load failed')); };
      document.head.appendChild(script);
    });
    return jsPdfLoadPromise;
  }

  function downloadCalcRecap() {
    if (!calcLines.length) { alert('Ajoutez au moins un article avant de télécharger le récapitulatif.'); return; }
    const client = (document.getElementById('jn-calc-client').value || '').trim() || 'Client';
    const guests = document.getElementById('jn-calc-guests').value || '';
    const eventDateVal = document.getElementById('jn-calc-date').value;
    const dateLabel = eventDateVal ? new Date(eventDateVal + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const applyTva = !!document.getElementById('jn-calc-tva').checked;
    const totalHT = calcLines.reduce((sum, l) => sum + calcLineTotal(l), 0);
    const tvaRate = 0.055;
    const tvaAmount = applyTva ? totalHT * tvaRate : 0;
    const totalTTC = totalHT + tvaAmount;
    const acompte = totalTTC * 0.3;
    const s = window.JN.getSettings();

    const safeClient = client.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const fileBase = 'devis-' + (safeClient || 'client');

    const btn = document.getElementById('jn-calc-download');
    const restoreBtn = () => { if (btn) { btn.disabled = false; btn.textContent = '⬇ Télécharger le récapitulatif'; } };
    if (btn) { btn.disabled = true; btn.textContent = 'Génération du PDF…'; }

    loadJsPdf().then(() => {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const marginL = 15, marginR = 15;
        const contentW = pageW - marginL - marginR;
        const colorMain = [74, 32, 50];   // #4A2032
        const colorMuted = [140, 93, 107]; // #8C5D6B
        const colorBg = [251, 243, 241];   // #FBF3F1
        let y = 20;

        function checkPageBreak(neededSpace) {
          if (y + neededSpace > pageH - 20) {
            doc.addPage();
            y = 20;
          }
        }

        // Titre
        doc.setTextColor(...colorMain);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.text('Devis', marginL, y);
        y += 10;

        // Sous-titre (client, date événement, invités)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...colorMuted);
        let subLine = 'Client : ' + client;
        if (dateLabel) subLine += ' — Événement le ' + dateLabel;
        if (guests) subLine += ' — ' + guests + ' personne(s)';
        doc.text(subLine, marginL, y);
        y += 6;
        doc.text('Établi le ' + new Date().toLocaleDateString('fr-FR') + ' par Jennifer Événement', marginL, y);
        y += 10;

        // En-têtes du tableau
        const col1 = marginL, col2 = marginL + contentW * 0.58, col3 = marginL + contentW * 0.74, col4 = marginL + contentW;
        function drawTableHeader() {
          doc.setFillColor(...colorBg);
          doc.rect(marginL, y - 5, contentW, 8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(...colorMain);
          doc.text('ARTICLE', col1 + 2, y);
          doc.text('QTÉ', col2, y, { align: 'center' });
          doc.text('PRIX UNIT.', col3, y, { align: 'right' });
          doc.text('SOUS-TOTAL', col4, y, { align: 'right' });
          y += 8;
        }
        checkPageBreak(20);
        drawTableHeader();

        // Lignes du devis
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        calcLines.forEach((l) => {
          const label = l.label || '';
          const included = (l.includedItems && l.includedItems.length) ? l.includedItems.join(', ') : '';
          const labelLines = doc.splitTextToSize(label, contentW * 0.55);
          const includedLines = included ? doc.splitTextToSize('Comprend : ' + included, contentW * 0.55) : [];
          const rowHeight = 6 + (labelLines.length - 1) * 5 + includedLines.length * 4.5 + 4;
          checkPageBreak(rowHeight + 5);

          doc.setTextColor(...colorMain);
          doc.setFont('helvetica', 'normal');
          doc.text(labelLines, col1 + 2, y);
          doc.text(String(l.qty), col2, y, { align: 'center' });
          doc.text(window.JN.formatEuro(l.unitPrice), col3, y, { align: 'right' });
          doc.setFont('helvetica', 'bold');
          doc.text(window.JN.formatEuro(calcLineTotal(l)), col4, y, { align: 'right' });

          let lineY = y + (labelLines.length - 1) * 5;
          if (includedLines.length) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8.5);
            doc.setTextColor(...colorMuted);
            lineY += 4.5;
            doc.text(includedLines, col1 + 2, lineY);
            lineY += (includedLines.length - 1) * 4.5;
            doc.setFontSize(10.5);
          }
          y = lineY + 6;
          doc.setDrawColor(230, 230, 230);
          doc.line(marginL, y - 4, marginL + contentW, y - 4);
        });

        y += 4;
        checkPageBreak(35);

        // Totaux
        doc.setFontSize(11);
        doc.setTextColor(...colorMain);
        if (applyTva) {
          doc.setFont('helvetica', 'normal');
          doc.text('Total HT', col1, y);
          doc.text(window.JN.formatEuro(totalHT), col4, y, { align: 'right' });
          y += 6;
          doc.text('TVA (5,5%)', col1, y);
          doc.text(window.JN.formatEuro(tvaAmount), col4, y, { align: 'right' });
          y += 8;
          doc.setDrawColor(...colorMain);
          doc.line(marginL, y - 5, marginL + contentW, y - 5);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(15);
          doc.text('Total TTC', col1, y);
          doc.text(window.JN.formatEuro(totalTTC), col4, y, { align: 'right' });
          y += 10;
        } else {
          doc.setDrawColor(...colorMain);
          doc.line(marginL, y - 3, marginL + contentW, y - 3);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(15);
          doc.text('Total (net, sans TVA)', col1, y + 4);
          doc.text(window.JN.formatEuro(totalTTC), col4, y + 4, { align: 'right' });
          y += 14;
        }

        // Encadré acompte
        checkPageBreak(20);
        doc.setFillColor(...colorBg);
        doc.roundedRect(marginL, y - 5, contentW, 14, 2, 2, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...colorMain);
        const acompteText = 'Un acompte de 30%, soit ' + window.JN.formatEuro(acompte) + ', sera demandé à la signature du présent devis. Le solde sera à régler selon les modalités convenues.';
        const acompteLines = doc.splitTextToSize(acompteText, contentW - 8);
        doc.text(acompteLines, marginL + 4, y + 2);
        y += 14 + (acompteLines.length - 1) * 5;

        // Note de bas de page
        checkPageBreak(15);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(...colorMuted);
        const footnote = '* Nombre de choix inclus par pièce : de 30 à 60 pièces, 2 choix disponibles. Au-delà de 60 pièces, 3 choix disponibles.';
        doc.text(doc.splitTextToSize(footnote, contentW), marginL, y);
        y += 12;

        // Signatures
        checkPageBreak(50);
        const sigColW = (contentW - 10) / 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...colorMain);
        doc.text('Bon pour accord', marginL, y);
        doc.text('Jennifer Événement', marginL + sigColW + 10, y);
        y += 5;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(...colorMuted);
        doc.text(doc.splitTextToSize('Faire précéder la signature de la mention manuscrite « Bon pour accord »', sigColW), marginL, y);
        y += 10;

        const boxTop = y;
        doc.setDrawColor(201, 168, 179);
        doc.setLineDashPattern([2, 1.5], 0);
        doc.roundedRect(marginL, boxTop, sigColW, 28, 2, 2, 'S');
        doc.roundedRect(marginL + sigColW + 10, boxTop, sigColW, 28, 2, 2, 'S');
        doc.setLineDashPattern([], 0);

        try {
          doc.addImage(SIGNATURE_JN_B64, 'JPEG', marginL + sigColW + 10 + sigColW / 2 - 20, boxTop + 4, 40, 20);
        } catch (imgErr) {
          console.error('Erreur insertion signature :', imgErr);
        }

        y = boxTop + 28 + 12;

        // Coordonnées
        checkPageBreak(15);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...colorMuted);
        if (s.phone) { doc.text('Tél : ' + s.phone, marginL, y); y += 5; }
        if (s.email) { doc.text('Email : ' + s.email, marginL, y); y += 5; }
        y += 4;
        doc.setFont('helvetica', 'italic');
        doc.text('Ce document est une estimation et peut être ajusté selon vos besoins.', marginL, y);

        doc.save(fileBase + '.pdf');
        restoreBtn();
      } catch (err) {
        console.error('Erreur génération PDF :', err);
        restoreBtn();
        alert('Le PDF n\'a pas pu être généré. Réessayez, ou contactez le support technique.');
      }
    }).catch((err) => {
      console.error('Erreur chargement générateur PDF :', err);
      restoreBtn();
      alert('Impossible de charger le générateur de PDF (connexion internet requise). Réessayez.');
    });
  }

  function renderAdminMenuList() {
    const list = document.getElementById('jn-admin-menu-list');
    if (!list) return;
    list.innerHTML = menusCache.map((m, i) => `
      <div class="jn-admin-menu-card" data-idx="${i}">
        <div class="jn-admin-menu-order-bar">
          <button type="button" class="jn-menu-move-up" title="Monter ce menu" ${i === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="jn-menu-move-down" title="Descendre ce menu" ${i === menusCache.length - 1 ? 'disabled' : ''}>▼</button>
          <span class="jn-menu-position">Position ${i + 1}</span>
        </div>
        <div class="jn-row">
          <div class="jn-menu-photo" data-idx="${i}" title="Cliquez pour changer la photo">
            ${m.imageUrl ? `<img src="${m.imageUrl}" alt="">` : `<span class="jn-menu-photo-placeholder">📷<br>Ajouter<br>une photo</span>`}
            ${m.imageUrl ? `<button type="button" class="jn-menu-photo-remove" title="Retirer la photo">✕</button>` : ''}
            <div class="jn-menu-photo-loading">…</div>
          </div>
          <input type="file" accept="image/*" class="jn-menu-photo-input" data-idx="${i}" style="display:none;">
          <div style="flex:1; min-width:200px;">
            <div class="jn-row">
              <div class="jn-admin-field"><label>Titre</label><input type="text" data-field="title" value="${(m.title || '').replace(/"/g, '&quot;')}"></div>
              <div class="jn-admin-field"><label>Accroche</label><input type="text" data-field="tagline" value="${(m.tagline || '').replace(/"/g, '&quot;')}"></div>
            </div>
            <div class="jn-row">
              <div class="jn-admin-field"><label>Prix / personne (€)</label><input type="number" step="0.01" data-field="pricePerPerson" value="${m.pricePerPerson}"></div>
              <div class="jn-admin-field"><label>Minimum de convives</label><input type="number" data-field="minGuests" value="${m.minGuests}"></div>
            </div>
          </div>
        </div>
        <div class="jn-row">
          <div class="jn-admin-field" style="min-width:100%;"><label>Description</label><textarea rows="2" data-field="description">${m.description || ''}</textarea></div>
        </div>
        <div class="jn-admin-items-wrap">
          <button type="button" class="jn-admin-items-toggle">${expandedMenuItems.has(m.id) ? '▾' : '▸'} Pièces à la carte (${(m.items || []).length})</button>
          <div class="jn-admin-items-body" style="${expandedMenuItems.has(m.id) ? '' : 'display:none;'}">
            <div class="jn-admin-items-list">
              ${(m.items || []).map((it, ii) => `
                <div class="jn-row jn-admin-item-row" data-item-idx="${ii}">
                  <div class="jn-admin-field"><label>Nom</label><input type="text" data-item-field="name" value="${(it.name || '').replace(/"/g, '&quot;')}"></div>
                  <div class="jn-admin-field" style="max-width:110px;"><label>Unité</label><input type="text" data-item-field="unit" value="${(it.unit || '').replace(/"/g, '&quot;')}"></div>
                  <div class="jn-admin-field" style="max-width:110px;"><label>Prix (€)</label><input type="number" step="0.01" data-item-field="price" value="${it.price != null ? it.price : ''}"></div>
                  <button class="jn-admin-item-delete" type="button" title="Supprimer cette pièce" style="align-self:flex-end; margin-bottom:2px;">✕</button>
                </div>`).join('') || '<p style="color:var(--text-muted,#8C5D6B); font-size:0.85rem;">Aucune pièce pour ce menu.</p>'}
            </div>
            <button class="jn-admin-item-add" type="button" style="margin-top:8px;">+ Ajouter une pièce</button>
          </div>
        </div>
        <div class="jn-admin-menu-actions">
          <button class="jn-admin-save" type="button">Enregistrer</button>
          <button class="jn-admin-delete" type="button">Supprimer</button>
        </div>
      </div>`).join('');

    function collectItemsFromCard(card) {
      const items = [];
      card.querySelectorAll('.jn-admin-item-row').forEach((row) => {
        const item = {};
        row.querySelectorAll('[data-item-field]').forEach((f) => {
          const field = f.dataset.itemField;
          item[field] = field === 'price' ? (parseFloat(f.value) || 0) : f.value;
        });
        items.push(item);
      });
      return items;
    }

    list.querySelectorAll('.jn-admin-menu-card').forEach((card) => {
      const idx = parseInt(card.dataset.idx, 10);

      const photoBox = card.querySelector('.jn-menu-photo');
      const photoInput = card.querySelector('.jn-menu-photo-input');
      photoBox.addEventListener('click', (e) => {
        if (e.target.closest('.jn-menu-photo-remove')) return;
        photoInput.click();
      });
      photoInput.addEventListener('change', async () => {
        const file = photoInput.files[0];
        if (!file) return;
        photoBox.classList.add('loading');
        try {
          const formData = new FormData();
          formData.append('photo', file);
          const res = await fetch(API_BASE + '/api/photos/upload', { method: 'POST', headers: authHeaders(), body: formData });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.url) { alert('Erreur upload : ' + (data.error || 'réponse invalide du serveur.')); photoBox.classList.remove('loading'); return; }
          const m = Object.assign({}, menusCache[idx], { imageUrl: data.url });
          const { error } = await apiPut('/api/menus/' + m.id, menuToRow(m));
          if (error) { alert('Erreur lors de l\'enregistrement : ' + (error.error || '')); photoBox.classList.remove('loading'); return; }
          await fetchMenus();
          renderAdminMenuList();
        } catch (err) {
          alert('Erreur upload : connexion au serveur impossible.');
          photoBox.classList.remove('loading');
        }
      });
      const removeBtn = card.querySelector('.jn-menu-photo-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!confirm('Retirer la photo de ce menu ?')) return;
          const m = Object.assign({}, menusCache[idx], { imageUrl: '' });
          const { error } = await apiPut('/api/menus/' + m.id, menuToRow(m));
          if (error) { alert('Erreur : ' + (error.error || '')); return; }
          await fetchMenus();
          renderAdminMenuList();
        });
      }

      const itemsToggleBtn = card.querySelector('.jn-admin-items-toggle');
      itemsToggleBtn.addEventListener('click', () => {
        const m = menusCache[idx];
        if (expandedMenuItems.has(m.id)) { expandedMenuItems.delete(m.id); } else { expandedMenuItems.add(m.id); }
        renderAdminMenuList();
      });

      async function moveMenu(fromIdx, toIdx) {
        if (toIdx < 0 || toIdx >= menusCache.length) return;
        const arr = menusCache.slice();
        const [moved] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, moved);
        // Réattribue un ordre propre et unique à tous les menus, dans leur nouvel ordre
        arr.forEach((m, i) => { m.sortOrder = i; });
        menusCache = arr;
        renderAdminMenuList();
        try {
          for (const m of arr) {
            const { error } = await apiPut('/api/menus/' + m.id, menuToRow(m));
            if (error) { alert('Erreur lors du déplacement : ' + (error.error || '')); break; }
          }
        } finally {
          await fetchMenus();
          renderAdminMenuList();
        }
      }

      const moveUpBtn = card.querySelector('.jn-menu-move-up');
      if (moveUpBtn) {
        moveUpBtn.addEventListener('click', () => moveMenu(idx, idx - 1));
      }
      const moveDownBtn = card.querySelector('.jn-menu-move-down');
      if (moveDownBtn) {
        moveDownBtn.addEventListener('click', () => moveMenu(idx, idx + 1));
      }

      card.querySelector('.jn-admin-item-add').addEventListener('click', () => {
        const m = menusCache[idx];
        m.items = m.items || [];
        m.items.push({ name: 'Nouvelle pièce', unit: 'pièce', price: 0 });
        renderAdminMenuList();
      });

      card.querySelectorAll('.jn-admin-item-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
          const row = btn.closest('.jn-admin-item-row');
          const ii = parseInt(row.dataset.itemIdx, 10);
          menusCache[idx].items.splice(ii, 1);
          renderAdminMenuList();
        });
      });

      card.querySelector('.jn-admin-save').addEventListener('click', async () => {
        const m = Object.assign({}, menusCache[idx]);
        card.querySelectorAll('[data-field]').forEach((f) => {
          const field = f.dataset.field;
          m[field] = (field === 'pricePerPerson' || field === 'minGuests') ? parseFloat(f.value) || 0 : f.value;
        });
        m.items = collectItemsFromCard(card);
        const { error } = await apiPut('/api/menus/' + m.id, menuToRow(m));
        if (error) { alert('Erreur lors de l\'enregistrement : ' + (error.error || '')); return; }
        await fetchMenus();
        renderAdminMenuList();
        const msg = document.getElementById('jn-admin-saved-msg');
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 2000);
      });
      card.querySelector('.jn-admin-delete').addEventListener('click', async () => {
        if (!confirm('Supprimer ce menu ?')) return;
        const { error } = await apiDelete('/api/menus/' + menusCache[idx].id);
        if (error) { alert('Erreur lors de la suppression : ' + (error.error || '')); return; }
        await fetchMenus();
        renderAdminMenuList();
      });
    });
  }

  function renderAdminPhotoList() {
    const grid = document.getElementById('jn-admin-photo-grid');
    if (!grid) return;
    grid.innerHTML = photosCache.map((p) => `
      <div class="jn-photo-card" data-id="${p.id}">
        <img src="${p.url}" alt="">
        <button type="button">✕</button>
      </div>`).join('') || '<p style="color:var(--text-muted,#8C5D6B); font-size:0.9rem;">Aucune photo pour le moment.</p>';

    grid.querySelectorAll('.jn-photo-card button').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.jn-photo-card');
        const id = card.dataset.id;
        if (!confirm('Supprimer cette photo ?')) return;
        await apiDelete('/api/photos/' + id);
        await fetchPhotos();
        renderAdminPhotoList();
      });
    });
  }

  function renderAdminAvisList() {
    const list = document.getElementById('jn-admin-avis-list');
    if (!list) return;
    list.innerHTML = testimonialsCache.map((t, i) => `
      <div class="jn-admin-menu-card" data-idx="${i}">
        <div class="jn-row">
          <div class="jn-admin-field"><label>Auteur</label><input type="text" data-field="author" value="${(t.author || '').replace(/"/g, '&quot;')}"></div>
          <div class="jn-admin-field"><label>Ville</label><input type="text" data-field="location" value="${(t.location || '').replace(/"/g, '&quot;')}"></div>
          <div class="jn-admin-field" style="max-width:110px;"><label>Note /5</label><input type="number" min="1" max="5" data-field="rating" value="${t.rating || 5}"></div>
        </div>
        <div class="jn-row">
          <div class="jn-admin-field" style="min-width:100%;"><label>Avis</label><textarea rows="2" data-field="quote">${t.quote || ''}</textarea></div>
        </div>
        <div class="jn-admin-menu-actions">
          <button class="jn-admin-save" type="button">Enregistrer</button>
          <button class="jn-admin-delete" type="button">Supprimer</button>
        </div>
      </div>`).join('') || '<p style="color:var(--text-muted,#8C5D6B); font-size:0.9rem;">Aucun avis pour le moment.</p>';

    list.querySelectorAll('.jn-admin-menu-card').forEach((card) => {
      const idx = parseInt(card.dataset.idx, 10);
      card.querySelector('.jn-admin-save').addEventListener('click', async () => {
        const t = Object.assign({}, testimonialsCache[idx]);
        card.querySelectorAll('[data-field]').forEach((f) => {
          const field = f.dataset.field;
          t[field] = field === 'rating' ? (parseInt(f.value, 10) || 5) : f.value;
        });
        const { error } = await apiPut('/api/testimonials/' + t.id, t);
        if (error) { alert('Erreur lors de l\'enregistrement : ' + (error.error || '')); return; }
        await fetchTestimonials();
        const msg = document.getElementById('jn-admin-saved-msg');
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 2000);
      });
      card.querySelector('.jn-admin-delete').addEventListener('click', async () => {
        if (!confirm('Supprimer cet avis ?')) return;
        const { error } = await apiDelete('/api/testimonials/' + testimonialsCache[idx].id);
        if (error) { alert('Erreur lors de la suppression : ' + (error.error || '')); return; }
        await fetchTestimonials();
        renderAdminAvisList();
      });
    });
  }

  function scrollToTopThen(callback) {
    const alreadyTop = (window.scrollY || window.pageYOffset || 0) < 4;
    if (alreadyTop) { callback(); return; }
    const onScrollEnd = () => { window.removeEventListener('scroll', check); callback(); };
    let settleTimer = null;
    function check() {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(onScrollEnd, 60);
    }
    window.addEventListener('scroll', check, { passive: true });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setTimeout(onScrollEnd, 500);
  }

  async function checkSession() {
    if (!authToken) return false;
    try {
      const res = await fetch(API_BASE + '/api/session', { headers: authHeaders() });
      const data = await res.json();
      if (!data.valid) { authToken = null; localStorage.removeItem('jn_admin_token'); }
      return !!data.valid;
    } catch (err) { return false; }
  }

  async function initAdminAccess() {
    const brand = document.getElementById('brand-logo');
    if (!brand) return;

    const triggerAdminAccess = async () => {
      try {
        await window.JN.ready;
        const valid = await checkSession();
        scrollToTopThen(async () => {
          if (valid) { openAdminDashboard(); return; }
          const modal = buildLoginModal();
          modal.classList.add('open');
          if (modal.__markOpened) modal.__markOpened();
          if (window.jcLockPageScroll) window.jcLockPageScroll();
          setTimeout(() => document.getElementById('jn-admin-pass').focus(), 50);
        });
      } catch (err) {
        console.error('Accès admin impossible :', err);
        alert('Impossible d\'ouvrir l\'espace admin pour le moment (connexion internet ou serveur indisponible). Réessayez dans un instant.');
      }
    };

    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;
    const DOUBLE_TAP_DELAY = 400;
    const DOUBLE_TAP_DISTANCE = 50;

    brand.addEventListener('pointerup', (e) => {
      const now = Date.now();
      const dx = Math.abs(e.clientX - lastTapX);
      const dy = Math.abs(e.clientY - lastTapY);
      const isDoubleTap = (now - lastTapTime) < DOUBLE_TAP_DELAY && dx < DOUBLE_TAP_DISTANCE && dy < DOUBLE_TAP_DISTANCE;

      if (isDoubleTap) {
        lastTapTime = 0;
        triggerAdminAccess();
      } else {
        lastTapTime = now;
        lastTapX = e.clientX;
        lastTapY = e.clientY;
      }
    });

    await window.JN.ready;
    if (sessionStorage.getItem('jn_open_admin') === '1') {
      sessionStorage.removeItem('jn_open_admin');
      try {
        const valid = await checkSession();
        if (valid) openAdminDashboard();
      } catch (err) { console.error('Reprise de session admin impossible :', err); }
    }
  }

  function initAll() {
    initScrollProgress();
    initPremiumScrollFx();
    initFallingDaisies();
    initAdminAccess();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
