/* ============================================================
   router.js — Page navigation
   Shows/hides .page divs and updates sidebar + mobile nav state.
   ============================================================ */

'use strict';

const Router = (() => {

  const PAGE_INIT = {};

  function register(pageId, initFn) {
    PAGE_INIT[pageId] = initFn;
  }

  function navigate(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(function (p) {
      p.classList.remove('is-active');
    });

    // Deactivate all nav items (sidebar + mobile)
    document.querySelectorAll('.sidebar__nav-item, .mobile-nav__item').forEach(function (n) {
      n.classList.remove('is-active');
    });

    // Show target page
    var pageEl = document.getElementById('page-' + pageId);
    if (pageEl) pageEl.classList.add('is-active');

    // Activate matching nav items
    document.querySelectorAll('.sidebar__nav-item[data-page="' + pageId + '"], .mobile-nav__item[data-page="' + pageId + '"]').forEach(function (n) {
      n.classList.add('is-active');
    });

    AppState.currentPage = pageId;

    // Scroll to top
    var main = document.querySelector('.main');
    if (main) main.scrollTop = 0;

    // Run page-specific init
    if (PAGE_INIT[pageId]) PAGE_INIT[pageId]();
  }

  function init() {
    document.querySelectorAll('.sidebar__nav-item').forEach(function (item) {
      item.addEventListener('click', function () { navigate(item.dataset.page); });
    });
    document.querySelectorAll('.mobile-nav__item').forEach(function (item) {
      item.addEventListener('click', function () { navigate(item.dataset.page); });
    });
  }

  return { init: init, navigate: navigate, register: register };
})();
