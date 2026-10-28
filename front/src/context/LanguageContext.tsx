import { createContext, useContext, type ReactNode, useState } from "react";
import type { LanguageContextType } from "../interfaces/LanguageContextType";
import { translations, type Language } from "../utils/translations";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('art_studio_lang');
    return (saved as Language) || 'cz';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('art_studio_lang', lang);
  };

  const t = translations[language] || translations.cz;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};