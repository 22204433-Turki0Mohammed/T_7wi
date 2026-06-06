// ─── Router & App Controller ───────────────────────────────────────────────
const App = {
  currentView: 'dashboard',
  activeCategory: 'all',

  init() {
    Gamification.updateStreak();
    UI.updateNavBar();
    const hash = location.hash.replace('#', '') || 'dashboard';
    this.navigate(hash);
    window.addEventListener('hashchange', () => {
      this.navigate(location.hash.replace('#', '') || 'dashboard');
    });
  },

  navigate(view) {
    this.currentView = view;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    this.render();
    window.scrollTo(0, 0);
  },

  render() {
    const main = document.getElementById('app-main');
    switch (this.currentView) {
      case 'dashboard': main.innerHTML = Views.dashboard(); break;
      case 'library':   main.innerHTML = Views.library();   break;
      case 'quiz':      main.innerHTML = Views.quiz();      break;
      case 'review':    main.innerHTML = Views.review();    break;
      case 'stats':     main.innerHTML = Views.stats();     break;
      default:          main.innerHTML = Views.dashboard();
    }
  },

  markRead(itemId) {
    const isNew = SRS.markRead(itemId);
    if (!isNew) { UI.showToast('تمت قراءة هذه المعلومة مسبقاً', 'info'); return; }
    Gamification.addXP(5, 'قراءة معلومة');
    UI.showToast('تمت القراءة! سيتم تذكيرك بمراجعتها لاحقاً ✓', 'success');
    this.render();

    const state = Storage.get();
    if ((state.sessionReads || 0) % 3 === 0 && state.sessionReads > 0) {
      setTimeout(() => {
        if (confirm('أحسنت! قرأت 3 معلومات جديدة. هل تريد اختباراً سريعاً؟')) {
          Quiz.start('auto');
        }
      }, 500);
    }
  },

  setCategory(cat) {
    this.activeCategory = cat;
    this.render();
  }
};

