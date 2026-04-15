/* ============================================================
   cost.js — API cost tracking & sidebar meter
   Model: claude-sonnet-4-20250514
   Pricing (as of 2025): $3/M input tokens, $15/M output tokens
   localStorage で月ごとに永続化。月が変わると自動リセット。
   ============================================================ */

'use strict';

const Cost = (() => {
  // Pricing per million tokens (USD)
  const PRICE_INPUT_PER_M  = 3.00;
  const PRICE_OUTPUT_PER_M = 15.00;

  // Tier thresholds in USD — for colour coding
  const TIERS = [0.005, 0.02, 0.05, 0.15];

  // JPY rate (approximate)
  const USD_TO_JPY = 150;

  // localStorage key
  const LS_KEY = 'malaysia_api_cost';

  /* ---- localStorage helpers ---- */

  function _currentMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function _save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        month:             _currentMonth(),
        totalInputTokens:  AppState.totalInputTokens,
        totalOutputTokens: AppState.totalOutputTokens,
        callCount:         AppState.callCount,
      }));
    } catch (e) { /* プライベートモード等は無視 */ }
  }

  /* ---- 起動時に呼ぶ初期化 ---- */
  function init() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.month === _currentMonth()) {
          // 同じ月なら復元
          AppState.totalInputTokens  = Number(data.totalInputTokens)  || 0;
          AppState.totalOutputTokens = Number(data.totalOutputTokens) || 0;
          AppState.callCount         = Number(data.callCount)          || 0;
        } else {
          // 月が変わっていたら自動リセット
          localStorage.removeItem(LS_KEY);
        }
      }
    } catch (e) {}
    _render();
  }

  /* ---- Public API ---- */

  function addUsage(inputTokens, outputTokens) {
    AppState.totalInputTokens  += inputTokens;
    AppState.totalOutputTokens += outputTokens;
    AppState.callCount         += 1;
    _save();
    _render();
    _showToast(inputTokens, outputTokens);
  }

  function reset() {
    AppState.totalInputTokens  = 0;
    AppState.totalOutputTokens = 0;
    AppState.callCount         = 0;
    _save();
    _render();
  }

  function totalUSD() {
    return (AppState.totalInputTokens  / 1_000_000 * PRICE_INPUT_PER_M)
         + (AppState.totalOutputTokens / 1_000_000 * PRICE_OUTPUT_PER_M);
  }

  function totalJPY() {
    return totalUSD() * USD_TO_JPY;
  }

  /* ---- Private helpers ---- */

  function _tier(usd) {
    if (usd < TIERS[0]) return 0;
    if (usd < TIERS[1]) return 1;
    if (usd < TIERS[2]) return 2;
    if (usd < TIERS[3]) return 3;
    return 4;
  }

  function _tierClass(t) {
    return t > 0 ? `tier-${t}` : '';
  }

  function _render() {
    const usd  = totalUSD();
    const jpy  = totalJPY();
    const tier = _tier(usd);
    const tc   = _tierClass(tier);

    // 月ラベル更新
    const monthEl = document.getElementById('costMonth');
    if (monthEl) {
      const [y, m] = _currentMonth().split('-');
      monthEl.textContent = `${y}年${Number(m)}月`;
    }

    // Amount text
    const amountEl = document.getElementById('costAmount');
    if (!amountEl) return;
    amountEl.textContent = jpy < 1
      ? `¥${jpy.toFixed(3)}`
      : `¥${jpy.toFixed(2)}`;
    amountEl.className = `cost-meter__amount ${tc}`;

    // Progress bar (caps at ¥50 = budget reference)
    const CAP_JPY = 50;
    const pct     = Math.min(jpy / CAP_JPY * 100, 100).toFixed(1);
    const barEl   = document.getElementById('costBar');
    if (barEl) {
      barEl.style.width = `${pct}%`;
      barEl.className   = `cost-meter__bar ${tc}`;
    }

    // Detail line
    const detailEl = document.getElementById('costDetail');
    if (detailEl) {
      const inK  = (AppState.totalInputTokens  / 1000).toFixed(1);
      const outK = (AppState.totalOutputTokens / 1000).toFixed(1);
      detailEl.innerHTML =
        `<span>${AppState.callCount}回</span>` +
        `<span>in:${inK}k / out:${outK}k</span>`;
    }

    // Active glow
    const meter = document.getElementById('costMeter');
    if (meter) meter.classList.toggle('is-active', AppState.callCount > 0);
  }

  function _showToast(inputTokens, outputTokens) {
    const callUSD = (inputTokens  / 1_000_000 * PRICE_INPUT_PER_M)
                  + (outputTokens / 1_000_000 * PRICE_OUTPUT_PER_M);
    const callJPY = callUSD * USD_TO_JPY;

    const toastEl = document.getElementById('costToast');
    if (!toastEl) return;

    let msg, cls;
    if (callJPY < 0.05) {
      msg = `+¥${callJPY.toFixed(3)} めちゃ安！`;
      cls = 'cost-meter__toast--cheap';
    } else if (callJPY < 0.5) {
      msg = `+¥${callJPY.toFixed(3)} まあ安い`;
      cls = 'cost-meter__toast--mid';
    } else {
      msg = `+¥${callJPY.toFixed(2)} ちょい高め`;
      cls = 'cost-meter__toast--pricey';
    }

    toastEl.textContent = msg;
    toastEl.className   = `cost-meter__toast is-visible ${cls}`;

    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2500);
  }

  return { init, addUsage, reset, totalUSD, totalJPY };
})();
