/* ==========================================================
   JN ÉVÉNEMENT — Moteur de données (window.JN) connecté à Supabase
   Alimente : menus.html, menu.html, realisations.html, l'estimateur
   de budget sur index.html, et le panneau admin (double-clic logo).
   ========================================================== */
(function () {

  // ---- Configuration Supabase ------------------------------------------
  const SUPABASE_URL = 'https://rumlowblqgzxkhadymur.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_9zcs4Q-rciRAVmmuPL738A_6n353h3G';
  const ADMIN_EMAIL = 'admin@jn-evenement.fr'; // compte créé dans Supabase Authentication
  const PHOTOS_BUCKET = 'photos';

  let supabase = null;
  let menusCache = [];
  let photosCache = [];

  // Charge la librairie supabase-js depuis un CDN, puis initialise le client
  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabase) { resolve(window.supabase); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = () => resolve(window.supabase);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function fireUpdated(kind) {
    document.dispatchEvent(new CustomEvent('jn:' + kind + '-updated'));
  }

  // Menus de démonstration — insérés automatiquement UNE SEULE FOIS si la base
  // est vide, pour donner un aperçu visuel. Modifiables/supprimables depuis l'admin.
  const DEMO_MENUS = [
    { id: 'demo-cocktail', title: '[EXEMPLE] Cocktail Dînatoire', tagline: 'À personnaliser depuis l\'admin', description: 'Ceci est un menu d\'exemple pour vous montrer le rendu du site. Modifiez ou supprimez-le depuis votre espace admin.', price_per_person: 28, min_guests: 15, includes: ['Pièces salées & sucrées', 'Service inclus'], items: [], sort_order: 0, image_url: '' },
    { id: 'demo-mariage', title: '[EXEMPLE] Mariage Prestige', tagline: 'À personnaliser depuis l\'admin', description: 'Ceci est un menu d\'exemple pour vous montrer le rendu du site. Modifiez ou supprimez-le depuis votre espace admin.', price_per_person: 65, min_guests: 40, includes: ['Entrée, plat, dessert', 'Pièce montée'], items: [], sort_order: 1, image_url: '' },
    { id: 'demo-anniversaire', title: '[EXEMPLE] Anniversaire', tagline: 'À personnaliser depuis l\'admin', description: 'Ceci est un menu d\'exemple pour vous montrer le rendu du site. Modifiez ou supprimez-le depuis votre espace admin.', price_per_person: 22, min_guests: 10, includes: ['Buffet complet', 'Gâteau sur demande'], items: [], sort_order: 2, image_url: '' },
    { id: 'demo-brunch', title: '[EXEMPLE] Brunch', tagline: 'À personnaliser depuis l\'admin', description: 'Ceci est un menu d\'exemple pour vous montrer le rendu du site. Modifiez ou supprimez-le depuis votre espace admin.', price_per_person: 18, min_guests: 8, includes: ['Sucré & salé', 'Boissons chaudes incluses'], items: [], sort_order: 3, image_url: '' }
  ];

  async function fetchMenus() {
    if (!supabase) return menusCache;
    let { data, error } = await supabase.from('menus').select('*').order('sort_order', { ascending: true });
    if (error) { console.error('Erreur chargement menus:', error); return menusCache; }
    if ((!data || data.length === 0) && !sessionStorage.getItem('jn_demo_seeded')) {
      sessionStorage.setItem('jn_demo_seeded', '1');
      await supabase.from('menus').insert(DEMO_MENUS);
      const retry = await supabase.from('menus').select('*').order('sort_order', { ascending: true });
      data = retry.data;
    }
    menusCache = (data || []).map(rowToMenu);
    fireUpdated('menus');
    return menusCache;
  }

  async function fetchPhotos() {
    if (!supabase) return photosCache;
    const { data, error } = await supabase.from('photos').select('*').order('sort_order', { ascending: true });
    if (error) { console.error('Erreur chargement photos:', error); return photosCache; }
    photosCache = data || [];
    fireUpdated('photos');
    return photosCache;
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
      sortOrder: row.sort_order || 0,
      imageUrl: row.image_url || ''
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
      sort_order: m.sortOrder || 0,
      image_url: m.imageUrl || ''
    };
  }

  // ---- API publique (utilisée par menus.html, menu.html, index.html) ----
  window.JN = {
    getMenus: function () { return menusCache; },
    getMenu: function (id) { return menusCache.find((m) => m.id === id) || null; },
    getPhotos: function () { return photosCache; },
    formatEuro: function (n) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
    },
    refreshMenus: fetchMenus,
    refreshPhotos: fetchPhotos,
    ready: null // remplacé plus bas par une vraie Promise
  };

  window.JN.ready = loadSupabase().then((sb) => {
    supabase = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return Promise.all([fetchMenus(), fetchPhotos()]);
  }).catch((err) => {
    console.error('Supabase indisponible, le site fonctionne en mode dégradé.', err);
  });

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
      el.style.opacity = (0.5 + Math.random() * 0.4).toFixed(2);
      layer.appendChild(el);
      return {
        el: el,
        x: Math.random() * 100,
        y: Math.random() * pageHeight() * -1,
        speed: 0.5 + Math.random() * 0.9,
        swayAmp: 8 + Math.random() * 14,
        swaySpeed: 0.0015 + Math.random() * 0.002,
        swayOffset: Math.random() * Math.PI * 2,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 0.25
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
  // Le mot de passe est vérifié par Supabase Auth (serveur), plus par le
  // navigateur — c'est une vraie authentification.
  function buildLoginModal() {
    if (document.getElementById('jn-admin-modal')) return document.getElementById('jn-admin-modal');

    const style = document.createElement('style');
    style.textContent = `
      #jn-admin-modal{ position:fixed; inset:0; z-index:10000; background:rgba(33,20,26,0.55); display:none; align-items:center; justify-content:center; padding:20px; }
      #jn-admin-modal.open{ display:flex; }
      #jn-admin-box{ background:#fff; border-radius:20px; padding:36px; max-width:360px; width:100%; box-shadow:0 30px 60px -20px rgba(74,32,50,0.4); font-family:var(--font-body, sans-serif); }
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
    document.getElementById('jn-admin-cancel').addEventListener('click', close);

    async function attemptLogin() {
      const val = document.getElementById('jn-admin-pass').value;
      const btn = document.getElementById('jn-admin-submit');
      btn.disabled = true; btn.textContent = 'Connexion…';
      const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: val });
      btn.disabled = false; btn.textContent = 'Se connecter';
      if (error) {
        document.getElementById('jn-admin-error').style.display = 'block';
      } else {
        sessionStorage.setItem('jn_open_admin', '1');
        location.reload();
      }
    }
    document.getElementById('jn-admin-submit').addEventListener('click', attemptLogin);
    document.getElementById('jn-admin-pass').addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });
    return modal;
  }

  function openAdminDashboard() {
    let dash = document.getElementById('jn-admin-dash');
    if (dash) { dash.classList.add('open'); dash.scrollTop = 0; renderAdminMenuList(); renderAdminPhotoList(); return; }

    const style = document.createElement('style');
    style.textContent = `
      #jn-admin-dash{ position:fixed; inset:0; z-index:10001; background:#fff; display:none; align-items:flex-start; justify-content:center; padding:0; overflow-y:auto; }
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
      .jn-admin-menu-photo{ width:140px; flex-shrink:0; text-align:center; }
      .jn-admin-menu-photo img{ width:140px; height:100px; object-fit:cover; border-radius:10px; display:block; margin-bottom:6px; border:1px solid var(--border,#eee); }
      .jn-admin-menu-photo-empty{ width:140px; height:100px; border-radius:10px; background:#F4EDE8; color:var(--text-muted,#8C5D6B); font-size:0.75rem; display:flex; align-items:center; justify-content:center; margin-bottom:6px; }
      .jn-menu-photo-btn{ font-size:0.72rem; padding:6px 8px; border-radius:8px; border:1px solid var(--border,#ddd); background:#fff; cursor:pointer; width:100%; }
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
    `;
    document.head.appendChild(style);

    dash = document.createElement('div');
    dash.id = 'jn-admin-dash';
    dash.innerHTML = `
      <div id="jn-admin-panel">
        <div class="jn-admin-topbar">
          <div>
            <h2>Espace administrateur</h2>
            <p class="jn-admin-sub">Connecté à votre base en ligne — les changements sont visibles instantanément sur tous vos appareils.</p>
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
      </div>`;
    document.body.appendChild(dash);

    dash.addEventListener('click', (e) => { if (e.target === dash) dash.classList.remove('open'); });
    document.getElementById('jn-admin-close').addEventListener('click', () => dash.classList.remove('open'));
    document.getElementById('jn-admin-logout').addEventListener('click', async () => {
      await supabase.auth.signOut();
      dash.classList.remove('open');
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
      await supabase.from('menus').insert(menuToRow(newMenu));
      await fetchMenus();
      renderAdminMenuList();
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
        const path = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const { error: upErr } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file);
        if (upErr) { alert('Erreur upload : ' + upErr.message); continue; }
        const { data: pub } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
        await supabase.from('photos').insert({ url: pub.publicUrl, sort_order: photosCache.length });
      }
      await fetchPhotos();
      renderAdminPhotoList();
    }

    dash.classList.add('open');
    dash.scrollTop = 0;
    renderAdminMenuList();
    renderAdminPhotoList();
  }

  function renderAdminMenuList() {
    const list = document.getElementById('jn-admin-menu-list');
    if (!list) return;
    list.innerHTML = menusCache.map((m, i) => `
      <div class="jn-admin-menu-card" data-idx="${i}">
        <div class="jn-row">
          <div class="jn-admin-menu-photo">
            <img src="${m.imageUrl || ''}" style="${m.imageUrl ? '' : 'display:none;'}" alt="">
            <div class="jn-admin-menu-photo-empty" style="${m.imageUrl ? 'display:none;' : ''}">Aucune photo</div>
            <input type="file" accept="image/*" class="jn-menu-photo-input" style="display:none;">
            <button type="button" class="jn-menu-photo-btn">📷 ${m.imageUrl ? 'Changer' : 'Ajouter'} la photo</button>
          </div>
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
      const photoBtn = card.querySelector('.jn-menu-photo-btn');
      const photoInput = card.querySelector('.jn-menu-photo-input');
      photoBtn.addEventListener('click', () => photoInput.click());
      photoInput.addEventListener('change', async () => {
        const file = photoInput.files[0];
        if (!file) return;
        photoBtn.textContent = 'Envoi…';
        const path = 'menus/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const { error: upErr } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file);
        if (upErr) { alert('Erreur upload : ' + upErr.message); photoBtn.textContent = '📷 Ajouter la photo'; return; }
        const { data: pub } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
        const m = Object.assign({}, menusCache[idx], { imageUrl: pub.publicUrl });
        await supabase.from('menus').update(menuToRow(m)).eq('id', m.id);
        await fetchMenus();
        renderAdminMenuList();
      });
      card.querySelector('.jn-admin-save').addEventListener('click', async () => {
        const m = Object.assign({}, menusCache[idx]);
        card.querySelectorAll('[data-field]').forEach((f) => {
          const field = f.dataset.field;
          m[field] = (field === 'pricePerPerson' || field === 'minGuests') ? parseFloat(f.value) || 0 : f.value;
        });
        await supabase.from('menus').update(menuToRow(m)).eq('id', m.id);
        await fetchMenus();
        const msg = document.getElementById('jn-admin-saved-msg');
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 2000);
      });
      card.querySelector('.jn-admin-delete').addEventListener('click', async () => {
        if (!confirm('Supprimer ce menu ?')) return;
        await supabase.from('menus').delete().eq('id', menusCache[idx].id);
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
        await supabase.from('photos').delete().eq('id', id);
        await fetchPhotos();
        renderAdminPhotoList();
      });
    });
  }

  async function initAdminAccess() {
    const brand = document.getElementById('brand-logo');
    if (!brand) return;
    await window.JN.ready;

    if (sessionStorage.getItem('jn_open_admin') === '1') {
      sessionStorage.removeItem('jn_open_admin');
      const { data: { session } } = await supabase.auth.getSession();
      if (session) openAdminDashboard();
    }

    brand.addEventListener('dblclick', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { openAdminDashboard(); return; }
      const modal = buildLoginModal();
      modal.classList.add('open');
      setTimeout(() => document.getElementById('jn-admin-pass').focus(), 50);
    });
  }

  function initAll() {
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