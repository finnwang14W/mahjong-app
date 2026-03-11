// ============================================================
// 手牌分解算法：找出所有合法的 4面子+1雀头 组合
// ============================================================
import { isNumeric, getSuitNum } from './tiles.js';

// 从有序数组中移除指定牌（移除一张）
function removeOne(arr, tile) {
  const idx = arr.indexOf(tile);
  if (idx === -1) return null;
  const next = [...arr];
  next.splice(idx, 1);
  return next;
}

// 递归找出所有合法面子组合，返回 meld[][] 或空数组
function findAllMelds(tiles) {
  if (tiles.length === 0) return [[]];
  if (tiles.length % 3 !== 0) return [];

  const sorted = [...tiles].sort((a, b) => a - b);
  const first = sorted[0];
  const results = [];

  // 尝试刻子（三张相同）
  if (sorted.length >= 3 && sorted[1] === first && sorted[2] === first) {
    const rest = sorted.slice(3);
    for (const sub of findAllMelds(rest)) {
      results.push([{ type: 'triplet', tile: first }, ...sub]);
    }
  }

  // 尝试顺子（三张连续同花色数字牌）
  if (isNumeric(first)) {
    const suit = getSuitNum(first);
    const rank = first % 10;
    if (rank <= 7) {
      const s2 = first + 1;
      const s3 = first + 2;
      if (getSuitNum(s2) === suit && getSuitNum(s3) === suit) {
        let rest = removeOne(sorted.slice(1), s2);
        if (rest !== null) {
          rest = removeOne(rest, s3);
          if (rest !== null) {
            for (const sub of findAllMelds(rest)) {
              results.push([{ type: 'sequence', tiles: [first, s2, s3] }, ...sub]);
            }
          }
        }
      }
    }
  }

  return results;
}

// 标准手型分解：4面子+1雀头
export function findRegularDecompositions(tiles) {
  const sorted = [...tiles].sort((a, b) => a - b);
  const decomps = [];
  const triedPairs = new Set();

  for (let i = 0; i < sorted.length - 1; i++) {
    const tile = sorted[i];
    if (triedPairs.has(tile)) continue;
    if (sorted[i + 1] === tile) {
      triedPairs.add(tile);
      const remaining = [...sorted.slice(0, i), ...sorted.slice(i + 2)];
      for (const melds of findAllMelds(remaining)) {
        decomps.push({ type: 'regular', pair: tile, melds });
      }
    }
  }

  return decomps;
}

// 七对检查
export function checkSevenPairs(tiles) {
  const sorted = [...tiles].sort((a, b) => a - b);
  if (sorted.length !== 14) return null;
  const pairs = [];
  for (let i = 0; i < 14; i += 2) {
    if (sorted[i] !== sorted[i + 1]) return null;
    pairs.push(sorted[i]);
  }
  return { type: 'seven_pairs', pairs };
}

// 连七对检查（七张连续数字牌各两张）
export function checkConsecutiveSevenPairs(tiles) {
  const sorted = [...tiles].sort((a, b) => a - b);
  if (sorted.length !== 14) return null;
  const pairs = [];
  for (let i = 0; i < 14; i += 2) {
    if (sorted[i] !== sorted[i + 1]) return null;
    pairs.push(sorted[i]);
  }
  // 七对中的7张唯一牌，要连续且同花色
  if (pairs.length !== 7) return null;
  if (!isNumeric(pairs[0])) return null;
  const suit = getSuitNum(pairs[0]);
  for (let i = 0; i < 7; i++) {
    if (getSuitNum(pairs[i]) !== suit) return null;
    if (i > 0 && pairs[i] !== pairs[i - 1] + 1) return null;
  }
  return { type: 'consecutive_seven_pairs', pairs };
}

// 十三幺检查
export function checkThirteenOrphans(tiles) {
  const sorted = [...tiles].sort((a, b) => a - b);
  if (sorted.length !== 14) return null;
  const required = [11, 19, 21, 29, 31, 39, 41, 42, 43, 44, 45, 46, 47];
  const counts = {};
  for (const t of sorted) counts[t] = (counts[t] || 0) + 1;

  let pairTile = null;
  for (const t of required) {
    if (!counts[t]) return null;
    if (counts[t] === 2) {
      if (pairTile) return null; // 不能有两张对子
      pairTile = t;
    }
  }
  if (!pairTile) return null;
  // 确认总牌数正确
  return { type: 'thirteen_orphans', pairTile };
}

