import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainPage } from './components/pages/MainPage'
import { CartPage } from './components/pages/CartPage'
import { CheckoutPage } from './components/pages/CheckoutPage'
import { ScrollToTop } from './components/ScrollToTop'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'

const App = () => {
  return (
    <LanguageProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-[#E5E5E5] flex justify-center">
            <main className="w-full max-w-[1200px] min-h-screen bg-white px-3 py-2 flex flex-col items-center">
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />}></Route>
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </LanguageProvider>
  )
}
export default App
