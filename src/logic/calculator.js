// ============================================================
// 国标麻将算分主引擎
// ============================================================
import { findAllDecompositions } from './decompose.js';
import { FAN_RULES } from './fanRules.js';
import { isTerminalOrHonor, isDragon, isWind } from './tiles.js';

// 不属于"起和番型"的基础番（用于判断无番和）
const BASE_FAN_NAMES = new Set(['自摸','花牌','明杠','暗杠']);

// 根据胡牌张和分解方案自动检测候牌类型
function detectWaitType(winTile, decomp) {
  if (decomp.type !== 'regular') return null;
  // 单钓将：胡牌张是雀头
  if (winTile === decomp.pair) return 'single';
  // 检查顺子
  for (const meld of decomp.melds) {
    if (meld.type !== 'sequence') continue;
    const [t1, t2, t3] = meld.tiles;
    const r1 = t1 % 10, r3 = t3 % 10;
    if (winTile === t3 && r1 === 1) return 'edge';   // 1-2-3 胡3
    if (winTile === t1 && r3 === 9) return 'edge';   // 7-8-9 胡7
    if (winTile === t2) return 'middle';              // 坎张
  }
  return null; // 双面待或刻子
}

export function calculate(tiles, opts = {}) {
  if (tiles.length !== 14) {
    return { valid: false, errorCode: 'need14' };
  }

  const decomps = findAllDecompositions(tiles);
  if (decomps.length === 0) {
    return { valid: false, errorCode: 'invalid' };
  }

  let bestResult = null;
  for (const decomp of decomps) {
    let effectiveOpts = opts;
    if (opts.winTile !== undefined) {
      const autoWait = detectWaitType(opts.winTile, decomp);
      effectiveOpts = { ...opts, waitType: autoWait };
    }
    const result = scoreDecomposition(decomp, tiles, effectiveOpts);
    if (!bestResult || result.totalFan > bestResult.totalFan) {
      bestResult = result;
    }
  }

  if (bestResult.totalFan < 8) {
    return {
      valid: true,
      totalFan: bestResult.totalFan,
      fans: bestResult.fans,
      tooLow: true,
    };
  }

  return {
    valid: true,
    totalFan: bestResult.totalFan,
    fans: bestResult.fans,
  };
}

function scoreDecomposition(decomp, allTiles, opts) {
  const applicableFans = [];

  for (const rule of FAN_RULES) {
    let count = 1;
    let applies = false;

    try {
      const result = rule.check(decomp, allTiles, opts);
      if (!result) continue;

      if (typeof result === 'number' && result > 1) {
        count = result;
        applies = true;
      } else {
        applies = true;
        // multiCount 番型按实际数量叠加
        if (rule.multiCount && decomp.type === 'regular') {
          if (rule.name === '幺九刻') {
            // 排除箭刻、圈风刻、门风刻对应的牌
            count = decomp.melds.filter(m => {
              if (m.type !== 'triplet') return false;
              if (isDragon(m.tile)) return false;
              if (opts?.seatWind  && m.tile === opts.seatWind)  return false;
              if (opts?.roundWind && m.tile === opts.roundWind) return false;
              return isTerminalOrHonor(m.tile);
            }).length;
            if (count === 0) continue;
          }
          if (rule.name === '箭刻') {
            count = decomp.melds.filter(m => m.type === 'triplet' && isDragon(m.tile)).length;
            if (count === 0) continue;
          }
        }
      }
    } catch (e) {
      continue;
    }

    if (applies) {
      applicableFans.push({ name: rule.name, value: rule.value, count });
    }
  }

  // 应用互斥规则（高番型排除低番型）
  const excludedNames = new Set();
  for (const fan of applicableFans) {
    const rule = FAN_RULES.find(r => r.name === fan.name);
    if (rule?.excludes) {
      for (const excl of rule.excludes) excludedNames.add(excl);
    }
  }
  // 圈风刻/门风刻 仅排除 幺九刻，通过 excludes 已处理
  // 但需防止双重排除：圈风刻和门风刻可以共存（若圈风=门风则不可能出现）

  let finalFans = applicableFans.filter(f => !excludedNames.has(f.name));

  // 无番和：有效和牌但无任何番型（仅有基础番），额外补到8番
  const patternFans = finalFans.filter(f => !BASE_FAN_NAMES.has(f.name));
  if (patternFans.length === 0) {
    finalFans.push({ name: '无番和', value: 8, count: 1 });
  }

  const totalFan = finalFans.reduce((sum, f) => sum + f.value * f.count, 0);
  return { fans: finalFans, totalFan };
}
