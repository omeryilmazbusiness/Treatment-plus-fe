/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { PdfPalette, TemplateId } from "./types";
import { normalizeTemplateId } from "./page-frame";

export interface WiseThemeVisuals {
  templateId: TemplateId;
  /** Sayfa içi başlıkların ve ana vurguların rengi */
  primaryColor: string;
  /** Kenarlık ana zemin rengi */
  bandBg: string;
  /** Kenarlık ikinci degrade rengi */
  bandBgSecondary: string;
  /** Altın / Neon / Pastel vurgu rengi */
  accentColor: string;
  /** Üst/alt banttaki ana başlık rengi */
  bandTitleColor: string;
  /** Üst banttaki üst başlık (eyebrow) rengi */
  bandEyebrowColor: string;
  /** Alt banttaki logo ve klinik adı rengi */
  footerTextColor: string;
}

export function getTemplateVisuals(
  rawTemplateId?: string,
  palette?: PdfPalette
): WiseThemeVisuals {
  const templateId = normalizeTemplateId(rawTemplateId);

  switch (templateId) {
    case "modern-geometric": // MODERN
      return {
        templateId,
        primaryColor: "#1E293B",
        bandBg: "#1E293B",
        bandBgSecondary: "#0F172A",
        accentColor: "#E5A93C",
        bandTitleColor: "#FFFFFF",
        bandEyebrowColor: "#FCD34D",
        footerTextColor: "#FFFFFF",
      };

    case "royal-gold": // TEKNO
      return {
        templateId,
        primaryColor: "#08203E",
        bandBg: "#050E1D",
        bandBgSecondary: "#0A1E3C",
        accentColor: "#00E5FF",
        bandTitleColor: "#FFFFFF",
        bandEyebrowColor: "#00E5FF",
        footerTextColor: "#E0F9FF",
      };

    case "noir-gold": // PREMİUM
      return {
        templateId,
        primaryColor: "#1C1917",
        bandBg: "#121212",
        bandBgSecondary: "#1F1C18",
        accentColor: "#D4AF37",
        bandTitleColor: "#F7E7B4",
        bandEyebrowColor: "#D4AF37",
        footerTextColor: "#F7E7B4",
      };

    case "liquid-art": // SOFT
      return {
        templateId,
        primaryColor: "#6B4F5E",
        bandBg: "#EBD9D6",
        bandBgSecondary: "#DCE4E4",
        accentColor: "#B5838D",
        bandTitleColor: "#4A3441",
        bandEyebrowColor: "#8E6A78",
        footerTextColor: "#4A3441",
      };

    case "botanical-serenity": // NATURE
      return {
        templateId,
        primaryColor: "#3A5A40",
        bandBg: "#E9F0E6",
        bandBgSecondary: "#DDE8D8",
        accentColor: "#588157",
        bandTitleColor: "#263D2B",
        bandEyebrowColor: "#4F7756",
        footerTextColor: "#263D2B",
      };

    case "klinik-minimal": // KLASİK (Orijinal)
    default: {
      const baseColor =
        palette?.primary && palette.primary !== "#001845"
          ? palette.primary
          : "#0b2938";
      return {
        templateId: "klinik-minimal",
        primaryColor: baseColor,
        bandBg: baseColor,
        bandBgSecondary: baseColor,
        accentColor: "#E5B94E",
        bandTitleColor: "#FFFFFF",
        bandEyebrowColor: "rgba(255,255,255,0.94)",
        footerTextColor: "#FFFFFF",
      };
    }
  }
}

export function resolveVisualsFromTheme(
  themeColor?: string,
  templateId?: string
): WiseThemeVisuals {
  if (templateId) {
    return getTemplateVisuals(templateId);
  }
  switch ((themeColor || "").toUpperCase()) {
    case "#1E293B":
      return getTemplateVisuals("modern-geometric");
    case "#08203E":
      return getTemplateVisuals("royal-gold");
    case "#1C1917":
      return getTemplateVisuals("noir-gold");
    case "#6B4F5E":
      return getTemplateVisuals("liquid-art");
    case "#3A5A40":
      return getTemplateVisuals("botanical-serenity");
    default: {
      const baseColor = themeColor || "#0b2938";
      return {
        templateId: "klinik-minimal",
        primaryColor: baseColor,
        bandBg: baseColor,
        bandBgSecondary: baseColor,
        accentColor: "#E5B94E",
        bandTitleColor: "#FFFFFF",
        bandEyebrowColor: "rgba(255,255,255,0.94)",
        footerTextColor: "#FFFFFF",
      };
    }
  }
}

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

