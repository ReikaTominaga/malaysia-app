/* ============================================================
   speech.js — Web Speech API wrapper + Malay TTS
   英語: ブラウザ内蔵の高品質音声
   マレー語: Google Translate TTS（最優先） → ブラウザ内蔵（フォールバック）
   ※ ResponsiveVoice無料版はマレー語の音質が低いため使用しない
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

    /* ① Chrome内蔵の高品質マレー語音声を試みる */
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();

      // Chrome の "Google Bahasa Malaysia" は高品質オンライン音声
      const googleMs = voices.find(v => v.name === 'Google Bahasa Malaysia')
                    || voices.find(v => v.name.toLowerCase().includes('malay'))
                    || voices.find(v => v.lang === 'ms-MY' && v.name.toLowerCase().includes('google'))
                    || voices.find(v => v.lang === 'ms-MY')
                    || voices.find(v => v.lang.startsWith('ms'));

      if (googleMs) {
        window.speechSynthesis.cancel();
        const u  = new SpeechSynthesisUtterance(text);
        u.voice  = googleMs;
        u.lang   = googleMs.lang;
        u.rate   = 0.85;
        window.speechSynthesis.speak(u);
        return;
      }
    }

    /* ② Chrome にマレー語音声がない場合 → Google Translate TTS */
    _googleTTS(text);
  }

  /* Google Translate TTS — Google翻訳と同じ音声エンジン */
  function _googleTTS(text) {
    const url = 'https://translate.googleapis.com/translate_tts'
      + '?ie=UTF-8'
      + '&q='     + encodeURIComponent(text)
      + '&tl=ms'
      + '&client=tw-ob';

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
    const u  = new SpeechSynthesisUtterance(text);
    u.rate   = 0.85;
    u.lang   = 'ms-MY';
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
