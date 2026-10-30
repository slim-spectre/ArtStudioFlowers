import { useRef, useState, useEffect} from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedName } from "../utils/localise"



export const PopularAddonsSection = ({ handleAddAddon }: { handleAddAddon: (item: any) => void }) => {
  const {t , language} = useLanguage();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [addons, setAddons] = useState<any[]>([]);
  

  useEffect(() => {
    fetch('https://api.artstudioflowers.cz/api/addons')
      .then((res) => res.json())
      .then((data) => setAddons(data));
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -120 : 120;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[#F1569E] text-[23px] font-bold uppercase tracking-wide">
          {t.popularAddons}
        </h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="w-6 h-6 bg-[#F1569E] text-white rounded-[2px] flex items-center justify-center text-[10px] hover:opacity-90 transition-opacity"
          >
            ←
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-6 h-6 bg-[#F1569E] text-white rounded-[2px] flex items-center justify-center text-[10px] hover:opacity-90 transition-opacity"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex gap-2.5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {addons.map((addon) => (
          <div
            key={addon.id}
            className="flex-none w-[112px] border border-[#F1569E] rounded-[2px] bg-white flex flex-col justify-between overflow-hidden"
          >
            <div className="w-full aspect-square bg-gradient-to-b from-white to-[#F2C2D8]/40 border-b border-[#F1569E] flex items-center justify-center">
              <img
                src={`https://api.artstudioflowers.cz/api/image/${addon.image}`}
                alt={getLocalizedName(addon.name, language)}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-2 flex flex-col justify-between h-[60px] font-serif">
              <p className="text-[11px] font-semibold text-[#AA6181] leading-tight">
                {getLocalizedName(addon.name, language)}
              </p>

              <div className="flex items-end justify-between mt-auto">
                <span className="text-[11px] text-[#AA6181]">
                  {addon.price} Kč
                </span>
                <button
                  onClick={() => handleAddAddon(addon)}
                  className="w-5 h-5 bg-[#F1569E] text-white rounded-full flex items-center justify-center text-[14px] leading-none hover:opacity-90 transition-opacity"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};