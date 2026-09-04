import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext({
  lang: 'km',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
  isKhmer: true,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('minishop_lang');
      if (saved === 'en' || saved === 'km') return saved;
      // Default to Khmer since this is a Cambodian store (@minishopnuckbot / Rotha)
      return 'km';
    } catch {
      return 'km';
    }
  });

  const setLang = useCallback((newLang) => {
    if (newLang !== 'en' && newLang !== 'km') return;
    setLangState(newLang);
    try {
      localStorage.setItem('minishop_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {}
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'km' ? 'en' : 'km');
  }, [lang, setLang]);

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
    } catch {}
  }, [lang]);

  const t = useCallback(
    (key, params = {}) => {
      const currentDict = translations[lang] || translations.km;
      let text = currentDict[key] || translations.en[key] || key;

      // Handle parameter substitutions like {count}, {amount}, {points}
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([paramKey, val]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        });
      }

      return text;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        isKhmer: lang === 'km',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
