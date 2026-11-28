/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { PdfPalette, PdfPlanData, TemplateId } from "../types";
import {
  WisePageWrapper,
  WiseToothLogo,
  getThemeColor,
  getTemplateVisuals,
} from "../wise-frame";

/**
 * 5 Yeni Şablon İçin Tam Sayfa (A4) Vektörel Ön & Arka Kapak Arka Plan Tasarımı
 * Görseldeki 5 örnek kapak tasarımını (MODERN, TEKNO, PREMİUM, SOFT, NATURE) birebir yansıtır.
 */
export function WiseCoverArtwork({
  templateId,
  variant = "front",
}: {
  templateId: TemplateId;
  variant?: "front" | "back";
}) {
  if (templateId === "modern-geometric") {
    // 1. MODERN: Beyaz/açık gri zemin, koyu lacivert/antrasit 3D altıgenler ve ince altın geometrik çerçeve çizgileri
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 794 1123"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mod-cov-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F4F6F9" />
            <stop offset="100%" stopColor="#E9EEF5" />
          </linearGradient>
          <linearGradient id="mod-hex-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#263346" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>
        <rect width="794" height="1123" fill="url(#mod-cov-bg)" />

        {/* Arka Plan Hafif Geometrik Fasetler */}
        <polygon points="0,0 440,0 160,340 0,240" fill="#E2E8F0" opacity="0.55" />
        <polygon points="794,0 500,0 794,300" fill="#CBD5E1" opacity="0.4" />
        <polygon points="0,780 280,1123 0,1123" fill="#E2E8F0" opacity="0.6" />

        {/* Üst Sol & Üst Sağ Koyu Lacivert Geometrik Köşeler */}
        <polygon points="0,0 210,0 0,175" fill="#1E293B" />
        <polygon points="560,0 794,0 794,250 665,120" fill="#1E293B" />
        <polygon points="645,0 794,0 794,140" fill="#0F172A" />

        {/* İnce Altın Geometrik Çerçeve Çizgileri */}
        <polyline
          points="55,155 55,55 480,55 645,220 645,410"
          fill="none"
          stroke="#D97706"
          strokeWidth="2"
          opacity="0.75"
        />
        <polyline
          points="738,710 738,1065 290,1065 135,910"
          fill="none"
          stroke="#D97706"
          strokeWidth="2"
          opacity="0.75"
        />

        {/* Sağ Orta Büyük Koyu Altıgen + Altın Vurgu Altıgeni (Görseldeki MODERN kapağı) */}
        <g transform="translate(555, 420)">
          {/* Altın Küçük Altıgen */}
          <polygon
            points="10,-28 52,-4 52,44 10,68 -32,44 -32,-4"
            fill="#E5A93C"
          />
          {/* Büyük Antrasit Altıgen */}
          <polygon
            points="115,0 215,58 215,174 115,232 15,174 15,58"
            fill="url(#mod-hex-dark)"
            stroke="#1E293B"
            strokeWidth="4"
          />
          {/* Altıgen İçi İnce Altın Çerçeve ve Geometrik Dağ/Prizma İkonu */}
          <polygon
            points="115,18 198,66 198,166 115,214 32,166 32,66"
            fill="none"
            stroke="#E5A93C"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <polygon
            points="115,74 162,148 68,148"
            fill="none"
            stroke="#E5A93C"
            strokeWidth="2.2"
          />
          <polygon
            points="138,96 174,148 102,148"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.6"
          />
          <line x1="58" y1="158" x2="172" y2="158" stroke="#E5A93C" strokeWidth="1.6" />
        </g>

        {/* Sol Alt Koyu Altıgen + Altın Çizgili Altıgen */}
        <g transform="translate(-25, 760)">
          <polygon
            points="130,0 235,60 235,180 130,240 25,180 25,60"
            fill="url(#mod-hex-dark)"
          />
          <polygon
            points="165,-35 255,17 255,121 165,173 75,121 75,17"
            fill="none"
            stroke="#D97706"
            strokeWidth="2.2"
          />
          <polygon
            points="235,155 270,175 270,215 235,235 200,215 200,175"
            fill="#E5A93C"
          />
        </g>
      </svg>
    );
  }

  if (templateId === "royal-gold") {
    // 2. TEKNO: Koyu siber lacivert zemin, parlayan neon mavi (cyan) PCB devre kartı yolları ve merkezde işlemci çerçevesi
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 794 1123"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="tek-cov-bg" cx="50%" cy="46%" r="70%">
            <stop offset="0%" stopColor="#0B2545" />
            <stop offset="55%" stopColor="#061326" />
            <stop offset="100%" stopColor="#020813" />
          </radialGradient>
          <filter id="tek-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <rect width="794" height="1123" fill="url(#tek-cov-bg)" />

        {/* Üstten Merkeze İnen Parlayan Neon PCB Devre Hatları */}
        <g stroke="#00E5FF" strokeWidth="2.2" fill="none" opacity="0.65">
          <polyline points="85,0 85,180 145,240 145,390 220,465" />
          <polyline points="140,0 140,140 195,195 195,310" />
          <polyline points="230,0 230,115 275,160 275,275" />
          <polyline points="315,0 315,170 355,210 355,295" />
          <polyline points="397,0 397,285" />
          <polyline points="480,0 480,170 440,210 440,295" />
          <polyline points="565,0 565,115 520,160 520,275" />
          <polyline points="655,0 655,140 600,195 600,310" />
          <polyline points="710,0 710,180 650,240 650,390 575,465" />
          {/* Yan Devre Hatları */}
          <polyline points="0,360 95,360 145,410 215,410" />
          <polyline points="0,480 110,480 155,525 225,525" />
          <polyline points="0,610 120,610 170,560 225,560" />
          <polyline points="794,360 700,360 650,410 580,410" />
          <polyline points="794,480 685,480 640,525 570,525" />
          <polyline points="794,610 675,610 625,560 570,560" />
          {/* Alttan Merkeze Çıkan PCB Devre Hatları */}
          <polyline points="90,1123 90,920 155,855 155,710 225,640" />
          <polyline points="175,1123 175,940 235,880 235,745" />
          <polyline points="275,1123 275,890 325,840 325,720" />
          <polyline points="365,1123 365,725" />
          <polyline points="430,1123 430,725" />
          <polyline points="520,1123 520,890 470,840 470,720" />
          <polyline points="620,1123 620,940 560,880 560,745" />
          <polyline points="705,1123 705,920 640,855 640,710 570,640" />
        </g>

        {/* Devre Lehim Düğüm Noktaları (Glowing Nodes) */}
        <g fill="#00E5FF" opacity="0.9">
          <circle cx="195" cy="310" r="5" />
          <circle cx="275" cy="275" r="5" />
          <circle cx="355" cy="295" r="4.5" />
          <circle cx="397" cy="285" r="5" />
          <circle cx="440" cy="295" r="4.5" />
          <circle cx="520" cy="275" r="5" />
          <circle cx="600" cy="310" r="5" />
          <circle cx="235" cy="745" r="5" />
          <circle cx="325" cy="720" r="5" />
          <circle cx="365" cy="725" r="4.5" />
          <circle cx="430" cy="725" r="4.5" />
          <circle cx="470" cy="720" r="5" />
          <circle cx="560" cy="745" r="5" />
          <circle cx="145" cy="240" r="4" />
          <circle cx="650" cy="240" r="4" />
          <circle cx="155" cy="855" r="4" />
          <circle cx="640" cy="855" r="4" />
        </g>

        {/* Merkezdeki Parlayan Neon Mikroçip / İşlemci Çerçevesi */}
        {variant === "front" ? (
          <g filter="url(#tek-glow)">
            <rect
              x="195"
              y="315"
              width="404"
              height="390"
              rx="18"
              fill="#041022"
              fillOpacity="0.82"
              stroke="#00E5FF"
              strokeWidth="4"
            />
            <rect
              x="213"
              y="333"
              width="368"
              height="354"
              rx="10"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="1.5"
              opacity="0.55"
            />
          </g>
        ) : (
          <rect
            x="115"
            y="115"
            width="564"
            height="893"
            rx="20"
            fill="#041022"
            fillOpacity="0.78"
            stroke="#00E5FF"
            strokeWidth="3"
          />
        )}
      </svg>
    );
  }

  if (templateId === "noir-gold") {
    // 3. PREMİUM: Krem iç sayfa, üst ve altta siyah & altın V-kalkan bordürler ve klasik süslü ornamentler
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 794 1123"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="prm-cov-cream" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FAF6EC" />
            <stop offset="50%" stopColor="#F5EFE0" />
            <stop offset="100%" stopColor="#EDE4CE" />
          </linearGradient>
          <linearGradient id="prm-cov-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E0E10" />
            <stop offset="50%" stopColor="#1D1B18" />
            <stop offset="100%" stopColor="#0D0D0F" />
          </linearGradient>
          <linearGradient id="prm-cov-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9A6F18" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#FFF3B8" />
            <stop offset="70%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9A6F18" />
          </linearGradient>
        </defs>

        {/* Krem/Fildişi İç Zemin */}
        <rect width="794" height="1123" fill="url(#prm-cov-cream)" />

        {/* İç Sayfa Çift Katmanlı Altın Çerçeve */}
        <rect
          x="36"
          y="36"
          width="722"
          height="1051"
          fill="none"
          stroke="url(#prm-cov-gold)"
          strokeWidth="3"
        />
        <rect
          x="48"
          y="48"
          width="698"
          height="1027"
          fill="none"
          stroke="#C5A03F"
          strokeWidth="1.2"
          opacity="0.7"
        />

        {/* ÜST SİYAH & ALTIN V-KALKAN BORDÜR (Görseldeki PREMİUM kapağı üst kısmı) */}
        <polygon
          points="0,0 794,0 794,175 397,295 0,175"
          fill="#1B1917"
          stroke="url(#prm-cov-gold)"
          strokeWidth="6"
        />
        <polygon
          points="24,0 770,0 770,152 397,266 24,152"
          fill="url(#prm-cov-dark)"
          stroke="url(#prm-cov-gold)"
          strokeWidth="3"
        />
        {/* Üst Kalkan İçi Klasik Altın Filigree (Ornament) */}
        <g transform="translate(297, 68)" stroke="url(#prm-cov-gold)" fill="none">
          <path d="M10,35 C45,5 75,5 100,35 C125,65 155,65 190,35" strokeWidth="2.4" />
          <path d="M35,48 C65,24 135,24 165,48" strokeWidth="1.4" />
          <polygon points="100,14 110,35 100,56 90,35" fill="url(#prm-cov-gold)" />
          <circle cx="58" cy="35" r="4" fill="#FFF3B8" />
          <circle cx="142" cy="35" r="4" fill="#FFF3B8" />
        </g>
        <line
          x1="175"
          y1="145"
          x2="619"
          y2="145"
          stroke="url(#prm-cov-gold)"
          strokeWidth="1.8"
          opacity="0.75"
        />

        {/* ALT SİYAH & ALTIN V-KALKAN BORDÜR */}
        <polygon
          points="0,1123 794,1123 794,955 397,1045 0,955"
          fill="#1B1917"
          stroke="url(#prm-cov-gold)"
          strokeWidth="6"
        />
        <polygon
          points="0,1123 230,1123 0,920"
          fill="url(#prm-cov-dark)"
          stroke="url(#prm-cov-gold)"
          strokeWidth="4"
        />
        <polygon
          points="794,1123 564,1123 794,920"
          fill="url(#prm-cov-dark)"
          stroke="url(#prm-cov-gold)"
          strokeWidth="4"
        />
      </svg>
    );
  }

  if (templateId === "liquid-art") {
    // SOFT: Krem zemin, mat pudra gülü / mauve / adaçayı dalgaları, ince çizgi çerçeve — sade ve zarif
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 794 1123"
        preserveAspectRatio="none"
      >
        <rect width="794" height="1123" fill="#FBF7F4" />

        {/* Üst dalgalar */}
        <path
          d="M0,0 L460,0 C400,130 230,130 150,240 C95,315 45,355 0,380 Z"
          fill="#EBD5D3"
          opacity="0.9"
        />
        <path d="M0,0 L310,0 C255,95 140,115 0,240 Z" fill="#DDBFC0" opacity="0.6" />
        <path
          d="M360,0 L794,0 L794,395 C690,350 675,235 565,175 C465,120 420,60 360,0 Z"
          fill="#D3DFE0"
          opacity="0.85"
        />
        <path d="M530,0 L794,0 L794,250 C695,215 620,120 530,0 Z" fill="#BFCFD2" opacity="0.55" />

        {/* Alt dalgalar */}
        <path
          d="M0,710 C65,765 110,875 215,935 C320,995 390,1055 445,1123 L0,1123 Z"
          fill="#D8CBD3"
          opacity="0.8"
        />
        <path d="M0,845 C95,890 175,980 285,1123 L0,1123 Z" fill="#C9D6D8" opacity="0.7" />
        <path
          d="M794,700 C720,765 695,880 580,950 C475,1015 395,1045 335,1123 L794,1123 Z"
          fill="#EBD5D3"
          opacity="0.85"
        />
        <path d="M794,860 C690,910 615,1010 495,1123 L794,1123 Z" fill="#DDBFC0" opacity="0.55" />

        {/* İnce çizgi çerçeve */}
        <rect
          x="44"
          y="44"
          width="706"
          height="1035"
          fill="none"
          stroke="#B5838D"
          strokeWidth="1.2"
          opacity="0.5"
        />
        <rect
          x="54"
          y="54"
          width="686"
          height="1015"
          fill="none"
          stroke="#B5838D"
          strokeWidth="0.6"
          opacity="0.35"
        />
      </svg>
    );
  }

  if (templateId === "botanical-serenity") {
    // 5. NATURE: Krem-beyaz zemin, çift çizgili ince altın/yeşil çerçeve, dört köşede suluboya botanik yapraklar ve pembe çiçekler
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 794 1123"
        preserveAspectRatio="none"
      >
        <rect width="794" height="1123" fill="#FAFBF7" />

        {/* İnce Çift Çizgili Geometrik İç Çerçeve */}
        <rect
          x="52"
          y="52"
          width="690"
          height="1019"
          fill="none"
          stroke="#84A98C"
          strokeWidth="2.5"
        />
        <rect
          x="64"
          y="64"
          width="666"
          height="995"
          fill="none"
          stroke="#B5945B"
          strokeWidth="1.5"
        />

        {/* SOL ÜST KÖŞE BOTANİK YAPRAKLAR & PEMBE ÇİÇEK */}
        <g transform="translate(20, 18)">
          <path d="M15,195 Q45,85 185,22" stroke="#588157" strokeWidth="2.8" fill="none" />
          <path d="M35,280 Q50,155 115,65" stroke="#3A5A40" strokeWidth="2.2" fill="none" />
          <ellipse cx="48" cy="145" rx="34" ry="14" transform="rotate(-55 48 145)" fill="#588157" opacity="0.9" />
          <ellipse cx="32" cy="215" rx="32" ry="13" transform="rotate(-70 32 215)" fill="#3A5A40" opacity="0.9" />
          <ellipse cx="75" cy="180" rx="28" ry="12" transform="rotate(-35 75 180)" fill="#84A98C" opacity="0.85" />
          <ellipse cx="95" cy="95" rx="34" ry="14" transform="rotate(-40 95 95)" fill="#3A5A40" opacity="0.9" />
          <ellipse cx="145" cy="52" rx="32" ry="13" transform="rotate(-22 145 52)" fill="#588157" opacity="0.88" />
          <ellipse cx="198" cy="36" rx="28" ry="11" transform="rotate(-12 198 36)" fill="#84A98C" opacity="0.85" />
          <ellipse cx="132" cy="92" rx="26" ry="11" transform="rotate(15 132 92)" fill="#A3B18A" opacity="0.85" />
          {/* Sol Üst Pembe Çiçek */}
          <g transform="translate(185, 65)">
            <circle cx="0" cy="-16" r="14" fill="#F4ACB7" />
            <circle cx="15" cy="-5" r="14" fill="#FFCAD4" />
            <circle cx="10" cy="13" r="14" fill="#F4ACB7" />
            <circle cx="-10" cy="13" r="14" fill="#FFCAD4" />
            <circle cx="-15" cy="-5" r="14" fill="#F4ACB7" />
            <circle cx="0" cy="0" r="7" fill="#E5A93C" />
          </g>
        </g>

        {/* SAĞ ÜST KÖŞE BOTANİK YAPRAKLAR & PEMBE ÇİÇEK */}
        <g transform="translate(774, 18) scale(-1, 1)">
          <path d="M15,215 Q45,90 195,22" stroke="#588157" strokeWidth="2.8" fill="none" />
          <ellipse cx="48" cy="150" rx="35" ry="14" transform="rotate(-55 48 150)" fill="#3A5A40" opacity="0.9" />
          <ellipse cx="32" cy="220" rx="32" ry="13" transform="rotate(-70 32 220)" fill="#588157" opacity="0.88" />
          <ellipse cx="78" cy="190" rx="28" ry="12" transform="rotate(-35 78 190)" fill="#84A98C" opacity="0.85" />
          <ellipse cx="95" cy="95" rx="34" ry="14" transform="rotate(-40 95 95)" fill="#588157" opacity="0.9" />
          <ellipse cx="148" cy="52" rx="32" ry="13" transform="rotate(-22 148 52)" fill="#3A5A40" opacity="0.9" />
          <ellipse cx="202" cy="36" rx="28" ry="11" transform="rotate(-12 202 36)" fill="#84A98C" opacity="0.85" />
          {/* Sağ Üst Pembe Çiçek */}
          <g transform="translate(115, 72)">
            <circle cx="0" cy="-18" r="15" fill="#F4ACB7" />
            <circle cx="17" cy="-5" r="15" fill="#FFCAD4" />
            <circle cx="11" cy="14" r="15" fill="#F4ACB7" />
            <circle cx="-11" cy="14" r="15" fill="#FFCAD4" />
            <circle cx="-17" cy="-5" r="15" fill="#F4ACB7" />
            <circle cx="0" cy="0" r="8" fill="#E5A93C" />
          </g>
        </g>

        {/* SOL ALT KÖŞE BOTANİK YAPRAKLAR */}
        <g transform="translate(20, 1105) scale(1, -1)">
          <path d="M15,245 Q55,105 225,22" stroke="#3A5A40" strokeWidth="3" fill="none" />
          <ellipse cx="45" cy="180" rx="36" ry="15" transform="rotate(-60 45 180)" fill="#3A5A40" opacity="0.92" />
          <ellipse cx="75" cy="130" rx="34" ry="14" transform="rotate(-45 75 130)" fill="#588157" opacity="0.9" />
          <ellipse cx="118" cy="85" rx="34" ry="14" transform="rotate(-32 118 85)" fill="#3A5A40" opacity="0.9" />
          <ellipse cx="168" cy="52" rx="32" ry="13" transform="rotate(-20 168 52)" fill="#84A98C" opacity="0.88" />
          <ellipse cx="220" cy="34" rx="28" ry="12" transform="rotate(-10 220 34)" fill="#588157" opacity="0.85" />
          <ellipse cx="95" cy="165" rx="30" ry="12" transform="rotate(-20 95 165)" fill="#A3B18A" opacity="0.85" />
        </g>

        {/* SAĞ ALT KÖŞE BOTANİK YAPRAKLAR & BÜYÜK PEMBE ÇİÇEK */}
        <g transform="translate(774, 1105) scale(-1, -1)">
          <path d="M15,245 Q55,105 225,22" stroke="#3A5A40" strokeWidth="3" fill="none" />
          <ellipse cx="45" cy="180" rx="36" ry="15" transform="rotate(-60 45 180)" fill="#588157" opacity="0.9" />
          <ellipse cx="78" cy="130" rx="34" ry="14" transform="rotate(-45 78 130)" fill="#3A5A40" opacity="0.92" />
          <ellipse cx="122" cy="85" rx="34" ry="14" transform="rotate(-32 122 85)" fill="#588157" opacity="0.9" />
          <ellipse cx="172" cy="52" rx="32" ry="13" transform="rotate(-20 172 52)" fill="#3A5A40" opacity="0.88" />
          <ellipse cx="222" cy="34" rx="28" ry="12" transform="rotate(-10 222 34)" fill="#84A98C" opacity="0.85" />
          {/* Sağ Alt Büyük Pembe Çiçek */}
          <g transform="translate(88, 76)">
            <circle cx="0" cy="-22" r="19" fill="#F4ACB7" />
            <circle cx="21" cy="-7" r="19" fill="#FFCAD4" />
            <circle cx="13" cy="18" r="19" fill="#F4ACB7" />
            <circle cx="-13" cy="18" r="19" fill="#FFCAD4" />
            <circle cx="-21" cy="-7" r="19" fill="#F4ACB7" />
            <circle cx="0" cy="0" r="9.5" fill="#E5A93C" />
          </g>
        </g>
      </svg>
    );
  }

  return null;
}

