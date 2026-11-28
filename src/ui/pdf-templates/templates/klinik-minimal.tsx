import React from "react";
import type { PdfPalette, PdfPlanData } from "../types";
import { formatCurrency } from "../palettes";
import { Phone, Mail, Globe, MapPin, Tooth, CheckCircle2, ShieldCheck, Sparkles } from "../icons";

export function KlinikMinimalTemplate({
  data,
  palette,
}: {
  data: PdfPlanData;
  palette: PdfPalette;
}) {
  const isEn = data.locale === "en";
  const isAr = data.locale === "ar";
  const isRu = data.locale === "ru";
  const curr = data.currency || "TRY";

  const totalCalculated = (data.items || []).reduce((sum, it) => sum + (it.isPackage ? 0 : it.amount || 0), 0);
  const subtotal = data.subtotal !== undefined && data.subtotal !== null ? data.subtotal : totalCalculated;
  const discount = data.discountTotal !== undefined && data.discountTotal !== null ? data.discountTotal : 0;
  const grandTotal =
    data.grandTotal !== undefined && data.grandTotal !== null
      ? data.grandTotal
      : Math.max(0, subtotal - discount);

  return (
    <div className="relative flex min-h-[297mm] h-[297mm] max-h-[297mm] w-[210mm] flex-col justify-between bg-white text-slate-800 font-sans shadow-sm overflow-hidden box-border select-none">
      {/* 1. ÜST HEADER BANDI (KOYU SLATE BLUE #0F172A) */}
      <div className="h-16 w-full bg-[#0F172A] px-8 flex items-center justify-between text-white shrink-0 z-20">
        <div className="flex items-center gap-3">
          {data.logoUrl ? (
            <div className="size-10 rounded-lg bg-white p-1 border border-white/40 shadow-xs">
              <img src={data.logoUrl} alt={data.clinicName} className="size-full object-contain" />
            </div>
          ) : (
            <div className="size-9 rounded-lg bg-[#0284C7] text-white font-bold text-xs flex items-center justify-center">
              {(data.clinicName || "KM").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-tight">
              {data.clinicName}
            </h1>
            <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#0284C7]">
              {isAr
                ? "مركز طب وجراحة الأسنان المتقدم"
                : isRu
                ? "ЦЕНТР ПЕРЕДОВОЙ СТОМАТОЛОГИИ И ХИРУРГИИ"
                : isEn
                ? "ADVANCED CLINICAL DENTISTRY"
                : "İLERİ DİŞ HEKİMLİĞİ VE CERRAHİ MERKEZİ"}
            </p>
          </div>
        </div>

        <div className="text-center">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0284C7] block">
            {isAr
              ? "ملخص صفحة واحدة"
              : isRu
              ? "СВОДКА НА 1 СТРАНИЦЕ"
              : isEn
              ? "1-PAGE SUMMARY"
              : "1 SAYFALIK ÖZET PLAN"}
          </span>
          <h2 className="text-base font-black tracking-wider uppercase text-white">
            {isAr
              ? "خطة علاج المريض"
              : isRu
              ? "ПЛАН ЛЕЧЕНИЯ ПАЦИЕНТА"
              : isEn
              ? "PATIENT TREATMENT PLAN"
              : "HASTA TEDAVİ PLANI"}
          </h2>
        </div>

        <div className="text-right text-[10px] font-mono space-y-0.5">
          <span className="text-white font-bold block">{data.patientName}</span>
          <span className="text-slate-400 block">{data.planNo || "#TP-2026-001"}</span>
          <span className="text-slate-400 block">{data.dateStr || data.date}</span>
        </div>
      </div>

      {/* 2. GÖVDE: HASTA KİMLİK & 4 FAZLI YOL HARİTASI ŞERİDİ */}
      <div className="flex-1 px-8 py-4 flex flex-col justify-between space-y-3">
        {/* HASTA & HEKİM DEMOGRAFİK KARTI (Soft Ice Blue) */}
        <div className="rounded-xl border border-[#BAE6FD] bg-[#F0F7FF] p-3">
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                {isAr ? "اسم المريض" : isRu ? "ПАЦИЕНТ" : isEn ? "PATIENT NAME" : "HASTA ADI"}
              </span>
              <span className="font-bold text-slate-900 truncate block mt-0.5">{data.patientName}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                {isAr ? "الطبيب المعالج" : isRu ? "ЛЕЧАЩИЙ ВРАЧ" : isEn ? "ATTENDING DENTIST" : "SORUMLU HEKİM"}
              </span>
              <span className="font-bold text-slate-800 truncate block mt-0.5">{data.doctorName || "Dr. Selin Yılmaz"}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                {isAr ? "تاريخ الخطة" : isRu ? "ДАТА ПЛАНА" : isEn ? "PLAN DATE" : "PLAN TARİHİ"}
              </span>
              <span className="font-mono font-medium text-slate-700 block mt-0.5">{data.dateStr || data.date}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                {isAr ? "الهاتف" : isRu ? "ТЕЛЕФОН" : isEn ? "CONTACT PHONE" : "İLETİŞİM"}
              </span>
              <span className="font-mono font-medium text-slate-700 block mt-0.5">{data.phone || "+90 212 555 0100"}</span>
            </div>
          </div>
        </div>

        {/* 4 FAZLI YOL HARİTASI ÖZET ŞERİDİ */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-lg bg-white border border-rose-200 p-1.5 space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-rose-700 uppercase block">
                {isAr ? "المرحلة 1" : isRu ? "Этап 1" : isEn ? "Phase 1" : "Faz 1: Acil"}
              </span>
              <span className="text-[10px] font-bold text-slate-900 block truncate">
                {isAr ? "التشخيص والعلاج الأولي" : isRu ? "Диагностика и санация" : isEn ? "Diagnosis & Care" : "Ağrı & Enfeksiyon"}
              </span>
            </div>
            <div className="rounded-lg bg-white border border-amber-200 p-1.5 space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-amber-800 uppercase block">
                {isAr ? "المرحلة 2" : isRu ? "Этап 2" : isEn ? "Phase 2" : "Faz 2: Restoratif"}
              </span>
              <span className="text-[10px] font-bold text-slate-900 block truncate">
                {isAr ? "علاج الجذور والحشوات" : isRu ? "Эндодонтия и пломбы" : isEn ? "Endo & Fillings" : "Kanal & Dolgular"}
              </span>
            </div>
            <div className="rounded-lg bg-white border border-[#BAE6FD] p-1.5 space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-[#0284C7] uppercase block">
                {isAr ? "المرحلة 3" : isRu ? "Этап 3" : isEn ? "Phase 3" : "Faz 3: Cerrahi"}
              </span>
              <span className="text-[10px] font-bold text-slate-900 block truncate">
                {isAr ? "الزراعة الجراحية" : isRu ? "Имплантация" : isEn ? "Implants & Bone" : "İmplant & Kemik"}
              </span>
            </div>
            <div className="rounded-lg bg-white border border-emerald-200 p-1.5 space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-emerald-800 uppercase block">
                {isAr ? "المرحلة 4" : isRu ? "Этап 4" : isEn ? "Phase 4" : "Faz 4: Estetik"}
              </span>
              <span className="text-[10px] font-bold text-slate-900 block truncate">
                {isAr ? "تركيبات الزركونيا" : isRu ? "Циркониевые протезы" : isEn ? "Monolithic Zirconia" : "Monolitik Zirkonyum"}
              </span>
            </div>
          </div>
        </div>

        {/* TEDAVİ KALEMLERİ VE FİYAT TABLOSU */}
        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F172A] text-white text-[10px] uppercase font-mono font-bold tracking-wider">
              <tr>
                <th className="py-2 px-3">{isAr ? "الإجراء العلاجي" : isRu ? "ПРОЦЕДУРА" : isEn ? "TREATMENT PROCEDURE" : "TEDAVİ KALEMİ"}</th>
                <th className="py-2 px-3">{isAr ? "الزيارة" : isRu ? "ВИЗИТ / ЭТАП" : isEn ? "SESSION / PHASE" : "SEANS / FAZ"}</th>
                <th className="py-2 px-3 text-center">{isAr ? "السن" : isRu ? "ЗУБ" : isEn ? "TOOTH" : "DİŞ"}</th>
                <th className="py-2 px-3 text-center">{isAr ? "العدد" : isRu ? "КОЛ-ВО" : isEn ? "QTY" : "ADET"}</th>
                <th className="py-2 px-3 text-right">{isAr ? "المبلغ" : isRu ? "СУММА" : isEn ? "AMOUNT" : "TUTAR"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(data.items || []).slice(0, 8).map((it, idx) => (
                <tr key={it.name + idx} className={idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"}>
                  <td className="py-1.5 px-3 font-semibold text-slate-900">{it.name}</td>
                  <td className="py-1.5 px-3 text-[10px] text-slate-600 font-medium">{it.session || "1. Seans"}</td>
                  <td className="py-1.5 px-3 text-center font-mono font-bold text-[#0284C7]">
                    {it.toothNumber || (it.teeth && it.teeth.length > 0 ? it.teeth.join(", ") : "-")}
                  </td>
                  <td className="py-1.5 px-3 text-center font-mono font-bold">{it.quantity || 1}</td>
                  <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(it.amount, curr, data.locale)}
                  </td>
                </tr>
              ))}
              {(!data.items || data.items.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400 text-xs">
                    {isAr ? "لا توجد عناصر" : isRu ? "Нет процедур" : isEn ? "No items" : "Plan kalemi bulunmuyor."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FİNANSAL ÖZET & MALİ GÜVENCE ŞERİDİ */}
        <div className="grid grid-cols-12 gap-4 items-end">
          {/* Sol: Mali Güvence & Garanti Notları (7 Kolon) */}
          <div className="col-span-7 rounded-xl border border-[#BAE6FD] bg-[#F0F7FF] p-3 space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284C7] block">
              {isAr
                ? "الضمان السريري والشروط المالية"
                : isRu
                ? "КЛИНИЧЕСКАЯ ГАРАНТИЯ И УСЛОВИЯ"
                : isEn
                ? "CLINICAL WARRANTY & GUARANTEE"
                : "KLİNİK GARANTİ VE MALİ ŞARTLAR"}
            </span>
            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? "العرض مضمون بسعر ثابت لمدة 30 يوماً دون أي رسوم إضافية."
                    : isRu
                    ? "Предложение включает гарантию фиксированной цены на 30 дней без скрытых доплат."
                    : isEn
                    ? "Fixed price guarantee valid for 30 days with no hidden fees."
                    : "Teklif 30 gün boyunca sabit fiyat garantilidir; hiçbir ek ücret talep edilmez."}
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? "غرسات التيتانيوم مضمونة مدى الحياة وجسور الزركونيا مضمونة لمدة 10 سنوات."
                    : isRu
                    ? "Пожизненная гарантия на титановые имплантаты и 10 лет гарантии на циркониевые мосты."
                    : isEn
                    ? "Titanium implants carry a lifetime warranty; zirconia bridges carry a 10-year warranty."
                    : "Titanyum implantlar ömür boyu, monolitik zirkonyum köprüler 10 yıl garantilidir."}
                </span>
              </div>
            </div>
          </div>

          {/* Sağ: Koyu Slate Blue (#0F172A) Vurgulu Özet Kutusu (5 Kolon) */}
          <div className="col-span-5 rounded-2xl bg-[#0F172A] border-2 border-[#0284C7] p-3.5 text-white shadow-md space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>{isAr ? "المجموع الفرعي:" : isRu ? "Подытог:" : isEn ? "Subtotal:" : "Ara Toplam:"}</span>
              <span className="font-mono line-through text-slate-400">{formatCurrency(subtotal, curr, data.locale)}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-400">
              <span>{isAr ? "الخصم:" : isRu ? "Скидка:" : isEn ? "Discount:" : "Paket İndirimi:"}</span>
              <span className="font-mono font-bold">-{formatCurrency(discount, curr, data.locale)}</span>
            </div>
            <div className="h-px bg-slate-700 my-0.5" />
            <div className="flex justify-between items-baseline pt-0.5">
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#0284C7] uppercase">
                {isAr ? "الإجمالي العام:" : isRu ? "ИТОГО:" : isEn ? "TOTAL:" : "GENEL TOPLAM:"}
              </span>
              <span className="text-xl font-black text-white font-mono">
                {formatCurrency(grandTotal, curr, data.locale)}
              </span>
            </div>
          </div>
        </div>

        {/* İMZA VE KAŞE KUTULARI */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                {isAr ? "موافقة المريض" : isRu ? "ПОДПИСЬ ПАЦИЕНТА" : isEn ? "PATIENT APPROVAL" : "HASTA ONAYI"}
              </span>
              <span className="font-bold text-slate-900 block">{data.patientName}</span>
              <span className="text-[9px] text-slate-500 font-mono">
                {isAr ? "التوقيع:" : isRu ? "Подпись:" : isEn ? "Sign:" : "İmza:"} __________________
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-400">{data.dateStr || data.date}</span>
          </div>

          <div className="rounded-xl border border-[#BAE6FD] bg-[#F0F7FF] p-2.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase text-[#0284C7] block">
                {isAr ? "ختم وتوقيع الطبيب" : isRu ? "ПЕЧАТЬ И ПОДПИСЬ ВРАЧА" : isEn ? "DOCTOR STAMP & SIGN" : "HEKİM KAŞE & İMZA"}
              </span>
              <span className="font-bold text-slate-900 block">{data.doctorName || "Dr. Selin Yılmaz"}</span>
              <span className="text-[9px] text-slate-500 font-mono">Diploma No: 48291</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-700 font-bold">
              {isAr ? "معتمد" : isRu ? "Одобрено" : isEn ? "Approved" : "Onaylandı"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. EN ALT FOOTER BANDI (KOYU SLATE BLUE #0F172A) */}
      <div className="h-10 w-full bg-[#0F172A] px-8 flex items-center justify-between text-white text-[9.5px] shrink-0 z-20">
        <div className="flex items-center gap-5">
          {data.phone && (
            <span className="flex items-center gap-1 font-medium">
              <Phone className="size-2.5 text-[#0284C7]" />
              <span>{data.phone}</span>
            </span>
          )}
          {data.website && (
            <span className="flex items-center gap-1 font-medium">
              <Globe className="size-2.5 text-[#0284C7]" />
              <span>{data.website}</span>
            </span>
          )}
          {data.email && (
            <span className="flex items-center gap-1 font-medium">
              <Mail className="size-2.5 text-[#0284C7]" />
              <span>{data.email}</span>
            </span>
          )}
        </div>

        <div className="text-right font-mono text-slate-400">
          <span>{data.address || "İstanbul / Türkiye"}</span>
        </div>
      </div>
    </div>
  );
}
