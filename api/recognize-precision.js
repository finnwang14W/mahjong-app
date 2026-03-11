// ============================================================
// Vercel Serverless Function — GPT-4o 精准识别代理
// VIP 邀请码专属通道；BYOK 用户走 /api/recognize（Anthropic）
//
// ⚠️  安全说明：
//   OPENAI_API_KEY 仅通过 process.env 在本文件读取，
//   严禁添加 VITE_ 前缀，严禁暴露给任何前端代码。
// ============================================================

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL    = 'gpt-4o';

async function callOpenAI(apiKey, base64, mediaType, prompt, maxTokens) {
  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: maxTokens,
      temperature: 0.1,     // 低温度 → 输出更确定
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mediaType};base64,${base64}`,
              detail: 'high',  // 高分辨率分析，对6/9筒等易混淆牌效果显著
            },
          },
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
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OPENAI_EMPTY_RESPONSE');
  return text;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { base64, mediaType, prompt, maxTokens } = req.body ?? {};
  if (!base64 || !mediaType || !prompt || !maxTokens) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (typeof base64 !== 'string' || base64.length > 4 * 1024 * 1024) {
    return res.status(413).json({ error: 'Image too large' });
  }

  // ── VIP 邀请码校验（此端点不支持 BYOK，BYOK 走 /api/recognize）─────────────
  const expectedCode = process.env.APP_ACCESS_CODE;
  if (expectedCode) {
    const submittedCode = req.headers['x-access-code'];
    if (submittedCode !== expectedCode) {
      return res.status(401).json({ error: 'INVALID_PASSCODE' });
    }
  }

  // ── 读取 OPENAI_API_KEY（仅此处，严禁前端访问）───────────────────────────
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SERVER_NO_API_KEY' });

  try {
    const text = await callOpenAI(apiKey, base64, mediaType, prompt, maxTokens);
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'OPENAI_ERROR' });
  }
}
