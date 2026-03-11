import { useState, useCallback, useRef } from 'react';
import { analyzeHand } from '../logic/discardAnalyzer.js';
import { TILE_UNICODE } from '../logic/tiles.js';
import MahjongTile from './MahjongTile';
import { useLang } from '../i18n/index.jsx';

const POINT_COLORS = [
  '#f39c12', '#3498db', '#2ecc71', '#e74c3c',
  '#9b59b6', '#1abc9c', '#e67e22', '#16a085',
];

const TAG_STYLE = {
  qingyise:  { bg: 'rgba(231,76,60,0.2)',   fg: '#e74c3c' },
  hunyise:   { bg: 'rgba(230,126,34,0.2)',  fg: '#e67e22' },
  pengpenghu:{ bg: 'rgba(155,89,182,0.2)', fg: '#9b59b6' },
  duanyao:   { bg: 'rgba(39,174,96,0.2)',   fg: '#27ae60' },
};

export default function DiscardAnalyzer({ hand }) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const openedAtRef = useRef(0);

  const { t } = useLang();
  const c = t.da;
  const isTenpai = hand.length === 13;

  const runAnalysis = useCallback(() => {
    openedAtRef.current = Date.now();
    setIsAnalyzing(true);
    setIsOpen(true);
    // 双重 rAF：确保浏览器先渲染 spinner，再执行耗时计算
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try {
        const res = analyzeHand(hand);
        setResults(res);
      } catch (e) {
        console.error('[DiscardAnalyzer] analyzeHand error:', e);
        setResults(isTenpai
          ? { mode: 'tenpai', waitingTiles: [] }
          : { mode: 'discard', options: [] });
      }
      setIsAnalyzing(false);
    }));
  }, [hand, isTenpai]);

  const handleOpen = useCallback(() => { runAnalysis(); }, [runAnalysis]);

  const handleClose = () => {
    if (Date.now() - openedAtRef.current < 300) return;
    setIsOpen(false);
    setResults(null);
    setActiveTab('list');
  };

  const isEmpty = results && (
    (results.mode === 'tenpai' && results.waitingTiles.length === 0) ||
    (results.mode === 'discard' && results.options.length === 0)
  );

  return (
    <>
      <button
        className={`btn-discard-analyze ${isTenpai ? 'btn-tenpai-mode' : ''}`}
        onClick={handleOpen}
      >
        {isTenpai ? '🀄\uFE0E' : '🎯'} {isTenpai ? c.btn13 : c.btn14}
      </button>

      {isOpen && (
        <div className="da-overlay" onClick={handleClose}>
          <div className="da-panel" onClick={e => e.stopPropagation()}>

            {/* 标题栏 */}
            <div className={`da-header ${isTenpai ? 'da-header-tenpai' : ''}`}>
              <div>
                <div className="da-title calli">{isTenpai ? c.title13 : c.title14}</div>
                <div className="da-sub">{isTenpai ? c.sub13 : c.sub14}</div>
              </div>
              <button className="da-close" onClick={handleClose}>✕</button>
            </div>

            {isAnalyzing ? (
              <div className="da-loading">
                <span className="da-spinner" />
                {c.analyzing}
              </div>
            ) : isEmpty ? (
              <div className="da-loading">
                {results.mode === 'tenpai' ? c.tenpaiNone : c.noWait}
              </div>
            ) : results ? (
              results.mode === 'tenpai' ? (
                /* ── 13张：听牌分析面板 ── */
                <TenpaiPanel results={results} c={c} t={t} />
              ) : (
                /* ── 14张：切牌推荐面板 ── */
                <>
                  <div className="da-tabs">
                    <button
                      className={`da-tab ${activeTab === 'list' ? 'da-tab-active' : ''}`}
                      onClick={() => setActiveTab('list')}
                    >{c.listTab}</button>
                    <button
                      className={`da-tab ${activeTab === 'scatter' ? 'da-tab-active' : ''}`}
                      onClick={() => setActiveTab('scatter')}
                    >{c.scatterTab}</button>
                  </div>
                  {activeTab === 'list' ? (
                    <div className="da-list">
                      {results.options.map((item, idx) => (
                        <DiscardRow
                          key={item.discard}
                          item={item}
                          idx={idx}
                          c={c}
                          t={t}
                          color={POINT_COLORS[idx % POINT_COLORS.length]}
                        />
                      ))}
                    </div>
                  ) : (
                    <ScatterPlot options={results.options} c={c} />
                  )}
                </>
              )
            ) : null}

          </div>
        </div>
      )}
    </>
  );
}

