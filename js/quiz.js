/* ============================================================
   quiz.js — Quiz module
   Modes:
     listening     … 英語音声 → 日本語4択
     pronunciation … 英語フレーズを発音チェック
     selfcheck     … 日本語 → 英語 自己採点
     ms-listening  … マレー語音声 → 日本語4択  ★NEW
     ms-speaking   … マレー語フレーズを音声で発話 ★NEW
   ============================================================ */

'use strict';

const Quiz = (() => {

  /* ---- Entry points ---- */

  function switchType(type) {
    AppState.quizType = type;
    document.querySelectorAll('.quiz-type-tab').forEach(t =>
      t.classList.toggle('is-active', t.dataset.quiz === type)
    );
    start();
  }

  function start() {
    AppState.quizItems    = [...PHRASES].sort(() => Math.random() - .5).slice(0, 10);
    AppState.quizIndex    = 0;
    AppState.quizScore    = 0;
    AppState.quizAnswered = false;
    render();
  }

  function render() {
    const el = document.getElementById('quizContent');
    if (!el) return;
    if (AppState.quizIndex >= AppState.quizItems.length) { _renderScore(el); return; }
    switch (AppState.quizType) {
      case 'listening':     _renderListening(el);     break;
      case 'pronunciation': _renderPronunciation(el); break;
      case 'ms-listening':  _renderMsListening(el);   break;
      case 'ms-speaking':   _renderMsSpeaking(el);    break;
      default:              _renderSelfCheck(el);     break;
    }
  }

  /* ---- Mode: Listening (英語音声 → 日本語4択) ---- */

  function _renderListening(el) {
    const q = AppState.quizItems[AppState.quizIndex];
    const wrong = PHRASES.filter(p => p.id !== q.id).sort(() => Math.random() - .5).slice(0, 3);
    const options = [q, ...wrong].sort(() => Math.random() - .5);
    const pct = _pct();
    const enEsc = q.en.replace(/'/g, "\\'");

    el.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-box__progress">${AppState.quizIndex + 1} / ${AppState.quizItems.length}　スコア: ${AppState.quizScore}</div>
        <div class="quiz-box__progress-wrap">
          <div class="quiz-box__progress-bar" style="width:${pct}%"></div>
        </div>
        <div class="quiz-box__question">英語の音声を聞いて、日本語の意味を選んでください</div>
        <div style="margin-bottom:16px;">
          <button class="btn btn--secondary" onclick="Speech.speak('${enEsc}')">▶ 音声を聞く</button>
        </div>
        <div class="quiz-options" id="quizOptions">
          ${options.map(o =>
            `<button class="quiz-option" onclick="Quiz.answerListening(${o.id},${q.id})">${o.jp}</button>`
          ).join('')}
        </div>
        <div id="quizFeedback"></div>
        <div id="quizNext"></div>
      </div>`;
  }

  function answerListening(selectedId, correctId) {
    if (AppState.quizAnswered) return;
    AppState.quizAnswered = true;

    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.disabled = true;
      const ph = PHRASES.find(p => p.jp === btn.textContent);
      if (!ph) return;
      if (ph.id === correctId)      btn.classList.add('is-correct');
      else if (ph.id === selectedId) btn.classList.add('is-wrong');
    });

    const correct = selectedId === correctId;
    if (correct) AppState.quizScore++;

    const correctPhrase = PHRASES.find(p => p.id === correctId);
    const fb = document.getElementById('quizFeedback');
    if (fb) fb.innerHTML = `
      <div class="quiz-feedback ${correct ? 'is-correct' : 'is-wrong'}">
        ${correct ? '✓ 正解！' : `✗ 不正解。正解: ${correctPhrase.jp}`}
      </div>`;

    const next = document.getElementById('quizNext');
    if (next) next.innerHTML = `<button class="btn btn--primary" style="margin-top:16px;" onclick="Quiz.next()">次の問題 →</button>`;
  }

  /* ---- Mode: Pronunciation (英語フレーズを発音) ---- */

  function _renderPronunciation(el) {
    const q = AppState.quizItems[AppState.quizIndex];
    const pct = _pct();

    el.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-box__progress">${AppState.quizIndex + 1} / ${AppState.quizItems.length}　スコア: ${AppState.quizScore}</div>
        <div class="quiz-box__progress-wrap">
          <div class="quiz-box__progress-bar" style="width:${pct}%;background:var(--teal)"></div>
        </div>
        <div class="quiz-box__question">次の英語フレーズを発音してください</div>
        <div class="quiz-box__main-text">"${q.en}"</div>
        <div style="font-size:12px;color:var(--text3);margin:-16px 0 16px;">${q.jp}</div>
        <div class="mic-area">
          <button class="mic-btn" id="micBtn" onclick="Quiz.startPronunciationCheck('${q.en.replace(/'/g, "\\'")}')">
            <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
              <rect x="5" y="1" width="10" height="16" rx="5" fill="white"/>
              <path d="M1 14c0 4.97 4.03 9 9 9s9-4.03 9-9" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <line x1="10" y1="23" x2="10" y2="27" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="mic-area__status" id="micStatus">タップして話す</div>
          <div id="recognitionResult"></div>
        </div>
        <div id="pronVerdict"></div>
        <div id="pronNext"></div>
      </div>`;
  }

  function startPronunciationCheck(targetText) {
    const micBtn    = document.getElementById('micBtn');
    const micStatus = document.getElementById('micStatus');
    if (!micBtn || !micStatus) return;

    micBtn.classList.add('is-listening');
    micStatus.textContent = '聞いています...';

    Speech.startRecognition({
      lang: 'en-US',
      onResult(transcript) {
        micBtn.classList.remove('is-listening');
        const score = Speech.similarity(transcript, targetText);
        const pass  = score >= Speech.PASS_THRESHOLD;

        const resultEl = document.getElementById('recognitionResult');
        if (resultEl) resultEl.innerHTML = `
          <div class="recognition-result">
            <div class="recognition-result__label">認識結果</div>
            <div>"${transcript}"</div>
          </div>`;

        const verdictEl = document.getElementById('pronVerdict');
        if (verdictEl) verdictEl.innerHTML = `
          <div class="result-verdict ${pass ? 'is-pass' : 'is-fail'}">
            ${pass ? '✓ 通じるレベル！' : '✗ もう一度試してみましょう'} (一致度: ${Math.round(score * 100)}%)
          </div>`;

        micStatus.textContent = pass ? '発音OK！' : '惜しい…もう一度どうぞ';

        if (!AppState.quizAnswered) {
          AppState.quizAnswered = true;
          if (pass) AppState.quizScore++;
          const nextEl = document.getElementById('pronNext');
          if (nextEl) nextEl.innerHTML = `<button class="btn btn--primary" style="margin-top:12px;" onclick="Quiz.next()">次の問題 →</button>`;
        }
      },
      onError(msg) {
        if (micBtn)    micBtn.classList.remove('is-listening');
        if (micStatus) micStatus.textContent = msg;
      },
    });
  }

  /* ---- Mode: Self-check (日本語 → 英語 自己採点) ---- */

  function _renderSelfCheck(el) {
    const q = AppState.quizItems[AppState.quizIndex];
    const pct = _pct();

    el.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-box__progress">${AppState.quizIndex + 1} / ${AppState.quizItems.length}　スコア: ${AppState.quizScore}</div>
        <div class="quiz-box__progress-wrap">
          <div class="quiz-box__progress-bar" style="width:${pct}%;background:var(--amber)"></div>
        </div>
        <div class="quiz-box__question">この日本語を英語で言えますか？</div>
        <div class="quiz-box__main-text">${q.jp}</div>
        <div id="selfRevealArea">
          <button class="btn btn--secondary" onclick="Quiz.revealSelfCheck(${q.id})">答えを確認する</button>
        </div>
      </div>`;
  }

  function revealSelfCheck(id) {
    const q = PHRASES.find(p => p.id === id);
    const enEsc = q.en.replace(/'/g, "\\'");
    const msEsc = q.ms.replace(/'/g, "\\'");
    const areaEl = document.getElementById('selfRevealArea');
    if (!areaEl) return;
    areaEl.innerHTML = `
      <div class="selfcheck-reveal">
        <div class="selfcheck-reveal__answer">${q.en}</div>
        <div style="font-size:12px;color:var(--teal);margin-bottom:4px;">${q.kana}</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:12px;">マレー語: <strong>${q.ms}</strong></div>
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <button class="play-btn" onclick="Speech.speak('${enEsc}')">▶ 英語を聞く</button>
          <button class="play-btn play-btn--ms" onclick="Speech.speakMalay('${msEsc}')">▶ マレー語を聞く</button>
        </div>
      </div>
      <div class="selfcheck-btns">
        <button class="selfcheck-btn-ok" onclick="Quiz.selfCheckResult(true)">◯ 言えた！</button>
        <button class="selfcheck-btn-ng" onclick="Quiz.selfCheckResult(false)">✗ 言えなかった</button>
      </div>`;
  }

  function selfCheckResult(ok) {
    if (ok) AppState.quizScore++;
    next();
  }

  /* ================================================================
     ★ NEW: Mode: マレー語リスニング (マレー語音声 → 日本語4択)
     ================================================================ */

  function _renderMsListening(el) {
    const q = AppState.quizItems[AppState.quizIndex];
    const wrong = PHRASES.filter(p => p.id !== q.id).sort(() => Math.random() - .5).slice(0, 3);
    const options = [q, ...wrong].sort(() => Math.random() - .5);
    const pct = _pct();
    const msEsc = q.ms.replace(/'/g, "\\'");

    el.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-box__progress">${AppState.quizIndex + 1} / ${AppState.quizItems.length}　スコア: ${AppState.quizScore}</div>
        <div class="quiz-box__progress-wrap">
          <div class="quiz-box__progress-bar" style="width:${pct}%;background:#1570EF"></div>
        </div>
        <div class="quiz-box__question">マレー語の音声を聞いて、日本語の意味を選んでください</div>
        <div class="quiz-box__hint" style="font-size:12px;color:var(--text3);margin-bottom:12px;">
          ※ マレー語音声が出ない場合は、OS/ブラウザのマレー語ボイスが未インストールの可能性があります
        </div>
        <div style="margin-bottom:20px;">
          <button class="btn btn--ms" onclick="Speech.speakMalay('${msEsc}')">
            🔊 マレー語を聞く
          </button>
        </div>
        <div class="quiz-options" id="quizOptions">
          ${options.map(o =>
            `<button class="quiz-option" onclick="Quiz.answerMsListening(${o.id},${q.id})">${o.jp}</button>`
          ).join('')}
        </div>
        <div id="quizFeedback"></div>
        <div id="quizNext"></div>
      </div>`;

    // 自動再生
    setTimeout(() => Speech.speakMalay(q.ms), 400);
  }

  function answerMsListening(selectedId, correctId) {
    if (AppState.quizAnswered) return;
    AppState.quizAnswered = true;

    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.disabled = true;
      const ph = PHRASES.find(p => p.jp === btn.textContent);
      if (!ph) return;
      if (ph.id === correctId)       btn.classList.add('is-correct');
      else if (ph.id === selectedId) btn.classList.add('is-wrong');
    });

    const correct = selectedId === correctId;
    if (correct) AppState.quizScore++;

    const correctPhrase = PHRASES.find(p => p.id === correctId);
    const fb = document.getElementById('quizFeedback');
    if (fb) fb.innerHTML = `
      <div class="quiz-feedback ${correct ? 'is-correct' : 'is-wrong'}">
        ${correct ? '✓ 正解！' : `✗ 不正解。正解: ${correctPhrase.jp}`}
        <div style="font-size:12px;margin-top:4px;">マレー語: <strong>${correctPhrase.ms}</strong></div>
      </div>`;

    const next = document.getElementById('quizNext');
    if (next) next.innerHTML = `<button class="btn btn--primary" style="margin-top:16px;" onclick="Quiz.next()">次の問題 →</button>`;
  }

  /* ================================================================
     ★ NEW: Mode: マレー語スピーキング (マレー語フレーズを発話練習)
     ================================================================ */

  function _renderMsSpeaking(el) {
    const q = AppState.quizItems[AppState.quizIndex];
    const pct = _pct();
    const msEsc = q.ms.replace(/'/g, "\\'");

    el.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-box__progress">${AppState.quizIndex + 1} / ${AppState.quizItems.length}　スコア: ${AppState.quizScore}</div>
        <div class="quiz-box__progress-wrap">
          <div class="quiz-box__progress-bar" style="width:${pct}%;background:#7C3AED"></div>
        </div>
        <div class="quiz-box__question">次のマレー語フレーズを発音してください</div>
        <div class="quiz-box__main-text">${q.ms}</div>
        <div style="font-size:12px;color:var(--text3);margin:-14px 0 4px;">読み方: ${q.kana}</div>
        <div style="font-size:12px;color:var(--text2);margin-bottom:16px;">${q.jp}</div>
        <div style="margin-bottom:12px;">
          <button class="btn btn--ms btn--sm" onclick="Speech.speakMalay('${msEsc}')">🔊 手本を聞く</button>
        </div>
        <div class="mic-area">
          <button class="mic-btn mic-btn--ms" id="micBtn" onclick="Quiz.startMsSpeakingCheck('${msEsc}')">
            <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
              <rect x="5" y="1" width="10" height="16" rx="5" fill="white"/>
              <path d="M1 14c0 4.97 4.03 9 9 9s9-4.03 9-9" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <line x1="10" y1="23" x2="10" y2="27" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="mic-area__status" id="micStatus">タップしてマレー語で話す</div>
          <div id="recognitionResult"></div>
        </div>
        <div id="pronVerdict"></div>
        <div id="pronNext"></div>
      </div>`;
  }

  function startMsSpeakingCheck(targetText) {
    const micBtn    = document.getElementById('micBtn');
    const micStatus = document.getElementById('micStatus');
    if (!micBtn || !micStatus) return;

    micBtn.classList.add('is-listening');
    micStatus.textContent = '聞いています...';

    Speech.startRecognition({
      lang: 'ms-MY',
      onResult(transcript) {
        micBtn.classList.remove('is-listening');
        const score = Speech.similarity(transcript, targetText);
        const pass  = score >= Speech.PASS_THRESHOLD;

        const resultEl = document.getElementById('recognitionResult');
        if (resultEl) resultEl.innerHTML = `
          <div class="recognition-result">
            <div class="recognition-result__label">認識結果</div>
            <div>"${transcript}"</div>
          </div>`;

        const verdictEl = document.getElementById('pronVerdict');
        if (verdictEl) verdictEl.innerHTML = `
          <div class="result-verdict ${pass ? 'is-pass' : 'is-fail'}">
            ${pass ? '✓ 通じるレベル！' : '✗ もう一度試してみましょう'} (一致度: ${Math.round(score * 100)}%)
          </div>`;

        micStatus.textContent = pass ? '発音OK！' : '惜しい…もう一度どうぞ';

        if (!AppState.quizAnswered) {
          AppState.quizAnswered = true;
          if (pass) AppState.quizScore++;
          const nextEl = document.getElementById('pronNext');
          if (nextEl) nextEl.innerHTML = `<button class="btn btn--primary" style="margin-top:12px;" onclick="Quiz.next()">次の問題 →</button>`;
        }
      },
      onError(msg) {
        if (micBtn)    micBtn.classList.remove('is-listening');
        if (micStatus) micStatus.textContent = msg;
      },
    });
  }

  /* ---- Score screen ---- */

  function _renderScore(el) {
    const total = AppState.quizItems.length;
    const pct   = Math.round(AppState.quizScore / total * 100);
    const msg   = pct >= 80 ? '素晴らしい！旅行準備OK！'
                : pct >= 60 ? 'もう少し練習しましょう！'
                :             'フレーズ集で復習しよう！';
    el.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-box__score-num">
          ${AppState.quizScore}<span style="font-size:28px;color:var(--text2);">/${total}</span>
        </div>
        <div class="quiz-box__score-label">${msg}</div>
        <div class="quiz-box__score-actions">
          <button class="btn btn--primary" onclick="Quiz.start()">もう一度</button>
          <button class="btn btn--secondary" onclick="Router.navigate('phrases')">フレーズ集で復習</button>
        </div>
      </div>`;
  }

  /* ---- Helpers ---- */

  function next() {
    AppState.quizIndex++;
    AppState.quizAnswered = false;
    render();
  }

  function _pct() {
    return (AppState.quizIndex / AppState.quizItems.length * 100).toFixed(0);
  }

  return {
    switchType,
    start,
    render,
    answerListening,
    startPronunciationCheck,
    revealSelfCheck,
    selfCheckResult,
    answerMsListening,
    startMsSpeakingCheck,
    next,
  };
})();
