/* ============================================================
   test/integration.test.js — Integration tests
   Module wiring, cross-file dependencies, HTML structure
   ============================================================ */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dataJs    = read('js/data.js');
const stateJs   = read('js/state.js');
const costJs    = read('js/cost.js');
const quizJs    = read('js/quiz.js');
const phrasesJs = read('js/phrases.js');
const roleJs    = read('js/roleplay.js');
const appJs     = read('js/app.js');
const indexHtml = read('index.html');

let passed = 0, failed = 0;
const failures = [];

function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) {
    console.log(`  ✗ ${name}\n    → ${e.message}`);
    failed++;
    failures.push({ name, error: e.message });
  }
}
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); }
function contains(src, sub, m) { if (!src.includes(sub)) throw new Error(m || `Missing: "${sub}"`); }
function notContains(src, sub, m) { if (src.includes(sub)) throw new Error(m || `Should not contain: "${sub}"`); }

// ============================================================
console.log('\n🔗 Integration — Script load order in index.html');
// ============================================================

test('data.js loaded before state.js', () => {
  const di = indexHtml.indexOf('js/data.js');
  const si = indexHtml.indexOf('js/state.js');
  assert(di < si, 'data.js must load before state.js');
});
test('state.js loaded before cost.js', () => {
  const si = indexHtml.indexOf('js/state.js');
  const ci = indexHtml.indexOf('js/cost.js');
  assert(si < ci, 'state.js must load before cost.js');
});
test('cost.js loaded before roleplay.js', () => {
  const ci = indexHtml.indexOf('js/cost.js');
  const ri = indexHtml.indexOf('js/roleplay.js');
  assert(ci < ri, 'cost.js must load before roleplay.js');
});
test('router.js loaded before app.js', () => {
  const ri = indexHtml.indexOf('js/router.js');
  const ai = indexHtml.indexOf('js/app.js');
  assert(ri < ai, 'router.js must load before app.js');
});
test('app.js is last script', () => {
  const scripts = ['data.js','state.js','speech.js','cost.js','router.js','phrases.js','quiz.js','roleplay.js','tips.js','app.js'];
  const indices = scripts.map(s => indexHtml.indexOf(s));
  const appIdx  = indices[indices.length - 1];
  assert(indices.every(i => i <= appIdx), 'app.js must be last');
});

// ============================================================
console.log('\n🔗 Integration — Page IDs match nav items');
// ============================================================

const PAGES = ['home','today','phrases','quiz','roleplay','bookmarks','tips'];
PAGES.forEach(p => {
  test(`page div #page-${p} exists`, () => contains(indexHtml, `id="page-${p}"`));
  test(`nav item data-page="${p}" exists`, () => contains(indexHtml, `data-page="${p}"`));
});

// ============================================================
console.log('\n🔗 Integration — Router register calls match pages');
// ============================================================

const ROUTED_PAGES = ['phrases','quiz','roleplay','bookmarks','today','tips'];
ROUTED_PAGES.forEach(p => {
  test(`Router.register called for '${p}'`, () => contains(appJs, `'${p}'`));
});

// ============================================================
console.log('\n🔗 Integration — Cross-module AppState usage');
// ============================================================

test('quiz.js reads AppState.quizType', () => contains(quizJs, 'AppState.quizType'));
test('quiz.js reads AppState.quizItems', () => contains(quizJs, 'AppState.quizItems'));
test('quiz.js writes AppState.quizScore', () => contains(quizJs, 'AppState.quizScore'));
test('quiz.js writes AppState.quizAnswered', () => contains(quizJs, 'AppState.quizAnswered'));
test('phrases.js reads AppState.bookmarks', () => contains(phrasesJs, 'AppState.bookmarks'));
test('phrases.js reads AppState.currentScene', () => contains(phrasesJs, 'AppState.currentScene'));
test('phrases.js writes AppState.todayPhrase', () => contains(phrasesJs, 'AppState.todayPhrase'));
test('roleplay.js reads AppState.currentScenario', () => contains(roleJs, 'AppState.currentScenario'));
test('roleplay.js writes AppState.chatHistory', () => contains(roleJs, 'AppState.chatHistory'));

