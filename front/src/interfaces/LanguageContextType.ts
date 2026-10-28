import { type Language, translations } from "../utils/translations";


export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['ua'];
}