/**
 * 5 Yeni Şablon İçin Üst ve Alt Kenarlık İçi Vektörel Motif Katmanı
 */
function BandDecorations({
  templateId,
  position,
}: {
  templateId: TemplateId;
  position: "header" | "top-wedge" | "footer-odd" | "footer-even";
}) {
  const isTop = position === "header" || position === "top-wedge";

  if (templateId === "modern-geometric") {
    // MODERN: Koyu lacivert/antrasit altıgen geometrik bloklar + altın geometrik çizgiler
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 260"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`mod-bg-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="60%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>
        <rect width="800" height="260" fill={`url(#mod-bg-${position})`} />
        {/* Geometrik Poligon Yüzeyler */}
        <polygon points="0,0 260,0 140,260 0,260" fill="#334155" opacity="0.28" />
        <polygon points="520,0 800,0 800,220 630,260" fill="#090F1A" opacity="0.55" />
        {/* Sağ/Sol Altıgen (Hexagon) Blokları */}
        <polygon
          points="690,22 745,52 745,112 690,142 635,112 635,52"
          fill="#1E293B"
          stroke="#E5A93C"
          strokeWidth="2.5"
        />
        <polygon
          points="625,75 660,95 660,135 625,155 590,135 590,95"
          fill="#E5A93C"
          opacity="0.88"
        />
        {/* Altıgen içi geometrik prizma çizimi */}
        <polygon
          points="690,46 720,98 660,98"
          fill="none"
          stroke="#E5A93C"
          strokeWidth="1.8"
          opacity="0.85"
        />
        {/* Diyagonal Kesim Boyunca Altın Çift Çizgi */}
        {position === "header" && (
          <>
            <line x1="0" y1="254" x2="800" y2="147" stroke="#E5A93C" strokeWidth="4" />
            <line x1="0" y1="244" x2="800" y2="137" stroke="#E5A93C" strokeWidth="1.2" opacity="0.65" />
          </>
        )}
        {position === "top-wedge" && (
          <line x1="0" y1="253" x2="800" y2="70" stroke="#E5A93C" strokeWidth="4.5" />
        )}
        {position === "footer-odd" && (
          <>
            <line x1="0" y1="176" x2="800" y2="3" stroke="#E5A93C" strokeWidth="4.5" />
            <line x1="0" y1="186" x2="800" y2="13" stroke="#E5A93C" strokeWidth="1.4" opacity="0.65" />
          </>
        )}
        {position === "footer-even" && (
          <line x1="412" y1="258" x2="800" y2="2" stroke="#E5A93C" strokeWidth="6" />
        )}
      </svg>
    );
  }

  if (templateId === "royal-gold") {
    // TEKNO: Koyu siber lacivert zemin + parlayan neon mavi (cyan) devre kartı (PCB) yolları
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 260"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`tek-bg-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#040B16" />
            <stop offset="50%" stopColor="#081B33" />
            <stop offset="100%" stopColor="#040D1A" />
          </linearGradient>
        </defs>
        <rect width="800" height="260" fill={`url(#tek-bg-${position})`} />
        {/* Siber Izgara & PCB Devre Yolları */}
        <g stroke="#00E5FF" strokeWidth="1.8" fill="none" opacity="0.45">
          <polyline points="20,0 20,45 55,80 140,80" />
          <polyline points="480,0 480,35 520,75 640,75 675,110" />
          <polyline points="560,0 560,25 595,55 730,55" />
          <polyline points="620,180 660,140 760,140 790,110" />
          <polyline points="360,220 410,170 530,170" />
        </g>
        {/* Devre Lehim Noktaları (Nodes) */}
        <g fill="#00E5FF" opacity="0.8">
          <circle cx="140" cy="80" r="4" />
          <circle cx="675" cy="110" r="4.5" />
          <circle cx="730" cy="55" r="4" />
          <circle cx="530" cy="170" r="3.5" />
          <circle cx="55" cy="80" r="3" />
        </g>
        {/* Sağ Üst / Sol Alt Çip Soket Motifi */}
        {isTop && (
          <g transform="translate(665, 22)" stroke="#00E5FF" fill="none" opacity="0.75">
            <rect x="18" y="18" width="54" height="54" rx="5" strokeWidth="2.2" fill="#06162E" />
            <rect x="27" y="27" width="36" height="36" rx="2" strokeWidth="1.2" opacity="0.7" />
            <line x1="30" y1="6" x2="30" y2="18" strokeWidth="2" />
            <line x1="45" y1="6" x2="45" y2="18" strokeWidth="2" />
            <line x1="60" y1="6" x2="60" y2="18" strokeWidth="2" />
            <line x1="30" y1="72" x2="30" y2="84" strokeWidth="2" />
            <line x1="45" y1="72" x2="45" y2="84" strokeWidth="2" />
            <line x1="60" y1="72" x2="60" y2="84" strokeWidth="2" />
            <line x1="6" y1="30" x2="18" y2="30" strokeWidth="2" />
            <line x1="6" y1="45" x2="18" y2="45" strokeWidth="2" />
            <line x1="6" y1="60" x2="18" y2="60" strokeWidth="2" />
            <line x1="72" y1="30" x2="84" y2="30" strokeWidth="2" />
            <line x1="72" y1="45" x2="84" y2="45" strokeWidth="2" />
            <line x1="72" y1="60" x2="84" y2="60" strokeWidth="2" />
          </g>
        )}
        {/* Parlayan Neon Sınır Çizgisi */}
        {position === "header" && (
          <>
            <line x1="0" y1="254" x2="800" y2="147" stroke="#00E5FF" strokeWidth="4" />
            <line x1="0" y1="245" x2="800" y2="138" stroke="#00E5FF" strokeWidth="1.3" opacity="0.6" />
          </>
        )}
        {position === "top-wedge" && (
          <line x1="0" y1="253" x2="800" y2="70" stroke="#00E5FF" strokeWidth="4.5" />
        )}
        {position === "footer-odd" && (
          <>
            <line x1="0" y1="176" x2="800" y2="3" stroke="#00E5FF" strokeWidth="4.5" />
            <line x1="0" y1="186" x2="800" y2="13" stroke="#00E5FF" strokeWidth="1.4" opacity="0.55" />
          </>
        )}
        {position === "footer-even" && (
          <line x1="412" y1="258" x2="800" y2="2" stroke="#00E5FF" strokeWidth="6" />
        )}
      </svg>
    );
  }

  if (templateId === "noir-gold") {
    // PREMİUM: Siyah/kömür zemin + metalik altın V-şeritler ve klasik süslü ornament detayları
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 260"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`prm-bg-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E0E10" />
            <stop offset="50%" stopColor="#1C1A17" />
            <stop offset="100%" stopColor="#0F0F12" />
          </linearGradient>
          <linearGradient id={`prm-gold-${position}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#AA771C" />
            <stop offset="50%" stopColor="#F5E6B3" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
        <rect width="800" height="260" fill={`url(#prm-bg-${position})`} />
        {/* Lüks Altın V-Kalkan Yansımaları */}
        <polygon points="0,0 320,0 180,260 0,260" fill="#27231E" opacity="0.45" />
        <polygon points="560,0 800,0 800,260 440,260" fill="#08080A" opacity="0.6" />
        {/* Klasik Ornament (Filigree) Süsleme Motifi */}
        {isTop && (
          <g transform="translate(570, 32)" stroke={`url(#prm-gold-${position})`} fill="none" opacity="0.85">
            <path d="M20,35 C45,10 75,10 100,35 C125,60 155,60 180,35" strokeWidth="2.2" />
            <path d="M40,45 C65,25 135,25 160,45" strokeWidth="1.3" />
            <polygon points="100,18 108,35 100,52 92,35" fill="#D4AF37" />
            <circle cx="65" cy="35" r="3.5" fill="#F5E6B3" />
            <circle cx="135" cy="35" r="3.5" fill="#F5E6B3" />
          </g>
        )}
        {/* Çift Katmanlı Metalik Altın Sınır Şeridi */}
        {position === "header" && (
          <>
            <line x1="0" y1="254" x2="800" y2="147" stroke={`url(#prm-gold-${position})`} strokeWidth="5.5" />
            <line x1="0" y1="242" x2="800" y2="135" stroke="#D4AF37" strokeWidth="1.5" opacity="0.8" />
          </>
        )}
        {position === "top-wedge" && (
          <>
            <line x1="0" y1="253" x2="800" y2="70" stroke={`url(#prm-gold-${position})`} strokeWidth="5.5" />
            <line x1="0" y1="239" x2="800" y2="56" stroke="#D4AF37" strokeWidth="1.5" opacity="0.75" />
          </>
        )}
        {position === "footer-odd" && (
          <>
            <line x1="0" y1="176" x2="800" y2="3" stroke={`url(#prm-gold-${position})`} strokeWidth="5.5" />
            <line x1="0" y1="189" x2="800" y2="16" stroke="#D4AF37" strokeWidth="1.5" opacity="0.75" />
          </>
        )}
        {position === "footer-even" && (
          <line x1="412" y1="258" x2="800" y2="2" stroke={`url(#prm-gold-${position})`} strokeWidth="7" />
        )}
      </svg>
    );
  }

  if (templateId === "liquid-art") {
    // SOFT: Sakin, olgun pudra gülü / mauve / ince adaçayı tonları; yalnızca zarif eğriler ve ince çizgiler
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 260"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`sft-bg-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1E2DF" />
            <stop offset="55%" stopColor="#E8D5D3" />
            <stop offset="100%" stopColor="#DCE4E4" />
          </linearGradient>
        </defs>
        <rect width="800" height="260" fill={`url(#sft-bg-${position})`} />
        {/* Yumuşak, mat dalga katmanları */}
        <path d="M0,0 L380,0 C320,100 200,150 0,200 Z" fill="#D9BDBD" opacity="0.35" />
        <path d="M440,0 L800,0 L800,180 C670,170 550,95 440,0 Z" fill="#C9D6D8" opacity="0.5" />
        <path d="M160,260 C300,175 480,165 660,260 Z" fill="#C7B3BE" opacity="0.28" />
        {/* İnce zarif süs çizgisi */}
        {isTop && (
          <g fill="none" stroke="#B5838D" strokeWidth="1.2" opacity="0.55">
            <path d="M600,40 C650,10 720,10 770,40" />
            <path d="M620,56 C660,34 710,34 750,56" />
          </g>
        )}
        {position === "header" && (
          <>
            <line x1="0" y1="254" x2="800" y2="147" stroke="#B5838D" strokeWidth="3" opacity="0.8" />
            <line x1="0" y1="244" x2="800" y2="137" stroke="#B5838D" strokeWidth="1" opacity="0.45" />
          </>
        )}
        {position === "top-wedge" && (
          <line x1="0" y1="253" x2="800" y2="70" stroke="#B5838D" strokeWidth="3.5" opacity="0.8" />
        )}
        {position === "footer-odd" && (
          <>
            <line x1="0" y1="176" x2="800" y2="3" stroke="#B5838D" strokeWidth="3.5" opacity="0.8" />
            <line x1="0" y1="186" x2="800" y2="13" stroke="#B5838D" strokeWidth="1" opacity="0.45" />
          </>
        )}
        {position === "footer-even" && (
          <line x1="412" y1="258" x2="800" y2="2" stroke="#B5838D" strokeWidth="4.5" opacity="0.8" />
        )}
      </svg>
    );
  }

  if (templateId === "botanical-serenity") {
    // NATURE: Doğal krem/adaçayı yeşili zemin + çift altın/yeşil çerçeve + yapraklar ve pembe çiçekler
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 260"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`nat-bg-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EFF5EC" />
            <stop offset="55%" stopColor="#E2ECE0" />
            <stop offset="100%" stopColor="#D5E3D2" />
          </linearGradient>
        </defs>
        <rect width="800" height="260" fill={`url(#nat-bg-${position})`} />
        {/* Sağ Üst Botanik Yapraklar ve Pembe Çiçek Buketi */}
        {isTop && (
          <g transform="translate(560, 8)">
            {/* Yeşil Yaprak Dalları */}
            <path d="M40,15 Q110,45 195,95" stroke="#588157" strokeWidth="2.2" fill="none" />
            <ellipse cx="75" cy="26" rx="18" ry="8" transform="rotate(-22 75 26)" fill="#588157" opacity="0.85" />
            <ellipse cx="115" cy="45" rx="20" ry="9" transform="rotate(-15 115 45)" fill="#3A5A40" opacity="0.9" />
            <ellipse cx="155" cy="68" rx="18" ry="8" transform="rotate(-10 155 68)" fill="#84A98C" opacity="0.9" />
            <ellipse cx="95" cy="58" rx="17" ry="7.5" transform="rotate(25 95 58)" fill="#588157" opacity="0.8" />
            <ellipse cx="140" cy="85" rx="19" ry="8" transform="rotate(20 140 85)" fill="#3A5A40" opacity="0.85" />
            {/* Pembe Çiçek */}
            <g transform="translate(185, 58)">
              <circle cx="0" cy="-12" r="10" fill="#F4ACB7" />
              <circle cx="11" cy="-4" r="10" fill="#FFCAD4" />
              <circle cx="7" cy="10" r="10" fill="#F4ACB7" />
              <circle cx="-7" cy="10" r="10" fill="#FFCAD4" />
              <circle cx="-11" cy="-4" r="10" fill="#F4ACB7" />
              <circle cx="0" cy="0" r="5.5" fill="#E5A93C" />
            </g>
          </g>
        )}
        {!isTop && (
          <g transform="translate(65, 110)">
            <ellipse cx="45" cy="42" rx="22" ry="9" transform="rotate(-25 45 42)" fill="#588157" opacity="0.85" />
            <ellipse cx="85" cy="28" rx="20" ry="8.5" transform="rotate(18 85 28)" fill="#3A5A40" opacity="0.85" />
            <ellipse cx="125" cy="44" rx="18" ry="8" transform="rotate(-12 125 44)" fill="#84A98C" opacity="0.85" />
            <g transform="translate(85, 52)">
              <circle cx="0" cy="-9" r="8" fill="#F4ACB7" />
              <circle cx="9" cy="-3" r="8" fill="#FFCAD4" />
              <circle cx="5" cy="8" r="8" fill="#F4ACB7" />
              <circle cx="-5" cy="8" r="8" fill="#FFCAD4" />
              <circle cx="-9" cy="-3" r="8" fill="#F4ACB7" />
              <circle cx="0" cy="0" r="4" fill="#E5A93C" />
            </g>
          </g>
        )}
        {/* Çift Çizgili Botanik Altın & Yeşil Kenar Çerçevesi */}
        {position === "header" && (
          <>
            <line x1="0" y1="254" x2="800" y2="147" stroke="#3A5A40" strokeWidth="4.5" />
            <line x1="0" y1="243" x2="800" y2="136" stroke="#B5945B" strokeWidth="1.8" />
          </>
        )}
        {position === "top-wedge" && (
          <>
            <line x1="0" y1="253" x2="800" y2="70" stroke="#3A5A40" strokeWidth="4.5" />
            <line x1="0" y1="240" x2="800" y2="57" stroke="#B5945B" strokeWidth="1.8" />
          </>
        )}
        {position === "footer-odd" && (
          <>
            <line x1="0" y1="176" x2="800" y2="3" stroke="#3A5A40" strokeWidth="4.5" />
            <line x1="0" y1="188" x2="800" y2="15" stroke="#B5945B" strokeWidth="1.8" />
          </>
        )}
        {position === "footer-even" && (
          <line x1="412" y1="258" x2="800" y2="2" stroke="#3A5A40" strokeWidth="6" />
        )}
      </svg>
    );
  }

  return null;
}

