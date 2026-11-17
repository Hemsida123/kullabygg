(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.main-nav');
  const closeMenu = () => { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); };
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open)); menu.classList.toggle('open', open);
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu?.classList.contains('open')) {closeMenu(); menuButton.focus();} });
  document.addEventListener('click', e => {if (!e.target.closest('.site-header')) closeMenu();});

  const tabs = [...document.querySelectorAll('.service-tab')];
  function selectTab(tab) {
    tabs.forEach(t => {
      const active = t === tab; t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
      document.querySelector(`[data-service-image="${t.id}"]`).hidden = !active;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      let next;
      if (['ArrowDown','ArrowRight'].includes(e.key)) next = (index + 1) % tabs.length;
      if (['ArrowUp','ArrowLeft'].includes(e.key)) next = (index + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {e.preventDefault(); selectTab(tabs[next]); tabs[next].focus();}
    });
  });

  const gallery = [...document.querySelectorAll('[data-gallery]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  function filterGallery(value) {
    if (!filters.length) return;
    const current = filters.some(f => f.dataset.filter === value) ? value : 'alla';
    filters.forEach(f => f.setAttribute('aria-pressed', String(f.dataset.filter === current)));
    gallery.forEach(item => item.hidden = current !== 'alla' && item.dataset.gallery !== current);
    const count = gallery.filter(item => !item.hidden).length;
    document.querySelector('.gallery-count').textContent = `${count} bilder`;
  }
  filters.forEach(f => f.addEventListener('click', () => {filterGallery(f.dataset.filter); history.replaceState(null, '', '#' + f.dataset.filter);}));
  filterGallery(location.hash.slice(1));
  addEventListener('hashchange', () => filterGallery(location.hash.slice(1)));

  const dialog = document.querySelector('.lightbox');
  let activeImage = null;
  const available = () => gallery.filter(item => !item.hidden);
  function showImage(item) {
    activeImage = item;
    const picture = dialog.querySelector('.lightbox-image'); picture.src = item.dataset.full; picture.alt = `${item.dataset.caption}, Kullabyggs referensprojekt`;
    dialog.querySelector('#lightbox-title').textContent = item.dataset.caption;
    dialog.querySelector('.lightbox-category').textContent = item.dataset.category;
    dialog.querySelector('.lightbox-counter').textContent = `${available().indexOf(item) + 1} / ${available().length}`;
  }
  function moveImage(direction) {const items = available(); showImage(items[(items.indexOf(activeImage) + direction + items.length) % items.length]);}
  gallery.forEach(item => item.addEventListener('click', () => {
    if (!dialog) return;
    showImage(item); dialog.showModal(); document.body.classList.add('locked');
  }));
  if (dialog) {
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-prev]').addEventListener('click', () => moveImage(-1));
    dialog.querySelector('[data-next]').addEventListener('click', () => moveImage(1));
    dialog.addEventListener('keydown', e => {if(e.key === 'ArrowLeft'){e.preventDefault();moveImage(-1);} if(e.key === 'ArrowRight'){e.preventDefault();moveImage(1);}});
    dialog.addEventListener('close', () => {document.body.classList.remove('locked'); activeImage?.focus({preventScroll:true});});
    dialog.addEventListener('click', e => {if (e.target === dialog) {const r = dialog.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();}});
  }

  const form = document.getElementById('quote-form');
  form?.addEventListener('submit', e => {
    e.preventDefault(); if(!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `Projektförfrågan: ${data.get('service')}`;
    const body = `Hej Kullabygg!\n\nJag vill prata om följande projekt:\n\n${data.get('message').trim()}\n\nTyp av arbete: ${data.get('service')}\nOrt: ${data.get('location').trim() || 'Ej angiven'}\n\nMed vänlig hälsning\n${data.get('name').trim()}\nTelefon: ${data.get('phone').trim() || 'Ej angivet'}`;
    location.href = `mailto:info@kullabygg.se?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    form.querySelector('.form-status').textContent = 'Din mejlapp öppnas. Granska och skicka förfrågan där. Om inget händer kan du mejla info@kullabygg.se direkt.';
  });

  if ('IntersectionObserver' in window) {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('motion-ready');
      const reveal = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting) {entry.target.classList.add('in-view');reveal.unobserve(entry.target);}}),{threshold:.07});
      document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
    }
    let leadVisible = true, footerVisible = false;
    const sticky = document.querySelector('.mobile-contact');
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => {if(entry.target.matches('.footer')) footerVisible = entry.isIntersecting;else leadVisible=entry.isIntersecting;});
      sticky.classList.toggle('show', !leadVisible && !footerVisible);
      sticky.inert = leadVisible || footerVisible;
    });
    const lead = document.querySelector('.hero, .page-head');
    if(lead) visibility.observe(lead);
    visibility.observe(document.querySelector('.footer'));
  }
})();