// ── 13张：听牌面板 ───────────────────────────────────────
function TenpaiPanel({ results, c, t }) {
  const { waitingTiles } = results;
  const validTiles = waitingTiles.filter(w => !w.tooLow);

  return (
    <div className="da-tenpai-wrap">
      {/* 概要栏：统计 + 快速预览 */}
      <div className="da-tenpai-summary">
        <span className="da-tenpai-count">
          {validTiles.length > 0 ? c.tenpaiCount(waitingTiles.length) : c.tenpaiNone}
        </span>
        <div className="da-tenpai-preview">
          {waitingTiles.slice(0, 14).map(w => (
            <span
              key={w.tile}
              className={`da-tenpai-preview-tile ${w.tooLow ? 'da-tenpai-low' : ''}`}
            >
              {TILE_UNICODE[w.tile]}
            </span>
          ))}
          {waitingTiles.length > 14 && (
            <span className="da-tenpai-more">+{waitingTiles.length - 14}</span>
          )}
        </div>
      </div>

      {/* 详情列表 */}
      <div className="da-list">
        {waitingTiles.map((item, idx) => (
          <TenpaiRow
            key={item.tile}
            item={item}
            isBest={idx === 0 && !item.tooLow}
            c={c}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

// ── 13张：听牌单行 ───────────────────────────────────────
function TenpaiRow({ item, isBest, c, t }) {
  const fanName = name => t.fanNames[name] || name;
  const sorted = [...item.fans].sort((a, b) => b.value * b.count - a.value * a.count);
  const top = sorted.slice(0, 4);
  const rest = sorted.slice(4);

  return (
    <div className={`da-row ${isBest ? 'da-row-best' : ''} ${item.tooLow ? 'da-row-toolow' : ''}`}>
      {/* 左侧：牌图 + 徽章 */}
      <div className="da-row-left">
        <div className="da-tile-wrap">
          <MahjongTile tile={item.tile} scale={0.22} />
        </div>
        {isBest && <span className="da-best-badge">{c.best}</span>}
        {item.tooLow && <span className="da-toolow-badge">{c.tooLowHint}</span>}
      </div>

      {/* 右侧：番数 + 番型标签 */}
      <div className="da-row-right">
        <div className="da-stats-row">
          <span className="da-stat-item">
            <span className="da-stat-label">{c.fanLabel}</span>
            <span className={`da-stat-val ${item.tooLow ? 'da-fan-low' : 'da-fan-val'}`}>
              {item.totalFan}{t.fanUnit}
            </span>
          </span>
        </div>
        <div className="da-fan-chips">
          {top.map(f => (
            <span key={f.name} className="da-fan-chip">
              {fanName(f.name)}{f.count > 1 ? ` ×${f.count}` : ''}&thinsp;
              <em>{f.value * f.count}{t.fanUnit}</em>
            </span>
          ))}
          {rest.length > 0 && (
            <span className="da-fan-chip da-fan-chip-more">+{rest.length}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 14张：切牌推荐单行 ───────────────────────────────────
function DiscardRow({ item, idx, c, t, color }) {
  const maxUkeire = 20;
  const barW = Math.min(100, (item.ukeire / maxUkeire) * 100);
  const isBest = idx === 0 && item.ukeire > 0;
  const showWaits = item.waitingTiles.slice(0, 10);
  const extraWaits = item.waitingTiles.length - 10;

  return (
    <div className={`da-row ${isBest ? 'da-row-best' : ''}`}>
      {/* 左侧 */}
      <div className="da-row-left">
        <div className="da-color-dot" style={{ background: color }} />
        <div className="da-tile-wrap">
          <MahjongTile tile={item.discard} scale={0.20} />
        </div>
        {isBest && <span className="da-best-badge">{c.best}</span>}
      </div>

      {/* 右侧 */}
      <div className="da-row-right">
        <div className="da-stats-row">
          <span className="da-stat-item">
            <span className="da-stat-label">{c.ukeireLabel}</span>
            <span className="da-stat-val" style={{ color }}>
              {item.ukeire > 0 ? `${item.ukeire} ${c.types}` : c.noWait}
            </span>
          </span>
          <span className="da-stat-item">
            <span className="da-stat-label">{c.maxFanLabel}</span>
            <span className="da-stat-val da-fan-val">{item.maxFan}{t.fanUnit}</span>
          </span>
          <span className="da-stat-item">
            <span className="da-stat-label">{c.avgFanLabel}</span>
            <span className="da-stat-val da-fan-avg">{item.avgFan}{t.fanUnit}</span>
          </span>
        </div>

        {/* 进张条 */}
        <div className="da-ukeire-track">
          <div className="da-ukeire-fill" style={{ width: `${barW}%`, background: color }} />
        </div>

        {/* 可听的牌 */}
        {item.ukeire > 0 && (
          <div className="da-waiting-row">
            <span className="da-stat-label">{c.waitingLabel}:</span>
            <div className="da-waiting-tiles">
              {showWaits.map(w => (
                <span key={w.tile} className="da-wait-chip">{TILE_UNICODE[w.tile]}</span>
              ))}
              {extraWaits > 0 && (
                <span className="da-wait-chip da-wait-more">+{extraWaits}</span>
              )}
            </div>
          </div>
        )}

        {/* 牌型标签 */}
        {item.tags.length > 0 && (
          <div className="da-tags">
            {item.tags.map(tag => {
              const ts = TAG_STYLE[tag] || {};
              return (
                <span key={tag} className="da-tag" style={{ background: ts.bg, color: ts.fg }}>
                  {c.tags[tag]}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 散点图（仅 14张模式） ─────────────────────────────────
function ScatterPlot({ options, c }) {
  const W = 300, H = 200;
  const PAD = { top: 20, right: 20, bottom: 32, left: 38 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxUkeire = Math.max(...options.map(r => r.ukeire), 5);
  const maxFan = Math.max(...options.map(r => r.maxFan), 10);
  const minFan = 8;
  const fanRange = maxFan - minFan || 1;

  const toX = u => PAD.left + (u / maxUkeire) * plotW;
  const toY = f => PAD.top + plotH - ((f - minFan) / fanRange) * plotH;

  const xTicks = [0, Math.round(maxUkeire / 2), maxUkeire];
  const yTicks = [minFan, Math.round((minFan + maxFan) / 2), maxFan];

  return (
    <div className="da-scatter-wrap">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="da-svg">
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f}
            x1={PAD.left} y1={PAD.top + plotH * (1 - f)}
            x2={PAD.left + plotW} y2={PAD.top + plotH * (1 - f)}
            stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4"
          />
        ))}
        <line x1={PAD.left} y1={PAD.top + plotH} x2={PAD.left + plotW} y2={PAD.top + plotH} stroke="rgba(255,255,255,0.25)" />
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="rgba(255,255,255,0.25)" />

        {xTicks.map(v => (
          <text key={v} x={toX(v)} y={PAD.top + plotH + 14} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.45)">{v}</text>
        ))}
        <text x={PAD.left + plotW / 2} y={H - 2} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">{c.scatterX}</text>

        {yTicks.map(v => (
          <text key={v} x={PAD.left - 5} y={toY(v) + 3} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.45)">{v}</text>
        ))}
        <text
          x={10} y={PAD.top + plotH / 2}
          textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)"
          transform={`rotate(-90, 10, ${PAD.top + plotH / 2})`}
        >{c.scatterY}</text>

        {options.map((item, i) => {
          const x = toX(item.ukeire);
          const y = toY(item.maxFan);
          const color = POINT_COLORS[i % POINT_COLORS.length];
          const r = i === 0 ? 10 : 8;
          return (
            <g key={item.discard}>
              {i === 0 && <circle cx={x} cy={y} r={r + 4} fill={color} opacity={0.2} />}
              <circle cx={x} cy={y} r={r} fill={color} opacity={0.9} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="da-legend">
        {options.map((item, i) => (
          <div key={item.discard} className="da-legend-item">
            <span className="da-legend-num" style={{ background: POINT_COLORS[i % POINT_COLORS.length] }}>
              {i + 1}
            </span>
            <span className="da-legend-tile">{TILE_UNICODE[item.discard]}</span>
            <span className="da-legend-uk">{item.ukeire}</span>
          </div>
        ))}
      </div>

      <div className="da-scatter-hint">{c.hint}</div>
    </div>
  );
}
