import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseTopWedge, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page17SmileResult({
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
  const photoUrl = data.patientPhotoUrl || "/pdf-assets/wise/page_17.jpg";

  return (
    <WisePageWrapper
      bgImage={photoUrl}
      className="flex flex-col justify-between"
    >
      {/* Tek Sayfa Üst Diyagonal Takoz */}
      <WiseTopWedge themeColor={themeColor} />

      <div className="flex-1" />

      {/* Sol Alt Başlık Vurgusu (temizlenmiş page_17.jpg üzerinde orijinal konumunda) */}
      <div className="px-[54px] pb-[64px] z-10 select-none text-white drop-shadow-md">
        <h2 className="text-[31px] font-extrabold italic tracking-tight leading-none mb-1.5">
          {isAr
            ? "النتيجة"
            : isRu
            ? "Результат"
            : isEn
            ? "The result"
            : "Tedavi Sonucu"}
        </h2>
        <p className="text-[15.5px] italic font-light text-white/95 leading-snug max-w-[240px]">
          {isAr
            ? "تجميل شامل للابتسامة\nبتيجان الزركونيا"
            : isRu
            ? "Полное преображение улыбки\nциркониевыми коронками"
            : isEn
            ? "Total smile makeover\nwith zirconia crowns"
            : "Zirkonyum kronlarla\ntam gülüş tasarımı"}
        </p>
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
