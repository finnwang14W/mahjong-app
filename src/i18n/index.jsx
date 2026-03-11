import { createContext, useContext, useState, useCallback } from 'react';
import { TRANSLATIONS } from './translations';

const SUPPORTED = ['zh', 'en', 'de'];
const STORAGE_KEY = 'mj_lang';

function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch {}
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('de')) return 'de';
  return 'en'; // fallback for all unsupported languages
}

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  const setLang = useCallback((l) => {
    if (!SUPPORTED.includes(l)) return;
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
    setLangState(l);
  }, []);

  const t = TRANSLATIONS[lang];
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
