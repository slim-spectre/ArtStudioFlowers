import { useLanguage } from "../context/LanguageContext"

export const Features = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="flex flex-col justify-center items-center mt-3 gap-1 w-full">
      <p className="text-[#AA6181] text-[24px] md:text-[28px] text-[600] leading-none">{t.whyTitle}</p>
      <img src="/Logo.png" className="w-[35px] h-[35px]" alt="" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        <div className="bg-[#AA6181] flex flex-col gap-1 h-[160px] md:h-[180px] pt-4 pl-4 pb-5 pr-8 rounded-[2px]">
          <p className="text-white font-bold text-[13px] md:text-[14px] text-[700]">{t.whyHeartTitle}</p>
          <p className="text-white text-[11px] md:text-[12px] text-[400]">
            {t.whyHeartDesc}
          </p>
        </div>
        <div className="bg-[#AA6181] flex flex-col gap-1 h-[160px] md:h-[180px] pt-4 pl-4 pb-5 pr-8 rounded-[2px]">
          <p className="text-white font-bold text-[13px] md:text-[14px] text-[700]">{t.whyFreshTitle}</p>
          <p className="text-white text-[11px] md:text-[12px] text-[400]">
            {t.whyFreshDesc}
          </p>
        </div>
        <div className="bg-[#AA6181] flex flex-col gap-1 h-[160px] md:h-[180px] pt-4 pl-4 pb-5 pr-8 rounded-[2px]">
          <p className="text-white font-bold text-[13px] md:text-[14px] text-[700]">{t.whyVarietyTitle}</p>
          <p className="text-white text-[11px] md:text-[12px] text-[400]">
            {t.whyVarietyDesc}
          </p>
        </div>
        <div className="bg-[#AA6181] flex flex-col gap-1 h-[160px] md:h-[180px] pt-4 pl-4 pb-5 pr-8 rounded-[2px]">
          <p className="text-white font-bold text-[13px] md:text-[14px] text-[700]">{t.whyEmotionsTitle}</p>
          <p className="text-white text-[11px] md:text-[12px] text-[400]">
            {t.whyEmotionsDesc}
          </p>
        </div>
      </div>
      <hr className="border-[#AA6181] mt-5 w-full opacity-40" />
    </section>
  )
}