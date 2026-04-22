/* ============================================================
   speech.js — Web Speech API wrapper + Malay TTS
   英語: ブラウザ内蔵の高品質音声
   マレー語: Chrome内蔵の Google Bahasa Malaysia（最優先）
             → Google Translate TTS → ブラウザ内蔵の順でフォールバック
   ============================================================ */

'use strict';

const Speech = (() => {

  /* ---- 英語 TTS ---- */

  function speak(text, rate = 0.9, lang = 'en-US') {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u  = new SpeechSynthesisUtterance(text);
    u.lang   = lang;
    u.rate   = rate;
    window.speechSynthesis.speak(u);
  }

  /* ---- マレー語 TTS ---- */

  let _currentAudio = null;

  function speakMalay(text) {
    if (!text) return;
    _stopAll();

    // 音声リストを取得（ロード済みなら即時、未ロードなら待機）
    const voices = ('speechSynthesis' in window) ? window.speechSynthesis.getVoices() : [];

    if (voices.length > 0) {
      _speakMalayWithVoices(text, voices);
    } else if ('speechSynthesis' in window) {
      // onvoiceschanged で読み込み完了を待つ
      window.speechSynthesis.onvoiceschanged = function () {
        window.speechSynthesis.onvoiceschanged = null;
        _speakMalayWithVoices(text, window.speechSynthesis.getVoices());
      };
      // 1秒後にも試みる（onvoiceschanged が発火しない環境向け）
      setTimeout(function () {
        var v = window.speechSynthesis.getVoices();
        if (v.length > 0) {
          _speakMalayWithVoices(text, v);
        } else {
          _googleTTS(text);
        }
      }, 1000);
    } else {
      _googleTTS(text);
    }
  }

  function _speakMalayWithVoices(text, voices) {
    // Chrome の "Google Bahasa Malaysia" は高品質オンライン音声
    var googleMs = voices.find(function (v) { return v.name === 'Google Bahasa Malaysia'; })
                || voices.find(function (v) { return v.name.toLowerCase().indexOf('malay') !== -1; })
                || voices.find(function (v) { return v.lang === 'ms-MY'; })
                || voices.find(function (v) { return v.lang.indexOf('ms') === 0; });

    if (googleMs) {
      window.speechSynthesis.cancel();
      var u   = new SpeechSynthesisUtterance(text);
      u.voice = googleMs;
      u.lang  = googleMs.lang;
      u.rate  = 0.85;
      window.speechSynthesis.speak(u);
    } else {
      _googleTTS(text);
    }
  }

  /* Google Translate TTS — Google翻訳と同じ音声エンジン */
  function _googleTTS(text) {
    var url = 'https://translate.googleapis.com/translate_tts'
      + '?ie=UTF-8'
      + '&q='    + encodeURIComponent(text)
      + '&tl=ms'
      + '&client=tw-ob';

    var audio = new Audio(url);
    _currentAudio = audio;
    audio.onerror = function () { _browserTTS(text); };
    audio.onabort = function () { _browserTTS(text); };
    var p = audio.play();
    if (p) p.catch(function () { _browserTTS(text); });
  }

  /* ブラウザ内蔵音声（最終フォールバック） */
  function _browserTTS(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var u  = new SpeechSynthesisUtterance(text);
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
    var options  = opts || {};
    var lang     = options.lang     || 'en-US';
    var onStart  = options.onStart  || null;
    var onResult = options.onResult || null;
    var onError  = options.onError  || null;

    var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (onError) onError('このブラウザは音声認識に対応していません（Chromeを推奨）');
      return null;
    }

    var rec           = new SpeechRec();
    rec.lang          = lang;
    rec.interimResults  = false;
    rec.maxAlternatives = 1;

    rec.onstart  = function () { if (onStart) onStart(); };
    rec.onresult = function (e) {
      var transcript = e.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };
    rec.onerror  = function () {
      if (onError) onError('認識できませんでした。もう一度試してください。');
    };

    rec.start();
    return rec;
  }

  /* ---- 類似度スコア ---- */

  function similarity(spoken, target) {
    var normalise = function (s) { return s.toLowerCase().replace(/[^a-z\s']/g, '').trim(); };
    var aWords = normalise(spoken).split(/\s+/).filter(Boolean);
    var bWords = normalise(target).split(/\s+/).filter(Boolean);
    if (bWords.length === 0) return 0;
    var matches = aWords.filter(function (w) { return bWords.indexOf(w) !== -1; }).length;
    return matches / Math.max(aWords.length, bWords.length);
  }

  var PASS_THRESHOLD = 0.5;

  return { speak, speakMalay, startRecognition, similarity, PASS_THRESHOLD };
})();
