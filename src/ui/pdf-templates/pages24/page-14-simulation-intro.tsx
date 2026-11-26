import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { PageFrame } from "../page-frame";
import { Play, Sparkles, Video, Eye, QrCode } from "../icons";

export function Booklet24Page14SimulationIntro({
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
      pageNumber={14}
      totalPages={24}
      pageTitle={isEn ? "See Your Plan in Action (3D Video)" : "Tedavi Planınızı 3 Boyutlu İzleyin"}
    >
      <div className="size-full flex flex-col justify-between py-2 space-y-4">
        {/* Üst Kısım: Başlık & Metin */}
        <div className="space-y-3">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: palette.light, color: palette.primary }}
          >
            <Video className="size-3.5" style={{ color: palette.accent }} />
            <span>{isEn ? "DIGITAL TWIN & INTERACTIVE 3D ANIMATION" : "DİJİTAL İKİZ & İNTERAKTİF 3 BOYUTLU SİMÜLASYON"}</span>
          </div>

          <h2
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: palette.primary, fontFamily: palette.headingFont }}
          >
            {isEn ? "See Your Plan in Action" : "Planınızı 3 Boyutlu Harekette Görün"}
          </h2>

          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {isEn
              ? "With our personalized 3D animations, you get a real-time preview of your procedure, step by step. From the initial step to the final result, our advanced digital technology brings your treatment plan to life, helping you understand your options and feel confident in every clinical decision."
              : "Kliniğimizin yüksek teknolojili 3D animasyon altyapısı sayesinde, tedavinizi adım adım ve gerçek zamanlı olarak önceden izleyebilirsiniz. İlk cerrahi adımdan nihai estetik gülüşünüze kadar tüm süreç dijital ortamda simüle edilir; böylece seçeneklerinizi net görür ve her aşamada tam güven duyarsınız."}
          </p>

          <p className="text-xs text-slate-500 leading-relaxed">
            {isEn
              ? "Your jaw structure, bone density, implant angulations and tooth proportions are accurately mapped into a dynamic 3D patient model accessible anytime from your smartphone."
              : "Çene yapınız, kemik kalınlığınız, implant açıları ve diş oranlarınız kişiye özel dinamik bir 3D hasta modeline dönüştürülmüştür. Akıllı telefonunuzdan dilediğiniz zaman erişebilirsiniz."}
          </p>
        </div>

        {/* Watch Now Buton Kartı */}
        <div
          className="rounded-2xl p-5 border flex items-center justify-between shadow-sm relative overflow-hidden"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isEn ? "Online Interactive Player" : "Çevrimiçi İnteraktif Oynatıcı"}
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {isEn ? "Watch 3D Surgical & Aesthetic Simulation" : "3D Cerrahi ve Estetik Simülasyonu Başlatın"}
            </h3>
            <p className="text-xs text-slate-500">
              {isEn ? "Interactive 360° rotation with full timeline controls" : "360° dönebilen interaktif çene modeli ve seans geçişleri"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow-md cursor-pointer transition transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
              }}
            >
              <Play className="size-4 fill-white" />
              <span className="text-xs tracking-wider uppercase">
                {isEn ? "Watch Now" : "Hemen İzle"}
              </span>
            </div>
          </div>
        </div>

        {/* 3D Filmstrip Şerit Animasyon Grafiği (wise_2.pdf Filmstrip) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
            <span>{isEn ? "3D Sequential Reconstruction Milestones" : "3D Aşamalı Rekonstrüksiyon Adımları"}</span>
            <span className="text-cyan-600 font-mono">100% CAD/CAM Precision</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-lg flex items-center justify-between gap-2 overflow-hidden">
            {/* 4 Aşamalı Film Şeridi */}
            {[
              { step: "1", title: isEn ? "Initial Arch" : "Başlangıç", desc: isEn ? "Pre-Op Scan" : "Ağız İçi Tarama" },
              { step: "2", title: isEn ? "Implant Sites" : "İmplant Yuvaları", desc: isEn ? "Virtual Surgery" : "Sanal Cerrahi" },
              { step: "3", title: isEn ? "Multi-Units" : "Dayanaklar", desc: isEn ? "Screw Placement" : "Vida Konumu" },
              { step: "4", title: isEn ? "Permanent Bridge" : "Kalıcı Köprü", desc: isEn ? "Final Smile" : "Estetik Gülüş" },
            ].map((f, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center text-center">
                <div className="w-full h-16 rounded-lg bg-slate-900 border border-slate-700/80 flex flex-col items-center justify-center p-1 relative overflow-hidden mb-1.5">
                  <div className="absolute top-1 left-1.5 text-[8px] font-mono text-cyan-400 font-bold">
                    #{f.step}
                  </div>
                  <div className="size-7 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                    <Sparkles className="size-3.5" />
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1">{f.desc}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-200">{f.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QR Kod & Hasta Portalı Bilgisi */}
        <div
          className="rounded-xl border p-3 flex items-center justify-between text-xs"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
        >
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shadow-2xs">
              <QrCode className="size-8 text-slate-800" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">
                {isEn ? "Direct Mobile 3D Access" : "Kameranızı Doğrultup 3D Modeli Açın"}
              </span>
              <span className="text-[11px] text-slate-500">
                {isEn
                  ? "Scan the QR code with your phone to open the interactive simulation without passwords."
                  : "Telefonunuzun kamerasını QR koda tutarak şifresiz ve anında 3D modelinize erişebilirsiniz."}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold">
            HD 60FPS
          </span>
        </div>
      </div>
    </PageFrame>
  );
}
