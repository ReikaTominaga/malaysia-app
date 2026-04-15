/* ============================================================
   phrases.js — Phrase list, bookmarks, today's phrase
   ============================================================ */

'use strict';

const Phrases = (() => {

  /* ---- Phrase card HTML ---- */

  function phraseCardHTML(phrase) {
    const bm    = AppState.bookmarks.has(phrase.id);
    const enEsc = phrase.en.replace(/'/g, "\\'");
    const msEsc = phrase.ms.replace(/'/g, "\\'");
    return `
      <div class="phrase-card" id="pcard-${phrase.id}">
        <div class="phrase-card__jp">${phrase.jp}</div>
        <div class="phrase-card__en">${phrase.en}</div>
        <div class="phrase-card__ms">${phrase.ms}</div>
        <div class="phrase-card__kana"><span class="phrase-card__kana-label">読み方 </span>${phrase.kana}</div>
        <div class="phrase-card__actions">
          <button class="play-btn" onclick="Speech.speak('${enEsc}')" title="英語を聞く">▶ 英語</button>
          <button class="play-btn play-btn--ms" onclick="Speech.speakMalay('${msEsc}')" title="マレー語を聞く">▶ マレー語</button>
          <button class="bookmark-btn ${bm ? 'is-bookmarked' : ''}"
                  onclick="Phrases.toggleBookmark(${phrase.id})"
                  title="ブックマーク">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="${bm ? 'currentColor' : 'none'}">
              <path d="M1 1h10v12l-5-3-5 3V1z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>`;
  }

  /* ---- Scene tabs ---- */

  function renderSceneTabs() {
    const el = document.getElementById('sceneTabs');
    if (!el) return;
    el.innerHTML = SCENES.map(s =>
      `<div class="scene-tab ${s.id === AppState.currentScene ? 'is-active' : ''}"
            onclick="Phrases.selectScene('${s.id}')">${s.label}</div>`
    ).join('');
  }

  function selectScene(id) {
    AppState.currentScene = id;
    renderSceneTabs();
    renderPhrases();
  }

  /* ---- Phrase grid ---- */

  function renderPhrases() {
    renderSceneTabs();
    const grid = document.getElementById('phraseGrid');
    if (!grid) return;
    const list = PHRASES.filter(p => p.scene === AppState.currentScene);
    grid.innerHTML = list.map(phraseCardHTML).join('');
  }

  /* ---- Bookmarks ---- */

  function toggleBookmark(id) {
    const numId = Number(id); // 型を統一

    if (AppState.bookmarks.has(numId)) {
      AppState.bookmarks.delete(numId);
    } else {
      AppState.bookmarks.add(numId);
    }

    const isNowBookmarked = AppState.bookmarks.has(numId);

    // outerHTML置き換えではなく、ボタン要素を直接更新（安全・確実）
    const card = document.getElementById('pcard-' + numId);
    if (card) {
      const btn = card.querySelector('.bookmark-btn');
      if (btn) {
        btn.classList.toggle('is-bookmarked', isNowBookmarked);
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', isNowBookmarked ? 'currentColor' : 'none');
      }
    }

    // localStorage に保存（ページ更新後も保持）
    _saveBookmarks();

    // ブックマークページが開いているなら即時再描画
    if (AppState.currentPage === 'bookmarks') renderBookmarks();
  }

  function _saveBookmarks() {
    try {
      localStorage.setItem('malaysia_bookmarks', JSON.stringify([...AppState.bookmarks]));
    } catch (e) { /* プライベートモード等で失敗しても無視 */ }
  }

  function loadBookmarks() {
    try {
      const saved = localStorage.getItem('malaysia_bookmarks');
      if (saved) {
        JSON.parse(saved).forEach(id => AppState.bookmarks.add(Number(id)));
      }
    } catch (e) {}
  }

  function renderBookmarks() {
    const grid    = document.getElementById('bookmarkGrid');
    const emptyEl = document.getElementById('bookmarkEmpty');
    if (!grid || !emptyEl) return;
    const list = PHRASES.filter(p => AppState.bookmarks.has(p.id));
    if (list.length === 0) {
      grid.innerHTML    = '';
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
      grid.innerHTML = list.map(phraseCardHTML).join('');
    }
  }

  /* ---- Today's phrase ---- */

  function pickTodayPhrase() {
    const idx = Math.floor(Math.random() * PHRASES.length);
    AppState.todayPhrase = PHRASES[idx];
    _updateBanner();
  }

  function reroll() {
    pickTodayPhrase();
    renderTodayPage();
  }

  function _updateBanner() {
    const p = AppState.todayPhrase;
    if (!p) return;
    _setText('todayBannerEn',   p.en);
    _setText('todayBannerJp',   p.jp);
    _setText('todayBannerKana', p.kana);
    _setText('todayBannerMs',   p.ms);
  }

  function renderTodayPage() {
    const p = AppState.todayPhrase;
    if (!p) return;
    _setText('todayPageEn',   p.en);
    _setText('todayPageJp',   p.jp);
    _setText('todayPageKana', p.kana);
    _setText('todayPageMs',   p.ms);

    const related = PHRASES
      .filter(ph => ph.scene === p.scene && ph.id !== p.id)
      .slice(0, 4);
    const grid = document.getElementById('todayRelatedGrid');
    if (grid) grid.innerHTML = related.map(phraseCardHTML).join('');
  }

  function _setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  return {
    phraseCardHTML,
    renderSceneTabs,
    selectScene,
    renderPhrases,
    toggleBookmark,
    renderBookmarks,
    loadBookmarks,
    pickTodayPhrase,
    reroll,
    renderTodayPage,
  };
})();
