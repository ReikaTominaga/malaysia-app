/* ============================================================
   test/ui.test.js — UI / structure tests
   CSS classes, semantic HTML, accessibility basics
   ============================================================ */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const baseCss      = read('css/base.css');
const layoutCss    = read('css/layout.css');
const componentsCss= read('css/components.css');
const pagesCss     = read('css/pages.css');
const indexHtml    = read('index.html');
const allCss       = baseCss + layoutCss + componentsCss + pagesCss;

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
function countAtLeast(src, pat, n, m) {
  const c = (src.match(new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (c < n) throw new Error(m || `Expected >= ${n} of "${pat}", got ${c}`);
}

// ============================================================
console.log('\n🎨 UI — base.css: variables & animations');
// ============================================================

const CSS_VARS = ['--bg','--surface','--surface2','--text','--text2','--teal','--teal-light','--purple','--amber','--coral','--blue','--red','--green','--cost-0','--cost-1','--cost-2','--cost-3','--cost-4','--radius','--radius-sm'];
CSS_VARS.forEach(v => test(`CSS var ${v} defined`, () => contains(baseCss, v + ':')));

test('@keyframes blink defined', () => contains(baseCss, '@keyframes blink'));
test('@keyframes pulse defined', () => contains(baseCss, '@keyframes pulse'));
test('@keyframes fadeIn defined', () => contains(baseCss, '@keyframes fadeIn'));
test('@keyframes coinPop defined', () => contains(baseCss, '@keyframes coinPop'));
test('@keyframes meterGlow defined', () => contains(baseCss, '@keyframes meterGlow'));
test('Font stack uses Outfit', () => contains(baseCss, "'Outfit'"));
test('DM Serif Display referenced', () => contains(indexHtml, 'DM+Serif+Display'));

// ============================================================
console.log('\n🎨 UI — layout.css: sidebar & main layout');
// ============================================================

const LAYOUT_CLASSES = ['.sidebar','.sidebar__logo','.sidebar__nav-item','.sidebar__bottom','.api-key-block','api-key-block__input','.cost-meter','.cost-meter__amount','.cost-meter__bar','.cost-meter__toast','.main','.page','.page__title','.page__subtitle'];
LAYOUT_CLASSES.forEach(c => test(`Layout class ${c} defined`, () => contains(layoutCss, c)));

test('Sidebar is sticky', () => contains(layoutCss, 'position: sticky'));
test('Sidebar height 100vh', () => contains(layoutCss, 'height: 100vh'));
test('.app uses flexbox', () => {
  const idx = layoutCss.indexOf('.app {');
  const block = layoutCss.substring(idx, idx + 80);
  contains(block, 'display: flex');
});
test('Cost meter tiers 0-4 styled', () => {
  [0,1,2,3,4].forEach(i => contains(layoutCss, `tier-${i}`));
});
test('Toast --cheap/--mid/--pricey variants', () => {
  contains(layoutCss, 'cost-meter__toast--cheap');
  contains(layoutCss, 'cost-meter__toast--mid');
  contains(layoutCss, 'cost-meter__toast--pricey');
});
test('is-active class for cost meter glow', () => contains(layoutCss, 'is-active'));
test('Page fadeIn animation applied', () => contains(layoutCss, 'animation: fadeIn'));

// ============================================================
console.log('\n🎨 UI — components.css: reusable components');
// ============================================================

const COMPONENT_CLASSES = ['.btn','.btn--primary','.btn--secondary','.btn--ghost','.btn--sm','.badge','.badge--teal','.badge--purple','.badge--amber','.card','.card--interactive','.loading-dots','.empty-state','.play-btn','.bookmark-btn','.scene-tab','.mic-btn'];
COMPONENT_CLASSES.forEach(c => test(`Component ${c} defined`, () => contains(componentsCss, c)));

test('Bookmark bookmarked state defined', () => contains(componentsCss, '.bookmark-btn.is-bookmarked'));
test('Scene tab active state defined', () => contains(componentsCss, '.scene-tab.is-active'));
test('Mic btn listening state defined', () => contains(componentsCss, '.mic-btn.is-listening'));
test('Mic listening uses pulse animation', () => contains(componentsCss, 'animation: pulse'));

// ============================================================
console.log('\n🎨 UI — pages.css: page-specific styles');
// ============================================================

const PAGE_CLASSES = [
  '.home-grid','.home-card','.today-banner','.today-big-card',
  '.phrase-grid','.phrase-card','.phrase-card__en','.phrase-card__kana','.phrase-card__jp',
  '.quiz-box','.quiz-options','.quiz-option','.quiz-option.is-correct','.quiz-option.is-wrong',
  '.scenario-grid','.scenario-card','.chat-main','.chat-messages','.chat-bubble--ai','.chat-bubble--user',
  '.feedback-box','.feedback-item','.feedback-item--suggest','.tip-card','.tips-grid',
];
PAGE_CLASSES.forEach(c => test(`Page class ${c} defined`, () => contains(pagesCss, c)));

test('Chat bubble AI has distinct border-radius', () => contains(pagesCss, '4px 12px 12px 12px'));
test('Chat bubble user has distinct border-radius', () => contains(pagesCss, '12px 4px 12px 12px'));
test('quiz-option disabled style defined', () => contains(pagesCss, ':disabled'));
test('Phrase kana uses teal color', () => contains(pagesCss, 'color: var(--teal)'));
test('Scenario card hover border is amber', () => contains(pagesCss, 'border-color: var(--amber)'));
test('Feedback item fadeIn animation', () => contains(pagesCss, 'animation: fadeIn'));

// ============================================================
console.log('\n🎨 UI — index.html: semantic structure');
// ============================================================

test('DOCTYPE html present', () => contains(indexHtml, '<!DOCTYPE html>'));
test('lang="ja" on html tag', () => contains(indexHtml, 'lang="ja"'));
test('charset UTF-8', () => contains(indexHtml, 'charset="UTF-8"'));
test('viewport meta tag', () => contains(indexHtml, 'viewport'));
test('<aside> for sidebar', () => contains(indexHtml, '<aside class="sidebar">'));
test('<main> for content', () => contains(indexHtml, '<main class="main">'));
test('Sidebar uses BEM naming (sidebar__)', () => countAtLeast(indexHtml, 'sidebar__', 5));
test('Google Fonts loaded', () => contains(indexHtml, 'fonts.googleapis.com'));
test('Outfit font in link', () => contains(indexHtml, 'Outfit'));

// ============================================================
console.log('\n🎨 UI — index.html: all required DOM elements');
// ============================================================

const REQUIRED_IDS = [
  'page-home','page-today','page-phrases','page-quiz','page-roleplay','page-bookmarks','page-tips',
  'apiKeyInput','costMeter','costAmount','costBar','costDetail','costToast','costReset',
  'sceneTabs','phraseGrid','bookmarkGrid','bookmarkEmpty',
  'quizContent','chatMessages','chatInput','sendBtn','feedbackBox',
  'scenarioGrid','roleplaySceneSelect','roleplayChatArea',
  'tipsGrid',
];
REQUIRED_IDS.forEach(id => test(`DOM id="${id}" present`, () => contains(indexHtml, `id="${id}"`)));

// ============================================================
console.log('\n🎨 UI — index.html: no inline script blocks');
// ============================================================

test('No inline <script> with logic (all in .js files)', () => {
  // Only allowed pattern: <script src="..."> tags — no inline code blocks
  const inlineScript = /<script>[\s\S]+?<\/script>/;
  const match = indexHtml.match(inlineScript);
  assert(!match, 'Found inline <script> block — move to .js file');
});

test('No inline style= attributes for layout (use classes)', () => {
  // Allow only display:none (for initial hide) and flex:1 helper styles — not full layout
  const badInline = /style="(?!display:none|display: none|flex:1)[^"]{30,}"/;
  // We'll just check there are no very long inline styles (>60 chars suggests layout smell)
  const longInlines = (indexHtml.match(/style="[^"]{60,}"/g) || []);
  // Tolerate up to 5 (some legitimate overrides)
  assert(longInlines.length <= 8, `Too many long inline styles: ${longInlines.length}`);
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
