/**
 * Helper to encode raw SVG string to valid Data URL without broken hash (#) fragments
 */
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

/**
 * Gerçek klinik panoramik diş röntgeni (OPG radyografisi) görseli.
 * Doktor kendi röntgenini yüklemediğinde veya "Örnek OPG ile Dene" seçildiğinde kullanılır.
 */
export const DEFAULT_PANORAMIC_XRAY_URL = "/pdf-assets/wise/panoramic_xray.jpg";
export const DEFAULT_PANORAMIC_XRAY_SVG = DEFAULT_PANORAMIC_XRAY_URL;
