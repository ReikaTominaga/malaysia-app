/* ============================================================
   roleplay.js — AI Roleplay module
   Scenario selection, chat, Anthropic API calls, feedback
   ============================================================ */

'use strict';

const Roleplay = (() => {

  /* ---- Render scenario selection ---- */

  function renderSceneSelect() {
    const grid = document.getElementById('scenarioGrid');
    if (!grid) return;
    grid.innerHTML = SCENARIOS.map(s => `
      <div class="scenario-card" onclick="Roleplay.selectScenario('${s.id}')">
        <div class="scenario-card__icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </div>`).join('');
  }

  /* ---- Select a scenario & start chat ---- */

  function selectScenario(id) {
    const apiKey = _getApiKey();
    if (!apiKey) {
      document.getElementById('apiWarning').classList.add('is-visible');
      return;
    }
    document.getElementById('apiWarning').classList.remove('is-visible');

    AppState.currentScenario = SCENARIOS.find(s => s.id === id);
    AppState.chatHistory     = [];

    document.getElementById('roleplaySceneSelect').style.display = 'none';
    document.getElementById('roleplayChatArea').style.display    = 'block';

    document.getElementById('currentSceneBadge').textContent = AppState.currentScenario.title;
    document.getElementById('chatSceneName').textContent     = AppState.currentScenario.title;
    document.getElementById('chatMessages').innerHTML        = '';
    document.getElementById('feedbackBox').innerHTML =
      '<h4>フィードバック</h4><p class="feedback-box__hint">会話すると自動でフィードバックが表示されます。</p>';

    // Prompt tags
    const tags = document.getElementById('promptTags');
    if (tags) tags.innerHTML = AppState.currentScenario.prompts
      .map(p => `<span class="prompt-tag" onclick="Roleplay.usePrompt('${p}')">${p}</span>`)
      .join('');

    _startChat();
  }

  function backToSceneSelect() {
    document.getElementById('roleplaySceneSelect').style.display = 'block';
    document.getElementById('roleplayChatArea').style.display    = 'none';
    AppState.chatHistory     = [];
    AppState.currentScenario = null;
  }

  function usePrompt(text) {
    const input = document.getElementById('chatInput');
    if (input) { input.value = text; input.focus(); }
  }

  /* ---- Chat ---- */

  async function _startChat() {
    const sc = AppState.currentScenario;
    _addBubble('system', `シーン: ${sc.title} — 英語で話しかけてみましょう！`);
    await _callAPI({ isStart: true });
  }

  function handleInputKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text  = (input ? input.value : '').trim();
    if (!text) return;
    input.value = '';
    _addBubble('user', text);
    AppState.chatHistory.push({ role: 'user', content: text });
    await _callAPI({ isStart: false });
  }

  /* ---- Anthropic API call ---- */

  async function _callAPI({ isStart }) {
    const apiKey = _getApiKey();
    const sc     = AppState.currentScenario;
    const role   = SCENARIO_ROLES[sc.id] || 'a local Malaysian person';

    const systemPrompt = `You are a roleplay partner for a Japanese traveler practicing English before visiting Malaysia.
You are playing the role of ${role}.
Speak natural English at an intermediate level. Keep each response to 2-3 sentences maximum.
After every 2nd user message (count from the first user message), append ONE short Japanese feedback line starting exactly with "【FB】" on a new line.
The feedback should focus ONLY on: naturalness of expression, better phrasing options, or communication style. Do NOT comment on spelling or grammar rules.
Example feedback: 【FB】"Could I have ~?" はより丁寧な注文表現です。今の言い方でも十分通じます。`;

    const messages = isStart
      ? [{ role: 'user', content: '会話を始めてください。自然な英語の挨拶から始めて。' }]
      : AppState.chatHistory;

    _setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type':     'application/json',
          'x-api-key':        apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system:     systemPrompt,
          messages,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const reply       = data.content[0].text;
      const usage       = data.usage || {};
      const inputToks   = usage.input_tokens  || 0;
      const outputToks  = usage.output_tokens || 0;

      // Track cost
      Cost.addUsage(inputToks, outputToks);

      // Split feedback marker
      const fbIdx   = reply.indexOf('【FB】');
      const mainMsg = fbIdx !== -1 ? reply.substring(0, fbIdx).trim() : reply.trim();
      const fbText  = fbIdx !== -1 ? reply.substring(fbIdx + 5).trim() : null;

      if (mainMsg) {
        _addBubble('ai', mainMsg);
        AppState.chatHistory.push({ role: 'assistant', content: reply });
      }
      if (fbText) _addFeedback(fbText);

    } catch (err) {
      _addBubble('system', 'エラー: ' + err.message);
    }

    _setLoading(false);
  }

  /* ---- DOM helpers ---- */

  function _addBubble(role, text) {
    const msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    const wrap   = document.createElement('div');
    wrap.className = `chat-msg-wrap ${role === 'user' ? 'is-user' : ''}`;
    const bubble   = document.createElement('div');
    bubble.className = `chat-bubble chat-bubble--${role}`;
    bubble.textContent = text;
    wrap.appendChild(bubble);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function _addFeedback(text) {
    const box = document.getElementById('feedbackBox');
    if (!box) return;
    const hint = box.querySelector('.feedback-box__hint');
    if (hint) hint.remove();
    const item = document.createElement('div');
    item.className = 'feedback-item feedback-item--suggest';
    item.innerHTML = `<div class="feedback-item__label">💡 アドバイス</div>${text}`;
    box.appendChild(item);
  }

  function _setLoading(on) {
    const loading = document.getElementById('chatLoading');
    const sendBtn = document.getElementById('sendBtn');
    if (loading) loading.style.display = on ? 'flex' : 'none';
    if (sendBtn) sendBtn.disabled = on;
  }

  function _getApiKey() {
    const el = document.getElementById('apiKeyInput');
    return el ? el.value.trim() : '';
  }

  return {
    renderSceneSelect,
    selectScenario,
    backToSceneSelect,
    usePrompt,
    handleInputKey,
    sendMessage,
  };
})();
