import sharp from 'sharp';

const img = sharp('mahjong.jpg');
const { width, height } = await img.metadata();
console.log(`Image: ${width} × ${height}`);

// 获取原始像素 (RGB)
const { data } = await img.raw().toBuffer({ resolveWithObject: true });

// 扫描每列像素，计算该列平均亮度
// 瓦片之间通常有明显的分隔线（浅色或深色）
const colBrightness = new Float64Array(width);
for (let x = 0; x < width; x++) {
  let sum = 0;
  for (let y = 0; y < height; y++) {
    const idx = (y * width + x) * 3;
    sum += (data[idx] + data[idx+1] + data[idx+2]) / 3;
  }
  colBrightness[x] = sum / height;
}

// 找出亮度局部极值点（分隔线候选）
const threshold = 220;  // 较亮 → 白色分隔线
const separators = [];
for (let x = 1; x < width - 1; x++) {
  if (colBrightness[x] > threshold &&
      colBrightness[x] >= colBrightness[x-1] &&
      colBrightness[x] >= colBrightness[x+1]) {
    separators.push(x);
  }
}

console.log(`\nBright column candidates (>${threshold}):`, separators.length);
console.log('First 30:', separators.slice(0, 30).join(', '));

// 尝试找均匀间隔
if (separators.length > 2) {
  const gaps = separators.slice(1).map((x, i) => x - separators[i]);
  const minGap = Math.min(...gaps);
  const maxGap = Math.max(...gaps);
  console.log(`\nGaps between separators: min=${minGap} max=${maxGap}`);
}

// 直接测试常见的分割数
console.log('\n--- Testing even splits ---');
for (const n of [34, 36, 38, 40, 41, 42, 44]) {
  const tw = width / n;
  const isInt = Math.abs(tw - Math.round(tw)) < 0.5;
  console.log(`${n} tiles → ${tw.toFixed(2)}px each ${isInt ? '✓ (integer!)' : ''}`);
}

// 扫描行，找水平分隔（看是否有2行）
console.log('\n--- Row analysis ---');
const rowBrightness = new Float64Array(height);
for (let y = 0; y < height; y++) {
  let sum = 0;
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 3;
    sum += (data[idx] + data[idx+1] + data[idx+2]) / 3;
  }
  rowBrightness[y] = sum / width;
}
const brightRows = [];
for (let y = 0; y < height; y++) {
  if (rowBrightness[y] > 240) brightRows.push(y);
}
console.log('Very bright rows (>240):', brightRows.slice(0, 20).join(', '));
console.log('Last bright rows:', brightRows.slice(-10).join(', '));
