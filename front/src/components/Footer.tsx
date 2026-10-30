import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {t} = useLanguage()
  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: 'top' } });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="contacts" className="w-full my-8 px-1 text-[#AA6181]">
      <div className="flex justify-between items-start gap-2 mb-6">
        <div className="w-[38%] flex flex-col gap-2 font-serif shrink-0">
          <h2 className="text-[#F1569E] text-[24px] leading-none mb-1">{t.contacts}</h2>
          <div className="flex flex-col gap-6 text-[11px] leading-tight">
            <a href="tel:+420608248753" className="hover:underline">
              +420608248753
            </a>
            <a href="mailto:info@gmail.com" className="hover:underline break-all">
              art.studio.prague@seznam.cz
            </a>
            <p className="mt-1 leading-snug">Husitská 404/43, Praha 3</p>
          </div>
        </div>

        <div className="w-[60%] h-[135px] rounded-[14px] overflow-hidden border border-black/5 shadow-sm shrink-0">
          <iframe
            title="Google Map"
            src="https://maps.google.com/maps?q=Husitsk%C3%A1%20404%2F43%2C%20Praha%203&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      <div className="flex justify-between items-end gap-2 pt-3 border-t border-[#AA6181]/20">
        <div className="w-[45%] font-serif text-[11px] leading-tight">
          <p>Copyright © 2026 |</p>
          <p>Доставка квітів |</p>
          <p>Art Studio</p>
        </div>

        <div className="w-[55%] flex items-center justify-end gap-1.5">
          <a
            href="https://www.instagram.com/art.studio.flowers?stkn=MXBxOHc0eTdoY3k5dQ%3D%3D&utm_source=qr"
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 bg-[#F1569E] rounded-[10px] flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <img src="/instaLogo.png" alt="Instagram" className="w-4 h-4 object-contain brightness-0 invert" />
          </a>

          <a
            href="https://www.google.com/maps?q=Art+Studio+Flowers,+Husitsk%C3%A1+404/43,+130+00+Praha+3-%C5%BDi%C5%BEkov&ftid=0x470b95ef3a3e6265:0xf0656e95ac7e8e42&entry=gps&lucs=,94224825,94227247,94227248,94231188,47071704,47069508,94218641,94203019,47084304,94208458,94208447&g_ep=CAISEjI1LjE2LjEuNzQ3NTI2NjMwMBgAIIgnKmMsOTQyMjQ4MjUsOTQyMjcyNDcsOTQyMjcyNDgsOTQyMzExODgsNDcwNzE3MDQsNDcwNjk1ODgsOTQyMTg2NDEsOTQyMDMwMTksNDcwODQzMDQsOTQyMDg0NDgsOTQyMDg0NDdCAkNa&skid=77c8cbbb-17c5-49b5-984a-d521dc819596&g_st=com.google.maps.preview.copy"
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 bg-[#F1569E] rounded-[10px] flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <img src="/mapsLogo.png" alt="Location" className="w-4 h-4 object-contain brightness-0 invert" />
          </a>

          <img src="/Logo.png" onClick={handleLogoClick} alt="Art Studio" className="w-[42px] h-[42px] cursor-pointer object-contain ml-0.5" />
        </div>
      </div>
    </footer>
  )
}
