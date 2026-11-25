/* =========================================================
   RE | SKIN – Interaktionen
   ========================================================= */

/* ---------------------------------------------------------
   1) STUDIO-DATEN  ->  HIER ANPASSEN
   Alle mit «PLATZHALTER» markierten Werte durch echte Daten ersetzen.
   --------------------------------------------------------- */
const CONFIG = {
  phone: '+41 00 000 00 00',               // PLATZHALTER
  whatsapp: '41000000000',                 // PLATZHALTER – Nummer ohne + und Leerzeichen
  email: 'hallo@reskin.ch',                // PLATZHALTER
  instagram: 'reskin',                     // PLATZHALTER – Instagram-Name ohne @
  address: ['Musterstrasse 1', '8000 Zürich'], // PLATZHALTER
  // Öffnungszeiten: 0 = Sonntag … 6 = Samstag. Fehlender Tag = geschlossen.
  hours: { 2: ['10:00', '18:30'], 3: ['10:00', '18:30'], 4: ['10:00', '18:30'], 5: ['10:00', '18:30'], 6: ['09:00', '14:30'] },
  slotMinutes: 30,
  bookingDays: 28,
  // Optional: Formular-Endpunkt (z. B. Formspree «https://formspree.io/f/xxxx»).
  // Leer lassen = Anfrage wird per WhatsApp oder E-Mail verschickt.
  formEndpoint: ''
};

/* Preise pro Sitzung in CHF – PLATZHALTER ausser «ab 29.–», «ab 149.–» und «Achseln 35.–» */
const SERVICES = {
  haar: {
    name: 'Laser-Haarentfernung', multi: true, title: 'Welche Zonen?', hint: 'Mehrfachauswahl möglich.',
    zones: [
      { n: 'Oberlippe', p: 29 }, { n: 'Kinn', p: 29 }, { n: 'Gesicht komplett', p: 89 },
      { n: 'Achseln', p: 59, first: 35 }, { n: 'Unterarme', p: 99 }, { n: 'Bikinizone', p: 79 },
      { n: 'Intim komplett', p: 129 }, { n: 'Unterschenkel', p: 149 }, { n: 'Beine komplett', p: 249 },
      { n: 'Bauch', p: 89 }, { n: 'Brust', p: 129 }, { n: 'Rücken', p: 179 }
    ]
  },
  tattoo: {
    name: 'Tattooentfernung', multi: false, title: 'Wie gross ist das Tattoo?', hint: 'Ungefähr reicht – wir schauen es uns vor Ort genau an.',
    zones: [
      { n: 'XS', d: 'bis 3 × 3 cm', p: 149 }, { n: 'S', d: 'bis 5 × 5 cm', p: 179 }, { n: 'M', d: 'bis 10 × 10 cm', p: 229 },
      { n: 'L', d: 'bis 15 × 15 cm', p: 289 }, { n: 'XL', d: 'grösser', p: null }
    ]
  },
  beratung: {
    name: 'Kostenlose Beratung', multi: true, title: 'Worum geht es?', hint: 'Damit wir uns gut vorbereiten können.',
    zones: [{ n: 'Haarentfernung' }, { n: 'Tattooentfernung' }, { n: 'Ich weiss es noch nicht' }]
  }
};

