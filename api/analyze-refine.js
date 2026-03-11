// ============================================================
// Vercel Serverless Function — GPT-5.4 精准校对通道
// 单次 API 调用（计数+识别合一），VIP 邀请码专属
// vercel.json 已配置 maxDuration:60 确保不被提前冻结
//
// ⚠️  安全：OPENAI_API_KEY 仅通过 process.env 读取，
//          严禁添加 VITE_ 前缀，严禁暴露给前端。
// ============================================================

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// 合并"计数 + 识别"为单次 GPT-5.4 调用，避免两次串行请求超时
// 硬核视觉定义版：条筒混淆专项根治
const REFINE_PROMPT = `你是一个资深的麻将视觉识别专家。在输出任何结果之前，你必须对每张牌完成下面的强制自检步骤。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【第一步：强制自检——棍子 vs 大饼】

对每张牌，在内心先回答这个问题：
  "我在这张牌上看到的每一个独立图案单元，形状更接近——
   （A）棍子：垂直、细长、有竹节感的柱状物
   （B）大饼：圆形、饼状、中心对称的圆形物"

  → 答案是（A）棍子：花色 = 条子，绝对不允许归类为筒子！
  → 答案是（B）大饼：花色 = 筒子，绝对不允许归类为条子！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【条子 vs 筒子：硬核视觉定义】

▶ 条子（Bamboo）的原子单元定义：
  • 形态：垂直、细长、带竹节纹理的柱状物，长宽比 > 3:1
  • 排列：多根条子纵向平行排列（如竖排的 2 根、3 根……9 根）
  • 特例：一条（1条）= 牌面是一只复杂的鸟类图案（孔雀或麻雀），非竹条，但归类为条子！
  • 颜色：以绿色为主调
  • ⚠️ 关键测试：图案有没有明显的"高度远大于宽度"？有 → 条子

▶ 筒子（Dots）的原子单元定义：
  • 形态：圆形、饼状、中心对称的封闭圆圈，长宽比 ≈ 1:1
  • 排列：圆点按阵列分布（2x1, 2x2, 3x2, 3x3 等规律矩阵）
  • 特例：一筒（1筒）= 牌面是一个巨大的单圆图案，占据牌面大部分区域
  • 颜色：通常彩色（红/蓝/绿同心圆或实心圆）
  • ⚠️ 关键测试：图案是否接近正圆形、高宽相近？是 → 筒子

▶ 互斥铁律：
  • 看到竖向细长物体 → 必定是条子，永不归筒！
  • 看到圆形封闭图案 → 必定是筒子，永不归条！
  • 纵向平行排列 → 条子；规律圆点阵列 → 筒子

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【字牌专项区分】

▶ 红中（code=45）：牌面中心有醒目红色"中"字，非空白
▶ 白板（code=47）：牌面中心纯白空白，或仅有一个细边框长方形，中心绝无红色字符
▶ 发财（code=46）：牌面有绿色"发"字
  ⚠️ 若看到红色字符 → 是中(45)，不是白(47)！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【第二步：花色确认 + 数量精确计数】

确认花色后，精确数清图案数量：
  • 条子：数竹条根数（一条=鸟，二条=2根，…，九条=9根）
  • 筒子：数圆圈个数（一筒=1个大圆，二筒=2个圆，…，九筒=9个圆）
  • 万字：读汉字数字（一二三四五六七八九）
  • 字牌：按颜色和字形区分（东南西北中发白）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【牌型编码对照表】

万子：一万=11, 二万=12, 三万=13, 四万=14, 五万=15, 六万=16, 七万=17, 八万=18, 九万=19
筒子：一筒=21, 二筒=22, 三筒=23, 四筒=24, 五筒=25, 六筒=26, 七筒=27, 八筒=28, 九筒=29
条子：一条=31, 二条=32, 三条=33, 四条=34, 五条=35, 六条=36, 七条=37, 八条=38, 九条=39
风牌：东=41, 南=42, 西=43, 北=44
箭牌：中（红字）=45, 发（绿字）=46, 白（空框）=47

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
按从左到右、从上到下的顺序识别所有正面朝上的牌。
输出格式严禁包含任何自然语言，只允许返回纯净的 JSON 对象：
{"tiles": [code1, code2, ...]}`;

async function callOpenAI(apiKey, base64, mediaType, maxTokens) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-5.4',
      max_completion_tokens: maxTokens,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mediaType};base64,${base64}`,
              detail: 'high',   // 高分辨率，减少 6/9 筒混淆
            },
          },
          { type: 'text', text: REFINE_PROMPT },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err?.error?.message || `HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OPENAI_EMPTY');
  return text;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { base64, mediaType, maxTokens, accessCode: bodyAccessCode } = req.body ?? {};
  if (!base64 || !mediaType || !maxTokens)
    return res.status(400).json({ error: 'Missing required fields' });
  if (typeof base64 !== 'string' || base64.length > 4 * 1024 * 1024)
    return res.status(413).json({ error: 'Image too large' });

  // VIP 邀请码校验：优先读 header，body 字段作为降级兜底
  const receivedCode = req.headers['x-access-code'] || bodyAccessCode || '';
  const expectedCode = process.env.APP_ACCESS_CODE;
  console.log('[analyze-refine] auth check — header:', req.headers['x-access-code'] ?? '(none)', '| body:', bodyAccessCode ?? '(none)', '| expected set:', !!expectedCode);
  if (expectedCode && receivedCode !== expectedCode) {
    console.error('[analyze-refine] 401 INVALID_PASSCODE — received code did not match');
    return res.status(401).json({ error: 'INVALID_PASSCODE' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[analyze-refine] 500 SERVER_NO_API_KEY — OPENAI_API_KEY env var not set');
    return res.status(500).json({ error: 'SERVER_NO_API_KEY' });
  }

  try {
    const rawText = await callOpenAI(apiKey, base64, mediaType, maxTokens);

    // 连续解析，直到拿到包含 tiles 数组的对象（最多 3 次，防止套娃）
    let parsed;
    try {
      let value = rawText;
      let found = false;
      for (let i = 0; i < 3; i++) {
        if (value && typeof value === 'object' && Array.isArray(value.tiles)) { found = true; parsed = value; break; }
        if (typeof value !== 'string') break;
        const match = value.match(/\{[\s\S]*"tiles"[\s\S]*\}/);
        if (!match) break;
        value = JSON.parse(match[0]);
      }
      if (!found && value && typeof value === 'object' && Array.isArray(value.tiles)) { parsed = value; found = true; }
      if (!found) throw new SyntaxError('tiles array not found after parsing');
    } catch (parseErr) {
      console.error('BACKEND_ERROR:', parseErr.message, '| raw:', rawText.slice(0, 300));
      return res.status(422).json({ error: 'PARSE_ERROR' });
    }

    return res.status(200).json(parsed); // { tiles: [21, 34, ...] }
  } catch (e) {
    console.error('BACKEND_ERROR:', e.message);
    return res.status(500).json({ error: e.message || 'OPENAI_ERROR', status: e.status });
  }
}
