import { useState } from 'react';
import { SUIT_GROUPS } from '../logic/tiles';
import MahjongTile from './MahjongTile';

const SUIT_LABEL_COLOR = {
  wan:    'var(--wan)',
  tong:   'var(--tong)',
  tiao:   'var(--tiao)',
  wind:   'var(--wind)',
  dragon: 'var(--dragon)',
};

export default function TilePicker({ onSelect, onSelectKong, slotsLeft, t }) {
  const [mode, setMode] = useState('single');

  // 杠需要占用3个手牌位（3张刻子放入手牌）
  const spaceNeeded = (mode === 'openKong' || mode === 'concealedKong') ? 3 : (mode === 'single' ? 1 : 3);
  const allDisabled = slotsLeft < spaceNeeded;

  const handleTileClick = (tile) => {
    if (allDisabled) return;
    if (mode === 'single') {
      onSelect(tile);
    } else if (mode === 'pong') {
      onSelect([tile, tile, tile]);
    } else if (mode === 'chi') {
      onSelect([tile, tile + 1, tile + 2]);
    } else if (mode === 'openKong') {
      onSelectKong(tile, 'open');
    } else if (mode === 'concealedKong') {
      onSelectKong(tile, 'concealed');
    }
  };

  return (
    <div className="tile-picker">
      <div className="pick-mode-bar">
        {['single', 'chi', 'pong', 'openKong', 'concealedKong'].map(m => (
          <button
            key={m}
            className={`pick-mode-btn ${mode === m ? 'pick-mode-active' : ''} ${m === 'openKong' ? 'pick-mode-openkong' : ''} ${m === 'concealedKong' ? 'pick-mode-concealedkong' : ''}`}
            onClick={() => setMode(m)}
          >
            {t.pickModes[m]}
          </button>
        ))}
      </div>
      {SUIT_GROUPS.map(({ suitKey, suit, tiles }) => (
        <div key={suit} className="suit-block">
          <span className="suit-header calli" style={{ color: SUIT_LABEL_COLOR[suit] }}>
            {t.suitLabels[suitKey]}
          </span>
          <div className="tiles-scroll">
            {tiles.map(tile => {
              // 吃模式：荣誉牌或rank>7不能做顺子起点
              const chiDisabled = mode === 'chi' && (tile >= 41 || tile % 10 > 7);
              const tileDisabled = allDisabled || chiDisabled;
              return (
                <button
                  key={tile}
                  className={`pick-tile-btn ${tileDisabled ? 'tile-disabled' : ''}`}
                  onClick={() => !tileDisabled && handleTileClick(tile)}
                  disabled={tileDisabled}
                >
                  <MahjongTile tile={tile} scale={0.32} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
