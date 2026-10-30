/**
 * Helper to encode raw SVG string to valid Data URL without broken hash (#) fragments
 */
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

/**
 * Ultra-high-fidelity SVG Panoramic Dental Radiograph (OPG).
 * Renders anatomical mandible, maxilla, alveolar bone trabeculae, maxillary sinuses,
 * and adult dentition (roots, pulp canals, enamel borders) in classic radiopaque/radiolucent grayscale.
 */
export const DEFAULT_PANORAMIC_XRAY_SVG = svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 520" width="1000" height="520">
  <defs>
    <!-- Background radiograph darkness gradient -->
    <radialGradient id="bg-glow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#141a22"/>
      <stop offset="60%" stop-color="#090d12"/>
      <stop offset="100%" stop-color="#030508"/>
    </radialGradient>

    <!-- Bone trabecular noise & radiopacity -->
    <linearGradient id="bone-density" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155" stop-opacity="0.3"/>
      <stop offset="40%" stop-color="#64748b" stop-opacity="0.5"/>
      <stop offset="70%" stop-color="#94a3b8" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#475569" stop-opacity="0.4"/>
    </linearGradient>

    <!-- Enamel & dentin radiopacity -->
    <linearGradient id="enamel-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1" stop-opacity="0.75"/>
      <stop offset="50%" stop-color="#f8fafc" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.85"/>
    </linearGradient>

    <!-- Metal restoration high radiopacity (Amalgam / Implant) -->
    <linearGradient id="metal-radiopaque" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>

    <!-- Filter for radiographic blur/scatter -->
    <filter id="xray-scatter" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="1.2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Radiograph Film Base -->
  <rect width="1000" height="520" fill="url(#bg-glow)"/>

  <!-- Cervical Spine Artifact (Left & Right Ghost Images) -->
  <path d="M120 180 C110 260 110 380 130 460" stroke="#334155" stroke-width="32" stroke-linecap="round" opacity="0.35" filter="url(#xray-scatter)"/>
  <path d="M880 180 C890 260 890 380 870 460" stroke="#334155" stroke-width="32" stroke-linecap="round" opacity="0.35" filter="url(#xray-scatter)"/>

  <!-- Maxillary Sinuses (Radiolucent dark air cavities) -->
  <ellipse cx="320" cy="210" rx="95" ry="45" fill="#090d14" stroke="#475569" stroke-width="2" opacity="0.85"/>
  <ellipse cx="680" cy="210" rx="95" ry="45" fill="#090d14" stroke="#475569" stroke-width="2" opacity="0.85"/>

  <!-- Nasal Cavity & Septum -->
  <path d="M470 140 C465 190 475 220 485 240 L515 240 C525 220 535 190 530 140 Z" fill="#0b0f17" stroke="#475569" stroke-width="2" opacity="0.9"/>
  <line x1="500" y1="130" x2="500" y2="245" stroke="#94a3b8" stroke-width="3" opacity="0.6"/>

  <!-- Mandible Lower Jaw Bone Outline (Horseshoe radiographic contour) -->
  <path d="M160 320 C180 430 320 480 500 485 C680 480 820 430 840 320 C820 410 680 460 500 465 C320 460 180 410 160 320 Z" fill="url(#bone-density)" filter="url(#xray-scatter)"/>
  <path d="M140 260 L160 380 Q220 470 500 480 Q780 470 840 380 L860 260" fill="none" stroke="#64748b" stroke-width="4" opacity="0.7"/>

  <!-- Mandibular Canal (Inferior Alveolar Nerve Canal - Left & Right) -->
  <path d="M210 350 Q310 415 410 415" fill="none" stroke="#090d14" stroke-width="5" opacity="0.8"/>
  <path d="M790 350 Q690 415 590 415" fill="none" stroke="#090d14" stroke-width="5" opacity="0.8"/>
  <circle cx="390" cy="415" r="4.5" fill="#070a0e" stroke="#475569" stroke-width="1.5"/>
  <circle cx="610" cy="415" r="4.5" fill="#070a0e" stroke="#475569" stroke-width="1.5"/>

  <!-- ================= DENTAL ARCH: UPPER TEETH (18 to 28) ================= -->
  <!-- Upper Right Molars & Premolars (18-14) -->
  <g filter="url(#xray-scatter)">
    <!-- 18 Third Molar (Wisdom) -->
    <path d="M210 240 Q215 200 220 250 L228 275 L202 275 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <!-- 17 Second Molar -->
    <path d="M245 240 Q250 190 260 250 L268 280 L240 280 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <!-- 16 First Molar (With metallic restoration highlight!) -->
    <path d="M285 240 Q295 190 305 250 L315 285 L280 285 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="286" y="272" width="26" height="12" rx="2" fill="url(#metal-radiopaque)" opacity="0.95"/>
    <!-- 15 Premolar -->
    <path d="M330 245 Q335 195 342 250 L348 285 L328 285 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <!-- 14 Premolar -->
    <path d="M365 248 Q370 200 375 250 L382 288 L362 288 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>

    <!-- Upper Anteriors (13 to 23) -->
    <!-- 13 Canine (Long Root) -->
    <path d="M400 240 Q405 175 412 252 L418 295 L398 295 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1"/>
    <!-- 12 Lateral Incisor -->
    <path d="M432 245 Q436 190 440 254 L447 298 L430 298 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1"/>
    <!-- 11 Central Incisor -->
    <path d="M465 245 Q470 185 475 255 L485 300 L462 300 Z" fill="url(#enamel-grad)" stroke="#f8fafc" stroke-width="1.2"/>
    <!-- 21 Central Incisor -->
    <path d="M535 245 Q530 185 525 255 L515 300 L538 300 Z" fill="url(#enamel-grad)" stroke="#f8fafc" stroke-width="1.2"/>
    <!-- 22 Lateral Incisor -->
    <path d="M568 245 Q564 190 560 254 L553 298 L570 298 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1"/>
    <!-- 23 Canine (Long Root) -->
    <path d="M600 240 Q595 175 588 252 L582 295 L602 295 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1"/>

    <!-- Upper Left Premolars & Molars (24-28) -->
    <!-- 24 Premolar -->
    <path d="M635 248 Q630 200 625 250 L618 288 L638 288 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <!-- 25 Premolar -->
    <path d="M670 245 Q665 195 658 250 L652 285 L672 285 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <!-- 26 First Molar -->
    <path d="M715 240 Q705 190 695 250 L685 285 L720 285 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1.2"/>
    <!-- 27 Second Molar -->
    <path d="M755 240 Q750 190 740 250 L732 280 L760 280 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <!-- 28 Third Molar -->
    <path d="M790 240 Q785 200 780 250 L772 275 L798 275 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
  </g>

  <!-- ================= DENTAL ARCH: LOWER TEETH (48 to 38) ================= -->
  <g filter="url(#xray-scatter)">
    <!-- Lower Right (48 to 44) -->
    <path d="M215 365 Q218 420 225 360 L230 310 L205 310 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <path d="M250 365 Q255 425 262 360 L270 310 L242 310 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <!-- 46 First Molar (Endodontic canal treatment filling!) -->
    <path d="M290 365 Q298 435 308 360 L318 308 L282 308 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1.2"/>
    <line x1="295" y1="315" x2="295" y2="420" stroke="#ffffff" stroke-width="2.5" opacity="0.95"/>
    <line x1="305" y1="315" x2="305" y2="420" stroke="#ffffff" stroke-width="2.5" opacity="0.95"/>

    <path d="M335 360 Q340 420 345 358 L350 312 L330 312 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <path d="M370 360 Q374 420 378 358 L384 314 L365 314 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>

    <!-- Lower Anteriors (43 to 33) -->
    <path d="M405 365 Q409 435 415 358 L420 315 L400 315 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1"/>
    <path d="M435 365 Q438 425 442 358 L448 318 L430 318 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1"/>
    <path d="M468 365 Q470 420 474 358 L482 320 L464 320 Z" fill="url(#enamel-grad)" stroke="#f8fafc" stroke-width="1.2"/>
    <path d="M532 365 Q530 420 526 358 L518 320 L536 320 Z" fill="url(#enamel-grad)" stroke="#f8fafc" stroke-width="1.2"/>
    <path d="M565 365 Q562 425 558 358 L552 318 L570 318 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1"/>
    <path d="M595 365 Q591 435 585 358 L580 315 L600 315 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1"/>

    <!-- Lower Left (34 to 38) -->
    <path d="M630 360 Q626 420 622 358 L616 314 L635 314 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <path d="M665 360 Q660 420 655 358 L650 312 L670 312 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <path d="M710 365 Q702 435 692 360 L682 308 L718 308 Z" fill="url(#enamel-grad)" stroke="#cbd5e1" stroke-width="1.2"/>
    <path d="M750 365 Q745 425 738 360 L730 310 L758 310 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
    <path d="M785 365 Q782 420 775 360 L770 310 L795 310 Z" fill="url(#enamel-grad)" stroke="#94a3b8" stroke-width="1"/>
  </g>

  <!-- OPG Anatomical Markers: R (Right) & L (Left) -->
  <text x="50" y="70" font-family="sans-serif" font-size="28" font-weight="900" fill="#64748b" opacity="0.65">R</text>
  <text x="930" y="70" font-family="sans-serif" font-size="28" font-weight="900" fill="#64748b" opacity="0.65">L</text>

  <!-- Dental Clinic Calibration Scale -->
  <g transform="translate(420, 495)" stroke="#64748b" stroke-width="1" opacity="0.7">
    <line x1="0" y1="0" x2="160" y2="0"/>
    <line x1="0" y1="-5" x2="0" y2="5"/>
    <line x1="40" y1="-3" x2="40" y2="3"/>
    <line x1="80" y1="-5" x2="80" y2="5"/>
    <line x1="120" y1="-3" x2="120" y2="3"/>
    <line x1="160" y1="-5" x2="160" y2="5"/>
    <text x="80" y="-8" font-family="monospace" font-size="10" fill="#94a3b8" text-anchor="middle">CALIBRATION 1:1</text>
  </g>
</svg>`);

/**
 * Bitewing Radiograph SVG (Premolar-Molar Interproximal Area)
 */
export const BITEWING_RIGHT_XRAY_SVG = svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 520" width="1000" height="520">
  <defs>
    <radialGradient id="bw-bg" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#121820"/>
      <stop offset="70%" stop-color="#080c10"/>
      <stop offset="100%" stop-color="#020406"/>
    </radialGradient>
    <linearGradient id="bw-enamel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d1d5db" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#f9fafb" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#e5e7eb" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="520" fill="url(#bw-bg)"/>
  <path d="M100 220 Q500 240 900 220" stroke="#475569" stroke-width="12" opacity="0.45" stroke-linecap="round"/>
  <path d="M100 300 Q500 280 900 300" stroke="#475569" stroke-width="12" opacity="0.45" stroke-linecap="round"/>
  <rect x="420" y="245" width="160" height="30" rx="4" fill="#1e293b" opacity="0.6"/>
  <g fill="url(#bw-enamel)" stroke="#94a3b8" stroke-width="1.5">
    <path d="M160 120 C180 180 200 240 260 250 C280 250 300 230 300 120 Z"/>
    <ellipse cx="230" cy="190" rx="15" ry="30" fill="#0b0f17"/>
    <path d="M320 110 C340 185 360 252 440 252 C460 250 480 220 480 110 Z"/>
    <rect x="350" y="195" width="70" height="40" rx="3" fill="#ffffff" opacity="0.98"/>
    <path d="M505 120 C520 180 540 250 595 250 C620 248 635 220 635 120 Z"/>
    <ellipse cx="570" cy="195" rx="8" ry="28" fill="#0b0f17"/>
    <path d="M655 125 C670 180 690 250 745 250 C770 248 785 220 785 125 Z"/>
    <circle cx="658" cy="225" r="7" fill="#06090e" stroke="#ef4444" stroke-width="1.2"/>
  </g>
  <g fill="url(#bw-enamel)" stroke="#94a3b8" stroke-width="1.5">
    <path d="M160 400 C180 340 200 270 260 265 C280 265 300 290 300 400 Z"/>
    <ellipse cx="230" cy="330" rx="15" ry="30" fill="#0b0f17"/>
    <path d="M320 410 C340 335 360 265 440 265 C460 267 480 300 480 410 Z"/>
    <line x1="380" y1="270" x2="380" y2="410" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
    <line x1="415" y1="270" x2="415" y2="410" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
    <path d="M505 400 C520 340 540 265 595 265 C620 267 635 300 635 400 Z"/>
    <ellipse cx="570" cy="325" rx="8" ry="28" fill="#0b0f17"/>
    <path d="M655 395 C670 340 690 265 745 265 C770 267 785 300 785 395 Z"/>
    <ellipse cx="720" cy="325" rx="8" ry="28" fill="#0b0f17"/>
  </g>
  <text x="60" y="60" font-family="sans-serif" font-size="20" font-weight="bold" fill="#64748b" opacity="0.8">BITEWING (SAĞ ÇİĞNEME ALANI)</text>
  <text x="910" y="60" font-family="sans-serif" font-size="24" font-weight="900" fill="#64748b" opacity="0.8">R</text>
  <text x="660" y="275" font-family="sans-serif" font-size="11" fill="#f87171" font-weight="bold">#14 Arayüz Çürüğü</text>
</svg>`);

