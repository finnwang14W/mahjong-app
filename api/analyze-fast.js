// ============================================================
// Vercel Serverless Function — Gemini 3.1 Pro Preview 极速通道
// 单次 API 调用，VIP 邀请码专属（BYOK 走 /api/recognize）
// 后端完成 JSON 解析，直接返回 { tiles: [...] }
//
// ⚠️  安全：GOOGLE_API_KEY 仅通过 process.env 读取，
//          严禁添加 VITE_ 前缀，严禁暴露给前端。
// ============================================================

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent';

async function callGemini(apiKey, base64, mediaType, prompt, maxTokens) {
  const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [
        { inline_data: { mime_type: mediaType, data: base64 } },
        { text: prompt },
      ]}],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.1 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err?.error?.message || `HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(data?.candidates?.[0]?.finishReason || 'GEMINI_EMPTY');
  return text;
}

// 连续解析，直到拿到包含 tiles 数组的对象（最多 3 次，防止套娃）
function extractTiles(raw) {
  let value = raw;
  for (let i = 0; i < 3; i++) {
    if (value && typeof value === 'object' && Array.isArray(value.tiles)) return value;
    if (typeof value !== 'string') break;
    const match = value.match(/\{[\s\S]*"tiles"[\s\S]*\}/);
    if (!match) break;
    value = JSON.parse(match[0]);
  }
  throw new SyntaxError('tiles array not found after parsing');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { base64, mediaType, prompt, maxTokens } = req.body ?? {};
  if (!base64 || !mediaType || !prompt || !maxTokens)
    return res.status(400).json({ error: 'Missing required fields' });
  if (typeof base64 !== 'string' || base64.length > 4 * 1024 * 1024)
    return res.status(413).json({ error: 'Image too large' });

  // VIP 邀请码校验
  const expectedCode = process.env.APP_ACCESS_CODE;
  if (expectedCode && req.headers['x-access-code'] !== expectedCode)
    return res.status(401).json({ error: 'INVALID_PASSCODE' });

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SERVER_NO_API_KEY' });

  try {
    const rawText = await callGemini(apiKey, base64, mediaType, prompt, maxTokens);

    let parsed;
    try {
      parsed = extractTiles(rawText);
    } catch (parseErr) {
      console.error('BACKEND_ERROR:', parseErr.message, '| raw:', rawText.slice(0, 300));
      return res.status(422).json({ error: 'PARSE_ERROR' });
    }

    return res.status(200).json(parsed); // { tiles: [...] }
  } catch (e) {
    console.error('BACKEND_ERROR:', e.message);
    return res.status(500).json({ error: e.message || 'GEMINI_ERROR' });
  }
}
