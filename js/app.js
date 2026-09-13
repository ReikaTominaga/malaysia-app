/* ============================================================
   app.js — Application bootstrap
   Wires modules together and initialises the app.
   ============================================================ */

'use strict';

function initApp() {
  // ---- 言語設定をlocalStorageから復元し、静的UIテキストに反映 ----
  Lang.load();
  Lang.applyUI();

  // ---- Register page initialisers with Router ----
  Router.register('phrases',   () => Phrases.renderPhrases());
  Router.register('quiz',      () => Quiz.render());
  Router.register('roleplay',  () => Roleplay.renderSceneSelect());
  Router.register('bookmarks', () => Phrases.renderBookmarks());
  Router.register('today',     () => Phrases.renderTodayPage());
  Router.register('tips',      () => Tips.render());

  // ---- Boot router (attaches nav click listeners) ----
  Router.init();

  // ---- API料金をlocalStorageから復元（月ごと管理） ----
  Cost.init();

  // ---- ブックマークをlocalStorageから復元 ----
  Phrases.loadBookmarks();

  // ---- Pick today's phrase (random, session-scoped) ----
  Phrases.pickTodayPhrase();

  // ---- Render tips (static, render once) ----
  Tips.render();

  // ---- Cost meter reset button ----
  const resetBtn = document.getElementById('costReset');
  if (resetBtn) resetBtn.addEventListener('click', Cost.reset);

  // ---- Today banner play button & click-to-navigate ----
  const banner = document.getElementById('todayBanner');
  if (banner) banner.addEventListener('click', () => Router.navigate('today'));

  const bannerPlay = document.getElementById('todayBannerPlay');
  if (bannerPlay) bannerPlay.addEventListener('click', (e) => {
    e.stopPropagation();
    if (AppState.todayPhrase) Speech.speak(AppState.todayPhrase.en);
  });

  const bannerPlaySecond = document.getElementById('todayBannerPlaySecond');
  if (bannerPlaySecond) bannerPlaySecond.addEventListener('click', (e) => {
    e.stopPropagation();
    const lang = Lang.current();
    if (AppState.todayPhrase) Speech[lang.speakMethod](AppState.todayPhrase[lang.field]);
  });

  // ---- モバイルAPIキー入力欄をPC側と同期 ----
  const apiKeyPC     = document.getElementById('apiKeyInput');
  const apiKeyMobile = document.getElementById('apiKeyInputMobile');
  if (apiKeyPC && apiKeyMobile) {
    // モバイル → PC
    apiKeyMobile.addEventListener('input', () => { apiKeyPC.value = apiKeyMobile.value; });
    // PC → モバイル
    apiKeyPC.addEventListener('input', () => { apiKeyMobile.value = apiKeyPC.value; });
  }

  // ---- Navigate to home on load ----
  Router.navigate('home');
}

document.addEventListener('DOMContentLoaded', initApp);
