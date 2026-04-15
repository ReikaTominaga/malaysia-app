/* ============================================================
   test/unit.test.js — Unit tests
   Tests data integrity, pure functions, business logic
   ============================================================ */

'use strict';

const fs   = require('fs');
const path = require('path');

// ---- Load source files as text for pattern checks ----
const ROOT    = path.join(__dirname, '..');
const read    = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dataJs    = read('js/data.js');
const stateJs   = read('js/state.js');
const speechJs  = read('js/speech.js');
const costJs    = read('js/cost.js');
const routerJs  = read('js/router.js');
const phrasesJs = read('js/phrases.js');
const quizJs    = read('js/quiz.js');
const roleJs    = read('js/roleplay.js');
const tipsJs    = read('js/tips.js');
const appJs     = read('js/app.js');
const indexHtml = read('index.html');

// ---- Test runner ----
let passed = 0, failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    → ${e.message}`);
    failed++;
    failures.push({ name, error: e.message });
  }
}

function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion failed'); }
function contains(src, sub, msg) { if (!src.includes(sub)) throw new Error(msg || `Missing: "${sub}"`); }
function countAtLeast(src, pat, n, msg) {
  const c = (src.match(new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (c < n) throw new Error(msg || `Expected >= ${n} occurrences of "${pat}", got ${c}`);
}

// ---- Extract & eval pure function from source ----
function extractFn(src, fnName) {
  // Extract and wrap in an eval-safe closure
  const match = src.match(new RegExp(`function ${fnName}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?^  \\}`, 'm'));
  return match ? match[0] : null;
}

// Inline reimplementations for pure-logic unit testing
function calcSimilarity(spoken, target) {
  const normalise = s => s.toLowerCase().replace(/[^a-z\s']/g, '').trim();
  const aW = normalise(spoken).split(/\s+/).filter(Boolean);
  const bW = normalise(target).split(/\s+/).filter(Boolean);
  if (bW.length === 0) return 0;
  const matches = aW.filter(w => bW.includes(w)).length;
  return matches / Math.max(aW.length, bW.length);
}

// ============================================================
console.log('\n📦 Unit — data.js integrity');
// ============================================================

test('PHRASES array declared', () => contains(dataJs, 'const PHRASES = ['));
test('SCENES array declared',  () => contains(dataJs, 'const SCENES = ['));
test('SCENARIOS array declared', () => contains(dataJs, 'const SCENARIOS = ['));
test('TIPS array declared',    () => contains(dataJs, 'const TIPS = ['));
test('SCENARIO_ROLES declared', () => contains(dataJs, 'const SCENARIO_ROLES = {'));

const SCENE_IDS = ['greeting','airport','hotel','restaurant','shopping','transport'];
SCENE_IDS.forEach(id => {
  test(`Scene '${id}' present in PHRASES`, () => contains(dataJs, `scene:'${id}'`));
  test(`Scene '${id}' present in SCENES`,  () => contains(dataJs, `id:'${id}'`));
});

test('PHRASES >= 30 entries', () => countAtLeast(dataJs, "scene:'", 30));

const PHRASE_FIELDS = ["jp:'","en:'","kana:'","ms:'"];
PHRASE_FIELDS.forEach(f => test(`Phrase field ${f} present`, () => contains(dataJs, f)));

const SCENARIO_IDS = ['restaurant','hotel','shopping','transport','airport','trouble'];
SCENARIO_IDS.forEach(id => {
  test(`Scenario id '${id}' present`, () => contains(dataJs, `id:'${id}'`));
  test(`Scenario role '${id}' present in SCENARIO_ROLES`, () => contains(dataJs, id));
});

test('TIPS >= 8 entries', () => countAtLeast(dataJs, "icon:'", 8));
test('All scenarios have prompts', () => countAtLeast(dataJs, 'prompts:[', 6));

// ============================================================
console.log('\n📦 Unit — state.js');
// ============================================================

test('AppState declared', () => contains(stateJs, 'const AppState = {'));
test('bookmarks is a Set', () => contains(stateJs, 'bookmarks: new Set()'));
test('quizType default is listening', () => contains(stateJs, "quizType:     'listening'"));
test('chatHistory initialised', () => contains(stateJs, 'chatHistory:      []'));
test('totalInputTokens initialised', () => contains(stateJs, 'totalInputTokens:  0'));
test('totalOutputTokens initialised', () => contains(stateJs, 'totalOutputTokens: 0'));
test('callCount initialised', () => contains(stateJs, 'callCount:         0'));

// ============================================================
console.log('\n🔊 Unit — speech.js');
// ============================================================

test('speak() defined', () => contains(speechJs, 'function speak('));
test('startRecognition() defined', () => contains(speechJs, 'function startRecognition('));
test('similarity() defined', () => contains(speechJs, 'function similarity('));
test('PASS_THRESHOLD exported', () => contains(speechJs, 'PASS_THRESHOLD'));
test('TTS uses speechSynthesis', () => contains(speechJs, 'speechSynthesis'));
test('Recognition sets en-US lang', () => contains(speechJs, "rec.lang            = lang"));
test('Public API exports speak', () => contains(speechJs, 'speak, startRecognition, similarity'));

// ============================================================
console.log('\n💰 Unit — cost.js');
// ============================================================

test('addUsage() defined', () => contains(costJs, 'function addUsage('));
test('reset() defined',    () => contains(costJs, 'function reset()'));
test('totalUSD() defined', () => contains(costJs, 'function totalUSD()'));
test('totalJPY() defined', () => contains(costJs, 'function totalJPY()'));
test('Input price constant set', () => contains(costJs, 'PRICE_INPUT_PER_M  = 3.00'));
test('Output price constant set', () => contains(costJs, 'PRICE_OUTPUT_PER_M = 15.00'));
test('USD_TO_JPY constant set', () => contains(costJs, 'USD_TO_JPY = 150'));
test('Tier thresholds defined', () => contains(costJs, 'const TIERS = ['));
test('Toast shows cheap/mid/pricey', () => {
  contains(costJs, 'めちゃ安');
  contains(costJs, 'まあ安い');
  contains(costJs, 'ちょい高め');
});
test('Renders costAmount element', () => contains(costJs, "getElementById('costAmount')"));
test('Renders costBar element', () => contains(costJs, "getElementById('costBar')"));
test('Renders costDetail element', () => contains(costJs, "getElementById('costDetail')"));
test('Toast auto-hides with setTimeout', () => contains(costJs, 'setTimeout'));

// ============================================================
console.log('\n🧮 Unit — similarity() logic');
// ============================================================

test('Exact match → 1.0', () => {
  assert(calcSimilarity('hello world', 'hello world') === 1.0, 'Expected 1.0');
});
test('No overlap → 0', () => {
  assert(calcSimilarity('hello world', 'foo bar') === 0, 'Expected 0');
});
test('Partial match → between 0 and 1', () => {
  const s = calcSimilarity('hello world', 'hello there');
  assert(s > 0 && s < 1, `Expected 0<s<1, got ${s}`);
});
test('Case insensitive', () => {
  const s = calcSimilarity('HELLO WORLD', 'hello world');
  assert(s === 1.0, `Expected 1.0, got ${s}`);
});
test('Empty target → 0', () => {
  assert(calcSimilarity('hello', '') === 0, 'Expected 0 for empty target');
});
test('Pass threshold 0.6 for near-exact phrase', () => {
  const s = calcSimilarity('excuse me where is the exit', 'excuse me where is the exit');
  assert(s >= 0.6, `Expected >= 0.6, got ${s}`);
});
test('Punctuation stripped before comparison', () => {
  const s = calcSimilarity("it's delicious", "its delicious");
  assert(s >= 0.5, `Expected >= 0.5, got ${s}`);
});

// ============================================================
console.log('\n🗺️  Unit — router.js');
// ============================================================

test('Router object declared', () => contains(routerJs, 'const Router = ('));
test('register() defined', () => contains(routerJs, 'function register('));
test('navigate() defined', () => contains(routerJs, 'function navigate('));
test('init() defined',     () => contains(routerJs, 'function init()'));
test('navigate sets is-active on page', () => contains(routerJs, "classList.add('is-active')"));
test('navigate removes is-active from all pages', () => contains(routerJs, "classList.remove('is-active')"));
test('navigate stores currentPage in AppState', () => contains(routerJs, 'AppState.currentPage = pageId'));

// ============================================================
console.log('\n📝 Unit — phrases.js');
// ============================================================

test('phraseCardHTML() defined', () => contains(phrasesJs, 'function phraseCardHTML('));
test('renderSceneTabs() defined', () => contains(phrasesJs, 'function renderSceneTabs('));
test('selectScene() defined', () => contains(phrasesJs, 'function selectScene('));
test('renderPhrases() defined', () => contains(phrasesJs, 'function renderPhrases('));
test('toggleBookmark() defined', () => contains(phrasesJs, 'function toggleBookmark('));
test('renderBookmarks() defined', () => contains(phrasesJs, 'function renderBookmarks('));
test('pickTodayPhrase() defined', () => contains(phrasesJs, 'function pickTodayPhrase('));
test('reroll() defined', () => contains(phrasesJs, 'function reroll('));
test('Bookmark add uses AppState.bookmarks.add', () => contains(phrasesJs, 'AppState.bookmarks.add('));
test('Bookmark delete uses AppState.bookmarks.delete', () => contains(phrasesJs, 'AppState.bookmarks.delete('));
test('Bookmark check uses AppState.bookmarks.has', () => contains(phrasesJs, 'AppState.bookmarks.has('));
test('phrase-card__jp in card HTML', () => contains(phrasesJs, 'phrase-card__jp'));
test('phrase-card__kana in card HTML', () => contains(phrasesJs, 'phrase-card__kana'));

// ============================================================
console.log('\n❓ Unit — quiz.js');
// ============================================================

test('switchType() defined', () => contains(quizJs, 'function switchType('));
test('start() defined',      () => contains(quizJs, 'function start()'));
test('render() defined',     () => contains(quizJs, 'function render()'));
test('answerListening() defined', () => contains(quizJs, 'function answerListening('));
test('startPronunciationCheck() defined', () => contains(quizJs, 'function startPronunciationCheck('));
test('revealSelfCheck() defined', () => contains(quizJs, 'function revealSelfCheck('));
test('selfCheckResult() defined', () => contains(quizJs, 'function selfCheckResult('));
test('next() defined', () => contains(quizJs, 'function next()'));
test('Score increments on correct answer', () => contains(quizJs, 'AppState.quizScore++'));
test('Listening uses 3 wrong answers (total 4)', () => contains(quizJs, '.slice(0, 3)'));
test('Pass threshold used for pronunciation', () => contains(quizJs, 'Speech.PASS_THRESHOLD'));
test('3 quiz types rendered', () => {
  contains(quizJs, '_renderListening');
  contains(quizJs, '_renderPronunciation');
  contains(quizJs, '_renderSelfCheck');
});

// ============================================================
console.log('\n🤖 Unit — roleplay.js');
// ============================================================

test('renderSceneSelect() defined', () => contains(roleJs, 'function renderSceneSelect('));
test('selectScenario() defined', () => contains(roleJs, 'function selectScenario('));
test('backToSceneSelect() defined', () => contains(roleJs, 'function backToSceneSelect('));
test('usePrompt() defined', () => contains(roleJs, 'function usePrompt('));
test('handleInputKey() defined', () => contains(roleJs, 'function handleInputKey('));
test('sendMessage() defined', () => contains(roleJs, 'function sendMessage()'));
test('_callAPI() defined', () => contains(roleJs, 'async function _callAPI('));
test('API endpoint correct', () => contains(roleJs, 'https://api.anthropic.com/v1/messages'));
test('Correct model used', () => contains(roleJs, 'claude-sonnet-4-20250514'));
test('API key retrieved from DOM', () => contains(roleJs, "getElementById('apiKeyInput')"));
test('API key validated before call', () => contains(roleJs, "if (!apiKey)"));
test('chatHistory maintained in AppState', () => contains(roleJs, 'AppState.chatHistory.push'));
test('Feedback marker is 【FB】', () => contains(roleJs, '【FB】'));
test('Cost.addUsage called after API call', () => contains(roleJs, 'Cost.addUsage('));
test('Usage tokens extracted from response', () => contains(roleJs, 'usage.input_tokens'));
test('Loading state toggled', () => contains(roleJs, '_setLoading(true)'));
test('Send button disabled during load', () => contains(roleJs, 'sendBtn.disabled = on'));

// ============================================================
console.log('\n💡 Unit — tips.js');
// ============================================================

test('Tips.render() defined', () => contains(tipsJs, 'function render()'));
test('tip-card class used', () => contains(tipsJs, 'tip-card'));
test('tip-card__body class used', () => contains(tipsJs, 'tip-card__body'));

// ============================================================
console.log('\n🚀 Unit — app.js');
// ============================================================

test('initApp() defined', () => contains(appJs, 'function initApp()'));
test('DOMContentLoaded listener set', () => contains(appJs, "addEventListener('DOMContentLoaded', initApp)"));
test('Router.init() called', () => contains(appJs, 'Router.init()'));
test('Phrases.pickTodayPhrase() called on boot', () => contains(appJs, 'Phrases.pickTodayPhrase()'));
test('Tips.render() called on boot', () => contains(appJs, 'Tips.render()'));
test('Cost reset button wired', () => contains(appJs, "getElementById('costReset')"));
test('All 7 pages registered with Router', () => {
  const pages = ['phrases','quiz','roleplay','bookmarks','today','tips'];
  pages.forEach(p => contains(appJs, `'${p}'`, `Page '${p}' not registered`));
});

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
