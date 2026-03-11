import { useState, useEffect } from 'react';
import MahjongTile from './MahjongTile';
import { ALL_TILES, isHonor, isTerminal } from '../logic/tiles.js';
import { analyzeDiscards, analyzeTenpai } from '../logic/discardAnalyzer.js';

// ═══════════════════════════════════════════════════════════════
// 全局唯一渲染接口：TileView
// ─────────────────────────────────────────────────────────────
// 编码与花色对照（以 MahjongTile.jsx 精灵图实际像素验证为准）：
//   万  11-19 → x=0    排  条  31-39 → x=850  排  筒  21-29 → x=1699 排
// ═══════════════════════════════════════════════════════════════
function TileView({ tile, scale = 0.19, seen = false }) {
  return (
    <div style={{
      display: 'inline-flex', flexShrink: 0,
      outline: seen ? '2px solid #27ae60' : 'none', borderRadius: 3,
    }}>
      <MahjongTile tile={tile} scale={scale} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 牌名辅助
// ═══════════════════════════════════════════════════════════════
const HONOR_NAME_ZH = { 41:'东风', 42:'南风', 43:'西风', 44:'北风', 45:'中', 46:'发', 47:'白' };
const HONOR_NAME_EN = { 41:'East', 42:'South', 43:'West', 44:'North', 45:'Chun', 46:'Hatsu', 47:'Haku' };
const SUIT_ZH = { 1:'万', 2:'筒', 3:'条' };
const SUIT_EN = { 1:'Man', 2:'Pin', 3:'Sou' };

function tileName(code, lang) {
  if (HONOR_NAME_ZH[code]) return lang === 'en' ? HONOR_NAME_EN[code] : HONOR_NAME_ZH[code];
  const suit = Math.floor(code / 10), rank = code % 10;
  return lang === 'en' ? `${rank}-${SUIT_EN[suit]}` : `${rank}${SUIT_ZH[suit]}`;
}

// ═══════════════════════════════════════════════════════════════
// 核心发牌工具
// ═══════════════════════════════════════════════════════════════
function dealFromWall(n) {
  const pool = [];
  for (const t of ALL_TILES) pool.push(t, t, t, t);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n).sort((a, b) => a - b);
}

const NUM_SUITS   = [1, 2, 3];
const HONOR_TILES = [41, 42, 43, 44, 45, 46, 47];

function randInt(max) { return Math.floor(Math.random() * max); }
function randomSeq() { const base = NUM_SUITS[randInt(3)] * 10, r = 1 + randInt(7); return [base+r, base+r+1, base+r+2]; }
function randomTwoSidedWait() { const base = NUM_SUITS[randInt(3)] * 10, r = 2 + randInt(6); return [base+r, base+r+1]; }
function randomKanchanWait()  { const base = NUM_SUITS[randInt(3)] * 10, r = 1 + randInt(7); return [base+r, base+r+2]; }
function isValidHandCount(tiles) {
  const cnt = {};
  for (const t of tiles) cnt[t] = (cnt[t] || 0) + 1;
  return !Object.values(cnt).some(c => c > 4);
}

// ── 难度阶段指示 ───────────────────────────────────────────────
function getDifficultyTier(round) {
  if (round < 3)  return { stars: '★☆☆☆', color: '#2ecc71' };
  if (round < 7)  return { stars: '★★☆☆', color: '#f1c40f' };
  if (round < 12) return { stars: '★★★☆', color: '#e67e22' };
  return           { stars: '★★★★', color: '#e74c3c' };
}

// ── 5张复合搭子块（中级高难用） ────────────────────────────────
function randomCompoundBlock5() {
  const suitBase = NUM_SUITS[randInt(3)] * 10;
  const patterns = [
    r => [r, r+1, r+1, r+2, r+3],
    r => [r, r+1, r+2, r+2, r+3],
    r => [r, r, r+1, r+2, r+3],
    r => [r, r+1, r+2, r+3, r+3],
    r => [r, r+1, r+2, r+3, r+4],
  ];
  for (let attempt = 0; attempt < 20; attempt++) {
    const pat = patterns[randInt(patterns.length)];
    const r = 1 + randInt(5);
    const ranks = pat(r);
    if (ranks.some(rk => rk < 1 || rk > 9)) continue;
    return ranks.map(rk => suitBase + rk);
  }
  return [suitBase+2, suitBase+3, suitBase+3, suitBase+4, suitBase+5];
}

// ── 初级：带等待类型控制的13张结构化听牌手牌 ───────────────────
function buildWaitHand13(waitType) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const tiles = [];
    if (waitType === 'tanki') {
      for (let i = 0; i < 4; i++) tiles.push(...randomSeq());
      tiles.push(HONOR_TILES[randInt(HONOR_TILES.length)]);
    } else {
      for (let i = 0; i < 3; i++) tiles.push(...randomSeq());
      const pairTile = HONOR_TILES[randInt(HONOR_TILES.length)];
      tiles.push(pairTile, pairTile);
      if      (waitType === 'edge')     { const b = NUM_SUITS[randInt(3)] * 10; tiles.push(...(Math.random() < 0.5 ? [b+1, b+2] : [b+8, b+9])); }
      else if (waitType === 'kanchan')  { tiles.push(...randomKanchanWait()); }
      else                              { tiles.push(...randomTwoSidedWait()); }
    }
    if (tiles.length !== 13 || !isValidHandCount(tiles)) continue;
    tiles.sort((a, b) => a - b);
    const result = analyzeTenpai(tiles);
    if (result.waitingTiles.length === 0) continue;
    if (waitType !== 'twosided' && result.waitingTiles.length > 2) continue;
    return { hand13: tiles, waitTiles: result.waitingTiles };
  }
  return null;
}

// ── 结构化一向听14张手牌（基础版） ─────────────────────────────
function buildOneShantenHand14() {
  for (let attempt = 0; attempt < 40; attempt++) {
    const tiles = [];
    for (let i = 0; i < 3; i++) tiles.push(...randomSeq());
    let pairTile;
    if (Math.random() < 0.8) { pairTile = HONOR_TILES[randInt(HONOR_TILES.length)]; }
    else { const base = NUM_SUITS[randInt(3)] * 10; pairTile = base + 1 + randInt(9); }
    tiles.push(pairTile, pairTile);
    tiles.push(...(Math.random() < 0.7 ? randomTwoSidedWait() : randomKanchanWait()));
    const extraType = randInt(3);
    let extraTile;
    if      (extraType === 0) { const pool = HONOR_TILES.filter(t => t !== pairTile); extraTile = pool[randInt(pool.length)]; }
    else if (extraType === 1) { extraTile = [11,19,21,29,31,39][randInt(6)]; }
    else                      { extraTile = NUM_SUITS[randInt(3)] * 10 + 3 + randInt(3); }
    tiles.push(extraTile);
    if (!isValidHandCount(tiles)) continue;
    tiles.sort((a, b) => a - b);
    const options = analyzeDiscards(tiles).options;
    if (hasGoodTeachingQuality(options)) return { hand: tiles, options };
  }
  return buildOneShantenHand14();
}

