/* ============================================================
   GoalTime — App shell: router, navbar, auth modal, toasts.
   ============================================================ */
const App = (() => {

  /* route = { page, params } — kept in memory + hash for shareable links */
  let route = { page: 'home', params: {} };

  const PAGES = {}; // registered by views-*.js → PAGES[name] = renderFn

  function registerPage(name, fn) { PAGES[name] = fn; }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------------- Navigation ---------------- */
  function go(page, params = {}) {
    route = { page, params };
    location.hash = page + (params.id ? '/' + params.id : '');
    render();
    window.scrollTo({ top: 0 });
  }

  function parseHash() {
    const [page, id] = location.hash.replace('#', '').split('/');
    if (page && PAGES[page]) route = { page, params: id ? { id } : {} };
  }

  function rerender() { renderNav(); render(); }

  function render() {
    const view = document.getElementById('view');
    const fn = PAGES[route.page] || PAGES.home;
    view.innerHTML = fn(route.params) || '';
    renderNav();
    I18N.apply(document); // refresh static [data-i18n] chrome (footer, etc.)
    if (window.__afterRender) { const f = window.__afterRender; window.__afterRender = null; f(); }
  }

  /* ---------------- Navbar ---------------- */
  function renderNav() {
    const me = Store.currentUser();
    const links = [
      { page: 'home', label: t('nav_home'), show: true },
      { page: 'bookings', label: t('nav_my_bookings'), show: me && me.role === 'customer' },
      { page: 'vendor', label: t('nav_vendor'), show: me && me.role === 'vendor' },
      { page: 'admin', label: t('nav_admin'), show: me && me.role === 'admin' },
    ].filter(l => l.show);

    const langBtns = Object.entries(I18N.LANGS).map(([code, l]) =>
      `<button class="${code === I18N.lang() ? 'active' : ''}" onclick="I18N.setLang('${code}')">${l.label}</button>`).join('');

    document.getElementById('nav-inner').innerHTML = `
      <div class="brand" onclick="App.go('home')">
        <span class="ball">⚽</span>
        <span>Goal<b>Time</b></span>
      </div>
      <div class="nav-links">
        ${links.map(l => `<button class="nav-btn ${route.page === l.page ? 'active' : ''}"
          onclick="App.go('${l.page}')">${esc(l.label)}</button>`).join('')}
      </div>
      <div class="nav-spacer"></div>
      <div class="lang-switch">${langBtns}</div>
      ${me
        ? `<span class="user-chip"><span class="dot"></span>${esc(me.name)}</span>
           <button class="btn btn-ghost btn-sm" onclick="App.logout()">${t('logout')}</button>`
        : `<button class="btn btn-primary btn-sm" onclick="App.openAuth()">${t('login')}</button>`}
    `;
  }

  /* ---------------- Auth modal ---------------- */
  let pendingAfterLogin = null;

  function openAuth(afterLogin) {
    pendingAfterLogin = afterLogin || null;
    document.getElementById('modal-zone').innerHTML = `
      <div class="modal-backdrop" onclick="if(event.target===this)App.closeModal()">
        <div class="modal">
          <h3>${t('welcome_back')} 👋</h3>
          <p class="sub">${t('auth_sub')}</p>
          <div class="field">
            <label>${t('phone')}</label>
            <input id="auth-phone" type="tel" inputmode="numeric" placeholder="${t('phone_hint')}" dir="ltr"/>
          </div>
          <div class="field">
            <label>${t('name')}</label>
            <input id="auth-name" type="text" placeholder="${t('name')}"/>
          </div>
          <button class="btn btn-primary" style="width:100%" onclick="App.submitAuth()">${t('continue')}</button>
          <p class="sub mt1" style="margin-bottom:.3rem">${t('demo_accounts')}:</p>
          <div class="demo-row">
            <button class="btn btn-ghost btn-sm" onclick="App.demoLogin('customer')">⚽ ${t('demo_customer')}</button>
            <button class="btn btn-ghost btn-sm" onclick="App.demoLogin('vendor')">🏟️ ${t('demo_vendor')}</button>
            <button class="btn btn-ghost btn-sm" onclick="App.demoLogin('admin')">👑 ${t('demo_admin')}</button>
          </div>
        </div>
      </div>`;
    setTimeout(() => document.getElementById('auth-phone').focus(), 50);
  }

  function submitAuth() {
    const phone = document.getElementById('auth-phone').value.trim();
    const name = document.getElementById('auth-name').value.trim();
    const res = Store.loginOrRegister(phone, name);
    if (res.error) return toast(t(res.error), 'err');
    afterAuth(res.user);
  }

  function demoLogin(role) { afterAuth(Store.loginDemo(role)); }

  function afterAuth(user) {
    closeModal();
    toast(t('logged_in_as') + ' — ' + user.name, 'ok');
    if (user.role === 'vendor') go('vendor');
    else if (user.role === 'admin') go('admin');
    else if (pendingAfterLogin) { const f = pendingAfterLogin; pendingAfterLogin = null; f(); }
    else rerender();
  }

  function logout() { Store.logout(); go('home'); }

  function closeModal() { document.getElementById('modal-zone').innerHTML = ''; }

  /* ---------------- Toasts ---------------- */
  function toast(msg, kind = 'ok') {
    const zone = document.getElementById('toast-zone');
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.textContent = (kind === 'ok' ? '✅ ' : '⚠️ ') + msg;
    zone.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  }

  /* ---------------- Shared render helpers ---------------- */
  function starsHTML(avg) {
    const full = Math.round(avg);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  function statusPill(b) {
    let st = b.status;
    if (st === 'confirmed' && Store.slotStart(b.date, b.hour) < new Date()) st = 'pending';
    return `<span class="status-pill ${st}">${t('st_' + st)}</span>`;
  }

  /* ---------------- Boot ---------------- */
  function start() {
    I18N.init();
    parseHash();
    window.addEventListener('hashchange', () => { parseHash(); render(); });
    render();
  }

  return {
    start, go, rerender, registerPage, esc,
    openAuth, submitAuth, demoLogin, logout, closeModal,
    toast, starsHTML, statusPill,
    get route() { return route; },
  };
})();

/* Top-level `const` does NOT attach to window in browsers, so code that
   guards on `window.App` (e.g. I18N.setLang) would silently skip. Expose
   the core singletons explicitly so those references resolve. */
window.App = App;
window.I18N = I18N;
window.Store = Store;
