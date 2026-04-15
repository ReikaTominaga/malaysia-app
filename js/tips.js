/* ============================================================
   tips.js — Tips page renderer
   ============================================================ */

'use strict';

const Tips = (() => {
  function render() {
    const grid = document.getElementById('tipsGrid');
    if (!grid) return;
    grid.innerHTML = TIPS.map(t => `
      <div class="tip-card">
        <div class="tip-card__icon">${t.icon}</div>
        <div class="tip-card__category">${t.cat}</div>
        <div class="tip-card__title">${t.title}</div>
        <div class="tip-card__body">${t.body}</div>
      </div>`).join('');
  }
  return { render };
})();
