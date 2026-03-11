// ============================================================
// 麻将识别前端逻辑 — 双模型路由（每路均为单次 API 调用）
//
// VIP 邀请码用户：
//   极速臂 → /api/analyze-fast   (Gemini 1.5 Flash, 单步)
//   精准臂 → /api/analyze-refine (GPT-4o,  单步合并计数+识别)
//
// BYOK 用户（自带 Anthropic Key）：
//   极速臂 → /api/recognize?model=haiku  (Claude Haiku, 单步)
//   精准臂 → /api/recognize              (Claude Sonnet, 单步)
//
// ⚠️  所有 API Key 由后端 process.env 读取，前端不持有任何服务商 Key。
// ============================================================

const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const MAX_DIM = 1920;

const VALID_TILES = new Set([
  11,12,13,14,15,16,17,18,19,
  21,22,23,24,25,26,27,28,29,
  31,32,33,34,35,36,37,38,39,
  41,42,43,44,
  45,46,47,
]);

// ── Prompt：Anthropic / Gemini（极速，通用格式）──────────────
function buildFastPrompt() {
  return `Identify each mahjong tile from LEFT to RIGHT. Look ONLY inside each tile's own border.

Tile types:
- 万 wan (codes 11–19): Chinese character "万" plus 一/二/三/四/五/六/七/八/九
- 筒 tong (codes 21–29): concentric rings — COUNT circles precisely (1=21 … 9=29)
- 条 tiao (codes 31–39): bamboo sticks — 31=one BIRD image; 32=2 sticks … 39=9 sticks
- 风 wind: 东=41  南=42  西=43  北=44
- 箭 honor: 中(red)=45  发(green)=46  白(blank)=47

Output ONLY valid JSON, no explanation:
{"tiles": [code1, code2, ...]}`;
}

// ── 解析 JSON 结果 ────────────────────────────────────────────
function parseTilesJson(text) {
  const match = text.match(/\{[\s\S]*"tiles"[\s\S]*\}/);
  if (!match) throw new Error('PARSE_ERROR');
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed.tiles)) throw new Error('PARSE_ERROR');
  return parsed.tiles.filter(t => VALID_TILES.has(t));
}

// ── 极速臂（前端并行双请求的 Fast 分支）──────────────────────
//   VIP  → Gemini 1.5 Flash 单步
//   BYOK → Claude Haiku 单步
export async function recognizeTilesFast(imageFile, passcode, userApiKey) {
  const { base64, mediaType } = await getImageData(imageFile);
  const prompt = buildFastPrompt();

  if (userApiKey) {
    // BYOK：Anthropic Haiku，返回文本字符串，由 parseTilesJson 解析
    const text = await callAnthropicBackend(base64, mediaType, prompt, 400, userApiKey, 'haiku');
    return parseTilesJson(text);
  }

  // VIP：后端已完成 JSON 解析，callProviderBackend 直接返回 tiles 数组
  return callProviderBackend('/api/analyze-fast', base64, mediaType, prompt, 400, passcode);
}

// ── 精准臂（前端并行双请求的 Refine 分支）────────────────────
//   VIP  → GPT-4o 单步（合并计数+识别，prompt 内嵌在后端）
//   BYOK → Claude Sonnet 单步
export async function recognizeTiles(imageFile, passcode, userApiKey) {
  const { base64, mediaType } = await getImageData(imageFile);

  if (userApiKey) {
    // BYOK：Anthropic Sonnet 单步，返回文本字符串，由 parseTilesJson 解析
    const text = await callAnthropicBackend(base64, mediaType, buildFastPrompt(), 600, userApiKey, 'sonnet');
    return parseTilesJson(text);
  }

  // VIP：后端已完成 JSON 解析，callRefineBackend 直接返回 tiles 数组
  return callRefineBackend('/api/analyze-refine', base64, mediaType, 700, passcode);
}

