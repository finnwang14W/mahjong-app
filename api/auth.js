// ============================================================
// Vercel Serverless Function — 邀请码验证
// 不调用大模型，仅做字符串比对，极轻量
// ============================================================

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const expected = process.env.APP_ACCESS_CODE;

  // 若服务器未配置邀请码 → 开放模式（本地开发友好）
  if (!expected) {
    return res.status(200).json({ ok: true, mode: 'open' });
  }

  const submitted = req.headers['x-access-code'] || req.body?.passcode;

  if (submitted === expected) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'INVALID_PASSCODE' });
}
