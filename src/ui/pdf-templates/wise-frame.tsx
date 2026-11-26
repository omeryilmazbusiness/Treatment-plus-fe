/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { PdfPalette } from "./types";

export function WiseToothLogo({
  className = "size-7",
  color = "#D4AF37",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wise Dental tarzı akıcı estetik azı dişi konturu */}
      <path
        d="M36 18C22 18 14 31 16 48C18 64 23 82 29 97C32 104 37 107 42 103C47 99 51 88 57 88C63 88 66 99 71 103C76 107 81 104 84 97C89 85 93 70 95 56"
        stroke={color}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 24C46 33 63 34 78 27C90 21 101 25 101 38C101 51 87 60 71 67C59 73 50 81 47 89"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface WiseHeaderProps {
  eyebrow: string;
  title: string;
  themeColor?: string;
  textColor?: string;
  className?: string;
}

/**
 * wise_2.pdf Çift Sayfa (2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22) Üst Diyagonal Başlık Bandı
 * Ölçüler: Sol kenar y=305px (80.1mm), Sağ kenar y=177px (46.5mm), Eğim açısı = -9.09 derece.
 * Başlık metni diyagonal kesim çizgisine paralel (-9.09deg) hizalanır.
 */
export function WiseHeader({
  eyebrow,
  title,
  themeColor = "#0b2938",
  textColor = "#ffffff",
  className = "",
}: WiseHeaderProps) {
  const titleLen = title.length;
  const titleFontSize =
    titleLen > 16
      ? "46px"
      : titleLen > 12
      ? "56px"
      : titleLen > 9
      ? "66px"
      : "76px";

  return (
    <div
      className={`relative z-30 shrink-0 w-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        height: "80.1mm",
        minHeight: "80.1mm",
        backgroundColor: `${themeColor}e8`,
        clipPath: "polygon(0 0, 100% 0, 100% 58.0%, 0 100%)",
      }}
    >
      <div
        className="absolute left-[56px] bottom-[8px] origin-bottom-left w-[720px]"
        style={{
          transform: "rotate(-9.09deg)",
        }}
      >
        <p
          className="text-[22px] font-light tracking-[0.14em] uppercase leading-none mb-1.5"
          style={{ color: textColor ? `${textColor}f0` : "rgba(255,255,255,0.94)" }}
        >
          {eyebrow}
        </p>
        <h1
          className="font-black uppercase tracking-[0.01em] leading-[0.84] whitespace-nowrap"
          style={{
            color: textColor || "#ffffff",
            fontSize: titleFontSize,
          }}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}

/**
 * wise_2.pdf Tek Sayfa (3, 5, 7, 11, 13, 17, 19, 21, 23) Üst Diyagonal Takoz
 * Ölçüler: Sol kenar y=175px (46.0mm), Sağ kenar y=48px (12.6mm), Eğim açısı = -9.09 derece.
 */
export function WiseTopWedge({
  themeColor = "#0b2938",
  className = "",
}: {
  themeColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative z-30 shrink-0 w-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        height: "46.0mm",
        minHeight: "46.0mm",
        backgroundColor: `${themeColor}e8`,
        clipPath: "polygon(0 0, 100% 0, 100% 27.4%, 0 100%)",
      }}
    />
  );
}

interface WiseFooterProps {
  clinicName: string;
  slogan?: string;
  logoUrl?: string;
  themeColor?: string;
  variant?: "odd" | "even";
}

/**
 * wise_2.pdf Alt Diyagonal Bandı
 * - variant="odd" (3, 5, 7, 11, 13, 17, 19, 21, 23): Sol y=1070px, Sağ y=942px (50mm yükseklik), sağ altta büyük logo + klinik adı.
 * - variant="even" (2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22): Sağ alt köşede ince diyagonal devam takozu (16.5mm yükseklik).
 */
export function WiseFooter({
  clinicName,
  slogan = "Every Smile Matters!!",
  logoUrl,
  themeColor = "#0b2938",
  variant = "odd",
}: WiseFooterProps) {
  if (variant === "even") {
    return (
      <div
        className="absolute bottom-0 right-0 w-full z-30 overflow-hidden select-none pointer-events-none"
        style={{
          height: "16.5mm",
          backgroundColor: `${themeColor}ee`,
          clipPath: "polygon(51.5% 100%, 100% 0%, 100% 100%)",
        }}
      />
    );
  }

  return (
    <div
      className="absolute bottom-0 right-0 w-full z-30 overflow-hidden select-none pointer-events-none"
      style={{
        height: "50.0mm",
        backgroundColor: `${themeColor}ee`,
        clipPath: "polygon(0 67.2%, 100% 0%, 100% 100%, 0 100%)",
      }}
    >
      <div className="absolute bottom-4 right-11 flex items-center gap-3.5 text-white">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-11 object-contain" />
        ) : (
          <WiseToothLogo className="size-12 text-white" color="#ffffff" />
        )}
        <div className="text-left leading-none">
          <p className="text-[25px] font-bold tracking-tight text-white">
            {clinicName}
          </p>
          <p className="text-[9.5px] tracking-[0.28em] text-white/85 font-light mt-1">
            {slogan}
          </p>
        </div>
      </div>
    </div>
  );
}

interface WisePageWrapperProps {
  bgImage?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function WisePageWrapper({
  bgImage,
  children,
  className = "",
  style = {},
}: WisePageWrapperProps) {
  return (
    <div
      className={`a4-page relative flex flex-col justify-between font-sans shadow-sm overflow-hidden box-border select-none bg-white text-slate-800 ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        height: "297mm",
        maxHeight: "297mm",
        pageBreakAfter: "always",
        breakAfter: "page",
        boxSizing: "border-box",
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function getThemeColor(palette?: PdfPalette, fallback = "#0b2938"): string {
  if (palette?.primary && palette.primary !== "#001845") return palette.primary;
  return fallback;
}
