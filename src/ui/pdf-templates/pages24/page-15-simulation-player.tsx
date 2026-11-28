import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { WisePageWrapper, WiseTopWedge, WiseFooter, getThemeColor } from "../wise-frame";

export function Booklet24Page15SimulationPlayer({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const isAr = data.locale === "ar";
  const isRu = data.locale === "ru";
  const themeColor = getThemeColor(palette, "#0b2938");

  // Hastanın sistemdeki mevcut 3D tedavi simülasyonuna doğrudan giden bağlantı
  const simulationUrl =
    data.simulationUrl ||
    (data.shareUrl
      ? `${data.shareUrl}${data.shareUrl.includes("?") ? "&" : "?"}viz=1`
      : "/p/demo-preview?viz=1");

  const qrColorHex = (themeColor || "#0b2938").replace("#", "");
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&color=${qrColorHex}&bgcolor=ffffff&ecc=M&data=${encodeURIComponent(
    simulationUrl
  )}`;

  const totalProcedures = (data.items || []).length;
  const totalVisits = (data.visits || []).length;

  return (
    <WisePageWrapper
      bgImage="/pdf-assets/wise/page_15.jpg"
      className="relative flex flex-col justify-between"
    >
      {/* Arka Plan Üst ve Alt Tema Kenarlıkları (Simülasyon Çerçevesinin Arkasında) */}
      <WiseTopWedge
        themeColor={themeColor}
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 }}
      />
      <WiseFooter
        clinicName={data.clinicName || "Wise Dental"}
        themeColor={themeColor}
        variant="odd"
        hideLogo
        style={{ zIndex: 0 }}
      />

      {/* page_15.jpg iç çerçevesindeki statik arka plan diş modelini tamamen kaldıran temiz klinik yüzey */}
      <div
        className="absolute top-[3.1%] right-[4.8%] bottom-[3.2%] left-[4.65%] z-10 flex flex-col items-center justify-between overflow-hidden rounded-[2px] bg-[#f4f8fb] px-12 py-14"
        style={{
          backgroundImage:
            "radial-gradient(rgba(11, 41, 56, 0.07) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        {/* Üst Başlık Alanı */}
        <div className="flex flex-col items-center text-center max-w-[540px]">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white shadow-xs"
            style={{ backgroundColor: "#F47B00" }}
          >
            <span className="w-2 h-2 size-2 rounded-full bg-white" />
            {isAr
              ? "محاكاة العلاج التفاعلية ثلاثية الأبعاد"
              : isRu
              ? "ИНТЕРАКТИВНАЯ 3D-СИМУЛЯЦИЯ ЛЕЧЕНИЯ"
              : isEn
              ? "INTERACTIVE 3D TREATMENT SIMULATION"
              : "İNTERAKTİF 3D TEDAVİ SİMÜLASYONU"}
          </span>

          <h2
            className="mt-4 text-[28px] font-black tracking-tight uppercase leading-tight"
            style={{ color: themeColor }}
          >
            {isAr
              ? "استكشف محاكاة أسنانك ثلاثية الأبعاد"
              : isRu
              ? "Изучите вашу 3D-симуляцию лечения"
              : isEn
              ? "Explore Your 3D Dental Simulation"
              : "3D Tedavi Simülasyonunuzu İnceleyin"}
          </h2>

          <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-600">
            {isAr
              ? `تم إعدادها خصيصاً لـ ${data.patientName || "مريضنا العزيز"}. امسح رمز QR أدناه بكاميرا هاتفك الذكي للتفاعل مع نموذج أسنانك ثلاثي الأبعاد وخطة العلاج خطوة بخطوة.`
              : isRu
              ? `Подготовлено специально для ${data.patientName || "нашего пациента"}. Отсканируйте QR-код ниже камерой смартфона, чтобы открыть интерактивную 3D-модель и пошаговый план лечения.`
              : isEn
              ? `Prepared exclusively for ${data.patientName || "our valued patient"}. Scan the QR code below with your smartphone camera to interact with your 3D dental model and step-by-step surgical treatment plan.`
              : `Sayın ${data.patientName || "Hastamız"} için özel olarak hazırlanmıştır. Telefonunuzun kamerasıyla aşağıdaki karekodu okutarak sistemdeki 3D ağız ve tedavi simülasyonunuza doğrudan ulaşabilirsiniz.`}
          </p>
        </div>

        {/* Merkez: Büyük, Yüksek Kontrastlı Karekod (QR Code) Kartı */}
        <a
          href={simulationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center rounded-[32px] border-2 border-[#0b2938]/12 bg-white px-12 py-10 shadow-[0_24px_60px_rgba(11,41,56,0.12)] transition hover:border-[#0b2938]/30"
        >
          {/* QR Çerçevesi */}
          <div
            className="relative flex w-[260px] h-[260px] size-[260px] items-center justify-center rounded-[24px] border-2 bg-white p-3.5 shadow-inner"
            style={{ borderColor: themeColor }}
          >
            {/* Köşe Tarama Vurguları */}
            <span
              className="pointer-events-none absolute -top-1.5 -left-1.5 w-6 h-6 size-6 rounded-tl-xl border-t-4 border-l-4"
              style={{ borderColor: "#F47B00" }}
            />
            <span
              className="pointer-events-none absolute -top-1.5 -right-1.5 w-6 h-6 size-6 rounded-tr-xl border-t-4 border-r-4"
              style={{ borderColor: "#F47B00" }}
            />
            <span
              className="pointer-events-none absolute -bottom-1.5 -left-1.5 w-6 h-6 size-6 rounded-bl-xl border-b-4 border-l-4"
              style={{ borderColor: "#F47B00" }}
            />
            <span
              className="pointer-events-none absolute -bottom-1.5 -right-1.5 w-6 h-6 size-6 rounded-br-xl border-b-4 border-r-4"
              style={{ borderColor: "#F47B00" }}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageUrl}
              alt={
                isEn
                  ? "3D Treatment Simulation QR Code"
                  : "3D Tedavi Simülasyonu Karekodu"
              }
              className="h-full w-full object-contain"
            />
          </div>

          {/* Hasta & Plan Özeti Rozetleri */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <span
              className="rounded-lg px-3 py-1 text-[11px] font-extrabold text-white"
              style={{ backgroundColor: themeColor }}
            >
              {data.patientName ||
                (isAr
                  ? "مريضنا العزيز"
                  : isRu
                  ? "Уважаемый пациент"
                  : isEn
                  ? "Valued Patient"
                  : "Sayın Hastamız")}
            </span>
            {data.planNo && (
              <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-[11px] font-bold text-slate-700">
                {data.planNo}
              </span>
            )}
            {totalVisits > 0 && (
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
                {totalVisits}{" "}
                {isAr ? "زيارات" : isRu ? "Визита" : isEn ? "Visits" : "Seans"}
              </span>
            )}
            {totalProcedures > 0 && (
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
                {totalProcedures}{" "}
                {isAr
                  ? "إجراءات"
                  : isRu
                  ? "Процедур"
                  : isEn
                  ? "Procedures"
                  : "Planlanan İşlem"}
              </span>
            )}
          </div>

          {/* Tıklanabilir Simülasyon Başlat Butonu */}
          <div
            className="mt-5 inline-flex items-center gap-2.5 rounded-2xl px-7 py-3 text-[13px] font-extrabold uppercase tracking-wider text-white shadow-md"
            style={{
              background: "linear-gradient(180deg, #FFA33B 0%, #F47B00 100%)",
            }}
          >
            <svg className="w-4 h-4 size-4 fill-current shrink-0" viewBox="0 0 24 24">
              <polygon points="5 3 20 12 5 21 5 3" />
            </svg>
            <span>
              {isAr
                ? "امسح الرمز أو اضغط لفتح المحاكاة ثلاثية الأبعاد"
                : isRu
                ? "Отсканируйте или нажмите для запуска 3D"
                : isEn
                ? "Scan or Click to Open 3D Simulation"
                : "Karekodu Okutun veya 3D Simülasyonu Açın"}
            </span>
          </div>
        </a>

        {/* Alt Kullanım Adımları */}
        <div className="grid w-full max-w-[560px] grid-cols-3 gap-4 text-center">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-2xs">
            <div
              className="mx-auto flex w-6 h-6 size-6 items-center justify-center rounded-full text-[11px] font-black text-white"
              style={{ backgroundColor: themeColor }}
            >
              1
            </div>
            <p className="mt-1.5 text-[11px] font-bold text-slate-800">
              {isAr
                ? "افتح الكاميرا"
                : isRu
                ? "Откройте камеру"
                : isEn
                ? "Open Phone Camera"
                : "Kameranızı Açın"}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {isAr
                ? "وجه كاميرا الهاتف نحو رمز QR"
                : isRu
                ? "Наведите камеру на QR-код"
                : isEn
                ? "Point your camera at the QR code"
                : "Telefon kameranızı karekoda tutun"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-2xs">
            <div
              className="mx-auto flex w-6 h-6 size-6 items-center justify-center rounded-full text-[11px] font-black text-white"
              style={{ backgroundColor: themeColor }}
            >
              2
            </div>
            <p className="mt-1.5 text-[11px] font-bold text-slate-800">
              {isAr
                ? "اضغط على الرابط"
                : isRu
                ? "Перейдите по ссылке"
                : isEn
                ? "Tap Notification"
                : "Bağlantıya Dokunun"}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {isAr
                ? "لا يتطلب تطبيقاً أو كلمة مرور"
                : isRu
                ? "Без пароля и установки приложений"
                : isEn
                ? "No app or password required"
                : "Şifre veya uygulama gerekmez"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-2xs">
            <div
              className="mx-auto flex w-6 h-6 size-6 items-center justify-center rounded-full text-[11px] font-black text-white"
              style={{ backgroundColor: "#F47B00" }}
            >
              3
            </div>
            <p className="mt-1.5 text-[11px] font-bold text-slate-800">
              {isAr
                ? "استكشف بزاوية 360°"
                : isRu
                ? "Изучайте в 3D"
                : isEn
                ? "Explore in 3D"
                : "3D Olarak İnceleyin"}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {isAr
                ? "قم بتدوير وفحص كل سن ثلاثي الأبعاد"
                : isRu
                ? "Вращайте челюсть на 360°"
                : isEn
                ? "Rotate and inspect every tooth"
                : "Çene modelini 360° döndürüp inceleyin"}
            </p>
          </div>
        </div>
      </div>
    </WisePageWrapper>
  );
}