/**
 * Periapical Radiograph SVG (Single Tooth & Apex / Root Canal / Bone View)
 */
export const PERIAPICAL_MOLAR_XRAY_SVG = svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 520" width="1000" height="520">
  <defs>
    <radialGradient id="pa-bg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#161c24"/>
      <stop offset="70%" stop-color="#0a0d13"/>
      <stop offset="100%" stop-color="#030507"/>
    </radialGradient>
    <filter id="pa-blur">
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>
  </defs>
  <rect width="1000" height="520" fill="url(#pa-bg)"/>
  <circle cx="480" cy="380" r="140" fill="#1e293b" opacity="0.3" filter="url(#pa-blur)"/>
  <path d="M200 460 Q500 480 800 460" stroke="#090d14" stroke-width="26" opacity="0.85"/>
  <g transform="translate(150, 0)">
    <path d="M260 210 Q240 370 280 430 Q310 435 320 370 Q340 300 360 210 Z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M380 210 Q390 320 420 370 Q430 435 450 430 Q480 370 460 210 Z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M288 230 Q270 340 295 422" stroke="#ffffff" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M430 230 Q435 340 440 422" stroke="#ffffff" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M240 210 C240 100 290 80 360 80 C430 80 480 100 480 210 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="290" y="82" width="140" height="60" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
    <path d="M272 436 Q295 448 318 436" fill="none" stroke="#0b0f17" stroke-width="3"/>
    <path d="M425 436 Q442 448 458 436" fill="none" stroke="#0b0f17" stroke-width="3"/>
  </g>
  <text x="60" y="60" font-family="sans-serif" font-size="20" font-weight="bold" fill="#64748b" opacity="0.8">PERİAPİKAL RADYOGRAFİ (#46 SAĞ ALT 1. MOLAR)</text>
  <text x="60" y="90" font-family="monospace" font-size="12" fill="#94a3b8">Kanal Tedavisi Kontrolü • Guta-Perka Obturasyonu Tam • Lamina Dura İntakt</text>
  <text x="910" y="60" font-family="sans-serif" font-size="24" font-weight="900" fill="#64748b" opacity="0.8">PA</text>
</svg>`);

