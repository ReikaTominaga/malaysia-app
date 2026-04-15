#!/usr/bin/env node
/* ============================================================
   build.js — Bundles css/ + js/ into a single dist/index.html
   Run: node build.js
   Output: dist/index.html  (open directly in any browser)
   ============================================================ */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ---- Collect CSS in order ----
const CSS_FILES = [
  'css/base.css',
  'css/layout.css',
  'css/components.css',
  'css/pages.css',
];
const bundledCSS = CSS_FILES.map(f => `/* === ${f} === */\n${read(f)}`).join('\n\n');

// ---- Collect JS in dependency order ----
const JS_FILES = [
  'js/data.js',
  'js/state.js',
  'js/speech.js',
  'js/cost.js',
  'js/router.js',
  'js/phrases.js',
  'js/quiz.js',
  'js/roleplay.js',
  'js/tips.js',
  'js/app.js',
];
const bundledJS = JS_FILES.map(f => `/* === ${f} === */\n${read(f)}`).join('\n\n');

// ---- Read base HTML and inject ----
let html = read('index.html');

// Remove individual <link rel="stylesheet"> tags for local css files
html = html.replace(/<link rel="stylesheet" href="css\/[^"]+\.css">\n?/g, '');

// Remove individual <script src="js/..."> tags
html = html.replace(/<script src="js\/[^"]+\.js"><\/script>\n?/g, '');

// Inject bundled CSS into <head> before </head>
html = html.replace('</head>', `<style>\n${bundledCSS}\n</style>\n</head>`);

// Inject bundled JS before </body>
html = html.replace('</body>', `<script>\n${bundledJS}\n</script>\n</body>`);

const outPath = path.join(DIST, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');

const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✅ Built: dist/index.html (${sizeKB} KB)`);
console.log('   → ブラウザで直接開けます（file:// OK）');
