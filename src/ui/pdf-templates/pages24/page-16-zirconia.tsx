import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Sparkles, ShieldCheck, CheckCircle2, Award } from "../icons";

export function Booklet24Page16Zirconia({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  const zirconiaBenefits = [
    {
      title: isEn ? "Diamond-Grade Strength" : "Elmas Dayanıklılığında Monolitik Yapı",
      desc: isEn
        ? "With up to 1,200 MPa flexural strength, zirconia resists chip fractures and heavy biting loads."
        : "1.200 MPa'ya varan bükülme direnci ile kırılma, aşınma ve çiğneme kuvvetlerine karşı ömür boyu dirençlidir.",
    },
    {
      title: isEn ? "Natural Translucency" : "Doğal Diş Işık Geçirgenliği (Opalesans)",
      desc: isEn
        ? "Unlike opaque metal substructures, multi-layered zirconia mimics natural enamel translucency."
        : "Opak metal altyapıların aksine, çok katmanlı doğal gradyanı ile kendi dişinizden ayırt edilemez.",
    },
    {
      title: isEn ? "No Grey Gumline Margins" : "Gri Diş Eti Kenarı Oluşmaz",
      desc: isEn
        ? "100% metal-free biocompatible material guarantees no dark shadows at the cervical margin over time."
        : "Tamamen metal desteksiz ve biyolojik uyumlu yapısı sayesinde diş eti kenarında zamanla koyu gri halkalar oluşturmaz.",
    },
  ];

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={16}
      totalPages={24}
      pageTitle={isEn ? "Why Choose Zirconia Bridges?" : "Neden Zirkonyum Köprü Tercih Edilmeli?"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-3">
        {/* Başlık Banner */}
        <div className="space-y-2">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Sparkles className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "PREMIUM PROSTHETIC MATERIAL EXCELLENCE" : "PREMIUM RESTORATİF MALZEME MÜKEMMELLİĞİ"}</span>
          </div>

          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: palette.primary, fontFamily: palette.headingFont }}
          >
            {isEn ? "Why Choose Zirconia?" : "Neden Zirkonyum Köprü Seçmelisiniz?"}
          </h2>

          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {isEn
              ? "When it comes to restoring missing or damaged teeth, we prioritize clinical solutions that combine biocompatibility, strength, and lifelong aesthetics. That's why we suggest a zirconia hybrid bridge—a premium choice for patients who want a natural-looking, durable smile without compromise."
              : "Eksik veya hasarlı dişlerin restorasyonunda; biyolojik uyum, kırılma direnci ve ömür boyu süren estetiği birleştiren çözümleri önceliklendiriyoruz. Bu sebeple tedavinizi monolitik zirkonyum hibrit köprüler ile tasarladık; ödün vermeden doğal ve parlak bir gülüş isteyen hastalarımız için altın standarttır."}
          </p>
        </div>

        {/* 3 Temel Avantaj Kartı */}
        <div className="grid grid-cols-3 gap-2.5">
          {zirconiaBenefits.map((b, idx) => (
            <div
              key={idx}
              className="rounded-xl border p-3 space-y-1 shadow-2xs"
              style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
            >
              <div className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="size-3.5" />
                <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">{b.title}</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Before / After Klinik Vaka Karşılaştırma Kartı (wise_2.pdf sayfa 16) */}
        <div
          className="rounded-2xl border p-4 shadow-sm"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Award className="size-4" style={{ color: palette.accent }} />
              <span className="text-xs font-bold text-slate-900">
                {isEn ? "Clinical Case Comparison: Monolithic Zirconia Full Arch" : "Klinik Vaka Karşılaştırması: Monolitik Zirkonyum Tam Çene"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {isEn ? "Actual Patient Result" : "Gerçek Hasta Sonucu"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Öncesi (Before) */}
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col">
              <div className="h-28 bg-gradient-to-br from-amber-950/20 to-slate-800/30 flex items-center justify-center relative p-3">
                <div className="text-center">
                  <span className="text-[11px] font-bold text-amber-900/80 block uppercase tracking-wider">
                    {isEn ? "Severely Worn / Edentulous" : "Aşınmış & Diş Kayıplı Çene"}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1 block">
                    {isEn ? "Loss of vertical dimension" : "Dikey boyut kaybı ve çiğneme yetersizliği"}
                  </span>
                </div>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white font-mono text-[9px] font-bold">
                  BEFORE (ÖNCESİ)
                </span>
              </div>
              <div className="p-2 text-[10px] text-slate-600 bg-white border-t border-slate-200">
                {isEn ? "Pre-operative state with impaired chewing" : "Tedavi öncesi bozulmuş oklüzyon ve estetik kayıp"}
              </div>
            </div>

            {/* Sonrası (After) */}
            <div className="rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50/40 flex flex-col">
              <div className="h-28 bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center relative p-3">
                <div className="text-center">
                  <span className="text-[11px] font-bold text-emerald-900 block uppercase tracking-wider">
                    {isEn ? "Full Arch Monolithic Zirconia" : "Tam Çene Monolitik Zirkonyum"}
                  </span>
                  <span className="text-[9px] text-emerald-700 mt-1 block">
                    {isEn ? "Balanced smile line & shade BL2" : "Dengeli gülüş hattı ve doğal BL2 beyazlığı"}
                  </span>
                </div>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[9px] font-bold">
                  AFTER (SONRASI)
                </span>
              </div>
              <div className="p-2 text-[10px] text-emerald-800 bg-white border-t border-emerald-200 font-medium">
                {isEn ? "5-day full arch rehabilitation completed" : "5 günlük kalıcı zirkonyum restorasyonu sonrası"}
              </div>
            </div>
          </div>
        </div>

        {/* Biyouyumluluk Notu */}
        <div
          className="rounded-xl border p-2.5 flex items-center justify-between text-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <span className="text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            {isEn ? "100% Medical Grade Yttria-Stabilized Tetragonal Zirconia (Y-TZP)" : "%100 Tıbbi Sınıf Yttria ile Güçlendirilmiş Tetragonal Zirkonyum"}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-700">ISO 13356 CE</span>
        </div>
      </div>
    </PageFrame>
  );
}
