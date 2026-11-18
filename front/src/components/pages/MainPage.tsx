import { Header } from '../Header'
import { Hero } from '../Hero'
import { FAQ } from '../FAQ'
import { Features } from '../Features'
import { Catalog } from '../Catalog'
import { Categories } from '../Categories'
import { Footer } from '../Footer'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import type { Language } from '../../utils/translations'

export const MainPage = () => {
  const location = useLocation()
  const { language, setLanguage } = useLanguage()

  const [shopStatus, setShopStatus] = useState<{
    isOpen: boolean
    closedMessage: Record<string, string>
  }>({
    isOpen: true,
    closedMessage: {},
  })

  // Завантажуємо статус магазину (відкрито / на паузі)
  useEffect(() => {
    fetch('https://api.artstudioflowers.cz/api/status')
      .then((res) => res.json())
      .then((data) => setShopStatus(data))
      .catch((err) => console.error('Помилка перевірки статусу:', err))
  }, [])

  // Блокуємо скрол сторінки, коли магазин на паузі
  useEffect(() => {
    if (!shopStatus.isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [shopStatus.isOpen])

  useEffect(() => {
    if (location.state && (location.state as any).scrollTo) {
      const targetId = (location.state as any).scrollTo

      window.history.replaceState({}, document.title)

      if (targetId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setTimeout(() => {
          const el = document.getElementById(targetId)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }
    }
  }, [location])

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleSelectCategory = (categoryKey: string) => {
    setSelectedCategory(categoryKey)
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Заголовки попапу під коди мов із LanguageContext ('ua' замість 'uk')
  const pauseTitles: Record<string, string> = {
    cz: 'Dočasně pozastaveno',
    ua: 'Прийом замовлень призупинено',
    en: 'Orders Temporarily Paused',
    ru: 'Прием заказов приостановлен',
  }

  // Отримуємо правильний переклад тексту з бази (де українська збережена як 'uk')
  const backendLangKey = language === 'ua' ? 'uk' : language
  const localizedClosedMessage =
    shopStatus.closedMessage[backendLangKey] ||
    shopStatus.closedMessage['cz'] ||
    shopStatus.closedMessage['uk']

  return (
    <div className="min-h-screen bg-[#E5E5E5] flex justify-center relative">
      {/* ПОПАП РЕЖИМУ ПАУЗИ (z-[9999] перекриває і Header) */}
      {!shopStatus.isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#F1569E] rounded-[4px] max-w-[400px] w-full p-6 md:p-8 text-center shadow-2xl">
            {/* Перемикач мов прямо в попапі */}
            <div className="flex justify-center gap-2 mb-5">
              {(['cz', 'ua', 'en', 'ru'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`text-[11px] font-serif uppercase px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors ${
                    language === lang
                      ? 'bg-[#F1569E] text-white'
                      : 'text-[#AA6181] border border-[#AA6181]/30 hover:border-[#F1569E]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="text-4xl mb-3">🌸</div>

            <h2 className="text-[#F1569E] text-[22px] md:text-[26px] font-serif uppercase tracking-wider leading-tight mb-3">
              {pauseTitles[language] || pauseTitles.cz}
            </h2>

            <p className="text-[#AA6181] text-[14px] md:text-[15px] font-serif leading-relaxed">
              {localizedClosedMessage}
            </p>
          </div>
        </div>
      )}

      <main className="w-full min-h-screen bg-white px-3 py-2 flex flex-col items-center">
        <Header></Header>
        <Hero></Hero>
        <Categories onSelectCategory={handleSelectCategory}></Categories>
        <Catalog
          selectedCategory={selectedCategory}
          onResetCategory={() => setSelectedCategory(null)}
        ></Catalog>
        <Features></Features>
        <FAQ></FAQ>
        <Footer></Footer>
      </main>
    </div>
  )
}