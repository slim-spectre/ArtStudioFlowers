import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocalizedName } from '../utils/localise';
import { useLanguage } from '../context/LanguageContext';



export const Hero = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    fetch('https://api.artstudioflowers.cz/api/banners')
      .then((res) => res.json())
      .then((data) => setBanners(data))
      .catch((err) => console.error('Помилка завантаження банерів:', err));
  }, []);

  if (banners.length === 0) return <div>Завантаження...</div>;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const currentSlide = banners[currentIndex];

  return (
    <section className="relative w-full mt-4">
      <div className="relative flex w-full h-[220px] md:h-[320px] rounded-sm">
        <button
          onClick={handlePrev}
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-[#F1569E] rounded-[10px] flex justify-center items-center z-20 hover:opacity-90 shadow-sm"
        >
          <img src="/arrowLeft.png" alt="" className="w-3 h-3 md:w-4 md:h-4 object-contain" />
        </button>

        <div className="w-1/2 bg-[#F2C2D8] h-full flex flex-col justify-between p-3 pl-5 md:p-8 md:pl-12 z-10">
          <div className="flex flex-col justify-center items-start gap-1 mt-1 md:mt-4">
            <p className="text-[#AA6181] text-[20px] md:text-[32px] font-bold leading-tight mb-1">
              {getLocalizedName(currentSlide.title, language)}
            </p>
            <p className="text-[#AA6181] min-w-[150px] max-w-[400px] text-[10px] md:text-[14px] font-normal leading-tight">
              {t.heroSub}
            </p>
            <button
              onClick={() => navigate('/', { state: { scrollTo: 'catalog' } })}
              className="text-white font-semibold mt-10 md:mt-6 bg-[#F1569E] rounded-[2px] py-1.5 md:py-2.5 px-6 md:px-8 text-[11px] md:text-[13px] w-fit hover:opacity-90 transition-opacity"
            >
              {t.heroBtn}
            </button>
          </div>
        </div>

        <div className="w-1/2 h-full">
          <img src={`https://api.artstudioflowers.cz/api/image/${currentSlide.image}`} alt="" className="w-full h-full object-cover" />
        </div>

        <button
          onClick={handleNext}
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-[#F1569E] rounded-[10px] flex justify-center items-center z-20 hover:opacity-90 shadow-sm"
        >
          <img src="/arrowRight.png" alt="" className="w-3 h-3 md:w-4 md:h-4 object-contain" />
        </button>
      </div>
    </section>
  );
};