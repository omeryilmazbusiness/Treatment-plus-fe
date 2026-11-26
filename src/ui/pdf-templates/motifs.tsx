import React from "react";

interface MotifProps {
  color: string;
  accent?: string;
  className?: string;
  opacity?: number;
}

export function BotanicalBranchTopRight({ color, opacity = 0.16, className = "" }: MotifProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute top-0 right-0 ${className}`}
      style={{ opacity, width: "160px", height: "160px" }}
      aria-hidden="true"
    >
      <path
        d="M230 10C170 30 120 90 90 170M90 170C80 200 65 220 50 230"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Delicate Eucalyptus Leaves */}
      <path
        d="M205 25C195 10 175 15 170 28C165 41 180 50 195 45C210 40 215 32 205 25Z"
        fill={color}
      />
      <path
        d="M165 45C150 35 135 45 132 58C129 71 145 80 158 75C171 70 175 55 165 45Z"
        fill={color}
      />
      <path
        d="M135 85C118 78 105 90 105 104C105 118 120 125 132 118C144 111 146 95 135 85Z"
        fill={color}
      />
      <path
        d="M105 130C90 125 80 138 82 150C84 162 98 168 108 160C118 152 118 138 105 130Z"
        fill={color}
      />
      <path
        d="M75 180C62 178 55 190 58 200C61 210 74 214 82 206C90 198 88 185 75 180Z"
        fill={color}
      />
      {/* Small buds */}
      <circle cx="180" cy="70" r="3" fill={color} />
      <circle cx="145" cy="115" r="3" fill={color} />
      <circle cx="115" cy="155" r="2.5" fill={color} />
    </svg>
  );
}

export function BotanicalBranchBottomLeft({ color, opacity = 0.16, className = "" }: MotifProps) {
  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute bottom-0 left-0 ${className}`}
      style={{ opacity, width: "140px", height: "140px" }}
      aria-hidden="true"
    >
      <path
        d="M10 210C35 150 85 110 160 80"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M25 175C18 162 30 148 42 152C54 156 60 170 52 180C44 190 32 188 25 175Z"
        fill={color}
      />
      <path
        d="M55 140C45 128 60 114 72 120C84 126 88 140 78 150C68 160 58 152 55 140Z"
        fill={color}
      />
      <path
        d="M95 110C85 98 100 86 112 92C124 98 126 112 116 122C106 132 98 122 95 110Z"
        fill={color}
      />
      <circle cx="50" cy="130" r="2.5" fill={color} />
      <circle cx="90" cy="100" r="2.5" fill={color} />
    </svg>
  );
}

export function PediatricBalloons({ color, accent = "#f59e0b", opacity = 0.18, className = "" }: MotifProps) {
  return (
    <svg
      viewBox="0 0 160 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute top-4 right-4 ${className}`}
      style={{ opacity, width: "110px", height: "150px" }}
      aria-hidden="true"
    >
      {/* Balloon 1 */}
      <path
        d="M60 20C40 20 28 36 28 56C28 78 48 94 60 98C72 94 92 78 92 56C92 36 80 20 60 20Z"
        fill={color}
      />
      <polygon points="56,98 64,98 60,104" fill={color} />
      <path d="M60 104C55 125 70 145 62 175" stroke={color} strokeWidth="1.2" strokeDasharray="2 2" />

      {/* Balloon 2 */}
      <path
        d="M105 45C90 45 80 58 80 74C80 92 95 106 105 110C115 106 130 92 130 74C130 58 120 45 105 45Z"
        fill={accent}
      />
      <polygon points="102,110 108,110 105,115" fill={accent} />
      <path d="M105 115C108 135 92 155 96 185" stroke={accent} strokeWidth="1.2" strokeDasharray="2 2" />

      {/* Soft Cloud */}
      <path
        d="M20 180C14 180 10 184 10 189C10 194 14 198 20 198H55C60 198 64 194 64 189C64 185 61 181 57 180C57 175 52 171 47 171C44 171 41 172 39 174C37 170 32 167 27 167C21 167 17 171 16 176C14 177 13 178 13 180H20Z"
        fill={color}
        opacity="0.6"
      />
      {/* Mini Twinkling Stars */}
      <path d="M125 18L127 24L133 26L127 28L125 34L123 28L117 26L123 24Z" fill={accent} />
      <path d="M22 65L23.5 69.5L28 71L23.5 72.5L22 77L20.5 72.5L16 71L20.5 69.5Z" fill={color} />
      <path d="M135 130L136.5 134L140 135.5L136.5 137L135 141L133.5 137L130 135.5L133.5 134Z" fill={accent} />
    </svg>
  );
}

