import { useState } from 'react';
import { calcScores } from '../hooks/useGameHistory';
import { TILE_UNICODE } from '../logic/tiles';

const DEFAULT_WINDS = ['东', '南', '西', '北'];

function getDisplayName(name, i, windLabels) {
  return name === DEFAULT_WINDS[i] ? windLabels[i] : name;
}

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

// ── 展开的牌面详情 ───────────────────────────────────────────────────────
function HandDetail({ r, t, players }) {
  const hand = r.hand || [];
  const kongExtras = r.kongExtras || [];
  const winTile = r.winTile;
  const fans = [...(r.fans || [])].sort((a, b) => b.fan - a.fan);
  const sortedHand = [...hand].sort((a, b) => a - b);

  const winnerIdx = r.winnerIdx ?? r.playerIndex;
  const winnerName = getDisplayName(players[winnerIdx], winnerIdx, t.windLabels);
  const winMethod = r.selfDraw
    ? t.selfDrawWin
    : t.dealInWin(getDisplayName(players[r.loserIdx], r.loserIdx, t.windLabels));

  const mainFan = fans[0];
  let analysisText = '';
  if (mainFan) {
    const mainFanName = t.fanNames?.[mainFan.name] || mainFan.name;
    if (mainFan.fan >= 8) {
      analysisText = t.coreBy(mainFanName, mainFan.fan);
    } else {
      analysisText = t.multiAccum;
    }
  }

  return (
    <div className="history-detail">
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
                      {ktype && <span className="u-kong-type">{ktype === 'open' ? (t?.kongOpenBadge ?? '明') : (t?.kongConcealedBadge ?? '暗')}</span>}
                    </span>
                  );
                })}
              </>
            )}
          </div>
          {winTile != null && (
            <div className="history-win-tile-label">
              {t.winTileLabel}：<span className="u-tile-win-solo">{TILE_UNICODE[winTile] || '?'}</span>
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

// ── 折线图 ───────────────────────────────────────────────────────────────
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
      {/* 0分基准线 */}
      <line x1={PAD.left} y1={zeroY} x2={VW - PAD.right} y2={zeroY}
            stroke="rgba(0,0,0,0.12)" strokeDasharray="4,3" strokeWidth="1" />
      <text x={PAD.left - 4} y={zeroY + 3} fontSize="7" fill="rgba(0,0,0,0.3)" textAnchor="end">0</text>

      {/* 折线段 */}
      {pts.slice(1).map((p, i) => (
        <line key={i} x1={pts[i].x} y1={pts[i].y} x2={p.x} y2={p.y}
              stroke={segColor(p.s)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ))}

      {/* 数据点 */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3"
                fill={segColor(p.s)} stroke="white" strokeWidth="1.5" />
      ))}

      {/* 分数标签 */}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={VH - 4} textAnchor="middle"
              fontSize="7.5" fontWeight="600"
              fill={p.s > 0 ? '#27ae60' : p.s < 0 ? '#c0392b' : '#bbb'}>
          {p.s > 0 ? `+${p.s}` : p.s === 0 ? '–' : p.s}
        </text>
      ))}
    </svg>
  );
}