interface WiseHeaderProps {
  eyebrow: string;
  title: string;
  themeColor?: string;
  templateId?: string;
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
  templateId,
  textColor,
  className = "",
}: WiseHeaderProps) {
  const visuals = resolveVisualsFromTheme(themeColor, templateId);
  const isCustomTheme = visuals.templateId !== "klinik-minimal";

  const titleLen = title.length;
  const titleFontSize =
    titleLen > 16
      ? "46px"
      : titleLen > 12
      ? "56px"
      : titleLen > 9
      ? "66px"
      : "76px";

  const resolvedTitleColor = isCustomTheme
    ? visuals.bandTitleColor
    : textColor || "#ffffff";
  const resolvedEyebrowColor = isCustomTheme
    ? visuals.bandEyebrowColor
    : textColor
    ? `${textColor}f0`
    : "rgba(255,255,255,0.94)";

  return (
    <div
      className={`relative z-30 shrink-0 w-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        height: "80.1mm",
        minHeight: "80.1mm",
        backgroundColor: isCustomTheme ? visuals.bandBg : `${themeColor}e8`,
        clipPath: "polygon(0 0, 100% 0, 100% 58.0%, 0 100%)",
      }}
    >
      {isCustomTheme && (
        <BandDecorations templateId={visuals.templateId} position="header" />
      )}

      <div
        className="absolute left-[56px] bottom-[8px] origin-bottom-left w-[720px] z-10"
        style={{
          transform: "rotate(-9.09deg)",
        }}
      >
        <p
          className="text-[22px] font-light tracking-[0.14em] uppercase leading-none mb-1.5"
          style={{ color: resolvedEyebrowColor }}
        >
          {eyebrow}
        </p>
        <h1
          className="font-black uppercase tracking-[0.01em] leading-[0.84] whitespace-nowrap"
          style={{
            color: resolvedTitleColor,
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
  templateId,
  className = "",
  style,
}: {
  themeColor?: string;
  templateId?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const visuals = resolveVisualsFromTheme(themeColor, templateId);
  const isCustomTheme = visuals.templateId !== "klinik-minimal";

  return (
    <div
      className={`relative z-30 shrink-0 w-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        height: "46.0mm",
        minHeight: "46.0mm",
        backgroundColor: isCustomTheme ? visuals.bandBg : `${themeColor}e8`,
        clipPath: "polygon(0 0, 100% 0, 100% 27.4%, 0 100%)",
        ...style,
      }}
    >
      {isCustomTheme && (
        <BandDecorations templateId={visuals.templateId} position="top-wedge" />
      )}
    </div>
  );
}