export function PrestigeWatermark({ color, opacity = 0.04 }: MotifProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ opacity, width: "380px", height: "380px" }}
      aria-hidden="true"
    >
      {/* Geometric Luxury Tooth Silhouette */}
      <path
        d="M200 40C250 40 290 65 310 110C325 145 320 200 290 260C270 300 260 350 250 365C240 380 220 375 210 330C205 310 200 295 195 295C190 295 185 310 180 330C170 375 150 380 140 365C130 350 120 300 100 260C70 200 65 145 80 110C100 65 140 40 200 40Z"
        stroke={color}
        strokeWidth="3"
        strokeDasharray="6 4"
      />
      {/* Concentric Modern Rings */}
      <circle cx="200" cy="200" r="160" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="200" cy="200" r="185" stroke={color} strokeWidth="0.8" />
      {/* Cardinal Diamond Accents */}
      <polygon points="200,20 205,30 200,40 195,30" fill={color} />
      <polygon points="200,360 205,370 200,380 195,370" fill={color} />
      <polygon points="20,200 30,205 40,200 30,195" fill={color} />
      <polygon points="360,200 370,205 380,200 370,195" fill={color} />
    </svg>
  );
}

export function PrestigeCornerBrackets({ color, opacity = 0.4 }: MotifProps) {
  return (
    <div className="pointer-events-none select-none absolute inset-4" style={{ opacity }} aria-hidden="true">
      {/* Top Left */}
      <div className="absolute top-0 left-0 size-6 border-t-2 border-l-2" style={{ borderColor: color }} />
      {/* Top Right */}
      <div className="absolute top-0 right-0 size-6 border-t-2 border-r-2" style={{ borderColor: color }} />
      {/* Bottom Left */}
      <div className="absolute bottom-0 left-0 size-6 border-b-2 border-l-2" style={{ borderColor: color }} />
      {/* Bottom Right */}
      <div className="absolute bottom-0 right-0 size-6 border-b-2 border-r-2" style={{ borderColor: color }} />
    </div>
  );
}

// ============================================================================
// YENİ ŞABLON MOTİFLERİ (Örnek 1 - Modern Geometrik)
// ============================================================================

