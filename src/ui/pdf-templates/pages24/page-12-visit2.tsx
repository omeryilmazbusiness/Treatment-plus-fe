import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { formatCurrency } from "../palettes";
import { Sparkles, ShieldCheck, CheckCircle2, Award } from "../icons";

export function Booklet24Page12Visit2({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const curr = data.currency || "EUR";

  const fallbackVisit2Items = [
    {
      treatment: isEn
        ? "Permanent Hybrid Bridge (Upper Maxilla, 16-26)"
        : "Kalıcı Hibrit Zirkonyum Köprü (Üst Çene, 16-26)",
      teeth: "#16 - #26 (12 Üye)",
      qty: 1,
      unitPrice: 2000,
      total: 2000,
      note: isEn
        ? "Precision milled monolithic zirconia on multi-unit abutments"
        : "Multi-unit dayanaklar üzerine monolitik zirkonyum vidalı kalıcı köprü",
    },
    {
      treatment: isEn
        ? "Permanent Hybrid Bridge (Lower Mandible, 36-46)"
        : "Kalıcı Hibrit Zirkonyum Köprü (Alt Çene, 36-46)",
      teeth: "#36 - #46 (12 Üye)",
      qty: 1,
      unitPrice: 2000,
      total: 2000,
      note: isEn
        ? "Precision milled monolithic zirconia on multi-unit abutments"
        : "Multi-unit dayanaklar üzerine monolitik zirkonyum vidalı kalıcı köprü",
    },
    {
      treatment: isEn ? "Control Panoramic Radiograph" : "Kontrol Panoramik Röntgeni",
      teeth: isEn ? "Full Arch" : "Tam Çene",
      qty: 1,
      unitPrice: 20,
      total: 20,
      note: isEn
        ? "Final verification of osseointegration and screw torque"
        : "Kemik entegrasyonu ve vida torkunun son radyolojik kontrolü",
    },
  ];

  const rawVisit2 =
    data.visits?.find((v) => v.id === "v2" || v.title?.includes("2") || v.title?.includes("2nd"))?.items ||
    data.visits?.[1]?.items ||
    (data.items && data.items.length > 0
      ? data.items.filter((it) => it.session?.includes("2"))
      : undefined);

  const visit2Items =
    rawVisit2 && rawVisit2.length > 0
      ? rawVisit2.map((it) => ({
          treatment: it.name || it.treatmentName || "Tedavi Kalemi",
          teeth: it.toothNumber || (it.teeth && it.teeth.length > 0 ? it.teeth.join(", ") : "-"),
          qty: it.quantity || 1,
          unitPrice: it.unitPrice || Math.round((it.amount || 0) / (it.quantity || 1)),
          total: it.amount || (it.unitPrice || 0) * (it.quantity || 1),
          note: it.description || it.notes,
        }))
      : fallbackVisit2Items;

  const phase2Total = visit2Items.reduce((acc, it) => acc + it.total, 0);
  const grandTotal = data.grandTotal || data.totalAmount || (10790 + phase2Total);

  // 16 to 26 upper arch teeth
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const isUpperBridge = (t: number) => t >= 11 && t <= 16 || t >= 21 && t <= 26;
  const isLowerBridge = (t: number) => t >= 41 && t <= 46 || t >= 31 && t <= 36;
  const isUpperImplant = (t: number) => [16, 14, 24, 26].includes(t);
  const isLowerImplant = (t: number) => [46, 44, 34, 36].includes(t);

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={12}
      totalPages={24}
      pageTitle={isEn ? "Your Plan: 2nd Visit (Permanent Bridge)" : "Tedavi Planınız: 2. Seans (Kalıcı Zirkonyum Köprü)"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-3">
        {/* Başlık Banner */}
        <div className="border-b pb-2.5" style={{ borderColor: palette.border }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-1"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Sparkles className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "PHASE 2: PERMANENT RESTORATION (AFTER 4-6 MONTHS)" : "2. FAZ: KALICI ZİRKONYUM RESTORASYON (4-6 AY SONRA)"}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <h2
              className="text-2xl font-bold tracking-tight"
              style={{ color: palette.primary, fontFamily: palette.headingFont }}
            >
              {isEn ? "2nd Visit & Final Rehabilitation" : "2. Seans: Kalıcı Protez & Bitiş"}
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {isEn ? "Duration: 5-7 Days" : "Seans Süresi: 5-7 Gün"}
            </span>
          </div>
        </div>

        {/* Odontogram Kalıcı Köprü Diyagramı */}
        <div
          className="rounded-xl border p-3 flex flex-col items-center justify-center relative shadow-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-600 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500"></span>
            <span>{isEn ? "Completed Full Arch Rehabilitation (Permanent Bridges)" : "Tamamlanan Tam Çene Kalıcı Zirkonyum Köprüler"}</span>
          </div>

          <div className="w-full max-w-xl space-y-2">
            {/* Üst Çene */}
            <div className="flex items-center justify-center gap-1">
              {upperTeeth.map((t) => {
                const inBridge = isUpperBridge(t);
                const hasImplant = isUpperImplant(t);
                return (
                  <div key={t} className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-slate-400 mb-0.5">{t}</span>
                    <div
                      className={`size-6 rounded-md flex items-center justify-center text-[9px] font-bold border transition ${
                        inBridge
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}
                    >
                      {hasImplant ? "✦" : inBridge ? "●" : "×"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alt Çene */}
            <div className="flex items-center justify-center gap-1 pt-1 border-t border-slate-100">
              {lowerTeeth.map((t) => {
                const inBridge = isLowerBridge(t);
                const hasImplant = isLowerImplant(t);
                return (
                  <div key={t} className="flex flex-col items-center">
                    <div
                      className={`size-6 rounded-md flex items-center justify-center text-[9px] font-bold border transition ${
                        inBridge
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}
                    >
                      {hasImplant ? "✦" : inBridge ? "●" : "×"}
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 mt-0.5">{t}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500"></span>
              {isEn ? "Permanent Zirconia Unit" : "Kalıcı Zirkonyum Üye (12+12)"}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-700 font-bold">✦</span>
              {isEn ? "Integrated Titanium Implant" : "Entegre Titanyum İmplant (4+4)"}
            </span>
          </div>
        </div>

        {/* Prosedür Tablosu */}
        <div
          className="rounded-xl border overflow-hidden shadow-xs"
          style={{ borderColor: palette.border }}
        >
          <div
            className="px-4 py-2 flex items-center justify-between text-xs font-bold text-white"
            style={{ backgroundColor: palette.primary }}
          >
            <span>{isEn ? "2. Phase Procedures & Laboratory Works" : "2. Seans İşlemleri & Laboratuvar Uygulamaları"}</span>
            <span className="font-mono text-cyan-300">
              {formatCurrency(phase2Total, curr, data.locale)}
            </span>
          </div>

          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2 px-3 text-left font-semibold">{isEn ? "Treatment / Work" : "İşlem / Laboratuvar"}</th>
                <th className="py-2 px-3 text-left font-semibold">{isEn ? "Region" : "Bölge"}</th>
                <th className="py-2 px-3 text-center font-semibold">{isEn ? "Qty" : "Adet"}</th>
                <th className="py-2 px-3 text-right font-semibold">{isEn ? "Unit Price" : "Birim"}</th>
                <th className="py-2 px-3 text-right font-semibold">{isEn ? "Price" : "Toplam"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visit2Items.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900">{it.treatment}</div>
                    <div className="text-[10px] text-slate-500">{it.note}</div>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600">{it.teeth}</td>
                  <td className="py-2 px-3 text-center font-medium text-slate-700">{it.qty}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    {formatCurrency(it.unitPrice, curr, data.locale)}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">
                    {formatCurrency(it.total, curr, data.locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Genel Toplam Maliyet & Finansal Özet Kartı */}
        <div
          className="rounded-xl border p-3.5 shadow-sm"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {isEn ? "Total Treatment Investment (Visit 1 + Visit 2)" : "Toplam Tedavi Yatırımı (1. Seans + 2. Seans)"}
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                {isEn
                  ? "All surgical, prosthetic, CAD/CAM milling and hospital fees included. No hidden costs."
                  : "Cerrahi, implantlar, geçici ve kalıcı zirkonyum köprüler, laboratuvar ve kontrol masrafları dahildir."}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block font-semibold">{isEn ? "Grand Total" : "Genel Toplam"}</span>
              <span
                className="text-2xl font-black font-mono"
                style={{ color: palette.primary }}
              >
                {formatCurrency(grandTotal, curr, data.locale)}
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              {isEn ? "Lifetime Implant Warranty & 5-Year Prosthetic Guarantee" : "Ömür Boyu İmplant Garantisi & 5 Yıl Protez Güvencesi"}
            </span>
            <span className="text-slate-500">
              {isEn ? "Flexible payment plans available" : "Taksit ve esnek ödeme seçenekleri mevcuttur"}
            </span>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
