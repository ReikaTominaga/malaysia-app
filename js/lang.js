/* ============================================================
   lang.js — 学習する第二言語（マレー語 / スペイン語）の切り替え
   マレー語とスペイン語を1画面に同時表示せず、
   AppState.targetLang に応じて表示・クイズ・豆知識を切り替える
   ============================================================ */

'use strict';

const Lang = (() => {

  function current() {
    return TARGET_LANGS[AppState.targetLang];
  }

  function set(langId) {
    if (!TARGET_LANGS[langId]) return;
    AppState.targetLang = langId;
    _save();
    applyUI();
    _refreshPages();
  }

  function load() {
    try {
      const saved = localStorage.getItem('malaysia_targetLang');
      if (saved && TARGET_LANGS[saved]) AppState.targetLang = saved;
    } catch (e) { /* private mode等は無視 */ }
  }

  function _save() {
    try { localStorage.setItem('malaysia_targetLang', AppState.targetLang); } catch (e) {}
  }

  /* ---- 言語に依存する静的テキスト・タブを更新 ---- */
  function applyUI() {
    const lang = current();

    document.title = lang.docTitle;

    document.querySelectorAll('.lang-switch-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang.id);
    });

    _setText('sidebarLangLabel',   lang.sidebarSubtitle);
    _setText('sidebarTipsLabel',   lang.tipsTitle);
    _setText('homeSubtitleText',   lang.homeSubtitle);
    _setText('homeCardPhraseDesc', lang.phraseCardDesc);
    _setText('homeCardQuizDesc',   lang.quizCardDesc);
    _setText('homeCardTipsTitle',  lang.tipsTitle);
    _setText('homeCardTipsDesc',   lang.tipsCardDesc);
    _setText('phrasesSubtitleText', lang.phraseSubtitle);
    _setText('quizSubtitleText',   lang.quizSubtitle);
    _setText('tipsTitleText',      lang.tipsTitle);
    _setText('tipsSubtitleText',   lang.tipsSubtitle);

    const listeningTab = document.querySelector('.quiz-type-tab[data-quiz="second-listening"]');
    const speakingTab  = document.querySelector('.quiz-type-tab[data-quiz="second-speaking"]');
    [listeningTab, speakingTab].forEach(tab => {
      if (!tab) return;
      tab.classList.remove('quiz-type-tab--ms', 'quiz-type-tab--es');
      tab.classList.add('quiz-type-tab--' + lang.cssSuffix);
    });
    if (listeningTab) listeningTab.textContent = `${lang.flag} ${lang.label}リスニング`;
    if (speakingTab)  speakingTab.textContent  = `🎤 ${lang.label}スピーキング`;

    const bannerPlay = document.getElementById('todayBannerPlaySecond');
    if (bannerPlay) {
      bannerPlay.classList.remove('today-banner__play--ms', 'today-banner__play--es');
      bannerPlay.classList.add('today-banner__play--' + lang.cssSuffix);
      bannerPlay.textContent = '▶ ' + lang.label;
    }

    const pageBtn = document.getElementById('todayPageSecondBtn');
    if (pageBtn) {
      pageBtn.classList.remove('btn--ms', 'btn--es');
      pageBtn.classList.add('btn--' + lang.cssSuffix);
      pageBtn.textContent = '▶ ' + lang.label + 'を聞く';
    }

    const bigCard = document.getElementById('todayPageSecond');
    if (bigCard) {
      bigCard.classList.remove('today-big-card__second--ms', 'today-big-card__second--es');
      bigCard.classList.add('today-big-card__second--' + lang.cssSuffix);
    }
  }

  /* ---- 言語に依存する動的コンテンツを再描画 ---- */
  function _refreshPages() {
    if (typeof Phrases !== 'undefined') {
      Phrases.renderPhrases();
      Phrases.renderBookmarks();
      Phrases.renderTodayPage();
      Phrases.updateBanner();
    }
    if (typeof Quiz !== 'undefined') Quiz.render();
    if (typeof Tips !== 'undefined') Tips.render();
  }

  function _setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  return { current, set, load, applyUI };
})();