export function ModernGeometricShardsTopRight({
  primary = "#0B2570",
  cyan = "#00A3FF",
  opacity = 0.95,
  className = "",
}: {
  primary?: string;
  cyan?: string;
  opacity?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute top-0 right-0 ${className}`}
      style={{ opacity, width: "220px", height: "220px" }}
      aria-hidden="true"
    >
      {/* Dark Royal Blue Main Shard */}
      <polygon points="120,0 320,0 320,200 240,240 180,140" fill={primary} />
      {/* Layered Cyan Accent Shards */}
      <polygon points="170,0 260,0 120,170 80,130" fill={cyan} opacity="0.85" />
      <polygon points="270,120 320,80 320,260 250,290" fill={primary} opacity="0.9" />
      <polygon points="160,180 230,120 250,150 190,210" fill={cyan} opacity="0.65" />
      {/* Floating Speed Lines */}
      <line x1="80" y1="20" x2="160" y2="120" stroke={cyan} strokeWidth="2" strokeLinecap="round" />
      <line x1="140" y1="170" x2="190" y2="230" stroke={primary} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="280" y1="270" x2="310" y2="310" stroke={cyan} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ModernGeometricShardsBottomLeft({
  primary = "#0B2570",
  cyan = "#00A3FF",
  opacity = 0.95,
  className = "",
}: {
  primary?: string;
  cyan?: string;
  opacity?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute bottom-0 left-0 ${className}`}
      style={{ opacity, width: "220px", height: "220px" }}
      aria-hidden="true"
    >
      {/* Deep Blue Bottom-Left Shards */}
      <polygon points="0,120 0,320 200,320 240,240 140,180" fill={primary} />
      <polygon points="0,170 0,260 170,120 130,80" fill={cyan} opacity="0.85" />
      <polygon points="120,270 80,320 260,320 290,250" fill={primary} opacity="0.9" />
      <polygon points="180,160 120,230 150,250 210,190" fill={cyan} opacity="0.65" />
      {/* Floating Speed Lines */}
      <line x1="20" y1="80" x2="120" y2="160" stroke={cyan} strokeWidth="2" strokeLinecap="round" />
      <line x1="170" y1="140" x2="230" y2="190" stroke={primary} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="270" y1="280" x2="310" y2="310" stroke={cyan} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ModernGeometricSineWaves({
  color = "#00A3FF",
  opacity = 0.14,
  className = "",
}: {
  color?: string;
  opacity?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute inset-0 size-full ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <path
        d="M-50 350C150 220 300 480 500 320C700 160 850 420 950 300"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M-50 370C150 240 300 500 500 340C700 180 850 440 950 320"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M-50 390C150 260 300 520 500 360C700 200 850 460 950 340"
        stroke={color}
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M-50 410C150 280 300 540 500 380C700 220 850 480 950 360"
        stroke={color}
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================================
// YENİ ŞABLON MOTİFLERİ (Örnek 2 - Botanik Zarafet)
// ============================================================================

export function BotanicalDoubleFrame({
  color = "#5F7161",
  opacity = 0.55,
}: {
  color?: string;
  opacity?: number;
}) {
  return (
    <div
      className="pointer-events-none select-none absolute inset-7 rounded-xs border"
      style={{ borderColor: color, opacity }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-2 rounded-2xs border"
        style={{ borderColor: color, opacity: 0.65 }}
      />
    </div>
  );
}

export function BotanicalBranchTopLeft({
  color = "#4A584C",
  opacity = 0.9,
  className = "",
}: {
  color?: string;
  opacity?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute top-4 left-4 ${className}`}
      style={{ opacity, width: "160px", height: "160px" }}
      aria-hidden="true"
    >
      <path
        d="M10 10C55 38 120 75 175 155"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Eucalyptus & Olive Leaves in Watercolor tones (Nature.pdf) */}
      <path d="M25 22C38 12 52 24 48 38C44 52 28 48 22 36C18 28 20 24 25 22Z" fill="#5F7161" />
      <path d="M50 45C68 36 80 50 74 65C68 80 52 74 46 60C42 50 46 44 50 45Z" fill="#708A74" />
      <path d="M85 75C102 68 112 84 105 98C98 112 82 105 76 92C72 82 78 76 85 75Z" fill="#5F7161" />
      <path d="M120 110C136 104 146 118 138 132C130 144 116 138 110 126C106 118 112 112 120 110Z" fill="#889E8A" />
      <path d="M150 145C165 138 175 152 168 165C160 178 145 170 140 158C136 150 142 145 150 145Z" fill="#5F7161" />
      {/* Little olive berries */}
      <ellipse cx="68" cy="40" rx="3" ry="4" fill="#3D4A3E" transform="rotate(20 68 40)" />
      <ellipse cx="102" cy="72" rx="3" ry="4" fill="#3D4A3E" transform="rotate(15 102 72)" />
      <ellipse cx="135" cy="108" rx="3" ry="4" fill="#3D4A3E" transform="rotate(25 135 108)" />
    </svg>
  );
}

export function BotanicalBranchBottomRight({
  color = "#4A584C",
  opacity = 0.9,
  className = "",
}: {
  color?: string;
  opacity?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute bottom-4 right-4 ${className}`}
      style={{ opacity, width: "160px", height: "160px" }}
      aria-hidden="true"
    >
      <path
        d="M230 230C185 200 120 160 65 75"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M215 218C202 228 188 216 192 202C196 188 212 192 218 204C222 212 220 216 215 218Z" fill="#5F7161" />
      <path d="M190 195C172 204 160 190 166 175C172 160 188 166 194 180C198 190 194 196 190 195Z" fill="#708A74" />
      <path d="M155 165C138 172 128 156 135 142C142 128 158 135 164 148C168 158 162 164 155 165Z" fill="#5F7161" />
      <path d="M120 130C104 136 94 122 102 108C110 96 124 102 130 114C134 122 128 128 120 130Z" fill="#889E8A" />
      <path d="M85 95C70 100 62 86 68 74C75 62 88 68 94 80C97 88 92 94 85 95Z" fill="#5F7161" />
      <ellipse cx="172" cy="200" rx="3" ry="4" fill="#3D4A3E" transform="rotate(-20 172 200)" />
      <ellipse cx="138" cy="168" rx="3" ry="4" fill="#3D4A3E" transform="rotate(-15 138 168)" />
      <ellipse cx="105" cy="132" rx="3" ry="4" fill="#3D4A3E" transform="rotate(-25 105 132)" />
    </svg>
  );
}

// ============================================================================
// YENİ ŞABLON MOTİFLERİ (Örnek 3 - Akışkan Sanat & Prestij)
// ============================================================================

export function LiquidWaveHeader({
  primary = "#0B2570",
  cyan = "#00A3FF",
  className = "",
}: {
  primary?: string;
  cyan?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 600 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute top-0 left-0 ${className}`}
      style={{ width: "380px", height: "105px" }}
      aria-hidden="true"
    >
      {/* Cyan Accent Wave Underneath (techno_p2.png) */}
      <path
        d="M0 0H380C310 35 230 100 140 100C75 100 25 60 0 45V0Z"
        fill={cyan}
        opacity="0.45"
      />
      {/* Deep Royal Navy Sweeping Top-Left Wave */}
      <path
        d="M0 0H330C250 40 185 85 110 85C55 85 18 50 0 35V0Z"
        fill={primary}
      />
    </svg>
  );
}

export function LiquidWaveFooter({
  primary = "#0B2570",
  cyan = "#00A3FF",
  className = "",
}: {
  primary?: string;
  cyan?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 600 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute bottom-0 right-0 ${className}`}
      style={{ width: "380px", height: "105px" }}
      aria-hidden="true"
    >
      {/* Cyan Accent Wave (techno_p2.png) */}
      <path
        d="M600 160H220C290 125 370 60 460 60C525 60 575 100 600 115V160Z"
        fill={cyan}
        opacity="0.45"
      />
      {/* Deep Royal Navy Sweeping Bottom-Right Wave */}
      <path
        d="M600 160H270C350 120 415 75 490 75C545 75 582 110 600 125V160Z"
        fill={primary}
      />
    </svg>
  );
}

// ============================================================================
// YENİ ŞABLON MOTİFLERİ (Örnek 4 - Noir & Altın Prestij)
// ============================================================================

export function NoirGoldDiagonalTopLeft({
  gold = "#F5C842",
  className = "",
}: {
  gold?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute top-0 left-0 ${className}`}
      style={{ width: "160px", height: "160px" }}
      aria-hidden="true"
    >
      {/* Heavy Gold Diagonal Slash */}
      <polygon points="0,0 140,0 0,140" fill={gold} />
      {/* Thin Gold Laser Lines */}
      <line x1="0" y1="165" x2="165" y2="0" stroke={gold} strokeWidth="3" />
      <line x1="0" y1="185" x2="185" y2="0" stroke={gold} strokeWidth="1.5" />
      <line x1="0" y1="205" x2="205" y2="0" stroke={gold} strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  );
}

export function NoirGoldDiagonalBottomRight({
  gold = "#F5C842",
  className = "",
}: {
  gold?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute bottom-0 right-0 ${className}`}
      style={{ width: "160px", height: "160px" }}
      aria-hidden="true"
    >
      <polygon points="240,240 100,240 240,100" fill={gold} />
      <line x1="240" y1="75" x2="75" y2="240" stroke={gold} strokeWidth="3" />
      <line x1="240" y1="55" x2="55" y2="240" stroke={gold} strokeWidth="1.5" />
      <line x1="240" y1="35" x2="35" y2="240" stroke={gold} strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  );
}

export function NoirGoldFrame({
  gold = "#F5C842",
  opacity = 0.5,
}: {
  gold?: string;
  opacity?: number;
}) {
  return (
    <div
      className="pointer-events-none select-none absolute inset-4 border"
      style={{ borderColor: gold, opacity }}
      aria-hidden="true"
    >
      {/* Corner Accents */}
      <div className="absolute -top-1 -left-1 size-2 bg-amber-400" />
      <div className="absolute -top-1 -right-1 size-2 bg-amber-400" />
      <div className="absolute -bottom-1 -left-1 size-2 bg-amber-400" />
      <div className="absolute -bottom-1 -right-1 size-2 bg-amber-400" />
    </div>
  );
}

export function DoctorSignature({
  doctorName = "Sorumlu Hekim",
  signerTitle = "Klinik Direktörü",
  primaryColor,
  accentColor,
}: {
  doctorName?: string;
  signerTitle?: string;
  primaryColor: string;
  accentColor: string;
}) {
  return (
    <div className="flex flex-col items-end text-right">
      <div className="relative mb-1 flex items-center justify-end">
        {/* Cursive Handwriting Signature */}
        <span
          className="select-none text-2xl font-normal tracking-wide transition-all"
          style={{
            fontFamily: "'Dancing Script', 'Caveat', cursive",
            color: primaryColor,
            transform: "rotate(-4deg)",
            textShadow: "0 0.5px 1px rgba(0,0,0,0.05)",
          }}
        >
          {doctorName || "Dr. Med."}
        </span>
      </div>
      <div className="w-28 border-b border-dashed border-slate-300 pb-1" />
      <p className="mt-1 text-[11px] font-bold text-slate-800">{doctorName}</p>
      <p className="text-[10px] text-slate-500">{signerTitle}</p>
      <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-400">
        <span
          className="inline-block size-1.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <span>Elektronik Kaşe & İmza</span>
      </div>
    </div>
  );
}

export const DoctorSignatureStamp = DoctorSignature;

// ============================================================================
// YENİ ŞABLON MOTİFLERİ: KRALİYET & ALTIN IŞILTI (Royal Gold & Sapphire)
// ============================================================================

export function RoyalGoldDoubleFrame({
  opacity = 0.65,
  className = "",
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none select-none absolute inset-3.5 z-0 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Dış İnce Altın Çerçeve */}
      <div className="absolute inset-0 border border-[#D4AF37]/55" />
      {/* İç İnce Altın Çerçeve */}
      <div className="absolute inset-1.5 border border-[#D4AF37]/35" />

      {/* Köşe Barok Pırlanta Vurguları */}
      <span className="absolute -top-1 -left-1 text-[10px] text-[#D4AF37] leading-none select-none">✦</span>
      <span className="absolute -top-1 -right-1 text-[10px] text-[#D4AF37] leading-none select-none">✦</span>
      <span className="absolute -bottom-1 -left-1 text-[10px] text-[#D4AF37] leading-none select-none">✦</span>
      <span className="absolute -bottom-1 -right-1 text-[10px] text-[#D4AF37] leading-none select-none">✦</span>
    </div>
  );
}

