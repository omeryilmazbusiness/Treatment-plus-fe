/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseToothLogo, getTemplateVisuals } from "../wise-frame";
import { WiseCoverArtwork } from "./page-1-cover";

export function Booklet24Page24BackCover({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const visuals = getTemplateVisuals(data.templateId, palette);
  const isCustomTheme = visuals.templateId !== "klinik-minimal";
  const isEn = data.locale === "en";
  const clinicName = (data.clinicName || "Wise Dental").trim();
  const slogan = data.slogan || data.clinicSlogan || "Every Smile Matters!!";

  const address =
    data.clinicAddress || data.address || "123 Main St. Anytown, Country";
  const phone = data.clinicPhone || data.phone || "+1 234 567890";
  const email = data.clinicEmail || data.email || "contact@wisedental.com";
  const website = data.clinicWebsite || data.website || "wisedental.com";

  const words = clinicName.split(/\s+/);
  const firstWord = words[0] || "Wise";
  const restWords = words.slice(1).join(" ");

  const backStyleByTheme: Record<
    string,
    {
      headingColor: string;
      bodyColor: string;
      logoColor: string;
      brandPrimary: string;
      brandSecondary: string;
      sloganColor: string;
    }
  > = {
    "modern-geometric": {
      headingColor: "#0F172A",
      bodyColor: "#334155",
      logoColor: "#D97706",
      brandPrimary: "#0F172A",
      brandSecondary: "#D97706",
      sloganColor: "#475569",
    },
    "royal-gold": {
      headingColor: "#00E5FF",
      bodyColor: "#E0F9FF",
      logoColor: "#00E5FF",
      brandPrimary: "#00E5FF",
      brandSecondary: "#FFFFFF",
      sloganColor: "#7DD3FC",
    },
    "noir-gold": {
      headingColor: "#18181B",
      bodyColor: "#3F3A32",
      logoColor: "#B48618",
      brandPrimary: "#18181B",
      brandSecondary: "#9A6F18",
      sloganColor: "#785C12",
    },
    "liquid-art": {
      headingColor: "#4A356B",
      bodyColor: "#5B4B73",
      logoColor: "#EC4899",
      brandPrimary: "#4A356B",
      brandSecondary: "#DB2777",
      sloganColor: "#6B538C",
    },
    "botanical-serenity": {
      headingColor: "#2D4A36",
      bodyColor: "#3F5E48",
      logoColor: "#3A5A40",
      brandPrimary: "#2D4A36",
      brandSecondary: "#588157",
      sloganColor: "#52796F",
    },
  };

  const activeBackStyle = isCustomTheme
    ? backStyleByTheme[visuals.templateId]
    : undefined;

  const headingCol = activeBackStyle ? activeBackStyle.headingColor : "#FFFFFF";
  const bodyCol = activeBackStyle
    ? activeBackStyle.bodyColor
    : "rgba(255,255,255,0.9)";

  return (
    <WisePageWrapper
      bgImage={isCustomTheme ? undefined : "/pdf-assets/wise/page_24.jpg"}
      className="flex flex-col justify-between"
    >
      {isCustomTheme && (
        <WiseCoverArtwork templateId={visuals.templateId} variant="back" />
      )}

      {/* Üst Boşluk */}
      <div className="h-32" />

      {/* İletişim Bilgileri (wise_2.pdf orijinal tipografisi ve yerleşimiyle) */}
      <div className="flex-1 flex flex-col items-center justify-start text-center px-12 select-none z-10 space-y-7">
        <div>
          <h3
            className="text-[19px] font-bold tracking-tight mb-1"
            style={{ color: headingCol }}
          >
            {isEn ? "Clinic Address" : "Klinik Adresi"}
          </h3>
          <p
            className="text-[18px] font-extralight max-w-[460px] leading-snug"
            style={{ color: bodyCol }}
          >
            {address}
          </p>
        </div>

        <div>
          <h3
            className="text-[19px] font-bold tracking-tight mb-1"
            style={{ color: headingCol }}
          >
            {isEn ? "Phone" : "Telefon"}
          </h3>
          <p className="text-[18px] font-extralight" style={{ color: bodyCol }}>
            {phone}
          </p>
        </div>

        <div>
          <h3
            className="text-[19px] font-bold tracking-tight mb-1"
            style={{ color: headingCol }}
          >
            {isEn ? "Email" : "E-posta"}
          </h3>
          <p className="text-[18px] font-extralight" style={{ color: bodyCol }}>
            {email}
          </p>
        </div>

        <div>
          <h3
            className="text-[19px] font-bold tracking-tight mb-1"
            style={{ color: headingCol }}
          >
            {isEn ? "Website" : "Web Sitesi"}
          </h3>
          <p className="text-[18px] font-extralight" style={{ color: bodyCol }}>
            {website}
          </p>
        </div>

        <div>
          <h3
            className="text-[19px] font-bold tracking-tight mb-1"
            style={{ color: headingCol }}
          >
            {isEn ? "Opening Hours" : "Çalışma Saatleri"}
          </h3>
          <p
            className="text-[18px] font-extralight leading-snug"
            style={{ color: bodyCol }}
          >
            {isEn
              ? "Monday – Friday: 10:00–19:00"
              : "Pazartesi – Cuma: 10:00–19:00"}
            <br />
            {isEn ? "Saturday – Sunday: Closed" : "Cumartesi – Pazar: Kapalı"}
          </p>
        </div>
      </div>

      {/* Alt: Diş Logosu ve Klinik Adı (wise_2.pdf orijinal konumunda) */}
      <div className="flex flex-col items-center justify-center text-center pb-28 select-none z-10">
        {data.logoUrl ? (
          <img
            src={data.logoUrl}
            alt={clinicName}
            className="h-20 object-contain mb-3 drop-shadow-lg"
          />
        ) : (
          <div className="mb-2 drop-shadow-md">
            <WiseToothLogo
              className="size-24 w-24 h-24"
              color={activeBackStyle ? activeBackStyle.logoColor : "#E5B94E"}
            />
          </div>
        )}
        <h2
          className="tracking-tight leading-none mb-1.5"
          style={{
            fontSize: clinicName.length > 18 ? "32px" : "40px",
            color: activeBackStyle ? activeBackStyle.brandPrimary : "#E6BC53",
          }}
        >
          <span className="font-black">{firstWord}</span>
          {restWords ? (
            <span
              className="font-extralight ml-1.5"
              style={{
                color: activeBackStyle
                  ? activeBackStyle.brandSecondary
                  : "#E6BC53",
              }}
            >
              {restWords}
            </span>
          ) : null}
        </h2>
        <p
          className="text-[10.5px] font-light tracking-[0.38em]"
          style={{
            color: activeBackStyle ? activeBackStyle.sloganColor : "#E8D292",
          }}
        >
          {slogan}
        </p>
      </div>
    </WisePageWrapper>
  );
}
