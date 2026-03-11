function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle-label">
      <div
        className={`toggle-switch ${checked ? 'toggle-on' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <div className="toggle-knob" />
      </div>
      <span className="toggle-text">{label}</span>
    </label>
  );
}

function WindSelect({ label, value, onChange, windLabels }) {
  const winds = [
    { label: windLabels[0], value: 41 },
    { label: windLabels[1], value: 42 },
    { label: windLabels[2], value: 43 },
    { label: windLabels[3], value: 44 },
  ];
  return (
    <div className="wind-select">
      <span className="opt-label">{label}</span>
      <div className="wind-options">
        {winds.map(w => (
          <button
            key={w.value}
            className={`wind-btn ${value === w.value ? 'wind-btn-active' : ''}`}
            onClick={() => onChange(value === w.value ? null : w.value)}
          >
            {w.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Counter({ label, value, onChange, min = 0, max = 4 }) {
  return (
    <div className="counter">
      <span className="opt-label counter-opt-label">{label}</span>
      <div className="counter-controls">
        <button
          className="counter-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >−</button>
        <span className="counter-value">{value}</span>
        <button
          className="counter-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >+</button>
      </div>
    </div>
  );
}

function WaitSelect({ label, value, onChange, waitLabels }) {
  const types = [
    { key: null,     label: waitLabels.none },
    { key: 'edge',   label: waitLabels.edge },
    { key: 'middle', label: waitLabels.middle },
    { key: 'single', label: waitLabels.single },
  ];
  return (
    <div className="wait-select">
      <span className="opt-label">{label}</span>
      <div className="wait-options">
        {types.map(w => (
          <button
            key={w.key ?? 'none'}
            className={`wait-btn ${value === w.key ? 'wait-btn-active' : ''}`}
            onClick={() => onChange(value === w.key ? null : w.key)}
          >
            {w.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function GameOptions({ options, onChange, t, autoWaitActive, beginnerMode, onBeginnerModeChange }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }));

  return (
    <div className="game-options">
      <div className="options-toggles">
        <Toggle label={t.selfDraw}       checked={options.selfDraw}       onChange={v => set('selfDraw', v)} />
        <Toggle label={t.fullyConcealed} checked={options.fullyConcealed} onChange={v => set('fullyConcealed', v)} />
        <Toggle label={t.lastTile}       checked={options.lastTile}       onChange={v => set('lastTile', v)} />
        <Toggle label={t.winOnKong}      checked={options.winOnKong}      onChange={v => set('winOnKong', v)} />
        <Toggle label={t.robbingKong}    checked={options.robbingKong}    onChange={v => set('robbingKong', v)} />
      </div>

      {/* 新手模式开关 — 独立分隔，视觉上与正式规则选项区分 */}
      <div style={{
        marginTop: 14,
        paddingTop: 12,
        borderTop: '1px dashed rgba(128,128,128,0.25)',
      }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <div
            style={{
              marginTop: 2,
              width: 40, height: 22, borderRadius: 11, flexShrink: 0,
              background: beginnerMode ? '#f39c12' : 'rgba(128,128,128,0.25)',
              position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
            }}
            onClick={() => onBeginnerModeChange(!beginnerMode)}
            role="switch"
            aria-checked={beginnerMode}
          >
            <div style={{
              position: 'absolute', top: 3, left: beginnerMode ? 21 : 3,
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: beginnerMode ? '#f39c12' : 'inherit' }}>
              🎓 {t.beginnerMode}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted, #999)', marginTop: 2 }}>
              {t.beginnerModeHint}
            </div>
          </div>
        </label>
      </div>

      <div className="options-grid">
        <WindSelect
          label={t.seatWind}
          value={options.seatWind}
          onChange={v => set('seatWind', v)}
          windLabels={t.windLabels}
        />
        <WindSelect
          label={t.roundWind}
          value={options.roundWind}
          onChange={v => set('roundWind', v)}
          windLabels={t.windLabels}
        />
        {!autoWaitActive && (
          <WaitSelect
            label={t.waitType}
            value={options.waitType}
            onChange={v => set('waitType', v)}
            waitLabels={t.waitLabels}
          />
        )}
      </div>

      <div className="options-counters">
        <Counter label={t.flowers}          value={options.flowers}           onChange={v => set('flowers', v)} max={8} />
        <Counter label={t.openKong}         value={options.openKongs}         onChange={v => set('openKongs', v)} />
        <Counter label={t.concealedKong}    value={options.concealedKongs}    onChange={v => set('concealedKongs', v)} />
        <Counter label={t.concealedTriplet} value={options.concealedTriplets} onChange={v => set('concealedTriplets', v)} />
      </div>
    </div>
  );
}
