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
  const isAr = data.locale === "ar";
  const isRu = data.locale === "ru";
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
              {isAr ? (
                <>
                  يجب أن تكون رحلتكم نحو ابتسامة أكثر إشراقاً مريحة مثل إقامتكم تماماً. لذلك تعاقدنا مع فندق يجمع بين{" "}
                  <span className="font-bold text-black">
                    الراحة والسهولة والأناقة،
                  </span>{" "}
                  لضمان أن تكون رحلتكم العلاجية بمثابة إجازة مريحة وممتعة.
                </>
              ) : isRu ? (
                <>
                  Ваш путь к сияющей улыбке должен быть таким же комфортным, как и ваше проживание. Именно поэтому мы сотрудничаем с отелем, сочетающим{" "}
                  <span className="font-bold text-black">
                    комфорт, удобство и элегантность,
                  </span>{" "}
                  превращая вашу поездку на лечение в приятный отдых.
                </>
              ) : isEn ? (
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
              {isAr ? (
                <>
                  يقع الفندق{" "}
                  <span className="font-bold text-black">
                    على بعد دقائق قليلة فقط من عيادتنا،
                  </span>{" "}
                  ويوفر توازناً مثالياً بين الاسترخاء وسهولة الوصول، مما يتيح لكم التركيز على علاجكم والاستمتاع بأرقى مستويات الضيافة.
                </>
              ) : isRu ? (
                <>
                  Расположенный{" "}
                  <span className="font-bold text-black">
                    всего в нескольких минутах от нашей клиники,
                  </span>{" "}
                  отель обеспечивает идеальный баланс отдыха и доступности, позволяя вам сосредоточиться на лечении.
                </>
              ) : isEn ? (
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
              {isAr ? (
                <>
                  من الغرف الفاخرة إلى خدمات النقل الخاصة VIP، تم تصميم كل تفصيل{" "}
                  <span className="font-bold text-black">
                    لجعل فترة تعافيكم سلسة وإقامتكم لا تُنسى.
                  </span>
                </>
              ) : isRu ? (
                <>
                  От роскошных номеров до индивидуального VIP-трансфера — каждая деталь продумана так, чтобы{" "}
                  <span className="font-bold text-black">
                    сделать ваше восстановление легким, а пребывание — незабываемым.
                  </span>
                </>
              ) : isEn ? (
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
