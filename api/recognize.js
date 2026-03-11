// ============================================================
// Vercel Serverless Function — 安全代理 Anthropic Vision API
// 优先级：① 用户自带 Key (BYOK)  ② VIP邀请码 + 服务器 Key
// model: 'haiku' → claude-haiku-4-5（极速）/ 默认 claude-sonnet-4-6（精准）
// ============================================================

// 白名单：只允许指定的模型标识符
const MODEL_MAP = {
  haiku: 'claude-haiku-4-5',
  sonnet: 'claude-sonnet-4-6',
};

async function callAnthropic(apiKey, base64, mediaType, prompt, maxTokens, modelKey) {
  const model = MODEL_MAP[modelKey] ?? 'claude-sonnet-4-6';
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const e = new Error(err?.error?.message || `HTTP ${response.status}`);
    e.status = response.status;
    throw e;
  }

  const data = await response.json();
  return data?.content?.[0]?.text ?? '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { base64, mediaType, prompt, maxTokens, model } = req.body ?? {};
  if (!base64 || !mediaType || !prompt || !maxTokens) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (typeof base64 !== 'string' || base64.length > 4 * 1024 * 1024) {
    return res.status(413).json({ error: 'Image too large' });
  }

  // ── 优先级 ① BYOK：用户自带 Key ──────────────────────────
  const userApiKey = req.headers['x-user-api-key'];
  if (userApiKey) {
    try {
      const text = await callAnthropic(userApiKey, base64, mediaType, prompt, maxTokens, model);
      return res.status(200).json({ text });
    } catch (e) {
      if (e.status === 401) return res.status(400).json({ error: 'INVALID_USER_API_KEY' });
      return res.status(500).json({ error: e.message || 'ANTHROPIC_ERROR' });
    }
  }

  // ── 优先级 ② VIP邀请码 + 服务器 Key ──────────────────────
  const expectedCode = process.env.APP_ACCESS_CODE;
  if (expectedCode) {
    const submittedCode = req.headers['x-access-code'];
    if (submittedCode !== expectedCode) {
      return res.status(401).json({ error: 'INVALID_PASSCODE' });
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SERVER_NO_API_KEY' });

  try {
    const text = await callAnthropic(apiKey, base64, mediaType, prompt, maxTokens, model);
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
}
