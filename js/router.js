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
    // Deactivate all nav items (sidebar + mobile)
    document.querySelectorAll('.sidebar__nav-item, .mobile-nav__item').forEach(n => n.classList.remove('is-active'));

    // Show target page
    const pageEl = document.getElementById('page-' + pageId);
    if (pageEl) pageEl.classList.add('is-active');

    // Activate matching nav items
    document.querySelectorAll(`.sidebar__nav-item[data-page="${pageId}"], .mobile-nav__item[data-page="${pageId}"]`).forEach(n => n.classList.add('is-active'));

    AppState.currentPage = pageId;

    // Scroll to top on mobile
    const main = document.querySelector('.main');
    if (main) main.scrollTop = 0;

    // Run page-specific init
    if (PAGE_INIT[pageId]) PAGE_INIT[pageId]();
  }

  function init() {
    // Sidebar nav
    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
      item.addEventListener('click', () => navigate(item.dataset.page));
    });
    // Mobile bottom nav
    document.querySelectorAll('.mobile-nav__item').forEach(item => {
      item.addEventListener('click', () => navigate(item.dataset.page));
    });
  }

  return { init, navigate, register };
})();
