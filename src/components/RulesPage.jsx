import { useState } from 'react';
import { FAN_DICT, FAN_TIERS_ORDERED, getFansByTier } from '../data/fanDict';

const TIER_STYLE = {
  88: { color: '#9a6200', bg: '#fdf0cc', label: '88' },
  64: { color: '#8b3200', bg: '#fde8cc', label: '64' },
  48: { color: '#8b2020', bg: '#fde0dc', label: '48' },
  32: { color: '#3c1e6e', bg: '#ede0f8', label: '32' },
  24: { color: '#1a3870', bg: '#dce8f8', label: '24' },
  16: { color: '#1a4830', bg: '#d8f0e0', label: '16' },
  12: { color: '#2a4010', bg: '#e4f0d0', label: '12' },
   8: { color: '#1a4848', bg: '#d4f0f0', label: '8' },
   6: { color: '#2a3a58', bg: '#dce4f4', label: '6' },
   4: { color: '#3a3028', bg: '#ede8e0', label: '4' },
   2: { color: '#3a3838', bg: '#e8e8e8', label: '2' },
   1: { color: '#5c4e3e', bg: '#f0e8da', label: '1' },
};

function FanCard({ name, data, lang, t }) {
  const [open, setOpen] = useState(false);
  const style = TIER_STYLE[data.value] || TIER_STYLE[1];
  const displayName = t.fanNames?.[name] || name;

  return (
    <div className="rules-fan-card" onClick={() => setOpen(o => !o)}>
      <div className="rules-fan-header">
        <span className="fan-badge" style={{ background: style.bg, color: style.color }}>
          {data.value}{t.fanUnit}
        </span>
        <span className="rules-fan-name">{displayName}</span>
        <span className="rules-fan-chevron">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="rules-fan-body">
          {data.tiles && (
            <div className="rules-fan-tiles">{data.tiles}</div>
          )}
          <p className="rules-fan-desc">{data.desc[lang]}</p>
        </div>
      )}
    </div>
  );
}

export default function RulesPage({ t, lang }) {
  return (
    <div className="rules-page">
      <p className="rules-intro">{t.rulesIntro}</p>
      {FAN_TIERS_ORDERED.map(tier => {
        const fans = getFansByTier(tier);
        if (fans.length === 0) return null;
        const style = TIER_STYLE[tier] || TIER_STYLE[1];
        return (
          <div key={tier} className="rules-tier-section">
            <div
              className="rules-tier-header"
              style={{ background: style.bg, color: style.color }}
            >
              {tier} {t.fanUnit}
            </div>
            {fans.map(fan => (
              <FanCard
                key={fan.name}
                name={fan.name}
                data={FAN_DICT[fan.name]}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
