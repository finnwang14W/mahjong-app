import { useState, useCallback } from 'react';

const KEY_PLAYERS   = 'mj_players';       // pro player names (4)
const KEY_SOCIAL_PL = 'mj_social_players'; // social player names (N)
const KEY_HISTORY   = 'mj_history';
const KEY_MODE      = 'mj_board_mode';
const KEY_PRO_STATE = 'mj_pro_state';

export const WIND_NAMES = ['东', '南', '西', '北'];

function load(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

// Per-player score delta for one round
export function calcScores(entry, numPlayers = 4) {
  const scores = new Array(numPlayers).fill(0);
  const winnerIdx = entry.winnerIdx ?? entry.playerIndex;
  if (winnerIdx == null || winnerIdx >= numPlayers) return scores;
  if (entry.selfDraw || entry.loserIdx == null) {
    scores[winnerIdx] += 3 * entry.totalFan;
    for (let i = 0; i < numPlayers; i++) {
      if (i !== winnerIdx) scores[i] -= entry.totalFan;
    }
  } else {
    scores[winnerIdx] += entry.totalFan;
    if (entry.loserIdx != null && entry.loserIdx < numPlayers) {
      scores[entry.loserIdx] -= entry.totalFan;
    }
  }
  return scores;
}

// Seat wind index (0=东,1=南,2=西,3=北) for playerIdx given current dealerIdx
export function getSeatWindIdx(playerIdx, dealerIdx) {
  return (playerIdx - dealerIdx + 4) % 4;
}

// Compute next pro game state after dealer/non-dealer wins
export function advanceProState(state, winnerIdx) {
  const { dealerIdx, roundWind, consecutiveWins } = state;
  const isDealerWin = winnerIdx === dealerIdx;
  if (isDealerWin) {
    // 连庄：dealer stays, consecutive count increments
    return { dealerIdx, roundWind, consecutiveWins: consecutiveWins + 1 };
  } else {
    // 庄家轮转：dealer advances, wrap triggers round-wind increment
    const newDealer = (dealerIdx + 1) % 4;
    const newRoundWind = newDealer === 0 ? Math.min(roundWind + 1, 3) : roundWind;
    return { dealerIdx: newDealer, roundWind: newRoundWind, consecutiveWins: 0 };
  }
}

export function useGameHistory() {
  const [boardMode, setBoardModeRaw] = useState(
    () => load(KEY_MODE, 'social')
  );
  const [socialPlayers, setSocialPlayersRaw] = useState(
    () => load(KEY_SOCIAL_PL, ['玩家1', '玩家2', '玩家3', '玩家4'])
  );
  const [proPlayers, setProPlayersRaw] = useState(
    () => load(KEY_PLAYERS, WIND_NAMES.slice())
  );
  // { dealerIdx: null|0-3, roundWind: 0-3, consecutiveWins: number }
  const [proGameState, setProGameStateRaw] = useState(
    () => load(KEY_PRO_STATE, { dealerIdx: null, roundWind: 0, consecutiveWins: 0 })
  );
  const [history, setHistoryRaw] = useState(
    () => load(KEY_HISTORY, [])
  );

  const setBoardMode = useCallback((mode) => {
    setBoardModeRaw(mode);
    localStorage.setItem(KEY_MODE, JSON.stringify(mode));
  }, []);

  const setSocialPlayers = useCallback((names) => {
    setSocialPlayersRaw(names);
    localStorage.setItem(KEY_SOCIAL_PL, JSON.stringify(names));
  }, []);

  const setProPlayers = useCallback((names) => {
    setProPlayersRaw(names);
    localStorage.setItem(KEY_PLAYERS, JSON.stringify(names));
  }, []);

  const setProGameState = useCallback((state) => {
    setProGameStateRaw(state);
    localStorage.setItem(KEY_PRO_STATE, JSON.stringify(state));
  }, []);

  const initProGame = useCallback((dealerIdx) => {
    setProGameState({ dealerIdx, roundWind: 0, consecutiveWins: 0 });
  }, [setProGameState]);

  const resetProGame = useCallback(() => {
    setProGameState({ dealerIdx: null, roundWind: 0, consecutiveWins: 0 });
  }, [setProGameState]);

  // Derived: active players and legacy compat setter
  const players = boardMode === 'pro' ? proPlayers : socialPlayers;
  const setPlayers = useCallback((names) => {
    if (boardMode === 'pro') setProPlayers(names);
    else setSocialPlayers(names);
  }, [boardMode, setProPlayers, setSocialPlayers]);

  const addRound = useCallback(({
    winnerIdx, loserIdx, selfDraw,
    totalFan, fans, hand, winTile, kongExtras,
  }) => {
    // Snapshot and advance pro state synchronously before React batches it
    let proStateSnapshot = null;
    if (boardMode === 'pro' && proGameState.dealerIdx !== null) {
      proStateSnapshot = { ...proGameState };
      setProGameState(advanceProState(proGameState, winnerIdx));
    }

    setHistoryRaw(prev => {
      const numPlayers = boardMode === 'social' ? socialPlayers.length : 4;
      const entry = {
        id: Date.now(),
        timestamp: Date.now(),
        mode: boardMode,
        numPlayers,
        winnerIdx,
        loserIdx: selfDraw ? null : loserIdx,
        selfDraw: !!selfDraw,
        totalFan,
        fans,
        hand: hand || [],
        winTile: winTile ?? null,
        kongExtras: kongExtras || [],
        proState: proStateSnapshot, // null for social mode
      };
      const next = [entry, ...prev];
      localStorage.setItem(KEY_HISTORY, JSON.stringify(next));
      return next;
    });
  }, [boardMode, socialPlayers.length, proGameState, setProGameState]);

  const clearHistory = useCallback(() => {
    setHistoryRaw([]);
    localStorage.removeItem(KEY_HISTORY);
  }, []);

  return {
    boardMode, setBoardMode,
    players,
    socialPlayers, setSocialPlayers,
    proPlayers, setProPlayers,
    setPlayers,
    proGameState, setProGameState, initProGame, resetProGame,
    history, addRound, clearHistory,
  };
}