// ============================================================
console.log('\n🔗 Integration — Cost module wired to roleplay');
// ============================================================

test('roleplay.js calls Cost.addUsage()', () => contains(roleJs, 'Cost.addUsage('));
test('Cost receives inputTokens from response', () => contains(roleJs, 'inputToks'));
test('Cost receives outputTokens from response', () => contains(roleJs, 'outputToks'));
test('cost.js reads from AppState for totals', () => contains(costJs, 'AppState.totalInputTokens'));
test('cost.js updates AppState on addUsage', () => contains(costJs, 'AppState.totalInputTokens  +='));
test('cost.js updates callCount', () => contains(costJs, 'AppState.callCount         +='));
test('cost.js reset clears AppState', () => {
  contains(costJs, 'AppState.totalInputTokens  = 0');
  contains(costJs, 'AppState.callCount         = 0');
});

// ============================================================
console.log('\n🔗 Integration — Cost meter DOM elements in index.html');
// ============================================================

const COST_DOM_IDS = ['costMeter','costAmount','costBar','costDetail','costToast','costReset'];
COST_DOM_IDS.forEach(id => {
  test(`Cost meter DOM id="${id}" exists`, () => contains(indexHtml, `id="${id}"`));
});
test('cost-meter class on container', () => contains(indexHtml, 'class="cost-meter"'));
test('API key input id="apiKeyInput"', () => contains(indexHtml, 'id="apiKeyInput"'));

// ============================================================
console.log('\n🔗 Integration — Quiz DOM elements in index.html');
// ============================================================

test('Quiz content container exists', () => contains(indexHtml, 'id="quizContent"'));
test('All 3 quiz tab data-quiz attributes present', () => {
  contains(indexHtml, 'data-quiz="listening"');
  contains(indexHtml, 'data-quiz="pronunciation"');
  contains(indexHtml, 'data-quiz="selfcheck"');
});

// ============================================================
console.log('\n🔗 Integration — Roleplay DOM elements in index.html');
// ============================================================

const ROLEPLAY_IDS = ['scenarioGrid','roleplaySceneSelect','roleplayChatArea','chatMessages','chatInput','sendBtn','feedbackBox','promptTags','chatLoading','apiWarning'];
ROLEPLAY_IDS.forEach(id => {
  test(`Roleplay DOM id="${id}" exists`, () => contains(indexHtml, `id="${id}"`));
});

// ============================================================
console.log('\n🔗 Integration — Today\'s phrase DOM elements');
// ============================================================

const TODAY_IDS = ['todayBanner','todayBannerEn','todayBannerJp','todayBannerKana','todayBannerMs','todayBannerPlay','todayPageEn','todayPageJp','todayPageKana','todayPageMs','todayRelatedGrid'];
TODAY_IDS.forEach(id => {
  test(`Today's phrase DOM id="${id}" exists`, () => contains(indexHtml, `id="${id}"`));
});

// ============================================================
console.log('\n🔗 Integration — CSS files all linked in index.html');
// ============================================================

['css/base.css','css/layout.css','css/components.css','css/pages.css'].forEach(f => {
  test(`CSS file ${f} linked`, () => contains(indexHtml, f));
});

// ============================================================
console.log('\n🔗 Integration — API warning shown when key missing');
// ============================================================

test('API warning element has api-warning class', () => contains(indexHtml, 'class="api-warning"'));
test('roleplay.js adds is-visible to warning', () => contains(roleJs, "classList.add('is-visible')"));
test('roleplay.js removes is-visible after key entered', () => contains(roleJs, "classList.remove('is-visible')"));

// ============================================================
// Summary
// ============================================================
console.log('\n' + '─'.repeat(52));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`   Total:  ${passed + failed}`);
if (failures.length) {
  console.log('\nFailed tests:');
  failures.forEach(f => console.log(`  - ${f.name}\n    ${f.error}`));
}
console.log('─'.repeat(52) + '\n');
process.exit(failed > 0 ? 1 : 0);
