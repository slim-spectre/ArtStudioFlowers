import { useState } from 'react'
import { Header } from '../Header'
import { PopularAddonsSection } from '../PopularAddonsSection'
import { Footer } from '../Footer'
import { useCart } from '../../context/CartContext'
import type { Addon } from '../../interfaces/Addon'
import { useNavigate } from 'react-router-dom'
import { getLocalizedName } from '../../utils/localise'
import { useLanguage } from '../../context/LanguageContext'

export const CartPage = () => {
  const { t , language} = useLanguage()
  const navigate = useNavigate()
  const { cartItems, addToCart, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart()

  const handleAddAddon = (addon: Addon) => {
    addToCart({
      id: `addon_${addon.id}` as any,
      name: addon.name,
      price: addon.price,
      image: addon.image,
    })
  }

  return (
    <section className="w-full flex flex-col items-center">
      <Header />

      <main className="w-full mt-4 px-1 text-[#AA6181]">
        <p className="text-[11px] font-serif text-[#F1569E] mb-2">{t.breadcrumbCart}</p>

        <h1 className="text-[#F1569E] text-[26px] md:text-[32px] font-serif uppercase tracking-widest text-center mb-5">
          {t.cartTitle}
        </h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col gap-3 mb-6 max-w-[900px] mx-auto">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center overflow-hidden h-[85px] justify-between border border-[#F2C2D8] rounded-[2px] bg-white shadow-sm"
              >
                <div className="w-[85px] h-full shrink-0">
                  <img
                    src={`https://lovely-otters-invent.loca.lt/api/image/${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between h-[75px] py-0.5 px-2 flex-grow">
                  <div>
                    <p className="text-[#F1569E] text-[13px] md:text-[15px] font-serif leading-tight">{getLocalizedName(item.name, language)}</p>
                    <p className="text-[11px] md:text-[13px] font-serif text-[#AA6181]">{item.price} Kč</p>
                  </div>

                  <div className="flex items-center border border-[#F1569E] rounded-[2px] w-fit">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-2 text-[#F1569E] text-[14px] font-bold hover:bg-[#F2C2D8]/30 cursor-pointer"
                    >
                      −
                    </button>
                    <span className="px-2 text-[14px] font-serif text-[#F1569E] border-[#F1569E]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-2 text-[#F1569E] text-[14px] font-bold hover:bg-[#F2C2D8]/30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pr-2 md:pr-4">
                  <p className="text-[11px] md:text-[13px] font-serif text-[#AA6181] whitespace-nowrap">
                    {t.total}: <span className="font-semibold">{item.price * item.quantity} Kč</span>
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 hover:opacity-75 transition-opacity cursor-pointer"
                  >
                    <img src="/bucket.png" alt="Delete" className="w-4 h-4 object-contain" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center font-serif text-[13px] md:text-[15px] my-10 text-[#AA6181]">{t.emptyCart}</p>
        )}

        <div className="bg-[#F9F9FB] p-3 md:p-5 rounded-[2px] mb-4 text-left font-serif max-w-[900px] mx-auto">
          <p className="text-[#AA6181] text-[12px] mb-0.5">{t.subtotal}</p>
          <p className="text-[#F1569E] text-[16px] font-semibold mb-1">{t.total}</p>
          <p className="text-[9px] md:text-[11px] text-[#AA6181] leading-tight mb-2">{t.deliveryNotice}</p>
          <p className="text-[12px] md:text-[14px] text-[#AA6181]">
            {t.itemsCount} : {totalItems} &nbsp;&nbsp; {t.totalSum} : {totalPrice} Kč
          </p>
        </div>

        <div className="flex flex-col gap-2 mb-8 max-w-[900px] mx-auto">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-[#F1569E] text-white py-2.5 text-[12px] md:text-[14px] tracking-wider rounded-[2px] hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t.checkoutBtn}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full border border-[#F1569E] text-[#F1569E] py-2 text-[12px] md:text-[14px] rounded-[2px] hover:bg-[#F1569E]/5 transition-colors cursor-pointer"
          >
            {t.continueShopping}
          </button>
        </div>
        <hr className="border-[#AA6181] my-2 w-full opacity-40" />
        <PopularAddonsSection handleAddAddon={handleAddAddon} />
      </main>
      <hr className="border-[#AA6181] my-2 w-full opacity-40" />
      <Footer />
    </section>
  )
}
