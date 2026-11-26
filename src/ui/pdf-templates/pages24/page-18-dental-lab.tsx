import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Activity, ShieldCheck, CheckCircle2, Sparkles } from "../icons";

export function Booklet24Page18DentalLab({
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
      pageNumber={18}
      totalPages={24}
      pageTitle={isEn ? "Our In-House Digital Dental Lab" : "Kendi Bünyemizdeki Dijital Diş Laboratuvarı"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Başlık Banner */}
        <div className="space-y-2">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Sparkles className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "GERMAN 5-AXIS CAD/CAM ROBOTIC PRECISION" : "ALMAN 5 EKSENLİ CAD/CAM ROBOTİK HASSASİYET"}</span>
          </div>

          <h2
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: palette.primary, fontFamily: palette.headingFont }}
          >
            {isEn ? "Our In-House Dental Lab" : "Kendi Bünyemizdeki Dijital Laboratuvar"}
          </h2>

          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {isEn
              ? "Unlike traditional clinics that outsource restorations to third-party labs with lengthy delays, our clinic operates its own state-of-the-art digital dental laboratory on-site. Every crown, bridge, and custom implant abutment is designed in 3D and milled under direct doctor supervision."
              : "Dış laboratuvarlara bağımlı çalışan ve haftalarca prova bekleten geleneksel kliniklerin aksine, kurumumuz en ileri teknolojiye sahip kendi bünyesindeki dijital laboratuvarı ile hizmet verir. Tüm kronlar, hibrit köprüler ve kişiye özel implant dayanakları hekimlerimizin doğrudan denetiminde milimetrenin yüzde biri hassasiyetle üretilir."}
          </p>
        </div>

        {/* Laboratuvar ve Kazıma Makinesi Görsel Alanı (wise_2.pdf sayfa 18) */}
        <div
          className="flex-1 rounded-2xl border p-5 flex flex-col justify-between relative overflow-hidden shadow-sm"
          style={{
            backgroundColor: "#0F172A",
            borderColor: palette.border,
            backgroundImage: "radial-gradient(circle at 50% 30%, #1E293B 0%, #0B0F19 100%)",
          }}
        >
          {/* Kazıma Makinesi Vektör İllüstrasyonu */}
          <div className="flex-1 flex flex-col items-center justify-center my-auto">
            <div className="relative w-64 h-40 rounded-2xl border border-cyan-500/30 bg-slate-900/90 shadow-2xl p-4 flex flex-col items-center justify-between overflow-hidden">
              <div className="w-full flex items-center justify-between text-[10px] font-mono text-cyan-400">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  5-AXIS MILLING ACTIVE
                </span>
                <span>TOLERANCE: 0.008 mm</span>
              </div>

              {/* Zirkonyum Blok ve Robotik Frez Vektörü */}
              <div className="relative size-24 flex items-center justify-center">
                {/* Zirkonyum Disk Diski */}
                <div className="size-20 rounded-full border-2 border-slate-400 bg-gradient-to-tr from-slate-200 to-white shadow-lg flex items-center justify-center text-slate-800 text-[10px] font-bold font-mono">
                  ZrO2 98mm
                </div>
                {/* Kazıma Ucu (Spindle Drill) */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-10 bg-cyan-400 rounded shadow-cyan-500/50 shadow-md"></div>
              </div>

              <div className="w-full text-center">
                <span className="text-[11px] font-bold text-slate-200 block">
                  {isEn ? "Precision Zirconia Sintering & Glazing" : "Hassas Zirkonyum Sinterleme ve Glazür"}
                </span>
                <span className="text-[9px] text-slate-400">
                  {isEn ? "Direct Chairside Customization" : "Hasta Başında Anlık Renk ve Form Düzenleme"}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Önemli Avantaj Satırı */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-center">
            <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] text-cyan-400 font-bold block uppercase">
                {isEn ? "Speed" : "Hız & Esneklik"}
              </span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {isEn ? "Same-Day Try-Ins" : "Aynı Gün Prova"}
              </span>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] text-cyan-400 font-bold block uppercase">
                {isEn ? "Direct Feedback" : "Hekim-Tekniker"}
              </span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {isEn ? "Zero Communication Loss" : "Sıfır İletişim Kaybı"}
              </span>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] text-cyan-400 font-bold block uppercase">
                {isEn ? "Customization" : "Kişiselleştirme"}
              </span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {isEn ? "Tailored Shade Match" : "Kişiye Özel Renk"}
              </span>
            </div>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div
          className="rounded-xl border p-2.5 flex items-center justify-between text-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <span className="text-slate-600">
            {isEn
              ? "Equipped with Roland, VHF, and Ivoclar Programat sintering furnaces."
              : "Laboratuvarımız Roland, VHF 5 eksen kazıyıcılar ve Ivoclar Programat fırınları ile donatılmıştır."}
          </span>
          <span className="text-emerald-700 font-bold text-[11px]">CE & ISO 13485</span>
        </div>
      </div>
    </PageFrame>
  );
}
