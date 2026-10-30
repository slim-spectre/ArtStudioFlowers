import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import type { CatalogProps } from '../interfaces/CatalogProps'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { getLocalizedName } from '../utils/localise'

const MIN_LIMIT = 0
const MAX_LIMIT = 20000

export const Catalog = ({ selectedCategory = null, onResetCategory }: CatalogProps) => {
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(20000)
  const [items, setItems] = useState<{ id: number; name: any; price: number; image: string; category: any }[]>([])

  useEffect(() => {
    fetch('https://api.artstudioflowers.cz/api/products')
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error('Помилка завантаження товарів:', err))
  }, [])

  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const handleBuy = (product: (typeof items)[0]) => {
    addToCart({
      id: product.id,
      name: getLocalizedName(product.name, language),
      price: product.price,
      image: product.image,
    })
    navigate('/cart')
  }

  const [minInput, setMinInput] = useState<string>('0')
  const [maxInput, setMaxInput] = useState<string>('20000')

  const handleMinSlider = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - 100)
    setMinPrice(value)
    setMinInput(String(value))
  }

  const handleMaxSlider = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 100)
    setMaxPrice(value)
    setMaxInput(String(value))
  }

  const handleMinInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMinInput(val)

    if (val !== '') {
      const num = Number(val)
      if (!isNaN(num) && num <= maxPrice) {
        setMinPrice(num)
      }
    }
  }

  const handleMaxInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMaxInput(val)

    if (val !== '') {
      const num = Number(val)
      if (!isNaN(num) && num >= minPrice && num <= MAX_LIMIT) {
        setMaxPrice(num)
      }
    }
  }

  const handleMinBlur = () => {
    let num = Number(minInput)

    if (minInput === '' || isNaN(num) || num < MIN_LIMIT) {
      num = MIN_LIMIT
    } else if (num > maxPrice - 100) {
      num = maxPrice - 100
    }

    setMinPrice(num)
    setMinInput(String(num))
  }

  const handleMaxBlur = () => {
    let num = Number(maxInput)

    if (maxInput === '' || isNaN(num) || num > MAX_LIMIT) {
      num = MAX_LIMIT
    } else if (num < minPrice + 100) {
      num = minPrice + 100
    }

    setMaxPrice(num)
    setMaxInput(String(num))
  }

  const minPercent = ((minPrice - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100
  const maxPercent = ((maxPrice - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100

  const filteredProducts = items.filter((item) => {
    const matchesPrice = item.price >= minPrice && item.price <= maxPrice
    const itemCategoryLocalized = getLocalizedName(item.category, language);
    const matchesCategory = selectedCategory ? itemCategoryLocalized === selectedCategory : true

    return matchesPrice && matchesCategory
  })

  return (
    <section id="catalog" className="w-full text-center mt-2 px-1">
      <h2 className="text-[#AA6181] text-[26px] md:text-[32px] font-serif uppercase tracking-widest leading-none mb-1">
        {t.catalog}
      </h2>

      {selectedCategory ? (
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[#F1569E] text-[13px] md:text-[15px] font-serif font-bold">
            {t.categoryLabel}: {selectedCategory}
          </span>
          {onResetCategory && (
            <button
              onClick={onResetCategory}
              className="text-[#AA6181] text-[11px] md:text-[13px] font-serif underline hover:text-[#F1569E] transition-colors cursor-pointer"
            >
              {t.reset}
            </button>
          )}
        </div>
      ) : (
        <p className="text-[#F1569E] text-[14px] md:text-[16px] font-serif mb-1">{t.catalogSubtitle}</p>
      )}

      <p className="text-[#AA6181] text-[11px] md:text-[13px] font-serif max-w-[280px] md:max-w-[450px] mx-auto leading-tight mb-5">
        {t.catalogDesc}
      </p>

      <div className="max-w-[260px] md:max-w-[360px] mx-auto mb-7">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="border border-[#F1569E] rounded-[2px] px-2.5 py-1 w-1/2 flex items-center gap-1 bg-white">
            <span className="text-[#AA6181] text-[12px] font-serif shrink-0">{t.from}</span>
            <input
              type="number"
              value={minInput}
              onChange={handleMinInputChange}
              onBlur={handleMinBlur}
              placeholder="0"
              className="w-full text-[#AA6181] text-[12px] font-serif bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="border border-[#F1569E] rounded-[2px] px-2.5 py-1 w-1/2 flex items-center gap-1 bg-white">
            <span className="text-[#AA6181] text-[12px] font-serif shrink-0">{t.to}</span>
            <input
              type="number"
              value={maxInput}
              onChange={handleMaxInputChange}
              onBlur={handleMaxBlur}
              placeholder="20000"
              className="w-full text-[#AA6181] text-[12px] font-serif bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <div className="relative w-full h-4 flex items-center">
          <div className="w-full h-[1px] bg-[#E0E0E0] absolute" />

          <div
            className="h-[2px] bg-[#F1569E] absolute"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />

          <input
            type="range"
            min={MIN_LIMIT}
            max={MAX_LIMIT}
            step={100}
            value={minPrice}
            onChange={handleMinSlider}
            className="absolute w-full appearance-none bg-transparent pointer-events-none z-10
              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#F1569E] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#F1569E] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer"
          />

          <input
            type="range"
            min={MIN_LIMIT}
            max={MAX_LIMIT}
            step={100}
            value={maxPrice}
            onChange={handleMaxSlider}
            className="absolute w-full appearance-none bg-transparent pointer-events-none z-20
              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#F1569E] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#F1569E] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 w-full">
          {filteredProducts.map((item) => (
            <div key={item.id} className="bg-[#F9F9FB] flex flex-col justify-between overflow-hidden">
              <div className="w-full aspect-[4/5] overflow-hidden">
                <img
                  src={`https://api.artstudioflowers.cz/api/image/${item.image}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-2 flex flex-col items-center">
                <h3 className="text-[#F1569E] text-[16px] font-serif mb-0.5">
                  {getLocalizedName(item.name, language)}
                </h3>
                <p className="text-[#AA6181] text-[16px] font-serif mb-2">{item.price} Kč</p>
              </div>

              <button
                onClick={() => handleBuy(item)}
                className="w-full bg-[#F1569E] text-white py-2 min-h-[50px] flex items-center justify-center gap-1.5 text-[12px] font-serif hover:opacity-90 transition-opacity cursor-pointer"
              >
                <img src="/cart.png" alt="" className="w-3.5 h-3.5 object-contain brightness-0 invert" />
                {t.buy}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#AA6181] text-[13px] font-serif my-8">{t.notFound}</p>
      )}
      <hr className="border-[#AA6181] mt-5 w-full opacity-40" />
    </section>
  )
}
