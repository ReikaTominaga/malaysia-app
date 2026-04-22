/* ============================================================
   speech.js — Web Speech API wrapper + Malay TTS
   英語: ブラウザ内蔵の高品質音声
   マレー語: Chrome内蔵の Google Bahasa Malaysia 優先
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

  /* ---- マレー語 TTS ---- */
  var _currentAudio = null;

  function speakMalay(text) {
    if (!text) return;
    _stopAll();

    if (!('speechSynthesis' in window)) {
      _googleTTS(text);
      return;
    }

    var voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      _speakMalayWithVoices(text, voices);
    } else {
      window.speechSynthesis.onvoiceschanged = function () {
        window.speechSynthesis.onvoiceschanged = null;
        _speakMalayWithVoices(text, window.speechSynthesis.getVoices());
      };
      setTimeout(function () {
        var v = window.speechSynthesis.getVoices();
        if (v.length > 0) {
          _speakMalayWithVoices(text, v);
        } else {
          _googleTTS(text);
        }
      }, 1000);
    }
  }

  function _speakMalayWithVoices(text, voices) {
    var ms = null;
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      if (v.name === 'Google Bahasa Malaysia') { ms = v; break; }
    }
    if (!ms) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].name.toLowerCase().indexOf('malay') !== -1) { ms = voices[i]; break; }
      }
    }
    if (!ms) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].lang === 'ms-MY') { ms = voices[i]; break; }
      }
    }
    if (!ms) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].lang.indexOf('ms') === 0) { ms = voices[i]; break; }
      }
    }

    if (ms) {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.voice = ms;
      u.lang  = ms.lang;
      u.rate  = 0.85;
      window.speechSynthesis.speak(u);
    } else {
      _googleTTS(text);
    }
  }

  function _googleTTS(text) {
    var url = 'https://translate.googleapis.com/translate_tts'
      + '?ie=UTF-8&q=' + encodeURIComponent(text)
      + '&tl=ms&client=tw-ob';
    var audio = new Audio(url);
    _currentAudio = audio;
    audio.onerror = function () { _browserTTS(text); };
    audio.onabort = function () { _browserTTS(text); };
    var p = audio.play();
    if (p) p.catch(function () { _browserTTS(text); });
  }

  function _browserTTS(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.lang = 'ms-MY';
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
    function normalise(s) { return s.toLowerCase().replace(/[^a-z\s']/g, '').trim(); }
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
    startRecognition: startRecognition,
    similarity:       similarity,
    PASS_THRESHOLD:   PASS_THRESHOLD
  };
})();
