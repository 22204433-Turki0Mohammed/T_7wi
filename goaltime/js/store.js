/* ============================================================
   GoalTime — Data layer & booking engine.
   Persists to localStorage. Every function here maps 1:1 to a
   future backend endpoint (Supabase/Laravel/Node) — swap the
   implementation, keep the signatures.
   ============================================================ */
const Store = (() => {

  const KEY = 'gt_db_v1';
  const PLATFORM_WA = '966500000000'; // WhatsApp business number (placeholder)

  /* ---------------- Seed data ---------------- */
  const IMG = {
    a: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&q=70',
    b: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=1200&q=70',
    c: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=70',
    d: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=70',
    e: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=70',
    f: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200&q=70',
  };

  function todayISO(offsetDays = 0) {
    const d = new Date(); d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }

  function seed() {
    const cities = [
      { id: 'riyadh',  name: { ar: 'الرياض', en: 'Riyadh', tr: 'Riyad' } },
      { id: 'jeddah',  name: { ar: 'جدة', en: 'Jeddah', tr: 'Cidde' } },
      { id: 'dammam',  name: { ar: 'الدمام', en: 'Dammam', tr: 'Dammam' } },
    ];

    const users = [
      { id: 'u_admin',  role: 'admin',    name: 'GoalTime Admin', phone: '966500000001', banned: false },
      { id: 'u_v1',     role: 'vendor',   name: 'Abu Khalid',     phone: '966500000002', banned: false },
      { id: 'u_v2',     role: 'vendor',   name: 'Mehmet Yılmaz',  phone: '966500000003', banned: false },
      { id: 'u_c1',     role: 'customer', name: 'Turki',          phone: '966511111111', banned: false },
      { id: 'u_c2',     role: 'customer', name: 'Fahad',          phone: '966522222222', banned: false },
      { id: 'u_c3',     role: 'customer', name: 'Salem',          phone: '966533333333', banned: false },
    ];

    const stadiums = [
      {
        id: 's1', vendorId: 'u_v1', cityId: 'riyadh', approved: true, active: true,
        name: { ar: 'ملعب النخبة', en: 'Elite Arena', tr: 'Elite Arena' },
        district: { ar: 'حي النرجس', en: 'Al Narjis', tr: 'Al Narjis' },
        desc: {
          ar: 'ملعب عشب صناعي حديث بمواصفات فيفا، إضاءة قوية ومدرجات صغيرة للجمهور.',
          en: 'Modern FIFA-spec artificial pitch with strong floodlights and small stands.',
          tr: 'FIFA standartlarında modern suni çim saha, güçlü aydınlatma ve küçük tribün.',
        },
        size: '40m × 20m', grass: 'artificial',
        amenities: ['changing', 'wc', 'parking', 'balls', 'water', 'lighting'],
        basePrice: 180, peakPrice: 240, weekendPrice: 220,
        openHour: 14, closeHour: 26, // 2pm → 2am
        cancelHours: 6, noShowLimit: 2,
        lat: 24.8235, lng: 46.6427,
        images: [IMG.a, IMG.d, IMG.f],
      },
      {
        id: 's2', vendorId: 'u_v1', cityId: 'riyadh', approved: true, active: true,
        name: { ar: 'ساحة الصقور', en: 'Falcons Field', tr: 'Falcons Sahası' },
        district: { ar: 'حي العليا', en: 'Al Olaya', tr: 'Al Olaya' },
        desc: {
          ar: 'موقع مركزي وسط الرياض، مثالي لمباريات ما بعد الدوام مع كافتيريا ملحقة.',
          en: 'Central Riyadh location, perfect for after-work matches, with an on-site cafeteria.',
          tr: 'Riyad merkezde, iş sonrası maçlar için ideal, kafeteryalı.',
        },
        size: '30m × 15m', grass: 'artificial',
        amenities: ['wc', 'parking', 'water', 'lighting', 'cafeteria'],
        basePrice: 140, peakPrice: 190, weekendPrice: 170,
        openHour: 16, closeHour: 25,
        cancelHours: 6, noShowLimit: 2,
        lat: 24.6949, lng: 46.6853,
        images: [IMG.b, IMG.e],
      },
      {
        id: 's3', vendorId: 'u_v2', cityId: 'jeddah', approved: true, active: true,
        name: { ar: 'ملعب الشاطئ', en: 'Seaside Pitch', tr: 'Sahil Sahası' },
        district: { ar: 'أبحر الشمالية', en: 'Obhur North', tr: 'Kuzey Obhur' },
        desc: {
          ar: 'العب على بُعد دقائق من البحر — نسيم جدة وأجواء لا تُنسى مع غرف تبديل مجهزة.',
          en: 'Play minutes from the sea — Jeddah breeze and unforgettable vibes with full changing rooms.',
          tr: 'Denize dakikalar uzaklıkta oyna — Cidde esintisi ve tam donanımlı soyunma odaları.',
        },
        size: '40m × 20m', grass: 'natural',
        amenities: ['changing', 'wc', 'parking', 'balls', 'water', 'lighting'],
        basePrice: 200, peakPrice: 260, weekendPrice: 250,
        openHour: 15, closeHour: 26,
        cancelHours: 6, noShowLimit: 3,
        lat: 21.7136, lng: 39.0983,
        images: [IMG.c, IMG.a],
      },
      {
        id: 's4', vendorId: 'u_v2', cityId: 'dammam', approved: true, active: true,
        name: { ar: 'ملعب الخليج', en: 'Gulf Arena', tr: 'Körfez Arena' },
        district: { ar: 'حي الشاطئ', en: 'Ash Shati', tr: 'Ash Shati' },
        desc: {
          ar: 'ملعبان جنب بعض بعشب صناعي ألماني، مناسب للدوريات والبطولات الرمضانية.',
          en: 'Two side-by-side German artificial pitches, great for leagues and Ramadan tournaments.',
          tr: 'Yan yana iki Alman suni çim saha, ligler ve turnuvalar için harika.',
        },
        size: '35m × 18m', grass: 'artificial',
        amenities: ['changing', 'wc', 'parking', 'water', 'lighting', 'cafeteria'],
        basePrice: 160, peakPrice: 210, weekendPrice: 200,
        openHour: 16, closeHour: 26,
        cancelHours: 6, noShowLimit: 2,
        lat: 26.4520, lng: 50.1033,
        images: [IMG.d, IMG.b],
      },
      {
        id: 's5', vendorId: 'u_v2', cityId: 'jeddah', approved: false, active: true,
        name: { ar: 'ملعب الفهد الجديد', en: 'New Fahd Pitch', tr: 'Yeni Fahd Sahası' },
        district: { ar: 'حي السلامة', en: 'As Salamah', tr: 'As Salamah' },
        desc: {
          ar: 'ملعب جديد كلياً — افتتاح قريباً بانتظار اعتماد الإدارة.',
          en: 'Brand-new pitch — opening soon, awaiting platform approval.',
          tr: 'Yepyeni saha — yakında açılıyor, platform onayı bekleniyor.',
        },
        size: '30m × 15m', grass: 'artificial',
        amenities: ['wc', 'water', 'lighting'],
        basePrice: 120, peakPrice: 150, weekendPrice: 140,
        openHour: 16, closeHour: 24,
        cancelHours: 6, noShowLimit: 2,
        lat: 21.5810, lng: 39.1653,
        images: [IMG.f],
      },
    ];

    /* Sample bookings: a mix of upcoming, past attended (enables reviews) and one awaiting confirmation */
    const bookings = [
      { id: 'b1', stadiumId: 's1', userId: 'u_c1', date: todayISO(1),  hour: 21, price: 240, status: 'confirmed', createdAt: Date.now() },
      { id: 'b2', stadiumId: 's1', userId: 'u_c2', date: todayISO(1),  hour: 22, price: 240, status: 'confirmed', createdAt: Date.now() },
      { id: 'b3', stadiumId: 's2', userId: 'u_c1', date: todayISO(-3), hour: 20, price: 190, status: 'attended',  createdAt: Date.now() },
      { id: 'b4', stadiumId: 's3', userId: 'u_c2', date: todayISO(-5), hour: 21, price: 260, status: 'attended',  createdAt: Date.now() },
      { id: 'b5', stadiumId: 's1', userId: 'u_c3', date: todayISO(-1), hour: 20, price: 240, status: 'confirmed', createdAt: Date.now() },
      { id: 'b6', stadiumId: 's4', userId: 'u_c3', date: todayISO(2),  hour: 19, price: 160, status: 'confirmed', createdAt: Date.now() },
    ];

    const reviews = [
      { id: 'r1', stadiumId: 's2', userId: 'u_c1', rating: 5, text: { ar: 'عشب ممتاز وإضاءة قوية، تجربة رائعة!', en: 'Great turf and lighting, awesome experience!', tr: 'Harika çim ve aydınlatma!' }, date: todayISO(-2) },
      { id: 'r2', stadiumId: 's3', userId: 'u_c2', rating: 4, text: { ar: 'الموقع خرافي قرب البحر، المواقف ضيقة شوي.', en: 'Amazing seaside location, parking a bit tight.', tr: 'Deniz kenarı konum harika, otopark biraz dar.' }, date: todayISO(-4) },
    ];

    return { cities, users, stadiums, bookings, reviews, session: null };
  }

  /* ---------------- Persistence ---------------- */
  let db;
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db || !db.stadiums) { db = seed(); save(); }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(db)); }
  function uid(p) { return p + '_' + Math.random().toString(36).slice(2, 9); }

  /* ---------------- Auth ---------------- */
  function currentUser() { return db.session ? db.users.find(u => u.id === db.session) : null; }

  function loginOrRegister(phone, name) {
    phone = (phone || '').replace(/\D/g, '');
    if (!phone) return { error: 'fill_required' };
    let user = db.users.find(u => u.phone === phone);
    if (!user) {
      if (!name) return { error: 'fill_required' };
      user = { id: uid('u'), role: 'customer', name, phone, banned: false };
      db.users.push(user);
    }
    db.session = user.id; save();
    return { user };
  }

  function loginDemo(role) {
    const u = db.users.find(x => x.role === role);
    db.session = u.id; save();
    return u;
  }

  function logout() { db.session = null; save(); }

  /* ---------------- Catalog ---------------- */
  function cities() { return db.cities; }
  function cityName(id) { return I18N.pick((db.cities.find(c => c.id === id) || {}).name); }
  function stadium(id) { return db.stadiums.find(s => s.id === id); }
  function user(id) { return db.users.find(u => u.id === id); }

  function publicStadiums() { return db.stadiums.filter(s => s.approved && s.active); }

  function stadiumRating(id) {
    const rs = db.reviews.filter(r => r.stadiumId === id);
    if (!rs.length) return { avg: 0, count: 0 };
    return { avg: rs.reduce((a, r) => a + r.rating, 0) / rs.length, count: rs.length };
  }

  function searchStadiums({ q, cityId, maxPrice, minRating, date }) {
    return publicStadiums().filter(s => {
      if (cityId && cityId !== 'all' && s.cityId !== cityId) return false;
      if (maxPrice && s.basePrice > maxPrice) return false;
      if (minRating) { const r = stadiumRating(s.id); if (r.avg < minRating) return false; }
      if (date && !slotsFor(s.id, date).some(sl => sl.state === 'free')) return false;
      if (q) {
        const hay = [I18N.pick(s.name), I18N.pick(s.district), cityName(s.cityId)].join(' ').toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }

  /* ---------------- Booking engine ---------------- */
  function isWeekend(isoDate) {
    const d = new Date(isoDate + 'T00:00:00').getDay();
    return d === 5 || d === 6; // Fri / Sat
  }

  function slotPrice(s, isoDate, hour) {
    const h = hour % 24;
    if (h >= 20 || h < 1) return isWeekend(isoDate) ? Math.max(s.peakPrice, s.weekendPrice) : s.peakPrice;
    return isWeekend(isoDate) ? s.weekendPrice : s.basePrice;
  }

  function slotStart(isoDate, hour) {
    const d = new Date(isoDate + 'T00:00:00');
    d.setHours(hour, 0, 0, 0); // hour may be ≥24 → rolls into next day
    return d;
  }

  /* Returns [{hour, price, state: free|booked|past, bookingId}] */
  function slotsFor(stadiumId, isoDate) {
    const s = stadium(stadiumId);
    const now = new Date();
    const out = [];
    for (let h = s.openHour; h < s.closeHour; h++) {
      const start = slotStart(isoDate, h);
      const booked = db.bookings.find(b =>
        b.stadiumId === stadiumId && b.date === isoDate && b.hour === h &&
        b.status !== 'cancelled');
      let state = 'free';
      if (start < now) state = 'past';
      if (booked) state = 'booked';
      out.push({ hour: h, price: slotPrice(s, isoDate, h), state, bookingId: booked && booked.id });
    }
    return out;
  }

  function createBooking(stadiumId, isoDate, hour) {
    const me = currentUser();
    if (!me) return { error: 'login_to_book' };
    if (me.banned) return { error: 'banned_msg' };
    const slot = slotsFor(stadiumId, isoDate).find(sl => sl.hour === hour);
    if (!slot || slot.state !== 'free') return { error: 'slot_booked' };
    const b = {
      id: uid('b'), stadiumId, userId: me.id, date: isoDate, hour,
      price: slot.price, status: 'confirmed', createdAt: Date.now(),
    };
    db.bookings.push(b); save();
    return { booking: b };
  }

  function canCancel(b) {
    const s = stadium(b.stadiumId);
    const msLeft = slotStart(b.date, b.hour) - new Date();
    return msLeft >= s.cancelHours * 3600 * 1000;
  }

  function cancelBooking(id) {
    const b = db.bookings.find(x => x.id === id);
    if (!b || b.status !== 'confirmed') return { error: 'no_results' };
    if (!canCancel(b)) return { error: 'cancel_too_late' };
    b.status = 'cancelled'; save();
    return { booking: b };
  }

  function myBookings() {
    const me = currentUser();
    if (!me) return [];
    return db.bookings.filter(b => b.userId === me.id)
      .sort((a, b) => (b.date + b.hour) > (a.date + a.hour) ? 1 : -1);
  }

  function isUpcoming(b) { return slotStart(b.date, b.hour) > new Date() && b.status === 'confirmed'; }

  /* ---------------- Reviews ---------------- */
  function canReview(stadiumId) {
    const me = currentUser();
    if (!me) return false;
    const played = db.bookings.some(b => b.stadiumId === stadiumId && b.userId === me.id && b.status === 'attended');
    const already = db.reviews.some(r => r.stadiumId === stadiumId && r.userId === me.id);
    return played && !already;
  }

  function addReview(stadiumId, rating, text) {
    const me = currentUser();
    if (!canReview(stadiumId)) return { error: 'review_rule' };
    const r = { id: uid('r'), stadiumId, userId: me.id, rating, text, date: todayISO() };
    db.reviews.push(r); save();
    return { review: r };
  }

  function reviewsFor(stadiumId) {
    return db.reviews.filter(r => r.stadiumId === stadiumId).slice().reverse();
  }

  /* ---------------- Vendor ---------------- */
  function vendorStadiums(vendorId) { return db.stadiums.filter(s => s.vendorId === vendorId); }

  function vendorBookings(vendorId, isoDate) {
    const ids = vendorStadiums(vendorId).map(s => s.id);
    return db.bookings
      .filter(b => ids.includes(b.stadiumId) && (!isoDate || b.date === isoDate) && b.status !== 'cancelled')
      .sort((a, b) => a.hour - b.hour);
  }

  /* Past confirmed bookings the vendor must mark attended / no-show */
  function vendorPendingAttendance(vendorId) {
    const now = new Date();
    const ids = vendorStadiums(vendorId).map(s => s.id);
    return db.bookings.filter(b =>
      ids.includes(b.stadiumId) && b.status === 'confirmed' &&
      slotStart(b.date, b.hour).getTime() + 3600 * 1000 < now.getTime());
  }

  /* Mark attendance; auto-ban after N consecutive no-shows (N set per stadium by its owner) */
  function markAttendance(bookingId, attended) {
    const b = db.bookings.find(x => x.id === bookingId);
    if (!b) return {};
    b.status = attended ? 'attended' : 'no_show';
    let autoBanned = false;
    if (!attended) {
      const s = stadium(b.stadiumId);
      const u = user(b.userId);
      const finished = db.bookings
        .filter(x => x.userId === b.userId && ['attended', 'no_show'].includes(x.status))
        .sort((x, y) => (x.date + String(x.hour).padStart(2, '0')).localeCompare(y.date + String(y.hour).padStart(2, '0')));
      let streak = 0;
      for (let i = finished.length - 1; i >= 0; i--) {
        if (finished[i].status === 'no_show') streak++; else break;
      }
      if (streak >= s.noShowLimit && u.role === 'customer') { u.banned = true; autoBanned = true; }
    }
    save();
    return { booking: b, autoBanned };
  }

  function updateStadium(id, patch) {
    const s = stadium(id);
    Object.assign(s, patch); save();
    return s;
  }

  /* ---------------- Admin ---------------- */
  function allUsers() { return db.users; }
  function allStadiums() { return db.stadiums; }
  function pendingStadiums() { return db.stadiums.filter(s => !s.approved); }
  function approveStadium(id, ok) {
    const s = stadium(id);
    if (ok) s.approved = true; else db.stadiums = db.stadiums.filter(x => x.id !== id);
    save();
  }
  function setBan(userId, banned) { user(userId).banned = banned; save(); }
  function setStadiumActive(id, active) { stadium(id).active = active; save(); }

  function noShowCount(userId) { return db.bookings.filter(b => b.userId === userId && b.status === 'no_show').length; }

  function stats() {
    const bs = db.bookings;
    const cancelled = bs.filter(b => b.status === 'cancelled').length;
    const byStadium = {};
    const byHour = {};
    bs.forEach(b => {
      if (b.status === 'cancelled') return;
      byStadium[b.stadiumId] = (byStadium[b.stadiumId] || 0) + 1;
      byHour[b.hour % 24] = (byHour[b.hour % 24] || 0) + 1;
    });
    const top = Object.entries(byStadium).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const peak = Object.entries(byHour).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return {
      totalBookings: bs.length,
      users: db.users.length,
      stadiums: db.stadiums.length,
      cancelRate: bs.length ? Math.round(cancelled / bs.length * 100) : 0,
      topStadiums: top, peakHours: peak,
    };
  }

  /* ---------------- WhatsApp ---------------- */
  function whatsappLink(booking) {
    const s = stadium(booking.stadiumId);
    const me = user(booking.userId);
    const maps = `https://maps.google.com/?q=${s.lat},${s.lng}`;
    const msg = t('wa_msg', {
      stadium: I18N.pick(s.name),
      date: I18N.fmtDate(booking.date),
      time: I18N.fmtHour(booking.hour % 24),
      price: booking.price + ' ' + t('currency'),
      maps,
    });
    return `https://wa.me/${me.phone}?text=${encodeURIComponent(msg)}`;
  }

  load();
  return {
    currentUser, loginOrRegister, loginDemo, logout,
    cities, cityName, stadium, user, publicStadiums, searchStadiums, stadiumRating,
    slotsFor, slotPrice, slotStart, createBooking, canCancel, cancelBooking, myBookings, isUpcoming,
    canReview, addReview, reviewsFor,
    vendorStadiums, vendorBookings, vendorPendingAttendance, markAttendance, updateStadium,
    allUsers, allStadiums, pendingStadiums, approveStadium, setBan, setStadiumActive, noShowCount, stats,
    whatsappLink, todayISO,
  };
})();
