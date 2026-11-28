import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseTopWedge, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page19LabStats({
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

  const stat1 = data.labStats?.[0] || {
    value: "15",
    label: isAr
      ? "فني أسنان\nمتخصص"
      : isRu
      ? "зубных\nтехников"
      : isEn
      ? "dental\ntechnicians"
      : "dental\nteknisyen",
  };
  const stat2 = data.labStats?.[1] || {
    value: "27k",
    label: isAr
      ? "وحدة\nمصنعة"
      : isRu
      ? "изготовленных\nреставраций"
      : isEn
      ? "units\nmanufactured"
      : "üretilen\nrestorasyon",
  };
  const stat3 = data.labStats?.[2] || {
    value: "36h",
    label: isAr
      ? "سرعة\nالتسليم"
      : isRu
      ? "время\nизготовления"
      : isEn
      ? "turnaround\ntime"
      : "teslimat\nsüresi",
  };

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_19.jpg"
      className="flex flex-col justify-between"
    >
      {/* Tek Sayfa Üst Diyagonal Takoz */}
      <WiseTopWedge themeColor={themeColor} />

      {/* Laboratuvar Açıklamaları ve 3 Sarı Rozet (wise_2.pdf orijinal koordinatlarında) */}
      <div className="flex-1 px-[82px] pt-[18px] pb-[72px] select-none z-10 flex flex-col justify-between">
        <div className="space-y-5 text-[15px] leading-[1.58] text-[#222222] text-justify">
          <p>
            {isAr ? (
              <>
                تمتلك عيادتنا{" "}
                <span className="font-bold text-black">
                  مختبر أسنان داخلي مجهز بالكامل،
                </span>{" "}
                مما يتيح لنا الإشراف على كل خطوة من خطوات تصنيع التركيبات بدقة أعلى وتسليم أسرع وتجربة سلسة لمرضانا.
              </>
            ) : isRu ? (
              <>
                Наша клиника располагает{" "}
                <span className="font-bold text-black">
                  собственной полностью оснащенной зуботехнической лабораторией,
                </span>{" "}
                что позволяет контролировать каждый этап создания реставраций, обеспечивая высочайшую точность и сжатые сроки.
              </>
            ) : isEn ? (
              <>
                Our clinic has its{" "}
                <span className="font-bold text-black">
                  own fully equipped dental lab,
                </span>{" "}
                allowing us to oversee every step of the restoration process. This means greater precision, faster turnaround times, and a seamless experience for our patients.
              </>
            ) : (
              <>
                Kliniğimiz, restorasyon sürecinin her adımını doğrudan denetlememize olanak tanıyan{" "}
                <span className="font-bold text-black">
                  kendi tam donanımlı dental laboratuvarına
                </span>{" "}
                sahiptir. Bu altyapı hastalarımız için daha yüksek hassasiyet, hızlı teslimat ve kusursuz bir deneyim anlamına gelir.
              </>
            )}
          </p>

          <p>
            {isAr ? (
              <>
                بفضل المسح الرقمي وتقنية الخراطة المتقدمة CAD/CAM، نصنع تيجاناً وجسوراً وعدسات{" "}
                <span className="font-bold text-black">
                  تتطابق تماماً وتبدو طبيعية للغاية.
                </span>
              </>
            ) : isRu ? (
              <>
                Благодаря цифровому 3D-сканированию и передовому фрезерованию CAD/CAM мы создаем коронки, мосты и виниры, которые{" "}
                <span className="font-bold text-black">
                  идеально прилегают и выглядят совершенно естественно.
                </span>
              </>
            ) : isEn ? (
              <>
                With digital scanning and advanced milling technology, we can create crowns, bridges, and veneers that{" "}
                <span className="font-bold text-black">
                  fit perfectly and look natural.
                </span>
              </>
            ) : (
              <>
                3D dijital tarama ve ileri CAD/CAM kazıma teknolojimiz sayesinde{" "}
                <span className="font-bold text-black">
                  mükemmel uyum sağlayan ve tamamen doğal görünen
                </span>{" "}
                kron, köprü ve lamina restorasyonları üretiyoruz.
              </>
            )}
          </p>

          <p>
            {isAr ? (
              <>
                كما يتيح لنا وجود المختبر داخل العيادة إجراء التعديلات بشكل فوري،{" "}
                <span className="font-bold text-black">
                  لضمان تلبية كل تفصيل لأعلى معايير الجودة لدينا.
                </span>
              </>
            ) : isRu ? (
              <>
                Наличие собственной лаборатории позволяет вносить корректировки в реальном времени на примерках,{" "}
                <span className="font-bold text-black">
                  гарантируя соответствие каждой детали нашим высоким стандартам.
                </span>
              </>
            ) : isEn ? (
              <>
                Having an in-house lab also means we can make real-time adjustments,{" "}
                <span className="font-bold text-black">
                  ensuring that every detail meets our high standards.
                </span>
              </>
            ) : (
              <>
                Klinik içi laboratuvarımız sayesinde provalarda anlık düzenlemeler yapabiliyor,{" "}
                <span className="font-bold text-black">
                  her detayın yüksek kalite standartlarımızı karşılamasını güvence altına alıyoruz.
                </span>
              </>
            )}
          </p>
        </div>

        {/* 3 Sarı Rozet (wise_2.pdf orijinal tasarımı) */}
        <div className="grid grid-cols-3 gap-6 pt-6 select-none max-w-[600px] mx-auto w-full">
          <div className="flex flex-col items-center text-center">
            <div className="size-[86px] rounded-full bg-[#B8BCBE] flex items-center justify-center mb-3">
              <svg className="size-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="7" r="4" />
                <path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" />
                <path d="M10 14l2 4 2-4" />
              </svg>
            </div>
            <span className="text-[44px] font-extrabold italic text-[#F5A623] leading-none mb-1.5">
              {stat1.value}
            </span>
            <span className="text-[14.5px] italic text-[#222222] leading-[1.25] whitespace-pre-line">
              {stat1.label}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="size-[86px] rounded-full bg-[#B8BCBE] flex items-center justify-center mb-3">
              <svg className="size-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3c-3.5 0-6 2.2-6 5.5 0 2.2 1.2 4.5 2 7 .5 1.5 1.2 4.5 2.3 4.5s1.5-2.5 1.7-3.5c.2 1 .7 3.5 1.7 3.5s1.8-3 2.3-4.5c.8-2.5 2-4.8 2-7C18 5.2 15.5 3 12 3Z" />
              </svg>
            </div>
            <span className="text-[44px] font-extrabold italic text-[#F5A623] leading-none mb-1.5">
              {stat2.value}
            </span>
            <span className="text-[14.5px] italic text-[#222222] leading-[1.25] whitespace-pre-line">
              {stat2.label}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="size-[86px] rounded-full bg-[#B8BCBE] flex items-center justify-center mb-3">
              <svg className="size-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15.5 14" />
              </svg>
            </div>
            <span className="text-[44px] font-extrabold italic text-[#F5A623] leading-none mb-1.5">
              {stat3.value}
            </span>
            <span className="text-[14.5px] italic text-[#222222] leading-[1.25] whitespace-pre-line">
              {stat3.label}
            </span>
          </div>
        </div>
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
