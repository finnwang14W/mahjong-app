import { useState } from 'react';
import { calcScores, getSeatWindIdx, WIND_NAMES } from '../hooks/useGameHistory';
import { TILE_UNICODE } from '../logic/tiles';

function formatScore(n) {
  return n > 0 ? `+${n}` : String(n);
}

function formatTime(ts) {
  const d = new Date(ts);
  const mo = d.getMonth() + 1;
  const dd = d.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${mo}/${dd} ${hh}:${mm}`;
}

function isMyLossFn(r, myPlayerIdx) {
  const winnerIdx = r.winnerIdx ?? r.playerIndex;
  return r.selfDraw ? winnerIdx !== myPlayerIdx : r.loserIdx === myPlayerIdx;
}

function getPlayerName(players, idx) {
  if (idx == null) return '';
  return players[idx] || `玩家${idx + 1}`;
}

// ── HandDetail ─────────────────────────────────────────────────────────────
function HandDetail({ r, t, players }) {
  const hand = r.hand || [];
  const kongExtras = r.kongExtras || [];
  const fans = [...(r.fans || [])].sort((a, b) => b.fan - a.fan);
  const sortedHand = [...hand].sort((a, b) => a - b);
  const loserName = r.loserIdx != null ? getPlayerName(players, r.loserIdx) : '';
  const winMethod = r.selfDraw ? t.selfDrawWin : t.dealInWin(loserName);
  const mainFan = fans[0];
  let analysisText = '';
  if (mainFan) {
    const n = t.fanNames?.[mainFan.name] || mainFan.name;
    analysisText = mainFan.fan >= 8 ? t.coreBy(n, mainFan.fan) : t.multiAccum;
  }

  return (
    <div className="history-detail">
      {r.proState?.dealerIdx != null && (
        <div className="pro-round-state-badge">
          <span className="pro-badge-wind">{WIND_NAMES[r.proState.roundWind]}圈</span>
          {r.proState.consecutiveWins > 0 && (
            <span className="pro-badge-lz">连庄 +{r.proState.consecutiveWins}</span>
          )}
        </div>
      )}

      {hand.length > 0 ? (
        <div className="history-unicode-wrap">
          <div className="history-unicode-hand">
            {sortedHand.map((tile, i) => (
              <span key={i} className="u-tile">{TILE_UNICODE[tile] || '?'}</span>
            ))}
            {kongExtras.length > 0 && (
              <>
                <span className="u-sep">│</span>
                {kongExtras.map((k, i) => {
                  const tilecode = k.tile ?? k;
                  const ktype = k.type;
                  return (
                    <span key={i} className="u-tile u-tile-kong">
                      {TILE_UNICODE[tilecode] || '?'}
                      {ktype && (
                        <span className="u-kong-type">
                          {ktype === 'open' ? (t?.kongOpenBadge ?? '明') : (t?.kongConcealedBadge ?? '暗')}
                        </span>
                      )}
                    </span>
                  );
                })}
              </>
            )}
          </div>
          {r.winTile != null && (
            <div className="history-win-tile-label">
              {t.winTileLabel}：<span className="u-tile-win-solo">{TILE_UNICODE[r.winTile] || '?'}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="history-no-hand">{t.noHand}</div>
      )}

      {fans.length > 0 && (
        <div className="history-fans-list">
          {fans.map((f, i) => (
            <span key={i} className="hf-chip">
              {t.fanNames?.[f.name] || f.name}
              <span className="hf-chip-val">{f.fan}</span>
            </span>
          ))}
        </div>
      )}
      <div className="history-analysis-text">
        {winMethod}{analysisText ? `，${analysisText}` : ''}
      </div>
    </div>
  );
}

// ── LineChart ──────────────────────────────────────────────────────────────
function LineChart({ recent10, myPlayerIdx }) {
  const VW = 300, VH = 88;
  const PAD = { top: 12, bottom: 20, left: 12, right: 8 };
  const iW = VW - PAD.left - PAD.right;
  const iH = VH - PAD.top - PAD.bottom;
  const n = recent10.length;

  const scores = recent10.map(r => {
    const w = r.winnerIdx ?? r.playerIndex;
    if (w === myPlayerIdx) return r.selfDraw ? 3 * r.totalFan : r.totalFan;
    if (r.selfDraw) return -r.totalFan;
    if (r.loserIdx === myPlayerIdx) return -r.totalFan;
    return 0;
  });

  const absMax = Math.max(...scores.map(Math.abs), 8);
  const toX = i => PAD.left + (n <= 1 ? iW / 2 : (i / (n - 1)) * iW);
  const toY = s => PAD.top + iH / 2 - (s / absMax) * (iH / 2);
  const zeroY = toY(0);
  const pts = scores.map((s, i) => ({ x: toX(i), y: toY(s), s }));
  const segColor = s => s > 0 ? '#27ae60' : s < 0 ? '#e6a817' : '#bbb';

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
      <line x1={PAD.left} y1={zeroY} x2={VW - PAD.right} y2={zeroY}
        stroke="rgba(0,0,0,0.12)" strokeDasharray="4,3" strokeWidth="1" />
      <text x={PAD.left - 4} y={zeroY + 3} fontSize="7" fill="rgba(0,0,0,0.3)" textAnchor="end">0</text>
      {pts.slice(1).map((p, i) => (
        <line key={i} x1={pts[i].x} y1={pts[i].y} x2={p.x} y2={p.y}
          stroke={segColor(p.s)} strokeWidth="2" strokeLinecap="round" />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={segColor(p.s)} stroke="white" strokeWidth="1.5" />
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={VH - 4} textAnchor="middle" fontSize="7.5" fontWeight="600"
          fill={p.s > 0 ? '#27ae60' : p.s < 0 ? '#c0392b' : '#bbb'}>
          {p.s > 0 ? `+${p.s}` : p.s === 0 ? '–' : p.s}
        </text>
      ))}
    </svg>
  );
}

// ── Analytics ──────────────────────────────────────────────────────────────
function Analytics({ history, t, players, myPlayerIdx, setMyPlayerIdx }) {
  if (history.length === 0) return null;

  const safeIdx = Math.min(myPlayerIdx, players.length - 1);
  const myWins = history.filter(h => (h.winnerIdx ?? h.playerIndex) === safeIdx);
  const myLosses = history.filter(h => isMyLossFn(h, safeIdx));
  const myDealIns = history.filter(h => !h.selfDraw && h.loserIdx === safeIdx);
  const myWinCount = myWins.length;
  const myLossCount = myLosses.length;
  const myHighestFan = myWins.reduce((max, h) => Math.max(max, h.totalFan), 0);
  const myAvgFan = myWinCount > 0
    ? Math.round(myWins.reduce((s, h) => s + h.totalFan, 0) / myWinCount) : 0;
  const mySelfDrawWins = myWins.filter(h => h.selfDraw).length;
  const mySelfDrawRate = myWinCount > 0 ? Math.round(mySelfDrawWins / myWinCount * 100) : 0;
  const myDealInCount = myDealIns.length;
  const mySelfDrawLossCount = myLossCount - myDealInCount;
  const recent10 = [...history].slice(0, 10).reverse();

  const winFanCounts = {};
  myWins.forEach(h => (h.fans || []).forEach(f => {
    if (!winFanCounts[f.name]) winFanCounts[f.name] = { name: f.name, count: 0 };
    winFanCounts[f.name].count++;
  }));
  const topWinFans = Object.values(winFanCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  const lossFanCounts = {};
  myLosses.forEach(h => (h.fans || []).forEach(f => {
    if (!lossFanCounts[f.name]) lossFanCounts[f.name] = { name: f.name, count: 0 };
    lossFanCounts[f.name].count++;
  }));
  const topLossFans = Object.values(lossFanCounts).sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <div className="card">
      <div className="card-title card-title-standalone calli">{t.analyticsTitle}</div>

      <div className="analytics-player-selector">
        <span className="analytics-iam-label">{t.iAm}</span>
        {players.map((name, i) => (
          <button key={i}
            className={`analytics-player-btn ${i === safeIdx ? 'analytics-player-btn-active' : ''}`}
            onClick={() => setMyPlayerIdx(i)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="analytics-stats">
        <div className="analytics-stat">
          <div className="analytics-stat-val stat-win">{myWinCount}</div>
          <div className="analytics-stat-key">{t.statWins}</div>
        </div>
        <div className="analytics-stat">
          <div className="analytics-stat-val stat-loss">{myLossCount}</div>
          <div className="analytics-stat-key">{t.statLosses}</div>
        </div>
        <div className="analytics-stat">
          <div className="analytics-stat-val">{myHighestFan || '—'}</div>
          <div className="analytics-stat-key">{t.statHighest}</div>
        </div>
      </div>

      <div className="analytics-stats analytics-stats-row2">
        <div className="analytics-stat">
          <div className="analytics-stat-val">{myAvgFan || '—'}</div>
          <div className="analytics-stat-key">{t.statAvgFan}</div>
        </div>
        <div className="analytics-stat">
          <div className="analytics-stat-val stat-loss">{myDealInCount}</div>
          <div className="analytics-stat-key">{t.statDealIn}</div>
        </div>
        <div className="analytics-stat">
          <div className="analytics-stat-val">{mySelfDrawRate}%</div>
          <div className="analytics-stat-key">{t.statSelfDraw}</div>
        </div>
      </div>

      <div className="analytics-section-label">{t.recentChart}</div>
      <LineChart recent10={recent10} myPlayerIdx={safeIdx} />
      <div className="analytics-legend">
        <span className="legend-item legend-win">● {t.legendWin}</span>
        <span className="legend-item legend-loss">● {t.legendLoss}</span>
        <span className="legend-item legend-neutral">● {t.legendOther}</span>
      </div>

      {myLossCount > 0 && (
        <div className="analytics-loss-stats">
          <span className="analytics-loss-chip">{t.dealInCount(myDealInCount)}</span>
          <span className="analytics-loss-chip">{t.selfDrawLossCount(mySelfDrawLossCount)}</span>
        </div>
      )}

      {topWinFans.length > 0 && (
        <>
          <div className="analytics-section-label" style={{ marginTop: 14 }}>{t.topFansTitle}</div>
          <div className="analytics-top-fans">
            {topWinFans.map(f => {
              const displayName = t.fanNames?.[f.name] || f.name;
              const pct = Math.round(f.count / topWinFans[0].count * 100);
              return (
                <div key={f.name} className="top-fan-row">
                  <div className="top-fan-name">{displayName}</div>
                  <div className="top-fan-bar-wrap"><div className="top-fan-bar" style={{ width: `${pct}%` }} /></div>
                  <div className="top-fan-count">×{f.count}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {topLossFans.length > 0 && (
        <>
          <div className="analytics-section-label analytics-section-label-loss" style={{ marginTop: 14 }}>
            {t.topFansLossTitle}
          </div>
          <div className="analytics-top-fans">
            {topLossFans.map(f => {
              const displayName = t.fanNames?.[f.name] || f.name;
              const pct = Math.round(f.count / topLossFans[0].count * 100);
              return (
                <div key={f.name} className="top-fan-row">
                  <div className="top-fan-name">{displayName}</div>
                  <div className="top-fan-bar-wrap"><div className="top-fan-bar top-fan-bar-loss" style={{ width: `${pct}%` }} /></div>
                  <div className="top-fan-count">×{f.count}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── HistoryList ────────────────────────────────────────────────────────────
function HistoryList({ history, t, players, myPlayerIdx }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="history-list">
      {history.map((r, idx) => {
        const winnerIdx = r.winnerIdx ?? r.playerIndex;
        const winnerName = getPlayerName(players, winnerIdx);

        let windTag = null;
        if (r.mode === 'pro' && r.proState?.dealerIdx != null) {
          const wi = getSeatWindIdx(winnerIdx, r.proState.dealerIdx);
          windTag = <span className="history-wind-tag">{WIND_NAMES[wi]}</span>;
        }

        const lzBadge = r.mode === 'pro' && r.proState?.consecutiveWins > 0
          ? <span className="history-lz-badge">连庄+{r.proState.consecutiveWins}</span>
          : null;

        const loserPart = r.selfDraw
          ? <span className="history-selfdraw">{t.selfDraw}</span>
          : <span className="history-loser">← {getPlayerName(players, r.loserIdx)}</span>;

        const isMyWin = winnerIdx === myPlayerIdx;
        const isMyLoss = isMyLossFn(r, myPlayerIdx);
        const isExpanded = expandedId === r.id;

        return (
          <div key={r.id}>
            <div
              className={`history-row ${isMyWin ? 'history-row-mywin' : ''} ${isMyLoss ? 'history-row-myloss' : ''}`}
              onClick={() => setExpandedId(isExpanded ? null : r.id)}
            >
              <span className="history-num">#{history.length - idx}</span>
              <span className="history-player">
                {windTag}{winnerName}{lzBadge}
              </span>
              <span className="history-mode">{loserPart}</span>
              <span className="history-fans">
                {r.totalFan}<span className="history-fan-unit"> {t.fanUnit}</span>
              </span>
              <span className="history-time">{formatTime(r.timestamp)}</span>
              <span className="history-toggle">{isExpanded ? '▲' : '▼'}</span>
            </div>
            {isExpanded && <HandDetail r={r} t={t} players={players} />}
          </div>
        );
      })}
    </div>
  );
}

// ── DealerInitModal ────────────────────────────────────────────────────────
function DealerInitModal({ players, onConfirm }) {
  return (
    <div className="dealer-modal-overlay">
      <div className="dealer-modal">
        <div className="dealer-modal-title calli">⚑ 指定起庄玩家</div>
        <p className="dealer-modal-desc">
          专业竞技模式需要设定初始东风位（庄家）。<br />
          请选择本局的起始庄家：
        </p>
        <div className="dealer-modal-btns">
          {players.map((name, i) => (
            <button key={i} className="dealer-modal-player-btn" onClick={() => onConfirm(i)}>
              <span className="dealer-modal-wind">东风位</span>
              <span className="dealer-modal-player-name">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Pro Status Bar ─────────────────────────────────────────────────────────
function ProStatusBar({ proGameState, players, onReset }) {
  const { dealerIdx, roundWind, consecutiveWins } = proGameState;
  if (dealerIdx == null) return null;
  const dealerName = getPlayerName(players, dealerIdx);

  // Build seat wind display in fixed order: 东南西北
  const seatOrder = [0, 1, 2, 3].map(windIdx => {
    const playerIdx = (dealerIdx + windIdx) % 4;
    return { windIdx, playerIdx, name: getPlayerName(players, playerIdx) };
  });

  return (
    <div className="card pro-status-card">
      <div className="pro-status-header">
        <div className="pro-status-meta">
          <span className="pro-round-wind-badge">{WIND_NAMES[roundWind]}圈</span>
          {consecutiveWins > 0 && (
            <span className="pro-lz-badge">连庄 +{consecutiveWins}</span>
          )}
          <span className="pro-dealer-label">庄：{dealerName}</span>
        </div>
        <button className="pro-reset-btn" onClick={onReset}>↺ 重置庄家</button>
      </div>
      <div className="pro-seat-grid">
        {seatOrder.map(({ windIdx, playerIdx, name }) => (
          <div key={windIdx} className={`pro-seat-cell ${playerIdx === dealerIdx ? 'pro-seat-dealer' : ''}`}>
            <span className="pro-seat-wind">{WIND_NAMES[windIdx]}</span>
            <span className="pro-seat-name">{name}</span>
            {playerIdx === dealerIdx && <span className="pro-seat-zhuang">庄</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Social Leaderboard ─────────────────────────────────────────────────────
function SocialLeaderboard({ players, setPlayers, history, t, myPlayerIdx, setMyPlayerIdx }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([...players]);

  const socialHistory = history.filter(h => !h.mode || h.mode === 'social');

  const stats = players.map((name, i) => {
    const totalScore = socialHistory.reduce(
      (sum, h) => sum + (calcScores(h, h.numPlayers || players.length)[i] ?? 0), 0
    );
    const wins = socialHistory.filter(h => (h.winnerIdx ?? h.playerIndex) === i).length;
    return { i, wins, totalScore, name };
  });
  const sorted = [...stats].sort((a, b) => b.totalScore - a.totalScore);

  const saveEdit = () => {
    setPlayers(draft);
    if (myPlayerIdx >= draft.length) setMyPlayerIdx(draft.length - 1);
    setEditing(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title calli">{t.scoreboard}</span>
        {!editing ? (
          <button className="btn-ghost-small" onClick={() => { setDraft([...players]); setEditing(true); }}>
            {t.editNames}
          </button>
        ) : (
          <div className="edit-name-actions">
            <button className="btn-save-names" onClick={saveEdit}>{t.save}</button>
            <button className="btn-ghost-small" onClick={() => setEditing(false)}>{t.cancel}</button>
          </div>
        )}
      </div>

      {editing && (
        <div className="social-edit-panel">
          {draft.map((name, i) => (
            <div key={i} className="social-edit-row">
              <span className="social-edit-num">{i + 1}</span>
              <input
                className="name-input"
                value={name}
                maxLength={10}
                placeholder={`玩家${i + 1}`}
                onChange={e => {
                  const next = [...draft];
                  next[i] = e.target.value;
                  setDraft(next);
                }}
              />
              {draft.length > 2 && (
                <button
                  className="social-remove-btn"
                  onClick={() => setDraft(draft.filter((_, di) => di !== i))}
                >✕</button>
              )}
            </div>
          ))}
          {draft.length < 8 && (
            <button
              className="social-add-btn"
              onClick={() => setDraft([...draft, `玩家${draft.length + 1}`])}
            >
              + 添加玩家
            </button>
          )}
        </div>
      )}

      <div className="leaderboard">
        {sorted.map((s, rank) => {
          const isTop = rank === 0 && s.totalScore > 0;
          const isMe = s.i === myPlayerIdx;
          return (
            <div key={s.i} className={`leader-row ${isTop ? 'leader-top' : ''} ${isMe ? 'leader-me' : ''}`}>
              <span className="leader-rank">{isTop ? '👑' : `#${rank + 1}`}</span>
              <span className="leader-name">
                {s.name}
                {isMe && <span className="leader-me-tag">{t.meTag}</span>}
              </span>
              <span className="leader-rounds">{s.wins}{t.winsLabel}</span>
              <span className={`leader-fan ${s.totalScore >= 0 ? 'score-pos' : 'score-neg'}`}>
                {formatScore(s.totalScore)}
              </span>
            </div>
          );
        })}
      </div>

      {!editing && players.length < 8 && (
        <button
          className="social-add-inline-btn"
          onClick={() => setPlayers([...players, `玩家${players.length + 1}`])}
        >
          + 添加玩家
        </button>
      )}
    </div>
  );
}

