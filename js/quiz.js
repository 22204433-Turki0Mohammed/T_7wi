const Quiz = {
  session: null, // { questions, currentIndex, score, results, type, timerInterval }

  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  _buildQuestions(items) {
    const questions = [];
    for (const item of items) {
      const types = ['mcq', 'truefalse', 'fillblank'];
      const type = types[Math.floor(Math.random() * types.length)];
      questions.push({ itemId: item.id, itemTitle: item.title, type, ...item.questions[type] });
    }
    return this._shuffle(questions);
  },

  _getItemsForType(type) {
    const readItems = SRS.getReadItems();
    if (type === 'review') return SRS.getDueItems();
    if (type === 'daily') return this._shuffle(readItems).slice(0, 5);
    if (type === 'weekly') return this._shuffle(readItems).slice(0, 20);
    if (type === 'monthly') return readItems;
    if (type === 'random') return this._shuffle(SAMPLE_DATA).slice(0, 10);
    if (type === 'auto') {
      const state = Storage.get();
      const ids = (state.sessionReadIds || []).slice(-6);
      return SAMPLE_DATA.filter(i => ids.includes(i.id));
    }
    return readItems;
  },

  start(type) {
    const items = this._getItemsForType(type);
    if (!items.length) {
      UI.showToast('لا توجد معلومات كافية. اقرأ بعض المعلومات أولاً!', 'warning');
      return false;
    }
    const maxQ = type === 'monthly' ? 50 : type === 'weekly' ? 20 : type === 'daily' ? 5 : 10;
    const questions = this._buildQuestions(items).slice(0, maxQ);
    this.session = { type, questions, currentIndex: 0, score: 0, results: [], answered: false };
    this._openModal();
    this._renderQuestion();
    Gamification.updateStreak();
    return true;
  },

  _openModal() {
    document.getElementById('quiz-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('quiz-modal').style.display = 'none';
    document.body.style.overflow = '';
    if (this.session?.timerInterval) clearInterval(this.session.timerInterval);
    this.session = null;
    App.render(); // refresh view
  },

  _renderQuestion() {
    const { questions, currentIndex } = this.session;
    const q = questions[currentIndex];
    const total = questions.length;
    const pct = Math.round((currentIndex / total) * 100);

    let answerHTML = '';
    if (q.type === 'mcq') {
      answerHTML = q.options.map((opt, i) =>
        `<button class="answer-btn" data-index="${i}" onclick="Quiz.submitMCQ(${i})">${opt}</button>`
      ).join('');
    } else if (q.type === 'truefalse') {
      answerHTML = `
        <button class="answer-btn tf-btn" onclick="Quiz.submitTF(true)">✓ صحيح</button>
        <button class="answer-btn tf-btn" onclick="Quiz.submitTF(false)">✗ خطأ</button>`;
    } else {
      answerHTML = `
        <div class="fill-container">
          <input type="text" id="fill-input" class="fill-input" placeholder="اكتب إجابتك هنا..." autocomplete="off" dir="auto"/>
          <button class="btn-primary" onclick="Quiz.submitFill()">تأكيد</button>
        </div>`;
    }

    const typeLabels = { mcq: 'اختيار من متعدد', truefalse: 'صح أو خطأ', fillblank: 'إكمال فراغ' };

    document.getElementById('quiz-content').innerHTML = `
      <div class="quiz-header">
        <button class="quiz-close" onclick="Quiz.closeModal()">✕</button>
        <div class="quiz-meta">
          <span class="quiz-type-badge">${typeLabels[q.type]}</span>
          <span class="quiz-counter">${currentIndex + 1} / ${total}</span>
        </div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
        <div class="quiz-score-row">
          <span>النتيجة: <strong>${this.session.score}</strong></span>
          <span class="item-tag">${q.itemTitle}</span>
        </div>
      </div>
      <div class="quiz-body">
        <p class="question-text">${q.question}</p>
        <div class="answers-grid ${q.type}">${answerHTML}</div>
      </div>`;

    if (q.type === 'fillblank') {
      setTimeout(() => {
        const inp = document.getElementById('fill-input');
        if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') Quiz.submitFill(); });
      }, 50);
    }
    this.session.answered = false;
  },

  submitMCQ(selectedIndex) {
    if (this.session.answered) return;
    this.session.answered = true;
    const q = this.session.questions[this.session.currentIndex];
    const correct = selectedIndex === q.correct;
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.classList.add('correct');
      else if (i === selectedIndex && !correct) b.classList.add('wrong');
    });
    this._showFeedback(correct, q.explanation, q.itemId);
  },

  submitTF(answer) {
    if (this.session.answered) return;
    this.session.answered = true;
    const q = this.session.questions[this.session.currentIndex];
    const correct = answer === q.correct;
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach(b => {
      b.disabled = true;
      const isTrue = b.textContent.includes('صحيح');
      if ((isTrue && q.correct) || (!isTrue && !q.correct)) b.classList.add('correct');
      else if ((isTrue && !q.correct && answer) || (!isTrue && q.correct && !answer)) b.classList.add('wrong');
    });
    this._showFeedback(correct, q.explanation, q.itemId);
  },

  submitFill() {
    if (this.session.answered) return;
    const inp = document.getElementById('fill-input');
    if (!inp) return;
    const val = inp.value.trim();
    if (!val) { UI.showToast('الرجاء كتابة إجابة', 'warning'); return; }
    this.session.answered = true;
    const q = this.session.questions[this.session.currentIndex];
    const normalize = s => s.toLowerCase().replace(/[_\sـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/[ةه]/g, 'ه');
    const correct = normalize(val) === normalize(q.answer) || (q.alternatives || []).some(a => normalize(val) === normalize(a));
    inp.disabled = true;
    inp.classList.add(correct ? 'input-correct' : 'input-wrong');
    const nextBtn = document.querySelector('.fill-container .btn-primary');
    if (nextBtn) nextBtn.disabled = true;
    if (!correct) {
      const hint = document.createElement('div');
      hint.className = 'correct-answer-hint';
      hint.textContent = 'الإجابة الصحيحة: ' + q.answer;
      inp.parentNode.insertBefore(hint, inp.nextSibling);
    }
    this._showFeedback(correct, q.explanation, q.itemId);
  },

  _showFeedback(correct, explanation, itemId) {
    const xpAmount = correct ? 10 : 2;
    Gamification.addXP(xpAmount, correct ? 'إجابة صحيحة' : 'محاولة');
    if (correct) { this.session.score += 10; Gamification.recordCorrect(); }
    else Gamification.recordIncorrect();
    SRS.update(itemId, correct ? 4 : 1);
    this.session.results.push({ itemId, correct });

    const feedback = document.createElement('div');
    feedback.className = 'feedback-box ' + (correct ? 'feedback-correct' : 'feedback-wrong');
    feedback.innerHTML = `
      <div class="feedback-icon">${correct ? '✓' : '✗'}</div>
      <div class="feedback-text">
        <strong>${correct ? 'أحسنت! إجابة صحيحة' : 'إجابة خاطئة'}</strong>
        <p>${explanation}</p>
      </div>
      <button class="btn-next" onclick="Quiz.next()">
        ${this.session.currentIndex + 1 < this.session.questions.length ? 'السؤال التالي ←' : 'عرض النتيجة'}
      </button>`;
    document.querySelector('.quiz-body').appendChild(feedback);
    setTimeout(() => feedback.classList.add('show'), 10);
  },

  next() {
    this.session.currentIndex++;
    if (this.session.currentIndex >= this.session.questions.length) {
      this._showResults();
    } else {
      this._renderQuestion();
    }
  },

  _showResults() {
    const { score, results, questions } = this.session;
    const correct = results.filter(r => r.correct).length;
    const total = results.length;
    const pct = Math.round((correct / total) * 100);

    let grade, gradeClass;
    if (pct >= 90) { grade = 'ممتاز! 🏆'; gradeClass = 'grade-excellent'; }
    else if (pct >= 70) { grade = 'جيد جداً 🌟'; gradeClass = 'grade-good'; }
    else if (pct >= 50) { grade = 'جيد 👍'; gradeClass = 'grade-ok'; }
    else { grade = 'تحتاج مراجعة 📚'; gradeClass = 'grade-poor'; }

    // Bonus XP for completing quiz
    const bonusXP = Math.round(correct * 2) + 5;
    Gamification.addXP(bonusXP, 'إنهاء الاختبار');

    // Record quiz in history
    const state = Storage.get();
    state.quizHistory = state.quizHistory || [];
    state.quizHistory.unshift({ date: new Date().toISOString(), correct, total, type: this.session.type });
    if (state.quizHistory.length > 50) state.quizHistory.pop();
    Storage.set(state);

    const weakItems = results.filter(r => !r.correct).map(r => {
      const item = SAMPLE_DATA.find(i => i.id === r.itemId);
      return item ? item.title : '';
    }).filter(Boolean);

    document.getElementById('quiz-content').innerHTML = `
      <div class="results-screen">
        <button class="quiz-close" onclick="Quiz.closeModal()">✕</button>
        <div class="results-icon">${pct >= 70 ? '🎉' : '📚'}</div>
        <h2 class="${gradeClass}">${grade}</h2>
        <div class="results-score">
          <span class="score-big">${correct}<span class="score-sep">/</span>${total}</span>
          <span class="score-pct">${pct}%</span>
        </div>
        <div class="results-stats">
          <div class="stat-pill stat-correct">✓ ${correct} صحيحة</div>
          <div class="stat-pill stat-wrong">✗ ${total - correct} خاطئة</div>
          <div class="stat-pill stat-xp">+${score + bonusXP} XP</div>
        </div>
        ${weakItems.length ? `<div class="weak-items"><h4>تحتاج مراجعة:</h4><ul>${weakItems.map(t => `<li>${t}</li>`).join('')}</ul></div>` : ''}
        <div class="results-actions">
          <button class="btn-primary" onclick="Quiz.closeModal()">العودة للرئيسية</button>
          ${SRS.getDueItems().length > 0 ? '<button class="btn-secondary" onclick="Quiz.start(\'review\')">ابدأ المراجعة</button>' : ''}
        </div>
      </div>`;
  }
};
