/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseToothLogo, getThemeColor } from "../wise-frame";

export function Booklet24Page1Cover({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const themeColor = getThemeColor(palette, "#0b2938");
  const clinicName = (data.clinicName || "Wise Dental").trim();
  const slogan = data.slogan || data.clinicSlogan || "Every Smile Matters!!";
  const patientName = data.patientName || "John Smith";
  const dateStr = data.dateStr || data.date || "November 2026";
  const planTitle =
    data.planTitle ||
    (data.locale === "en" ? "COMPREHENSIVE TREATMENT PLAN" : "KİŞİYE ÖZEL TEDAVİ PLANI");

  // Wise Dental tarzı ilk kelime kalın, kalan kelimeler ince altın tipografi
  const words = clinicName.split(/\s+/);
  const firstWord = words[0] || "Wise";
  const restWords = words.slice(1).join(" ");

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_1.jpg"
      className="flex flex-col justify-between p-0"
    >
      {/* Üst Altın Folyo Boşluğu */}
      <div className="h-36" />

      {/* Orta: wise_2.pdf Orijinal Konumunda Altın Diş Logosu, Klinik Adı ve Slogan */}
      <div className="flex flex-col items-center justify-center text-center px-10 select-none z-10 my-auto">
        {data.logoUrl ? (
          <img
            src={data.logoUrl}
            alt={clinicName}
            className="h-36 object-contain mb-5 drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
          />
        ) : (
          <div className="mb-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]">
            <WiseToothLogo className="size-40" color="#E5B94E" />
          </div>
        )}

        <h1
          className=" tracking-tight leading-none mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          style={{
            fontSize: clinicName.length > 18 ? "42px" : "56px",
            color: "#E6BC53",
          }}
        >
          <span className="font-black">{firstWord}</span>
          {restWords ? <span className="font-extralight ml-2">{restWords}</span> : null}
        </h1>

        <p className="text-[13.5px] font-light tracking-[0.42em] text-[#E8D292] drop-shadow">
          {slogan}
        </p>
      </div>

      {/* Alt: Hasta ve Plan Bilgisi Kartı */}
      <div className="z-20 px-12 pb-20 pt-4 select-none">
        <div
          className="rounded-2xl px-6 py-4 backdrop-blur-md shadow-2xl border border-[#E5B94E]/30 text-white flex items-center justify-between"
          style={{ backgroundColor: `${themeColor}d9` }}
        >
          <div>
            <span className="text-[9.5px] uppercase tracking-[0.25em] text-[#E5B94E] font-bold block mb-0.5">
              {planTitle}
            </span>
            <h2 className="text-[22px] font-bold tracking-tight text-white leading-tight">
              {patientName}
            </h2>
            {data.doctorName && (
              <p className="text-[11px] text-white/80 font-medium mt-0.5">
                {data.doctorName}
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-[9.5px] uppercase tracking-wider text-white/70 block">
              {data.proposalNo || data.planNo
                ? `PLAN #${data.proposalNo || data.planNo}`
                : "CONFIDENTIAL"}
            </span>
            <span className="text-[12px] font-bold text-[#E5B94E] block mt-1">
              {dateStr}
            </span>
          </div>
        </div>
      </div>
    </WisePageWrapper>
  );
}
