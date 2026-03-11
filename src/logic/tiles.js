// ============================================================
// 牌型定义与辅助函数
// 编码规则：万11-19 筒21-29 条31-39 风41-44 箭45-47
// ============================================================

export const ALL_TILES = [
  11,12,13,14,15,16,17,18,19,
  21,22,23,24,25,26,27,28,29,
  31,32,33,34,35,36,37,38,39,
  41,42,43,44,
  45,46,47,
];

export const TILE_DISPLAY = {
  11:'1',12:'2',13:'3',14:'4',15:'5',16:'6',17:'7',18:'8',19:'9',
  21:'1',22:'2',23:'3',24:'4',25:'5',26:'6',27:'7',28:'8',29:'9',
  31:'1',32:'2',33:'3',34:'4',35:'5',36:'6',37:'7',38:'8',39:'9',
  41:'东',42:'南',43:'西',44:'北',
  45:'中',46:'发',47:'白',
};

export const TILE_SUIT_LABEL = {
  11:'万',21:'筒',31:'条',41:'',45:'',
};

// Unicode 麻将牌图标
export const TILE_UNICODE = {
  11:'🀇',12:'🀈',13:'🀉',14:'🀊',15:'🀋',16:'🀌',17:'🀍',18:'🀎',19:'🀏',
  21:'🀙',22:'🀚',23:'🀛',24:'🀜',25:'🀝',26:'🀞',27:'🀟',28:'🀠',29:'🀡',
  31:'🀐',32:'🀑',33:'🀒',34:'🀓',35:'🀔',36:'🀕',37:'🀖',38:'🀗',39:'🀘',
  41:'🀀',42:'🀁',43:'🀂',44:'🀃',
  45:'🀄\uFE0E',46:'🀅',47:'🀆',
};

// 英文标准缩写
export const TILE_ABBR = {
  11:'1m',12:'2m',13:'3m',14:'4m',15:'5m',16:'6m',17:'7m',18:'8m',19:'9m',
  21:'1p',22:'2p',23:'3p',24:'4p',25:'5p',26:'6p',27:'7p',28:'8p',29:'9p',
  31:'1s',32:'2s',33:'3s',34:'4s',35:'5s',36:'6s',37:'7s',38:'8s',39:'9s',
  41:'EW',42:'SW',43:'WW',44:'NW',
  45:'Chun',46:'Hatsu',47:'Haku',
};

export const SUIT_GROUPS = [
  { suitKey: 'wan',    suit: 'wan',    tiles: [11,12,13,14,15,16,17,18,19] },
  { suitKey: 'tong',   suit: 'tong',   tiles: [21,22,23,24,25,26,27,28,29] },
  { suitKey: 'tiao',   suit: 'tiao',   tiles: [31,32,33,34,35,36,37,38,39] },
  { suitKey: 'wind',   suit: 'wind',   tiles: [41,42,43,44] },
  { suitKey: 'dragon', suit: 'dragon', tiles: [45,46,47] },
];

export function getSuit(tile) {
  if (tile >= 11 && tile <= 19) return 'wan';
  if (tile >= 21 && tile <= 29) return 'tong';
  if (tile >= 31 && tile <= 39) return 'tiao';
  if (tile >= 41 && tile <= 44) return 'wind';
  if (tile >= 45 && tile <= 47) return 'dragon';
  return null;
}

export function getSuitNum(tile) {
  return Math.floor(tile / 10);
}

export function getRank(tile) {
  return tile % 10;
}

export function isHonor(tile) { return tile >= 41; }
export function isWind(tile) { return tile >= 41 && tile <= 44; }
export function isDragon(tile) { return tile >= 45 && tile <= 47; }
export function isNumeric(tile) { return tile < 41; }
export function isTerminal(tile) {
  if (isHonor(tile)) return false;
  const r = tile % 10;
  return r === 1 || r === 9;
}
export function isSimple(tile) {
  return isNumeric(tile) && !isTerminal(tile);
}
export function isTerminalOrHonor(tile) {
  return isTerminal(tile) || isHonor(tile);
}

// 绿色牌：2,3,4,6,8条 和 发(46)
export function isGreen(tile) {
  const greenTiao = [32, 33, 34, 36, 38];
  return greenTiao.includes(tile) || tile === 46;
}
