// ============================================================
// 国标麻将番型规则（2006年竞赛规则标准版）
// ============================================================
import {
  isHonor, isWind, isDragon, isNumeric, isTerminal,
  isTerminalOrHonor, isSimple, isGreen, getSuitNum,
} from './tiles.js';

// ─── 内部辅助 ────────────────────────────────────────────────
function meldTiles(m) {
  return m.type === 'sequence' ? m.tiles : [m.tile, m.tile, m.tile];
}
function meldHasTerminalOrHonor(m) {
  return meldTiles(m).some(t => isTerminalOrHonor(t));
}
function getSequences(melds) { return melds.filter(m => m.type === 'sequence'); }
function getTriplets(melds)  { return melds.filter(m => m.type === 'triplet'); }

// ============================================================
export const FAN_RULES = [

  // ═══════════════════ 88 番 ═══════════════════
  {
    name: '大四喜', value: 88,
    check(d) {
      if (d.type !== 'regular') return false;
      return d.melds.filter(m => m.type === 'triplet' && isWind(m.tile)).length === 4;
    },
    excludes: ['小四喜', '三风刻', '圈风刻', '门风刻', '碰碰和', '幺九刻'],
  },
  {
    name: '大三元', value: 88,
    check(d) {
      if (d.type !== 'regular') return false;
      return d.melds.filter(m => m.type === 'triplet' && isDragon(m.tile)).length === 3;
    },
    excludes: ['小三元', '箭刻', '双箭刻'],
  },
  {
    // 绿一色：另计混一色/清一色（不在 excludes 中）
    name: '绿一色', value: 88,
    check(d, allTiles) { return allTiles.every(t => isGreen(t)); },
    excludes: [],
  },
  {
    name: '九莲宝灯', value: 88,
    check(d, allTiles) {
      if (d.type !== 'regular') return false;
      if (!allTiles.every(t => isNumeric(t))) return false;
      const suits = new Set(allTiles.map(t => getSuitNum(t)));
      if (suits.size !== 1) return false;
      const suit = [...suits][0];
      const counts = {};
      for (const t of allTiles) counts[t] = (counts[t] || 0) + 1;
      const base = [1,1,1,2,3,4,5,6,7,8,9,9,9];
      const temp = { ...counts };
      for (const r of base) {
        const t = suit * 10 + r;
        if (!temp[t]) return false;
        temp[t]--;
      }
      return true;
    },
    excludes: ['清一色', '门前清', '幺九刻', '缺一门'],
  },
  {
    name: '四杠', value: 88,
    check(d, allTiles, opts) {
      return (opts?.openKongs || 0) + (opts?.concealedKongs || 0) === 4;
    },
    excludes: ['碰碰和', '单钓将'],
    // 另计：四暗刻、三暗刻（不在 excludes 中，由更高番型自身排除）
  },
  {
    name: '连七对', value: 88,
    check(d) { return d.type === 'consecutive_seven_pairs'; },
    excludes: ['七对', '清一色', '门前清', '单钓将', '缺一门'],
  },
  {
    name: '十三幺', value: 88,
    check(d) { return d.type === 'thirteen_orphans'; },
    excludes: ['五门齐', '门前清', '单钓将'],
  },

  // ═══════════════════ 64 番 ═══════════════════
  {
    name: '一色双龙会', value: 64,
    check(d, allTiles) {
      if (d.type !== 'regular') return false;
      if (!allTiles.every(t => isNumeric(t))) return false;
      const suit = getSuitNum(allTiles[0]);
      if (!allTiles.every(t => getSuitNum(t) === suit)) return false;
      if (!isNumeric(d.pair) || d.pair % 10 !== 5 || getSuitNum(d.pair) !== suit) return false;
      const seqs = getSequences(d.melds);
      if (seqs.length !== 4) return false;
      const c123 = seqs.filter(s => s.tiles[0] % 10 === 1).length;
      const c789 = seqs.filter(s => s.tiles[0] % 10 === 7).length;
      return c123 === 2 && c789 === 2;
    },
    excludes: ['七对', '清一色', '平和', '一般高', '老少副', '无字', '缺一门'],
  },
  {
    name: '四暗刻', value: 64,
    check(d, allTiles, opts) {
      if (d.type !== 'regular') return false;
      if (!d.melds.every(m => m.type === 'triplet')) return false;
      return (opts?.fullyConcealed) || ((opts?.concealedTriplets || 0) >= 4);
    },
    excludes: ['三暗刻', '双暗刻', '碰碰和', '门前清'],
  },
  {
    name: '清幺九', value: 64,
    check(d, allTiles) { return allTiles.every(t => isTerminal(t)); },
    excludes: ['混幺九', '碰碰和', '双同刻', '全带幺', '幺九刻', '无字'],
  },
  {
    name: '小四喜', value: 64,
    check(d) {
      if (d.type !== 'regular') return false;
      return d.melds.filter(m => m.type === 'triplet' && isWind(m.tile)).length === 3 && isWind(d.pair);
    },
    excludes: ['三风刻', '圈风刻', '门风刻', '幺九刻'],
  },
  {
    name: '小三元', value: 64,
    check(d) {
      if (d.type !== 'regular') return false;
      return d.melds.filter(m => m.type === 'triplet' && isDragon(m.tile)).length === 2 && isDragon(d.pair);
    },
    excludes: ['双箭刻', '箭刻'],
  },
  {
    name: '字一色', value: 64,
    check(d, allTiles) { return allTiles.every(t => isHonor(t)); },
    excludes: ['碰碰和', '全带幺', '幺九刻'],
  },

  // ═══════════════════ 48 番 ═══════════════════
  {
    name: '一色四同顺', value: 48,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds);
      if (seqs.length < 4) return false;
      const sorted = [...seqs].sort((a, b) => a.tiles[0] - b.tiles[0]);
      for (let i = 0; i <= sorted.length - 4; i++) {
        const t = sorted[i].tiles[0];
        if (sorted[i+1].tiles[0] === t && sorted[i+2].tiles[0] === t && sorted[i+3].tiles[0] === t)
          return true;
      }
      return false;
    },
    excludes: ['一色三节高', '一般高', '四归一', '缺一门'],
  },
  {
    name: '一色四节高', value: 48,
    check(d) {
      if (d.type !== 'regular') return false;
      const trips = getTriplets(d.melds).filter(m => isNumeric(m.tile));
      const sorted = trips.map(m => m.tile).sort((a, b) => a - b);
      for (let i = 0; i <= sorted.length - 4; i++) {
        if (getSuitNum(sorted[i]) === getSuitNum(sorted[i+3]) &&
            sorted[i+1] === sorted[i]+1 && sorted[i+2] === sorted[i]+2 && sorted[i+3] === sorted[i]+3)
          return true;
      }
      return false;
    },
    excludes: ['一色三同顺', '碰碰和', '缺一门'],
  },

  // ═══════════════════ 32 番 ═══════════════════
  {
    name: '一色四步高', value: 32,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds).filter(m => isNumeric(m.tiles[0]));
      const starts = seqs.map(m => m.tiles[0]).sort((a, b) => a - b);
      for (let step = 1; step <= 2; step++) {
        for (let i = 0; i <= starts.length - 4; i++) {
          const s0 = starts[i];
          if (starts[i+1] === s0+step && starts[i+2] === s0+step*2 && starts[i+3] === s0+step*3 &&
              getSuitNum(s0) === getSuitNum(starts[i+3]))
            return true;
        }
      }
      return false;
    },
    excludes: ['连六', '老少副', '缺一门'],
  },
  {
    name: '三杠', value: 32,
    check(d, allTiles, opts) {
      return (opts?.openKongs || 0) + (opts?.concealedKongs || 0) === 3;
    },
    // 另计三暗刻（不排除）
  },
  {
    name: '混幺九', value: 32,
    check(d, allTiles) {
      if (d.type !== 'regular') return false;
      if (!allTiles.some(t => isHonor(t)) || !allTiles.some(t => isTerminal(t))) return false;
      const allSets = [...d.melds, { type: 'pair', tiles: [d.pair, d.pair] }];
      return allSets.every(m => meldHasTerminalOrHonor(m));
    },
    excludes: ['碰碰和', '全带幺', '幺九刻'],
  },

  // ═══════════════════ 24 番 ═══════════════════
  {
    name: '七对', value: 24,
    check(d) { return d.type === 'seven_pairs'; },
    excludes: ['门前清', '单钓将'],
  },
  {
    name: '七星不靠', value: 24,
    check(d) { return d.type === 'seven_stars'; },
    excludes: ['五门齐', '门前清', '单钓将'],
  },
  {
    // 全双刻：全部偶数牌刻子（2,4,6,8）+偶数对子，不计碰碰和、断幺
    name: '全双刻', value: 24,
    check(d, allTiles) {
      if (d.type !== 'regular') return false;
      if (!d.melds.every(m => m.type === 'triplet')) return false;
      return allTiles.every(t => isNumeric(t) && t % 10 % 2 === 0);
    },
    excludes: ['碰碰和', '断幺', '无字'],
  },
  {
    name: '清一色', value: 24,
    check(d, allTiles) {
      if (!allTiles.every(t => isNumeric(t))) return false;
      const suit = getSuitNum(allTiles[0]);
      return allTiles.every(t => getSuitNum(t) === suit);
    },
    excludes: ['无字', '缺一门'],
  },
  {
    name: '一色三同顺', value: 24,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds);
      const tried = new Set();
      for (const s of seqs) {
        const key = s.tiles[0];
        if (tried.has(key)) continue;
        if (seqs.filter(x => x.tiles[0] === key).length >= 3) return true;
        tried.add(key);
      }
      return false;
    },
    excludes: ['一色三节高', '一般高'],
  },
  {
    name: '一色三节高', value: 24,
    check(d) {
      if (d.type !== 'regular') return false;
      const trips = getTriplets(d.melds).filter(m => isNumeric(m.tile));
      const sorted = trips.map(m => m.tile).sort((a, b) => a - b);
      for (let i = 0; i <= sorted.length - 3; i++) {
        if (getSuitNum(sorted[i]) === getSuitNum(sorted[i+2]) &&
            sorted[i+1] === sorted[i]+1 && sorted[i+2] === sorted[i]+2)
          return true;
      }
      return false;
    },
    excludes: ['一色三同顺'],
  },
  {
    name: '全大', value: 24,
    check(d, allTiles) { return allTiles.every(t => isNumeric(t) && t % 10 >= 7); },
    excludes: ['无字'],
  },
  {
    name: '全中', value: 24,
    check(d, allTiles) { return allTiles.every(t => isNumeric(t) && t % 10 >= 4 && t % 10 <= 6); },
    excludes: ['无字', '断幺'],
  },
  {
    name: '全小', value: 24,
    check(d, allTiles) { return allTiles.every(t => isNumeric(t) && t % 10 <= 3); },
    excludes: ['无字'],
  },

  // ═══════════════════ 16 番 ═══════════════════
  {
    // 清龙：同花色 1-2-3、4-5-6、7-8-9
    name: '清龙', value: 16,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds);
      for (const suit of [1, 2, 3]) {
        const base = suit * 10;
        if (seqs.some(s => s.tiles[0] === base + 1) &&
            seqs.some(s => s.tiles[0] === base + 4) &&
            seqs.some(s => s.tiles[0] === base + 7)) return true;
      }
      return false;
    },
    excludes: ['连六', '老少副'],
  },
  {
    // 三色双龙会：一门花色的 1-2-3 和 7-8-9 + 5 为雀头（含另两色各一组）
    name: '三色双龙会', value: 16,
    check(d) {
      if (d.type !== 'regular') return false;
      if (!isNumeric(d.pair) || d.pair % 10 !== 5) return false;
      const seqs = getSequences(d.melds);
      const pairSuit = getSuitNum(d.pair);
      const has123 = seqs.some(s => s.tiles[0] === pairSuit * 10 + 1);
      const has789 = seqs.some(s => s.tiles[0] === pairSuit * 10 + 7);
      return has123 && has789;
    },
    excludes: ['喜相逢', '老少副', '无字', '平和'],
  },
  {
    name: '一色三步高', value: 16,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds).filter(m => isNumeric(m.tiles[0]));
      const starts = seqs.map(m => m.tiles[0]).sort((a, b) => a - b);
      for (let step = 1; step <= 2; step++) {
        for (let i = 0; i <= starts.length - 3; i++) {
          const s0 = starts[i];
          if (starts[i+1] === s0+step && starts[i+2] === s0+step*2 &&
              getSuitNum(s0) === getSuitNum(starts[i+2]))
            return true;
        }
      }
      return false;
    },
  },
  {
    name: '全带五', value: 16,
    check(d) {
      if (d.type !== 'regular') return false;
      const allSets = [...d.melds, { type: 'pair', tiles: [d.pair, d.pair] }];
      return allSets.every(m => {
        const tiles = m.tiles || [m.tile, m.tile, m.tile];
        return tiles.some(t => isNumeric(t) && t % 10 === 5);
      });
    },
    excludes: ['断幺'],
  },
  {
    // 三同刻：三门花色相同点数刻子
    name: '三同刻', value: 16,
    check(d) {
      if (d.type !== 'regular') return false;
      const trips = getTriplets(d.melds).filter(m => isNumeric(m.tile));
      for (const t of trips) {
        const rank = t.tile % 10;
        if ([1,2,3].every(s => trips.some(x => getSuitNum(x.tile) === s && x.tile % 10 === rank)))
          return true;
      }
      return false;
    },
    excludes: ['双同刻'],
  },
  {
    name: '三暗刻', value: 16,
    check(d, allTiles, opts) {
      if (d.type !== 'regular') return false;
      if (d.melds.filter(m => m.type === 'triplet').length < 3) return false;
      return (opts?.fullyConcealed) || ((opts?.concealedTriplets || 0) >= 3);
    },
    excludes: ['双暗刻'],
  },

  // ═══════════════════ 12 番 ═══════════════════
  {
    // 全不靠：牌型为「不靠」形（decompose.js 中 type='knitted'）
    name: '全不靠', value: 12,
    check(d) { return d.type === 'knitted'; },
    excludes: ['五门齐', '门前清', '单钓将'],
  },
  {
    // 组合龙：三门花色各出 1-2-3、4-5-6、7-8-9 之一，覆盖 1-9
    name: '组合龙', value: 12,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds);
      const has1 = seqs.filter(s => s.tiles[0] % 10 === 1 && isNumeric(s.tiles[0]));
      const has4 = seqs.filter(s => s.tiles[0] % 10 === 4 && isNumeric(s.tiles[0]));
      const has7 = seqs.filter(s => s.tiles[0] % 10 === 7 && isNumeric(s.tiles[0]));
      for (const s1 of has1) {
        for (const s4 of has4) {
          for (const s7 of has7) {
            const suits = new Set([getSuitNum(s1.tiles[0]), getSuitNum(s4.tiles[0]), getSuitNum(s7.tiles[0])]);
            if (suits.size === 3) return true;
          }
        }
      }
      return false;
    },
  },
  {
    name: '大于五', value: 12,
    check(d, allTiles) { return allTiles.every(t => isNumeric(t) && t % 10 > 5); },
    excludes: ['无字'],
  },
  {
    name: '小于五', value: 12,
    check(d, allTiles) { return allTiles.every(t => isNumeric(t) && t % 10 < 5); },
    excludes: ['无字'],
  },
  {
    name: '三风刻', value: 12,
    check(d) {
      if (d.type !== 'regular') return false;
      return d.melds.filter(m => m.type === 'triplet' && isWind(m.tile)).length === 3;
    },
  },

  // ═══════════════════ 8 番 ═══════════════════
  {
    // 花龙：1-2-3、4-5-6、7-8-9 分别由万/筒/条三种不同花色各组一副
    name: '花龙', value: 8,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds);
      const has1 = seqs.filter(s => s.tiles[0] % 10 === 1 && isNumeric(s.tiles[0]));
      const has4 = seqs.filter(s => s.tiles[0] % 10 === 4 && isNumeric(s.tiles[0]));
      const has7 = seqs.filter(s => s.tiles[0] % 10 === 7 && isNumeric(s.tiles[0]));
      for (const s1 of has1) {
        for (const s4 of has4) {
          for (const s7 of has7) {
            const suits = new Set([getSuitNum(s1.tiles[0]), getSuitNum(s4.tiles[0]), getSuitNum(s7.tiles[0])]);
            if (suits.size === 3) return true; // 万/筒/条三种花色各一
          }
        }
      }
      return false;
    },
  },
  {
    // 三色三同顺：三门花色相同起始的顺子
    name: '三色三同顺', value: 8,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds).filter(m => isNumeric(m.tiles[0]));
      for (const s of seqs) {
        const rank = s.tiles[0] % 10;
        const suit = getSuitNum(s.tiles[0]);
        const others = [1,2,3].filter(x => x !== suit);
        if (others.every(os => seqs.some(x => getSuitNum(x.tiles[0]) === os && x.tiles[0] % 10 === rank)))
          return true;
      }
      return false;
    },
  },
  {
    // 三色三节高：三门花色各一刻子，点数连续
    name: '三色三节高', value: 8,
    check(d) {
      if (d.type !== 'regular') return false;
      const trips = getTriplets(d.melds).filter(m => isNumeric(m.tile));
      for (let r = 1; r <= 7; r++) {
        const t1 = trips.filter(t => t.tile % 10 === r);
        const t2 = trips.filter(t => t.tile % 10 === r + 1);
        const t3 = trips.filter(t => t.tile % 10 === r + 2);
        const s1 = new Set(t1.map(t => getSuitNum(t.tile)));
        const s2 = new Set(t2.map(t => getSuitNum(t.tile)));
        const s3 = new Set(t3.map(t => getSuitNum(t.tile)));
        for (const a of s1) {
          for (const b of s2) {
            if (b === a) continue;
            for (const c of s3) {
              if (c === a || c === b) continue;
              return true;
            }
          }
        }
      }
      return false;
    },
  },
  {
    name: '妙手回春', value: 8,
    check(d, allTiles, opts) { return !!(opts && opts.lastTile && opts.selfDraw); },
    excludes: ['自摸'],
  },
  {
    name: '海底捞月', value: 8,
    check(d, allTiles, opts) { return !!(opts && opts.lastTile && !opts.selfDraw); },
  },
  {
    name: '杠上开花', value: 8,
    check(d, allTiles, opts) { return !!(opts && opts.winOnKong); },
    excludes: ['自摸'],
  },
  {
    name: '抢杠和', value: 8,
    check(d, allTiles, opts) { return !!(opts && opts.robbingKong); },
    excludes: ['和绝张'],
  },
  {
    name: '双暗杠', value: 8,
    check(d, allTiles, opts) { return (opts?.concealedKongs || 0) >= 2; },
    excludes: ['暗杠', '双暗刻'],
  },

  // ═══════════════════ 6 番 ═══════════════════
  {
    name: '碰碰和', value: 6,
    check(d) {
      if (d.type !== 'regular') return false;
      return d.melds.every(m => m.type === 'triplet');
    },
  },
  {
    name: '混一色', value: 6,
    check(d, allTiles) {
      if (!allTiles.some(t => isHonor(t)) || !allTiles.some(t => isNumeric(t))) return false;
      const numTiles = allTiles.filter(t => isNumeric(t));
      const suit = getSuitNum(numTiles[0]);
      return numTiles.every(t => getSuitNum(t) === suit);
    },
    excludes: ['缺一门'],
  },
  {
    name: '三色三步高', value: 6,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds).filter(m => isNumeric(m.tiles[0]));
      for (let step = 1; step <= 2; step++) {
        for (const s1 of seqs) {
          const r1 = s1.tiles[0] % 10;
          if (r1 + step * 2 > 9) continue;
          const suit1 = getSuitNum(s1.tiles[0]);
          for (const s2 of seqs) {
            const suit2 = getSuitNum(s2.tiles[0]);
            if (suit2 === suit1 || s2.tiles[0] % 10 !== r1 + step) continue;
            for (const s3 of seqs) {
              const suit3 = getSuitNum(s3.tiles[0]);
              if (suit3 === suit1 || suit3 === suit2) continue;
              if (s3.tiles[0] % 10 !== r1 + step * 2) continue;
              return true;
            }
          }
        }
      }
      return false;
    },
  },
  {
    name: '五门齐', value: 6,
    check(d, allTiles) {
      const hasSuits = new Set();
      for (const t of allTiles) {
        const s = getSuitNum(t);
        if (s === 1) hasSuits.add('wan');
        else if (s === 2) hasSuits.add('tong');
        else if (s === 3) hasSuits.add('tiao');
        else if (isWind(t)) hasSuits.add('wind');
        else if (isDragon(t)) hasSuits.add('dragon');
      }
      return hasSuits.size === 5;
    },
  },
  {
    name: '全求人', value: 6,
    check(d, allTiles, opts) { return !!(opts && opts.fullyMelded && !opts.selfDraw); },
    excludes: ['单钓将'],
  },
  {
    name: '双箭刻', value: 6,
    check(d) {
      if (d.type !== 'regular') return false;
      return d.melds.filter(m => m.type === 'triplet' && isDragon(m.tile)).length >= 2;
    },
    excludes: ['箭刻'],
  },
  {
    name: '明暗杠', value: 6,
    check(d, allTiles, opts) {
      return (opts?.openKongs || 0) >= 1 && (opts?.concealedKongs || 0) >= 1;
    },
    excludes: ['明杠', '暗杠'],
  },

  // ═══════════════════ 4 番 ═══════════════════
  {
    name: '全带幺', value: 4,
    check(d) {
      if (d.type !== 'regular') return false;
      const allSets = [...d.melds, { type: 'pair', tiles: [d.pair, d.pair] }];
      return allSets.every(m => meldHasTerminalOrHonor(m));
    },
  },
  {
    name: '不求人', value: 4,
    check(d, allTiles, opts) {
      return !!(opts && opts.selfDraw && opts.fullyConcealed);
    },
    excludes: ['门前清', '自摸'],
  },
  {
    name: '双明杠', value: 4,
    check(d, allTiles, opts) { return (opts?.openKongs || 0) >= 2; },
    excludes: ['明杠'],
  },
  {
    name: '和绝张', value: 4,
    check(d, allTiles, opts) { return !!(opts && opts.winOnLastOfKind); },
  },

  // ═══════════════════ 2 番 ═══════════════════
  {
    name: '箭刻', value: 2,
    check(d) {
      if (d.type !== 'regular') return false;
      return d.melds.some(m => m.type === 'triplet' && isDragon(m.tile));
    },
    multiCount: true,
  },
  {
    name: '圈风刻', value: 2,
    check(d, allTiles, opts) {
      if (d.type !== 'regular' || !opts?.roundWind) return false;
      return d.melds.some(m => m.type === 'triplet' && m.tile === opts.roundWind);
    },
    excludes: ['幺九刻'],
  },
  {
    name: '门风刻', value: 2,
    check(d, allTiles, opts) {
      if (d.type !== 'regular' || !opts?.seatWind) return false;
      return d.melds.some(m => m.type === 'triplet' && m.tile === opts.seatWind);
    },
    excludes: ['幺九刻'],
  },
  {
    name: '门前清', value: 2,
    check(d, allTiles, opts) { return !!(opts && opts.fullyConcealed && !opts.selfDraw); },
  },
  {
    // 平和：全顺子+非字牌雀头，不计无字
    name: '平和', value: 2,
    check(d) {
      if (d.type !== 'regular') return false;
      if (!d.melds.every(m => m.type === 'sequence')) return false;
      return !isHonor(d.pair);
    },
    excludes: ['无字'],
  },
  {
    // 四归一：四张同种牌分布在不同面子中（非杠）
    name: '四归一', value: 2,
    check(d, allTiles) {
      if (d.type !== 'regular') return false;
      const counts = {};
      for (const t of allTiles) counts[t] = (counts[t] || 0) + 1;
      return Object.values(counts).some(cnt => cnt === 4);
    },
  },
  {
    // 双同刻：两门花色相同点数刻子
    name: '双同刻', value: 2,
    check(d) {
      if (d.type !== 'regular') return false;
      const trips = getTriplets(d.melds).filter(m => isNumeric(m.tile));
      for (const t of trips) {
        const rank = t.tile % 10;
        const suit = getSuitNum(t.tile);
        if (trips.some(x => getSuitNum(x.tile) !== suit && x.tile % 10 === rank)) return true;
      }
      return false;
    },
  },
  {
    name: '双暗刻', value: 2,
    check(d, allTiles, opts) {
      if (d.type !== 'regular') return false;
      if (d.melds.filter(m => m.type === 'triplet').length < 2) return false;
      return (opts?.fullyConcealed) || ((opts?.concealedTriplets || 0) >= 2);
    },
  },
  {
    name: '暗杠', value: 2,
    check(d, allTiles, opts) {
      const cnt = opts?.concealedKongs || 0;
      return cnt > 0 ? cnt : false;
    },
    multiCount: true,
  },
  {
    name: '断幺', value: 2,
    check(d, allTiles) { return allTiles.every(t => isSimple(t)); },
    excludes: ['无字'],
  },

  // ═══════════════════ 1 番 ═══════════════════
  {
    name: '一般高', value: 1,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds);
      const tried = new Set();
      for (const s of seqs) {
        const key = s.tiles[0];
        if (tried.has(key)) continue;
        if (seqs.filter(x => x.tiles[0] === key).length >= 2) return true;
        tried.add(key);
      }
      return false;
    },
  },
  {
    name: '喜相逢', value: 1,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds).filter(m => isNumeric(m.tiles[0]));
      for (const s of seqs) {
        const rank = s.tiles[0] % 10;
        const suit = getSuitNum(s.tiles[0]);
        if (seqs.some(x => x.tiles[0] % 10 === rank && getSuitNum(x.tiles[0]) !== suit)) return true;
      }
      return false;
    },
  },
  {
    name: '连六', value: 1,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds).filter(m => isNumeric(m.tiles[0]));
      for (const s1 of seqs) {
        const suit = getSuitNum(s1.tiles[0]);
        const rank = s1.tiles[0] % 10;
        if (rank <= 4 && seqs.some(s2 => getSuitNum(s2.tiles[0]) === suit && s2.tiles[0] % 10 === rank + 3))
          return true;
      }
      return false;
    },
  },
  {
    name: '老少副', value: 1,
    check(d) {
      if (d.type !== 'regular') return false;
      const seqs = getSequences(d.melds).filter(m => isNumeric(m.tiles[0]));
      for (const s1 of seqs) {
        const suit = getSuitNum(s1.tiles[0]);
        if (s1.tiles[0] % 10 === 1 && seqs.some(s2 => getSuitNum(s2.tiles[0]) === suit && s2.tiles[0] % 10 === 7))
          return true;
      }
      return false;
    },
  },
  {
    // 幺九刻：非箭、非圈风、非门风的幺九刻（每组1番）
    name: '幺九刻', value: 1,
    check(d) {
      if (d.type !== 'regular') return false;
      return d.melds.some(m => m.type === 'triplet' && isTerminalOrHonor(m.tile) && !isDragon(m.tile));
    },
    multiCount: true,
  },
  {
    name: '明杠', value: 1,
    check(d, allTiles, opts) {
      const cnt = opts?.openKongs || 0;
      return cnt > 0 ? cnt : false;
    },
    multiCount: true,
  },
  {
    // 缺一门：数字牌只有两门花色
    name: '缺一门', value: 1,
    check(d, allTiles) {
      const numTiles = allTiles.filter(t => isNumeric(t));
      if (numTiles.length === 0) return false;
      const suits = new Set(numTiles.map(t => getSuitNum(t)));
      return suits.size < 3;
    },
  },
  {
    // 无字：全部数字牌，无字牌
    name: '无字', value: 1,
    check(d, allTiles) { return allTiles.every(t => isNumeric(t)); },
  },
  {
    name: '边张', value: 1,
    check(d, allTiles, opts) { return opts?.waitType === 'edge'; },
  },
  {
    name: '坎张', value: 1,
    check(d, allTiles, opts) { return opts?.waitType === 'middle'; },
  },
  {
    name: '单钓将', value: 1,
    check(d, allTiles, opts) { return opts?.waitType === 'single'; },
  },
  {
    name: '自摸', value: 1,
    check(d, allTiles, opts) {
      return !!(opts && opts.selfDraw && !opts.winOnKong);
    },
  },
  {
    name: '花牌', value: 1,
    check(d, allTiles, opts) {
      const cnt = opts?.flowers || 0;
      return cnt > 0 ? cnt : false;
    },
    multiCount: true,
  },
];
