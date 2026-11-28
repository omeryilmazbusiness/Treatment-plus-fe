import type { PdfPlanData } from "./types";

/**
 * HTML tabanlı A4 vektörel baskı/PDF motoru.
 * html2canvas kaynaklı bulanıklık, renk kaybı (oklch) ve taşma sorunlarını tamamen ortadan kaldırır.
 * Tarayıcının yerel yüksek çözünürlüklü PDF motorunu kullanarak 1:1 piksel/yerleşim eşleşmesi ve vektörel metin çıktısı üretir.
 */
export async function exportPlanElementToPdf(
  element: HTMLElement,
  documentTitle = "Tedavi-Plani.pdf",
  locale: "tr" | "en" | "ar" | "ru" = "tr"
): Promise<void> {
  const isAr = locale === "ar";
  return new Promise((resolve) => {
    // 1. Gizli iframe oluştur
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.zIndex = "-9999";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      resolve();
      return;
    }

    // 2. Ana sayfadaki tüm CSS stillerini topla
    const styleTags = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map((tag) => tag.outerHTML)
      .join("\n");

    const elementHtml = element.outerHTML;

    // 3. İframe içerisine kusursuz A4 şablonunu ve fontları enjekte et
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="${locale}" ${isAr ? 'dir="rtl"' : ""}>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${documentTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Dancing+Script:wght@500;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          ${styleTags}
          <style>
            @page {
              size: 210mm 297mm;
              margin: 0 !important;
            }
            *, *::before, *::after {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              font-family: ${isAr ? "'Cairo', " : ""}'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
            }
            .a4-document-root {
              width: 210mm !important;
              min-height: 297mm !important;
              box-shadow: none !important;
              margin: 0 !important;
              transform: none !important;
            }
            tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          <div style="width: 210mm; min-height: 297mm; margin: 0 auto; background: white;">
            ${elementHtml}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // 4. Fontların ve resimlerin tam yüklendiğinden emin ol ve yazdır
    const triggerPrint = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("PDF Print error:", e);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            resolve();
          }, 1000);
        }
      }, 350);
    };

    if (doc.fonts) {
      doc.fonts.ready.then(triggerPrint).catch(triggerPrint);
    } else {
      iframe.onload = triggerPrint;
    }
  });
}
