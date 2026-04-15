/* ============================================================
   app.js — Application bootstrap
   Wires modules together and initialises the app.
   ============================================================ */

'use strict';

function initApp() {
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

  const bannerPlayMs = document.getElementById('todayBannerPlayMs');
  if (bannerPlayMs) bannerPlayMs.addEventListener('click', (e) => {
    e.stopPropagation();
    if (AppState.todayPhrase) Speech.speakMalay(AppState.todayPhrase.ms);
  });

  // ---- Navigate to home on load ----
  Router.navigate('home');
}

document.addEventListener('DOMContentLoaded', initApp);