const FAQ = [
  ['Tut die Laserbehandlung weh?', 'Die meisten beschreiben es als kurzes Zwicken, ähnlich wie ein Gummiband, das auf die Haut schnippt. Wir kühlen während der Behandlung und passen die Einstellungen an dich an. Bei der Tattooentfernung ist es etwas intensiver – wir machen jederzeit eine Pause, wenn du sie brauchst.'],
  ['Wie viele Sitzungen brauche ich?', 'Bei der Haarentfernung sind es meist 6 bis 10 Sitzungen im Abstand von 4 bis 8 Wochen. Bei Tattoos hängt es von Farbe, Tiefe und Alter ab – oft 6 bis 12 Sitzungen mit 6 bis 8 Wochen Pause. In der Beratung bekommst du eine ehrliche Einschätzung.'],
  ['Warum reicht eine Sitzung nicht?', 'Der Laser wirkt nur auf Haare in der Wachstumsphase. Das ist immer nur ein Teil deiner Haare – die anderen ruhen gerade und kommen erst später nach. Deshalb wiederholen wir die Behandlung, bis alle Haare einmal «dran» waren. Oben bei «So läuft’s ab» kannst du es ausprobieren.'],
  ['Wie bereite ich mich auf die Haarentfernung vor?', 'Rasiere die Zone etwa 24 Stunden vorher. Bitte nicht wachsen, epilieren oder zupfen. Am Behandlungstag keine Lotion, kein Deo und kein Make-up auf der Zone. Und zwei Wochen vorher kein Solarium und kein Selbstbräuner.'],
  ['Was muss ich nach der Behandlung beachten?', 'Schütze die behandelte Haut mit Sonnenschutz SPF 50. Verzichte 48 Stunden auf Sauna, Dampfbad, Schwimmbad und intensiven Sport. Eine leichte Rötung ist normal und klingt meist innerhalb weniger Stunden ab.'],
  ['Funktioniert das bei jedem Haut- und Haartyp?', 'Am besten wirkt der Laser bei dunklen Haaren. Sehr helle, rote oder graue Haare sprechen weniger an. Wir schauen uns deinen Haut- und Haartyp in der Beratung an und sagen dir ehrlich, was realistisch ist.'],
  ['Kann jedes Tattoo entfernt werden?', 'Viele Tattoos lassen sich vollständig entfernen oder so stark aufhellen, dass ein Cover-up problemlos möglich ist. Schwarz und Dunkelblau gehen am besten, manche Farben brauchen mehr Geduld. Eine Garantie gibt es nie – aber eine ehrliche Prognose.'],
  ['Gibt es Gründe, die gegen eine Behandlung sprechen?', 'Ja, zum Beispiel eine Schwangerschaft, frische Bräune, bestimmte Medikamente (etwa lichtempfindlich machende) oder Hautentzündungen in der Zone. Sag uns bei der Beratung einfach, was du nimmst oder hast – wir klären das gemeinsam.'],
  ['Kann ich einen Termin verschieben?', 'Klar. Bitte melde dich mindestens 24 Stunden vorher per WhatsApp, Telefon oder E-Mail – dann finden wir gemeinsam einen neuen Termin.']
];


/* --------------------------------------------------------- */
document.documentElement.classList.add('js');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const chf = n => 'CHF ' + n + '.–';
const pad = n => String(n).padStart(2, '0');
const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/* ---------- Hero-Intro erst starten, wenn die Schrift bereit ist ---------- */
(function heroStart() {
  const hero = $('.hero'); if (!hero) return;
  const go = () => hero.classList.add('is-go');
  if (document.fonts && document.fonts.load) {
    Promise.race([document.fonts.load('500 1em "Cormorant Garamond"'), new Promise(r => setTimeout(r, 1200))]).then(go, go);
  } else go();
})();

/* ---------- Kontaktdaten einsetzen ---------- */
function hoursRows() {
  const order = [1, 2, 3, 4, 5, 6, 0], rows = [], closed = [];
  for (let k = 0; k < order.length;) {
    const d = order[k], h = CONFIG.hours[d];
    if (!h) { closed.push(DAY_NAMES[d]); k++; continue; }
    let j = k;
    while (j + 1 < order.length && JSON.stringify(CONFIG.hours[order[j + 1]]) === JSON.stringify(h)) j++;
    rows.push((j > k ? DAY_NAMES[d] + '–' + DAY_NAMES[order[j]] : DAY_NAMES[d]) + ' ' + h[0] + '–' + h[1]);
    k = j + 1;
  }
  if (closed.length) rows.push(closed.join(' & ') + ' geschlossen');
  return rows;
}
const cfgValues = {
  phone: CONFIG.phone,
  email: CONFIG.email,
  instagram: '@' + CONFIG.instagram,
  addressHtml: CONFIG.address.join('<br>'),
  hoursHtml: hoursRows().join('<br>'),
  telLink: 'tel:' + CONFIG.phone.replace(/\s/g, ''),
  mailLink: 'mailto:' + CONFIG.email,
  instagramLink: 'https://instagram.com/' + CONFIG.instagram,
  whatsappLink: 'https://wa.me/' + CONFIG.whatsapp,
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('RE SKIN ' + CONFIG.address.join(', '))
};
$$('[data-cfg]').forEach(el => { el.innerHTML = cfgValues[el.dataset.cfg]; });
$$('[data-cfg-href]').forEach(el => { el.href = cfgValues[el.dataset.cfgHref]; });
$('#year').textContent = new Date().getFullYear();

