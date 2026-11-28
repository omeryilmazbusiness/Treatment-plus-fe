/* eslint-disable @next/next/no-img-element */
import React from "react";
import { DEFAULT_PANORAMIC_XRAY_URL } from "@/ui/treatment-studio/panoramic-xray-asset";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseHeader, WiseFooter, getThemeColor } from "../wise-frame";
import { PdfCurrentSituationOdontogram } from "./pdf-odontogram";

export function Booklet24Page8Situation({
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

  // Eğer daha önce yapay SVG kaydedilmişse veya röntgen yüklenmemişse gerçek klinik OPG röntgenini kullan
  const rawXray = data.xrayUrl?.trim() || "";
  const isSyntheticSvg =
    rawXray.startsWith("data:image/svg+xml") ||
    rawXray.includes("svg+xml");
  const xraySrc =
    rawXray && !isSyntheticSvg ? rawXray : DEFAULT_PANORAMIC_XRAY_URL;

  return (
    <WisePageWrapper
      className="flex flex-col justify-between bg-white"
    >
      {/* 1. Eğimli Başlık Bandı (80.1mm) */}
      <WiseHeader
        eyebrow={
          isAr
            ? "حالة الفم"
            : isRu
            ? "ТЕКУЩЕЕ"
            : isEn
            ? "YOUR CURRENT"
            : "MEVCUT AĞIZ"
        }
        title={
          isAr
            ? "الحالية"
            : isRu
            ? "СОСТОЯНИЕ"
            : isEn
            ? "SITUATION"
            : "DURUMUNUZ"
        }
        themeColor={themeColor}
      />

      {/* 2. Doktorun Teşhisine Göre Dinamik Şekillenen 2D FDI Odontogram ve Gerçekçi Panoramik Röntgen */}
      <div className="flex-1 flex flex-col justify-between px-[36px] pt-2 pb-[22mm] z-10 select-none gap-3">
        {/* A. Dinamik Mevcut Durum (Teşhis) Odontogramı */}
        <PdfCurrentSituationOdontogram data={data} />

        {/* B. Hasta Panoramik Röntgen Görseli (Gerçek Klinik OPG Radyografisi) */}
        <div className="flex-1 min-h-[96mm] max-h-[112mm] w-full rounded-xl overflow-hidden bg-white relative flex items-center justify-center">
          <img
            src={xraySrc}
            alt={isEn ? "Panoramic X-Ray" : "Panoramik Röntgen"}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* 3. Çift Sayfa Sağ Alt Köşe Takozu */}
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
