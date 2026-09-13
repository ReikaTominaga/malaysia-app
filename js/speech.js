/* ============================================================
   speech.js — Web Speech API wrapper + Malay/Spanish TTS
   英語: ブラウザ内蔵の高品質音声
   マレー語・スペイン語: Chrome内蔵の Google 音声を優先
             → Google Translate TTS → ブラウザ内蔵の順でフォールバック
   ============================================================ */

'use strict';

var Speech = (function () {

  /* ---- 英語 TTS ---- */
  function speak(text, rate, lang) {
    rate = rate || 0.9;
    lang = lang || 'en-US';
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    window.speechSynthesis.speak(u);
  }

  /* ---- マレー語・スペイン語 TTS（共通ロジック） ---- */
  var _currentAudio = null;

  function speakMalay(text) {
    _speakForeign(text, {
      preferredNames: ['Google Bahasa Malaysia'],
      nameHint:       'malay',
      exactLang:      'ms-MY',
      langPrefix:     'ms',
      tl:             'ms',
      fallbackLang:   'ms-MY',
      rate:           0.85,
    });
  }

  function speakSpanish(text) {
    _speakForeign(text, {
      preferredNames: ['Google español', 'Google español de Estados Unidos'],
      nameHint:       'spanish',
      exactLang:      'es-ES',
      langPrefix:     'es',
      tl:             'es',
      fallbackLang:   'es-ES',
      rate:           0.9,
    });
  }

  function _speakForeign(text, cfg) {
    if (!text) return;
    _stopAll();

    if (!('speechSynthesis' in window)) {
      _googleTTS(text, cfg);
      return;
    }

    var voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      _speakForeignWithVoices(text, voices, cfg);
    } else {
      window.speechSynthesis.onvoiceschanged = function () {
        window.speechSynthesis.onvoiceschanged = null;
        _speakForeignWithVoices(text, window.speechSynthesis.getVoices(), cfg);
      };
      setTimeout(function () {
        var v = window.speechSynthesis.getVoices();
        if (v.length > 0) {
          _speakForeignWithVoices(text, v, cfg);
        } else {
          _googleTTS(text, cfg);
        }
      }, 1000);
    }
  }

  function _speakForeignWithVoices(text, voices, cfg) {
    var chosen = null;
    for (var i = 0; i < voices.length; i++) {
      if (cfg.preferredNames.indexOf(voices[i].name) !== -1) { chosen = voices[i]; break; }
    }
    if (!chosen) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].name.toLowerCase().indexOf(cfg.nameHint) !== -1) { chosen = voices[i]; break; }
      }
    }
    if (!chosen) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].lang === cfg.exactLang) { chosen = voices[i]; break; }
      }
    }
    if (!chosen) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].lang.indexOf(cfg.langPrefix) === 0) { chosen = voices[i]; break; }
      }
    }

    if (chosen) {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.voice = chosen;
      u.lang  = chosen.lang;
      u.rate  = cfg.rate;
      window.speechSynthesis.speak(u);
    } else {
      _googleTTS(text, cfg);
    }
  }

  function _googleTTS(text, cfg) {
    var url = 'https://translate.googleapis.com/translate_tts'
      + '?ie=UTF-8&q=' + encodeURIComponent(text)
      + '&tl=' + cfg.tl + '&client=tw-ob';
    var audio = new Audio(url);
    _currentAudio = audio;
    audio.onerror = function () { _browserTTS(text, cfg); };
    audio.onabort = function () { _browserTTS(text, cfg); };
    var p = audio.play();
    if (p) p.catch(function () { _browserTTS(text, cfg); });
  }

  function _browserTTS(text, cfg) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = cfg.rate;
    u.lang = cfg.fallbackLang;
    window.speechSynthesis.speak(u);
  }

  function _stopAll() {
    if (_currentAudio) {
      _currentAudio.pause();
      _currentAudio.currentTime = 0;
      _currentAudio = null;
    }
    if (typeof responsiveVoice !== 'undefined') responsiveVoice.cancel();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  /* ---- 音声認識 ---- */
  function startRecognition(opts) {
    var lang     = (opts && opts.lang)     || 'en-US';
    var onStart  = (opts && opts.onStart)  || null;
    var onResult = (opts && opts.onResult) || null;
    var onError  = (opts && opts.onError)  || null;

    var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (onError) onError('このブラウザは音声認識に対応していません（Chromeを推奨）');
      return null;
    }

    var rec = new SpeechRec();
    rec.lang = lang;
    rec.interimResults  = false;
    rec.maxAlternatives = 1;
    rec.onstart  = function () { if (onStart) onStart(); };
    rec.onresult = function (e) {
      var transcript = e.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };
    rec.onerror = function () {
      if (onError) onError('認識できませんでした。もう一度試してください。');
    };
    rec.start();
    return rec;
  }

  /* ---- 類似度スコア ---- */
  function similarity(spoken, target) {
    // \p{L} でアクセント付き文字（スペイン語の á/ñ 等）も文字として扱う
    function normalise(s) { return s.toLowerCase().normalize('NFC').replace(/[^\p{L}\s']/gu, '').trim(); }
    var aWords = normalise(spoken).split(/\s+/).filter(Boolean);
    var bWords = normalise(target).split(/\s+/).filter(Boolean);
    if (bWords.length === 0) return 0;
    var matches = 0;
    for (var i = 0; i < aWords.length; i++) {
      if (bWords.indexOf(aWords[i]) !== -1) matches++;
    }
    return matches / Math.max(aWords.length, bWords.length);
  }

  var PASS_THRESHOLD = 0.5;

  return {
    speak:            speak,
    speakMalay:       speakMalay,
    speakSpanish:     speakSpanish,
    startRecognition: startRecognition,
    similarity:       similarity,
    PASS_THRESHOLD:   PASS_THRESHOLD
  };
})();