/* ---------- Strukturierte Daten für Google (Studio + FAQ) ---------- */
(function seo() {
  const zip = (CONFIG.address[1] || '').split(' ');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const data = [{
    '@context': 'https://schema.org', '@type': 'BeautySalon', name: 'RE | SKIN – Tattoo- & Haarentfernung',
    url: location.origin + location.pathname, telephone: CONFIG.phone, email: CONFIG.email, priceRange: 'CHF 29–289',
    address: { '@type': 'PostalAddress', streetAddress: CONFIG.address[0], postalCode: zip[0], addressLocality: zip.slice(1).join(' '), addressCountry: 'CH' },
    openingHoursSpecification: Object.entries(CONFIG.hours).map(([d, h]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: days[d], opens: h[0], closes: h[1] })),
    sameAs: ['https://instagram.com/' + CONFIG.instagram]
  }, {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  }];
  const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
})();

/* ---------- Palmenschatten zeichnen ---------- */
(function drawPalm() {
  const g = $('#palmG'); if (!g) return;
  const ns = 'http://www.w3.org/2000/svg';
  const S = { x: 940, y: 40 };
  const fronds = [ // Winkel (Grad), Länge, Krümmung
    [150, 720, 90], [172, 640, -70], [128, 760, 120], [196, 520, -60], [108, 600, 80], [216, 420, -40]
  ];
  let d = '';
  const f = n => n.toFixed(1);
  fronds.forEach(([deg, L, bend]) => {
    const a = deg * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
    const E = { x: S.x + dx * L, y: S.y + dy * L };
    const C = { x: S.x + dx * L * .5 - dy * bend, y: S.y + dy * L * .5 + dx * bend + L * .12 };
    const pt = t => ({ x: (1 - t) ** 2 * S.x + 2 * (1 - t) * t * C.x + t * t * E.x, y: (1 - t) ** 2 * S.y + 2 * (1 - t) * t * C.y + t * t * E.y });
    const tan = t => { const x = 2 * (1 - t) * (C.x - S.x) + 2 * t * (E.x - C.x), y = 2 * (1 - t) * (C.y - S.y) + 2 * t * (E.y - C.y); const m = Math.hypot(x, y); return { x: x / m, y: y / m }; };
    // Stiel
    const stem = document.createElementNS(ns, 'path');
    stem.setAttribute('d', `M${f(S.x)} ${f(S.y)}Q${f(C.x)} ${f(C.y)} ${f(E.x)} ${f(E.y)}`);
    stem.setAttribute('stroke', 'currentColor'); stem.setAttribute('stroke-width', '7'); stem.setAttribute('fill', 'none');
    g.appendChild(stem);
    // Blättchen
    for (let t = .12; t < .99; t += .034) {
      const B = pt(t), T = tan(t);
      const len = L * .34 * (0.3 + 0.7 * Math.sin(Math.PI * Math.min(1, t * 1.05)));
      [-1, 1].forEach(side => {
        const ang = side * (58 - t * 18) * Math.PI / 180;
        const vx = T.x * Math.cos(ang) - T.y * Math.sin(ang), vy = T.x * Math.sin(ang) + T.y * Math.cos(ang);
        const tip = { x: B.x + vx * len, y: B.y + vy * len + len * .18 };
        const w = len * .075, px = -vy * w, py = vx * w;
        const m1 = { x: B.x + vx * len * .45 + px, y: B.y + vy * len * .45 + py + len * .04 };
        const m2 = { x: B.x + vx * len * .45 - px, y: B.y + vy * len * .45 - py + len * .04 };
        d += `M${f(B.x)} ${f(B.y)}Q${f(m1.x)} ${f(m1.y)} ${f(tip.x)} ${f(tip.y)}Q${f(m2.x)} ${f(m2.y)} ${f(B.x)} ${f(B.y)}Z`;
      });
    }
  });
  const leaves = document.createElementNS(ns, 'path');
  leaves.setAttribute('d', d); leaves.setAttribute('fill', 'currentColor');
  g.appendChild(leaves);
})();

/* ---------- Header ---------- */
const hdr = $('.hdr');
const onScroll = () => hdr.classList.toggle('is-scrolled', scrollY > 12 || burger.getAttribute('aria-expanded') === 'true');
const burger = $('.hdr-burger'), mnav = $('#mnav');
addEventListener('scroll', onScroll, { passive: true }); onScroll();

