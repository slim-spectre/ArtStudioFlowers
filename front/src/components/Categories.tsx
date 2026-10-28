import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext"
import type { CategoriesProps } from "../interfaces/CategoriesProps"
import { getLocalizedName } from "../utils/localise";


export const Categories = ({ onSelectCategory }: CategoriesProps) => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<{id : number, name : string , image : string}[]>([]);

  useEffect( () => {
    fetch('https://great-worms-end.loca.lt/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Помилка завантаження категорий:', err));
  },[]);

  return (
    <section id="categories" className="flex mt-4 flex-col gap-1 items-center justify-center w-full">
      <div className="flex flex-col gap-1 items-center justify-center text-center">
        <div className="flex flex-col items-center">
          <p className="text-[#AA6181] text-[24px] md:text-[28px] text-[600] leading-none">{t.deliveryBannerTitle1}</p>
          <p className="text-[#AA6181] text-[24px] md:text-[28px] text-[600] leading-none">{t.deliveryBannerTitle2}</p>
        </div>
        <p className="text-[#AA6181] text-[13px] md:text-[15px] text-[400]">{t.deliveryBannerText}</p>
        <div>
          <p className="text-[#AA6181] text-[13px] md:text-[15px] text-[400]">{t.deliveryTier1} {t.deliveryTier2}</p>
          <p className="text-[#AA6181] text-[13px] md:text-[15px] text-[400]">{t.deliveryTier3} {t.deliveryTier4}</p>
        </div>
        <p className="text-[#AA6181] text-[13px] md:text-[15px] text-[400]">{t.deliverySchedule}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4 w-full mt-2">
        {categories.map((cat) => (
          
          <div
            key={cat.id}
            onClick={() => onSelectCategory(getLocalizedName(cat.name, language))}
            className="relative w-full aspect-square overflow-hidden group cursor-pointer rounded-[2px]"
          >
            <img
              src={`https://great-worms-end.loca.lt/api/image/${cat.image}`}
              alt={getLocalizedName(cat.name, language)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/40 py-2 flex items-center justify-center">
              <span className="text-white text-[13px] md:text-[15px] uppercase">{getLocalizedName(cat.name, language)}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[#672946] text-[13px] md:text-[14px] text-[400] mt-1">{t.prepayNotice}</p>
      <hr className="border-[#AA6181] mt-2 w-full opacity-40" />
    </section>
  )
}