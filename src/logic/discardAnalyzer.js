// ============================================================
// 切牌 / 听牌 分析器
// ─── 13 张：听牌分析 — 穷举能和的牌种及番型
// ─── 14 张：切牌推荐 — 穷举打出每张后剩余 13 张的听牌情况
// ============================================================
import { calculate } from './calculator.js';
import { ALL_TILES, getSuit, isHonor } from './tiles.js';

// ── 13 张：听牌分析 ──────────────────────────────────────
export function analyzeTenpai(hand13) {
  if (hand13.length !== 13) return { mode: 'tenpai', waitingTiles: [] };

  const countMap = {};
  for (const t of hand13) countMap[t] = (countMap[t] || 0) + 1;

  const waitingTiles = [];
  for (const tile of ALL_TILES) {
    if ((countMap[tile] || 0) >= 4) continue;
    const result = calculate([...hand13, tile], { winTile: tile });
    if (!result.valid) continue;
    waitingTiles.push({
      tile,
      totalFan: result.totalFan,
      fans: result.fans,
      tooLow: result.tooLow || false,
    });
  }

  // 达到起和的牌优先，同档按番数降序，再按牌码升序
  waitingTiles.sort((a, b) => {
    if (a.tooLow !== b.tooLow) return a.tooLow ? 1 : -1;
    return b.totalFan - a.totalFan || a.tile - b.tile;
  });

  return { mode: 'tenpai', waitingTiles };
}

// ── 启发式标签（花色/牌型特征） ────────────────────────────
function computeTags(tiles) {
  const tags = [];
  const suitCount = {};
  for (const t of tiles) {
    const s = getSuit(t);
    suitCount[s] = (suitCount[s] || 0) + 1;
  }
  const honorCount = (suitCount.wind || 0) + (suitCount.dragon || 0);
  const numericSuitsUsed = ['wan', 'tong', 'tiao'].filter(s => (suitCount[s] || 0) > 0).length;
  if (numericSuitsUsed === 1 && honorCount === 0) tags.push('qingyise');
  else if (numericSuitsUsed === 1 && honorCount > 0) tags.push('hunyise');

  const tileCounts = {};
  for (const t of tiles) tileCounts[t] = (tileCounts[t] || 0) + 1;
  if (Object.values(tileCounts).filter(c => c >= 3).length >= 3) tags.push('pengpenghu');
  if (!tiles.some(t => isHonor(t) || t % 10 === 1 || t % 10 === 9)) tags.push('duanyao');
  return tags;
}

// ── 14 张：切牌推荐 ──────────────────────────────────────
export function analyzeDiscards(hand14) {
  if (hand14.length !== 14) return { mode: 'discard', options: [] };

  const seen = new Set();
  const options = [];

  for (let i = 0; i < hand14.length; i++) {
    const tile = hand14[i];
    if (seen.has(tile)) continue;
    seen.add(tile);

    const remaining = hand14.filter((_, idx) => idx !== i);

    // 对每种候选进张牌直接调用 calculate（内含 findAllDecompositions）
    const countMap = {};
    for (const t of remaining) countMap[t] = (countMap[t] || 0) + 1;

    const waitingTiles = [];
    for (const wt of ALL_TILES) {
      if ((countMap[wt] || 0) >= 4) continue;
      const result = calculate([...remaining, wt], { winTile: wt });
      if (!result.valid) continue;
      waitingTiles.push({
        tile: wt,
        totalFan: result.totalFan,
        fans: result.fans,
        tooLow: result.tooLow || false,
      });
    }

    const ukeire = waitingTiles.length;
    const maxFan = ukeire > 0 ? Math.max(...waitingTiles.map(w => w.totalFan)) : 0;
    const avgFan = ukeire > 0
      ? Math.round(waitingTiles.reduce((s, w) => s + w.totalFan, 0) / ukeire)
      : 0;

    options.push({
      discard: tile,
      ukeire,
      waitingTiles,
      maxFan,
      avgFan,
      tags: computeTags(remaining),
    });
  }

  options.sort((a, b) => b.ukeire - a.ukeire || b.maxFan - a.maxFan);
  return { mode: 'discard', options };
}

// ── 统一入口 ──────────────────────────────────────────────
export function analyzeHand(hand) {
  if (hand.length === 13) return analyzeTenpai(hand);
  if (hand.length === 14) return analyzeDiscards(hand);
  return null;
}
