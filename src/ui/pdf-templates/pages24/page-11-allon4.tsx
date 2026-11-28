import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseTopWedge, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page11AllOn4({
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
      bgImage="/pdf-assets/wise/page_11.jpg"
      className="flex flex-col justify-between"
    >
      {/* Tek Sayfa Üst Diyagonal Takoz */}
      <WiseTopWedge themeColor={themeColor} />

      {/* Üst 3D Anatomik Şema Boşluğu (temizlenmiş page_11.jpg üzerinde y: 165..540 aralığında yer alır) */}
      <div className="h-[100mm] shrink-0" />

      {/* Alt Açıklama ve Biyomekanik Bilgiler (wise_2.pdf orijinal koordinatlarında) */}
      <div className="flex-1 px-[64px] pt-2 pb-16 select-none z-10">
        <h2
          className="text-[24px] font-extrabold italic text-right mb-6"
          style={{ color: themeColor }}
        >
          {isAr
            ? "نظام All-on-4©"
            : isRu
            ? "Система All-on-4©"
            : "The All-on-4© System"}
        </h2>

        <div className="space-y-5 text-[15px] leading-[1.6] text-[#222222] text-justify">
          <p>
            {isAr ? (
              <>
                تم تصميم تقنية All-on-4© خصيصاً بواسطة Nobel Biocare لاستخدام نوع فريد من الغرسات التي يمكنها{" "}
                <span className="font-bold text-black">
                  تحمل قوى العض والمضغ على الفور.
                </span>{" "}
                فهي لا تبدو طبيعية تماماً فحسب، بل تمنحكم ابتسامة جميلة وواثقة.
              </>
            ) : isRu ? (
              <>
                Методика All-on-4© была специально разработана компанией Nobel Biocare для использования имплантатов, способных{" "}
                <span className="font-bold text-black">
                  немедленно воспринимать жевательную нагрузку.
                </span>{" "}
                Они выглядят и ощущаются совершенно естественно, даря вам красивую и уверенную улыбку.
              </>
            ) : isEn ? (
              <>
                The All-on-4© technique has been specifically designed by Nobel Biocare to utilise a unique type of implant which can{" "}
                <span className="font-bold text-black">
                  receive biting and chewing loads and pressure immediately.
                </span>{" "}
                They not only look and feel completely natural, but provide you with a beautiful, confident smile.
              </>
            ) : (
              <>
                All-on-4© tekniği, Nobel Biocare tarafından özel olarak geliştirilmiş olup, çene kemiğine yerleştirildiği andan itibaren{" "}
                <span className="font-bold text-black">
                  ısırma ve çiğneme kuvvetlerini anında karşılayabilen
                </span>{" "}
                özel bir implant mimarisi kullanır. Doğal diş hissi vermesinin yanı sıra estetik ve özgüvenli bir gülüş sağlar.
              </>
            )}
          </p>

          <p>
            {isAr ? (
              <>
                يمكن تحميل غرسات All-on-4© التي يتم وضعها بزوايا مدروسة فوراً بتركيبات مؤقتة ثابتة في نفس اليوم،{" "}
                <span className="font-bold text-black">
                  لتتمكنوا من ممارسة حياتكم وتناول الطعام براحة تامة.
                </span>
              </>
            ) : isRu ? (
              <>
                На имплантаты All-on-4© в тот же день фиксируется несъемный временный протез, благодаря чему{" "}
                <span className="font-bold text-black">
                  вы можете комфортно жить, улыбаться и питаться без перерыва.
                </span>
              </>
            ) : isEn ? (
              <>
                All-on-4© implants, inserted at the front of a healthy jaw bone, can be loaded immediately with a temporary fixed dentures and{" "}
                <span className="font-bold text-black">
                  you can live and eat perfectly comfortably.
                </span>
              </>
            ) : (
              <>
                Çene kemiğinin ön bölgesine özel açılarla yerleştirilen All-on-4© implantları üzerine aynı gün sabit geçici protezleriniz uygulanır; böylece{" "}
                <span className="font-bold text-black">
                  günlük yaşamınıza ve beslenme konforunuza kesintisiz devam edebilirsiniz.
                </span>
              </>
            )}
          </p>
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
