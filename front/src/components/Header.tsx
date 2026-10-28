import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { type Language } from '../utils/translations'
import { useLanguage } from '../context/LanguageContext'

const languages: { code: Language; label: string }[] = [
  { code: 'ua', label: 'UA' },
  { code: 'cz', label: 'CZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export const Header = () => {
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const location = useLocation()
  const { language, setLanguage, t } = useLanguage()

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false)

    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } })
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header
      id="header"
      className="w-full h-[67px] relative z-50 mt-1 px-3 md:px-6 flex items-center justify-between rounded-[3px] bg-[#F9F9FB]"
    >
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 focus:outline-none cursor-pointer md:hidden"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col justify-between w-5 h-4">
            <span
              className={`h-[2px] bg-[#F1569E] rounded-full transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
              }`}
            />
            <span
              className={`h-[2px] bg-[#F1569E] rounded-full transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`h-[2px] bg-[#F1569E] rounded-full transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </div>
        </button>
      </div>
      <div
        onClick={() => {
          setIsMenuOpen(false)
          navigate('/')
        }}
        className="cursor-pointer absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
      >
        <p className="text-[#AA6181] mr-5 cursor-pointer text-[22px] md:text-[26px] font-semibold leading-none whitespace-nowrap">
          ART STUDIO
        </p>
      </div>

      <nav className="hidden md:flex items-center gap-6 font-serif text-[14px] text-[#AA6181] mx-4">
        <button
          onClick={() => scrollToSection('categories')}
          className="hover:text-[#F1569E] transition-colors cursor-pointer whitespace-nowrap"
        >
          {t.categories}
        </button>
        <button
          onClick={() => scrollToSection('catalog')}
          className="hover:text-[#F1569E] transition-colors cursor-pointer whitespace-nowrap"
        >
          {t.catalog}
        </button>
        <button
          onClick={() => scrollToSection('about')}
          className="hover:text-[#F1569E] transition-colors cursor-pointer whitespace-nowrap"
        >
          {t.about}
        </button>
        <button
          onClick={() => scrollToSection('faq')}
          className="hover:text-[#F1569E] transition-colors cursor-pointer whitespace-nowrap"
        >
          {t.faq}
        </button>
      </nav>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex gap-1 items-center cursor-pointer p-1">
            <img
              src="/arrowDown.png"
              className={`w-[14px] h-[8px] object-contain transition-transform ${isLangOpen ? 'rotate-180' : ''}`}
              alt="Arrow"
            />
            <p className="text-[#F1569E] text-[10px] md:text-[11px] font-bold uppercase">{language}</p>
          </button>

          {isLangOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-[#F1569E] rounded-[3px] shadow-md flex flex-col py-1 z-50 min-w-[55px]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setIsLangOpen(false)
                  }}
                  className={`px-3 py-1 text-[10px] font-bold text-center hover:bg-[#F2C2D8]/30 transition-colors cursor-pointer ${
                    language === lang.code ? 'text-[#F1569E] bg-[#F2C2D8]/20' : 'text-[#AA6181]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/cart')}
          className="relative rounded-[3px] bg-[#F1569E] px-2.5 h-[26px] min-w-[61px] flex gap-1 justify-center items-center hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <span className="text-white text-[8px] md:text-[9px] font-bold whitespace-nowrap">{t.cart}</span>
          <img src="/cart.png" className="w-[10px] h-[10px] object-contain brightness-0 invert" alt="cart" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#AA6181] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-[#F1569E] shadow-lg flex flex-col py-3 px-4 font-serif text-[14px] text-[#AA6181] gap-3 animate-fadeIn">
          <button
            onClick={() => scrollToSection('categories')}
            className="text-left py-1 hover:text-[#F1569E] transition-colors border-b border-[#F2C2D8]/30 cursor-pointer"
          >
            {t.categories}
          </button>
          <button
            onClick={() => scrollToSection('catalog')}
            className="text-left py-1 hover:text-[#F1569E] transition-colors border-b border-[#F2C2D8]/30 cursor-pointer"
          >
            {t.catalog}
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="text-left py-1 hover:text-[#F1569E] transition-colors border-b border-[#F2C2D8]/30 cursor-pointer"
          >
            {t.about}
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="text-left py-1 hover:text-[#F1569E] transition-colors border-b border-[#F2C2D8]/30 cursor-pointer"
          >
            {t.faq}
          </button>
        </div>
      )}
    </header>
  )
}
