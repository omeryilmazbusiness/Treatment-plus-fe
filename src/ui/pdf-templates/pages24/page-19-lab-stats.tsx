import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Users, Award, Clock, CheckCircle2, ShieldCheck, Sparkles } from "../icons";

export function Booklet24Page19LabStats({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";

  const labStats = [
    {
      stat: "15",
      label: isEn ? "Dental Technicians" : "Uzman Diş Teknikeri",
      sub: isEn ? "Master ceramists & CAD/CAM designers" : "Usta seramist ve 3D CAD/CAM tasarımcısı",
      icon: Users,
    },
    {
      stat: "27k",
      label: isEn ? "Units Manufactured" : "Yıllık Üretilen Kron/Köprü",
      sub: isEn ? "High-precision restorations delivered" : "Kusursuz uyumla tamamlanan restorasyon",
      icon: Award,
    },
    {
      stat: "36h",
      label: isEn ? "Turnaround Time" : "Ortalama Üretim Süresi",
      sub: isEn ? "From optical scan to patient seating" : "Ağız içi taramadan hasta provasına",
      icon: Clock,
    },
  ];

  return (
    <PageFrame
      data={data}
      palette={palette}
      pageNumber={19}
      totalPages={24}
      pageTitle={isEn ? "Dental Lab Capacity & Performance" : "Kurum İçi Laboratuvar Standartlarımız"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Başlık ve Metin Bölümü (wise_2.pdf sayfa 19) */}
        <div className="space-y-2.5">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <ShieldCheck className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "UNCOMPROMISING LAB QUALITY CONTROL" : "TAVİZSİZ LABORATUVAR KALİTE KONTROLÜ"}</span>
          </div>

          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: palette.primary, fontFamily: palette.headingFont }}
          >
            {isEn ? "Our In-House Dental Lab" : "Kendi Laboratuvarımızın Gücü"}
          </h2>

          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {isEn
              ? "Our clinic has its own fully equipped dental lab, allowing us to oversee every single step of the restoration process. This means greater precision, significantly faster turnaround times, and a completely seamless experience for our patients."
              : "Kliniğimizin kendi tam teşekküllü dijital diş laboratuvarına sahip olması, restorasyon sürecinin her bir adımını hekim kontrolünde bizzat denetlememizi sağlar. Bu durum mikron düzeyinde hassasiyet, çok daha hızlı seanslar ve hastalarımız için sorunsuz bir tedavi deneyimi sunar."}
          </p>

          <p className="text-xs text-slate-600 leading-relaxed">
            {isEn
              ? "With digital scanning and advanced milling technology, we create crowns, bridges, and veneers that fit perfectly and look natural. Having an in-house lab also means we can make real-time adjustments chairside, ensuring that every detail meets our uncompromising standards."
              : "Dijital tarama ve gelişmiş frezeleme teknolojisiyle, doğal diş dokusunu birebir taklit eden kron ve köprüler tasarlıyoruz. Laboratuvarımızın kliniğimizle aynı çatı altında bulunması, hasta başında anlık mikromilimetrik düzenlemeler yapabilmemize olanak tanır."}
          </p>
        </div>

        {/* 3 Büyük Metrik Kartı (wise_2.pdf 15, 27k, 36h) */}
        <div className="grid grid-cols-3 gap-3.5">
          {labStats.map((st, idx) => {
            const IconComp = st.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border p-5 flex flex-col items-center text-center justify-between shadow-xs"
                style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
              >
                <div
                  className="size-12 rounded-2xl flex items-center justify-center mb-3 shadow-2xs"
                  style={{ backgroundColor: palette.light, color: palette.primary }}
                >
                  <IconComp className="size-6" />
                </div>

                <div
                  className="text-4xl font-black font-mono tracking-tight"
                  style={{ color: "#F59E0B" }}
                >
                  {st.stat}
                </div>

                <div className="mt-2">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {st.label}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {st.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Süreç Akış Çizelgesi */}
        <div
          className="rounded-2xl border p-4 shadow-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <div className="text-xs font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span>{isEn ? "End-to-End Digital Production Workflow" : "Uçtan Uca Dijital Üretim İş Akışı"}</span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">100% In-House</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { step: "01", name: isEn ? "3D Intraoral Scan" : "3D Ağız İçi Tarama" },
              { step: "02", name: isEn ? "CAD Smile Design" : "CAD Gülüş Modelleme" },
              { step: "03", name: isEn ? "5-Axis Robotic Mill" : "5 Eksenli Kazıma" },
              { step: "04", name: isEn ? "Sinter & Hand Finish" : "Sinterleme ve Glazür" },
            ].map((wk) => (
              <div key={wk.step} className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span
                  className="text-[10px] font-mono font-bold block"
                  style={{ color: palette.accent }}
                >
                  {wk.step}
                </span>
                <span className="text-[11px] font-semibold text-slate-800 mt-0.5 block leading-tight">
                  {wk.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alt Güvence */}
        <div
          className="rounded-xl border p-2.5 flex items-center justify-between text-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <span className="text-slate-600 flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            {isEn
              ? "All prosthetic restorations come with traceable batch certificates."
              : "Üretilen her restorasyon, uluslararası karekodlu lot ve orijinallik sertifikası ile teslim edilir."}
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-700">ISO 9001:2015</span>
        </div>
      </div>
    </PageFrame>
  );
}
