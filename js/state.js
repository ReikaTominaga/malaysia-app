/* ============================================================
   state.js — Centralised application state
   All mutable state lives here. Modules read/write via this object.
   ============================================================ */

'use strict';

const AppState = {
  // Navigation
  currentPage: 'home',

  // 学習対象の第二言語（'ms' | 'es'）。切り替えは Lang.set() 経由で行う
  targetLang: 'ms',

  // Phrase page
  currentScene: 'greeting',

  // Bookmarks — persists for session only
  bookmarks: new Set(),

  // Quiz
  quizType:     'listening',   // 'listening' | 'pronunciation' | 'selfcheck' | 'second-listening' | 'second-speaking'
  quizItems:    [],
  quizIndex:    0,
  quizScore:    0,
  quizAnswered: false,

  // Today's phrase
  todayPhrase: null,

  // Roleplay / chat
  chatHistory:      [],
  currentScenario:  null,

  // API cost tracking
  totalInputTokens:  0,
  totalOutputTokens: 0,
  callCount:         0,
};
