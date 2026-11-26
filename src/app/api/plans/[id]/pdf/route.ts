import { NextResponse, type NextRequest } from "next/server";
import React from "react";

import { getRuntime } from "@/bootstrap";
import { resolveActiveSession } from "@/platform/auth/session";
import {
  A4Document,
  TEMPLATE_META,
  type PaletteKey,
  type PdfPlanData,
  type TemplateId,
  type TreatmentItem,
  type PlanVisit,
  type ToothFinding,
  SAMPLE_CLINIC_HIGHLIGHTS,
  SAMPLE_CLINIC_HIGHLIGHTS_EN,
  SAMPLE_DOCTOR_STATS,
  SAMPLE_DOCTOR_STATS_EN,
  SAMPLE_LAB_STATS,
  SAMPLE_LAB_STATS_EN,
  SAMPLE_TOOTH_DIAGNOSES,
  SAMPLE_TOOTH_DIAGNOSES_EN,
} from "@/ui/pdf-templates";

function getMediaUrl(key?: string | null): string | null {
  if (!key || !key.trim()) return null;
  const trimmed = key.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  const cleanKey = trimmed.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/api/media/${cleanKey}`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const backendUrl = runtime.config.api.url;
    const authHeaders = {
      Authorization: `Bearer ${session.accessToken}`,
    };

    const searchParams = request.nextUrl.searchParams;
    const wantsSummary = searchParams.get("format") === "summary" || searchParams.get("mode") === "summary";
    const pageParam = searchParams.get("page");
    const activePage = pageParam ? parseInt(pageParam, 10) : undefined;
    const shouldAutoPrint = searchParams.get("download") === "1" || searchParams.get("print") === "1";
    const isEmbed = searchParams.get("embed") === "1";

    const [planRes, clinicRes] = await Promise.all([
      fetch(`${backendUrl}/v1/plans/${id}`, { headers: authHeaders }),
      fetch(`${backendUrl}/v1/clinic/settings`, { headers: authHeaders }).catch(() => null),
    ]);

    if (!planRes.ok) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8" /><title>Tedavi Planı Bulunamadı</title></head>
<body style="font-family: system-ui; text-align: center; padding: 4rem; background: #f8fafc;">
  <h2>Tedavi Planı Bulunamadı</h2>
  <p>İstenen tedavi planına erişilemedi.</p>
</body>
</html>`,
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const plan = await planRes.json();
    const clinicSettings = clinicRes && clinicRes.ok ? await clinicRes.json() : null;

    const isEn = plan.locale === "en" || clinicSettings?.locale === "en";

    // Items mapping
    const rawItems = plan.items || [];
    const items: TreatmentItem[] = rawItems.map((it: any) => {
      const qty = it.quantity || 1;
      const unitPriceMajor = (Number(it.unit_price) || 0) / 100;
      const amountMajor = it.amount !== undefined ? Number(it.amount) : unitPriceMajor * qty;
      return {
        name: it.treatment_name || it.name || (isEn ? "Treatment Item" : "Tedavi Kalemi"),
        session: it.session_label || it.session || (isEn ? "1st Visit" : "1. Seans"),
        toothNumber:
          it.tooth_number ||
          (Array.isArray(it.teeth) && it.teeth.length > 0 ? it.teeth.join(", ") : undefined),
        teeth: Array.isArray(it.teeth) ? it.teeth : undefined,
        quantity: qty,
        amount: amountMajor,
        category: it.category,
      };
    });

    const calculatedTotal = items.reduce((sum, it) => sum + (it.amount || 0), 0);
    const rawGrand = plan.totals?.grand ?? plan.totals_grand;
    const grandTotal =
      rawGrand !== undefined && rawGrand !== null
        ? Number(rawGrand) / 100
        : calculatedTotal > 0
          ? calculatedTotal
          : undefined;

    // Seansları oluştur
    const visit1Items = items.filter((it) => it.session?.includes("1") || !it.session?.includes("2"));
    const visit2Items = items.filter((it) => it.session?.includes("2"));

    const visits: PlanVisit[] = [
      {
        id: "v1",
        title: isEn ? "1st Visit: Surgical & Provisional Phase" : "1. Seans: Cerrahi ve Geçici Diş Aşaması",
        phaseLabel: isEn ? "Day 1 - 3" : "1. - 3. Gün",
        duration: isEn ? "3 Days Stay" : "3 Günlük Süreç",
        healingPeriod: isEn ? "3 Months Osseointegration" : "3 Aylık Kemik Kaynaşma Dönemi",
        items: visit1Items,
        subtotal: visit1Items.reduce((s, it) => s + it.amount, 0),
        note: isEn
          ? "Surgical tooth extractions, computer-guided implant placement, and fixed screw-retained provisional delivery."
          : "Gerekli cerrahi diş çekimleri, 3D cerrahi rehberli implant yerleşimi ve 24 saat içinde sabit estetik geçici diş teslimi.",
      },
      {
        id: "v2",
        title: isEn ? "2nd Visit: Permanent Prosthetic Delivery" : "2. Seans: Kalıcı Zirkonyum Teslim Aşaması",
        phaseLabel: isEn ? "After 3 Months" : "3 Ay Sonra",
        duration: isEn ? "5 - 7 Days Stay" : "5 - 7 Günlük Süreç",
        items: visit2Items.length > 0 ? visit2Items : items.slice(Math.max(1, items.length - 2)),
        subtotal: visit2Items.reduce((s, it) => s + it.amount, 0),
        note: isEn
          ? "Final digital impressions, dynamic bite registration, try-in, and final torque delivery of permanent monolithic bridge."
          : "Kemikleşme kontrolü, mikron hassasiyetinde dijital ölçü, estetik prova ve kalıcı monolitik zirkonyum köprünün teslimi.",
      },
    ];

    // Diş teşhislerini hazırla
    const rawDiagnoses = items.flatMap((it) => {
      const teethList = it.teeth || (it.toothNumber ? it.toothNumber.split(/[,;\s]+/) : []);
      return teethList.map((t) => ({
        toothNumber: t.trim(),
        condition: it.name,
        treatment: it.name,
        status: (it.name.toLowerCase().includes("implant")
          ? "implant"
          : it.name.toLowerCase().includes("zirkonyum") || it.name.toLowerCase().includes("kron")
          ? "crown"
          : it.name.toLowerCase().includes("dolgu") || it.name.toLowerCase().includes("çürük")
          ? "cavity"
          : "implant") as "implant" | "crown" | "cavity" | "missing" | "healthy",
      }));
    });

    const diagnoses: ToothFinding[] =
      rawDiagnoses.length > 0
        ? rawDiagnoses
        : isEn
        ? SAMPLE_TOOTH_DIAGNOSES_EN
        : SAMPLE_TOOTH_DIAGNOSES;

    const highlights =
      clinicSettings?.highlights && clinicSettings.highlights.length >= 4
        ? clinicSettings.highlights
        : isEn
        ? SAMPLE_CLINIC_HIGHLIGHTS_EN
        : SAMPLE_CLINIC_HIGHLIGHTS;

    const doctorStats =
      clinicSettings?.doctor?.stats && clinicSettings.doctor.stats.length >= 3
        ? clinicSettings.doctor.stats
        : isEn
        ? SAMPLE_DOCTOR_STATS_EN
        : SAMPLE_DOCTOR_STATS;

    const labStats =
      clinicSettings?.lab?.stats && clinicSettings.lab.stats.length >= 4
        ? clinicSettings.lab.stats
        : isEn
        ? SAMPLE_LAB_STATS_EN
        : SAMPLE_LAB_STATS;

    const pdfPlanData: PdfPlanData = {
      templateId: (clinicSettings?.template_id || clinicSettings?.templateId || "klinik-minimal") as TemplateId,
      paletteKey: (clinicSettings?.palette || plan.palette || "navy") as PaletteKey,
      palette: (clinicSettings?.palette || plan.palette || "navy") as PaletteKey,
      clinicName: clinicSettings?.name || "Wise Dental Clinic",
      slogan: clinicSettings?.slogan || (isEn ? "Where Precision Meets Aesthetic Perfection" : "Gülüşünüz Estetikle Buluşuyor"),
      logoUrl: getMediaUrl(clinicSettings?.logo_key || clinicSettings?.logoKey) || "",
      phone: clinicSettings?.phone || "+90 (212) 555 0199",
      email: clinicSettings?.email || "info@klinik.com",
      website: clinicSettings?.website || "www.klinik.com",
      address: clinicSettings?.address || (isEn ? "Bagdat Avenue, Istanbul" : "Bağdat Caddesi, Kadıköy, İstanbul"),
      doctorName:
        clinicSettings?.doctor?.name ||
        clinicSettings?.signer_name ||
        clinicSettings?.signerName ||
        "Dr. Dt. Selin Arslan",
      doctorTitle:
        clinicSettings?.signer_title ||
        clinicSettings?.signerTitle ||
        clinicSettings?.doctor?.title ||
        (isEn ? "Chief Oral Surgeon & Medical Director" : "Ağız ve Çene Cerrahisi Uzmanı"),
      doctorBio: clinicSettings?.doctor?.bio,
      doctorPhotoUrl: getMediaUrl(clinicSettings?.doctor?.photo_key || clinicSettings?.doctor?.photoKey),
      doctorStats,
      aboutText: clinicSettings?.about_text || clinicSettings?.aboutText,
      highlights,
      labStats,
      hotelDetails: clinicSettings?.hotel,
      patientName: plan.patient?.name || (isEn ? "Valued Patient" : "Sayın Hastamız"),
      planNo: `#TP-${id.slice(0, 8).toUpperCase()}`,
      dateStr: new Date(plan.created_at || Date.now()).toLocaleDateString(
        isEn ? "en-US" : "tr-TR",
        { day: "numeric", month: "long", year: "numeric" }
      ),
      locale: isEn ? "en" : "tr",
      currency: (plan.currency || clinicSettings?.currency || "TRY") as "TRY" | "EUR" | "USD",
      welcomeText: clinicSettings?.welcome_body || clinicSettings?.welcomeBody || "",
      welcomeBody: clinicSettings?.welcome_body || clinicSettings?.welcomeBody || "",
      kvkkText: clinicSettings?.legal || "",
      legalText: clinicSettings?.legal || "",
      showMotifs: clinicSettings?.show_motifs !== false && clinicSettings?.showMotifs !== false,
      format: wantsSummary ? "summary" : "booklet",
      activePage: activePage,
      items,
      grandTotal,
      visits,
      diagnoses,
    };

    const templateMeta =
      TEMPLATE_META.find((t) => t.id === pdfPlanData.templateId) || TEMPLATE_META[0];

    const { renderToStaticMarkup } = await import("react-dom/server");
    const renderedDoc = renderToStaticMarkup(
      React.createElement(A4Document, { data: pdfPlanData })
    );

    const html = `<!DOCTYPE html>
<html lang="${pdfPlanData.locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pdfPlanData.clinicName} - ${pdfPlanData.patientName} - ${isEn ? "Treatment Presentation" : "Hasta Tedavi Sunumu"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: 210mm 297mm;
      margin: 0 !important;
    }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #0f172a;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      width: 100%;
      min-height: 100%;
    }
    .a4-document-root {
      width: 210mm !important;
      margin: 24px auto !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
    }
    .a4-page {
      width: 210mm !important;
      min-height: 297mm !important;
      height: 297mm !important;
      max-height: 297mm !important;
      page-break-after: always !important;
      break-after: page !important;
      position: relative !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }
    tr {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    @media screen and (max-width: 860px) {
      body {
        padding-top: 56px !important;
        padding-bottom: 24px !important;
      }
      .a4-document-root {
        max-width: 100vw !important;
        margin: 0 auto !important;
        overflow-x: auto;
      }
    }
    @media print {
      html, body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 210mm !important;
      }
      .no-print {
        display: none !important;
      }
      .a4-document-root {
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .a4-booklet-container {
        gap: 0 !important;
        display: block !important;
      }
      .a4-page {
        box-shadow: none !important;
        margin: 0 !important;
        page-break-after: always !important;
        break-after: page !important;
      }
    }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-start py-8 print:py-0">
  ${!isEmbed ? `
  <div class="no-print fixed top-4 z-50 flex items-center gap-4 bg-slate-900/95 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl text-white">
    <div class="flex items-center gap-2">
      <span class="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="text-xs font-bold">${pdfPlanData.clinicName}</span>
      <span class="text-xs text-slate-400">• ${templateMeta.name}</span>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold">
        ${wantsSummary ? "1 Sayfa Özet" : "24 Sayfa Kitapçık"}
      </span>
    </div>
    <div class="h-4 w-px bg-slate-700"></div>
    <button onclick="window.print()" class="cursor-pointer bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 active:scale-95">
      <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      <span>${isEn ? "Save as PDF / Print" : "PDF Olarak Kaydet / Yazdır"}</span>
    </button>
  </div>
  ` : ""}

  <div class="print:my-0">
    ${renderedDoc}
  </div>

  <script>
    ${shouldAutoPrint ? `window.onload = function() { setTimeout(function() { window.print(); }, 400); };` : ""}
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (err: any) {
    console.error("PDF generation route error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
