import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Award, ShieldCheck, HeartPulse, CheckCircle2, Star } from "../icons";

export function Booklet24Page6Doctor({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={6}
      totalPages={24}
      pageTitle={isEn ? "Your Implantologist & Lead Surgeon" : "Sorumlu Hekiminiz & Uzman Cerrah"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-6">
        {/* Başlık */}
        <div className="border-b pb-3" style={{ borderColor: palette.border }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-1.5"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Award className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "CLINICAL MASTERY & SURGICAL EXCELLENCE" : "CERRAHİ UZMANLIK VE AKADEMİK KARİYER"}</span>
          </div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{
              color: palette.primary,
              fontFamily: data.templateId === "botanical-serenity" ? "'Playfair Display', serif" : "inherit",
            }}
          >
            {data.doctorName || "Dr. Dt. Selin Arslan (D.D.S., Ph.D.)"}
          </h2>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">
            {isEn
              ? "Master of Swiss Immediate Loading Implant Systems & Guided Surgery"
              : "İsviçre Hemen Yüklemeli İmplant Sistemleri ve Bilgisayarlı Cerrahi Uzmanı"}
          </p>
        </div>

        {/* Hekim Özgeçmiş Metni */}
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-normal">
          <p className="text-sm font-semibold text-slate-900 leading-relaxed">
            {data.doctorBio ||
              (isEn
                ? "Graduated with honors in Oral and Maxillofacial Surgery and specialized in advanced basal implantology and immediate-loaded implant reconstructions."
                : "Ağız, Diş ve Çene Cerrahisi alanında onur derecesiyle mezun olmuş; ileri düzey bazal implantoloji, zigomatik implantlar ve aynı gün sabit diş protokollerinde uzmanlaşmıştır.")}
          </p>

          <p>
            {isEn
              ? "With a deep clinical interest and fellowship training in Nobel Biocare, Straumann, and Ankylos premium implant systems, our lead surgeon has built an international reputation for uncompromising patient safety, minimally invasive techniques, and natural aesthetic results."
              : "Straumann, Nobel Biocare ve Bego gibi dünyanın önde gelen implant sistemlerinde master derecesine sahip olup, kemik yetersizliği olan vakalarda dahi sinüs grefti gerektirmeyen açılı implant protokollerini başarıyla uygulamaktadır."}
          </p>
        </div>

        {/* 3 Büyük Kariyer Metriği (wise_2.pdf Sayfa 6) */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="rounded-2xl border p-4 bg-slate-50/70 text-center space-y-1 shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-3xl font-black text-slate-900 block" style={{ color: palette.primary }}>
              25+
            </span>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              {isEn ? "Years Experience" : "Yıllık Deneyim"}
            </span>
            <p className="text-[10px] text-slate-500">
              {isEn ? "In complex oral implantology & reconstruction" : "İleri cerrahi ve tam ark tedavilerinde"}
            </p>
          </div>

          <div className="rounded-2xl border p-4 bg-slate-50/70 text-center space-y-1 shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-3xl font-black text-emerald-600 block">
              1,500+
            </span>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              {isEn ? "Smiles Restored" : "Gülüş Tasarımı"}
            </span>
            <p className="text-[10px] text-slate-500">
              {isEn ? "Full-arch All-on-4 / All-on-6 cases" : "All-on-4 ve All-on-6 başarılı vaka"}
            </p>
          </div>

          <div className="rounded-2xl border p-4 bg-slate-50/70 text-center space-y-1 shadow-2xs" style={{ borderColor: palette.border }}>
            <span className="text-3xl font-black text-sky-600 block">
              16k+
            </span>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              {isEn ? "Implants Placed" : "Uygulanan İmplant"}
            </span>
            <p className="text-[10px] text-slate-500">
              {isEn ? "With a documented 99.2% osseointegration rate" : "%99.2 klinik kemik kaynaşma başarısı"}
            </p>
          </div>
        </div>

        {/* Akademik & Uluslararası Üyelikler */}
        <div className="rounded-xl border p-3.5 bg-slate-900 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Star className="size-4 text-amber-400" />
            <span className="font-semibold">
              {isEn ? "Fellow of the International Team for Implantology (ITI) & EAO" : "International Team for Implantology (ITI) ve Türk Çene Cerrahisi Derneği Aktif Üyesi"}
            </span>
          </div>
          <span className="text-[10px] text-sky-400 font-mono font-bold">FELLOW DIPLOMATE</span>
        </div>
      </div>
    </PageFrame>
  );
}
