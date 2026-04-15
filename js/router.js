/* ============================================================
   router.js — Page navigation
   Shows/hides .page divs and updates sidebar nav state.
   ============================================================ */

'use strict';

const Router = (() => {

  // Map page id → optional init function (called on every navigate)
  const PAGE_INIT = {};

  function register(pageId, initFn) {
    PAGE_INIT[pageId] = initFn;
  }

  function navigate(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('is-active'));
    // Deactivate all nav items
    document.querySelectorAll('.sidebar__nav-item').forEach(n => n.classList.remove('is-active'));

    // Show target page
    const pageEl = document.getElementById('page-' + pageId);
    if (pageEl) pageEl.classList.add('is-active');

    // Activate nav item
    const navEl = document.querySelector(`.sidebar__nav-item[data-page="${pageId}"]`);
    if (navEl) navEl.classList.add('is-active');

    AppState.currentPage = pageId;

    // Run page-specific init
    if (PAGE_INIT[pageId]) PAGE_INIT[pageId]();
  }

  function init() {
    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
      item.addEventListener('click', () => navigate(item.dataset.page));
    });
  }

  return { init, navigate, register };
})();