export function RoyalGoldRibbonTopRight({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute top-0 right-0 z-10 ${className}`}
      style={{ width: "230px", height: "158px" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rgSapphire1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#001845" />
          <stop offset="50%" stopColor="#022B69" />
          <stop offset="100%" stopColor="#0447A8" />
        </linearGradient>
        <linearGradient id="rgGoldRibbon" x1="0" y1="0" x2="1" y2="0.8">
          <stop offset="0%" stopColor="#AA771C" />
          <stop offset="25%" stopColor="#FFF2B2" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="80%" stopColor="#96660E" />
          <stop offset="100%" stopColor="#FBE790" />
        </linearGradient>
        <linearGradient id="rgGoldEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#875A08" />
        </linearGradient>
      </defs>

      {/* Safir Mavi Köşe Geometrik Şerit (media_1795647708025_1d2dcc88.jpg) */}
      <polygon
        points="140,0 320,0 320,180 230,90 190,45"
        fill="url(#rgSapphire1)"
      />
      {/* Safir Üstü Altın Eğimli Kenar Çizgileri */}
      <polyline
        points="140,0 190,45 230,90 320,180"
        stroke="url(#rgGoldEdge)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="180"
        y1="0"
        x2="320"
        y2="140"
        stroke="#FFF2B2"
        strokeWidth="1.2"
        opacity="0.8"
      />

      {/* Akışkan 3D Altın Dalgalı Kurdele */}
      <path
        d="M20,12 C100,-8 170,55 245,28 C280,15 305,22 320,25 L320,48 C295,40 265,35 235,52 C160,95 95,30 20,40 Z"
        fill="url(#rgGoldRibbon)"
        opacity="0.95"
      />
      <path
        d="M20,12 C100,-8 170,55 245,28 C280,15 305,22 320,25"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity="0.9"
      />

      {/* Parlayan 4 Köşeli Elmas Yıldız (✦ Flare) */}
      <g transform="translate(260, 68)">
        <ellipse cx="0" cy="0" rx="14" ry="2" fill="#FFFFFF" opacity="0.8" />
        <ellipse cx="0" cy="0" rx="2" ry="14" fill="#FFFFFF" opacity="0.8" />
        <circle cx="0" cy="0" r="3.5" fill="#FFF8DC" />
        <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#FFF2B2" />
      </g>
      <g transform="translate(205, 36) scale(0.65)">
        <polygon points="0,-10 2.5,-2.5 10,0 2.5,2.5 0,10 -2.5,2.5 -10,0 -2.5,-2.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function RoyalGoldRibbonBottomLeft({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute bottom-0 left-0 z-10 ${className}`}
      style={{ width: "230px", height: "158px" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rgSapphire2" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#001845" />
          <stop offset="50%" stopColor="#022B69" />
          <stop offset="100%" stopColor="#0447A8" />
        </linearGradient>
        <linearGradient id="rgGoldRibbon2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#AA771C" />
          <stop offset="30%" stopColor="#FFF2B2" />
          <stop offset="60%" stopColor="#D4AF37" />
          <stop offset="85%" stopColor="#96660E" />
          <stop offset="100%" stopColor="#FBE790" />
        </linearGradient>
      </defs>

      {/* Safir Mavi Köşe Geometrik Şerit (media_1795647708025_1d2dcc88.jpg) */}
      <polygon
        points="0,40 0,220 180,220 90,130 45,90"
        fill="url(#rgSapphire2)"
      />
      {/* Safir Üstü Altın Eğimli Kenar Çizgisi */}
      <polyline
        points="0,40 45,90 90,130 180,220"
        stroke="#D4AF37"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="0"
        y1="80"
        x2="140"
        y2="220"
        stroke="#FFF2B2"
        strokeWidth="1.2"
        opacity="0.8"
      />

      {/* Akışkan 3D Altın Dalgalı Kurdele (Alt Kenar Boyunca) */}
      <path
        d="M0,195 C60,185 120,215 190,185 C240,165 285,185 315,200 L315,220 L0,220 Z"
        fill="url(#rgGoldRibbon2)"
        opacity="0.95"
      />
      <path
        d="M0,195 C60,185 120,215 190,185 C240,165 285,185 315,200"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity="0.9"
      />

      {/* Parlayan 4 Köşeli Elmas Yıldız (✦ Flare) */}
      <g transform="translate(62, 145)">
        <ellipse cx="0" cy="0" rx="14" ry="2" fill="#FFFFFF" opacity="0.8" />
        <ellipse cx="0" cy="0" rx="2" ry="14" fill="#FFFFFF" opacity="0.8" />
        <circle cx="0" cy="0" r="3.5" fill="#FFF8DC" />
        <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#FFF2B2" />
      </g>
      <g transform="translate(125, 185) scale(0.65)">
        <polygon points="0,-10 2.5,-2.5 10,0 2.5,2.5 0,10 -2.5,2.5 -10,0 -2.5,-2.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function RoyalGoldCoverSparkles({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 794 1123"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute inset-0 size-full z-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="covGoldDust" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#FFF2B2" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#AA771C" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="covLineGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#FCE082" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#96660E" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Sinüzoidal İnce Altın Dalgaları (media_1795647653190_c1b9214a.jpg sol ve sağ kavisler) */}
      <path
        d="M-50,150 C120,80 180,320 60,600 C-40,840 80,1020 0,1150"
        stroke="url(#covLineGrad)"
        strokeWidth="1.2"
      />
      <path
        d="M-30,120 C140,50 200,300 80,580 C-20,820 100,1000 20,1150"
        stroke="url(#covLineGrad)"
        strokeWidth="0.8"
      />
      <path
        d="M-10,90 C160,20 220,280 100,560 C0,800 120,980 40,1150"
        stroke="url(#covLineGrad)"
        strokeWidth="0.6"
      />

      <path
        d="M840,100 C680,240 600,450 720,700 C820,900 700,1050 780,1150"
        stroke="url(#covLineGrad)"
        strokeWidth="1.2"
      />
      <path
        d="M820,80 C660,220 580,430 700,680 C800,880 680,1030 760,1150"
        stroke="url(#covLineGrad)"
        strokeWidth="0.8"
      />
      <path
        d="M800,60 C640,200 560,410 680,660 C780,860 660,1010 740,1150"
        stroke="url(#covLineGrad)"
        strokeWidth="0.6"
      />

      {/* Üst Kısım Parlayan Altın Tozu Dalgası (Curved Stardust Band) */}
      <path
        d="M200,0 C320,60 520,100 794,20 L794,80 C500,160 300,100 180,30 Z"
        fill="url(#covGoldDust)"
        opacity="0.18"
      />

      {/* Alt Kısım Parlayan Altın Tozu Dalgası */}
      <path
        d="M0,1060 C240,1010 480,1080 794,1030 L794,1100 C460,1150 220,1080 0,1123 Z"
        fill="url(#covGoldDust)"
        opacity="0.18"
      />

      {/* Çeşitli Parlayan 4 Köşeli Altın Yıldızlar (✦) */}
      {/* Sol Üst Yıldız Grubu */}
      <g transform="translate(180, 220)">
        <polygon points="0,-24 5,-6 24,0 5,6 0,24 -5,6 -24,0 -5,-6" fill="#FFF2B2" />
        <ellipse cx="0" cy="0" rx="30" ry="2" fill="#FFFFFF" opacity="0.6" />
        <ellipse cx="0" cy="0" rx="2" ry="30" fill="#FFFFFF" opacity="0.6" />
        <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
      </g>
      <g transform="translate(130, 240) scale(0.6)">
        <polygon points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" fill="#FCE082" />
      </g>
      <g transform="translate(180, 290) scale(0.45)">
        <polygon points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" fill="#FFFFFF" />
      </g>
      <g transform="translate(260, 160) scale(0.55)">
        <polygon points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" fill="#FCE082" />
      </g>

      {/* Sağ Alt Yıldız Grubu */}
      <g transform="translate(600, 880)">
        <polygon points="0,-26 6,-6 26,0 6,6 0,26 -6,6 -26,0 -6,-6" fill="#FFF2B2" />
        <ellipse cx="0" cy="0" rx="32" ry="2" fill="#FFFFFF" opacity="0.6" />
        <ellipse cx="0" cy="0" rx="2" ry="32" fill="#FFFFFF" opacity="0.6" />
        <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" />
      </g>
      <g transform="translate(650, 840) scale(0.65)">
        <polygon points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" fill="#FCE082" />
      </g>
      <g transform="translate(540, 920) scale(0.45)">
        <polygon points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" fill="#FFFFFF" />
      </g>
      <g transform="translate(670, 920) scale(0.5)">
        <polygon points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" fill="#FCE082" />
      </g>

      {/* Işıltılı Altın Tozu Zerrecikleri (Stardust Particles) */}
      <circle cx="150" cy="180" r="1.5" fill="#FFF2B2" opacity="0.9" />
      <circle cx="210" cy="190" r="2.5" fill="#D4AF37" opacity="0.8" />
      <circle cx="160" cy="270" r="1.8" fill="#FFF2B2" opacity="0.7" />
      <circle cx="230" cy="240" r="1.2" fill="#FFFFFF" opacity="0.9" />
      <circle cx="280" cy="190" r="2" fill="#D4AF37" opacity="0.75" />
      <circle cx="580" cy="830" r="2" fill="#FFF2B2" opacity="0.8" />
      <circle cx="630" cy="940" r="2.5" fill="#D4AF37" opacity="0.85" />
      <circle cx="560" cy="870" r="1.5" fill="#FFFFFF" opacity="0.9" />
      <circle cx="670" cy="870" r="1.8" fill="#FFF2B2" opacity="0.7" />
      <circle cx="520" cy="940" r="2" fill="#D4AF37" opacity="0.6" />
    </svg>
  );
}

