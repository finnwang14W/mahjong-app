import { useState } from 'react';

export default function AuthModal({ auth, onLogin, onLogout, onClose, t }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
      onClose();
    }
  };

  if (auth.loggedIn) {
    return (
      <div className="auth-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={e => e.stopPropagation()}>
          <div className="auth-avatar-large">{auth.username.charAt(0).toUpperCase()}</div>
          <div className="auth-display-name">{auth.username}</div>
          <p className="auth-hint">{t.authLoggedInHint}</p>
          <button className="auth-logout-btn" onClick={() => { onLogout(); onClose(); }}>
            {t.logoutBtn}
          </button>
          <button className="auth-close-btn" onClick={onClose}>{t.cancel}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-modal-title">
          {mode === 'login' ? t.authLogin : t.authRegister}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">{t.authUsername}</label>
            <input
              className="auth-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={t.authUsernamePlaceholder}
              maxLength={16}
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">{t.authPassword}</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t.authPasswordPlaceholder}
            />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={!username.trim()}>
            {mode === 'login' ? t.authLogin : t.authRegister}
          </button>
        </form>
        <button
          className="auth-switch-btn"
          onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? t.authSwitchToRegister : t.authSwitchToLogin}
        </button>
      </div>
    </div>
  );
}