function setMenu(open) {
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
  if (open) { mnav.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => mnav.classList.add('is-open'))); }
  else { mnav.classList.remove('is-open'); setTimeout(() => { if (burger.getAttribute('aria-expanded') === 'false') mnav.hidden = true; }, 220); }
  onScroll();
}
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
$$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', e => { if (burger.getAttribute('aria-expanded') === 'true' && !hdr.contains(e.target)) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); } });
matchMedia('(min-width: 981px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

/* Aktiven Bereich in der Navigation markieren */
(function scrollSpy() {
  const links = $$('.hdr-nav a, .mnav a:not(.btn)');
  const map = { behandlungen: 'behandlungen', studio: 'behandlungen', ablauf: 'ablauf', care: 'ablauf', preise: 'preise', faq: 'faq', kontakt: 'kontakt' };
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const key = map[e.target.id];
    links.forEach(a => { if (key && a.getAttribute('href') === '#' + key) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id], .hero').forEach(s => spy.observe(s));
})();

/* ---------- Scroll-Reveal (einmalig, gestaffelt) ---------- */
const groups = new Map();
$$('.reveal').forEach(el => {
  const p = el.parentElement; const i = groups.get(p) || 0; groups.set(p, i + 1);
  el.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms');
});
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
$$('.reveal').forEach(el => io.observe(el));

/* ---------- Mobile Buchungsleiste ---------- */
const mbar = $('#mbar');
const vis = { hero: true, book: false, foot: false };
const barIO = new IntersectionObserver(es => {
  es.forEach(e => { vis[e.target.dataset.bar] = e.isIntersecting; });
  mbar.classList.toggle('is-on', !vis.hero && !vis.book && !vis.foot);
}, { threshold: 0 });
$('.hero').dataset.bar = 'hero'; $('#termin').dataset.bar = 'book'; $('.ftr').dataset.bar = 'foot';
barIO.observe($('.hero')); barIO.observe($('#termin')); barIO.observe($('.ftr'));

/* ---------- Haarzyklus-Erklärung ---------- */
(function hairCycle() {
  const box = $('#hairs'); if (!box) return;
  const N = 24, MAX = 8;
  // deterministischer Zufall, damit es bei jedem Laden gleich aussieht
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const hairs = Array.from({ length: N }, () => ({ phase: Math.floor(rnd() * 4), hit: rnd(), h: 46 + rnd() * 70, gone: false }));
  hairs.forEach(h => { const el = document.createElement('i'); el.className = 'hair'; el.style.setProperty('--h', h.h + 'px'); h.el = el; box.appendChild(el); });
  let session = 0, busy = false;
  const btn = $('#cycleNext'), label = $('#cycleLabel'), bar = $('#cycleBar');
  const active = h => !h.gone && (h.phase + session) % 4 === 0;
  function paint() {
    hairs.forEach(h => {
      h.el.classList.toggle('is-gone', h.gone);
      h.el.classList.toggle('is-active', active(h));
      h.el.classList.toggle('is-rest', !h.gone && !active(h));
    });
    const gone = hairs.filter(h => h.gone).length;
    bar.style.transform = `scaleX(${gone / N})`;
    label.textContent = session === 0 ? 'Vor der ersten Sitzung' : `Nach Sitzung ${session}: ca. ${Math.round(gone / N * 100)} % weniger Haare`;
    const done = session >= MAX || gone === N;
    btn.disabled = done;
    btn.firstElementChild.textContent = done ? 'Glatte Haut ✓' : 'Nächste Sitzung';
  }
  btn.addEventListener('click', () => {
    if (busy) return; busy = true;
    const targets = hairs.filter(active);
    targets.forEach(h => h.el.classList.add('is-zap'));
    setTimeout(() => {
      targets.forEach(h => { h.el.classList.remove('is-zap'); if (h.hit < .75) h.gone = true; else h.hit = 0; });
      session++; paint(); busy = false;
    }, reduce ? 50 : 380);
  });
  $('#cycleReset').addEventListener('click', () => {
    seed = 7; hairs.forEach(h => { h.gone = false; h.phase = Math.floor(rnd() * 4); h.hit = rnd(); rnd(); });
    session = 0; paint();
  });
  paint();
})();

/* ---------- Preisliste mit Segment-Umschalter ---------- */
(function prices() {
  const seg = $('.seg'), list = $('#plist'), panel = $('#ppanel'), tabs = $$('[role="tab"]', seg);
  function render(key) {
    const s = SERVICES[key];
    list.innerHTML = s.zones.map(z => `
      <li><span class="pn">${z.n}${z.d ? ` <span class="pd">${z.d}</span>` : ''}${z.first ? '<span class="tag">1. Behandlung</span>' : ''}</span>
      <span class="pdots" aria-hidden="true"></span>
      <span class="pp">${z.p == null ? 'auf Anfrage' : z.first ? `<s aria-label="statt ${z.p} Franken">${z.p}.–</s> ${z.first}.–` : z.p + '.–'}</span></li>`).join('');
  }
  function select(i, focus) {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; });
    seg.dataset.i = i; panel.setAttribute('aria-labelledby', tabs[i].id);
    render(tabs[i].dataset.tab); if (focus) tabs[i].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select((i + 1) % 2, true); } });
  });
  select(0);
})();

