import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const FAQ = () => {
  const { t } = useLanguage();

  const faqList = [
    {
      id: 1,
      question: t.faqQ1,
      answer: t.faqA1,
    },
    {
      id: 2,
      question: t.faqQ2,
      answer: t.faqA2,
    },
    {
      id: 3,
      question: t.faqQ3,
      answer: t.faqA3,
    },
    {
      id: 4,
      question: t.faqQ4,
      answer: t.faqA4,
    },
  ];
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="flex flex-col gap-2 mt-1 justify-center items-center w-full px-1">
      <p className="text-[#F1569E] text-[24px] md:text-[28px] mt-2 mb-2 text-[600] leading-none">{t.faqTitle}</p>

      <div className="flex flex-col gap-2 w-full max-w-[900px]">
        {faqList.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="w-full bg-[#F1569E] border border-[#AA6181] rounded-[2px] overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFAQ(item.id)}
                className="w-full py-2.5 md:py-3.5 px-3 md:px-5 flex justify-between items-center text-left cursor-pointer hover:bg-[#e0488f] transition-colors"
              >
                <span className="text-[12px] md:text-[14px] font-serif text-white pr-2">
                  {item.question}
                </span>
                <span className="text-white text-[16px] md:text-[18px] font-bold shrink-0">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div className="px-3 md:px-5 pb-3 pt-1 text-[11px] md:text-[13px] font-serif text-white/90 border-t border-white/20">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <hr className="border-[#AA6181] mt-5 w-full opacity-40" />
    </section>
  );
};