export function Booklet24Page1Cover({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const visuals = getTemplateVisuals(data.templateId, palette);
  const isCustomTheme = visuals.templateId !== "klinik-minimal";
  const themeColor = getThemeColor(palette, "#0b2938");
  const clinicName = (data.clinicName || "Wise Dental").trim();
  const slogan = data.slogan || data.clinicSlogan || "Every Smile Matters!!";
  const patientName = data.patientName || "John Smith";
  const dateStr = data.dateStr || data.date || "November 2026";
  const planTitle =
    data.planTitle ||
    (data.locale === "ar"
      ? "خطة العلاج الشاملة"
      : data.locale === "ru"
      ? "КОМПЛЕКСНЫЙ ПЛАН ЛЕЧЕНИЯ"
      : data.locale === "en"
      ? "COMPREHENSIVE TREATMENT PLAN"
      : "KİŞİYE ÖZEL TEDAVİ PLANI");

  // Wise Dental tarzı ilk kelime kalın, kalan kelimeler ince tipografi
  const words = clinicName.split(/\s+/);
  const firstWord = words[0] || "Wise";
  const restWords = words.slice(1).join(" ");

  // Temaya göre kapak tipografi ve kart renkleri (içerik/font/boyut sabit)
  const coverStyleByTheme: Record<
    string,
    {
      logoColor: string;
      titlePrimaryColor: string;
      titleSecondaryColor: string;
      sloganColor: string;
      cardBg: string;
      cardBorder: string;
      cardAccent: string;
      cardText: string;
      useDarkShadow: boolean;
    }
  > = {
    "modern-geometric": {
      logoColor: "#D97706",
      titlePrimaryColor: "#0F172A",
      titleSecondaryColor: "#D97706",
      sloganColor: "#475569",
      cardBg: "rgba(15, 23, 42, 0.94)",
      cardBorder: "rgba(229, 169, 60, 0.55)",
      cardAccent: "#FBBF24",
      cardText: "#FFFFFF",
      useDarkShadow: false,
    },
    "royal-gold": {
      logoColor: "#00E5FF",
      titlePrimaryColor: "#00E5FF",
      titleSecondaryColor: "#E0F9FF",
      sloganColor: "#7DD3FC",
      cardBg: "rgba(5, 19, 41, 0.92)",
      cardBorder: "rgba(0, 229, 255, 0.6)",
      cardAccent: "#00E5FF",
      cardText: "#FFFFFF",
      useDarkShadow: true,
    },
    "noir-gold": {
      logoColor: "#B48618",
      titlePrimaryColor: "#18181B",
      titleSecondaryColor: "#9A6F18",
      sloganColor: "#785C12",
      cardBg: "rgba(18, 18, 20, 0.95)",
      cardBorder: "rgba(212, 175, 55, 0.7)",
      cardAccent: "#F5E6B3",
      cardText: "#FFFFFF",
      useDarkShadow: false,
    },
    "liquid-art": {
      logoColor: "#B5838D",
      titlePrimaryColor: "#4A3441",
      titleSecondaryColor: "#9C6F7E",
      sloganColor: "#7A6070",
      cardBg: "rgba(90, 66, 80, 0.93)",
      cardBorder: "rgba(181, 131, 141, 0.55)",
      cardAccent: "#EBD0D0",
      cardText: "#FFFFFF",
      useDarkShadow: false,
    },
    "botanical-serenity": {
      logoColor: "#3A5A40",
      titlePrimaryColor: "#2D4A36",
      titleSecondaryColor: "#588157",
      sloganColor: "#52796F",
      cardBg: "rgba(45, 74, 54, 0.94)",
      cardBorder: "rgba(181, 148, 91, 0.6)",
      cardAccent: "#F4ACB7",
      cardText: "#FFFFFF",
      useDarkShadow: false,
    },
  };

  const activeCoverStyle = isCustomTheme
    ? coverStyleByTheme[visuals.templateId]
    : undefined;

  return (
    <WisePageWrapper
      bgImage={isCustomTheme ? undefined : "/pdf-assets/wise/page_1.jpg"}
      className="flex flex-col justify-between p-0"
    >
      {isCustomTheme && (
        <WiseCoverArtwork templateId={visuals.templateId} variant="front" />
      )}

      {/* Üst Altın Folyo Boşluğu */}
      <div className="h-36" />

      {/* Orta: wise_2.pdf Orijinal Konumunda Diş Logosu, Klinik Adı ve Slogan */}
      <div className="flex flex-col items-center justify-center text-center px-10 select-none z-10 my-auto">
        {data.logoUrl ? (
          <img
            src={data.logoUrl}
            alt={clinicName}
            className={`h-36 object-contain mb-5 ${
              !activeCoverStyle || activeCoverStyle.useDarkShadow
                ? "drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
                : "drop-shadow-sm"
            }`}
          />
        ) : (
          <div
            className={`mb-4 ${
              !activeCoverStyle || activeCoverStyle.useDarkShadow
                ? "drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
                : "drop-shadow-xs"
            }`}
          >
            <WiseToothLogo
              className="size-40 w-40 h-40"
              color={activeCoverStyle ? activeCoverStyle.logoColor : "#E5B94E"}
            />
          </div>
        )}

        <h1
          className={`tracking-tight leading-none mb-3 ${
            !activeCoverStyle || activeCoverStyle.useDarkShadow
              ? "drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              : ""
          }`}
          style={{
            fontSize: clinicName.length > 18 ? "42px" : "56px",
            color: activeCoverStyle
              ? activeCoverStyle.titlePrimaryColor
              : "#E6BC53",
          }}
        >
          <span className="font-black">{firstWord}</span>
          {restWords ? (
            <span
              className="font-extralight ml-2"
              style={{
                color: activeCoverStyle
                  ? activeCoverStyle.titleSecondaryColor
                  : "#E6BC53",
              }}
            >
              {restWords}
            </span>
          ) : null}
        </h1>

        <p
          className="text-[13.5px] font-light tracking-[0.42em]"
          style={{
            color: activeCoverStyle ? activeCoverStyle.sloganColor : "#E8D292",
          }}
        >
          {slogan}
        </p>
      </div>

      {/* Alt: Hasta ve Plan Bilgisi Kartı */}
      <div className="z-20 px-12 pb-20 pt-4 select-none">
        <div
          className="rounded-2xl px-6 py-4 backdrop-blur-md shadow-2xl border text-white flex items-center justify-between"
          style={{
            backgroundColor: activeCoverStyle
              ? activeCoverStyle.cardBg
              : `${themeColor}d9`,
            borderColor: activeCoverStyle
              ? activeCoverStyle.cardBorder
              : "rgba(229, 185, 78, 0.3)",
          }}
        >
          <div>
            <span
              className="text-[9.5px] uppercase tracking-[0.25em] font-bold block mb-0.5"
              style={{
                color: activeCoverStyle
                  ? activeCoverStyle.cardAccent
                  : "#E5B94E",
              }}
            >
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
                ? `${
                    data.locale === "ar"
                      ? "الخطة"
                      : data.locale === "ru"
                      ? "ПЛАН"
                      : "PLAN"
                  } #${data.proposalNo || data.planNo}`
                : data.locale === "ar"
                ? "سري"
                : data.locale === "ru"
                ? "КОНФИДЕНЦИАЛЬНО"
                : "CONFIDENTIAL"}
            </span>
            <span
              className="text-[12px] font-bold block mt-1"
              style={{
                color: activeCoverStyle
                  ? activeCoverStyle.cardAccent
                  : "#E5B94E",
              }}
            >
              {dateStr}
            </span>
          </div>
        </div>
      </div>
    </WisePageWrapper>
  );
}