// ── 复合搭子一向听手牌（中级进阶） ─────────────────────────────
function buildCompoundHand14() {
  for (let attempt = 0; attempt < 40; attempt++) {
    const block5 = randomCompoundBlock5();
    const tiles = [];
    for (let i = 0; i < 2; i++) tiles.push(...randomSeq());
    const pairTile = HONOR_TILES[randInt(HONOR_TILES.length)];
    tiles.push(pairTile, pairTile);
    tiles.push(...block5);
    const extraPool = HONOR_TILES.filter(t => t !== pairTile);
    tiles.push(extraPool[randInt(extraPool.length)]);
    if (!isValidHandCount(tiles)) continue;
    tiles.sort((a, b) => a - b);
    const options = analyzeDiscards(tiles).options;
    if (hasGoodTeachingQuality(options)) return { hand: tiles, options };
  }
  return null;
}

// ── 紧缩进张差距手牌（中级极限） ───────────────────────────────
function buildTightUkeireHand14() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = buildOneShantenHand14();
    if (result.options.length >= 2 && result.options[0].ukeire - result.options[1].ukeire <= 1) return result;
  }
  return null;
}

// 判断牌是否孤立（无搭子价值）
function isTileIsolated(tile, hand) {
  if (isHonor(tile)) return hand.filter(t => t === tile).length === 1;
  const suit = Math.floor(tile / 10), rank = tile % 10;
  if (hand.filter(t => t === tile).length >= 2) return false;
  return !hand.some(t => Math.floor(t / 10) === suit && t !== tile && Math.abs((t % 10) - rank) <= 2);
}

// ═══════════════════════════════════════════════════════════════
// localStorage 持久化工具
// ═══════════════════════════════════════════════════════════════
const STATS_KEY    = 'mj_stats_v1';
const MISTAKES_KEY = 'mj_mistakes_v1';
const MAX_MISTAKES = 50;

const emptyLevelStats = () => ({ total: 0, correct: 0, currentStreak: 0, bestStreak: 0 });
const emptyStats = () => ({ beginner: emptyLevelStats(), intermediate: emptyLevelStats(), advanced: emptyLevelStats() });

