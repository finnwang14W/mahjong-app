import { useState } from 'react';
import { FAN_DICT } from '../data/fanDict';

const FAN_TIERS = [
  { min: 88, color: '#9a6200', bg: '#fdf0cc' },
  { min: 64, color: '#8b3200', bg: '#fde8cc' },
  { min: 48, color: '#8b2020', bg: '#fde0dc' },
  { min: 32, color: '#3c1e6e', bg: '#ede0f8' },
  { min: 24, color: '#1a3870', bg: '#dce8f8' },
  { min: 16, color: '#1a4830', bg: '#d8f0e0' },
  { min: 8,  color: '#1a4848', bg: '#d4f0f0' },
  { min: 1,  color: '#5c4e3e', bg: '#f0e8da' },
];

function getTier(value) {
  return FAN_TIERS.find(t => value >= t.min) || FAN_TIERS[FAN_TIERS.length - 1];
}

function FanRow({ fan, t, lang }) {
  const [open, setOpen] = useState(false);
  const tier = getTier(fan.value);
  const displayName = t.fanNames?.[fan.name] || fan.name;
  const dictEntry = FAN_DICT[fan.name];

  return (
    <div className="fan-row-wrap">
      <div
        className={`fan-row fan-row-clickable ${open ? 'fan-row-open' : ''}`}
        onClick={() => dictEntry && setOpen(o => !o)}
        style={{ cursor: dictEntry ? 'pointer' : 'default' }}
      >
        <span
          className="fan-badge"
          style={{ background: tier.bg, color: tier.color }}
        >
          {fan.value}{t.fanUnit}
        </span>
        <span className="fan-name">{displayName}</span>
        {fan.count > 1 && (
          <span className="fan-multi">
            ×{fan.count} = {fan.value * fan.count}{t.fanUnit}
          </span>
        )}
        {dictEntry && (
          <span className="fan-chevron">{open ? '▲' : '▼'}</span>
        )}
      </div>
      {open && dictEntry && (
        <div className="fan-accordion">
          {dictEntry.tiles && (
            <div className="fan-accordion-tiles">{dictEntry.tiles}</div>
          )}
          <p className="fan-accordion-desc">{dictEntry.desc[lang]}</p>
        </div>
      )}
    </div>
  );
}

export default function ScoreResult({ result, t, lang, beginnerMode }) {
  if (!result.valid) {
    const msg = result.errorCode === 'need14' ? t.need14 : t.invalid;
    return (
      <div className="score-card score-invalid">
        <div className="score-invalid-icon">✕</div>
        <p className="score-invalid-text">{msg}</p>
      </div>
    );
  }

  const { totalFan, fans, tooLow } = result;
  const topTier = getTier(totalFan);

  return (
    <div className="score-card">
      <div className="score-hero">
        <div className="score-number" style={{ color: topTier.color }}>
          {totalFan}
          <span className="score-unit">{t.fanUnit}</span>
        </div>
        <div className="score-sublabel" style={{ color: topTier.color }}>
          {t.scoreLabel(totalFan)}
        </div>
      </div>

      {tooLow && !beginnerMode && (
        <div className="score-warning">⚠ {t.tooLow(totalFan)}</div>
      )}
      {tooLow && beginnerMode && (
        <div className="score-warning" style={{ background: 'rgba(243,156,18,0.12)', borderColor: '#f39c12', color: '#f39c12' }}>
          🎓 {t.tooLowBeginner ? t.tooLowBeginner(totalFan) : t.tooLow(totalFan)}
        </div>
      )}

      {fans && fans.length > 0 && (
        <div className="score-breakdown">
          <p className="breakdown-title">{t.fanDetail}</p>
          {[...fans].sort((a, b) => b.value - a.value).map((fan, i) => (
            <FanRow key={i} fan={fan} t={t} lang={lang || 'zh'} />
          ))}
        </div>
      )}

      {fans && fans.length === 0 && !tooLow && (
        <p className="score-note">{t.noPattern}</p>
      )}
    </div>
  );
}
