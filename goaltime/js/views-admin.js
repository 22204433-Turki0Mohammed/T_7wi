/* ============================================================
   GoalTime — Super Admin dashboard: analytics, stadium
   approvals, user & stadium management.
   ============================================================ */
(() => {
  const esc = App.esc;

  function adminView() {
    const me = Store.currentUser();
    if (!me || me.role !== 'admin') return `<div class="empty mt2"><div class="big">🔒</div>${t('not_authorized')}</div>`;

    const st = Store.stats();
    const pending = Store.pendingStadiums();

    return `
      <h2 class="section-title mt2">👑 ${t('ad_title')}</h2>

      <div class="kpis">
        <div class="kpi"><div class="v">${st.totalBookings}</div><div class="l">📒 ${t('ad_total_bookings')}</div></div>
        <div class="kpi"><div class="v">${st.users}</div><div class="l">👥 ${t('ad_active_users')}</div></div>
        <div class="kpi"><div class="v">${st.stadiums}</div><div class="l">🏟️ ${t('ad_stadium_count')}</div></div>
        <div class="kpi"><div class="v">${st.cancelRate}%</div><div class="l">↩️ ${t('ad_cancel_rate')}</div></div>
      </div>

      <div class="dash-grid">
        <div class="panel">
          <h3 class="section-title" style="margin:0 0 .8rem">🔥 ${t('ad_top_stadiums')}</h3>
          ${barChart(st.topStadiums.map(([id, n]) => [I18N.pick((Store.stadium(id) || {}).name), n]))}
        </div>
        <div class="panel">
          <h3 class="section-title" style="margin:0 0 .8rem">⏰ ${t('ad_peak_hours')}</h3>
          ${barChart(st.peakHours.map(([h, n]) => [I18N.fmtHour(+h), n]))}
        </div>
      </div>

      <div class="panel mt1">
        <h3 class="section-title" style="margin:0">🆕 ${t('ad_pending')} (${pending.length})</h3>
        ${pending.length ? pending.map(s => `
          <div class="booking-row" style="margin-top:.7rem">
            <div class="grow">
              <div class="st-name">${esc(I18N.pick(s.name))}</div>
              <div class="st-city">📍 ${esc(Store.cityName(s.cityId))} · ${esc((Store.user(s.vendorId) || {}).name)} · ${s.basePrice} ${t('sar_hr')}</div>
            </div>
            <div class="row-actions">
              <button class="btn btn-success btn-sm" onclick="AdminViews.approve('${s.id}', true)">✓ ${t('ad_approve')}</button>
              <button class="btn btn-danger btn-sm" onclick="AdminViews.approve('${s.id}', false)">✗ ${t('ad_reject')}</button>
            </div>
          </div>`).join('') : `<div class="empty">${t('ad_no_pending')}</div>`}
      </div>

      <div class="panel mt1">
        <h3 class="section-title" style="margin:0 0 .6rem">👥 ${t('ad_users')}</h3>
        <div class="table-wrap">
          <table class="gt">
            <tr><th>${t('name')}</th><th>${t('phone')}</th><th>${t('ad_role')}</th><th>${t('ad_no_shows')}</th><th></th><th></th></tr>
            ${Store.allUsers().map(u => `
              <tr>
                <td><b>${esc(u.name)}</b></td>
                <td dir="ltr">${esc(u.phone)}</td>
                <td>${t('role_' + u.role)}</td>
                <td>${Store.noShowCount(u.id)}</td>
                <td><span class="status-pill ${u.banned ? 'cancelled' : 'confirmed'}">${t(u.banned ? 'ad_banned' : 'ad_active')}</span></td>
                <td>${u.role !== 'admin' ? `
                  <button class="btn ${u.banned ? 'btn-success' : 'btn-danger'} btn-sm"
                          onclick="AdminViews.setBan('${u.id}', ${!u.banned})">
                    ${t(u.banned ? 'ad_unban' : 'ad_ban')}
                  </button>` : ''}</td>
              </tr>`).join('')}
          </table>
        </div>
      </div>

      <div class="panel mt1">
        <h3 class="section-title" style="margin:0 0 .6rem">🏟️ ${t('ad_stadiums')}</h3>
        <div class="table-wrap">
          <table class="gt">
            <tr><th>${t('nav_stadiums')}</th><th>${t('filter_city')}</th><th>${t('demo_vendor')}</th><th></th><th></th></tr>
            ${Store.allStadiums().map(s => `
              <tr>
                <td><b>${esc(I18N.pick(s.name))}</b></td>
                <td>${esc(Store.cityName(s.cityId))}</td>
                <td>${esc((Store.user(s.vendorId) || {}).name)}</td>
                <td><span class="status-pill ${s.active && s.approved ? 'confirmed' : 'cancelled'}">
                  ${s.approved ? t(s.active ? 'ad_active' : 'ad_banned') : t('vd_status_pending')}
                </span></td>
                <td>${s.approved ? `
                  <button class="btn ${s.active ? 'btn-danger' : 'btn-success'} btn-sm"
                          onclick="AdminViews.setActive('${s.id}', ${!s.active})">
                    ${t(s.active ? 'ad_disable' : 'ad_enable')}
                  </button>` : ''}</td>
              </tr>`).join('')}
          </table>
        </div>
      </div>
    `;
  }

  function barChart(rows) {
    if (!rows.length) return `<div class="empty">—</div>`;
    const max = Math.max(...rows.map(r => r[1]));
    return `<div class="bar-chart">
      ${rows.map(([name, n]) => `
        <div class="bar-row">
          <span class="name">${esc(name)}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.round(n / max * 100)}%"></div></div>
          <span class="val">${n}</span>
        </div>`).join('')}
    </div>`;
  }

  function approve(id, ok) { Store.approveStadium(id, ok); App.toast(t('vd_saved'), 'ok'); App.rerender(); }
  function setBan(id, banned) { Store.setBan(id, banned); App.toast(t('vd_saved'), 'ok'); App.rerender(); }
  function setActive(id, active) { Store.setStadiumActive(id, active); App.toast(t('vd_saved'), 'ok'); App.rerender(); }

  App.registerPage('admin', adminView);
  window.AdminViews = { approve, setBan, setActive };
})();