// 七星不靠检查（7种荣誉牌各一张 + 3种花色各取一套不含顺子的牌）
// 实际规则：每门数字牌中满足不靠，7种字牌各一张，共14张
export function checkSevenStars(tiles) {
  const sorted = [...tiles].sort((a, b) => a - b);
  if (sorted.length !== 14) return null;
  // 必须包含7种字牌各一张
  const honors = [41, 42, 43, 44, 45, 46, 47];
  const counts = {};
  for (const t of sorted) counts[t] = (counts[t] || 0) + 1;
  for (const h of honors) {
    if (counts[h] !== 1) return null;
  }
  // 剩余7张数字牌，不能有顺子，不能有对子
  const numericTiles = sorted.filter(t => isNumeric(t));
  if (numericTiles.length !== 7) return null;
  // 每张都不重复
  const numSet = new Set(numericTiles);
  if (numSet.size !== 7) return null;
  // 覆盖3种花色，且满足「不靠」：每种花色取1,4,7或2,5,8或3,6,9之一
  const wanTiles = numericTiles.filter(t => getSuitNum(t) === 1).map(t => t % 10).sort((a, b) => a - b);
  const tongTiles = numericTiles.filter(t => getSuitNum(t) === 2).map(t => t % 10).sort((a, b) => a - b);
  const tiaoTiles = numericTiles.filter(t => getSuitNum(t) === 3).map(t => t % 10).sort((a, b) => a - b);

  const validPatterns = [[1, 4, 7], [2, 5, 8], [3, 6, 9]];
  const wanOk = wanTiles.length === 0 || validPatterns.some(p =>
    wanTiles.every(r => p.includes(r)) && p.filter(r => wanTiles.includes(r)).length === wanTiles.length
  );
  const tongOk = tongTiles.length === 0 || validPatterns.some(p =>
    tongTiles.every(r => p.includes(r)) && p.filter(r => tongTiles.includes(r)).length === tongTiles.length
  );
  const tiaoOk = tiaoTiles.length === 0 || validPatterns.some(p =>
    tiaoTiles.every(r => p.includes(r)) && p.filter(r => tiaoTiles.includes(r)).length === tiaoTiles.length
  );

  if (!wanOk || !tongOk || !tiaoOk) return null;
  // 总数字牌数必须是三种花色的组合，不能在同一种花色取超过3张
  if (wanTiles.length > 3 || tongTiles.length > 3 || tiaoTiles.length > 3) return null;
  return { type: 'seven_stars' };
}

// 全不靠检查（不含七星不靠，即字牌数量 < 7 种）
export function checkKnitted(tiles) {
  const sorted = [...tiles].sort((a, b) => a - b);
  if (sorted.length !== 14) return null;

  // 所有牌必须唯一（无对子/刻子）
  const counts = {};
  for (const t of sorted) counts[t] = (counts[t] || 0) + 1;
  if (Object.values(counts).some(c => c > 1)) return null;

  const numericTiles = sorted.filter(t => isNumeric(t));
  const honorTiles = sorted.filter(t => !isNumeric(t));

  // 字牌种类：若有 7 种字牌全部，则由七星不靠处理
  const honorTypes = new Set(honorTiles);
  const allSevenHonors = [41,42,43,44,45,46,47];
  if (allSevenHonors.every(h => honorTypes.has(h)) && honorTiles.length === 7) return null;

  // 数字牌按花色分组，必须覆盖至少 2 门花色
  const wanRanks = numericTiles.filter(t => getSuitNum(t) === 1).map(t => t % 10);
  const tongRanks = numericTiles.filter(t => getSuitNum(t) === 2).map(t => t % 10);
  const tiaoRanks = numericTiles.filter(t => getSuitNum(t) === 3).map(t => t % 10);

  const numSuits = [wanRanks, tongRanks, tiaoRanks].filter(r => r.length > 0).length;
  if (numSuits < 2) return null; // 至少 2 门花色

  const validPatterns = [[1,4,7],[2,5,8],[3,6,9]];
  const isValidPattern = (ranks) => {
    if (ranks.length === 0) return true;
    return validPatterns.some(p => ranks.every(r => p.includes(r)));
  };

  if (!isValidPattern(wanRanks)) return null;
  if (!isValidPattern(tongRanks)) return null;
  if (!isValidPattern(tiaoRanks)) return null;

  return { type: 'knitted' };
}

// 所有分解（包含特殊手型）
export function findAllDecompositions(tiles) {
  const results = [];

  // 特殊手型优先
  const orphans = checkThirteenOrphans(tiles);
  if (orphans) results.push(orphans);

  const consec7 = checkConsecutiveSevenPairs(tiles);
  if (consec7) results.push(consec7);

  const seven7 = checkSevenPairs(tiles);
  if (seven7 && !consec7) results.push(seven7); // 连七对不重复算七对

  const sevenStars = checkSevenStars(tiles);
  if (sevenStars) results.push(sevenStars);

  const knitted = checkKnitted(tiles);
  if (knitted) results.push(knitted);

  // 标准手型
  const regular = findRegularDecompositions(tiles);
  results.push(...regular);

  return results;
}
