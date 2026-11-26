import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Sparkles, ShieldCheck, CheckCircle2 } from "../icons";

export function Booklet24Page22Hotel({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  const amenities = [
    { name: isEn ? "King Size Orthopedic Bed" : "Ortopedik King-Size Yatak", desc: isEn ? "Restful head-elevated post-op recovery" : "Operasyon sonrası baş yukarıda dinlenme konforu" },
    { name: isEn ? "Quiet Soundproof Suites" : "Ses İzolasyonlu Geniş Süit", desc: isEn ? "Peaceful recovery environment" : "Huzurlu ve sessiz dinlenme ortamı" },
    { name: isEn ? "24/7 Room Service & Soft Menu" : "7/24 Yumuşak Diyet Menüsü", desc: isEn ? "Specially curated soft meals for implant patients" : "İmplant hastaları için özel püre ve çorba menüleri" },
    { name: isEn ? "High-Speed Wi-Fi & Smart TV" : "Yüksek Hızlı Fiber Wi-Fi", desc: isEn ? "Stay connected with family and work" : "Ailenizle kesintisiz iletişim ve eğlence" },
  ];

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={22}
      totalPages={24}
      pageTitle={isEn ? "Your Stay With Us: 5-Star Partner Hotel" : "Konaklamanız: 5 Yıldızlı Anlaşmalı Otelimiz"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Başlık */}
        <div className="space-y-2">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Sparkles className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "LUXURY RECOVERY & HOSPITALITY EXPERIENCE" : "LÜKS İYİLEŞME DÖNEMİ VE MİSAFİRPERVERLİK"}</span>
          </div>

          <h2
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: palette.primary, fontFamily: palette.headingFont }}
          >
            {isEn ? "Your Stay With Us: The Hotel" : "Konaklamanız: 5 Yıldızlı Süit Otelimiz"}
          </h2>

          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {isEn
              ? "We believe true dental wellness encompasses relaxation and comfort. That's why your treatment package includes accommodation at our premium partner 5-star hotel, located just minutes from our clinic for effortless appointments."
              : "Başarılı bir tedavi sürecinin konforlu ve huzurlu bir dinlenme ortamıyla tamamlandığına inanıyoruz. Bu nedenle tedavi paketiniz, kliniğimize sadece birkaç dakika mesafede yer alan 5 yıldızlı anlaşmalı lüks süit otelimizde konaklamayı kapsar."}
          </p>
        </div>

        {/* Otel Odası Fotoğraf / Vektör Alanı (wise_2.pdf sayfa 22) */}
        <div
          className="flex-1 rounded-2xl border p-5 flex flex-col justify-between relative overflow-hidden shadow-sm"
          style={{
            backgroundColor: "#0F172A",
            borderColor: palette.border,
            backgroundImage: "radial-gradient(circle at 60% 40%, #1E293B 0%, #090D16 100%)",
          }}
        >
          {/* Otel Süiti İllüstrasyonu */}
          <div className="flex-1 flex flex-col items-center justify-center my-auto">
            <div className="relative w-72 h-40 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 p-4 flex flex-col justify-between shadow-2xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-amber-400">★★★★★</span>
                  <span>5-STAR DELUXE SUITE</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                  ALL INCLUSIVE
                </span>
              </div>

              {/* Lüks Oda İllüstrasyonu */}
              <div className="flex items-center justify-center gap-4 my-2">
                <div className="w-24 h-16 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-base">🛋️</span>
                  <span className="text-[9px] text-slate-300 font-medium mt-1">Living Lounge</span>
                </div>
                <div className="w-24 h-16 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-base">🛏️</span>
                  <span className="text-[9px] text-slate-300 font-medium mt-1">King Bedroom</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-[11px] text-slate-300 font-medium">
                  {isEn ? "5 Minutes from Clinic & City Center" : "Kliniğe 5 Dakika Mesafede Merkezi Konum"}
                </span>
              </div>
            </div>
          </div>

          {/* Olanaklar 4'lü Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800 text-left">
            {amenities.map((am, idx) => (
              <div key={idx} className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <CheckCircle2 className="size-3 text-cyan-400" />
                  <span>{am.name}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{am.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alt Güvence */}
        <div
          className="rounded-xl border p-2.5 flex items-center justify-between text-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <span className="text-slate-600">
            {isEn
              ? "Breakfast included. Late checkout and clinic transfers coordinated by your assistant."
              : "Zengin açık büfe kahvaltı dahildir. Geç çıkış ve klinik transferleri hasta asistanınızca planlanır."}
          </span>
          <span className="text-emerald-700 font-bold text-[11px]">VIP CONCIERGE</span>
        </div>
      </div>
    </PageFrame>
  );
}
