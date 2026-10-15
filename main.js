// ============================================================
//  BREW & BLOOM — page behaviour
//  Reads the content in data.js and builds the page sections.
//  Each block below is labelled so you can find what you need.
// ============================================================
(function () {
  'use strict';

  // Small helpers -------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Create an element: el('li', { class: 'x' }, child1, 'text')
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
      if (val === false || val == null) continue;
      if (key === 'text') node.textContent = val;
      else node.setAttribute(key, val === true ? '' : val);
    }
    children.flat().forEach((c) => node.append(c));
    return node;
  }
  const rupees = (n) => '₹' + n;
  const categoryLabel = (id) => (categories.find((c) => c.id === id) || {}).label || id;

  // ---------- A. Navigation ----------------------------------
  const header = $('.site-header');
  const toggle = $('.nav-toggle');
  const nav = $('#primary-nav');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Solid header after scrolling past the top
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Highlight the nav link of the section you are reading
  if ('IntersectionObserver' in window) {
    const links = $$('.nav__list a[href^="#"]:not(.btn)');
    const targets = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const active = links.find((a) => a.getAttribute('href') === '#' + entry.target.id);
        if (active) active.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => spy.observe(t));
  }

  // ---------- D. Menu + working filters ----------------------
  const filtersBox = $('#menu-filters');
  const grid = $('#menu-grid');
  const status = $('#menu-status');
  let activeCategory = 'all';

  function menuItem(item) {
    return el('li', { class: 'menu-item' },
      el('img', { class: 'menu-item__img', src: 'assets/' + item.image, alt: item.alt, width: 96, height: 96, loading: 'lazy', decoding: 'async' }),
      el('div', {},
        el('div', { class: 'menu-item__top' },
          el('h3', { class: 'menu-item__name', text: item.name }),
          el('span', { class: 'menu-item__dots', 'aria-hidden': 'true' }),
          el('span', { class: 'menu-item__price', text: rupees(item.price) })),
        el('p', { class: 'menu-item__desc', text: item.description }),
        el('span', { class: 'menu-item__cat', text: categoryLabel(item.category) })));
  }

  // Build one category block: a heading plus its list of dishes
  function menuGroup(cat, items) {
    return el('section', { class: 'menu-group', 'aria-labelledby': 'mg-' + cat.id },
      el('h3', { class: 'menu-group__title', id: 'mg-' + cat.id },
        el('span', { text: cat.label }),
        el('small', { text: items.length + (items.length === 1 ? ' item' : ' items') })),
      el('ul', { class: 'menu-list' }, items.map(menuItem)));
  }

  function renderMenu() {
    const cats = categories.filter((c) => c.id !== 'all' && (activeCategory === 'all' || c.id === activeCategory));
    const groups = cats.map((c) => menuGroup(c, menu.filter((m) => m.category === c.id)));
    grid.classList.toggle('is-single', activeCategory !== 'all');
    grid.replaceChildren(...groups);
    const count = $$('.menu-item', grid).length;
    status.textContent = `Showing ${count} ${count === 1 ? 'item' : 'items'}: ${categoryLabel(activeCategory)}.`;
    $$('.filter', filtersBox).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === activeCategory)));
  }

  categories.forEach((cat) => {
    filtersBox.append(el('button', { type: 'button', class: 'filter', 'data-id': cat.id, 'aria-pressed': 'false', text: cat.label }));
  });
  filtersBox.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter');
    if (!btn) return;
    activeCategory = btn.dataset.id;
    renderMenu();
  });
  renderMenu();

  // ---------- E. Best sellers --------------------------------
  $('#picks-grid').append(...picks.map((p) =>
    el('li', { class: 'pick reveal' },
      el('div', { class: 'pick__media' },
        el('img', { src: 'assets/' + p.image, alt: p.alt, width: 800, height: 1000, loading: 'lazy', decoding: 'async' }),
        el('span', { class: 'pick__tag', text: p.tag })),
      el('div', { class: 'pick__body' },
        el('span', { class: 'pick__num', 'aria-hidden': 'true' }),
        el('p', { class: 'pick__kicker', text: p.tag }),
        el('h3', { class: 'pick__name', text: p.name }),
        el('p', { class: 'pick__desc', text: p.description })))));

  // ---------- F. Gallery + lightbox --------------------------
  const rows = $('#gallery-rows');
  const dialog = $('#lightbox');
  const lbImg = $('#lightbox-img');
  const lbCap = $('#lightbox-caption');
  let lbIndex = 0;

  rows.append(...gallery.map((g, i) =>
    el('button', { type: 'button', class: `tile tile--${g.size} reveal`, 'data-index': i, 'aria-label': `View larger: ${g.caption}` },
      el('img', { src: 'assets/' + g.image, alt: g.alt, loading: 'lazy', decoding: 'async' }),
      el('span', { class: 'tile__cap', 'aria-hidden': 'true', text: g.caption }))));

  function showPhoto(i) {
    lbIndex = (i + gallery.length) % gallery.length;
    const g = gallery[lbIndex];
    lbImg.src = 'assets/' + g.image;
    lbImg.alt = g.alt;
    lbCap.textContent = g.caption;
  }
  rows.addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    showPhoto(Number(tile.dataset.index));
    if (typeof dialog.showModal === 'function') dialog.showModal();
  });
  $('#lb-prev').addEventListener('click', () => showPhoto(lbIndex - 1));
  $('#lb-next').addEventListener('click', () => showPhoto(lbIndex + 1));
  $('#lb-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // click outside closes
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(lbIndex + 1);
  });

  // ---------- G. Visit us ------------------------------------
  const address = $('#visit-address');
  site.address.forEach((line, i) => { if (i) address.append(el('br')); address.append(line); });

  $('#visit-hours').append(...hours.map((h) =>
    el('div', {}, el('dt', { text: h.days }), el('dd', { text: h.time }))));

  // "Get Directions" only becomes a real link when you provide a valid https URL.
  const slot = $('#directions-slot');
  let directionsOk = false;
  try { directionsOk = new URL(site.directionsUrl).protocol === 'https:'; } catch (_) { /* empty or invalid */ }
  if (directionsOk) {
    slot.append(el('a', { class: 'btn btn--outline', href: site.directionsUrl, target: '_blank', rel: 'noopener noreferrer', text: 'Get Directions' }));
  } else {
    slot.append(
      el('span', { class: 'btn btn--outline', role: 'link', 'aria-disabled': 'true', text: 'Get Directions' }),
      el('p', { class: 'directions__note', text: 'Directions are switched off because this café and its address are fictional. Add a real map link in data.js to enable this button.' }));
  }

  // ---------- I. Footer --------------------------------------
  $('#footer-contact').append(
    el('li', {}, el('a', { href: 'tel:' + site.phone.replace(/[^\d+]/g, ''), text: site.phone })),
    el('li', {}, el('a', { href: 'mailto:' + site.email, text: site.email })),
    el('li', { text: site.address.join(', ') }));
  $('#footer-social').append(...site.social.map((s) =>
    el('li', {}, el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.label }))));
  $('#year').textContent = new Date().getFullYear();

  // ---------- H. Reservation form ----------------------------
  const form = $('#reserve-form');
  const formStatus = $('#form-status');
  const submitBtn = $('#submit-btn');
  const timeSel = $('#time');
  const guestSel = $('#guests');

  timeSel.append(el('option', { value: '', text: 'Choose a time' }), ...timeSlots.map((t) => el('option', { value: t, text: t })));
  guestSel.append(el('option', { value: '', text: 'How many?' }),
    ...Array.from({ length: maxGuests }, (_, i) => el('option', { value: i + 1, text: i === 0 ? '1 guest' : `${i + 1} guests` })));

  // Earliest selectable date = today (local time)
  const dateInput = $('#date');
  const now = new Date();
  const todayStr = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  dateInput.min = todayStr;

  const rules = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your name.' : ''),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address, like name@example.com.'),
    date: (v) => (!v ? 'Please choose a date.' : v < todayStr ? 'Please choose today or a future date.' : ''),
    time: (v) => (v ? '' : 'Please choose a time.'),
    guests: (v) => (v ? '' : 'Please choose the number of guests.'),
  };

  function validateField(name) {
    const input = form.elements[name];
    const msg = rules[name](input.value);
    const err = $('#' + name + '-error');
    err.textContent = msg;
    err.hidden = !msg;
    input.setAttribute('aria-invalid', String(Boolean(msg)));
    return !msg;
  }
  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validateField(name); });
    input.addEventListener('change', () => { if (input.getAttribute('aria-invalid') === 'true') validateField(name); });
  });

  function showStatus(kind, title, text) {
    formStatus.replaceChildren(el('div', { class: 'is-' + kind }, el('strong', { text: title }), text));
    formStatus.focus();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formStatus.replaceChildren();
    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      const firstBad = Object.keys(rules).find((n) => form.elements[n].getAttribute('aria-invalid') === 'true');
      form.elements[firstBad].focus();
      showStatus('error', 'Please check the form.', 'Some fields need your attention before we can continue.');
      form.elements[firstBad].focus();
      return;
    }

    // Demo mode: no endpoint configured, so nothing is sent or booked.
    if (!site.formEndpoint) {
      showStatus('info', 'Demo only: nothing was sent.',
        'Your details look valid, but this portfolio concept has no booking system behind it, so no table has been reserved and no email was sent.');
      return;
    }

    // Live mode: send to the form service you set in data.js (e.g. Formspree).
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      const res = await fetch(site.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) throw new Error('Request failed with status ' + res.status);
      form.reset();
      showStatus('success', 'Request sent.', 'Thank you. We have received your request and will reply by email to confirm. This is a request, not a confirmed booking.');
    } catch (err) {
      showStatus('error', 'We could not send your request.', 'Please check your connection and try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request a Table';
    }
  });

  // ---------- Scroll-reveal animation ------------------------
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((n) => io.observe(n));
  } else {
    revealEls.forEach((n) => n.classList.add('is-visible'));
  }
})();
