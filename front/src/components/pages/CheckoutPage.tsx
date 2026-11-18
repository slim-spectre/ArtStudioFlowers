import { useState } from 'react'
import { Header } from '../Header'
import { Footer } from '../Footer'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useLanguage } from '../../context/LanguageContext'

const countries = [
  { code: '+420', flag: '🇨🇿', name: 'Чехія' },
  { code: '+380', flag: '🇺🇦', name: 'Україна' },
  { code: '+421', flag: '🇸🇰', name: 'Словаччина' },
  { code: '+48', flag: '🇵🇱', name: 'Польща' },
  { code: '+49', flag: '🇩🇪', name: 'Німеччина' },
]

const STUDIO_COORDS = { lat: 50.0886, lon: 14.4481 }

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const getDeliveryPrice = (km: number) => {
  if (km <= 2) return 100
  if (km <= 6) return 200
  if (km <= 9) return 300
  if (km <= 16) return 400
  return 500
}

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cartItems, totalPrice, totalItems } = useCart()
  const { t, language } = useLanguage()

  const queryParams = new URLSearchParams(window.location.search)
  const isStripeSuccess = queryParams.get('success') === 'true'
  const urlInvoiceNumber = queryParams.get('invoice')

  // Стейт для показу фірмової плашки при будь-якому способі оплати
  const [completedInvoice, setCompletedInvoice] = useState<string | null>(
    isStripeSuccess ? urlInvoiceNumber || 'PAID' : null
  )

  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [street, setStreet] = useState('')
  const [house, setHouse] = useState('')
  const [entrance, setEntrance] = useState('')

  const [deliveryDate, setDeliveryDate] = useState('2026-11-01')
  const [deliveryTime, setDeliveryTime] = useState('20:00 - 23:00')

  const [recipientType, setRecipientType] = useState<'self' | 'gift'>('self')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'cash'>('cash')

  const [hasComment, setHasComment] = useState(false)
  const [comment, setComment] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const extraTexts: Record<
    string,
    {
      emailPlaceholder: string
      successTitle: string
      successDescCard: string
      successDescOther: string
      invoiceSent: string
      invoiceLabel: string
      homeBtn: string
    }
  > = {
    cz: {
      emailPlaceholder: 'Váš e-mail (pro zaslání faktury) *',
      successTitle: 'Děkujeme za objednávku! 🌸',
      successDescCard: 'Vaše platba přes Stripe proběhla úspěšně. Již připravujeme vaši kytici!',
      successDescOther: 'Vaše objednávka byla úspěšně přijata. Již připravujeme vaši kytici!',
      invoiceSent: 'Elektronická faktura a potvrzení byly odeslány na váš e-mail.',
      invoiceLabel: 'Číslo faktury:',
      homeBtn: 'Na hlavní stránku',
    },
    ua: {
      emailPlaceholder: 'Ваш E-mail (для відправки фактури) *',
      successTitle: 'Дякуємо за замовлення! 🌸',
      successDescCard: 'Ваш платіж успішно пройдено через Stripe. Ми вже готуємо ваш букет!',
      successDescOther: 'Ваше замовлення успішно прийнято. Ми вже готуємо ваш букет!',
      invoiceSent: 'Електронну фактуру та підтвердження надіслано на вашу пошту.',
      invoiceLabel: 'Номер фактури:',
      homeBtn: 'На головну',
    },
    en: {
      emailPlaceholder: 'Your E-mail (for invoice delivery) *',
      successTitle: 'Thank you for your order! 🌸',
      successDescCard: 'Your Stripe payment was successful. We are already preparing your bouquet!',
      successDescOther: 'Your order has been received. We are already preparing your bouquet!',
      invoiceSent: 'An electronic invoice and receipt have been sent to your email.',
      invoiceLabel: 'Invoice number:',
      homeBtn: 'Back to Home',
    },
    ru: {
      emailPlaceholder: 'Ваш E-mail (для отправки фактуры) *',
      successTitle: 'Спасибо за заказ! 🌸',
      successDescCard: 'Ваш платеж успешно проведен через Stripe. Мы уже готовим ваш букет!',
      successDescOther: 'Ваш заказ успешно принят. Мы уже готовим ваш букет!',
      invoiceSent: 'Электронная фактура и чек отправлены на вашу почту.',
      invoiceLabel: 'Номер фактуры:',
      homeBtn: 'На главную',
    },
  }

  const currentTexts = extraTexts[language] || extraTexts.cz

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      alert(`${t.emptyCart}`)
      return
    }

    setIsSubmitting(true)

    let deliveryCost = 0
    let distanceKm = 0

    if (deliveryType === 'delivery') {
      const fullAddress = `Prague, ${street} ${house}`
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`,
        )
        const data = await response.json()

        if (data && data.length > 0) {
          const clientLat = parseFloat(data[0].lat)
          const clientLon = parseFloat(data[0].lon)

          const km = calculateDistance(STUDIO_COORDS.lat, STUDIO_COORDS.lon, clientLat, clientLon)
          distanceKm = Math.round(km * 10) / 10
          deliveryCost = getDeliveryPrice(distanceKm)
        } else {
          alert('Не вдалося знайти таку адресу в Празі. Перевірте правильність вводу.')
        }
      } catch (error) {
        console.error('Помилка геокодування', error)
      }
    }

    const finalTotalPrice = totalPrice + deliveryCost

    const orderData = {
      name,
      email,
      phoneNumber: `${selectedCountry.code} ${phoneNumber}`,
      deliveryType,
      address: deliveryType === 'delivery' ? { street, house, entrance, distanceKm } : `${t.pickup}`,
      deliveryDate,
      deliveryTime,
      recipientType,
      paymentMethod,
      comment: hasComment ? comment : '',
      cartItems,
      deliveryCost,
      totalPrice: finalTotalPrice,
      totalItems,
    }

    try {
      const response = await fetch('https://api.artstudioflowers.cz/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (response.ok) {
        if (paymentMethod === 'card' && data.url) {
          window.location.href = data.url
        } else {
          // Відкриваємо ту саму гарну плашку для готівки або крипти
          setCompletedInvoice(data.invoiceNumber || 'OK')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else {
        alert(`${t.submitFault}`)
      }
    } catch (error) {
      alert('Server error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Єдина гарна плашка після оформлення замовлення (для будь-якого способу оплати)
  if (completedInvoice) {
    return (
      <section className="w-full flex flex-col items-center">
        <Header />
        <main className="w-full my-12 px-4 max-w-[600px] text-center">
          <div className="w-full p-8 border border-[#F1569E] rounded-[2px] bg-[#FFF0F5] flex flex-col gap-3">
            <h2 className="text-[#F1569E] font-serif text-[24px] uppercase font-bold">{currentTexts.successTitle}</h2>
            <p className="text-[#AA6181] text-[14px] font-serif">
              {isStripeSuccess ? currentTexts.successDescCard : currentTexts.successDescOther}
            </p>

            {completedInvoice !== 'PAID' && completedInvoice !== 'OK' && (
              <div className="my-2 py-2 px-4 bg-white border border-[#F1569E]/40 rounded-[2px] inline-block mx-auto">
                <span className="text-[12px] font-serif text-[#AA6181] block">{currentTexts.invoiceLabel}</span>
                <strong className="text-[16px] font-mono text-[#F1569E] tracking-wider">{completedInvoice}</strong>
              </div>
            )}

            <p className="text-[#AA6181] text-[12px] font-serif opacity-90">{currentTexts.invoiceSent}</p>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-4 bg-[#F1569E] text-white py-3 px-8 mx-auto font-serif text-[12px] uppercase rounded-[2px] cursor-pointer hover:opacity-90 transition-opacity"
            >
              {currentTexts.homeBtn}
            </button>
          </div>
        </main>
        <Footer />
      </section>
    )
  }

  return (
    <section className="w-full flex flex-col items-center">
      <Header />

      <main className="w-full my-4 px-1 text-[#AA6181]">
        <p className="text-[11px] font-serif text-[#F1569E] mb-2">{t.breadcrumbCheckout}</p>
        <h1 className="text-[#F1569E] text-[20px] md:text-[28px] font-serif uppercase tracking-wider text-center mb-6 font-semibold">
          {t.checkoutTitle}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-6 md:gap-10 w-full max-w-[1000px] mx-auto items-start"
        >
          <div className="w-full md:w-2/3 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-[#F1569E] text-white font-bold text-[14px] flex items-center justify-center">
                  <img src="/one.png" className="w-1 h-2" alt="" />
                </span>
                <h2 className="text-[#F1569E] text-[18px] font-serif uppercase">{t.step1}</h2>
              </div>

              <div className="flex items-center border border-[#AA6181] rounded-[2px] px-3 py-2 bg-white">
                <div className="relative flex items-center shrink-0 border-r border-[#AA6181]/30 pr-2 mr-2 cursor-pointer">
                  <span className="text-[14px] mr-1">{selectedCountry.flag}</span>
                  <span className="text-[10px] text-[#AA6181] mr-1">▼</span>

                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const country = countries.find((c) => c.code === e.target.value)
                      if (country) setSelectedCountry(country)
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>

                  <span className="text-[12px] font-sans text-[#AA6181] font-medium">{selectedCountry.code}</span>
                </div>

                <input
                  type="tel"
                  required
                  placeholder="659 540 30 393"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full text-[13px] font-sans tracking-wide text-[#AA6181] bg-transparent focus:outline-none placeholder-[#AA6181]/40"
                />
              </div>

              <div className="border border-[#AA6181] rounded-[2px] px-3 py-2 bg-white">
                <input
                  type="text"
                  required
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-[13px] font-serif text-[#AA6181] bg-transparent focus:outline-none placeholder-[#AA6181]/50"
                />
              </div>

              <div className="border border-[#AA6181] rounded-[2px] px-3 py-2 bg-white">
                <input
                  type="email"
                  required
                  placeholder={currentTexts.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-[13px] font-serif text-[#AA6181] bg-transparent focus:outline-none placeholder-[#AA6181]/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-[#F1569E] text-white font-bold text-[14px] flex items-center justify-center">
                  <img src="/two.png" className="w-2 h-2" alt="" />
                </span>
                <h2 className="text-[#F1569E] text-[18px] font-serif uppercase">{t.step2}</h2>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`w-full py-1.5 text-[13px] font-serif font-medium rounded-[2px] transition-colors cursor-pointer ${
                    deliveryType === 'pickup' ? 'bg-[#F1569E] text-white' : 'bg-[#D6A5BB] text-white hover:opacity-90'
                  }`}
                >
                  {t.pickup}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`w-full py-1.5 text-[13px] font-serif font-medium rounded-[2px] transition-colors cursor-pointer ${
                    deliveryType === 'delivery' ? 'bg-[#F1569E] text-white' : 'bg-[#D6A5BB] text-white hover:opacity-90'
                  }`}
                >
                  {t.deliveryPrague}
                </button>
              </div>

              {deliveryType === 'delivery' && (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder={t.street}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="border border-[#F1569E] rounded-[2px] p-2 text-[12px] font-serif text-[#AA6181] focus:outline-none placeholder-[#AA6181]/60"
                  />
                  <input
                    type="text"
                    required
                    placeholder={t.house}
                    value={house}
                    onChange={(e) => setHouse(e.target.value)}
                    className="border border-[#F1569E] rounded-[2px] p-2 text-[12px] font-serif text-[#AA6181] focus:outline-none placeholder-[#AA6181]/60"
                  />
                  <input
                    type="text"
                    placeholder={t.entrance}
                    value={entrance}
                    onChange={(e) => setEntrance(e.target.value)}
                    className="border border-[#F1569E] rounded-[2px] p-2 text-[12px] font-serif text-[#AA6181] focus:outline-none placeholder-[#AA6181]/60"
                  />
                </div>
              )}

              <div className="flex items-end justify-between gap-2 w-full">
                <div className="w-[55%] flex flex-col">
                  <span className="text-[10px] font-sans text-[#AA6181] opacity-0 select-none leading-none mb-1">
                    .
                  </span>
                  <div className="relative border border-[#F1569E] rounded-[2px] bg-white h-[60px] px-2.5 flex items-center justify-between overflow-hidden">
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full text-[12px] font-sans text-[#AA6181] bg-transparent focus:outline-none cursor-pointer z-10"
                    />
                  </div>
                </div>

                <div className="w-[43%] flex flex-col">
                  <label className="text-[10px] font-sans text-[#AA6181] leading-none mb-1">
                    {t.deliveryTimeLabel}
                  </label>
                  <div className="relative border border-[#F1569E] rounded-[2px] mb-3 bg-white h-[36px] px-2 flex items-center">
                    <select
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full text-[11px] font-sans text-[#AA6181] bg-transparent focus:outline-none appearance-none cursor-pointer pr-4"
                    >
                      <option value="10:30 - 13:00">10:30 - 13:00</option>
                      <option value="13:00 - 16:00">13:00 - 16:00</option>
                      <option value="16:00 - 19:00">16:00 - 19:00</option>
                      <option value="20:00 - 23:00">20:00 - 23:00</option>
                    </select>
                    <span className="absolute right-2 text-[8px] text-[#F1569E] pointer-events-none">▼</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setRecipientType('self')}
                  className={`w-full py-1.5 text-[13px] font-serif font-medium rounded-[2px] transition-colors cursor-pointer ${
                    recipientType === 'self' ? 'bg-[#F1569E] text-white' : 'bg-[#D6A5BB] text-white hover:opacity-90'
                  }`}
                >
                  {t.recipientSelf}
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('gift')}
                  className={`w-full py-1.5 text-[13px] font-serif font-medium rounded-[2px] transition-colors cursor-pointer ${
                    recipientType === 'gift' ? 'bg-[#F1569E] text-white' : 'bg-[#D6A5BB] text-white hover:opacity-90'
                  }`}
                >
                  {t.recipientGift}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-[#F1569E] text-white font-bold text-[14px] flex items-center justify-center">
                  <img src="/three.png" className="w-2 h-2" alt="" />
                </span>
                <h2 className="text-[#F1569E] text-[18px] font-serif uppercase">{t.step3}</h2>
              </div>
              <div className="flex flex-col gap-2.5 font-serif text-[13px]">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="hidden"
                  />
                  <span
                    className={`w-3.5 h-3.5 rounded-full border border-[#F1569E] flex items-center justify-center shrink-0 ${
                      paymentMethod === 'card' ? 'bg-[#F1569E]' : 'bg-white'
                    }`}
                  />
                  <span className="text-[#AA6181]">{t.payCard}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'crypto'}
                    onChange={() => setPaymentMethod('crypto')}
                    className="hidden"
                  />
                  <span
                    className={`w-3.5 h-3.5 rounded-full border border-[#F1569E] flex items-center justify-center shrink-0 ${
                      paymentMethod === 'crypto' ? 'bg-[#F1569E]' : 'bg-white'
                    }`}
                  />
                  <span className="text-[#AA6181]">{t.payCrypto}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="hidden"
                  />
                  <span
                    className={`w-3.5 h-3.5 rounded-full border border-[#F1569E] flex items-center justify-center shrink-0 ${
                      paymentMethod === 'cash' ? 'bg-[#F1569E]' : 'bg-white'
                    }`}
                  />
                  <span className="text-[#AA6181]">{t.payCash}</span>
                </label>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <label className="flex items-center gap-2.5 cursor-pointer font-serif text-[12px] text-[#AA6181]">
                  <input
                    type="checkbox"
                    checked={hasComment}
                    onChange={(e) => setHasComment(e.target.checked)}
                    className="hidden"
                  />
                  <span
                    className={`w-4 h-4 border border-[#F1569E] rounded-[2px] flex items-center justify-center text-white text-[10px] ${
                      hasComment ? 'bg-[#F1569E]' : 'bg-white'
                    }`}
                  >
                    {hasComment && '✓'}
                  </span>
                  {t.orderComment}
                </label>

                {hasComment && (
                  <textarea
                    rows={3}
                    placeholder={t.commentPlaceholder}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="border border-[#F1569E] rounded-[2px] p-2 text-[12px] font-serif text-[#AA6181] focus:outline-none placeholder-[#AA6181]/50 resize-none"
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F1569E] text-white py-3 font-serif text-[13px] uppercase rounded-[2px] tracking-wider hover:opacity-90 transition-opacity mt-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : t.submitOrder}
            </button>
          </div>
        </form>
        <hr className="border-[#AA6181] mt-5 w-full opacity-40" />
      </main>

      <Footer />
    </section>
  )
}