interface WiseFooterProps {
  clinicName: string;
  slogan?: string;
  logoUrl?: string;
  themeColor?: string;
  templateId?: string;
  variant?: "odd" | "even";
  hideLogo?: boolean;
  className?: string;
  style?: React.CSSProperties;
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
  templateId,
  variant = "odd",
  hideLogo = false,
  className = "",
  style,
}: WiseFooterProps) {
  const visuals = resolveVisualsFromTheme(themeColor, templateId);
  const isCustomTheme = visuals.templateId !== "klinik-minimal";

  if (variant === "even") {
    return (
      <div
        className={`absolute bottom-0 right-0 w-full z-30 overflow-hidden select-none pointer-events-none ${className}`}
        style={{
          height: "16.5mm",
          backgroundColor: isCustomTheme ? visuals.bandBg : `${themeColor}ee`,
          clipPath: "polygon(51.5% 100%, 100% 0%, 100% 100%)",
          ...style,
        }}
      >
        {isCustomTheme && (
          <BandDecorations
            templateId={visuals.templateId}
            position="footer-even"
          />
        )}
      </div>
    );
  }

  const footerTextCol = isCustomTheme ? visuals.footerTextColor : "#ffffff";
  const footerLogoCol = isCustomTheme ? visuals.accentColor : "#ffffff";

  return (
    <div
      className={`absolute bottom-0 right-0 w-full z-30 overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        height: "50.0mm",
        backgroundColor: isCustomTheme ? visuals.bandBg : `${themeColor}ee`,
        clipPath: "polygon(0 67.2%, 100% 0%, 100% 100%, 0 100%)",
        ...style,
      }}
    >
      {isCustomTheme && (
        <BandDecorations templateId={visuals.templateId} position="footer-odd" />
      )}

      {!hideLogo && (
        <div
          className="absolute bottom-4 right-11 flex items-center gap-3.5 z-10"
          style={{ color: footerTextCol }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-11 object-contain" />
          ) : (
            <WiseToothLogo className="size-12 w-12 h-12" color={footerLogoCol} />
          )}
          <div className="text-left leading-none">
            <p
              className="text-[25px] font-bold tracking-tight"
              style={{ color: footerTextCol }}
            >
              {clinicName}
            </p>
            <p
              className="text-[9.5px] tracking-[0.28em] font-light mt-1 opacity-85"
              style={{ color: footerTextCol }}
            >
              {slogan}
            </p>
          </div>
        </div>
      )}
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
