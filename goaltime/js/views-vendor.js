/* ============================================================
   GoalTime — Vendor dashboard: stadiums, prices, calendar,
   attendance confirmation (feeds the anti-no-show system).
   ============================================================ */
(() => {
  const esc = App.esc;

  const vd = { day: Store.todayISO(), editing: null };

  function vendorView() {
    const me = Store.currentUser();
    if (!me || me.role !== 'vendor') return `<div class="empty mt2"><div class="big">🔒</div>${t('not_authorized')}</div>`;

    const stadiums = Store.vendorStadiums(me.id);
    const pending = Store.vendorPendingAttendance(me.id);
    const dayBookings = Store.vendorBookings(me.id, vd.day);

    return `
      <h2 class="section-title mt2">🏟️ ${t('vd_title')}</h2>

      ${pending.length ? `
        <div class="panel" style="border-color:rgba(245,158,11,.45)">
          <h3 class="section-title" style="margin:0">⏳ ${t('vd_pending_actions')} (${pending.length})</h3>
          ${pending.map(attendanceRow).join('')}
        </div>` : ''}

      <div class="dash-grid mt1">
        <div class="panel">
          <h3 class="section-title" style="margin:0 0 .6rem">📅 ${t('vd_calendar')}</h3>
          <div class="day-strip">${dayStrip()}</div>
          ${dayBookings.length ? `
            <div class="table-wrap">
              <table class="gt">
                <tr><th>⏰</th><th>${t('nav_stadiums')}</th><th>${t('name')}</th><th>${t('total')}</th><th></th></tr>
                ${dayBookings.map(b => {
                  const s = Store.stadium(b.stadiumId); const u = Store.user(b.userId);
                  return `<tr>
                    <td><b style="color:var(--green)">${I18N.fmtHour(b.hour % 24)}</b></td>
                    <td>${esc(I18N.pick(s.name))}</td>
                    <td>${esc(u.name)}<br/><small dir="ltr" style="color:var(--txt-dim)">${esc(u.phone)}</small></td>
                    <td>${b.price} ${t('currency')}</td>
                    <td>${App.statusPill(b)}</td>
                  </tr>`;
                }).join('')}
              </table>
            </div>` : `<div class="empty">${t('vd_no_bookings_day')}</div>`}
        </div>

        <div class="panel">
          <h3 class="section-title" style="margin:0 0 .6rem">⚙️ ${t('vd_my_stadiums')}</h3>
          ${stadiums.map(s => `
            <div class="booking-row" style="margin-bottom:.6rem">
              <div class="grow">
                <div class="st-name">${esc(I18N.pick(s.name))}</div>
                <div class="st-city">📍 ${esc(Store.cityName(s.cityId))} ·
                  <span class="status-pill ${s.approved ? 'confirmed' : 'pending'}">
                    ${t(s.approved ? 'vd_status_approved' : 'vd_status_pending')}
                  </span>
                </div>
              </div>
              <button class="btn btn-ghost btn-sm" onclick="VendorViews.edit('${s.id}')">✏️ ${t('vd_edit')}</button>
            </div>`).join('')}
          ${vd.editing ? editForm(Store.stadium(vd.editing)) : ''}
        </div>
      </div>
    `;
  }

  function dayStrip() {
    let html = '';
    for (let i = -2; i < 8; i++) {
      const iso = Store.todayISO(i);
      const d = new Date(iso + 'T00:00:00');
      html += `
        <div class="day-pill ${vd.day === iso ? 'active' : ''}" onclick="VendorViews.setDay('${iso}')">
          <div class="dow">${i === 0 ? t('vd_today') : d.toLocaleDateString(I18N.locale(), { weekday: 'short' })}</div>
          <div class="dnum">${d.toLocaleDateString(I18N.locale(), { day: 'numeric' })}</div>
        </div>`;
    }
    return html;
  }

  function attendanceRow(b) {
    const s = Store.stadium(b.stadiumId); const u = Store.user(b.userId);
    return `
      <div class="booking-row" style="margin-bottom:.6rem">
        <div class="when">
          <div class="d">${I18N.fmtDate(b.date)}</div>
          <div class="h">⏰ ${I18N.fmtHour(b.hour % 24)}</div>
        </div>
        <div class="grow">
          <div class="st-name">${esc(u.name)} — ${esc(I18N.pick(s.name))}</div>
          <div class="st-city" dir="ltr">${esc(u.phone)}</div>
        </div>
        <div class="row-actions">
          <button class="btn btn-success btn-sm" onclick="VendorViews.mark('${b.id}', true)">${t('vd_mark_attended')}</button>
          <button class="btn btn-danger btn-sm" onclick="VendorViews.mark('${b.id}', false)">${t('vd_mark_no_show')}</button>
        </div>
      </div>`;
  }

  function editForm(s) {
    return `
      <div class="summary" style="border-style:solid">
        <b>✏️ ${esc(I18N.pick(s.name))}</b>
        <div class="form-grid">
          <div class="field">
            <label>${t('vd_base_price')} (${t('sar_hr')})</label>
            <input id="e-base" type="number" min="0" value="${s.basePrice}"/>
          </div>
          <div class="field">
            <label>${t('vd_peak_price')}</label>
            <input id="e-peak" type="number" min="0" value="${s.peakPrice}"/>
          </div>
          <div class="field">
            <label>${t('vd_weekend_price')}</label>
            <input id="e-weekend" type="number" min="0" value="${s.weekendPrice}"/>
          </div>
          <div class="field">
            <label>${t('vd_noshow_limit')}</label>
            <input id="e-noshow" type="number" min="1" max="10" value="${s.noShowLimit}"/>
          </div>
          <div class="field">
            <label>${t('vd_cancel_hours')}</label>
            <input id="e-cancel" type="number" min="0" max="48" value="${s.cancelHours}"/>
          </div>
          <div class="field full">
            <label>${t('vd_images')}</label>
            <textarea id="e-images" rows="3" dir="ltr">${esc(s.images.join('\n'))}</textarea>
          </div>
        </div>
        <div class="row-actions mt1">
          <button class="btn btn-primary btn-sm" onclick="VendorViews.save('${s.id}')">💾 ${t('vd_save')}</button>
          <button class="btn btn-ghost btn-sm" onclick="VendorViews.edit(null)">${t('close')}</button>
        </div>
      </div>`;
  }

  function edit(id) { vd.editing = id; App.rerender(); }
  function setDay(iso) { vd.day = iso; App.rerender(); }

  function save(id) {
    Store.updateStadium(id, {
      basePrice: +document.getElementById('e-base').value || 0,
      peakPrice: +document.getElementById('e-peak').value || 0,
      weekendPrice: +document.getElementById('e-weekend').value || 0,
      noShowLimit: Math.max(1, +document.getElementById('e-noshow').value || 2),
      cancelHours: +document.getElementById('e-cancel').value || 6,
      images: document.getElementById('e-images').value.split('\n').map(x => x.trim()).filter(Boolean),
    });
    vd.editing = null;
    App.toast(t('vd_saved'), 'ok');
    App.rerender();
  }

  function mark(bookingId, attended) {
    const res = Store.markAttendance(bookingId, attended);
    if (res.autoBanned) App.toast(t('vd_user_banned_auto'), 'err');
    else App.toast(t('vd_saved'), 'ok');
    App.rerender();
  }

  App.registerPage('vendor', vendorView);
  window.VendorViews = { edit, setDay, save, mark };
})();
