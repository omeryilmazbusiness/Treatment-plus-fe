import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseHeader, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page4AboutClinic({
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
  const clinicUpper = (data.clinicName || "WISE DENTAL").toUpperCase();

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_4.jpg"
      className="flex flex-col justify-between"
    >
      {/* 1. Eğimli Başlık Bandı */}
      <WiseHeader
        eyebrow={
          isAr
            ? `حول ${clinicUpper}`
            : isRu
            ? `О КЛИНИКЕ ${clinicUpper}`
            : isEn
            ? `ABOUT ${clinicUpper}`
            : `${clinicUpper} HAKKINDA`
        }
        title={isAr ? "عيادتنا" : isRu ? "КЛИНИКА" : isEn ? "THE CLINIC" : "KLİNİĞİMİZ"}
        themeColor={themeColor}
      />

      <div className="flex-1" />

      {/* 2. Çift Sayfa Sağ Alt Köşe Takozu */}
      <WiseFooter
        clinicName={data.clinicName || "Wise Dental"}
        slogan={data.slogan || data.clinicSlogan || "Every Smile Matters!!"}
        logoUrl={data.logoUrl}
        themeColor={themeColor}
        variant="even"
      />
    </WisePageWrapper>
  );
}
