/* ============================================================
   tips.js — Tips page renderer
   表示する豆知識は Lang.current().tips（マレーシア or スペイン）
   ============================================================ */

'use strict';

const Tips = (() => {
  function render() {
    const grid = document.getElementById('tipsGrid');
    if (!grid) return;
    const tips = Lang.current().tips;
    grid.innerHTML = tips.map(t => `
      <div class="tip-card">
        <div class="tip-card__icon">${t.icon}</div>
        <div class="tip-card__category">${t.cat}</div>
        <div class="tip-card__title">${t.title}</div>
        <div class="tip-card__body">${t.body}</div>
      </div>`).join('');
  }
  return { render };
})();