function loadStats() {
  try { const r = localStorage.getItem(STATS_KEY); return r ? JSON.parse(r) : emptyStats(); }
  catch { return emptyStats(); }
}
function saveStats(s) { try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {} }
function loadMistakes() {
  try { const r = localStorage.getItem(MISTAKES_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
function saveMistakes(m) { try { localStorage.setItem(MISTAKES_KEY, JSON.stringify(m)); } catch {} }

// ═══════════════════════════════════════════════════════════════
// 弱点诊断：错误分类
// ═══════════════════════════════════════════════════════════════
const TAG_COLOR = {
  wrong_wait:          '#3498db',
  low_ukeire_major:    '#e74c3c',
  low_ukeire:          '#e67e22',
  unsafe_tile:         '#9b59b6',
  missed_honor_first:  '#1abc9c',
  complex_split:       '#7f8c8d',
  low_fan:             '#f1c40f',
  other:               '#95a5a6',
};

const TAG_LABEL = {
  wrong_wait:         { zh: '误判听牌张',     en: 'Missed winning tile' },
  low_ukeire_major:   { zh: '严重放弃进张',   en: 'Major ukeire loss' },
  low_ukeire:         { zh: '进张面不足',     en: 'Insufficient ukeire' },
  unsafe_tile:        { zh: '打出危险生张',   en: 'Unsafe tile discarded' },
  missed_honor_first: { zh: '未字牌先行',     en: 'Missed honor-first' },
  complex_split:      { zh: '复合搭子拆解失误', en: 'Complex taatsu error' },
  low_fan:            { zh: '忽视番数潜力',   en: 'Lower fan potential' },
  other:              { zh: '综合判断失误',   en: 'Misjudgement' },
};

function classifyError(level, q, selected) {
  if (level === 'beginner') return 'wrong_wait';
  const opts = q._options || [];
  const selOpt  = opts.find(o => o.discard === selected);
  const bestOpt = opts[0];
  if (!selOpt || !bestOpt) return 'other';
  const ukeireDiff = bestOpt.ukeire - selOpt.ukeire;
  if (ukeireDiff >= 3) return 'low_ukeire_major';
  if (ukeireDiff >= 1) return 'low_ukeire';
  if (selOpt.maxFan < bestOpt.maxFan) return 'low_fan';
  if (level === 'advanced' && (selOpt.safetyCount || 0) < (bestOpt.safetyCount || 0)) return 'unsafe_tile';
  if (isHonor(bestOpt.discard) && !isHonor(selected)) return 'missed_honor_first';
  return 'complex_split';
}

// ── 弱点诊断文本（基于错题历史统计） ──────────────────────────
function computeDiagnosis(mistakes, lang) {
  const isZh = lang !== 'en';
  if (mistakes.length < 3) {
    return isZh ? '数据积累中，继续答题以获取个性化诊断...' : 'Keep answering to unlock your personalized diagnosis...';
  }
  const tagCounts = {};
  for (const m of mistakes) tagCounts[m.errorTag] = (tagCounts[m.errorTag] || 0) + 1;
  const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0][0];
  const DIAG = {
    zh: {
      wrong_wait:          '🔍 听牌识别准确度有待提升——多练习边张（12等3）、坎张（13等2）、单吊（孤张等碰）等基础等待类型。',
      low_ukeire_major:    '⚠️ 进张意识薄弱：多次大量放弃进张，需重点练习「进张最广」原则，先保数量再看质量。',
      low_ukeire:          '📈 进张分析尚可，但仍有盲区——注意复合搭子的多义分拆，找到进张最广的切法。',
      unsafe_tile:         '🛡️ 效率感不错，但防守判断需提升——高级场多观察牌河熟张（绿色标记），避免打出生张。',
      missed_honor_first:  '🀄 注意字牌先行原则——孤立字牌无法入顺/刻，是第一优先舍弃的目标。',
      complex_split:       '🧩 基础判断稳健，但复合搭子是弱点——面对23345、44556等5张连块，多试不同分拆方式。',
      low_fan:             '💎 进张数掌握尚好，但番数评估有待加强——进张相同时，优先选保留高番可能的切法。',
      other:               '🎯 整体表现有提升空间，建议从初级开始系统练习基础听牌识别。',
    },
    en: {
      wrong_wait:          '🔍 Tenpai recognition needs work — drill penchan (12→3), kanchan (13→2), and tanki waits.',
      low_ukeire_major:    '⚠️ Ukeire awareness is weak. You frequently sacrifice large numbers of winning tiles. Prioritize maximizing your waits.',
      low_ukeire:          '📈 Ukeire sense is developing. Watch for compound blocks (23345, 44556) that hide wider waits.',
      unsafe_tile:         '🛡️ Good efficiency sense, but defense needs work. In advanced mode, check the river for safe/unsafe tiles.',
      missed_honor_first:  '🀄 Practice the honor-first rule — isolated honors should always be the first discarded.',
      complex_split:       '🧩 Solid fundamentals, but complex taatsu splitting is your weakness. Study 5-tile block decompositions.',
      low_fan:             '💎 Ukeire sense is OK, but fan potential needs more attention when options are tied.',
      other:               '🎯 Overall performance has room to grow. Start with beginner tenpai recognition for a solid foundation.',
    },
  };
  return (isZh ? DIAG.zh : DIAG.en)[topTag] || (isZh ? '继续练习中...' : 'Keep practicing...');
}

// ═══════════════════════════════════════════════════════════════
// 解析文案构建
// ═══════════════════════════════════════════════════════════════
function buildExplanation(hand, options, bestTile, river, lang) {
  const isZh = lang !== 'en';
  const nm = (code) => tileName(code, lang);
  const best = options.find(o => o.discard === bestTile) || options[0];
  const riverCount = {};
  if (river) for (const t of river) riverCount[t] = (riverCount[t] || 0) + 1;
  const isIsolated  = isTileIsolated(bestTile, hand);
  const isHonorTile = isHonor(bestTile);
  const isTermTile  = isTerminal(bestTile);
  const seenCount   = riverCount[bestTile] || 0;

  let r1 = '';
  if (isHonorTile && isIsolated) {
    r1 = isZh
      ? `①【孤张先走 · 字牌先行】${nm(bestTile)}是孤立字牌，无法组成顺子或刻子，毫无搭子价值，第一时间打出。`
      : `①【Honor tiles first】${nm(bestTile)} is an isolated honor tile — no meld value. Discard immediately.`;
  } else if (isTermTile && isIsolated) {
    r1 = isZh
      ? `①【边张易牺牲】${nm(bestTile)}是孤立幺九牌，顺子潜力单侧受限，无对子加成，优先舍弃。`
      : `①【Edge tiles sacrifice first】${nm(bestTile)} is an isolated terminal — one-sided only, no pair value.`;
  } else {
    r1 = isZh
      ? `①【进张最广】打${nm(bestTile)}后手牌可进${best.ukeire}种牌，在所有选项中进张数最多。`
      : `①【Maximize winning tiles】Discarding ${nm(bestTile)} leaves ${best.ukeire} winning tile type(s) — the best.`;
  }
  const r2 = isZh
    ? `②【进张分析】打${nm(bestTile)}后可进${best.ukeire}种牌${best.maxFan > 0 ? `，最高可达${best.maxFan}番` : ''}。`
    : `②【Winning tiles】After discarding ${nm(bestTile)}: ${best.ukeire} type(s)${best.maxFan > 0 ? `, up to ${best.maxFan} fan` : ''}.`;
  let r3 = '';
  if (river) {
    if (seenCount >= 2) r3 = isZh ? `③【危险打熟张】${nm(bestTile)}在牌河已出现${seenCount}次（熟张），安全度极佳——进张最优，安全性也最佳，双赢。` : `③【Seen tile safety】${nm(bestTile)} appeared ${seenCount}× in river — top efficiency AND top safety. Win-win.`;
    else if (seenCount === 1) r3 = isZh ? `③【牌河参考】${nm(bestTile)}已在牌河出现1次，有一定安全度，但本题决策核心是进张面更广。` : `③【River note】${nm(bestTile)} seen 1× in river — some safety, but the key reason is wider winning tiles.`;
    else r3 = isZh ? `③【进张优先】${nm(bestTile)}虽未在牌河出现，但进张面显著优于其他选项，胡牌效率始终是第一顺位。` : `③【Efficiency first】${nm(bestTile)} unseen in river, but winning tile count is clearly superior.`;
  }
  const wrongOpts = options.filter(o => o.discard !== bestTile).slice(0, 2);
  const comparisons = wrongOpts.map(w => {
    const diff = best.ukeire - w.ukeire;
    if (isZh) {
      let line = `若打${nm(w.discard)}：进张${w.ukeire}种`;
      if (diff > 0)                         line += `，比最优少${diff}种——进张面明显劣势`;
      else if (w.maxFan < best.maxFan)      line += `，进张数相同但最高番数低（${w.maxFan}番 vs ${best.maxFan}番）`;
      else if (river && (w.safetyCount||0) < seenCount) line += `，进张与番数均相同，但安全度低于最优`;
      return line + '。';
    } else {
      let line = `Discarding ${nm(w.discard)}: ${w.ukeire} winning tile(s)`;
      if (diff > 0)                         line += ` — ${diff} fewer, clearly suboptimal`;
      else if (w.maxFan < best.maxFan)      line += ` — same count, lower max fan (${w.maxFan} vs ${best.maxFan})`;
      else if (river && (w.safetyCount||0) < seenCount) line += ` — same efficiency, less safe`;
      return line + '.';
    }
  });
  return [r1, r2, r3, ...comparisons].filter(Boolean).join('\n\n');
}

function buildBeginnerExplanation(waitTiles, lang) {
  const isZh = lang !== 'en';
  if (waitTiles.length === 0) return isZh ? '这手牌尚未听牌。' : 'This hand is not in tenpai.';
  const names = waitTiles.map(w => tileName(w.tile, lang)).join(isZh ? '、' : ', ');
  const topFan = waitTiles[0]?.totalFan || 0;
  let text = isZh ? `这手牌听【${names}】。\n\n` : `This hand waits for: ${names}.\n\n`;
  text += waitTiles.length > 1
    ? (isZh ? `共有${waitTiles.length}种胡牌张，任选其一均为正确答案。` : `${waitTiles.length} winning tiles — any one is correct.`)
    : (isZh ? '这是单一等待（单钓将/坎张/边张），只有唯一胡牌张。' : 'Single-tile wait (tanki/kanchan/penchan) — only one winning tile.');
  if (topFan >= 8) text += isZh ? `\n\n和牌番数：${topFan}番。` : `\n\nWinning fan: ${topFan}.`;
  return text.trim();
}

function identifyPrinciple(bestTile, hand, river) {
  const riverCount = {};
  if (river) for (const t of river) riverCount[t] = (riverCount[t] || 0) + 1;
  const zh = [], en = [];
  if (isHonor(bestTile) && isTileIsolated(bestTile, hand)) { zh.push('孤张先走'); en.push('Isolated tiles first'); }
  if (isTerminal(bestTile) && isTileIsolated(bestTile, hand)) { zh.push('边张易牺牲'); en.push('Edge tiles sacrifice'); }
  if (river && (riverCount[bestTile] || 0) >= 1) { zh.push('危险打熟张'); en.push('Discard seen tiles'); }
  if (zh.length === 0) { zh.push('进张最广'); en.push('Maximize winning tiles'); }
  return { zh: zh.join(' · '), en: en.join(' · ') };
}

// ═══════════════════════════════════════════════════════════════
// 教学质量过滤
// ═══════════════════════════════════════════════════════════════
function hasGoodTeachingQuality(options) {
  const best = options[0]?.ukeire ?? 0;
  if (best < 2) return false;
  const top4 = options.slice(0, Math.min(4, options.length)).map(o => o.ukeire);
  return new Set(top4).size >= 2;
}

// ═══════════════════════════════════════════════════════════════
// 手牌生成（三难度 + round驱动动态难度）
// ═══════════════════════════════════════════════════════════════
function generateSingleHand(level, round) {
  if (level === 'beginner')     return genBeginner(round);
  if (level === 'intermediate') return genIntermediate(round);
  return genAdvanced(round);
}

function genBeginner(round) {
  let hand13 = null, waitTiles = null;
  if (round < 7) {
    const typePool = round < 3 ? ['tanki', 'edge', 'kanchan'] : ['kanchan', 'twosided'];
    const result = buildWaitHand13(typePool[randInt(typePool.length)]);
    if (result) { hand13 = result.hand13; waitTiles = result.waitTiles; }
  }
  if (!hand13) {
    for (let a = 0; a < 50; a++) {
      const h14 = dealFromWall(14);
      const opt = analyzeDiscards(h14).options.find(o => o.waitingTiles.length >= 1);
      if (!opt) continue;
      const idx = h14.findIndex(t => t === opt.discard);
      const h13 = [...h14.slice(0, idx), ...h14.slice(idx + 1)];
      const r = analyzeTenpai(h13);
      if (r.waitingTiles.length === 0) continue;
      hand13 = h13; waitTiles = r.waitingTiles; break;
    }
  }
  if (!hand13) return genBeginner(round);
  const maxCorrect = round < 3 ? 1 : 2;
  const answerTiles = waitTiles.slice(0, Math.min(maxCorrect, waitTiles.length)).map(w => w.tile);
  const allWaitCodes = new Set(waitTiles.map(w => w.tile));
  const wrongPool = ALL_TILES.filter(t => !allWaitCodes.has(t)).sort(() => Math.random() - 0.5);
  const choices = [...answerTiles, ...wrongPool.slice(0, 4 - answerTiles.length)].sort(() => Math.random() - 0.5);
  return {
    hand: hand13, choices, answers: answerTiles,
    prompt: { zh: '下面哪张牌能让这手牌和牌？', en: 'Which tile completes this hand?', de: 'Welcher Stein vervollständigt diese Hand?' },
    explanation: { zh: buildBeginnerExplanation(waitTiles, 'zh'), en: buildBeginnerExplanation(waitTiles, 'en'), de: buildBeginnerExplanation(waitTiles, 'en') },
  };
}

function genIntermediate(round) {
  let result;
  if (round < 5)       result = buildOneShantenHand14();
  else if (round < 10) result = buildCompoundHand14() || buildOneShantenHand14();
  else                 result = buildTightUkeireHand14() || buildOneShantenHand14();
  const { hand: hand14, options } = result;
  const best = options[0];
  const answers = options.filter(o => o.ukeire === best.ukeire && o.maxFan === best.maxFan).map(o => o.discard);
  const choices = options.slice(0, Math.min(4, options.length)).map(o => o.discard).sort(() => Math.random() - 0.5);
  return {
    hand: hand14, choices, answers,
    prompt: { zh: '打出哪张牌能保留最广的进张？', en: 'Which discard keeps the most winning tiles?', de: 'Welcher Abwurf behält die meisten Wartemöglichkeiten?' },
    explanation: { zh: buildExplanation(hand14, options, answers[0], null, 'zh'), en: buildExplanation(hand14, options, answers[0], null, 'en'), de: buildExplanation(hand14, options, answers[0], null, 'en') },
    principle: identifyPrinciple(answers[0], hand14, null),
    _options: options,
  };
}

function genAdvanced(round) {
  const riverLen = Math.min(5 + round + randInt(4), 20);
  const riverCandidates = [];
  for (const t of ALL_TILES) {
    if (isHonor(t))         riverCandidates.push(t, t, t);
    else if (isTerminal(t)) riverCandidates.push(t, t);
    else                    riverCandidates.push(t);
  }
  const makeRiver = (forceTile, forceCount) => {
    const r = [];
    if (forceTile != null) for (let i = 0; i < forceCount; i++) r.push(forceTile);
    while (r.length < riverLen) r.push(riverCandidates[randInt(riverCandidates.length)]);
    for (let i = r.length - 1; i > 0; i--) { const j = randInt(i+1); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  };

  if (round >= 10) {
    for (let attempt = 0; attempt < 80; attempt++) {
      const { hand, options: baseOpts } = buildOneShantenHand14();
      if (baseOpts.length < 2 || baseOpts[0].ukeire !== baseOpts[1].ukeire) continue;
      const safeDiscard = baseOpts[0].discard;
      const forceCount  = 2 + randInt(2);
      const river       = makeRiver(safeDiscard, forceCount);
      const riverCount  = {};
      for (const t of river) riverCount[t] = (riverCount[t] || 0) + 1;
      if ((riverCount[baseOpts[1].discard] || 0) >= forceCount) continue;
      const scored = baseOpts.map(o => ({ ...o, safetyCount: riverCount[o.discard] || 0 }))
        .sort((a, b) => b.ukeire - a.ukeire || b.maxFan - a.maxFan || b.safetyCount - a.safetyCount);
      const best    = scored[0];
      const answers = scored.filter(o => o.ukeire === best.ukeire && o.maxFan === best.maxFan && o.safetyCount === best.safetyCount).map(o => o.discard);
      if (!answers.length) continue;
      const choices = scored.slice(0, Math.min(4, scored.length)).map(o => o.discard).sort(() => Math.random() - 0.5);
      const seenHonors = Object.entries(riverCount).filter(([t, c]) => isHonor(+t) && c >= 2).length;
      return {
        hand, choices, answers, river, riverCount,
        context: {
          zh: `【极限局】进张数完全并列！必须依靠牌河熟张（绿色标记）判断安全度。${seenHonors > 0 ? `${seenHonors}种字牌多次出现，` : ''}仔细观察牌河，哪张更安全？`,
          en: `[Extreme] Winning tile counts are TIED! Use river safety (green = seen tiles) as the ONLY tiebreaker.`,
          de: `[Extrem] Gewinn-Kacheln sind gleichauf! Nur Flusssicherheit (grün) entscheidet.`,
        },
        prompt: { zh: '进张数相同，哪张更安全？（看牌河！）', en: 'Equal winning tiles — which is safer? (Check the river!)', de: 'Gleichstand — welcher Abwurf ist sicherer? (Fluss!)' },
        explanation: { zh: buildExplanation(hand, scored, answers[0], river, 'zh'), en: buildExplanation(hand, scored, answers[0], river, 'en'), de: buildExplanation(hand, scored, answers[0], river, 'en') },
        principle: identifyPrinciple(answers[0], hand, river),
        _options: scored,
      };
    }
  }

  let hand14, baseOptions;
  if (round >= 5) {
    let found = false;
    for (let a = 0; a < 40; a++) {
      const r = buildOneShantenHand14();
      if (r.options.length >= 2 && r.options[0].ukeire - r.options[1].ukeire <= 2) { hand14 = r.hand; baseOptions = r.options; found = true; break; }
    }
    if (!found) { const r = buildOneShantenHand14(); hand14 = r.hand; baseOptions = r.options; }
  } else { const r = buildOneShantenHand14(); hand14 = r.hand; baseOptions = r.options; }

  const river = makeRiver(null, 0);
  const riverCount = {};
  for (const t of river) riverCount[t] = (riverCount[t] || 0) + 1;
  const scored = baseOptions.map(o => ({ ...o, safetyCount: riverCount[o.discard] || 0 }))
    .sort((a, b) => b.ukeire - a.ukeire || b.maxFan - a.maxFan || b.safetyCount - a.safetyCount);
  const best    = scored[0];
  const answers = scored.filter(o => o.ukeire === best.ukeire && o.maxFan === best.maxFan && o.safetyCount === best.safetyCount).map(o => o.discard);
  const choices = scored.slice(0, Math.min(4, scored.length)).map(o => o.discard).sort(() => Math.random() - 0.5);
  const roundDisp = 5 + randInt(6);
  const seenHonors = Object.entries(riverCount).filter(([t, c]) => isHonor(+t) && c >= 2).length;
  return {
    hand: hand14, choices, answers, river, riverCount,
    context: {
      zh: `第${roundDisp}巡。牌河已有${riverLen}张，${seenHonors > 0 ? `${seenHonors}种字牌出现两张以上（绿色标记为熟张）。` : '字牌流动活跃。'}综合进张与安全，选出最优打法。`,
      en: `Round ${roundDisp}. River: ${riverLen} tiles. ${seenHonors > 0 ? `${seenHonors} honor type(s) seen 2+ times (green = seen).` : 'Honors flowing freely.'} Balance efficiency and safety.`,
      de: `Runde ${roundDisp}. Ablage: ${riverLen} Steine. ${seenHonors > 0 ? `${seenHonors} Ehrentypen 2× gesehen.` : ''} Effizienz + Sicherheit abwägen.`,
    },
    prompt: { zh: '打出哪张牌既安全又能保住进张？', en: 'Which discard is both safe and keeps your wait intact?', de: 'Welcher Abwurf ist sicher und behält die Wartestruktur?' },
    explanation: { zh: buildExplanation(hand14, scored, answers[0], river, 'zh'), en: buildExplanation(hand14, scored, answers[0], river, 'en'), de: buildExplanation(hand14, scored, answers[0], river, 'en') },
    principle: identifyPrinciple(answers[0], hand14, river),
    _options: scored,
  };
}

// ═══════════════════════════════════════════════════════════════
// 常量 & 多语言
// ═══════════════════════════════════════════════════════════════
const LEVELS     = ['beginner', 'intermediate', 'advanced'];
const LEVEL_EMOJI = { beginner: '🌱', intermediate: '🎯', advanced: '⚔️' };
const LEVEL_COLOR = { beginner: '#2ecc71', intermediate: '#f39c12', advanced: '#e74c3c' };

const TRi18n = {
  zh: {
    levels:        { beginner: '初级', intermediate: '中级', advanced: '高级' },
    levelDesc:     { beginner: '听牌识别', intermediate: '进阶判断', advanced: '实战情境' },
    streak:        (n) => `已完成：${n} 局`,
    handLabel:     '你的手牌',
    riverLabel:    '牌河（已打出）',
    confirm:       '确认答案',
    next:          '下一局 →',
    correct:       '✓ 正确！',
    wrong:         '✗ 不对，看看解析',
    answerLabel:   '名师解析',
    principleLabel:'战略口诀',
    generating:    '正在发牌...',
    // 战绩 & 错题本
    statsBtn:      '战绩',
    mistakesBtn:   (n) => `错题本${n > 0 ? ` (${n})` : ''}`,
    statsTitle:    '个人战绩',
    mistakesTitle: '错题本',
    colTotal:      '总局',
    colAccuracy:   '正确率',
    colCurStreak:  '当前连胜',
    colBestStreak: '最高连胜',
    weaknessLabel: '弱点诊断',
    noMistakes:    '暂无错题，继续加油！',
    yourChoice:    '你选',
    correctAns:    '正确',
    clearAll:      '清空错题本',
    clearConfirm:  '确认清空全部错题？',
    close:         '关闭',
    page:          (cur, tot) => `${cur} / ${tot}`,
  },
  en: {
    levels:        { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
    levelDesc:     { beginner: 'Tenpai', intermediate: 'Strategy', advanced: 'Situational' },
    streak:        (n) => `Completed: ${n}`,
    handLabel:     'Your Hand',
    riverLabel:    'River (discarded)',
    confirm:       'Confirm',
    next:          'Next →',
    correct:       '✓ Correct!',
    wrong:         '✗ Wrong — check the explanation',
    answerLabel:   'Expert Analysis',
    principleLabel:'Strategy Tip',
    generating:    'Dealing hand...',
    statsBtn:      'Stats',
    mistakesBtn:   (n) => `Mistakes${n > 0 ? ` (${n})` : ''}`,
    statsTitle:    'My Stats',
    mistakesTitle: 'Mistakes Book',
    colTotal:      'Total',
    colAccuracy:   'Accuracy',
    colCurStreak:  'Cur. Streak',
    colBestStreak: 'Best Streak',
    weaknessLabel: 'Weakness Analysis',
    noMistakes:    'No mistakes yet — keep it up!',
    yourChoice:    'You chose',
    correctAns:    'Correct',
    clearAll:      'Clear all',
    clearConfirm:  'Clear all mistakes?',
    close:         'Close',
    page:          (cur, tot) => `${cur} / ${tot}`,
  },
  de: {
    levels:        { beginner: 'Anfänger', intermediate: 'Mittel', advanced: 'Fortgeschr.' },
    levelDesc:     { beginner: 'Tenpai', intermediate: 'Strategie', advanced: 'Situativ' },
    streak:        (n) => `Absolviert: ${n}`,
    handLabel:     'Deine Hand',
    riverLabel:    'Ablagestapel',
    confirm:       'Bestätigen',
    next:          'Nächste →',
    correct:       '✓ Richtig!',
    wrong:         '✗ Falsch — Erklärung lesen',
    answerLabel:   'Expertenanalyse',
    principleLabel:'Strategie-Tipp',
    generating:    'Karten werden ausgeteilt...',
    statsBtn:      'Statistik',
    mistakesBtn:   (n) => `Fehler${n > 0 ? ` (${n})` : ''}`,
    statsTitle:    'Meine Statistik',
    mistakesTitle: 'Fehlerbuch',
    colTotal:      'Gesamt',
    colAccuracy:   'Genauigkeit',
    colCurStreak:  'Serie',
    colBestStreak: 'Beste Serie',
    weaknessLabel: 'Schwachstellen',
    noMistakes:    'Noch keine Fehler — weiter so!',
    yourChoice:    'Gewählt',
    correctAns:    'Richtig',
    clearAll:      'Alle löschen',
    clearConfirm:  'Alle Fehler löschen?',
    close:         'Schließen',
    page:          (cur, tot) => `${cur} / ${tot}`,
  },
};

// ═══════════════════════════════════════════════════════════════
// 个人战绩弹窗
// ═══════════════════════════════════════════════════════════════
function StatsModal({ stats, mistakes, lang, onClose }) {
  const tr   = TRi18n[lang] || TRi18n.zh;
  const isZh = lang !== 'en';
  const diagnosis = computeDiagnosis(mistakes, lang);

  const pct = (s) => s.total > 0 ? Math.round(s.correct / s.total * 100) + '%' : '—';

  return (
    <div style={OVERLAY_STYLE} onClick={onClose}>
      <div style={{ ...MODAL_STYLE, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>📊 {tr.statsTitle}</span>
          <button onClick={onClose} style={CLOSE_BTN_STYLE}>✕</button>
        </div>

        {/* Stats table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#888', fontSize: 11 }}>
              <th style={TH}>{isZh ? '难度' : 'Level'}</th>
              <th style={TH}>{tr.colTotal}</th>
              <th style={TH}>{tr.colAccuracy}</th>
              <th style={TH}>{tr.colCurStreak}</th>
              <th style={TH}>{tr.colBestStreak}</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map(lv => {
              const s = stats[lv] || emptyLevelStats();
              return (
                <tr key={lv} style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <td style={TD}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>{LEVEL_EMOJI[lv]}</span>
                      <span style={{ color: LEVEL_COLOR[lv], fontWeight: 600 }}>{tr.levels[lv]}</span>
                    </span>
                  </td>
                  <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{s.total}</td>
                  <td style={{ ...TD, textAlign: 'center', color: s.total > 0 ? (s.correct / s.total >= 0.6 ? '#2ecc71' : '#e67e22') : '#888' }}>{pct(s)}</td>
                  <td style={{ ...TD, textAlign: 'center' }}>{'🔥'.repeat(Math.min(s.currentStreak, 5))}{s.currentStreak > 5 ? `+${s.currentStreak - 5}` : s.currentStreak === 0 ? '—' : ''}</td>
                  <td style={{ ...TD, textAlign: 'center', color: '#f1c40f' }}>{s.bestStreak > 0 ? s.bestStreak : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Weakness diagnosis */}
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, borderLeft: '3px solid #3498db' }}>
          <div style={{ fontSize: 11, color: '#3498db', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            {tr.weaknessLabel}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--fg, #e0e0e0)' }}>{diagnosis}</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 错题本弹窗
// ═══════════════════════════════════════════════════════════════
const MISTAKES_PER_PAGE = 5;

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function MistakesModal({ mistakes, setMistakes, lang, onClose }) {
  const [page, setPage] = useState(0);
  const tr   = TRi18n[lang] || TRi18n.zh;
  const isZh = lang !== 'en';
  const totalPages = Math.ceil(mistakes.length / MISTAKES_PER_PAGE);
  const pageMistakes = mistakes.slice(page * MISTAKES_PER_PAGE, (page + 1) * MISTAKES_PER_PAGE);

  const handleClear = () => {
    if (window.confirm(tr.clearConfirm)) {
      saveMistakes([]);
      setMistakes([]);
      setPage(0);
    }
  };

  return (
    <div style={OVERLAY_STYLE} onClick={onClose}>
      <div style={{ ...MODAL_STYLE, maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>📖 {tr.mistakesTitle} {mistakes.length > 0 && <span style={{ fontSize: 13, color: '#888' }}>({mistakes.length})</span>}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {mistakes.length > 0 && (
              <button onClick={handleClear} style={{ ...CLOSE_BTN_STYLE, fontSize: 11, padding: '4px 8px', color: '#e74c3c', borderColor: '#e74c3c33' }}>
                {tr.clearAll}
              </button>
            )}
            <button onClick={onClose} style={CLOSE_BTN_STYLE}>✕</button>
          </div>
        </div>

        {mistakes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '32px 0', fontSize: 14 }}>
            ✨ {tr.noMistakes}
          </div>
        ) : (
          <>
            {pageMistakes.map((m, idx) => {
              const tag   = m.errorTag || 'other';
              const color = TAG_COLOR[tag] || '#888';
              const label = (TAG_LABEL[tag] || {})[lang] || (TAG_LABEL[tag] || {}).zh || tag;
              return (
                <div key={m.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14, marginBottom: 14 }}>
                  {/* Row 1: level + date + tag */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: LEVEL_COLOR[m.level] + '33', color: LEVEL_COLOR[m.level], fontWeight: 700, border: `1px solid ${LEVEL_COLOR[m.level]}55` }}>
                      {LEVEL_EMOJI[m.level]} {(TRi18n[lang] || TRi18n.zh).levels[m.level]}
                    </span>
                    <span style={{ fontSize: 11, color: '#666' }}>{formatDate(m.timestamp)}</span>
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: color + '22', color, border: `1px solid ${color}44` }}>
                      {label}
                    </span>
                  </div>

                  {/* Row 2: hand tiles */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: '#666', minWidth: 28 }}>{isZh ? '手牌' : 'Hand'}</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {m.hand.map((t, i) => <TileView key={i} tile={t} scale={0.13} />)}
                    </div>
                  </div>

                  {/* Row 3: river (if any, capped at 10 tiles shown) */}
                  {m.river && m.river.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: '#666', minWidth: 28 }}>{isZh ? '牌河' : 'River'}</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {m.river.slice(0, 10).map((t, i) => <TileView key={i} tile={t} scale={0.11} seen={(m.riverCount?.[t] || 0) >= 2} />)}
                        {m.river.length > 10 && <span style={{ fontSize: 10, color: '#666', alignSelf: 'center' }}>+{m.river.length - 10}</span>}
                      </div>
                    </div>
                  )}

                  {/* Row 4: wrong choice vs correct answers */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10, color: '#e74c3c', fontWeight: 600 }}>✗ {tr.yourChoice}</span>
                      <div style={{ outline: '2px solid #e74c3c', borderRadius: 3 }}>
                        <TileView tile={m.selected} scale={0.19} />
                      </div>
                    </div>
                    <span style={{ color: '#555', fontSize: 14 }}>→</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10, color: '#27ae60', fontWeight: 600 }}>✓ {tr.correctAns}</span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {m.answers.map(a => (
                          <div key={a} style={{ outline: '2px solid #27ae60', borderRadius: 3 }}>
                            <TileView tile={a} scale={0.19} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  style={{ ...NAV_BTN_STYLE, opacity: page === 0 ? 0.35 : 1 }}
                >◀</button>
                <span style={{ fontSize: 12, color: '#888' }}>{tr.page(page + 1, totalPages)}</span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  style={{ ...NAV_BTN_STYLE, opacity: page >= totalPages - 1 ? 0.35 : 1 }}
                >▶</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── 共用样式常量 ──────────────────────────────────────────────
const OVERLAY_STYLE = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.6)', zIndex: 200,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
};
const MODAL_STYLE = {
  background: 'var(--card-bg, #1e2a3a)',
  borderRadius: 16, padding: '20px 20px 16px',
  width: '100%', maxHeight: '80vh', overflowY: 'auto',
  boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
};
const CLOSE_BTN_STYLE = {
  background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6,
  color: 'var(--fg, #e0e0e0)', cursor: 'pointer', padding: '4px 10px', fontSize: 13,
};
const NAV_BTN_STYLE = {
  background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6,
  color: 'var(--fg, #e0e0e0)', cursor: 'pointer', padding: '4px 14px', fontSize: 14,
};
const TH = { padding: '6px 8px', textAlign: 'center', fontWeight: 600 };
const TD = { padding: '8px 8px' };

// ═══════════════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════════════
export default function TrainingRoom({ lang }) {
  const [level,        setLevel]        = useState('beginner');
  const [streak,       setStreak]       = useState(0);
  const [genTick,      setGenTick]      = useState(0);
  const [currentQ,     setCurrentQ]     = useState(null);
  const [generating,   setGenerating]   = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [revealed,     setRevealed]     = useState(false);
  // 持久化数据
  const [stats,        setStats]        = useState(loadStats);
  const [mistakes,     setMistakes]     = useState(loadMistakes);
  // 弹窗开关
  const [showStats,    setShowStats]    = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);

  const tr        = TRi18n[lang] || TRi18n.zh;
  const isCorrect = revealed && currentQ && currentQ.answers.includes(selected);
  const tier      = getDifficultyTier(streak);

  useEffect(() => {
    setGenerating(true);
    setCurrentQ(null);
    setSelected(null);
    setRevealed(false);
    const timer = setTimeout(() => {
      try { setCurrentQ(generateSingleHand(level, streak)); } catch (e) { console.error(e); }
      setGenerating(false);
    }, 30);
    return () => clearTimeout(timer);
  }, [level, genTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeLevel = (lv) => {
    if (lv === level) return;
    setLevel(lv);
    setStreak(0);
    setGenTick(0);
  };

  const handleSelect  = (tile) => { if (!revealed) setSelected(tile); };

  const handleConfirm = () => {
    if (selected === null) return;
    setRevealed(true);

    const correct = currentQ.answers.includes(selected);

    // ── 更新战绩 ──────────────────────────────────────────────
    setStats(prev => {
      const ls = prev[level] || emptyLevelStats();
      const newStreak = correct ? ls.currentStreak + 1 : 0;
      const updated = {
        ...prev,
        [level]: {
          total:         ls.total + 1,
          correct:       ls.correct + (correct ? 1 : 0),
          currentStreak: newStreak,
          bestStreak:    Math.max(ls.bestStreak, newStreak),
        },
      };
      saveStats(updated);
      return updated;
    });

    // ── 记录错题 ──────────────────────────────────────────────
    if (!correct) {
      const tag     = classifyError(level, currentQ, selected);
      const mistake = {
        id:         Date.now(),
        level,
        hand:       currentQ.hand,
        choices:    currentQ.choices,
        river:      currentQ.river     || null,
        riverCount: currentQ.riverCount || null,
        answers:    currentQ.answers,
        selected,
        errorTag:   tag,
        errorLabel: TAG_LABEL[tag] || { zh: '其他', en: 'Other' },
        timestamp:  Date.now(),
      };
      setMistakes(prev => {
        const updated = [mistake, ...prev].slice(0, MAX_MISTAKES);
        saveMistakes(updated);
        return updated;
      });
    }
  };

  const handleNext = () => {
    setStreak(s => s + 1);
    setGenTick(t => t + 1);
  };

  const renderText = (text) =>
    (text || '').split('\n').map((line, i, arr) => (
      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
    ));

  const q = currentQ;

  return (
    <div className="tr-wrap">

      {/* 弹窗 */}
      {showStats    && <StatsModal    stats={stats} mistakes={mistakes} lang={lang} onClose={() => setShowStats(false)} />}
      {showMistakes && <MistakesModal mistakes={mistakes} setMistakes={setMistakes} lang={lang} onClose={() => setShowMistakes(false)} />}

      {/* 难度选择栏 */}
      <div className="tr-level-bar">
        {LEVELS.map(lv => (
          <button
            key={lv}
            className={`tr-level-btn ${level === lv ? 'tr-level-btn-active' : ''}`}
            onClick={() => changeLevel(lv)}
          >
            <span className="tr-level-emoji">{LEVEL_EMOJI[lv]}</span>
            <span className="tr-level-name">{tr.levels[lv]}</span>
            <span className="tr-level-desc">{tr.levelDesc[lv]}</span>
          </button>
        ))}
      </div>

      {/* 工具栏：战绩 + 错题本 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '6px 4px 2px' }}>
        <button
          onClick={() => setShowStats(true)}
          style={{ ...UTIL_BTN_STYLE }}
        >
          📊 {tr.statsBtn}
          {(() => {
            const ls = stats[level] || emptyLevelStats();
            return ls.total > 0 ? <span style={{ marginLeft: 4, fontSize: 11, color: '#888' }}>{Math.round(ls.correct / ls.total * 100)}%</span> : null;
          })()}
        </button>
        <button
          onClick={() => setShowMistakes(true)}
          style={{ ...UTIL_BTN_STYLE, ...(mistakes.length > 0 ? { color: '#e67e22', borderColor: '#e67e2244' } : {}) }}
        >
          📖 {tr.mistakesBtn(mistakes.length)}
        </button>
      </div>

      {/* 发牌加载中 */}
      {(generating || !q) ? (
        <div className="tr-card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--fg-muted, #999)' }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🀄</div>
          <div style={{ fontSize: 14 }}>{tr.generating}</div>
        </div>
      ) : (
        <div className="tr-card">

          {/* 头部：已完成局数 + 难度星级 + 战略标签 */}
          <div className="tr-q-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="tr-q-num">{tr.streak(streak)}</span>
              <span style={{ fontSize: 11, color: tier.color, fontWeight: 700, letterSpacing: 2, fontFamily: 'monospace' }}>
                {tier.stars}
              </span>
            </div>
            {q.principle && (
              <span className="tr-principle-tag">
                {q.principle[lang] || q.principle.zh || q.principle.en}
              </span>
            )}
          </div>

          {/* 牌河（高级专用） */}
          {q.river && (
            <div>
              <div className="tr-section-label">{tr.riverLabel}</div>
              <div className="tr-river">
                {q.river.map((tile, i) => (
                  <TileView key={i} tile={tile} scale={0.13} seen={(q.riverCount?.[tile] || 0) >= 2} />
                ))}
              </div>
            </div>
          )}

          {/* 手牌 */}
          <div>
            <div className="tr-section-label">{tr.handLabel}</div>
            <div className="tr-hand">
              {q.hand.map((tile, i) => (
                <div key={i} className="tr-hand-tile">
                  <TileView tile={tile} scale={0.19} />
                </div>
              ))}
            </div>
          </div>

          {/* 场面信息（高级专用） */}
          {q.context && (
            <div className="tr-context">
              <span className="tr-context-icon">📋</span>
              {q.context[lang] || q.context.zh}
            </div>
          )}

          {/* 问题提示 */}
          <div className="tr-prompt">{q.prompt[lang] || q.prompt.zh}</div>

          {/* 选项 */}
          <div className="tr-choices">
            {q.choices.map(tile => {
              const isSel = selected === tile;
              const isAns = q.answers.includes(tile);
              let cls = 'tr-choice';
              if (revealed) {
                if (isAns)       cls += ' tr-choice-correct';
                else if (isSel)  cls += ' tr-choice-wrong';
              } else if (isSel) {
                cls += ' tr-choice-selected';
              }
              return (
                <div key={tile} className={cls} onClick={() => handleSelect(tile)}>
                  <TileView tile={tile} scale={0.25} />
                  {revealed && isAns       && <span className="tr-badge tr-badge-ok">✓</span>}
                  {revealed && isSel && !isAns && <span className="tr-badge tr-badge-no">✗</span>}
                </div>
              );
            })}
          </div>

          {/* 确认按钮 */}
          {!revealed && (
            <button
              className={`tr-btn tr-btn-primary${selected === null ? ' tr-btn-disabled' : ''}`}
              onClick={handleConfirm}
              disabled={selected === null}
            >
              {tr.confirm}
            </button>
          )}

          {/* 答案反馈 + 名师解析 */}
          {revealed && (
            <div className="tr-feedback">
              <div className={`tr-result ${isCorrect ? 'tr-result-correct' : 'tr-result-wrong'}`}>
                {isCorrect ? tr.correct : tr.wrong}
              </div>

              {/* 错误标签提示 */}
              {!isCorrect && (() => {
                const tag   = classifyError(level, q, selected);
                const color = TAG_COLOR[tag] || '#888';
                const label = (TAG_LABEL[tag] || {})[lang] || (TAG_LABEL[tag] || {}).zh || '';
                return (
                  <div style={{ marginTop: 8, padding: '6px 12px', background: color + '18', border: `1px solid ${color}44`, borderRadius: 8, fontSize: 12, color }}>
                    ⚡ {label}
                  </div>
                );
              })()}

              <div className="tr-explanation">
                <div className="tr-exp-label">{tr.answerLabel}</div>
                <div className="tr-exp-text">
                  {renderText(q.explanation?.[lang] || q.explanation?.zh || '')}
                </div>
              </div>

              {q.principle && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(52,152,219,0.08)', borderRadius: 8, fontSize: 12, color: 'var(--accent, #3498db)' }}>
                  📖 {tr.principleLabel}：{q.principle[lang] || q.principle.zh || q.principle.en}
                </div>
              )}

              <button className="tr-btn tr-btn-next" onClick={handleNext}>
                {tr.next}
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

const UTIL_BTN_STYLE = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: 'var(--fg, #e0e0e0)',
  cursor: 'pointer',
  fontSize: 12,
  padding: '5px 12px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
};
