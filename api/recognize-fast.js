// ============================================================
// Vercel Serverless Function — Gemini 1.5 Flash 极速识别代理
// VIP 邀请码专属通道；BYOK 用户走 /api/recognize（Anthropic）
//
// ⚠️  安全说明：
//   GOOGLE_API_KEY 仅通过 process.env 在本文件读取，
//   严禁添加 VITE_ 前缀，严禁暴露给任何前端代码。
// ============================================================

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_BASE  = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini(apiKey, base64, mediaType, prompt, maxTokens) {
  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: mediaType, data: base64 } },
          { text: prompt },
        ],
      }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.1,   // 低温度 → 输出更确定
      },
      // 麻将图片属于无害内容，放宽安全过滤以避免误拦截
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const e = new Error(err?.error?.message || `HTTP ${response.status}`);
    e.status = response.status;
    throw e;
  }

  const data = await response.json();
  // 候选内容可能因安全策略被截断，此时 parts 为空
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const finishReason = data?.candidates?.[0]?.finishReason;
    throw new Error(finishReason === 'SAFETY' ? 'GEMINI_SAFETY_BLOCK' : 'GEMINI_EMPTY_RESPONSE');
  }
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

  // ── 读取 GOOGLE_API_KEY（仅此处，严禁前端访问）────────────────────────────
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SERVER_NO_API_KEY' });

  try {
    const text = await callGemini(apiKey, base64, mediaType, prompt, maxTokens);
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'GEMINI_ERROR' });
  }
}