// ─── Views ─────────────────────────────────────────────────────────────────
const Views = {

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard() {
    const state = Storage.get();
    const { xp, level, streak, totalCorrect, totalIncorrect } = state.user;
    const pct = Math.round(Gamification.getProgressToNext(xp) * 100);
    const nextXP = Gamification.getNextThreshold(level);
    const curXP = Gamification.getThresholdForLevel(level);
    const dueCount = SRS.getDueItems().length;
    const readCount = SRS.getReadItems().length;
    const masteredCount = SAMPLE_DATA.filter(i => SRS.getMasteryLevel(i.id) === 'mastered').length;
    const totalQ = (totalCorrect || 0) + (totalIncorrect || 0);
    const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

    const recentHistory = (state.quizHistory || []).slice(0, 3);
    const historyHTML = recentHistory.length ? recentHistory.map(h => {
      const d = new Date(h.date);
      return `<div class="activity-item">
        <span class="activity-icon">📝</span>
        <span class="activity-text">اختبار ${this._quizTypeName(h.type)}: ${h.correct}/${h.total} صحيحة</span>
        <span class="activity-date">${d.toLocaleDateString('ar-SA')}</span>
      </div>`;
    }).join('') : '<p class="empty-msg">لا يوجد نشاط بعد. ابدأ بقراءة بعض المعلومات!</p>';

    return `
    <div class="view-container">
      <div class="dashboard-hero">
        <div class="hero-text">
          <h1>أهلاً بك في <span class="highlight">ذاكرة</span></h1>
          <p>نظام ذكي لترسيخ المعلومات في ذاكرتك للأبد</p>
        </div>
        <div class="hero-level">
          <div class="level-ring">
            <svg viewBox="0 0 100 100" class="ring-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#2d3748" stroke-width="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#grad)" stroke-width="8"
                stroke-dasharray="${2 * Math.PI * 42}" stroke-dashoffset="${2 * Math.PI * 42 * (1 - pct/100)}"
                stroke-linecap="round" transform="rotate(-90 50 50)"/>
              <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs>
            </svg>
            <div class="ring-center">
              <span class="ring-level">${level}</span>
              <span class="ring-label">مستوى</span>
            </div>
          </div>
          <div class="xp-detail">
            <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${pct}%"></div></div>
            <span class="xp-text">${xp.toLocaleString('ar')} / ${nextXP.toLocaleString('ar')} XP</span>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card stat-purple">
          <div class="stat-icon">📚</div>
          <div class="stat-num">${readCount}</div>
          <div class="stat-lbl">معلومة مقروءة</div>
        </div>
        <div class="stat-card stat-teal">
          <div class="stat-icon">⭐</div>
          <div class="stat-num">${masteredCount}</div>
          <div class="stat-lbl">معلومة متقنة</div>
        </div>
        <div class="stat-card stat-orange ${dueCount > 0 ? 'pulse-card' : ''}">
          <div class="stat-icon">🔔</div>
          <div class="stat-num">${dueCount}</div>
          <div class="stat-lbl">تحتاج مراجعة</div>
        </div>
        <div class="stat-card stat-green">
          <div class="stat-icon">🔥</div>
          <div class="stat-num">${streak}</div>
          <div class="stat-lbl">أيام متتالية</div>
        </div>
      </div>

      ${dueCount > 0 ? `
      <div class="due-alert">
        <div class="due-icon">📋</div>
        <div class="due-text">
          <strong>لديك ${dueCount} معلومة للمراجعة اليوم</strong>
          <p>المراجعة المنتظمة تعزز الحفظ طويل الأمد</p>
        </div>
        <button class="btn-primary" onclick="Quiz.start('review')">ابدأ المراجعة</button>
      </div>` : ''}

      <div class="action-cards">
        <div class="action-card" onclick="App.navigate('library')">
          <div class="action-icon">📖</div>
          <h3>استعرض المعلومات</h3>
          <p>${SAMPLE_DATA.length - readCount} معلومة جديدة لم تُقرأ</p>
        </div>
        <div class="action-card" onclick="App.navigate('quiz')">
          <div class="action-icon">🧠</div>
          <h3>ابدأ اختباراً</h3>
          <p>اختبر معلوماتك واكسب XP</p>
        </div>
        <div class="action-card" onclick="App.navigate('stats')">
          <div class="action-icon">📊</div>
          <h3>الإحصائيات</h3>
          <p>دقة الإجابات: ${accuracy}%</p>
        </div>
      </div>

      <div class="activity-section">
        <h3 class="section-title">النشاط الأخير</h3>
        <div class="activity-list">${historyHTML}</div>
      </div>
    </div>`;
  },

  // ── Library ───────────────────────────────────────────────────────────────
  library() {
    const cat = App.activeCategory;
    const filtered = cat === 'all' ? SAMPLE_DATA : SAMPLE_DATA.filter(i => i.category === cat);

    const catBtns = ['all', ...CATEGORIES].map(c =>
      `<button class="cat-btn ${cat === c ? 'active' : ''}" onclick="App.setCategory('${c}')">${c === 'all' ? 'الكل' : c}</button>`
    ).join('');

    const cards = filtered.map(item => {
      const s = SRS.getItemState(item.id);
      const mastery = SRS.getMasteryLevel(item.id);
      const retention = SRS.getRetentionEstimate(item.id);
      const isRead = !!s.readAt;
      const masteryLabels = { new: 'جديدة', reviewing: 'قيد المراجعة', learning: 'تتعلم', mastered: 'متقنة' };
      const masteryColors = { new: 'mastery-new', reviewing: 'mastery-review', learning: 'mastery-learn', mastered: 'mastery-master' };

      return `
      <div class="info-card ${isRead ? 'card-read' : ''}" id="card-${item.id}">
        <div class="card-header">
          <span class="card-icon">${item.icon}</span>
          <div class="card-meta">
            <h3 class="card-title">${item.title}</h3>
            <span class="cat-badge">${item.category}</span>
          </div>
          ${isRead ? `<span class="read-badge ${masteryColors[mastery]}">${masteryLabels[mastery]}</span>` : ''}
        </div>
        <div class="card-content">
          <p class="card-text">${item.content}</p>
        </div>
        <div class="card-footer">
          ${isRead ? `
            <div class="retention-bar">
              <span class="retention-label">الاستيعاب المتوقع</span>
              <div class="ret-bar-wrap"><div class="ret-bar-fill" style="width:${retention}%"></div></div>
              <span class="ret-pct">${retention}%</span>
            </div>
            ${s.nextReviewDate ? `<span class="next-review">المراجعة القادمة: ${new Date(s.nextReviewDate + 'T00:00:00').toLocaleDateString('ar-SA')}</span>` : ''}
            <div class="card-read-mark">✓ تمت القراءة</div>
          ` : `
            <button class="btn-read" onclick="App.markRead('${item.id}')">
              <span>✓</span> تمت القراءة
            </button>
          `}
        </div>
      </div>`;
    }).join('');

    const readCount = filtered.filter(i => SRS.isRead(i.id)).length;

    return `
    <div class="view-container">
      <div class="library-header">
        <div>
          <h2>مكتبة المعلومات</h2>
          <p>${readCount} / ${filtered.length} معلومة مقروءة</p>
        </div>
        <div class="library-progress">
          <div class="lib-bar"><div class="lib-bar-fill" style="width:${filtered.length ? Math.round(readCount/filtered.length*100) : 0}%"></div></div>
        </div>
      </div>
      <div class="cat-filters">${catBtns}</div>
      <div class="cards-grid">${cards || '<p class="empty-msg">لا توجد معلومات في هذا التصنيف</p>'}</div>
    </div>`;
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz() {
    const readCount = SRS.getReadItems().length;
    const dueCount = SRS.getDueItems().length;
    const quizTypes = [
      { type: 'daily', icon: '📅', title: 'اختبار يومي', desc: '5 أسئلة من آخر المعلومات المقروءة', min: 1, count: '5 أسئلة' },
      { type: 'weekly', icon: '📆', title: 'اختبار أسبوعي', desc: '20 سؤالاً من معلومات الأسبوع', min: 3, count: '20 سؤالاً' },
      { type: 'monthly', icon: '🗓️', title: 'اختبار شهري', desc: 'حتى 50 سؤالاً من جميع معلوماتك', min: 5, count: '50 سؤالاً' },
      { type: 'random', icon: '🎲', title: 'اختبار عشوائي', desc: 'أسئلة عشوائية من جميع التصنيفات', min: 0, count: '10 أسئلة' },
    ];

    const cards = quizTypes.map(q => {
      const canStart = (q.type === 'random') || readCount >= q.min;
      return `
      <div class="quiz-type-card ${!canStart ? 'disabled' : ''}" onclick="${canStart ? `Quiz.start('${q.type}')` : 'UI.showToast(\"اقرأ المزيد من المعلومات أولاً\",\"warning\")'}">
        <div class="qt-icon">${q.icon}</div>
        <h3 class="qt-title">${q.title}</h3>
        <p class="qt-desc">${q.desc}</p>
        <div class="qt-badge">${q.count}</div>
        ${!canStart ? `<div class="qt-lock">🔒 اقرأ ${q.min} معلومات أولاً</div>` : ''}
      </div>`;
    }).join('');

    return `
    <div class="view-container">
      <div class="quiz-view-header">
        <h2>الاختبارات</h2>
        <p>اختبر معلوماتك واكسب نقاط XP</p>
      </div>
      ${dueCount > 0 ? `
      <div class="review-banner" onclick="Quiz.start('review')">
        <span class="review-banner-icon">🔔</span>
        <div>
          <strong>${dueCount} معلومة تنتظر مراجعتها</strong>
          <p>راجعها الآن لتعزيز حفظك</p>
        </div>
        <button class="btn-primary">راجع الآن</button>
      </div>` : ''}
      <div class="quiz-types-grid">${cards}</div>
      <div class="xp-guide">
        <h4>كيف تكسب XP؟</h4>
        <div class="xp-rules">
          <div class="xp-rule"><span class="xp-amount">+10 XP</span><span>إجابة صحيحة</span></div>
          <div class="xp-rule"><span class="xp-amount">+2 XP</span><span>إجابة خاطئة (تشجيع)</span></div>
          <div class="xp-rule"><span class="xp-amount">+5 XP</span><span>قراءة معلومة جديدة</span></div>
          <div class="xp-rule"><span class="xp-amount">+25 XP</span><span>إنهاء جلسة مراجعة</span></div>
        </div>
      </div>
    </div>`;
  },

  // ── Review ────────────────────────────────────────────────────────────────
  review() {
    const due = SRS.getDueItems();
    const upcoming = SAMPLE_DATA.filter(i => {
      const s = SRS.getItemState(i.id);
      if (!s.nextReviewDate || SRS.isDue(i.id)) return false;
      const diff = Math.ceil((new Date(s.nextReviewDate + 'T00:00:00') - new Date()) / 86400000);
      return diff <= 7;
    }).sort((a, b) => {
      const da = SRS.getItemState(a.id).nextReviewDate;
      const db = SRS.getItemState(b.id).nextReviewDate;
      return da.localeCompare(db);
    });

    const dueList = due.length ? due.map(item => {
      const s = SRS.getItemState(item.id);
      const retention = SRS.getRetentionEstimate(item.id);
      return `
      <div class="review-item">
        <span class="ri-icon">${item.icon}</span>
        <div class="ri-info">
          <strong>${item.title}</strong>
          <span class="ri-cat">${item.category}</span>
        </div>
        <div class="ri-stats">
          <span class="ri-ret">${retention}% حفظ</span>
          <span class="ri-reps">× ${s.repetitions} مراجعات</span>
        </div>
      </div>`;
    }).join('') : '<p class="empty-msg">لا توجد معلومات مستحقة للمراجعة الآن. أحسنت!</p>';

    const upcomingList = upcoming.slice(0, 5).map(item => {
      const s = SRS.getItemState(item.id);
      const diff = Math.ceil((new Date(s.nextReviewDate + 'T00:00:00') - new Date()) / 86400000);
      return `
      <div class="review-item upcoming">
        <span class="ri-icon">${item.icon}</span>
        <div class="ri-info">
          <strong>${item.title}</strong>
        </div>
        <span class="ri-days">بعد ${diff} ${diff === 1 ? 'يوم' : 'أيام'}</span>
      </div>`;
    }).join('');

    const schedule = [
      { days: 1, label: 'بعد يوم' },
      { days: 3, label: 'بعد 3 أيام' },
      { days: 7, label: 'بعد أسبوع' },
      { days: 14, label: 'بعد أسبوعين' },
      { days: 30, label: 'بعد شهر' }
    ];

    return `
    <div class="view-container">
      <div class="review-header">
        <h2>جلسة المراجعة</h2>
        <p>المراجعة المتكررة هي سر الحفظ طويل الأمد</p>
      </div>

      ${due.length > 0 ? `
      <div class="review-start-card">
        <div class="rsc-info">
          <span class="rsc-count">${due.length}</span>
          <span class="rsc-label">معلومة تنتظر المراجعة</span>
        </div>
        <button class="btn-primary btn-large" onclick="Quiz.start('review')">ابدأ المراجعة الآن</button>
      </div>` : `
      <div class="review-done-card">
        <div class="rdc-icon">✅</div>
        <h3>أحسنت! لا توجد مراجعات اليوم</h3>
        <p>عد غداً أو اقرأ معلومات جديدة</p>
      </div>`}

      <div class="review-sections">
        <div class="review-section">
          <h3 class="section-title">مستحقة الآن (${due.length})</h3>
          <div class="review-list">${dueList}</div>
        </div>
        ${upcoming.length ? `
        <div class="review-section">
          <h3 class="section-title">قادمة قريباً</h3>
          <div class="review-list">${upcomingList}</div>
        </div>` : ''}
      </div>

      <div class="srs-info-card">
        <h4>🧠 جدول المراجعة الذكي</h4>
        <p>نظام التكرار المتباعد يُراجع كل معلومة في الوقت المثالي:</p>
        <div class="srs-schedule">
          ${schedule.map(s => `<div class="srs-step"><span class="srs-dot"></span><span>${s.label}</span></div>`).join('<div class="srs-arrow">→</div>')}
        </div>
      </div>
    </div>`;
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  stats() {
    const state = Storage.get();
    const { totalCorrect, totalIncorrect, xp } = state.user;
    const totalQ = (totalCorrect || 0) + (totalIncorrect || 0);
    const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

    const allItems = SAMPLE_DATA;
    const masteredItems = allItems.filter(i => SRS.getMasteryLevel(i.id) === 'mastered');
    const learningItems = allItems.filter(i => SRS.getMasteryLevel(i.id) === 'learning');
    const reviewingItems = allItems.filter(i => SRS.getMasteryLevel(i.id) === 'reviewing');
    const newItems = allItems.filter(i => SRS.getMasteryLevel(i.id) === 'new');

    // Category performance
    const catStats = CATEGORIES.map(cat => {
      const catItems = allItems.filter(i => i.category === cat);
      const catRead = catItems.filter(i => SRS.isRead(i.id));
      const catCorrect = catItems.reduce((acc, i) => acc + (SRS.getItemState(i.id).correctCount || 0), 0);
      const catTotal = catItems.reduce((acc, i) => {
        const s = SRS.getItemState(i.id);
        return acc + (s.correctCount || 0) + (s.incorrectCount || 0);
      }, 0);
      const catAcc = catTotal > 0 ? Math.round(catCorrect / catTotal * 100) : 0;
      return { cat, total: catItems.length, read: catRead.length, accuracy: catAcc };
    });

    const catBarsHTML = catStats.map(c => `
      <div class="cat-stat">
        <div class="cat-stat-label">
          <span>${c.cat}</span>
          <span>${c.read}/${c.total} مقروءة</span>
        </div>
        <div class="cat-stat-bar">
          <div class="cat-bar-fill" style="width:${c.total ? Math.round(c.read/c.total*100) : 0}%"></div>
        </div>
        ${c.accuracy > 0 ? `<span class="cat-acc">${c.accuracy}% دقة</span>` : ''}
      </div>`).join('');

    // Overall retention
    const readItems = SRS.getReadItems();
    const avgRetention = readItems.length > 0
      ? Math.round(readItems.reduce((a, i) => a + SRS.getRetentionEstimate(i.id), 0) / readItems.length)
      : 0;

    const quizHistory = (state.quizHistory || []).slice(0, 5);
    const historyRows = quizHistory.length ? quizHistory.map(h => {
      const d = new Date(h.date).toLocaleDateString('ar-SA');
      const pct = Math.round(h.correct / h.total * 100);
      return `<tr>
        <td>${d}</td>
        <td>${this._quizTypeName(h.type)}</td>
        <td>${h.correct}/${h.total}</td>
        <td><span class="pct-badge ${pct >= 70 ? 'pct-good' : 'pct-low'}">${pct}%</span></td>
      </tr>`;
    }).join('') : '<tr><td colspan="4" class="empty-cell">لا يوجد تاريخ اختبارات بعد</td></tr>';

    return `
    <div class="view-container">
      <div class="stats-header"><h2>الإحصائيات والتقدم</h2></div>

      <div class="stats-overview">
        <div class="overview-card">
          <div class="ov-num">${avgRetention}%</div>
          <div class="ov-lbl">متوسط الاستيعاب</div>
        </div>
        <div class="overview-card">
          <div class="ov-num">${accuracy}%</div>
          <div class="ov-lbl">دقة الإجابات</div>
        </div>
        <div class="overview-card">
          <div class="ov-num">${xp.toLocaleString('ar')}</div>
          <div class="ov-lbl">إجمالي XP</div>
        </div>
        <div class="overview-card">
          <div class="ov-num">${totalQ}</div>
          <div class="ov-lbl">أسئلة أُجيبت</div>
        </div>
      </div>

      <div class="mastery-section">
        <h3 class="section-title">حالة المعلومات</h3>
        <div class="mastery-grid">
          <div class="mastery-card mc-mastered">
            <div class="mc-num">${masteredItems.length}</div>
            <div class="mc-lbl">متقنة</div>
          </div>
          <div class="mastery-card mc-learning">
            <div class="mc-num">${learningItems.length}</div>
            <div class="mc-lbl">تتعلم</div>
          </div>
          <div class="mastery-card mc-reviewing">
            <div class="mc-num">${reviewingItems.length}</div>
            <div class="mc-lbl">قيد المراجعة</div>
          </div>
          <div class="mastery-card mc-new">
            <div class="mc-num">${newItems.length}</div>
            <div class="mc-lbl">جديدة</div>
          </div>
        </div>
      </div>

      <div class="category-section">
        <h3 class="section-title">أداء التصنيفات</h3>
        <div class="cat-stats-list">${catBarsHTML}</div>
      </div>

      <div class="history-section">
        <h3 class="section-title">سجل الاختبارات</h3>
        <div class="table-wrap">
          <table class="history-table">
            <thead><tr><th>التاريخ</th><th>النوع</th><th>النتيجة</th><th>النسبة</th></tr></thead>
            <tbody>${historyRows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  _quizTypeName(type) {
    const names = { daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري', random: 'عشوائي', review: 'مراجعة', auto: 'تلقائي' };
    return names[type] || type;
  }
};

// ─── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
