/* ==========================================================
   JN ÉVÉNEMENT — Moteur de données (window.JN) connecté à VOTRE VPS
   Alimente : menus.html, menu.html, realisations.html, l'estimateur
   de budget sur index.html, et le panneau admin (double-clic logo).
   ========================================================== */
(function () {

  // ---- Configuration API VPS ---------------------------------------------
  // ⚠️ Remplace par ton nom de domaine une fois que tu l'auras (ex: https://api.tondomaine.com)
  const API_BASE = 'https://api.jennifer-evenement.com';

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
          sessionStorage.setItem('jn_open_admin', '1');
          location.reload();
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

          <div class="jn-admin-menu-actions">
            <button id="jn-calc-reset" type="button" class="jn-admin-delete">Tout effacer</button>
            <button id="jn-calc-download" type="button" class="jn-admin-save">⬇ Télécharger le récapitulatif</button>
          </div>
        </div>
        </div>
      </div>`;
    document.body.appendChild(dash);

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
      calcLines.push({ label: (menu.title || 'Menu') + ' (menu / pers.)', unitPrice: menu.pricePerPerson || 0, qty: guestsForMenu });
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

    dash.classList.add('open');
    dash.scrollTop = 0;
    renderAdminMenuList();
    renderAdminPhotoList();
    renderAdminAvisList();
    renderAdminCalc();
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

  function downloadCalcRecap() {
    if (!calcLines.length) { alert('Ajoutez au moins un article avant de télécharger le récapitulatif.'); return; }
    const client = (document.getElementById('jn-calc-client').value || '').trim() || 'Client';
    const guests = document.getElementById('jn-calc-guests').value || '';
    const eventDateVal = document.getElementById('jn-calc-date').value;
    const dateLabel = eventDateVal ? new Date(eventDateVal + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const total = calcLines.reduce((sum, l) => sum + calcLineTotal(l), 0);
    const s = window.JN.getSettings();

    const rowsHtml = calcLines.map((l) => `
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #eee;">${(l.label || '').replace(/</g, '&lt;')}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; text-align:center;">${l.qty}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; text-align:right;">${window.JN.formatEuro(l.unitPrice)}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #eee; text-align:right; font-weight:600;">${window.JN.formatEuro(calcLineTotal(l))}</td>
      </tr>`).join('');

    const html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">' +
      '<title>Devis — ' + client.replace(/</g, '&lt;') + '</title>' +
      '<style>' +
      'body{ font-family: Georgia, "Times New Roman", serif; color:#4A2032; max-width:700px; margin:40px auto; padding:0 20px; }' +
      'h1{ font-size:1.5rem; margin-bottom:4px; }' +
      '.sub{ color:#8C5D6B; font-size:0.9rem; margin-bottom:24px; line-height:1.6; }' +
      'table{ width:100%; border-collapse:collapse; margin-bottom:20px; }' +
      'th{ text-align:left; padding:10px 12px; background:#FBF3F1; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.4px; }' +
      'th:nth-child(2){ text-align:center; } th:nth-child(3), th:nth-child(4){ text-align:right; }' +
      '.total-row{ display:flex; justify-content:space-between; font-size:1.3rem; font-weight:700; padding:14px 0; border-top:2px solid #4A2032; margin-top:6px; }' +
      '.footer{ margin-top:30px; font-size:0.85rem; color:#8C5D6B; line-height:1.6; }' +
      '@media print { body{ margin:0; } }' +
      '</style></head><body>' +
      '<h1>Récapitulatif de commande</h1>' +
      '<div class="sub">Client : ' + client.replace(/</g, '&lt;') + (dateLabel ? ' — Événement le ' + dateLabel : '') + (guests ? ' — ' + guests + ' personne(s)' : '') + '<br>' +
      'Établi le ' + new Date().toLocaleDateString('fr-FR') + ' par Jennifer Événement</div>' +
      '<table><thead><tr><th>Article</th><th>Qté</th><th>Prix unit.</th><th>Sous-total</th></tr></thead><tbody>' + rowsHtml + '</tbody></table>' +
      '<div class="total-row"><span>Total estimé</span><span>' + window.JN.formatEuro(total) + '</span></div>' +
      '<div class="footer">' + (s.phone ? 'Tél : ' + s.phone + '<br>' : '') + (s.email ? 'Email : ' + s.email : '') +
      '<br><br>Ce document est une estimation et peut être ajusté selon vos besoins.</div>' +
      '</body></html>';

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeClient = client.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    a.href = url;
    a.download = 'devis-' + (safeClient || 'client') + '.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
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
