import { Header } from '../Header'
import { Hero } from '../Hero'
import { FAQ } from '../FAQ'
import { Features } from '../Features'
import { Catalog } from '../Catalog'
import { Categories } from '../Categories'
import { Footer } from '../Footer'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'

export const MainPage = () => {
  const location = useLocation()

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

  return (
    <div className="min-h-screen bg-[#E5E5E5] flex justify-center">
      <main className="w-full min-h-screen bg-white px-3 py-2 flex flex-col items-center">
        <Header></Header>
        <Hero></Hero>
        <Categories onSelectCategory={handleSelectCategory}></Categories>
        <Catalog selectedCategory={selectedCategory} onResetCategory={() => setSelectedCategory(null)}></Catalog>
        <Features></Features>
        <FAQ></FAQ>
        <Footer></Footer>
      </main>
    </div>
  )
}
