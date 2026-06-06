// ─── Storage ───────────────────────────────────────────────────────────────
const Storage = {
  KEY: 'learning_system_v2',
  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || this.defaultState(); }
    catch { return this.defaultState(); }
  },
  set(data) { localStorage.setItem(this.KEY, JSON.stringify(data)); },
  defaultState() {
    return {
      user: { xp: 0, level: 1, streak: 0, lastActiveDate: null, totalCorrect: 0, totalIncorrect: 0 },
      itemStates: {},
      quizHistory: [],
      sessionReads: 0,
      sessionReadIds: []
    };
  }
};

// ─── SRS (SM-2 Algorithm) ──────────────────────────────────────────────────
const SRS = {
  defaultItemState() {
    return { easeFactor: 2.5, interval: 1, repetitions: 0, nextReviewDate: null, readAt: null, correctCount: 0, incorrectCount: 0, lastReviewedAt: null };
  },

  getItemState(itemId) {
    const state = Storage.get();
    if (!state.itemStates[itemId]) state.itemStates[itemId] = this.defaultItemState();
    return state.itemStates[itemId];
  },

  markRead(itemId) {
    const state = Storage.get();
    if (!state.itemStates[itemId]) state.itemStates[itemId] = this.defaultItemState();
    const s = state.itemStates[itemId];
    if (!s.readAt) {
      s.readAt = Date.now();
      const next = new Date(); next.setDate(next.getDate() + 1);
      s.nextReviewDate = next.toISOString().split('T')[0];
      state.sessionReads = (state.sessionReads || 0) + 1;
      if (!state.sessionReadIds) state.sessionReadIds = [];
      state.sessionReadIds.push(itemId);
      Storage.set(state);
      return true; // newly read
    }
    Storage.set(state);
    return false;
  },

  // quality: 5=perfect, 4=good, 3=hesitant, 2=wrong but remembered, 1=wrong, 0=blank
  update(itemId, quality) {
    const state = Storage.get();
    if (!state.itemStates[itemId]) state.itemStates[itemId] = this.defaultItemState();
    let s = state.itemStates[itemId];

    if (quality >= 3) {
      s.correctCount++;
      if (s.repetitions === 0) s.interval = 1;
      else if (s.repetitions === 1) s.interval = 6;
      else s.interval = Math.round(s.interval * s.easeFactor);
      s.repetitions++;
      s.easeFactor = Math.max(1.3, s.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    } else {
      s.incorrectCount++;
      s.repetitions = 0;
      s.interval = 1;
    }

    const next = new Date();
    next.setDate(next.getDate() + s.interval);
    s.nextReviewDate = next.toISOString().split('T')[0];
    s.lastReviewedAt = Date.now();
    Storage.set(state);
    return s;
  },

  isDue(itemId) {
    const s = this.getItemState(itemId);
    if (!s.nextReviewDate) return false;
    return new Date(s.nextReviewDate + 'T00:00:00') <= new Date();
  },

  isRead(itemId) { return !!this.getItemState(itemId).readAt; },

  getDueItems() { return SAMPLE_DATA.filter(i => this.isDue(i.id)); },

  getReadItems() { return SAMPLE_DATA.filter(i => this.isRead(i.id)); },

  getMasteryLevel(itemId) {
    const s = this.getItemState(itemId);
    if (!s.readAt) return 'new';
    if (s.repetitions >= 5) return 'mastered';
    if (s.repetitions >= 2) return 'learning';
    return 'reviewing';
  },

  getRetentionEstimate(itemId) {
    const s = this.getItemState(itemId);
    if (!s.readAt) return 0;
    const total = s.correctCount + s.incorrectCount;
    if (total === 0) return 50;
    return Math.round((s.correctCount / total) * 100);
  }
};

// ─── Gamification ──────────────────────────────────────────────────────────
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5700, 7500];

const Gamification = {
  getLevelFromXP(xp) {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
    }
    return 1;
  },

  getThresholdForLevel(level) {
    if (level <= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level - 1] || 0;
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (level - LEVEL_THRESHOLDS.length) * 2000;
  },

  getNextThreshold(level) {
    if (level < LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level];
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (level - LEVEL_THRESHOLDS.length + 1) * 2000;
  },

  getProgressToNext(xp) {
    const level = this.getLevelFromXP(xp);
    const cur = this.getThresholdForLevel(level);
    const next = this.getNextThreshold(level);
    return Math.min(1, (xp - cur) / (next - cur));
  },

  addXP(amount, reason) {
    const state = Storage.get();
    const oldLevel = state.user.level;
    state.user.xp += amount;
    state.user.level = this.getLevelFromXP(state.user.xp);
    Storage.set(state);
    UI.showXPGain(amount);
    if (state.user.level > oldLevel) UI.showLevelUp(state.user.level);
    UI.updateNavBar();
    return state.user;
  },

  updateStreak() {
    const state = Storage.get();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (state.user.lastActiveDate === today) return;
    if (state.user.lastActiveDate === yesterday) state.user.streak++;
    else state.user.streak = 1;
    state.user.lastActiveDate = today;
    Storage.set(state);
    UI.updateNavBar();
  },

  recordCorrect() {
    const state = Storage.get();
    state.user.totalCorrect = (state.user.totalCorrect || 0) + 1;
    Storage.set(state);
  },

  recordIncorrect() {
    const state = Storage.get();
    state.user.totalIncorrect = (state.user.totalIncorrect || 0) + 1;
    Storage.set(state);
  }
};

// ─── UI Helpers ────────────────────────────────────────────────────────────
const UI = {
  updateNavBar() {
    const state = Storage.get();
    const { xp, level, streak } = state.user;
    const el = id => document.getElementById(id);
    if (el('nav-xp')) el('nav-xp').textContent = xp.toLocaleString('ar') + ' XP';
    if (el('nav-level')) el('nav-level').textContent = 'المستوى ' + level;
    if (el('nav-streak')) el('nav-streak').textContent = streak;
    if (el('nav-progress')) {
      const pct = Math.round(Gamification.getProgressToNext(xp) * 100);
      el('nav-progress').style.width = pct + '%';
    }
  },

  showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast toast-' + type + ' show';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3000);
  },

  showXPGain(amount) {
    const p = document.getElementById('xp-popup');
    if (!p) return;
    p.textContent = '+' + amount + ' XP';
    p.classList.add('show');
    setTimeout(() => p.classList.remove('show'), 1500);
  },

  showLevelUp(level) {
    const overlay = document.createElement('div');
    overlay.className = 'levelup-overlay';
    overlay.innerHTML = `
      <div class="levelup-card">
        <div class="levelup-icon">🎉</div>
        <div class="levelup-title">ارتقيت مستوى!</div>
        <div class="levelup-level">المستوى ${level}</div>
        <button class="btn-primary" onclick="this.closest('.levelup-overlay').remove()">رائع!</button>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 5000);
  }
};
