import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { formatCurrency } from "../palettes";
import { Activity, ShieldCheck, HeartPulse, CheckCircle2 } from "../icons";

export function Booklet24Page10Visit1({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const curr = data.currency || "EUR";

  const fallbackVisit1Items = [
    {
      treatment: isEn ? "Tooth Extractions (Atraumatic surgical)" : "Atravmatik Cerrahi Diş Çekimi",
      teeth: "11, 13, 14, 17, 21, 22, 23, 24, 25, 28",
      qty: 10,
      unitPrice: 39,
      total: 390,
      note: undefined as string | undefined,
    },
    {
      treatment: isEn ? "Mandibular Extractions (Surgical)" : "Alt Çene Cerrahi Diş Çekimi",
      teeth: "31, 32, 33, 34, 38, 41, 42, 43, 44, 48",
      qty: 10,
      unitPrice: 39,
      total: 390,
      note: undefined as string | undefined,
    },
    {
      treatment: isEn ? "All-on-4 Package (Upper Maxilla)" : "All-on-4 İmplant Cerrahi Paketi (Üst Çene)",
      teeth: "#16, #14, #24, #26",
      qty: 1,
      unitPrice: 4995,
      total: 4995,
      note: isEn ? "4 Multi-Unit Implants + Temporary Fixed Denture" : "4 Multi-Unit İmplant + Vidalı Sabit Estetik Geçici Diş",
    },
    {
      treatment: isEn ? "All-on-4 Package (Lower Mandible)" : "All-on-4 İmplant Cerrahi Paketi (Alt Çene)",
      teeth: "#36, #34, #44, #46",
      qty: 1,
      unitPrice: 4995,
      total: 4995,
      note: isEn ? "4 Multi-Unit Implants + Temporary Fixed Denture" : "4 Multi-Unit İmplant + Vidalı Sabit Estetik Geçici Diş",
    },
    {
      treatment: isEn ? "Digital Panoramic X-ray & 3D CT Calibration" : "Dijital Panoramik Röntgen & 3D Tomografi",
      teeth: "Full Arch",
      qty: 1,
      unitPrice: 20,
      total: 20,
      note: undefined as string | undefined,
    },
  ];

  const rawVisit1 =
    data.visits?.find((v) => v.id === "v1" || v.title?.includes("1") || v.title?.includes("1st"))?.items ||
    data.visits?.[0]?.items ||
    (data.items && data.items.length > 0
      ? data.items.filter((it) => it.session?.includes("1") || !it.session?.includes("2"))
      : undefined);

  const visit1Items =
    rawVisit1 && rawVisit1.length > 0
      ? rawVisit1.map((it) => ({
          treatment: it.name || it.treatmentName || "Tedavi Kalemi",
          teeth: it.toothNumber || (it.teeth && it.teeth.length > 0 ? it.teeth.join(", ") : "-"),
          qty: it.quantity || 1,
          unitPrice: it.unitPrice || Math.round((it.amount || 0) / (it.quantity || 1)),
          total: it.amount || (it.unitPrice || 0) * (it.quantity || 1),
          note: it.description || it.notes,
        }))
      : fallbackVisit1Items;

  const subtotal = visit1Items.reduce((acc, it) => acc + it.total, 0);

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={10}
      totalPages={24}
      pageTitle={isEn ? "Your Plan: 1st Visit (Surgical & Implants)" : "Tedavi Planınız: 1. Seans (Cerrahi & İmplant)"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Başlık */}
        <div className="border-b pb-3" style={{ borderColor: palette.border }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-1.5"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Activity className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "PHASE 1: SURGERY & IMMEDIATE FIXED TEMPORARIES" : "1. FAZ: CERRAHİ İŞLEMLER VE AYNI GÜN SABİT GEÇİCİ DİŞLER"}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <h2
              className="text-2xl font-bold tracking-tight"
              style={{
                color: palette.primary,
                fontFamily: data.templateId === "botanical-serenity" ? "'Playfair Display', serif" : "inherit",
              }}
            >
              {isEn ? "1. Visit: Extractions & Implantation" : "1. Seans: Çekimler, İmplantlar & Geçici Protez"}
            </h2>
            <span className="text-xl font-black font-mono text-slate-900" style={{ color: palette.primary }}>
              {formatCurrency(subtotal, curr, data.locale)}
            </span>
          </div>
        </div>

        {/* Cerrahi İşlem Tablosu (wise_2.pdf Sayfa 10 Birebir) */}
        <div className="rounded-2xl border bg-white shadow-2xs overflow-hidden" style={{ borderColor: palette.border }}>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">{isEn ? "Treatment / Procedure" : "Tedavi / Prosedür"}</th>
                <th className="py-2.5 px-3 text-center w-24">{isEn ? "Tooth / Region" : "Bölge / Diş"}</th>
                <th className="py-2.5 px-3 text-center w-16">{isEn ? "Amount" : "Adet"}</th>
                <th className="py-2.5 px-3 text-right w-24">{isEn ? "Unit Price" : "Birim"}</th>
                <th className="py-2.5 px-3.5 text-right w-28">{isEn ? "Price" : "Tutar"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visit1Items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3.5">
                    <p className="font-bold text-slate-900 leading-tight">{item.treatment}</p>
                    {item.note && <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.note}</p>}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-[10px] text-slate-600">{item.teeth}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.qty} ×</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatCurrency(item.unitPrice, curr, data.locale)}</td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900">{formatCurrency(item.total, curr, data.locale)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={4} className="py-2.5 px-3.5 text-right font-bold text-slate-700 text-xs">
                  {isEn ? "1st Visit Subtotal:" : "1. Seans Ara Toplamı:"}
                </td>
                <td className="py-2.5 px-3.5 text-right font-mono font-black text-sm" style={{ color: palette.primary }}>
                  {formatCurrency(subtotal, curr, data.locale)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* İyileşme Süreci Notu (wise_2.pdf Sayfa 10) */}
        <div className="rounded-2xl border p-4 bg-slate-50/70 flex items-center justify-between" style={{ borderColor: palette.border }}>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <HeartPulse className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {isEn ? "HEALING & OSSEOINTEGRATION PERIOD: 3 - 6 MONTHS" : "İYİLEŞME VE KEMİK KAYNAŞMA SÜRECİ: 3 - 6 AY"}
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isEn
                  ? "During this biological integration phase, you will comfortably smile and eat with your screw-retained fixed aesthetic provisional teeth."
                  : "Bu bekleme sürecinde ağzınızda vidalı estetik geçici sabit dişleriniz olacak; günlük hayatınıza ve beslenmenize güvenle devam edeceksiniz."}
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold shrink-0">
            {isEn ? "Immediate Teeth" : "Aynı Gün Sabit Diş"}
          </span>
        </div>
      </div>
    </PageFrame>
  );
}