// ── Pro Leaderboard ────────────────────────────────────────────────────────
function ProLeaderboard({ players, setPlayers, proGameState, history, t, myPlayerIdx }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([...players]);
  const { dealerIdx } = proGameState;

  const proHistory = history.filter(h => h.mode === 'pro' || !h.mode);
  const stats = players.map((name, i) => {
    const totalScore = proHistory.reduce((sum, h) => sum + (calcScores(h, 4)[i] ?? 0), 0);
    const wins = proHistory.filter(h => (h.winnerIdx ?? h.playerIndex) === i).length;
    const seatWindIdx = dealerIdx != null ? getSeatWindIdx(i, dealerIdx) : i;
    return { i, wins, totalScore, name, seatWindIdx };
  });
  const sorted = [...stats].sort((a, b) => b.totalScore - a.totalScore);

  const saveEdit = () => { setPlayers(draft); setEditing(false); };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title calli">{t.scoreboard}</span>
        {!editing ? (
          <button className="btn-ghost-small" onClick={() => { setDraft([...players]); setEditing(true); }}>
            {t.editNames}
          </button>
        ) : (
          <div className="edit-name-actions">
            <button className="btn-save-names" onClick={saveEdit}>{t.save}</button>
            <button className="btn-ghost-small" onClick={() => setEditing(false)}>{t.cancel}</button>
          </div>
        )}
      </div>

      {editing && (
        <div className="name-editor">
          {draft.map((name, i) => (
            <div key={i} className="pro-edit-row">
              <span className="pro-edit-wind">
                {WIND_NAMES[dealerIdx != null ? getSeatWindIdx(i, dealerIdx) : i]}
              </span>
              <input
                className="name-input"
                value={name}
                maxLength={8}
                placeholder={WIND_NAMES[i]}
                onChange={e => {
                  const next = [...draft];
                  next[i] = e.target.value;
                  setDraft(next);
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="leaderboard">
        {sorted.map((s, rank) => {
          const isTop = rank === 0 && s.totalScore > 0;
          const isMe = s.i === myPlayerIdx;
          const isDealer = s.i === dealerIdx;
          const windName = WIND_NAMES[s.seatWindIdx];
          return (
            <div key={s.i} className={`leader-row ${isTop ? 'leader-top' : ''} ${isMe ? 'leader-me' : ''}`}>
              <span className="leader-rank">{isTop ? '👑' : `#${rank + 1}`}</span>
              <span className="leader-name">
                <span className="pro-seat-wind-tag">{windName}</span>
                {s.name}
                {isDealer && <span className="pro-dealer-tag">庄</span>}
                {isMe && <span className="leader-me-tag">{t.meTag}</span>}
              </span>
              <span className="leader-rounds">{s.wins}{t.winsLabel}</span>
              <span className={`leader-fan ${s.totalScore >= 0 ? 'score-pos' : 'score-neg'}`}>
                {formatScore(s.totalScore)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Scoreboard ────────────────────────────────────────────────────────
export default function Scoreboard({
  boardMode, setBoardMode,
  players,
  socialPlayers, setSocialPlayers,
  proPlayers, setProPlayers,
  proGameState, initProGame, resetProGame,
  history, onClearHistory,
  t, myPlayerIdx, setMyPlayerIdx,
}) {
  const [showDealerModal, setShowDealerModal] = useState(
    boardMode === 'pro' && proGameState.dealerIdx === null
  );

  const handleModeSwitch = (mode) => {
    setBoardMode(mode);
    if (mode === 'pro') {
      if (proGameState.dealerIdx === null) setShowDealerModal(true);
      if (myPlayerIdx >= 4) setMyPlayerIdx(0);
    } else {
      if (myPlayerIdx >= socialPlayers.length) setMyPlayerIdx(0);
    }
  };

  const handleDealerConfirm = (dealerIdx) => {
    initProGame(dealerIdx);
    setShowDealerModal(false);
  };

  const handleResetPro = () => {
    resetProGame();
    setShowDealerModal(true);
  };

  // Filter history to current mode
  const modeHistory = boardMode === 'pro'
    ? history.filter(h => h.mode === 'pro' || !h.mode)
    : history.filter(h => !h.mode || h.mode === 'social');

  return (
    <>
      {/* ── Mode Toggle ── */}
      <div className="card mode-toggle-card">
        <div className="mode-toggle">
          <button
            className={`mode-tab ${boardMode === 'social' ? 'mode-tab-active' : ''}`}
            onClick={() => handleModeSwitch('social')}
          >
            <span className="mode-tab-icon">🀄</span>
            <div className="mode-tab-text">
              <span className="mode-tab-label">社交娱乐模式</span>
              <span className="mode-tab-sub">自定义人数 · 随性玩</span>
            </div>
          </button>
          <button
            className={`mode-tab ${boardMode === 'pro' ? 'mode-tab-active mode-tab-pro-active' : ''}`}
            onClick={() => handleModeSwitch('pro')}
          >
            <span className="mode-tab-icon">🏆</span>
            <div className="mode-tab-text">
              <span className="mode-tab-label">专业竞技模式</span>
              <span className="mode-tab-sub">4人 · 自动风位流转</span>
            </div>
          </button>
        </div>
      </div>

      {/* ── Dealer Init Modal (Pro) ── */}
      {showDealerModal && boardMode === 'pro' && (
        <DealerInitModal players={proPlayers} onConfirm={handleDealerConfirm} />
      )}

      {/* ── Pro Status Bar ── */}
      {boardMode === 'pro' && !showDealerModal && (
        <ProStatusBar
          proGameState={proGameState}
          players={proPlayers}
          onReset={handleResetPro}
        />
      )}

      {/* ── Analytics ── */}
      <Analytics
        history={modeHistory}
        t={t}
        players={players}
        myPlayerIdx={myPlayerIdx}
        setMyPlayerIdx={setMyPlayerIdx}
      />

      {/* ── Mode-specific Leaderboard ── */}
      {boardMode === 'social' ? (
        <SocialLeaderboard
          players={socialPlayers}
          setPlayers={setSocialPlayers}
          history={modeHistory}
          t={t}
          myPlayerIdx={myPlayerIdx}
          setMyPlayerIdx={setMyPlayerIdx}
        />
      ) : (
        <ProLeaderboard
          players={proPlayers}
          setPlayers={setProPlayers}
          proGameState={proGameState}
          history={modeHistory}
          t={t}
          myPlayerIdx={myPlayerIdx}
          setMyPlayerIdx={setMyPlayerIdx}
        />
      )}

      {/* ── History ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title calli">{t.historyTitle}</span>
          {history.length > 0 && (
            <button
              className="btn-ghost-danger"
              onClick={() => { if (window.confirm(t.confirmClear)) onClearHistory(); }}
            >
              {t.clearHistory}
            </button>
          )}
        </div>
        {modeHistory.length === 0 ? (
          <p className="empty-hint">{t.noHistory}</p>
        ) : (
          <HistoryList
            history={modeHistory}
            t={t}
            players={players}
            myPlayerIdx={myPlayerIdx}
          />
        )}
      </div>
    </>
  );
}
