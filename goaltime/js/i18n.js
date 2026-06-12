/* ============================================================
   GoalTime — i18n (Arabic / English / Turkish)
   RTL/LTR handled automatically via <html dir>.
   ============================================================ */
const I18N = (() => {

  const DICT = {
    /* ---------- Brand & nav ---------- */
    brand:            { ar: 'قول تايم', en: 'GoalTime', tr: 'GoalTime' },
    tagline:          { ar: 'احجز ملعبك في ثوانٍ', en: 'Book your pitch in seconds', tr: 'Sahanı saniyeler içinde ayırt' },
    nav_home:         { ar: 'الرئيسية', en: 'Home', tr: 'Ana Sayfa' },
    nav_stadiums:     { ar: 'الملاعب', en: 'Stadiums', tr: 'Sahalar' },
    nav_my_bookings:  { ar: 'حجوزاتي', en: 'My Bookings', tr: 'Rezervasyonlarım' },
    nav_vendor:       { ar: 'لوحة الملاعب', en: 'Vendor Panel', tr: 'Saha Paneli' },
    nav_admin:        { ar: 'لوحة الإدارة', en: 'Admin Panel', tr: 'Yönetici Paneli' },
    login:            { ar: 'تسجيل الدخول', en: 'Sign In', tr: 'Giriş Yap' },
    logout:           { ar: 'تسجيل الخروج', en: 'Sign Out', tr: 'Çıkış Yap' },
    register:         { ar: 'إنشاء حساب', en: 'Create Account', tr: 'Hesap Oluştur' },

    /* ---------- Hero / home ---------- */
    hero_title:       { ar: 'ملعبك القادم على بُعد نقرة', en: 'Your next match is one click away', tr: 'Bir sonraki maçın bir tık uzakta' },
    hero_sub:         { ar: 'منصة تجمع أفضل ملاعب كرة القدم — قارن الأسعار، شاهد التقييمات، واحجز فوراً وادفع كاش عند الوصول.', en: 'The platform that brings the best football pitches together — compare prices, read reviews and book instantly. Pay cash on arrival.', tr: 'En iyi halı sahaları bir araya getiren platform — fiyatları karşılaştır, yorumları oku ve anında rezervasyon yap. Ödeme sahada nakit.' },
    search_placeholder:{ ar: 'ابحث عن ملعب أو حي…', en: 'Search for a stadium or district…', tr: 'Saha veya semt ara…' },
    filter_city:      { ar: 'المدينة', en: 'City', tr: 'Şehir' },
    filter_all:       { ar: 'الكل', en: 'All', tr: 'Tümü' },
    filter_price:     { ar: 'السعر الأقصى', en: 'Max price', tr: 'Maks. fiyat' },
    filter_rating:    { ar: 'التقييم', en: 'Rating', tr: 'Puan' },
    filter_date:      { ar: 'تاريخ اللعب', en: 'Play date', tr: 'Oyun tarihi' },
    stars_plus:       { ar: 'نجوم فأكثر', en: 'stars & up', tr: 'yıldız ve üzeri' },
    results_count:    { ar: 'ملعب متاح', en: 'stadiums available', tr: 'saha mevcut' },
    no_results:       { ar: 'لا توجد ملاعب مطابقة لبحثك', en: 'No stadiums match your search', tr: 'Aramanızla eşleşen saha yok' },
    from:             { ar: 'يبدأ من', en: 'From', tr: 'Başlangıç' },
    per_hour:         { ar: '/ ساعة', en: '/ hour', tr: '/ saat' },
    currency:         { ar: 'ر.س', en: 'SAR', tr: 'SAR' },
    view_details:     { ar: 'عرض التفاصيل والحجز', en: 'View details & book', tr: 'Detaylar ve rezervasyon' },
    reviews_count:    { ar: 'تقييم', en: 'reviews', tr: 'yorum' },

    /* ---------- How it works ---------- */
    how_title:        { ar: 'كيف تحجز؟', en: 'How it works', tr: 'Nasıl çalışır?' },
    how_1_t:          { ar: 'اختر ملعبك', en: 'Pick your pitch', tr: 'Sahanı seç' },
    how_1_d:          { ar: 'قارن الملاعب حسب المدينة والسعر والتقييم.', en: 'Compare pitches by city, price and rating.', tr: 'Sahaları şehir, fiyat ve puana göre karşılaştır.' },
    how_2_t:          { ar: 'اختر الوقت', en: 'Pick a time', tr: 'Saat seç' },
    how_2_d:          { ar: 'الأوقات الخضراء متاحة — احجزها فوراً.', en: 'Green slots are free — book them instantly.', tr: 'Yeşil saatler boş — hemen ayırt.' },
    how_3_t:          { ar: 'العب وادفع كاش', en: 'Play & pay cash', tr: 'Oyna ve nakit öde' },
    how_3_d:          { ar: 'يصلك التأكيد على واتساب وتدفع عند الوصول.', en: 'Confirmation via WhatsApp, pay on arrival.', tr: 'WhatsApp ile onay, ödeme sahada.' },

    /* ---------- Stadium page ---------- */
    amenities:        { ar: 'المرافق والتجهيزات', en: 'Amenities', tr: 'Olanaklar' },
    am_grass_artificial:{ ar: 'عشب صناعي', en: 'Artificial grass', tr: 'Suni çim' },
    am_grass_natural: { ar: 'عشب طبيعي', en: 'Natural grass', tr: 'Doğal çim' },
    am_size:          { ar: 'مقاس الملعب', en: 'Pitch size', tr: 'Saha boyutu' },
    am_changing:      { ar: 'غرف تبديل', en: 'Changing rooms', tr: 'Soyunma odaları' },
    am_wc:            { ar: 'دورات مياه', en: 'Toilets', tr: 'Tuvaletler' },
    am_parking:       { ar: 'مواقف سيارات', en: 'Parking', tr: 'Otopark' },
    am_balls:         { ar: 'كرات وصديريات', en: 'Balls & bibs', tr: 'Top ve yelek' },
    am_water:         { ar: 'مياه شرب', en: 'Drinking water', tr: 'İçme suyu' },
    am_lighting:      { ar: 'إضاءة ليلية', en: 'Night lighting', tr: 'Gece aydınlatması' },
    am_cafeteria:     { ar: 'كافتيريا', en: 'Cafeteria', tr: 'Kafeterya' },
    location:         { ar: 'الموقع على الخريطة', en: 'Location', tr: 'Konum' },
    open_in_maps:     { ar: 'افتح في خرائط جوجل', en: 'Open in Google Maps', tr: "Google Haritalar'da aç" },
    reviews:          { ar: 'التقييمات والمراجعات', en: 'Ratings & Reviews', tr: 'Puanlar ve Yorumlar' },
    no_reviews:       { ar: 'لا توجد مراجعات بعد — كن أول من يقيّم بعد لعبك!', en: 'No reviews yet — be the first after your match!', tr: 'Henüz yorum yok — maçından sonra ilk yorumu sen yap!' },
    write_review:     { ar: 'أضف تقييمك', en: 'Write a review', tr: 'Yorum yaz' },
    review_rule:      { ar: 'التقييم متاح فقط لمن أكمل حجزاً فعلياً في هذا الملعب.', en: 'Only players with a completed booking can review this stadium.', tr: 'Yalnızca tamamlanmış rezervasyonu olan oyuncular yorum yapabilir.' },
    review_placeholder:{ ar: 'صف تجربتك في الملعب…', en: 'Describe your experience…', tr: 'Deneyimini anlat…' },
    submit_review:    { ar: 'إرسال التقييم', en: 'Submit review', tr: 'Yorumu gönder' },
    review_saved:     { ar: 'شكراً! تم نشر تقييمك', en: 'Thanks! Your review is live', tr: 'Teşekkürler! Yorumun yayında' },

    /* ---------- Booking ---------- */
    book_title:       { ar: 'احجز وقتك', en: 'Book your slot', tr: 'Saatini ayırt' },
    pick_day:         { ar: 'اختر اليوم', en: 'Pick a day', tr: 'Gün seç' },
    pick_time:        { ar: 'اختر الساعة', en: 'Pick a time', tr: 'Saat seç' },
    slot_available:   { ar: 'متاح', en: 'Available', tr: 'Müsait' },
    slot_booked:      { ar: 'محجوز', en: 'Booked', tr: 'Dolu' },
    slot_past:        { ar: 'انتهى', en: 'Past', tr: 'Geçti' },
    peak:             { ar: 'وقت ذروة', en: 'Peak time', tr: 'Yoğun saat' },
    weekend_price:    { ar: 'سعر الويكند', en: 'Weekend price', tr: 'Hafta sonu fiyatı' },
    booking_summary:  { ar: 'ملخص الحجز', en: 'Booking summary', tr: 'Rezervasyon özeti' },
    total:            { ar: 'الإجمالي', en: 'Total', tr: 'Toplam' },
    pay_cash:         { ar: 'الدفع: كاش عند الوصول', en: 'Payment: cash on arrival', tr: 'Ödeme: sahada nakit' },
    confirm_booking:  { ar: 'تأكيد الحجز', en: 'Confirm booking', tr: 'Rezervasyonu onayla' },
    booking_confirmed:{ ar: 'تم تأكيد حجزك بنجاح! 🎉', en: 'Your booking is confirmed! 🎉', tr: 'Rezervasyonun onaylandı! 🎉' },
    send_whatsapp:    { ar: 'إرسال التفاصيل على واتساب', en: 'Send details via WhatsApp', tr: "Detayları WhatsApp'tan gönder" },
    wa_msg:           { ar: 'تأكيد حجز — قول تايم ⚽\nالملعب: {stadium}\nالتاريخ: {date}\nالوقت: {time}\nالسعر: {price} (كاش عند الوصول)\nالموقع: {maps}', en: 'Booking confirmed — GoalTime ⚽\nStadium: {stadium}\nDate: {date}\nTime: {time}\nPrice: {price} (cash on arrival)\nLocation: {maps}', tr: 'Rezervasyon onayı — GoalTime ⚽\nSaha: {stadium}\nTarih: {date}\nSaat: {time}\nFiyat: {price} (sahada nakit)\nKonum: {maps}' },
    login_to_book:    { ar: 'سجّل دخولك لإتمام الحجز', en: 'Sign in to complete your booking', tr: 'Rezervasyonu tamamlamak için giriş yap' },
    banned_msg:       { ar: 'حسابك محظور بسبب عدم الحضور المتكرر. تواصل مع الإدارة.', en: 'Your account is suspended due to repeated no-shows. Contact support.', tr: 'Tekrarlanan gelmeme nedeniyle hesabınız askıya alındı. Destek ile iletişime geçin.' },
    cancel_policy:    { ar: 'سياسة الإلغاء: يمكن الإلغاء مجاناً حتى {h} ساعات قبل الموعد. عدم الحضور {n} مرات يؤدي لحظر الحساب تلقائياً.', en: 'Cancellation policy: free cancellation up to {h} hours before kickoff. {n} no-shows lead to automatic account suspension.', tr: 'İptal politikası: maçtan {h} saat öncesine kadar ücretsiz iptal. {n} kez gelmeme hesabın otomatik askıya alınmasına yol açar.' },

    /* ---------- My bookings ---------- */
    my_bookings:      { ar: 'حجوزاتي', en: 'My Bookings', tr: 'Rezervasyonlarım' },
    upcoming:         { ar: 'القادمة', en: 'Upcoming', tr: 'Yaklaşan' },
    past:             { ar: 'السابقة', en: 'Past', tr: 'Geçmiş' },
    no_bookings:      { ar: 'لا توجد حجوزات هنا بعد', en: 'No bookings here yet', tr: 'Henüz rezervasyon yok' },
    browse_stadiums:  { ar: 'تصفح الملاعب', en: 'Browse stadiums', tr: 'Sahalara göz at' },
    cancel_booking:   { ar: 'إلغاء الحجز', en: 'Cancel booking', tr: 'Rezervasyonu iptal et' },
    cancel_too_late:  { ar: 'لا يمكن الإلغاء — تبقّى أقل من {h} ساعات على الموعد', en: 'Too late to cancel — less than {h} hours to kickoff', tr: 'İptal için çok geç — maça {h} saatten az kaldı' },
    cancel_confirm:   { ar: 'هل أنت متأكد من إلغاء هذا الحجز؟', en: 'Are you sure you want to cancel this booking?', tr: 'Bu rezervasyonu iptal etmek istediğinden emin misin?' },
    cancelled_ok:     { ar: 'تم إلغاء الحجز', en: 'Booking cancelled', tr: 'Rezervasyon iptal edildi' },
    st_confirmed:     { ar: 'مؤكد', en: 'Confirmed', tr: 'Onaylandı' },
    st_cancelled:     { ar: 'ملغي', en: 'Cancelled', tr: 'İptal edildi' },
    st_attended:      { ar: 'مكتمل', en: 'Completed', tr: 'Tamamlandı' },
    st_no_show:       { ar: 'لم يحضر', en: 'No-show', tr: 'Gelmedi' },
    st_pending:       { ar: 'بانتظار التأكيد', en: 'Awaiting confirmation', tr: 'Onay bekliyor' },

    /* ---------- Auth ---------- */
    name:             { ar: 'الاسم', en: 'Name', tr: 'İsim' },
    phone:            { ar: 'رقم الجوال', en: 'Phone number', tr: 'Telefon numarası' },
    phone_hint:       { ar: 'مثال: 9665XXXXXXXX', en: 'e.g. 9665XXXXXXXX', tr: 'örn. 905XXXXXXXXX' },
    welcome_back:     { ar: 'أهلاً بعودتك', en: 'Welcome back', tr: 'Tekrar hoş geldin' },
    auth_sub:         { ar: 'أدخل رقم جوالك — سننشئ حساباً لك تلقائياً إن لم يكن لديك.', en: 'Enter your phone — we will create an account automatically if you are new.', tr: 'Telefonunu gir — yeniysen otomatik hesap oluştururuz.' },
    continue:         { ar: 'متابعة', en: 'Continue', tr: 'Devam et' },
    demo_accounts:    { ar: 'حسابات تجريبية', en: 'Demo accounts', tr: 'Demo hesaplar' },
    demo_customer:    { ar: 'لاعب', en: 'Player', tr: 'Oyuncu' },
    demo_vendor:      { ar: 'صاحب ملعب', en: 'Stadium owner', tr: 'Saha sahibi' },
    demo_admin:       { ar: 'مدير المنصة', en: 'Platform admin', tr: 'Platform yöneticisi' },
    fill_required:    { ar: 'فضلاً أكمل الحقول المطلوبة', en: 'Please fill the required fields', tr: 'Lütfen gerekli alanları doldur' },
    logged_in_as:     { ar: 'تم تسجيل الدخول', en: 'Signed in', tr: 'Giriş yapıldı' },

    /* ---------- Vendor dashboard ---------- */
    vd_title:         { ar: 'لوحة تحكم صاحب الملعب', en: 'Vendor Dashboard', tr: 'Saha Sahibi Paneli' },
    vd_my_stadiums:   { ar: 'ملاعبي', en: 'My stadiums', tr: 'Sahalarım' },
    vd_calendar:      { ar: 'تقويم الحجوزات', en: 'Bookings calendar', tr: 'Rezervasyon takvimi' },
    vd_pending_actions:{ ar: 'حجوزات بانتظار تأكيد الحضور', en: 'Bookings awaiting attendance confirmation', tr: 'Katılım onayı bekleyen rezervasyonlar' },
    vd_mark_attended: { ar: 'حضر ✓', en: 'Attended ✓', tr: 'Geldi ✓' },
    vd_mark_no_show:  { ar: 'لم يحضر ✗', en: 'No-show ✗', tr: 'Gelmedi ✗' },
    vd_edit:          { ar: 'تعديل', en: 'Edit', tr: 'Düzenle' },
    vd_base_price:    { ar: 'السعر الأساسي', en: 'Base price', tr: 'Temel fiyat' },
    vd_peak_price:    { ar: 'سعر الذروة (8م–12م)', en: 'Peak price (8pm–12am)', tr: 'Yoğun saat fiyatı (20–24)' },
    vd_weekend_price: { ar: 'سعر الويكند', en: 'Weekend price', tr: 'Hafta sonu fiyatı' },
    vd_noshow_limit:  { ar: 'حد الغياب قبل الحظر', en: 'No-shows before ban', tr: 'Ban öncesi gelmeme sınırı' },
    vd_cancel_hours:  { ar: 'مهلة الإلغاء (ساعات)', en: 'Cancellation window (hours)', tr: 'İptal süresi (saat)' },
    vd_images:        { ar: 'روابط الصور (سطر لكل صورة)', en: 'Image URLs (one per line)', tr: 'Görsel URL’leri (her satıra bir)' },
    vd_save:          { ar: 'حفظ التغييرات', en: 'Save changes', tr: 'Değişiklikleri kaydet' },
    vd_saved:         { ar: 'تم الحفظ بنجاح', en: 'Saved successfully', tr: 'Başarıyla kaydedildi' },
    vd_today:         { ar: 'اليوم', en: 'Today', tr: 'Bugün' },
    vd_week:          { ar: 'الأسبوع', en: 'Week', tr: 'Hafta' },
    vd_no_bookings_day:{ ar: 'لا حجوزات في هذا اليوم', en: 'No bookings on this day', tr: 'Bu gün rezervasyon yok' },
    vd_status_approved:{ ar: 'معتمد', en: 'Approved', tr: 'Onaylı' },
    vd_status_pending:{ ar: 'بانتظار الاعتماد', en: 'Pending approval', tr: 'Onay bekliyor' },
    vd_user_banned_auto:{ ar: 'تم حظر اللاعب تلقائياً لتجاوزه حد الغياب', en: 'Player auto-banned for exceeding the no-show limit', tr: 'Oyuncu, gelmeme sınırını aştığı için otomatik banlandı' },

    /* ---------- Admin dashboard ---------- */
    ad_title:         { ar: 'لوحة التحكم الإدارية', en: 'Super Admin Dashboard', tr: 'Süper Yönetici Paneli' },
    ad_overview:      { ar: 'نظرة عامة', en: 'Overview', tr: 'Genel Bakış' },
    ad_total_bookings:{ ar: 'إجمالي الحجوزات', en: 'Total bookings', tr: 'Toplam rezervasyon' },
    ad_active_users:  { ar: 'المستخدمون', en: 'Users', tr: 'Kullanıcılar' },
    ad_stadium_count: { ar: 'الملاعب', en: 'Stadiums', tr: 'Sahalar' },
    ad_cancel_rate:   { ar: 'نسبة الإلغاء', en: 'Cancellation rate', tr: 'İptal oranı' },
    ad_top_stadiums:  { ar: 'الملاعب الأكثر طلباً', en: 'Most booked stadiums', tr: 'En çok rezerve edilen sahalar' },
    ad_peak_hours:    { ar: 'أوقات الذروة', en: 'Peak hours', tr: 'Yoğun saatler' },
    ad_pending:       { ar: 'ملاعب بانتظار الاعتماد', en: 'Stadiums pending approval', tr: 'Onay bekleyen sahalar' },
    ad_approve:       { ar: 'اعتماد', en: 'Approve', tr: 'Onayla' },
    ad_reject:        { ar: 'رفض', en: 'Reject', tr: 'Reddet' },
    ad_users:         { ar: 'إدارة المستخدمين', en: 'User management', tr: 'Kullanıcı yönetimi' },
    ad_stadiums:      { ar: 'إدارة الملاعب', en: 'Stadium management', tr: 'Saha yönetimi' },
    ad_ban:           { ar: 'حظر', en: 'Ban', tr: 'Banla' },
    ad_unban:         { ar: 'رفع الحظر', en: 'Unban', tr: 'Banı kaldır' },
    ad_banned:        { ar: 'محظور', en: 'Banned', tr: 'Banlı' },
    ad_active:        { ar: 'نشط', en: 'Active', tr: 'Aktif' },
    ad_role:          { ar: 'الدور', en: 'Role', tr: 'Rol' },
    ad_no_shows:      { ar: 'مرات الغياب', en: 'No-shows', tr: 'Gelmeme' },
    ad_disable:       { ar: 'إيقاف', en: 'Disable', tr: 'Devre dışı' },
    ad_enable:        { ar: 'تفعيل', en: 'Enable', tr: 'Etkinleştir' },
    ad_no_pending:    { ar: 'لا توجد ملاعب بانتظار الاعتماد', en: 'No stadiums pending approval', tr: 'Onay bekleyen saha yok' },
    role_customer:    { ar: 'لاعب', en: 'Player', tr: 'Oyuncu' },
    role_vendor:      { ar: 'صاحب ملعب', en: 'Owner', tr: 'Saha sahibi' },
    role_admin:       { ar: 'مدير', en: 'Admin', tr: 'Yönetici' },

    /* ---------- Misc ---------- */
    footer_note:      { ar: 'قول تايم — منصة حجز ملاعب كرة القدم. الدفع كاش عند الوصول.', en: 'GoalTime — the football pitch booking platform. Pay cash on arrival.', tr: 'GoalTime — halı saha rezervasyon platformu. Ödeme sahada nakit.' },
    not_authorized:   { ar: 'هذه الصفحة غير متاحة لحسابك', en: 'This page is not available for your account', tr: 'Bu sayfa hesabınız için kullanılamaz' },
    back:             { ar: 'رجوع', en: 'Back', tr: 'Geri' },
    close:            { ar: 'إغلاق', en: 'Close', tr: 'Kapat' },
    sar_hr:           { ar: 'ر.س/ساعة', en: 'SAR/hr', tr: 'SAR/saat' },
  };

  const LANGS = {
    ar: { label: 'العربية', dir: 'rtl', locale: 'ar-SA-u-ca-gregory-nu-latn' },
    en: { label: 'English', dir: 'ltr', locale: 'en-GB' },
    tr: { label: 'Türkçe',  dir: 'ltr', locale: 'tr-TR' },
  };

  let current = localStorage.getItem('gt_lang') || 'ar';

  function t(key, vars) {
    const entry = DICT[key];
    let s = entry ? (entry[current] || entry.en) : key;
    if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
    return s;
  }

  function lang() { return current; }
  function locale() { return LANGS[current].locale; }
  function dir() { return LANGS[current].dir; }

  function setLang(code) {
    if (!LANGS[code]) return;
    current = code;
    localStorage.setItem('gt_lang', code);
    document.documentElement.lang = code;
    document.documentElement.dir = LANGS[code].dir;
    document.title = t('brand') + ' — ' + t('tagline');
    if (window.App) App.rerender();
  }

  /* Localized name helper: entities store {ar, en, tr} objects */
  function pick(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[current] || obj.en || Object.values(obj)[0];
  }

  function fmtDate(isoDate) {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function fmtHour(h) {
    const d = new Date(); d.setHours(h, 0, 0, 0);
    return d.toLocaleTimeString(locale(), { hour: 'numeric', minute: '2-digit' });
  }

  function init() {
    document.documentElement.lang = current;
    document.documentElement.dir = LANGS[current].dir;
    document.title = t('brand') + ' — ' + t('tagline');
  }

  return { t, lang, setLang, dir, locale, pick, fmtDate, fmtHour, init, LANGS };
})();

const t = I18N.t;
