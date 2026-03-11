import MahjongTile from './MahjongTile';

export default function HandDisplay({
  hand, onRemove, onSetWinTile, winTileIdx,
  tapToRemove, tapToMark,
  kongExtras, onRemoveKong, t,
  flashIndices,
}) {
  const displayOrder = [...hand]
    .map((tile, idx) => ({ tile, idx }))
    .sort((a, b) => a.tile - b.tile);

  return (
    <div className="hand-display">
      {displayOrder.map(({ tile, idx }) => {
        const isWin   = winTileIdx === idx;
        const isFlash = flashIndices?.includes(idx);
        return (
          <div
            key={idx}
            className={`hand-tile-wrap ${isWin ? 'hand-tile-win' : ''} ${isFlash ? 'tile-flash' : ''}`}
          >
            {/* 胡牌角标 */}
            {isWin && (
              <span className="win-tile-badge">{t?.winBadge ?? '胡'}</span>
            )}

            {/* 删除按钮（右上角 X，任意张数均可删） */}
            <button
              className="tile-delete-btn"
              onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
              title={tapToRemove}
              aria-label="remove"
            >×</button>

            {/* 牌主体：点击切换胡牌 */}
            <button
              className="hand-tile-btn"
              onClick={() => onSetWinTile(idx)}
              title={tapToMark}
            >
              <MahjongTile tile={tile} scale={0.37} />
            </button>
          </div>
        );
      })}

      {/* 杠牌额外的第4张（不计入14张限制） */}
      {kongExtras && kongExtras.map((k, kongIdx) => (
        <div key={`kong-${kongIdx}`} className="hand-tile-wrap">
          <button
            className="tile-delete-btn"
            onClick={() => onRemoveKong(kongIdx)}
            title={tapToRemove}
            aria-label="remove kong"
          >×</button>
          <button
            className="hand-tile-btn hand-tile-kong"
            onClick={() => onRemoveKong(kongIdx)}
            title={tapToRemove}
          >
            <span className={`kong-badge kong-badge-${k.type}`}>
              {k.type === 'open' ? (t?.kongOpenBadge ?? '明') : (t?.kongConcealedBadge ?? '暗')}
            </span>
            <MahjongTile tile={k.tile} scale={0.37} />
          </button>
        </div>
      ))}
    </div>
  );
}
