import { useState, useRef, useEffect } from 'react';

const C = {
  zh: {
    tabVip: '邀请码',
    tabGeek: '极客模式',
    vipIcon: '🔑',
    vipTitle: '内测邀请码',
    vipSubtitle: '输入邀请码以解锁高级功能',
    vipPlaceholder: '请输入邀请码',
    geekIcon: '⚡',
    geekTitle: '极客模式',
    geekSubtitle: '使用自己的 API Key（Anthropic / OpenAI 等），不占用服务器额度',
    geekPlaceholder: 'sk-ant-... / sk-... / 其他',
    geekHint: '仅存于本地浏览器，不上传服务器',
    confirm: '确认',
    cancel: '取消',
    checking: '验证中…',
    errors: {
      INVALID_PASSCODE: '邀请码无效，请重试',
      NETWORK_ERROR: '网络错误，请稍后重试',
      INVALID_API_KEY: '该 API Key 无效，请检查后重试',
      INVALID_KEY_FORMAT: 'API Key 过短，请检查后重试',
    },
  },
  en: {
    tabVip: 'Invite Code',
    tabGeek: 'Geek Mode',
    vipIcon: '🔑',
    vipTitle: 'VIP Access Code',
    vipSubtitle: 'Enter your invite code to unlock premium features',
    vipPlaceholder: 'Enter access code',
    geekIcon: '⚡',
    geekTitle: 'Geek Mode',
    geekSubtitle: 'Use your own API Key (Anthropic, OpenAI, etc.) — no server quota consumed',
    geekPlaceholder: 'sk-ant-... / sk-... / other',
    geekHint: 'Stored locally only, never sent to our servers',
    confirm: 'Confirm',
    cancel: 'Cancel',
    checking: 'Verifying…',
    errors: {
      INVALID_PASSCODE: 'Invalid code, please try again',
      NETWORK_ERROR: 'Network error, please retry',
      INVALID_API_KEY: 'Invalid API Key, please check and retry',
      INVALID_KEY_FORMAT: 'API Key too short, please check and retry',
    },
  },
  de: {
    tabVip: 'Einladungscode',
    tabGeek: 'Geek-Modus',
    vipIcon: '🔑',
    vipTitle: 'VIP-Einladungscode',
    vipSubtitle: 'Einladungscode eingeben, um Premium-Funktionen freizuschalten',
    vipPlaceholder: 'Einladungscode eingeben',
    geekIcon: '⚡',
    geekTitle: 'Geek-Modus',
    geekSubtitle: 'Eigenen API Key verwenden (Anthropic, OpenAI usw.) — kein Serverkontingent',
    geekPlaceholder: 'sk-ant-... / sk-... / anderer',
    geekHint: 'Nur lokal gespeichert, wird nie hochgeladen',
    confirm: 'Bestätigen',
    cancel: 'Abbrechen',
    checking: 'Überprüfe…',
    errors: {
      INVALID_PASSCODE: 'Ungültiger Code, bitte erneut versuchen',
      NETWORK_ERROR: 'Netzwerkfehler, bitte erneut versuchen',
      INVALID_API_KEY: 'Ungültiger API Key, bitte überprüfen',
      INVALID_KEY_FORMAT: 'API Key zu kurz, bitte überprüfen',
    },
  },
};

export default function PasscodeModal({
  onConfirm, onConfirmApiKey, onClose,
  error, isChecking, lang, initialTab = 'vip',
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [vipValue, setVipValue] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);
  const c = C[lang] || C.zh;

  // 切换 Tab 时重新 focus
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [activeTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setLocalError('');
  };

  // ── VIP 邀请码提交 ──
  const handleVipSubmit = (e) => {
    e.preventDefault();
    const trimmed = vipValue.trim();
    if (trimmed && !isChecking) onConfirm(trimmed);
  };

  // ── 极客模式提交 ──
  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    const trimmed = apiKeyValue.trim();
    if (!trimmed) return;
    if (trimmed.length < 20) {
      setLocalError(c.errors.INVALID_KEY_FORMAT);
      return;
    }
    setLocalError('');
    onConfirmApiKey(trimmed);
  };

  const vipErrorText = activeTab === 'vip' && error
    ? (c.errors[error] ?? c.errors.INVALID_PASSCODE)
    : '';
  const geekErrorText = activeTab === 'geek'
    ? (localError || (error === 'INVALID_API_KEY' ? c.errors.INVALID_API_KEY : ''))
    : '';

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-modal" onClick={e => e.stopPropagation()}>

        {/* Tab 切换 */}
        <div className="pc-tabs">
          <button
            className={`pc-tab ${activeTab === 'vip' ? 'pc-tab-active' : ''}`}
            onClick={() => handleTabSwitch('vip')}
          >{c.tabVip}</button>
          <button
            className={`pc-tab ${activeTab === 'geek' ? 'pc-tab-active' : ''}`}
            onClick={() => handleTabSwitch('geek')}
          >{c.tabGeek} ⚡</button>
        </div>

        {/* ── VIP 邀请码 Tab ── */}
        {activeTab === 'vip' && (
          <>
            <div className="pc-icon">{c.vipIcon}</div>
            <h2 className="pc-title calli">{c.vipTitle}</h2>
            <p className="pc-subtitle">{c.vipSubtitle}</p>
            <form onSubmit={handleVipSubmit} className="pc-form">
              <input
                ref={inputRef}
                className={`pc-input ${vipErrorText ? 'pc-input-error' : ''}`}
                type="text"
                value={vipValue}
                onChange={e => setVipValue(e.target.value)}
                placeholder={c.vipPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {vipErrorText && <p className="pc-error">{vipErrorText}</p>}
              <div className="pc-buttons">
                <button type="button" className="pc-btn-cancel" onClick={onClose}>{c.cancel}</button>
                <button type="submit" className="pc-btn-confirm" disabled={!vipValue.trim() || isChecking}>
                  {isChecking ? (<><span className="pc-spinner" /> {c.checking}</>) : c.confirm}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── 极客模式 Tab ── */}
        {activeTab === 'geek' && (
          <>
            <div className="pc-icon">{c.geekIcon}</div>
            <h2 className="pc-title calli">{c.geekTitle}</h2>
            <p className="pc-subtitle">{c.geekSubtitle}</p>
            <form onSubmit={handleApiKeySubmit} className="pc-form">
              <input
                ref={inputRef}
                className={`pc-input pc-input-mono ${geekErrorText ? 'pc-input-error' : ''}`}
                type="text"
                value={apiKeyValue}
                onChange={e => { setApiKeyValue(e.target.value); setLocalError(''); }}
                placeholder={c.geekPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {geekErrorText
                ? <p className="pc-error">{geekErrorText}</p>
                : <p className="pc-hint">🔒 {c.geekHint}</p>
              }
              <div className="pc-buttons">
                <button type="button" className="pc-btn-cancel" onClick={onClose}>{c.cancel}</button>
                <button type="submit" className="pc-btn-confirm" disabled={!apiKeyValue.trim()}>
                  {c.confirm}
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
