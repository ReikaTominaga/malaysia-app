/* ============================================================
   speech.js — Web Speech API wrapper + Malay TTS
   英語: ブラウザ内蔵の高品質音声
   マレー語: ResponsiveVoice (Malaysian Female) → Google TTS → ブラウザ内蔵の順でフォールバック
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

    // 再生中のものを止める
    _stopAll();

    /* ① ResponsiveVoice — Malaysian Female（最優先・最高品質） */
    if (typeof responsiveVoice !== 'undefined') {
      responsiveVoice.cancel();
      responsiveVoice.speak(text, 'Malaysian Female', {
        rate:    0.9,
        onstart: () => {},
        onerror: () => _googleTTS(text),   // 失敗したら次へ
      });
      return;
    }

    /* ② ResponsiveVoice がロードされていない場合 → Google TTS */
    _googleTTS(text);
  }

  /* Google Translate TTS（中品質・フォールバック） */
  function _googleTTS(text) {
    const url = 'https://translate.googleapis.com/translate_tts'
      + '?ie=UTF-8'
      + '&q='     + encodeURIComponent(text)
      + '&tl=ms'
      + '&client=gtx';

    const audio = new Audio(url);
    _currentAudio = audio;
    audio.onerror = () => _browserTTS(text);
    audio.onabort = () => _browserTTS(text);
    const p = audio.play();
    if (p) p.catch(() => _browserTTS(text));
  }

  /* ブラウザ内蔵音声（最終フォールバック） */
  function _browserTTS(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u      = new SpeechSynthesisUtterance(text);
    u.rate       = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const voice  = voices.find(v => v.lang === 'ms-MY')
                || voices.find(v => v.lang.startsWith('ms'));
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    else        { u.lang = 'ms-MY'; }
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

  function startRecognition({ lang = 'en-US', onStart, onResult, onError } = {}) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (onError) onError('このブラウザは音声認識に対応していません（Chromeを推奨）');
      return null;
    }

    const rec           = new SpeechRec();
    rec.lang            = lang;
    rec.interimResults  = false;
    rec.maxAlternatives = 1;

    rec.onstart  = () => { if (onStart) onStart(); };
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };
    rec.onerror  = () => {
      if (onError) onError('認識できませんでした。もう一度試してください。');
    };

    rec.start();
    return rec;
  }

  /* ---- 類似度スコア ---- */

  function similarity(spoken, target) {
    const normalise = s => s.toLowerCase().replace(/[^a-z\s']/g, '').trim();
    const aWords = normalise(spoken).split(/\s+/).filter(Boolean);
    const bWords = normalise(target).split(/\s+/).filter(Boolean);
    if (bWords.length === 0) return 0;
    const matches = aWords.filter(w => bWords.includes(w)).length;
    return matches / Math.max(aWords.length, bWords.length);
  }

  const PASS_THRESHOLD = 0.5;

  return { speak, speakMalay, startRecognition, similarity, PASS_THRESHOLD };
})();
