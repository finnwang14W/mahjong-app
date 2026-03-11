// Sprite sheet: public/mahjong.png — 2296×280, each tile 94×140 px
// Tile codes: 万11-19, 筒21-29, 条31-39, 风41-44, 箭45-47
// 精灵图实际列顺序（row1）：万(x=0) | 条/竹(x=850) | 筒/圆圈(x=1699→row2延续)
// 注意：图片中条在筒之前，与直觉相反，坐标映射已按实际图像位置修正。

const SPRITE_W = 2296;
const SPRITE_H = 280;
const TILE_W = 94;
const TILE_H = 140;

const TILE_SPRITE = {
  // 万
  11: { x: 0,    y: 0 },
  12: { x: 94,   y: 0 },
  13: { x: 189,  y: 0 },
  14: { x: 283,  y: 0 },
  15: { x: 378,  y: 0 },
  16: { x: 472,  y: 0 },
  17: { x: 566,  y: 0 },
  18: { x: 661,  y: 0 },
  19: { x: 755,  y: 0 },
  // 条（竹条图案，精灵图实际位于 x=850 区段）
  31: { x: 850,  y: 0 },
  32: { x: 944,  y: 0 },
  33: { x: 1038, y: 0 },
  34: { x: 1133, y: 0 },
  35: { x: 1227, y: 0 },
  36: { x: 1321, y: 0 },
  37: { x: 1416, y: 0 },
  38: { x: 1510, y: 0 },
  39: { x: 1605, y: 0 },
  // 筒（圆圈图案，精灵图实际位于 x=1699 区段，第二行延续）
  21: { x: 1699, y: 0 },
  22: { x: 1793, y: 0 },
  23: { x: 1888, y: 0 },
  24: { x: 1982, y: 0 },
  25: { x: 2077, y: 0 },
  26: { x: 0,    y: 140 },
  27: { x: 94,   y: 140 },
  28: { x: 189,  y: 140 },
  29: { x: 283,  y: 140 },
  // 风
  41: { x: 378,  y: 140 },
  42: { x: 472,  y: 140 },
  43: { x: 566,  y: 140 },
  44: { x: 661,  y: 140 },
  // 箭
  45: { x: 755,  y: 140 },
  46: { x: 850,  y: 140 },
  47: { x: 944,  y: 140 },
};

export default function MahjongTile({ tile, scale = 0.5, onClick, className = '', style = {} }) {
  const pos = TILE_SPRITE[tile];
  if (!pos) return null;

  const w = Math.round(TILE_W * scale);
  const h = Math.round(TILE_H * scale);
  const bgW = Math.round(SPRITE_W * scale);
  const bgH = Math.round(SPRITE_H * scale);

  return (
    <div
      className={`mj-sprite-tile ${className}`}
      style={{
        width: w,
        height: h,
        backgroundImage: `url('/mahjong.png')`,
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `${-Math.round(pos.x * scale)}px ${-Math.round(pos.y * scale)}px`,
        ...style,
      }}
      onClick={onClick}
    />
  );
}
