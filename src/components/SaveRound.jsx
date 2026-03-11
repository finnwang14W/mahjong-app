import { useState } from 'react';

const DEFAULT_WINDS = ['东', '南', '西', '北'];
const getDisplayName = (name, i, windLabels) =>
  name === DEFAULT_WINDS[i] ? windLabels[i] : name;

export default function SaveRound({ totalFan, fans, players, selfDraw, onSave, t, hand, winTile, kongExtras }) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'picking' | 'picking-loser' | 'saved'
  const [winnerIdx, setWinnerIdx] = useState(null);

  const handleSelectWinner = (i) => {
    if (selfDraw) {
      onSave({ winnerIdx: i, loserIdx: null, selfDraw: true, totalFan, fans, hand, winTile, kongExtras });
      setPhase('saved');
    } else {
      setWinnerIdx(i);
      setPhase('picking-loser');
    }
  };

  const handleSelectLoser = (i) => {
    onSave({ winnerIdx, loserIdx: i, selfDraw: false, totalFan, fans, hand, winTile, kongExtras });
    setPhase('saved');
  };

  if (phase === 'saved') {
    return <div className="save-feedback">✓ {t.savedSuccess}</div>;
  }

  if (phase === 'picking-loser') {
    return (
      <div className="save-picker card">
        <p className="save-picker-label">{t.selectLoser}</p>
        <div className="save-picker-btns">
          {players.map((name, i) =>
            i === winnerIdx ? null : (
              <button key={i} className="save-player-btn" onClick={() => handleSelectLoser(i)}>
                {getDisplayName(name, i, t.windLabels)}
              </button>
            )
          )}
        </div>
        <button className="btn-ghost-cancel" onClick={() => { setWinnerIdx(null); setPhase('picking'); }}>
          {t.cancel}
        </button>
      </div>
    );
  }

  if (phase === 'picking') {
    return (
      <div className="save-picker card">
        <p className="save-picker-label">{t.selectWinner}</p>
        <div className="save-picker-btns">
          {players.map((name, i) => (
            <button key={i} className="save-player-btn" onClick={() => handleSelectWinner(i)}>
              {getDisplayName(name, i, t.windLabels)}
            </button>
          ))}
        </div>
        <button className="btn-ghost-cancel" onClick={() => setPhase('idle')}>
          {t.cancel}
        </button>
      </div>
    );
  }

  return (
    <button className="btn-save-round" onClick={() => setPhase('picking')}>
      🀄 {t.saveScore}
    </button>
  );
}