// ── 近10局走势 + 统计 ────────────────────────────────────────────────────
function Analytics({ history, t, players, myPlayerIdx, setMyPlayerIdx }) {
  if (history.length === 0) return null;

  const myWins = history.filter(h => (h.winnerIdx ?? h.playerIndex) === myPlayerIdx);
  const myLosses = history.filter(h => isMyLossFn(h, myPlayerIdx));
  const myDealIns = history.filter(h => !h.selfDraw && h.loserIdx === myPlayerIdx);

  const myWinCount = myWins.length;
  const myLossCount = myLosses.length;
  const myHighestFan = myWins.reduce((max, h) => Math.max(max, h.totalFan), 0);
  const myAvgFan = myWinCount > 0
    ? Math.round(myWins.reduce((s, h) => s + h.totalFan, 0) / myWinCount)
    : 0;
  const mySelfDrawWins = myWins.filter(h => h.selfDraw).length;
  const mySelfDrawRate = myWinCount > 0 ? Math.round(mySelfDrawWins / myWinCount * 100) : 0;
  const myDealInCount = myDealIns.length;
  const mySelfDrawLossCount = myLossCount - myDealInCount;

  // Recent 10 rounds (oldest → newest)
  const recent10 = [...history].slice(0, 10).reverse();

  // Top win fans
  const winFanCounts = {};
  myWins.forEach(h => {
    (h.fans || []).forEach(f => {
      if (!winFanCounts[f.name]) winFanCounts[f.name] = { name: f.name, count: 0 };
      winFanCounts[f.name].count++;
    });
  });
  const topWinFans = Object.values(winFanCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  // Top fans in rounds I lost (winner's fans)
  const lossFanCounts = {};
  myLosses.forEach(h => {
    (h.fans || []).forEach(f => {
      if (!lossFanCounts[f.name]) lossFanCounts[f.name] = { name: f.name, count: 0 };
      lossFanCounts[f.name].count++;
    });
  });
  const topLossFans = Object.values(lossFanCounts).sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <div className="card">
      <div className="card-title card-title-standalone calli">{t.analyticsTitle}</div>

      {/* Player binding */}
      <div className="analytics-player-selector">
        <span className="analytics-iam-label">{t.iAm}</span>
        {players.map((name, i) => (
          <button
            key={i}
            className={`analytics-player-btn ${i === myPlayerIdx ? 'analytics-player-btn-active' : ''}`}
            onClick={() => setMyPlayerIdx(i)}
          >
            {getDisplayName(name, i, t.windLabels)}
          </button>
        ))}
      </div>

      {/* Stats row 1 */}
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

      {/* Stats row 2 */}
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

      {/* Recent 10 line chart */}
      <div className="analytics-section-label">{t.recentChart}</div>
      <LineChart recent10={recent10} myPlayerIdx={myPlayerIdx} />
      <div className="analytics-legend">
        <span className="legend-item legend-win">● {t.legendWin}</span>
        <span className="legend-item legend-loss">● {t.legendLoss}</span>
        <span className="legend-item legend-neutral">● {t.legendOther}</span>
      </div>

      {/* Loss breakdown */}
      {myLossCount > 0 && (
        <div className="analytics-loss-stats">
          <span className="analytics-loss-chip">{t.dealInCount(myDealInCount)}</span>
          <span className="analytics-loss-chip">{t.selfDrawLossCount(mySelfDrawLossCount)}</span>
        </div>
      )}

      {/* Top win fans */}
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
                  <div className="top-fan-bar-wrap">
                    <div className="top-fan-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="top-fan-count">×{f.count}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Top loss fans */}
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
                  <div className="top-fan-bar-wrap">
                    <div className="top-fan-bar top-fan-bar-loss" style={{ width: `${pct}%` }} />
                  </div>
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

// ── 历史记录列表（可展开） ────────────────────────────────────────────────
function HistoryList({ history, t, players, myPlayerIdx }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="history-list">
      {history.map((r, idx) => {
        const winnerIdx = r.winnerIdx ?? r.playerIndex;
        const winnerName = getDisplayName(players[winnerIdx], winnerIdx, t.windLabels);
        const loserPart = r.selfDraw
          ? <span className="history-selfdraw">{t.selfDraw}</span>
          : <span className="history-loser">← {getDisplayName(players[r.loserIdx], r.loserIdx, t.windLabels)}</span>;
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
              <span className="history-player">{winnerName}</span>
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

// ── Scoreboard ────────────────────────────────────────────────────────────
export default function Scoreboard({ players, setPlayers, history, onClearHistory, t, myPlayerIdx, setMyPlayerIdx }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([...players]);

  const stats = players.map((name, i) => {
    const totalScore = history.reduce(
      (sum, h) => sum + calcScores(h, players.length)[i], 0
    );
    const wins = history.filter(h => (h.winnerIdx ?? h.playerIndex) === i).length;
    return { i, wins, totalScore, displayName: getDisplayName(name, i, t.windLabels) };
  });
  const sorted = [...stats].sort((a, b) => b.totalScore - a.totalScore);

  const startEdit = () => { setDraft([...players]); setEditing(true); };
  const saveEdit = () => { setPlayers(draft); setEditing(false); };
  const cancelEdit = () => setEditing(false);

  return (
    <>
      <Analytics
        history={history}
        t={t}
        players={players}
        myPlayerIdx={myPlayerIdx}
        setMyPlayerIdx={setMyPlayerIdx}
      />

      {/* 排行榜 */}
      <div className="card">
        <div className="card-header">
          <span className="card-title calli">{t.scoreboard}</span>
          {!editing ? (
            <button className="btn-ghost-small" onClick={startEdit}>{t.editNames}</button>
          ) : (
            <div className="edit-name-actions">
              <button className="btn-save-names" onClick={saveEdit}>{t.save}</button>
              <button className="btn-ghost-small" onClick={cancelEdit}>{t.cancel}</button>
            </div>
          )}
        </div>

        {editing && (
          <div className="name-editor">
            {draft.map((name, i) => (
              <input
                key={i}
                className="name-input"
                value={name}
                maxLength={8}
                placeholder={t.windLabels[i]}
                onChange={e => {
                  const next = [...draft];
                  next[i] = e.target.value;
                  setDraft(next);
                }}
              />
            ))}
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
                  {s.displayName}
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

      {/* 历史记录 */}
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

        {history.length === 0 ? (
          <p className="empty-hint">{t.noHistory}</p>
        ) : (
          <HistoryList
            history={history}
            t={t}
            players={players}
            myPlayerIdx={myPlayerIdx}
          />
        )}
      </div>
    </>
  );
}
