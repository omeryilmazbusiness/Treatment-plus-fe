import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseHeader, getThemeColor } from "../wise-frame";

export function Booklet24Page14SimulationIntro({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const themeColor = getThemeColor(palette, "#0b2938");

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_14.jpg"
      className="flex flex-col justify-between"
    >
      {/* 1. Eğimli Başlık Bandı (80.1mm) */}
      <WiseHeader
        eyebrow={isEn ? "SEE YOUR PLAN IN" : "TEDAVİNİZİ CANLI GÖRÜN"}
        title={isEn ? "ACTION" : "3D SİMÜLASYON"}
        themeColor={themeColor}
      />

      {/* 2. Açıklama Metni ve Turuncu Watch Now Butonu (wise_2.pdf orijinal koordinatlarında) */}
      <div className="flex-1 px-[64px] pt-[42px] select-none z-10">
        <div className="space-y-6 text-[15.5px] leading-[1.6] text-[#222222] text-justify mb-11">
          <p>
            {isEn ? (
              <>
                With our personalized 3D animations, you{" "}
                <span className="font-bold text-black">
                  get a real-time preview of your procedure, step by step.
                </span>
              </>
            ) : (
              <>
                Kişiselleştirilmiş 3D animasyonlarımız sayesinde,{" "}
                <span className="font-bold text-black">
                  tedavi sürecinizin her adımını gerçek zamanlı olarak önceden izleyebilirsiniz.
                </span>
              </>
            )}
          </p>

          <p>
            {isEn
              ? "From the initial step to the final result, our advanced technology brings your treatment plan to life, helping you understand your options and feel confident in every decision."
              : "İlk aşamadan nihai sonuca kadar ileri dijital teknolojimiz tedavi planınızı canlandırır; tüm seçeneklerinizi net biçimde anlamanızı ve her adımda güven duymanızı sağlar."}
          </p>
        </div>

        {/* wise_2.pdf Orijinal Turuncu WATCH NOW Butonu */}
        <div className="inline-flex items-center gap-5 px-8 py-4 rounded-[18px] bg-gradient-to-b from-[#FFA33B] to-[#F47B00] text-white font-bold text-[21px] shadow-md">
          <svg className="size-8 fill-white shrink-0" viewBox="0 0 24 24">
            <polygon points="5 3 20 12 5 21 5 3" />
          </svg>
          <span className="tracking-wide uppercase">
            {isEn ? "WATCH NOW" : "ŞİMDİ İZLE"}
          </span>
        </div>
      </div>

      {/* Alt 3D Film Şeridi (temizlenmiş page_14.jpg üzerinde y: 835..1132 aralığında yer alır) */}
      <div className="h-[78mm] shrink-0" />
    </WisePageWrapper>
  );
}
