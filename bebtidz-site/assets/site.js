/* bebtidz. – site behaviour: header, menu, cart drawer, toasts, reveal, shop, product page */
(function () {
  'use strict';
  const D = window.BEBTIDZ;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chf = (n) => new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n);
  const byslug = (s) => D.products.find((p) => p.slug === s);

  const ICON = {
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    minus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    bag: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>'
  };

  /* ---------- Header shadow on scroll ---------- */
  const header = $('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const menu = $('#mobile-menu');
  const menuBtn = $('#menu-btn');
  if (menu && menuBtn) {
    const open = () => { menu.setAttribute('data-open', ''); menuBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; };
    const close = () => { menu.removeAttribute('data-open'); menuBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
    menuBtn.addEventListener('click', open);
    $$('[data-close-menu]', menu).forEach((el) => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.hasAttribute('data-open')) close(); });
  }

  /* ---------- Toasts ---------- */
  const toaster = document.createElement('div');
  toaster.className = 'toaster';
  document.body.appendChild(toaster);
  function toast(msg, opts = {}) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = `<span class="t-ic">${ICON.check}</span><span>${msg}</span>${opts.action ? `<a href="#" data-action>${opts.action}</a>` : ''}`;
    toaster.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
    if (opts.onAction) $('[data-action]', el).addEventListener('click', (e) => { e.preventDefault(); opts.onAction(); dismiss(); });
    let t = setTimeout(dismiss, 3200);
    el.addEventListener('mouseenter', () => clearTimeout(t));
    el.addEventListener('mouseleave', () => { t = setTimeout(dismiss, 1600); });
    function dismiss() {
      clearTimeout(t);
      el.classList.remove('is-in');
      el.classList.add('is-out');
      const done = () => el.remove();
      el.addEventListener('transitionend', done, { once: true });
      setTimeout(done, 400);
    }
  }

  /* ---------- Cart ---------- */
  const KEY = 'bebtidz.cart.v1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { cart = []; }
  let coupon = '';
  try { coupon = localStorage.getItem(KEY + '.coupon') || ''; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); localStorage.setItem(KEY + '.coupon', coupon); } catch (e) {} };
  const count = () => cart.reduce((n, i) => n + i.qty, 0);
  const subtotal = () => cart.reduce((n, i) => n + i.price * i.qty, 0);

  function addToCart(slug, variantIdx = 0, qty = 1) {
    const p = byslug(slug); if (!p) return;
    const v = p.variants[variantIdx] || p.variants[0];
    const id = `${slug}:${v.label}`;
    const line = cart.find((i) => i.id === id);
    if (line) line.qty += qty; else cart.push({ id, slug, name: p.name, variant: v.label, price: v.price, qty, img: p.img });
    save(); renderCart(); bumpCount();
    toast(`${p.name} (${v.label}) hinzugefügt`, { action: 'Warenkorb', onAction: openDrawer });
  }
  function setQty(id, qty) {
    const line = cart.find((i) => i.id === id); if (!line) return;
    line.qty = qty;
    if (line.qty <= 0) cart = cart.filter((i) => i.id !== id);
    save(); renderCart(); updateCount();
  }

  const countEl = $('#cart-count');
  function updateCount() {
    if (!countEl) return;
    const n = count();
    countEl.textContent = n;
    countEl.classList.toggle('is-visible', n > 0);
  }
  function bumpCount() {
    updateCount();
    if (!countEl || reduceMotion) return;
    countEl.classList.remove('is-bump');
    void countEl.offsetWidth;
    countEl.classList.add('is-bump');
  }

  /* Drawer */
  const drawerRoot = $('#cart-drawer');
  function openDrawer() { if (!drawerRoot) return; drawerRoot.setAttribute('data-open', ''); document.body.style.overflow = 'hidden'; $('#drawer-close')?.focus(); }
  function closeDrawer() { if (!drawerRoot) return; drawerRoot.removeAttribute('data-open'); document.body.style.overflow = ''; }
  $$('[data-open-cart]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); }));
  $$('[data-close-cart]').forEach((b) => b.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawerRoot?.hasAttribute('data-open')) closeDrawer(); });

  function renderCart() {
    const body = $('#drawer-body'); const foot = $('#drawer-foot');
    if (!body) return;
    if (cart.length === 0) {
      body.innerHTML = `<div class="drawer-empty">${ICON.bag}<p>Dein Warenkorb ist leer.</p><a class="btn btn-primary btn-sm" href="shop.html" data-close-cart>Zum Shop</a></div>`;
      $('[data-close-cart]', body).addEventListener('click', closeDrawer);
      if (foot) foot.hidden = true;
      return;
    }
    body.innerHTML = cart.map((i) => `
      <div class="cart-item" data-id="${i.id}">
        <img src="${i.img}" alt="" width="64" height="64">
        <div>
          <div class="ci-name">${i.name}</div>
          <div class="ci-meta">${i.variant} · ${chf(i.price)}</div>
          <div class="qty" aria-label="Menge">
            <button type="button" data-dec aria-label="Weniger">${ICON.minus}</button>
            <output>${i.qty}</output>
            <button type="button" data-inc aria-label="Mehr">${ICON.plus}</button>
          </div>
        </div>
        <div>
          <div class="ci-price">${chf(i.price * i.qty)}</div>
          <button type="button" class="remove" data-remove>Entfernen</button>
        </div>
      </div>`).join('');
    $$('.cart-item', body).forEach((row) => {
      const id = row.dataset.id; const line = cart.find((i) => i.id === id);
      $('[data-dec]', row).addEventListener('click', () => setQty(id, line.qty - 1));
      $('[data-inc]', row).addEventListener('click', () => setQty(id, line.qty + 1));
      $('[data-remove]', row).addEventListener('click', () => setQty(id, 0));
    });
    if (foot) {
      foot.hidden = false;
      const sub = subtotal();
      const disc = coupon === D.code ? sub * D.discount : 0;
      $('#sum-sub').textContent = chf(sub);
      $('#sum-disc-row').hidden = disc === 0;
      $('#sum-disc').textContent = '− ' + chf(disc);
      $('#sum-total').textContent = chf(sub - disc);
      $('#coupon-input').value = coupon;
    }
  }
  const couponForm = $('#coupon-form');
  if (couponForm) couponForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = $('#coupon-input').value.trim().toUpperCase();
    if (val === D.code) { coupon = val; save(); renderCart(); toast('Code WELCOME10 eingelöst – 10 % Rabatt'); }
    else { coupon = ''; save(); renderCart(); toast('Code ungültig'); }
  });
  renderCart(); updateCount();
  $('#checkout-btn')?.addEventListener('click', () => toast('Checkout ist noch nicht angebunden'));

  /* Copy promo code */
  $$('[data-copy-code]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(D.code); toast('Code WELCOME10 kopiert'); } catch (e) { toast('Code: WELCOME10'); }
  }));

  /* Add-to-cart buttons: morphing feedback */
  function wireAddButtons(root = document) {
    $$('[data-add]', root).forEach((btn) => {
      if (btn.dataset.wired) return; btn.dataset.wired = '1';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = btn.dataset.add;
        const vIdx = Number(btn.dataset.variant || 0);
        const qty = Number(btn.dataset.qty || 1);
        addToCart(slug, vIdx, qty);
        const label = $('.btn-label', btn); if (!label) return;
        const orig = label.innerHTML;
        btn.classList.add('is-transitioning');
        setTimeout(() => {
          btn.dataset.state = 'added';
          label.innerHTML = `${ICON.check} Hinzugefügt`;
          btn.classList.remove('is-transitioning');
        }, 200);
        setTimeout(() => {
          btn.classList.add('is-transitioning');
          setTimeout(() => { delete btn.dataset.state; label.innerHTML = orig; btn.classList.remove('is-transitioning'); }, 200);
        }, 1600);
      });
    });
  }

  /* ---------- Product card template ---------- */
  function cardHTML(p, i) {
    return `
      <article class="card reveal" style="--d:${Math.min(i, 7) * 60}ms" data-cat="${p.category}">
        <div class="card-media">
          ${p.bestseller ? '<span class="badge blue">Bestseller</span>' : ''}
          <img src="${p.img}" alt="${p.name} Vial" loading="lazy" width="600" height="600">
          <a class="card-link" href="produkt.html?p=${p.slug}" aria-label="${p.name} ansehen"></a>
        </div>
        <div class="card-body">
          <div class="card-top">
            <div>
              <h3 class="h-card"><a href="produkt.html?p=${p.slug}">${p.name}</a></h3>
              <div class="card-cat">${p.category} · ${p.purity}</div>
            </div>
            <div class="price"><small>ab</small>${chf(p.price)}</div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" data-add="${p.slug}"><span class="btn-label">In den Warenkorb</span></button>
        </div>
      </article>`;
  }

  /* Home: bestsellers */
  const best = $('#bestseller-grid');
  if (best) { best.innerHTML = D.products.filter((p) => p.bestseller).map(cardHTML).join(''); wireAddButtons(best); }

  /* Shop: grid + tabs */
  const shopGrid = $('#shop-grid');
  if (shopGrid) {
    shopGrid.innerHTML = D.products.map(cardHTML).join('');
    wireAddButtons(shopGrid);
    const tabs = $('#tabs');
    const base = $('.tabs-list.base', tabs);
    const active = $('.tabs-list.active-layer', tabs);
    const baseBtns = $$('button', base);
    const params = new URLSearchParams(location.search);
    let current = D.categories.includes(params.get('k')) ? params.get('k') : 'Alle';
    function moveIndicator() {
      const idx = D.categories.indexOf(current);
      const b = baseBtns[idx];
      const left = b.offsetLeft - base.offsetLeft;
      const right = base.offsetWidth - (left + b.offsetWidth);
      active.style.clipPath = `inset(0 ${right}px 0 ${left}px round 999px)`;
    }
    function applyFilter() {
      $$('.card', shopGrid).forEach((c) => {
        const show = current === 'Alle' || c.dataset.cat === current;
        if (show) { c.removeAttribute('data-hidden'); c.classList.add('is-visible'); }
        else c.setAttribute('data-hidden', '');
      });
      baseBtns.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.cat === current)));
      moveIndicator();
      $('#shop-count').textContent = `${$$('.card:not([data-hidden])', shopGrid).length} Produkte`;
    }
    baseBtns.forEach((b) => b.addEventListener('click', () => {
      current = b.dataset.cat; applyFilter();
      history.replaceState(null, '', current === 'Alle' ? 'shop.html' : `shop.html?k=${encodeURIComponent(current)}`);
    }));
    // indicator first paint without transition
    active.style.transition = 'none'; applyFilter(); void active.offsetWidth; active.style.transition = '';
    window.addEventListener('resize', moveIndicator);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
  }

  /* Product page */
  const pdp = $('#pdp');
  if (pdp) {
    const slug = new URLSearchParams(location.search).get('p');
    const p = byslug(slug) || D.products[0];
    document.title = `${p.name} – Bebtidz`;
    let vIdx = 0, qty = 1;
    const imgs = [p.img, 'assets/img/hero.jpg', 'assets/img/lab-hplc.jpg'];
    pdp.innerHTML = `
      <div class="gallery">
        <div class="gallery-main">
          ${imgs.map((src, i) => `<img src="${src}" alt="${p.name}" class="${i === 0 ? 'is-active' : ''}" ${i === 0 ? '' : 'loading="lazy"'}>`).join('')}
        </div>
        <div class="thumbs" role="tablist" aria-label="Produktbilder">
          ${imgs.map((src, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}"><img src="${src}" alt=""></button>`).join('')}
        </div>
      </div>
      <div class="pdp-info">
        <span class="eyebrow">${p.category}</span>
        <h1>${p.name}</h1>
        <div class="pdp-price"><span class="cur">CHF</span><span id="pdp-price">${p.variants[0].price.toFixed(2)}</span></div>
        <p class="lead">${p.description}</p>
        <dl class="spec">
          <dt>Reinheit</dt><dd>${p.purity}</dd>
          <dt>Form</dt><dd>${p.category === 'Zubehör' ? 'Steril, flüssig' : 'Lyophilisiertes Pulver'}</dd>
          <dt>Zertifikat</dt><dd>COA (HPLC/MS) pro Charge</dd>
          <dt>Lagerung</dt><dd>${p.category === 'Zubehör' ? 'Raumtemperatur, lichtgeschützt' : '−20 °C, trocken und lichtgeschützt'}</dd>
        </dl>
        <div>
          <div class="field-label">Menge pro Vial</div>
          <div class="chips" id="variants">${p.variants.map((v, i) => `<button type="button" class="chip" aria-pressed="${i === 0}" data-v="${i}">${v.label}</button>`).join('')}</div>
        </div>
        <div class="buy-row">
          <div class="qty" aria-label="Anzahl">
            <button type="button" id="q-dec" aria-label="Weniger">${ICON.minus}</button>
            <output id="q-out">1</output>
            <button type="button" id="q-inc" aria-label="Mehr">${ICON.plus}</button>
          </div>
          <button type="button" class="btn btn-primary" id="pdp-add" data-add="${p.slug}" data-variant="0" data-qty="1"><span class="btn-label">In den Warenkorb</span></button>
        </div>
        <ul class="pdp-perks">
          <li>${ICON.check} Diskreter Versand in 4–7 Werktagen</li>
          <li>${ICON.check} Analysezertifikat liegt jeder Bestellung bei</li>
          <li>${ICON.check} Rückgabe ungeöffnet innert 14 Tagen</li>
        </ul>
        <div class="note">Ausschliesslich für Forschungs- und Laborzwecke. Nicht für den menschlichen oder tierischen Gebrauch bestimmt.</div>
      </div>`;
    const addBtn = $('#pdp-add');
    const priceEl = $('#pdp-price');
    $$('#variants .chip').forEach((c) => c.addEventListener('click', () => {
      vIdx = Number(c.dataset.v);
      $$('#variants .chip').forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
      addBtn.dataset.variant = vIdx;
      priceEl.textContent = (p.variants[vIdx].price * qty).toFixed(2);
    }));
    const out = $('#q-out');
    const setQ = (n) => { qty = Math.max(1, Math.min(20, n)); out.textContent = qty; addBtn.dataset.qty = qty; priceEl.textContent = (p.variants[vIdx].price * qty).toFixed(2); };
    $('#q-dec').addEventListener('click', () => setQ(qty - 1));
    $('#q-inc').addEventListener('click', () => setQ(qty + 1));
    $$('.thumbs button').forEach((b) => b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      $$('.gallery-main img').forEach((im, k) => im.classList.toggle('is-active', k === i));
      $$('.thumbs button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    }));
    wireAddButtons(pdp);
    // related
    const rel = $('#related-grid');
    if (rel) { rel.innerHTML = D.products.filter((x) => x.slug !== p.slug).slice(0, 3).map(cardHTML).join(''); wireAddButtons(rel); }
  }

  wireAddButtons(document);

  /* ---------- Scroll reveal (once) ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  const observeReveals = () => $$('.reveal:not(.is-visible), .reveal-clip:not(.is-visible)').forEach((el) => io.observe(el));
  observeReveals();
  // elements rendered by JS above
  new MutationObserver(observeReveals).observe(document.body, { childList: true, subtree: true });

  /* Hero image loaded state */
  const heroFig = $('.hero-figure');
  if (heroFig) {
    const img = $('img', heroFig);
    const done = () => heroFig.classList.add('is-loaded');
    if (img.complete) requestAnimationFrame(done); else img.addEventListener('load', done, { once: true });
  }

  /* Count-up stats (marketing, once) */
  $$('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count); const suffix = el.dataset.suffix || '';
    const obs = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return; obs.disconnect();
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const start = performance.now(); const dur = 1100;
      const tick = (t) => {
        const k = Math.min(1, (t - start) / dur); const e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(target * e) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* Contact form (no backend: opens mail client) */
  const cf = $('#contact-form');
  if (cf) cf.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(cf);
    const body = encodeURIComponent(`${f.get('message')}\n\n— ${f.get('name')} (${f.get('email')})`);
    location.href = `mailto:info@bebtidz.ch?subject=${encodeURIComponent('Anfrage über bebtidz.com')}&body=${body}`;
    toast('E-Mail-Programm wird geöffnet');
  });

  /* Year */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