/* ---------- FAQ (Akkordeon) ---------- */
(function faq() {
  const box = $('#faqList');
  box.innerHTML = FAQ.map(([q, a], i) => `
    <div class="faq-item">
      <h3><button class="faq-q" type="button" aria-expanded="false" aria-controls="fa${i}" id="fq${i}">${q}<span class="faq-ico" aria-hidden="true"></span></button></h3>
      <div class="faq-a" id="fa${i}" role="region" aria-labelledby="fq${i}"><div><p>${a}</p></div></div>
    </div>`).join('');
  $$('.faq-q', box).forEach(b => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open);
    b.closest('.faq-item').classList.toggle('is-open', open);
  }));
})();

/* ---------- Pfeiltasten in Auswahlgruppen (Tage, Uhrzeiten) ---------- */
function arrowNav(box, sel) {
  box.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const items = $$(sel, box).filter(b => !b.disabled), i = items.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const n = items[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
    n.focus(); n.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
}

/* ---------- Terminbuchung ---------- */
(function booking() {
  const form = $('#book');
  const steps = $$('.bstep', form), dots = $$('.book-steps li', form);
  const next = $('#bNext'), back = $('#bBack'), err = $('#bErr');
  const st = { step: 1, service: null, zones: [], date: null, time: null, busy: false };
  const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
  const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const fmtDate = d => `${DAY_NAMES[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  next.disabled = false;

  function go(n, dir = 1, focus = true) {
    st.step = n;
    steps.forEach(s => { const on = +s.dataset.step === n; s.classList.toggle('is-on', on); s.classList.toggle('is-back', on && dir < 0); });
    dots.forEach((d, i) => {
      const done = i + 1 < n;
      d.classList.toggle('is-on', i + 1 === n); d.classList.toggle('is-done', done);
      d.firstElementChild.tabIndex = done ? 0 : -1;
      if (i + 1 === n) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
    back.hidden = n === 1 || n === 5;
    form.classList.toggle('is-done', n === 5);
    next.firstElementChild.textContent = n === 4 ? 'Anfrage senden' : 'Weiter';
    setErr('');
    if (n === 2) renderZones();
    if (n === 3) renderDays();
    if (n === 4) renderSummary($('#summary'));
    if (focus) {
      const h = n === 5 ? $('[data-step="5"]') : $('.bstep.is-on .bstep-h', form);
      h.tabIndex = -1; h.focus({ preventScroll: true });
    }
  }
  const setErr = t => { err.textContent = t; };
  const scrollToForm = () => {
    const r = form.getBoundingClientRect();
    if (r.top < 0 || r.top > innerHeight * .4) form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  // Fortschritt: erledigte Schritte sind anklickbar
  dots.forEach((d, i) => d.firstElementChild.addEventListener('click', () => { if (i + 1 < st.step && st.step < 5) go(i + 1, -1); }));

  // Schritt 1
  $$('input[name="service"]', form).forEach(r => r.addEventListener('change', () => {
    if (st.service !== r.value) st.zones = [];
    st.service = r.value; setErr('');
  }));

  // Schritt 2
  function renderZones() {
    const s = SERVICES[st.service];
    $('#zoneTitle').textContent = s.title; $('#zoneHint').textContent = s.hint;
    const type = s.multi ? 'checkbox' : 'radio';
    $('#zones').innerHTML = s.zones.map((z, i) => `
      <label class="chip"><input type="${type}" name="zone" value="${i}" ${st.zones.includes(i) ? 'checked' : ''}>
      <span>${z.n}${z.d ? ` <small>${z.d}</small>` : ''}${z.p ? ` <small>${z.p}.–</small>` : ''}</span></label>`).join('');
    $$('#zones input').forEach(inp => inp.addEventListener('change', () => {
      st.zones = $$('#zones input:checked').map(x => +x.value); zoneSum(); setErr('');
    }));
    zoneSum();
  }
  function priceOf() {
    const s = SERVICES[st.service]; let sum = 0, open = false, promo = false;
    st.zones.forEach(i => { const z = s.zones[i]; if (z.p == null) open = true; else sum += z.p; if (z.first) promo = true; });
    return { sum, open, promo, free: st.service === 'beratung' };
  }
  const priceText = p => p.free ? 'kostenlos' : p.open && !p.sum ? 'nach Absprache' : chf(p.sum) + (p.open ? ' + Anfrage' : '');
  function zoneSum() {
    const el = $('#zoneSum'); const p = priceOf();
    if (!st.zones.length) { el.textContent = ''; return; }
    if (p.free) { el.innerHTML = 'Die Beratung ist <b>kostenlos</b> und unverbindlich.'; return; }
    el.innerHTML = `Richtpreis pro Sitzung: <b>${priceText(p)}</b><br><span style="color:var(--muted)">Deine erste Behandlung wird günstiger: −20 % für Neukunden${p.promo ? ', Achseln 35.–' : ''}.</span>`;
  }

  // Schritt 3
  const daysEl = $('#days'), slotsEl = $('#slots'), pick = $('#pickInfo');
  arrowNav(daysEl, '.day'); arrowNav(slotsEl, '.slot');
  function slotList(date) {
    const h = CONFIG.hours[date.getDay()]; if (!h) return [];
    const out = []; const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    for (let m = toMin(h[0]); m <= toMin(h[1]); m += CONFIG.slotMinutes) {
      if (isToday && m < now.getHours() * 60 + now.getMinutes() + 120) continue; // min. 2 Std. Vorlauf
      out.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60));
    }
    return out;
  }
  function renderDays() {
    if (daysEl.childElementCount) return;
    const base = new Date(); base.setHours(0, 0, 0, 0);
    for (let i = 0; i < CONFIG.bookingDays; i++) {
      const d = new Date(base); d.setDate(base.getDate() + i);
      const b = document.createElement('button');
      const free = slotList(d).length > 0;
      b.type = 'button'; b.className = 'day'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false');
      b.disabled = !free;
      b.setAttribute('aria-label', fmtDate(d) + (free ? '' : ', geschlossen'));
      b.innerHTML = `<small>${i === 0 ? 'Heute' : i === 1 ? 'Morgen' : DAY_NAMES[d.getDay()]}</small><b>${d.getDate()}</b><em>${MONTHS[d.getMonth()]}</em>`;
      b.addEventListener('click', () => pickDay(b, d));
      daysEl.appendChild(b);
    }
    navState();
  }
  function navState() {
    const [l, r] = $$('.days-nav', form);
    l.disabled = daysEl.scrollLeft < 4;
    r.disabled = daysEl.scrollLeft + daysEl.clientWidth > daysEl.scrollWidth - 4;
  }
  daysEl.addEventListener('scroll', navState, { passive: true });
  function pickDay(b, d) {
    $$('.day', daysEl).forEach(x => x.setAttribute('aria-checked', x === b));
    st.date = d; st.time = null;
    const list = slotList(d);
    slotsEl.innerHTML = list.map((t, i) => `<button type="button" class="slot" role="radio" aria-checked="false" style="animation-delay:${Math.min(i, 12) * 18}ms">${t}</button>`).join('');
    $$('.slot', slotsEl).forEach(s => s.addEventListener('click', () => {
      $$('.slot', slotsEl).forEach(x => x.setAttribute('aria-checked', x === s));
      st.time = s.textContent; pickText(); setErr('');
    }));
    pickText(); setErr('');
  }
  function pickText() {
    if (!st.date) { pick.textContent = ''; return; }
    pick.innerHTML = st.time ? `Dein Wunschtermin: <b>${fmtDate(st.date)}, ${st.time} Uhr</b>` : `${fmtDate(st.date)} – jetzt noch eine Uhrzeit wählen.`;
  }
  $$('.days-nav', form).forEach(b => b.addEventListener('click', () => daysEl.scrollBy({ left: +b.dataset.dir * daysEl.clientWidth * .8, behavior: reduce ? 'auto' : 'smooth' })));

  // Schritt 4
  function data() {
    const fd = new FormData(form);
    const s = SERVICES[st.service];
    return {
      Behandlung: s.name,
      Auswahl: st.zones.map(i => s.zones[i].n + (s.zones[i].d ? ' (' + s.zones[i].d + ')' : '')).join(', '),
      Datum: st.date ? fmtDate(st.date) : '',
      Uhrzeit: st.time || '',
      Name: (fd.get('name') || '').trim(),
      Telefon: (fd.get('tel') || '').trim(),
      'E-Mail': (fd.get('email') || '').trim(),
      Nachricht: (fd.get('msg') || '').trim(),
      Neukunde: fd.get('new') ? 'Ja' : 'Nein'
    };
  }
  function renderSummary(el) {
    const d = data(); const p = priceOf();
    let price = priceText(p);
    if (form.elements.new.checked && !p.free && p.sum) price += ' <small style="color:var(--muted)">– Neukunden-Rabatt wird abgezogen</small>';
    el.innerHTML = [['Behandlung', d.Behandlung], ['Auswahl', d.Auswahl], ['Termin', d.Datum + ', ' + d.Uhrzeit + ' Uhr'], ['Richtpreis', price]]
      .map(([k, v]) => `<div><span>${k}</span><span>${v}</span></div>`).join('');
  }
  form.elements.new.addEventListener('change', () => renderSummary($('#summary')));

  const RULES = {
    name: [v => v.trim().length > 1, 'Bitte gib deinen Namen ein.'],
    tel: [v => v.replace(/\D/g, '').length >= 9, 'Bitte gib eine gültige Telefonnummer ein, z. B. 079 123 45 67.'],
    email: [v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'Bitte gib eine gültige E-Mail-Adresse ein.']
  };
  function checkField(name) {
    const el = form.elements[name], [test, msg] = RULES[name], ok = test(el.value);
    el.closest('.field').classList.toggle('is-bad', !ok);
    el.setAttribute('aria-invalid', !ok);
    $('#e-' + name).textContent = ok ? '' : msg;
    return ok;
  }
  function validate() {
    let first = null;
    Object.keys(RULES).forEach(n => { if (!checkField(n) && !first) first = form.elements[n]; });
    const c = form.elements.consent;
    c.closest('.tgl').classList.toggle('is-bad', !c.checked);
    if (!c.checked && !first) first = c;
    if (first) { setErr(c.checked ? 'Bitte prüfe die markierten Felder.' : 'Bitte prüfe die markierten Felder und bestätige die Einwilligung.'); first.focus(); return false; }
    return true;
  }
  Object.keys(RULES).forEach(n => {
    const el = form.elements[n];
    el.addEventListener('blur', () => { if (el.value) checkField(n); });
    el.addEventListener('input', () => { if (el.closest('.field').classList.contains('is-bad')) checkField(n); });
  });
  form.elements.consent.addEventListener('change', e => e.target.closest('.tgl').classList.toggle('is-bad', !e.target.checked));

  function messageText(d) {
    return `Hallo RE | SKIN, ich möchte gerne einen Termin anfragen:\n\n` +
      Object.entries(d).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nVielen Dank!`;
  }
  const icsEsc = s => String(s).replace(/[\\,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
  function icsFile(d) {
    const s = new Date(st.date); const [h, m] = st.time.split(':').map(Number); s.setHours(h, m, 0, 0);
    const e = new Date(s.getTime() + 45 * 60000);
    const f = x => x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + 'T' + pad(x.getHours()) + pad(x.getMinutes()) + '00';
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//RESKIN//Termin//DE', 'BEGIN:VEVENT',
      'UID:' + Date.now() + '@reskin', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(s), 'DTEND:' + f(e),
      'SUMMARY:' + icsEsc('RE | SKIN – ' + d.Behandlung + ' (angefragt)'), 'LOCATION:' + icsEsc(CONFIG.address.join(', ')),
      'DESCRIPTION:' + icsEsc('Terminanfrage – die Bestätigung folgt.'), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  }

  async function submit() {
    if (st.busy || !validate()) return;
    st.busy = true;
    const d = data();
    next.classList.add('is-loading'); next.setAttribute('aria-busy', 'true');
    let sent = false;
    if (CONFIG.formEndpoint) {
      try {
        const r = await fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) });
        sent = r.ok;
      } catch (_) { sent = false; }
    } else {
      await new Promise(r => setTimeout(r, 500));
    }
    next.classList.remove('is-loading'); next.removeAttribute('aria-busy'); st.busy = false;
    const first = d.Name.split(' ')[0];
    const txt = encodeURIComponent(messageText(d));
    const wa = `<a class="btn btn-dark btn-sm" href="https://wa.me/${CONFIG.whatsapp}?text=${txt}" target="_blank" rel="noopener"><span>Per WhatsApp senden</span></a>`;
    const mail = `<a class="btn btn-ghost btn-sm" href="mailto:${CONFIG.email}?subject=${encodeURIComponent('Terminanfrage – ' + d.Behandlung)}&body=${txt}"><span>Per E-Mail senden</span></a>`;
    const cal = `<a class="btn btn-ghost btn-sm" href="${icsFile(d)}" download="reskin-termin.ics"><span>In den Kalender</span></a>`;
    if (sent) {
      $('#doneTitle').textContent = `Danke, ${first}! Deine Anfrage ist bei uns.`;
      $('#doneText').textContent = 'Wir melden uns innerhalb von 24 Stunden mit der Bestätigung.';
      $('#doneActions').innerHTML = cal;
    } else {
      $('#doneTitle').textContent = `Fast geschafft, ${first}!`;
      $('#doneText').textContent = 'Deine Nachricht ist schon fertig geschrieben. Schick sie uns mit einem Klick – wir bestätigen dir den Termin innerhalb von 24 Stunden.';
      $('#doneActions').innerHTML = wa + mail + cal;
    }
    renderSummary($('#doneSummary'));
    go(5); scrollToForm();
  }

  const STEP_MSG = {
    1: () => !st.service && 'Bitte wähle zuerst eine Behandlung.',
    2: () => !st.zones.length && (st.service === 'tattoo' ? 'Bitte wähle die ungefähre Grösse.' : st.service === 'beratung' ? 'Bitte wähle aus, worum es geht.' : 'Bitte wähle mindestens eine Zone.'),
    3: () => !st.date ? 'Bitte wähle einen Tag.' : !st.time && 'Bitte wähle eine Uhrzeit.'
  };
  function handleNext() {
    if (st.step < 4) {
      const msg = STEP_MSG[st.step]();
      if (msg) { setErr(msg); return; }
      go(st.step + 1); scrollToForm();
    } else submit();
  }
  back.addEventListener('click', () => { go(st.step - 1, -1); scrollToForm(); });
  $('#bookAgain').addEventListener('click', () => {
    const keep = ['name', 'tel', 'email'].map(n => [n, form.elements[n].value]);
    form.reset(); keep.forEach(([n, v]) => { form.elements[n].value = v; });
    Object.assign(st, { service: null, zones: [], date: null, time: null });
    daysEl.innerHTML = ''; slotsEl.innerHTML = '<p class="bstep-hint">Wähle zuerst einen Tag.</p>'; pickText();
    go(1, -1); scrollToForm();
  });
  // Kein echtes Absenden: eingebettete Vorschauen (iframe) blockieren Formular-Submits.
  next.addEventListener('click', () => { if (st.step < 5) handleNext(); });
  form.addEventListener('submit', e => e.preventDefault());
  // Enter in einem Eingabefeld = «Weiter» bzw. «Anfrage senden»
  form.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.isComposing || st.step === 5) return;
    const t = e.target;
    if (t.tagName === 'TEXTAREA' || t.tagName === 'BUTTON' || t.tagName === 'A') return;
    e.preventDefault(); handleNext();
  });

  // Direktlinks («Haarentfernung buchen» usw.)
  $$('[data-preset]').forEach(a => a.addEventListener('click', () => {
    const v = a.dataset.preset; const r = form.querySelector(`input[name="service"][value="${v}"]`);
    if (!r || st.step === 5) return;
    r.checked = true; if (st.service !== v) st.zones = []; st.service = v; go(2, 1, false);
  }));
})();
