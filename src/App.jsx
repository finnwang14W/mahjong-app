import { useState, useCallback, useRef } from 'react';
import MahjongTile from './components/MahjongTile';
import TilePicker from './components/TilePicker';
import HandDisplay from './components/HandDisplay';
import GameOptions from './components/GameOptions';
import ScoreResult from './components/ScoreResult';
import PhotoRecognizer from './components/PhotoRecognizer';
import SaveRound from './components/SaveRound';
import Scoreboard from './components/Scoreboard';
import RulesPage from './components/RulesPage';
import Mahjong101Page from './components/Mahjong101Page';
import AuthModal from './components/AuthModal';
import DiscardAnalyzer from './components/DiscardAnalyzer';
import TrainingRoom from './components/TrainingRoom';
import PasscodeModal from './components/PasscodeModal';
import { calculate } from './logic/calculator';
import { useLang } from './i18n/index.jsx';
import { useGameHistory } from './hooks/useGameHistory';
import { useLocalState } from './hooks/useLocalState';
import './App.css';

const MAX_TILES = 14;
const LANGS = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
];

export default function App() {
  const { lang, setLang, t } = useLang();
  const [tab, setTab] = useState('calc'); // 'calc' | 'record' | 'rules' | 'guide' | 'train'
  const [hand, setHand] = useLocalState('mj_hand', []);
  const [kongExtras, setKongExtras] = useLocalState('mj_kongs_v2', []); // [{tile, type:'open'|'concealed'}]
  const [winTileIdx, setWinTileIdx] = useState(null);
  const [options, setOptions] = useLocalState('mj_options', {
    selfDraw: false,
    fullyConcealed: true,
    lastTile: false,
    winOnKong: false,
    robbingKong: false,
    seatWind: null,
    roundWind: null,
    flowers: 0,
    openKongs: 0,
    concealedKongs: 0,
    concealedTriplets: 0,
    waitType: null,
  });
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [calcKey, setCalcKey] = useState(0);
  const [beginnerMode, setBeginnerMode] = useLocalState('mj_beginner_mode', false);
  const [auth, setAuth] = useLocalState('mj_auth', { loggedIn: false, username: '' });
  const [showAuth, setShowAuth] = useState(false);
  const [myPlayerIdx, setMyPlayerIdx] = useLocalState('mj_my_player', 0);

  // ── 邀请码 & BYOK 鉴权 ──────────────────────────────────────
  const [passcode, setPasscode] = useLocalState('mj_access_code', '');
  const [userApiKey, setUserApiKey] = useLocalState('mj_user_api_key', '');
  const [pcModal, setPcModal] = useState({ open: false, error: '', checking: false, tab: 'vip' });
  const pcCallbackRef = useRef(null);

  // 已授权 = 有邀请码 OR 有用户自带 Key
  const isAuthorized = !!(passcode || userApiKey);

  // 需要鉴权时调用；已授权直接执行 callback，否则弹出输入框
  const requirePasscode = useCallback((callback) => {
    if (isAuthorized) {
      callback?.();
    } else {
      pcCallbackRef.current = callback ?? null;
      setPcModal({ open: true, error: '', checking: false, tab: 'vip' });
    }
  }, [isAuthorized]);

  // VIP 邀请码确认
  const handlePcConfirm = useCallback(async (entered) => {
    setPcModal(prev => ({ ...prev, checking: true, error: '' }));
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-code': entered },
      });
      if (res.ok) {
        setPasscode(entered);
        const cb = pcCallbackRef.current;
        pcCallbackRef.current = null;
        setPcModal({ open: false, error: '', checking: false, tab: 'vip' });
        cb?.();
      } else {
        setPcModal(prev => ({ ...prev, checking: false, error: 'INVALID_PASSCODE' }));
      }
    } catch {
      setPcModal(prev => ({ ...prev, checking: false, error: 'NETWORK_ERROR' }));
    }
  }, [setPasscode]);

  // 极客模式：用户自带 Key（本地格式校验通过后直接保存，无需服务端验证）
  const handlePcConfirmApiKey = useCallback((key) => {
    setUserApiKey(key);
    const cb = pcCallbackRef.current;
    pcCallbackRef.current = null;
    setPcModal({ open: false, error: '', checking: false, tab: 'vip' });
    cb?.();
  }, [setUserApiKey]);

  // 邀请码失效（服务端已更改）
  const handlePcInvalid = useCallback(() => {
    setPasscode('');
    pcCallbackRef.current = null;
    setPcModal({ open: true, error: 'INVALID_PASSCODE', checking: false, tab: 'vip' });
  }, [setPasscode]);

  // 用户 Key 无效（Anthropic 返回 401）
  const handleApiKeyInvalid = useCallback(() => {
    setUserApiKey('');
    pcCallbackRef.current = null;
    setPcModal({ open: true, error: 'INVALID_API_KEY', checking: false, tab: 'geek' });
  }, [setUserApiKey]);

  const {
    boardMode, setBoardMode,
    players,
    socialPlayers, setSocialPlayers,
    proPlayers, setProPlayers,
    setPlayers,
    proGameState, initProGame, resetProGame,
    history, addRound, clearHistory,
  } = useGameHistory();

  const addTile = useCallback((tileOrTiles) => {
    const tiles = Array.isArray(tileOrTiles) ? tileOrTiles : [tileOrTiles];
    if (hand.length + tiles.length > MAX_TILES) return;
    setHand(prev => [...prev, ...tiles]);
    setWinTileIdx(null);
    setShowResult(false);
    setResult(null);
  }, [hand.length]);

  // 添加杠：3张进手牌（计入14张）+ 1张杠extra（不计入）+ 自动增加对应杠数
  const addKong = useCallback((tile, type) => { // type: 'open' | 'concealed'
    if (hand.length + 3 > MAX_TILES) return;
    setHand(prev => [...prev, tile, tile, tile]);
    setKongExtras(prev => [...prev, { tile, type }]);
    setOptions(prev => ({
      ...prev,
      openKongs: type === 'open' ? (prev.openKongs || 0) + 1 : (prev.openKongs || 0),
      concealedKongs: type === 'concealed' ? (prev.concealedKongs || 0) + 1 : (prev.concealedKongs || 0),
    }));
    setWinTileIdx(null);
    setShowResult(false);
    setResult(null);
  }, [hand.length]);

  // 移除杠：同时删除手牌中3张同牌 + extra + 减少对应杠数
  const removeKong = useCallback((kongIdx) => {
    const { tile, type } = kongExtras[kongIdx];
    setKongExtras(prev => prev.filter((_, i) => i !== kongIdx));
    setHand(prev => {
      let removed = 0;
      return prev.filter(t => {
        if (t === tile && removed < 3) { removed++; return false; }
        return true;
      });
    });
    setOptions(prev => ({
      ...prev,
      openKongs: type === 'open' ? Math.max(0, (prev.openKongs || 0) - 1) : (prev.openKongs || 0),
      concealedKongs: type === 'concealed' ? Math.max(0, (prev.concealedKongs || 0) - 1) : (prev.concealedKongs || 0),
    }));
    setWinTileIdx(null);
    setShowResult(false);
    setResult(null);
  }, [kongExtras]);

  const removeTile = useCallback((index) => {
    setHand(prev => prev.filter((_, i) => i !== index));
    // 删除胡牌 → 清除；删除胡牌之前的牌 → 索引前移；其他 → 不变
    setWinTileIdx(prev => {
      if (prev === null) return null;
      if (prev === index) return null;
      if (index < prev) return prev - 1;
      return prev;
    });
    setShowResult(false);
    setResult(null);
  }, []);

  const clearHand = useCallback(() => {
    setHand([]);
    setKongExtras([]);
    setWinTileIdx(null);
    setResult(null);
    setShowResult(false);
    setOptions(prev => ({ ...prev, concealedKongs: 0, openKongs: 0 }));
  }, []);

  // 点击牌主体切换胡牌标记，不受张数限制，同一时间只能标一张
  const handleSetWinTile = useCallback((idx) => {
    setWinTileIdx(prev => prev === idx ? null : idx);
    setShowResult(false);
    setResult(null);
  }, []);

  const handleCalculate = useCallback(() => {
    const calcOpts = { ...options };
    if (winTileIdx !== null) {
      calcOpts.winTile = hand[winTileIdx];
    }
    setResult(calculate(hand, calcOpts));
    setShowResult(true);
    setCalcKey(k => k + 1);
  }, [hand, options, winTileIdx]);

  const handlePhotoRecognized = useCallback((tiles) => {
    setHand(tiles.slice(0, MAX_TILES));
    setKongExtras([]);
    setWinTileIdx(null);
    setResult(null);
    setShowResult(false);
  }, []);

  // ── AI 精准模型回调：更新手牌并高亮变更的牌 ──────────────────────────────
  const [flashIndices, setFlashIndices] = useState([]);
  const handleTilesRefined = useCallback((newTiles, changedIndices) => {
    setHand(newTiles.slice(0, MAX_TILES));
    setFlashIndices(changedIndices);
    // CSS 动画播放完毕后清除（动画时长 1.4s）
    setTimeout(() => setFlashIndices([]), 1500);
  }, []);

  const canCalculate = hand.length === MAX_TILES;

  // 计数器文字：显示手牌数 + 杠数
  const counterText = kongExtras.length > 0
    ? `${hand.length}/${MAX_TILES} + ${kongExtras.length}${t.kongUnit}`
    : `${hand.length} / ${MAX_TILES}`;

  return (
    <div className="app" data-lang={lang}>
      <header className="app-header">
        <h1 className="app-title calli">
          <MahjongTile tile={45} scale={0.17} style={{ flexShrink: 0 }} />
          <span>{t.title}</span>
        </h1>
        <div className="header-right">
          <div className="lang-switcher">
            {LANGS.map(l => (
              <button
                key={l.code}
                className={`lang-btn ${lang === l.code ? 'lang-btn-active' : ''}`}
                onClick={() => setLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            className={`auth-avatar-btn ${auth.loggedIn ? 'auth-avatar-btn-active' : ''}`}
            onClick={() => setShowAuth(true)}
            title={auth.loggedIn ? auth.username : t.loginBtn}
          >
            {auth.loggedIn ? auth.username.charAt(0).toUpperCase() : '👤'}
          </button>
        </div>
      </header>

      {/* 分页切换 */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === 'calc' ? 'tab-btn-active' : ''}`}
          onClick={() => setTab('calc')}
        >
          {t.tabCalc}
        </button>
        <button
          className={`tab-btn ${tab === 'record' ? 'tab-btn-active' : ''}`}
          onClick={() => setTab('record')}
        >
          {t.tabRecord}
          {history.length > 0 && (
            <span className="tab-badge">{history.length}</span>
          )}
        </button>
        <button
          className={`tab-btn ${tab === 'rules' ? 'tab-btn-active' : ''}`}
          onClick={() => setTab('rules')}
        >
          {t.tabRules}
        </button>
        <button
          className={`tab-btn ${tab === 'guide' ? 'tab-btn-active' : ''}`}
          onClick={() => setTab('guide')}
        >
          {t.tab101}
        </button>
        <button
          className={`tab-btn ${tab === 'train' ? 'tab-btn-active' : ''}`}
          onClick={() => setTab('train')}
        >
          {t.tabTrain}
        </button>
      </div>

      <main className="app-main">
        {tab === 'calc' ? (
          <>
            {/* 手牌区 */}
            <div className="card">
              <div className="card-header">
                <span className="card-title calli">{t.myHand}</span>
                <div className="card-header-right">
                  <span className="tile-counter">{counterText}</span>
                  {(hand.length > 0 || kongExtras.length > 0) && (
                    <button className="btn-ghost-danger" onClick={clearHand}>{t.clear}</button>
                  )}
                </div>
              </div>
              <HandDisplay
                hand={hand}
                onRemove={removeTile}
                onSetWinTile={handleSetWinTile}
                winTileIdx={winTileIdx}
                tapToRemove={t.tapToRemove}
                tapToMark={t.tapToMark}
                kongExtras={kongExtras}
                onRemoveKong={removeKong}
                t={t}
                flashIndices={flashIndices}
              />
              {hand.length === 0 && kongExtras.length === 0 && (
                <p className="empty-hint">{t.needMore(MAX_TILES)}</p>
              )}
              <PhotoRecognizer
                onTilesRecognized={handlePhotoRecognized}
                onTilesRefined={handleTilesRefined}
                disabled={false}
                t={t}
                passcode={passcode}
                userApiKey={userApiKey}
                requirePasscode={requirePasscode}
                onPasscodeInvalid={handlePcInvalid}
                onApiKeyInvalid={handleApiKeyInvalid}
              />
            </div>

            {/* 选牌区 */}
            <div className="card">
              <div className="card-title card-title-standalone calli">{t.pickTiles}</div>
              <TilePicker
                onSelect={addTile}
                onSelectKong={addKong}
                slotsLeft={MAX_TILES - hand.length}
                t={t}
              />
            </div>

            {/* 附加条件 */}
            <div className="card">
              <div className="card-title card-title-standalone">{t.options}</div>
              <GameOptions
                options={options}
                onChange={setOptions}
                t={t}
                autoWaitActive={winTileIdx !== null}
                beginnerMode={beginnerMode}
                onBeginnerModeChange={setBeginnerMode}
              />
            </div>

            {/* 计算按钮 */}
            <button
              className={`btn-calc ${canCalculate ? 'btn-calc-ready' : 'btn-calc-waiting'}`}
              onClick={handleCalculate}
              disabled={!canCalculate}
            >
              <span className="calli">
                {canCalculate ? t.calculate : t.needMore(MAX_TILES - hand.length)}
              </span>
            </button>
            <p className="calc-footer-note">{t.footerNote}</p>

            {(hand.length === 13 || hand.length === 14) && (
              <DiscardAnalyzer hand={hand} />
            )}

            {showResult && result && (
              <>
                <ScoreResult result={result} t={t} lang={lang} beginnerMode={beginnerMode} />
                {result.valid && (!result.tooLow || beginnerMode) && (
                  <SaveRound
                    key={calcKey}
                    totalFan={result.totalFan}
                    fans={result.fans}
                    players={players}
                    selfDraw={options.selfDraw}
                    onSave={addRound}
                    t={t}
                    hand={hand}
                    winTile={winTileIdx !== null ? hand[winTileIdx] : null}
                    kongExtras={kongExtras}
                  />
                )}
              </>
            )}
          </>
        ) : tab === 'record' ? (
          <Scoreboard
            boardMode={boardMode}
            setBoardMode={setBoardMode}
            players={players}
            socialPlayers={socialPlayers}
            setSocialPlayers={setSocialPlayers}
            proPlayers={proPlayers}
            setProPlayers={setProPlayers}
            setPlayers={setPlayers}
            proGameState={proGameState}
            initProGame={initProGame}
            resetProGame={resetProGame}
            history={history}
            onClearHistory={clearHistory}
            t={t}
            myPlayerIdx={myPlayerIdx}
            setMyPlayerIdx={setMyPlayerIdx}
          />
        ) : tab === 'rules' ? (
          <RulesPage t={t} lang={lang} />
        ) : tab === 'guide' ? (
          <Mahjong101Page lang={lang} />
        ) : (
          <TrainingRoom lang={lang} />
        )}
      </main>


      {showAuth && (
        <AuthModal
          auth={auth}
          onLogin={(username) => setAuth({ loggedIn: true, username })}
          onLogout={() => setAuth({ loggedIn: false, username: '' })}
          onClose={() => setShowAuth(false)}
          t={t}
        />
      )}

      {pcModal.open && (
        <PasscodeModal
          lang={lang}
          error={pcModal.error}
          isChecking={pcModal.checking}
          initialTab={pcModal.tab}
          onConfirm={handlePcConfirm}
          onConfirmApiKey={handlePcConfirmApiKey}
          onClose={() => setPcModal(prev => ({ ...prev, open: false }))}
        />
      )}
    </div>
  );
}