// ── 后端调用：BYOK（Anthropic）─────────────────────────────────
async function callAnthropicBackend(base64, mediaType, prompt, maxTokens, userApiKey, model) {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-api-key': userApiKey,
  };
  const response = await fetch('/api/recognize', {
    method: 'POST',
    headers,
    body: JSON.stringify({ base64, mediaType, prompt, maxTokens, model }),
  });
  return handleBackendResponse(response);
}

// ── 后端调用：VIP 极速（Gemini，后端已完成 JSON 解析）──────────
// 后端直接返回 { tiles: [...] }，此处直接取数组，不经 parseTilesJson
async function callProviderBackend(endpoint, base64, mediaType, prompt, maxTokens, passcode) {
  const headers = { 'Content-Type': 'application/json' };
  if (passcode) headers['x-access-code'] = passcode;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ base64, mediaType, prompt, maxTokens }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401 || err.error === 'INVALID_PASSCODE')
      throw new Error('INVALID_PASSCODE');
    if (err.error === 'SERVER_NO_API_KEY') throw new Error('API_KEY_NOT_SET');
    if (err.error === 'PARSE_ERROR')       throw new Error('PARSE_ERROR');
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data?.tiles)) throw new Error('PARSE_ERROR');
  return data.tiles.filter(t => VALID_TILES.has(t));
}

// ── 后端调用：VIP 精准（GPT-5.4，后端已完成 JSON 解析）─────────
// 后端直接返回 { tiles: [...] }，此处直接取数组，不经 parseTilesJson
// accessCode 同时写入 header 和 body，确保鉴权字段完整传达
async function callRefineBackend(endpoint, base64, mediaType, maxTokens, passcode) {
  const headers = { 'Content-Type': 'application/json' };
  if (passcode) headers['x-access-code'] = passcode;
  const body = { base64, mediaType, maxTokens };
  if (passcode) body.accessCode = passcode;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401 || err.error === 'INVALID_PASSCODE')
      throw new Error('INVALID_PASSCODE');
    if (err.error === 'SERVER_NO_API_KEY') throw new Error('API_KEY_NOT_SET');
    if (err.error === 'PARSE_ERROR')       throw new Error('PARSE_ERROR');
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  const data = await response.json();
  // 后端返回 { tiles: [...] }，直接校验并过滤
  if (!Array.isArray(data?.tiles)) throw new Error('PARSE_ERROR');
  return data.tiles.filter(t => VALID_TILES.has(t));
}

// ── 统一响应处理 ───────────────────────────────────────────────
async function handleBackendResponse(response) {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401 || err.error === 'INVALID_PASSCODE')
      throw new Error('INVALID_PASSCODE');
    if (err.error === 'INVALID_USER_API_KEY') throw new Error('INVALID_USER_API_KEY');
    if (err.error === 'SERVER_NO_API_KEY')    throw new Error('API_KEY_NOT_SET');
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.text ?? '';
}

// ── 图片预处理（压缩 + JPEG 转换）──────────────────────────────
async function getImageData(file) {
  try {
    const base64 = await canvasToJpeg(file);
    return { base64, mediaType: 'image/jpeg' };
  } catch {
    const { base64, mediaType } = await readFileAsBase64(file);
    if (!SUPPORTED_TYPES.has(mediaType))
      throw new Error(`不支持的图片格式（${mediaType}），请选择 JPEG 或 PNG 图片`);
    return { base64, mediaType };
  }
}

function canvasToJpeg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w0 = img.naturalWidth, h0 = img.naturalHeight;
      if (w0 === 0 || h0 === 0) { reject(new Error('0x0 image')); return; }
      const ratio = Math.min(1, MAX_DIM / Math.max(w0, h0));
      const w = Math.round(w0 * ratio), h = Math.round(h0 * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.filter = 'contrast(1.15) saturate(1.1)';
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      if (!dataUrl || dataUrl === 'data:,') { reject(new Error('canvas empty')); return; }
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img load failed')); };
    img.src = url;
  });
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const m = e.target.result.match(/^data:([^;]+);base64,(.+)$/s);
      if (!m) { reject(new Error('read failed')); return; }
      resolve({ mediaType: m[1], base64: m[2] });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
