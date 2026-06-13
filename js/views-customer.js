/* ============================================================
   GoalTime — Customer views: home, stadium detail + booking,
   my bookings. All strings via t(); markup is dir-agnostic.
   ============================================================ */
(() => {
  const esc = App.esc;

  const AMENITY_ICONS = {
    changing: '👕', wc: '🚻', parking: '🅿️', balls: '⚽',
    water: '💧', lighting: '💡', cafeteria: '☕',
  };

  /* ================= HOME ================= */
  const filters = { q: '', cityId: 'all', maxPrice: '', minRating: '', date: '' };

  function homeView() {
    const list = Store.searchStadiums({
      q: filters.q,
      cityId: filters.cityId,
      maxPrice: filters.maxPrice ? +filters.maxPrice : null,
      minRating: filters.minRating ? +filters.minRating : null,
      date: filters.date || null,
    });

    return `
      <section class="hero">
        <h1>${t('hero_title')}</h1>
        <p>${t('hero_sub')}</p>
      </section>

      <div class="filters">
        <div>
          <label>🔍 ${t('nav_stadiums')}</label>
          <input id="f-q" value="${esc(filters.q)}" placeholder="${t('search_placeholder')}"
                 oninput="Views.setFilter('q', this.value)"/>
        </div>
        <div>
          <label>📍 ${t('filter_city')}</label>
          <select onchange="Views.setFilter('cityId', this.value)">
            <option value="all">${t('filter_all')}</option>
            ${Store.cities().map(c => `<option value="${c.id}" ${filters.cityId === c.id ? 'selected' : ''}>${esc(I18N.pick(c.name))}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>💰 ${t('filter_price')}</label>
          <select onchange="Views.setFilter('maxPrice', this.value)">
            <option value="">${t('filter_all')}</option>
            ${[150, 180, 220, 300].map(p => `<option value="${p}" ${filters.maxPrice == p ? 'selected' : ''}>${p} ${t('currency')}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>⭐ ${t('filter_rating')}</label>
          <select onchange="Views.setFilter('minRating', this.value)">
            <option value="">${t('filter_all')}</option>
            ${[5, 4, 3].map(r => `<option value="${r}" ${filters.minRating == r ? 'selected' : ''}>${'⭐'.repeat(r)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>📅 ${t('filter_date')}</label>
          <input class="date-input" dir="ltr" placeholder="${t('select_date')}"
                 type="${filters.date ? 'date' : 'text'}" min="${Store.todayISO()}" value="${filters.date}"
                 onfocus="this.type='date'; this.showPicker && this.showPicker();"
                 onblur="if(!this.value){ this.type='text'; }"
                 onclick="this.showPicker && this.showPicker()"
                 onchange="Views.setFilter('date', this.value)"/>
        </div>
      </div>

      <h2 class="section-title">🏟️ ${t('nav_stadiums')}</h2>
      <div class="results-bar">${list.length} ${t('results_count')}</div>
      ${list.length
        ? `<div class="grid">${list.map(stadiumCard).join('')}</div>`
        : `<div class="empty"><div class="big">😕</div>${t('no_results')}</div>`}

      <h2 class="section-title">✨ ${t('how_title')}</h2>
      <div class="how">
        ${[1, 2, 3].map(n => `
          <div class="step">
            <div class="n">${n}</div>
            <h4>${t('how_' + n + '_t')}</h4>
            <p>${t('how_' + n + '_d')}</p>
          </div>`).join('')}
      </div>
    `;
  }

  function setFilter(key, val) {
    filters[key] = val;
    /* re-render but keep search input focus */
    const active = document.activeElement && document.activeElement.id;
    App.rerender();
    if (active === 'f-q') {
      const el = document.getElementById('f-q');
      el.focus(); el.setSelectionRange(el.value.length, el.value.length);
    }
  }

  function stadiumCard(s) {
    const r = Store.stadiumRating(s.id);
    return `
      <article class="card" onclick="App.go('stadium',{id:'${s.id}'})" style="cursor:pointer">
        <div class="card-img">
          <div class="fallback">⚽</div>
          <img src="${esc(s.images[0] || '')}" alt="${esc(I18N.pick(s.name))}" loading="lazy"
               onerror="this.remove()"/>
          <span class="badge green">${t(s.grass === 'natural' ? 'am_grass_natural' : 'am_grass_artificial')}</span>
        </div>
        <div class="card-body">
          <h3>${esc(I18N.pick(s.name))}</h3>
          <div class="meta">📍 ${esc(Store.cityName(s.cityId))} — ${esc(I18N.pick(s.district))}</div>
          <div class="meta">
            <span class="stars">${App.starsHTML(r.avg)}</span>
            <span>${r.count ? r.avg.toFixed(1) : '—'} (${r.count} ${t('reviews_count')})</span>
          </div>
          <div class="price-line">
            <span class="unit">${t('from')}</span>
            <span class="num">${s.basePrice}</span>
            <span class="unit">${t('currency')} ${t('per_hour')}</span>
          </div>
          <button class="btn btn-primary btn-sm mt1">${t('view_details')}</button>
        </div>
      </article>`;
  }

  /* ================= STADIUM DETAIL + BOOKING ================= */
  const bk = { date: Store.todayISO(), hour: null, galleryIdx: 0, reviewStars: 5 };

  function stadiumView({ id }) {
    const s = Store.stadium(id);
    if (!s) return `<div class="empty mt2"><div class="big">😕</div>${t('no_results')}</div>`;
    if (App.route.params._fresh !== id) { bk.date = Store.todayISO(); bk.hour = null; bk.galleryIdx = 0; App.route.params._fresh = id; }

    const r = Store.stadiumRating(s.id);
    const slots = Store.slotsFor(s.id, bk.date);
    const selected = bk.hour !== null && slots.find(sl => sl.hour === bk.hour && sl.state === 'free');
    const mapsUrl = `https://maps.google.com/?q=${s.lat},${s.lng}`;

    const me = Store.currentUser();
    const isAdmin = me && me.role === 'admin';
    const isOwner = me && me.role === 'vendor' && s.vendorId === me.id;
    const pending = !s.approved;
    // Where the back button returns to, based on who's viewing
    const backBtn = isAdmin
      ? `<button class="btn btn-ghost btn-sm mt2" onclick="App.go('admin')">← ${t('back_to_admin')}</button>`
      : isOwner
        ? `<button class="btn btn-ghost btn-sm mt2" onclick="App.go('vendor')">← ${t('back_to_vendor')}</button>`
        : `<button class="btn btn-ghost btn-sm mt2" onclick="App.go('home')">← ${t('back')}</button>`;

    return `
      ${backBtn}
      ${previewBanner(s, { isAdmin, isOwner, pending })}

      <div class="detail-head">
        <div>
          <div class="gallery">
            <div class="main">
              <img src="${esc(s.images[bk.galleryIdx] || s.images[0] || '')}" alt="${esc(I18N.pick(s.name))}" onerror="this.style.display='none'"/>
            </div>
            ${s.images.length > 1 ? `
              <div class="thumbs">
                ${s.images.map((img, i) => `
                  <img src="${esc(img)}" class="${i === bk.galleryIdx ? 'active' : ''}"
                       onclick="Views.setGallery(${i})" onerror="this.remove()"/>`).join('')}
              </div>` : ''}
          </div>

          <div class="panel mt1">
            <h2>${esc(I18N.pick(s.name))}</h2>
            <div class="meta mt1">
              📍 ${esc(Store.cityName(s.cityId))} — ${esc(I18N.pick(s.district))}
              &nbsp;·&nbsp; <span class="stars">${App.starsHTML(r.avg)}</span>
              ${r.count ? r.avg.toFixed(1) : '—'} (${r.count} ${t('reviews_count')})
            </div>
            <p class="desc">${esc(I18N.pick(s.desc))}</p>

            <h3 class="section-title" style="margin-top:1.4rem">🛠️ ${t('amenities')}</h3>
            <div class="amenity-grid">
              <div class="amenity"><span class="ic">🌱</span>${t(s.grass === 'natural' ? 'am_grass_natural' : 'am_grass_artificial')}</div>
              <div class="amenity"><span class="ic">📐</span>${t('am_size')}: ${esc(s.size)}</div>
              ${s.amenities.map(a => `<div class="amenity"><span class="ic">${AMENITY_ICONS[a] || '✔️'}</span>${t('am_' + a)}</div>`).join('')}
            </div>

            <h3 class="section-title" style="margin-top:1.4rem">🗺️ ${t('location')}</h3>
            <div class="map-wrap">
              <iframe loading="lazy" src="https://maps.google.com/maps?q=${s.lat},${s.lng}&z=14&output=embed"></iframe>
            </div>
            <a class="btn btn-ghost btn-sm mt1" href="${mapsUrl}" target="_blank" rel="noopener">📍 ${t('open_in_maps')}</a>
          </div>
        </div>

        <div class="panel">
          <h3 class="section-title" style="margin:0 0 .6rem">📅 ${t('book_title')}</h3>
          <label class="meta">${t('pick_day')}</label>
          <div class="day-strip">${dayStrip(s)}</div>

          <label class="meta">${t('pick_time')}</label>
          <div class="slot-grid">
            ${slots.map(sl => slotCell(s, sl)).join('')}
          </div>
          <div class="legend">
            <span class="l-free"><i></i>${t('slot_available')}</span>
            <span class="l-booked"><i></i>${t('slot_booked')}</span>
            <span class="l-past"><i></i>${t('slot_past')}</span>
          </div>

          ${pending
            ? `<div class="summary" style="border-color:rgba(245,158,11,.5)"><div class="row">⏳ ${t('preview_no_book')}</div></div>`
            : selected ? `
            <div class="summary">
              <div class="row"><b>${t('booking_summary')}</b></div>
              <div class="row"><span>📅</span><span>${I18N.fmtDate(bk.date)}</span></div>
              <div class="row"><span>⏰</span><span>${I18N.fmtHour(bk.hour % 24)}</span></div>
              <div class="row"><span>${t('total')}</span><span class="total">${selected.price} ${t('currency')}</span></div>
              <div class="row"><span>💵</span><span>${t('pay_cash')}</span></div>
            </div>
            <button class="btn btn-primary mt1" style="width:100%" onclick="Views.confirmBooking('${s.id}')">
              ${t('confirm_booking')} ⚽
            </button>` : ''}

          <p class="policy-note">ℹ️ ${t('cancel_policy', { h: s.cancelHours, n: s.noShowLimit })}</p>
        </div>
      </div>

      ${reviewsSection(s)}
    `;
  }

  /* Role-aware banner shown above a stadium page.
     - Admin viewing a pending stadium → approve/reject bar (the requested feature).
     - Owner viewing their own stadium → "this is how players see it" note. */
  function previewBanner(s, { isAdmin, isOwner, pending }) {
    if (isAdmin && pending) {
      return `
        <div class="preview-bar pending">
          <div class="pb-text">⏳ ${t('pending_banner_admin')}</div>
          <div class="row-actions">
            <button class="btn btn-success btn-sm" onclick="Views.previewApprove('${s.id}', true)">✓ ${t('ad_approve')}</button>
            <button class="btn btn-danger btn-sm" onclick="Views.previewApprove('${s.id}', false)">✗ ${t('ad_reject')}</button>
          </div>
        </div>`;
    }
    if (isOwner) {
      return `<div class="preview-bar ${pending ? 'pending' : 'live'}">
        <div class="pb-text">${pending ? '⏳ ' + t('pending_banner_vendor') : '👁️ ' + t('preview_vendor_live')}</div>
      </div>`;
    }
    return '';
  }

  /* Admin approves/rejects straight from the preview page, then returns to the panel. */
  function previewApprove(id, ok) {
    if (!ok && !confirm(t('reject_confirm'))) return;
    Store.approveStadium(id, ok);
    App.toast(t('vd_saved'), 'ok');
    App.go('admin');
  }

  function dayStrip(s) {
    let html = '';
    for (let i = 0; i < 10; i++) {
      const iso = Store.todayISO(i);
      const d = new Date(iso + 'T00:00:00');
      html += `
        <div class="day-pill ${bk.date === iso ? 'active' : ''}" onclick="Views.setDay('${iso}')">
          <div class="dow">${d.toLocaleDateString(I18N.locale(), { weekday: 'short' })}</div>
          <div class="dnum">${d.toLocaleDateString(I18N.locale(), { day: 'numeric' })}</div>
        </div>`;
    }
    return html;
  }

  function slotCell(s, sl) {
    const isPeak = (sl.hour % 24) >= 20 || (sl.hour % 24) < 1;
    const cls = sl.state + (bk.hour === sl.hour && sl.state === 'free' ? ' selected' : '');
    const click = sl.state === 'free' ? `onclick="Views.pickSlot(${sl.hour})"` : '';
    const label = sl.state === 'booked' ? t('slot_booked') : sl.state === 'past' ? t('slot_past') : `${sl.price} ${t('currency')}`;
    return `
      <div class="slot ${cls}" ${click} title="${isPeak ? t('peak') : ''}">
        ${isPeak && sl.state === 'free' ? `<span class="peak-tag">🔥</span>` : ''}
        <div class="t">${I18N.fmtHour(sl.hour % 24)}</div>
        <div class="p">${label}</div>
      </div>`;
  }

  function setDay(iso) { bk.date = iso; bk.hour = null; App.rerender(); }
  function pickSlot(h) { bk.hour = h; App.rerender(); }
  function setGallery(i) { bk.galleryIdx = i; App.rerender(); }

  function confirmBooking(stadiumId) {
    const me = Store.currentUser();
    if (!me) return App.openAuth(() => confirmBooking(stadiumId));
    const res = Store.createBooking(stadiumId, bk.date, bk.hour);
    if (res.error) return App.toast(t(res.error), 'err');
    bk.hour = null;
    App.rerender();
    showBookingDone(res.booking);
  }

  function showBookingDone(b) {
    const s = Store.stadium(b.stadiumId);
    document.getElementById('modal-zone').innerHTML = `
      <div class="modal-backdrop" onclick="if(event.target===this)App.closeModal()">
        <div class="modal" style="text-align:center">
          <div style="font-size:3rem">🎉</div>
          <h3>${t('booking_confirmed')}</h3>
          <p class="sub">${esc(I18N.pick(s.name))} — ${I18N.fmtDate(b.date)} · ${I18N.fmtHour(b.hour % 24)}<br/>
             <b style="color:var(--green)">${b.price} ${t('currency')}</b> · ${t('pay_cash')}</p>
          <a class="btn btn-wa" style="width:100%" target="_blank" rel="noopener"
             href="${Store.whatsappLink(b)}">💬 ${t('send_whatsapp')}</a>
          <button class="btn btn-ghost mt1" style="width:100%" onclick="App.closeModal();App.go('bookings')">${t('my_bookings')}</button>
        </div>
      </div>`;
  }

  /* ---------- Reviews ---------- */
  function reviewsSection(s) {
    const reviews = Store.reviewsFor(s.id);
    const can = Store.canReview(s.id);
    return `
      <div class="panel mt2">
        <h3 class="section-title" style="margin:0">⭐ ${t('reviews')}</h3>
        ${can ? `
          <div class="mt1">
            <b>${t('write_review')}</b>
            <div class="star-input mt1" id="star-input">
              ${[1, 2, 3, 4, 5].map(i => `<span class="${i <= bk.reviewStars ? 'on' : ''}" onclick="Views.setStars(${i})">★</span>`).join('')}
            </div>
            <textarea id="review-text" rows="3" class="mt1" placeholder="${t('review_placeholder')}"></textarea>
            <button class="btn btn-primary btn-sm mt1" onclick="Views.submitReview('${s.id}')">${t('submit_review')}</button>
          </div>` : `<p class="meta mt1">🔒 ${t('review_rule')}</p>`}
        ${reviews.length
          ? reviews.map(r => `
            <div class="review">
              <div class="head">
                <b>${esc((Store.user(r.userId) || {}).name || '—')}</b>
                <span class="stars">${App.starsHTML(r.rating)}</span>
              </div>
              <p>${esc(I18N.pick(r.text))}</p>
              ${r.reply ? `<p style="color:var(--green)">↳ <b>${t('owner_reply')}:</b> ${esc(I18N.pick(r.reply))}</p>` : ''}
            </div>`).join('')
          : `<div class="empty">${t('no_reviews')}</div>`}
      </div>`;
  }

  function setStars(n) { bk.reviewStars = n; App.rerender(); }

  function submitReview(stadiumId) {
    const text = document.getElementById('review-text').value.trim();
    if (!text) return App.toast(t('fill_required'), 'err');
    const res = Store.addReview(stadiumId, bk.reviewStars, text);
    if (res.error) return App.toast(t(res.error), 'err');
    App.toast(t('review_saved'), 'ok');
    App.rerender();
  }

  /* ================= MY BOOKINGS ================= */
  let bookingsTab = 'upcoming';

  function bookingsView() {
    const me = Store.currentUser();
    if (!me) { App.openAuth(() => App.go('bookings')); return `<div class="empty mt2">${t('login_to_book')}</div>`; }

    const all = Store.myBookings();
    const list = all.filter(b => bookingsTab === 'upcoming' ? Store.isUpcoming(b) : !Store.isUpcoming(b));

    return `
      <h2 class="section-title mt2">📒 ${t('my_bookings')}</h2>
      <div class="tabs">
        <button class="tab ${bookingsTab === 'upcoming' ? 'active' : ''}" onclick="Views.setBookingsTab('upcoming')">${t('upcoming')}</button>
        <button class="tab ${bookingsTab === 'past' ? 'active' : ''}" onclick="Views.setBookingsTab('past')">${t('past')}</button>
      </div>
      ${list.length ? list.map(bookingRow).join('') : `
        <div class="empty">
          <div class="big">📭</div>${t('no_bookings')}<br/>
          <button class="btn btn-primary btn-sm mt1" onclick="App.go('home')">${t('browse_stadiums')}</button>
        </div>`}
    `;
  }

  function bookingRow(b) {
    const s = Store.stadium(b.stadiumId);
    const cancellable = Store.isUpcoming(b);
    return `
      <div class="booking-row">
        <div class="when">
          <div class="d">${I18N.fmtDate(b.date)}</div>
          <div class="h">⏰ ${I18N.fmtHour(b.hour % 24)}</div>
        </div>
        <div class="grow">
          <div class="st-name">${App.esc(I18N.pick(s.name))}</div>
          <div class="st-city">📍 ${App.esc(Store.cityName(s.cityId))} · ${b.price} ${t('currency')} · ${t('pay_cash')}</div>
        </div>
        ${App.statusPill(b)}
        ${cancellable ? `
          <div class="row-actions">
            <a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${Store.whatsappLink(b)}">💬</a>
            ${Store.canCancel(b)
              ? `<button class="btn btn-danger btn-sm" onclick="Views.cancelBooking('${b.id}')">${t('cancel_booking')}</button>`
              : `<button class="btn btn-ghost btn-sm" disabled>${t('cancel_too_late', { h: s.cancelHours })}</button>`}
          </div>` : ''}
      </div>`;
  }

  function setBookingsTab(tab) { bookingsTab = tab; App.rerender(); }

  function cancelBooking(id) {
    if (!confirm(t('cancel_confirm'))) return;
    const booking = Store.myBookings().find(b => b.id === id);
    const res = Store.cancelBooking(id);
    if (res.error) {
      const h = booking ? Store.stadium(booking.stadiumId).cancelHours : 6;
      return App.toast(t(res.error, { h }), 'err');
    }
    App.toast(t('cancelled_ok'), 'ok');
    App.rerender();
  }

  /* ---------------- Register ---------------- */
  App.registerPage('home', homeView);
  App.registerPage('stadium', stadiumView);
  App.registerPage('bookings', bookingsView);

  window.Views = {
    setFilter, setDay, pickSlot, setGallery, confirmBooking,
    setStars, submitReview, setBookingsTab, cancelBooking, previewApprove,
  };
})();
