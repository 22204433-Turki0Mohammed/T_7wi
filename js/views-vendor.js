/* ============================================================
   GoalTime — Vendor dashboard: stadiums, prices, calendar,
   attendance confirmation (feeds the anti-no-show system).
   ============================================================ */
(() => {
  const esc = App.esc;

  const vd = { day: Store.todayISO(), editing: null, adding: false };

  const ALL_AMENITIES = ['changing', 'wc', 'parking', 'balls', 'water', 'lighting', 'cafeteria'];

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
          <h3 class="section-title" style="margin:0 0 .6rem">⚙️ ${t('vd_my_stadiums')}
            <button class="btn btn-primary btn-sm" style="margin-inline-start:auto" onclick="VendorViews.toggleAdd()">＋ ${t('vd_add_stadium')}</button>
          </h3>
          ${vd.adding ? addForm() : ''}
          ${stadiums.map(s => `
            <div class="booking-row" style="margin-bottom:.6rem">
              <div class="grow">
                <div class="st-name">${esc(I18N.pick(s.name))}</div>
                <div class="st-city">📍 ${esc(Store.cityName(s.cityId))} ·
                  <span class="status-pill ${s.approved ? (s.active ? 'confirmed' : 'cancelled') : 'pending'}">
                    ${s.approved ? t(s.active ? 'ad_active' : 'ad_banned') : t('vd_status_pending')}
                  </span>
                </div>
              </div>
              <div class="row-actions">
                <button class="btn btn-ghost btn-sm" onclick="VendorViews.edit('${s.id}')">✏️ ${t('vd_edit')}</button>
                ${s.approved ? `
                  <button class="btn ${s.active ? 'btn-danger' : 'btn-success'} btn-sm" onclick="VendorViews.setActive('${s.id}', ${!s.active})">
                    ${t(s.active ? 'vd_deactivate' : 'vd_activate')}
                  </button>` : ''}
              </div>
            </div>`).join('')}
          ${vd.editing ? editForm(Store.stadium(vd.editing)) : ''}
        </div>
      </div>

      ${reviewsPanel(me)}
    `;
  }

  /* ---------- Reviews & owner replies ---------- */
  function reviewsPanel(me) {
    const reviews = Store.vendorReviews(me.id);
    return `
      <div class="panel mt1">
        <h3 class="section-title" style="margin:0">⭐ ${t('vd_reviews')}</h3>
        ${reviews.length ? reviews.map(r => {
          const s = Store.stadium(r.stadiumId); const u = Store.user(r.userId);
          return `
            <div class="review">
              <div class="head">
                <b>${esc((u || {}).name || '—')} — ${esc(I18N.pick(s.name))}</b>
                <span class="stars">${App.starsHTML(r.rating)}</span>
              </div>
              <p>${esc(I18N.pick(r.text))}</p>
              ${r.reply
                ? `<p style="color:var(--green)">↳ <b>${t('owner_reply')}:</b> ${esc(I18N.pick(r.reply))}</p>`
                : `<div class="row-actions mt1">
                     <input id="reply-${r.id}" placeholder="${t('vd_reply_placeholder')}" style="flex:1;min-width:200px"/>
                     <button class="btn btn-primary btn-sm" onclick="VendorViews.reply('${r.id}')">${t('vd_reply')}</button>
                   </div>`}
            </div>`;
        }).join('') : `<div class="empty">${t('vd_no_reviews')}</div>`}
      </div>`;
  }

  /* ---------- Add stadium ---------- */
  function addForm() {
    return `
      <div class="summary" style="border-style:solid; margin-bottom: .8rem;">
        <b>＋ ${t('vd_add_stadium')}</b>
        <div class="form-grid">
          <div class="field"><label>${t('vd_new_name')}</label><input id="n-name"/></div>
          <div class="field"><label>${t('vd_new_district')}</label><input id="n-district"/></div>
          <div class="field"><label>${t('filter_city')}</label>
            <select id="n-city">
              ${Store.cities().map(c => `<option value="${c.id}">${esc(I18N.pick(c.name))}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>${t('vd_grass')}</label>
            <select id="n-grass">
              <option value="artificial">${t('am_grass_artificial')}</option>
              <option value="natural">${t('am_grass_natural')}</option>
            </select>
          </div>
          <div class="field"><label>${t('am_size')}</label><input id="n-size" placeholder="40m × 20m" dir="ltr"/></div>
          <div class="field"><label>${t('vd_base_price')} (${t('sar_hr')})</label><input id="n-base" type="number" min="0" value="600"/></div>
          <div class="field"><label>${t('vd_peak_price')}</label><input id="n-peak" type="number" min="0" value="800"/></div>
          <div class="field"><label>${t('vd_weekend_price')}</label><input id="n-weekend" type="number" min="0" value="700"/></div>
          <div class="field"><label>${t('vd_open_hour')}</label><input id="n-open" type="number" min="0" max="23" value="16"/></div>
          <div class="field"><label>${t('vd_close_hour')}</label><input id="n-close" type="number" min="1" max="28" value="26"/></div>
          <div class="field full"><label>${t('vd_amenities')}</label>
            <div class="amenity-grid">
              ${ALL_AMENITIES.map(a => `
                <label class="amenity" style="cursor:pointer">
                  <input type="checkbox" class="n-am" value="${a}" style="width:auto"/> ${t('am_' + a)}
                </label>`).join('')}
            </div>
          </div>
          <div class="field full"><label>${t('vd_images')}</label><textarea id="n-images" rows="2" dir="ltr"></textarea></div>
        </div>
        <div class="row-actions mt1">
          <button class="btn btn-primary btn-sm" onclick="VendorViews.create()">📤 ${t('vd_create')}</button>
          <button class="btn btn-ghost btn-sm" onclick="VendorViews.toggleAdd()">${t('close')}</button>
        </div>
      </div>`;
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
          <div class="field">
            <label>${t('vd_open_hour')}</label>
            <input id="e-open" type="number" min="0" max="23" value="${s.openHour}"/>
          </div>
          <div class="field">
            <label>${t('vd_close_hour')}</label>
            <input id="e-close" type="number" min="1" max="28" value="${s.closeHour}"/>
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
    const open = Math.min(23, Math.max(0, +document.getElementById('e-open').value || 16));
    const close = Math.max(open + 1, +document.getElementById('e-close').value || 26);
    Store.updateStadium(id, {
      basePrice: +document.getElementById('e-base').value || 0,
      peakPrice: +document.getElementById('e-peak').value || 0,
      weekendPrice: +document.getElementById('e-weekend').value || 0,
      noShowLimit: Math.max(1, +document.getElementById('e-noshow').value || 2),
      cancelHours: +document.getElementById('e-cancel').value || 6,
      openHour: open, closeHour: close,
      images: document.getElementById('e-images').value.split('\n').map(x => x.trim()).filter(Boolean),
    });
    vd.editing = null;
    App.toast(t('vd_saved'), 'ok');
    App.rerender();
  }

  function toggleAdd() { vd.adding = !vd.adding; vd.editing = null; App.rerender(); }

  function create() {
    const me = Store.currentUser();
    const name = document.getElementById('n-name').value.trim();
    const district = document.getElementById('n-district').value.trim();
    if (!name || !district) return App.toast(t('fill_required'), 'err');
    const open = Math.min(23, Math.max(0, +document.getElementById('n-open').value || 16));
    const close = Math.max(open + 1, +document.getElementById('n-close').value || 26);
    Store.addStadium(me.id, {
      name, district, desc: name,
      cityId: document.getElementById('n-city').value,
      grass: document.getElementById('n-grass').value,
      size: document.getElementById('n-size').value.trim() || '30m × 15m',
      basePrice: +document.getElementById('n-base').value || 0,
      peakPrice: +document.getElementById('n-peak').value || 0,
      weekendPrice: +document.getElementById('n-weekend').value || 0,
      openHour: open, closeHour: close,
      amenities: [...document.querySelectorAll('.n-am:checked')].map(x => x.value),
      images: document.getElementById('n-images').value.split('\n').map(x => x.trim()).filter(Boolean),
    });
    vd.adding = false;
    App.toast(t('vd_created'), 'ok');
    App.rerender();
  }

  function setActive(id, active) {
    Store.updateStadium(id, { active });
    App.toast(t('vd_saved'), 'ok');
    App.rerender();
  }

  function reply(reviewId) {
    const text = document.getElementById('reply-' + reviewId).value.trim();
    if (!text) return App.toast(t('fill_required'), 'err');
    const res = Store.replyToReview(reviewId, text);
    if (res.error) return App.toast(t(res.error), 'err');
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
  window.VendorViews = { edit, setDay, save, mark, toggleAdd, create, setActive, reply };
})();
