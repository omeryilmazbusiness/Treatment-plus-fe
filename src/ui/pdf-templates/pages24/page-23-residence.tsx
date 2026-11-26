import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseTopWedge, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page23Residence({
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
      bgImage="/pdf-assets/wise/page_23.jpg"
      className="flex flex-col justify-between"
    >
      {/* Tek Sayfa Üst Diyagonal Takoz */}
      <WiseTopWedge themeColor={themeColor} />

      {/* Gold Residence Crest Boşluğu (temizlenmiş page_23.jpg üzerinde y: 220..440 aralığında yer alır) */}
      <div className="h-[74mm] shrink-0" />

      {/* Açıklama Metinleri (wise_2.pdf orijinal koordinatlarında) */}
      <div className="flex-1 px-[86px] pt-2 pb-16 select-none z-10 space-y-5 text-[15px] leading-[1.58] text-[#222222] text-justify">
        {data.hotelDetails?.text ? (
          <p className="whitespace-pre-line">{data.hotelDetails.text}</p>
        ) : (
          <>
            <p>
              {isEn ? (
                <>
                  {"Your journey to a brighter smile should be as effortless as your stay. That's why we've partnered with a hotel that blends "}
                  <span className="font-bold text-black">
                    comfort, convenience, and elegance,
                  </span>{" "}
                  ensuring your dental trip feels like a well-earned retreat.
                </>
              ) : (
                <>
                  Yeni gülüşünüze giden yolculuğunuz konaklamanız kadar zahmetsiz olmalıdır. Bu nedenle{" "}
                  <span className="font-bold text-black">
                    konfor, kolaylık ve zarafeti bir araya getiren
                  </span>{" "}
                  seçkin otelimizle iş birliği yaparak tedavi seyahatinizi dinlendirici bir tatil deneyimine dönüştürüyoruz.
                </>
              )}
            </p>

            <p>
              {isEn ? (
                <>
                  Located{" "}
                  <span className="font-bold text-black">
                    just moments from our clinic,
                  </span>{" "}
                  this hotel offers the perfect balance of relaxation and accessibility, allowing you to focus on your treatment while enjoying the finest hospitality.
                </>
              ) : (
                <>
                  <span className="font-bold text-black">
                    Kliniğimize yalnızca birkaç dakika mesafede
                  </span>{" "}
                  yer alan otelimiz, dinlenme ve ulaşım kolaylığını mükemmel biçimde dengeler; en üst düzey misafirperverliğin keyfini çıkarırken tedavinize odaklanmanızı sağlar.
                </>
              )}
            </p>

            <p>
              {isEn ? (
                <>
                  From luxurious rooms to personalized services, every detail is designed to{" "}
                  <span className="font-bold text-black">
                    make your recovery smooth and your stay unforgettable.
                  </span>
                </>
              ) : (
                <>
                  Lüks odalardan kişiselleştirilmiş hizmetlere kadar her detay,{" "}
                  <span className="font-bold text-black">
                    iyileşme sürecinizi pürüzsüz ve konaklamanızı unutulmaz kılmak
                  </span>{" "}
                  için tasarlanmıştır.
                </>
              )}
            </p>
          </>
        )}
      </div>

      {/* Tek Sayfa Alt Diyagonal Logo Bandı */}
      <WiseFooter
        clinicName={data.clinicName || "Wise Dental"}
        slogan={data.slogan || data.clinicSlogan || "Every Smile Matters!!"}
        logoUrl={data.logoUrl}
        themeColor={themeColor}
        variant="odd"
      />
    </WisePageWrapper>
  );
}
