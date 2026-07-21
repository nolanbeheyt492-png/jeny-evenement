/* ==========================================================
   JN ÉVÉNEMENT — Moteur de données (window.JN) connecté à VOTRE VPS
   Alimente : menus.html, menu.html, realisations.html, l'estimateur
   de budget sur index.html, et le panneau admin (double-clic logo).
   ========================================================== */
(function () {

  // ---- Configuration API VPS ---------------------------------------------
  // ⚠️ Remplace par ton nom de domaine une fois que tu l'auras (ex: https://api.tondomaine.com)
  const API_BASE = 'http://129.80.196.1';

  let menusCache = [];
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
      menusCache = (data || []).map(rowToMenu);
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
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
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

    function close() {
      modal.classList.remove('open');
      document.getElementById('jn-admin-pass').value = '';
      document.getElementById('jn-admin-error').style.display = 'none';
    }
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
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
    if (dash) { dash.classList.add('open'); dash.scrollTop = 0; renderAdminMenuList(); renderAdminPhotoList(); renderAdminAvisList(); return; }

    const style = document.createElement('style');
    style.textContent = `
      #jn-admin-dash{ position:fixed; inset:0; height:100vh; height:100dvh; z-index:10001; background:#fff; display:none; align-items:flex-start; justify-content:center; padding:0; overflow-y:auto; -webkit-overflow-scrolling:touch; }
      #jn-admin-dash.open{ display:flex; }
      #jn-admin-panel{ background:#fff; padding:32px 32px 80px; max-width:1000px; width:100%; min-height:100vh; box-sizing:border-box; font-family:var(--font-body, sans-serif); }
      @media (min-width:700px){ #jn-admin-panel{ padding:48px 56px 100px; } }
      #jn-admin-panel h2{ font-family:var(--font-display, serif); color:var(--text, #4A2032); margin-bottom:4px; }
      #jn-admin-panel .jn-admin-sub{ color:var(--text-muted,#8C5D6B); font-size:0.85rem; margin-bottom:18px; }
      #jn-admin-panel .jn-admin-topbar{ display:flex; justify-content:space-between; align-items:flex-start; position:sticky; top:0; background:#fff; padding-top:8px; margin:-32px -32px 0; padding-left:32px; padding-right:32px; padding-bottom:16px; z-index:2; border-bottom:1px solid var(--border,#eee); }
      @media (min-width:700px){ #jn-admin-panel .jn-admin-topbar{ margin:-48px -56px 0; padding-left:56px; padding-right:56px; } }
      #jn-admin-close, #jn-admin-logout{ background:#F1E9E4; border:none; padding:8px 14px; border-radius:8px; cursor:pointer; font-size:0.8rem; font-weight:600; color:var(--text,#4A2032); }
      .jn-admin-tabs{ display:flex; gap:8px; margin:18px 0 20px; border-bottom:1px solid var(--border,#eee); }
      .jn-admin-tab{ padding:9px 16px; cursor:pointer; font-weight:600; font-size:0.88rem; color:var(--text-muted,#8C5D6B); border-bottom:2px solid transparent; }
      .jn-admin-tab.active{ color:var(--accent,#D67A93); border-color:var(--accent,#D67A93); }
      .jn-admin-tabpanel{ display:none; }
      .jn-admin-tabpanel.active{ display:block; }
      .jn-admin-menu-card{ border:1px solid var(--border,#eee); border-radius:14px; padding:18px; margin-bottom:14px; }
      .jn-admin-menu-card .jn-row{ display:flex; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
      .jn-admin-menu-card label{ font-size:0.72rem; text-transform:uppercase; letter-spacing:0.4px; color:var(--text-muted,#8C5D6B); display:block; margin-bottom:4px; }
      .jn-admin-menu-card input, .jn-admin-menu-card textarea{ width:100%; padding:9px 10px; border:1px solid var(--border,#ddd); border-radius:8px; font-size:0.88rem; font-family:inherit; }
      .jn-admin-field{ flex:1; min-width:140px; }
      .jn-admin-menu-actions{ display:flex; gap:8px; margin-top:10px; }
      .jn-admin-menu-actions button{ border:none; padding:7px 12px; border-radius:8px; font-size:0.78rem; font-weight:600; cursor:pointer; }
      .jn-admin-save{ background:var(--accent,#D67A93); color:#fff; }
      .jn-admin-delete{ background:#F6DADA; color:#8B2E2E; }
      #jn-admin-add-btn{ background:var(--text,#4A2032); color:#fff; border:none; padding:11px 18px; border-radius:10px; font-weight:600; cursor:pointer; margin-top:6px; }
      #jn-admin-saved-msg{ display:none; background:#E4F3E7; color:#2B6B3F; padding:10px 14px; border-radius:10px; font-size:0.85rem; margin-bottom:14px; }
      .jn-photo-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(140px,1fr)); gap:14px; margin-bottom:18px; }
      .jn-photo-card{ position:relative; border-radius:12px; overflow:hidden; border:1px solid var(--border,#eee); aspect-ratio:1; }
      .jn-photo-card img{ width:100%; height:100%; object-fit:cover; display:block; }
      .jn-photo-card button{ position:absolute; top:6px; right:6px; background:rgba(139,46,46,0.9); color:#fff; border:none; width:26px; height:26px; border-radius:50%; cursor:pointer; font-size:0.8rem; }
      #jn-upload-zone{ border:2px dashed var(--border,#ddd); border-radius:14px; padding:28px; text-align:center; color:var(--text-muted,#8C5D6B); cursor:pointer; }
      #jn-upload-zone.dragover{ border-color:var(--accent,#D67A93); background:#FBF3F1; }
      @media (max-width:600px){
        #jn-admin-panel{ padding:18px 14px 90px; }
        #jn-admin-panel .jn-admin-topbar{ margin:-18px -14px 0; padding:10px 14px 14px; flex-direction:column; align-items:stretch; gap:10px; }
        #jn-admin-panel .jn-admin-topbar > div[style]{ justify-content:flex-end; }
        .jn-admin-tabs{ overflow-x:auto; -webkit-overflow-scrolling:touch; flex-wrap:nowrap; scrollbar-width:none; }
        .jn-admin-tabs::-webkit-scrollbar{ display:none; }
        .jn-admin-tab{ flex-shrink:0; white-space:nowrap; padding:9px 12px; }
        .jn-admin-menu-card .jn-row{ flex-direction:column; }
        .jn-admin-field{ min-width:100%; }
        .jn-admin-menu-actions button, #jn-admin-close, #jn-admin-logout{ min-height:40px; }
      }
    `;
    document.head.appendChild(style);

    dash = document.createElement('div');
    dash.id = 'jn-admin-dash';
    dash.innerHTML = `
      <div id="jn-admin-panel">
        <div class="jn-admin-topbar">
          <div>
            <h2>Espace administrateur</h2>
            <p class="jn-admin-sub">Connecté à votre serveur — les changements sont visibles instantanément sur tous vos appareils.</p>
          </div>
          <div style="display:flex; gap:8px;">
            <button id="jn-admin-logout" type="button">Déconnexion</button>
            <button id="jn-admin-close" type="button">Fermer ✕</button>
          </div>
        </div>
        <div id="jn-admin-saved-msg">✅ Modifications enregistrées.</div>
        <div class="jn-admin-tabs">
          <div class="jn-admin-tab active" data-tab="menus">Menus</div>
          <div class="jn-admin-tab" data-tab="photos">Photos</div>
          <div class="jn-admin-tab" data-tab="avis">Avis clients</div>
          <div class="jn-admin-tab" data-tab="reglages">Réglages</div>
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
      const newMenu = { id: 'menu-' + Date.now(), title: 'Nouveau menu', tagline: '', description: '', pricePerPerson: 20, minGuests: 10, includes: [], items: [], sortOrder: menusCache.length };
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

    dash.classList.add('open');
    dash.scrollTop = 0;
    renderAdminMenuList();
    renderAdminPhotoList();
    renderAdminAvisList();
  }

  function renderAdminMenuList() {
    const list = document.getElementById('jn-admin-menu-list');
    if (!list) return;
    list.innerHTML = menusCache.map((m, i) => `
      <div class="jn-admin-menu-card" data-idx="${i}">
        <div class="jn-row">
          <div style="flex:1;">
            <div class="jn-row">
              <div class="jn-admin-field"><label>Titre</label><input type="text" data-field="title" value="${(m.title || '').replace(/"/g, '&quot;')}"></div>
              <div class="jn-admin-field"><label>Accroche</label><input type="text" data-field="tagline" value="${(m.tagline || '').replace(/"/g, '&quot;')}"></div>
            </div>
            <div class="jn-row">
              <div class="jn-admin-field"><label>Prix / personne (€)</label><input type="number" step="0.5" data-field="pricePerPerson" value="${m.pricePerPerson}"></div>
              <div class="jn-admin-field"><label>Minimum de convives</label><input type="number" data-field="minGuests" value="${m.minGuests}"></div>
            </div>
          </div>
        </div>
        <div class="jn-row">
          <div class="jn-admin-field" style="min-width:100%;"><label>Description</label><textarea rows="2" data-field="description">${m.description || ''}</textarea></div>
        </div>
        <div class="jn-admin-menu-actions">
          <button class="jn-admin-save" type="button">Enregistrer</button>
          <button class="jn-admin-delete" type="button">Supprimer</button>
        </div>
      </div>`).join('');

    list.querySelectorAll('.jn-admin-menu-card').forEach((card) => {
      const idx = parseInt(card.dataset.idx, 10);
      card.querySelector('.jn-admin-save').addEventListener('click', async () => {
        const m = Object.assign({}, menusCache[idx]);
        card.querySelectorAll('[data-field]').forEach((f) => {
          const field = f.dataset.field;
          m[field] = (field === 'pricePerPerson' || field === 'minGuests') ? parseFloat(f.value) || 0 : f.value;
        });
        const { error } = await apiPut('/api/menus/' + m.id, menuToRow(m));
        if (error) { alert('Erreur lors de l\'enregistrement : ' + (error.error || '')); return; }
        await fetchMenus();
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
