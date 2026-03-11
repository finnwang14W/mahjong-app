import { useState, useCallback } from 'react';

const KEY_PLAYERS = 'mj_players';
const KEY_HISTORY = 'mj_history';

function load(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

// 计算本局每位玩家的分数变化
export function calcScores(entry, numPlayers = 4) {
  const scores = new Array(numPlayers).fill(0);
  const winnerIdx = entry.winnerIdx ?? entry.playerIndex; // 兼容旧数据
  if (entry.selfDraw || entry.loserIdx == null) {
    // 自摸：赢家得 3×番，其余每人减 1×番
    scores[winnerIdx] += 3 * entry.totalFan;
    for (let i = 0; i < numPlayers; i++) {
      if (i !== winnerIdx) scores[i] -= entry.totalFan;
    }
  } else {
    // 点炮：赢家得 1×番，点炮者减 1×番
    scores[winnerIdx] += entry.totalFan;
    scores[entry.loserIdx] -= entry.totalFan;
  }
  return scores;
}

export function useGameHistory() {
  const [players, setPlayersState] = useState(
    () => load(KEY_PLAYERS, ['东', '南', '西', '北'])
  );
  const [history, setHistoryState] = useState(
    () => load(KEY_HISTORY, [])
  );

  const setPlayers = useCallback((names) => {
    setPlayersState(names);
    localStorage.setItem(KEY_PLAYERS, JSON.stringify(names));
  }, []);

  const addRound = useCallback(({ winnerIdx, loserIdx, selfDraw, totalFan, fans, hand, winTile, kongExtras }) => {
    setHistoryState(prev => {
      const entry = {
        id: Date.now(),
        timestamp: Date.now(),
        winnerIdx,
        loserIdx: selfDraw ? null : loserIdx,
        selfDraw: !!selfDraw,
        totalFan,
        fans,
        hand: hand || [],
        winTile: winTile ?? null,
        kongExtras: kongExtras || [],
      };
      const next = [entry, ...prev];
      localStorage.setItem(KEY_HISTORY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistoryState([]);
    localStorage.removeItem(KEY_HISTORY);
  }, []);

  return { players, setPlayers, history, addRound, clearHistory };
}
