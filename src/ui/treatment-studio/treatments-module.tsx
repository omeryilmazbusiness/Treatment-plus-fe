"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  BadgePercent,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  FileSpreadsheet,
  Layers,
  Plus,
  Receipt,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import { FdiOdontogram, TOOTH_METADATA } from "./fdi-odontogram";
import { DEFAULT_TEMPLATES, DraftsModal } from "./drafts-modal";
import type { SavedDraftTemplate, StudioPlanItem, StudioVisit, ToothCondition, TreatmentType } from "./types";

interface TreatmentsModuleProps {
  conditions: Record<string, ToothCondition>;
  items: StudioPlanItem[];
  visits: StudioVisit[];
  currency?: "EUR" | "USD" | "TRY";
  onItemsChange: (items: StudioPlanItem[]) => void;
  onVisitsChange: (visits: StudioVisit[]) => void;
  onOpenDraftsModal?: () => void;
}

const DEFAULT_PROCEDURE_PRICES: Record<TreatmentType, { name: string; price: number }> = {
  extraction: { name: "Diş Çekimi (Simple Extraction)", price: 85 },
  prosthesis_removal: { name: "Eski Protez Sökümü (Removal)", price: 120 },
  filling: { name: "Kompozit Dolgu (Composite Filling)", price: 95 },
  dentures: { name: "Sabit / Hareketli Protez (Denture)", price: 850 },
  root_canal: { name: "Kanal Tedavisi (Endodontics)", price: 210 },
  implant: { name: "Titanyum İmplant (Nobel Biocare)", price: 650 },
  crown: { name: "Zirkonyum Kuron (Zirconia Crown)", price: 260 },
  bridge: { name: "Zirkonyum Köprü Gövdesi (Pontic)", price: 260 },
  general: { name: "Genel Teşhis & Profilaksi", price: 75 },
  other: { name: "Diğer Klinik İşlem", price: 100 },
};

export function TreatmentsModule({
  conditions,
  items,
  visits,
  currency = "EUR",
  onItemsChange,
  onVisitsChange,
}: TreatmentsModuleProps) {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"cash" | "card">("cash");
  const [note, setNote] = useState<string>("");

  const handleToggleTooth = (toothNumber: string) => {
    setSelectedTeeth((prev) =>
      prev.includes(toothNumber)
        ? prev.filter((t) => t !== toothNumber)
        : [...prev, toothNumber]
    );
  };

  const activeTreatmentsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    items.forEach((it) => {
      it.teeth.forEach((t) => {
        if (!map[t]) map[t] = [];
        map[t].push(it.treatmentName);
      });
    });
    return map;
  }, [items]);

  // Adding treatment procedure via green pills
  const handleAddTreatment = (type: TreatmentType) => {
    const meta = DEFAULT_PROCEDURE_PRICES[type];
    const targetTeeth = selectedTeeth.length > 0 ? [...selectedTeeth] : ["11"];
    const targetVisitId = visits[0]?.id || "v-1";

    const newItem: StudioPlanItem = {
      id: `it-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      treatmentType: type,
      treatmentName: meta.name,
      teeth: targetTeeth,
      quantity: targetTeeth.length || 1,
      unitPrice: meta.price,
      visitId: targetVisitId,
    };

    onItemsChange([...items, newItem]);
    setSelectedTeeth([]);
  };

  // Applying pre-saved draft template (e.g. All-on-4, All-on-6)
  const handleApplyTemplate = (tpl: SavedDraftTemplate) => {
    // 1. Setup Visits if not existing
    const newVisits: StudioVisit[] = [
      {
        id: "v-allon4-1",
        orderNum: 1,
        title: "1. Seans: İmplantasyon ve Hibrit Protez Teslimi",
        phaseLabel: "1. Cerrahi & Yükleme",
        chartTeeth: ["12", "14", "22", "24", "32", "34", "42", "44"],
      },
      {
        id: "v-allon4-2",
        orderNum: 2,
        title: "2. Seans: Kalıcı Zirkonyum Köprü Simantasyonu",
        phaseLabel: "2. Protetik Tamamlama",
        healingNote: "6 Ay İyileşme Süresi",
        healingMonths: 6,
        chartTeeth: ["16", "26", "36", "46"],
      },
    ];

    // 2. Generate items from template
    const newItems: StudioPlanItem[] = [];

    // Upper package
    if (tpl.packageUpperPrice) {
      newItems.push({
        id: `tpl-pkg-upper-${Date.now()}`,
        treatmentType: "implant",
        treatmentName: "All-on-4 (Nobel Biocare) Üst Çene Paketi",
        teeth: ["12", "14", "22", "24"],
        quantity: 1,
        unitPrice: tpl.packageUpperPrice,
        isPackage: true,
        visitId: "v-allon4-1",
      });
    }

    // Lower package
    if (tpl.packageLowerPrice) {
      newItems.push({
        id: `tpl-pkg-lower-${Date.now()}`,
        treatmentType: "implant",
        treatmentName: "All-on-4 (Nobel Biocare) Alt Çene Paketi",
        teeth: ["32", "34", "42", "44"],
        quantity: 1,
        unitPrice: tpl.packageLowerPrice,
        isPackage: true,
        visitId: "v-allon4-1",
      });
    }

    // Detailed components
    tpl.items
      .filter((it) => it.type !== "package")
      .forEach((it, idx) => {
        newItems.push({
          id: `tpl-it-${idx}-${Date.now()}`,
          treatmentType: it.type === "implant" ? "implant" : it.type === "denture" ? "dentures" : "other",
          treatmentName: it.label,
          teeth: it.teeth,
          quantity: it.teeth.length || 1,
          unitPrice: 0, // Included in package
          visitId: "v-allon4-1",
        });
      });

    onVisitsChange(newVisits);
    onItemsChange(newItems);
  };

  const handleRemoveItem = (id: string) => {
    onItemsChange(items.filter((it) => it.id !== id));
  };

  const handleUpdateItemField = (id: string, field: "quantity" | "unitPrice", val: number) => {
    onItemsChange(
      items.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  // Pricing calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => {
      // If it's a package or standard priced line
      return acc + (it.unitPrice || 0) * (it.quantity || 1);
    }, 0);
  }, [items]);

  const cashDiscountAmount = Math.round(subtotal * 0.01);
  const cardExtraAmount = Math.round(subtotal * 0.02);

  const finalTotal =
    paymentOption === "cash"
      ? Math.max(0, subtotal - cashDiscountAmount)
      : subtotal + cardExtraAmount;

  const currSymbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "₺";

  return (
    <div className="space-y-6">
      {/* 1. Odontogram & Treatment Action Buttons (Exact layout of Image 2) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8 Cols: Odontogram */}
        <div className="xl:col-span-8 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">İşlem Yapılacak Dişler:</span>
              <span className="font-bold text-blue-700 text-xs">
                {selectedTeeth.length > 0 ? selectedTeeth.join(", ") : "Lütfen diş seçiniz"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsDraftsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 text-xs transition shadow-xs cursor-pointer active:scale-95"
            >
              <Sparkles className="size-3.5 text-blue-400" />
              <span>Hazır Şablonlar (Saved drafts)</span>
            </button>
          </div>

          <FdiOdontogram
            conditions={conditions}
            selectedTeeth={selectedTeeth}
            onToggleTooth={handleToggleTooth}
            activeTreatments={activeTreatmentsMap}
          />
        </div>

        {/* Right 4 Cols: Treatment Action Buttons (Green pills as in Image 2) */}
        <div className="xl:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tedavi İşlemleri
              </div>
              <p className="text-[11px] text-slate-400">
                Diş seçip ilgili işleme tıklayarak plana ekleyin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { type: "extraction" as const, label: "Extraction (Çekim)" },
              { type: "prosthesis_removal" as const, label: "Prosthesis removal" },
              { type: "filling" as const, label: "Filling (Dolgu)" },
              { type: "dentures" as const, label: "Dentures (Protez)" },
              { type: "root_canal" as const, label: "Root canal treatment" },
              { type: "implant" as const, label: "Implant (İmplant)" },
              { type: "crown" as const, label: "Crown (Kuron)" },
              { type: "bridge" as const, label: "Bridge (Köprü)" },
              { type: "general" as const, label: "General" },
              { type: "other" as const, label: "Other..." },
            ].map((btn) => (
              <button
                key={btn.type}
                type="button"
                onClick={() => handleAddTreatment(btn.type)}
                className="flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-3 text-xs shadow-xs transition cursor-pointer active:scale-95"
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hazır şablonlardan yükleyin:</span>
            <button
              type="button"
              onClick={() => {
                const first = DEFAULT_TEMPLATES[0];
                if (first) handleApplyTemplate(first);
              }}
              className="text-blue-700 font-bold hover:underline"
            >
              Hızlı All-on-4
            </button>
          </div>
        </div>
      </div>

      {/* 2. Treatment Plan Table & Dynamic Pricing Summary (Image 2 bottom) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Tedavi Planınız (Your Treatment Plan)</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {items.length} Kalem
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Sigorta (Insurance)
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Ödeme Planı (Payment plan)
            </button>
          </div>
        </div>

        {/* Item List Table */}
        {items.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Henüz tedavi kalemi eklenmedi. Yukarıdaki butonlardan işlem seçin veya &quot;Hazır Şablonlar&quot;ı kullanın.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">İşlem / Tedavi</th>
                  <th className="py-2.5 px-3">Diş No (FDI)</th>
                  <th className="py-2.5 px-3 text-center">Adet</th>
                  <th className="py-2.5 px-3 text-right">Birim Fiyat</th>
                  <th className="py-2.5 px-3 text-right">Toplam Tutar</th>
                  <th className="py-2.5 px-3 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const lineTotal = (item.quantity || 1) * (item.unitPrice || 0);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          {item.isPackage && (
                            <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[9px] font-bold text-blue-800">
                              PAKET
                            </span>
                          )}
                          <span>{item.treatmentName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {item.teeth.map((t) => (
                            <span
                              key={t}
                              className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItemField(item.id, "quantity", Math.max(1, Number(e.target.value)))
                          }
                          className="w-12 text-center rounded-lg border border-slate-200 py-1 text-xs font-bold"
                        />
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600">
                        {item.unitPrice ? `${currSymbol} ${item.unitPrice.toLocaleString()}` : "Dahil"}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {lineTotal > 0 ? `${currSymbol} ${lineTotal.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Totals and Dynamic Payment Options (Matching Image 2 lower box) */}
        <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Cols: Dynamic Calculation & Payment Options */}
          <div className="lg:col-span-8 rounded-2xl bg-slate-50/70 p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-700">
                TOTAL (Genel Toplam)
              </span>
              <span className="text-xl font-black text-slate-900">
                {currSymbol} {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                ÖDEME SEÇENEKLERİ (PAYMENT OPTIONS)
              </div>

              {/* Cash option */}
              <div
                onClick={() => setPaymentOption("cash")}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                  paymentOption === "cash"
                    ? "bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-xs"
                    : "bg-transparent border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentOption === "cash"}
                    onChange={() => setPaymentOption("cash")}
                    className="accent-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-800">Cash (Nakit)</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    %1 İndirim
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    {currSymbol} {(subtotal - cashDiscountAmount).toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-emerald-600">
                    (-{currSymbol} {cashDiscountAmount})
                  </span>
                </div>
              </div>

              {/* Card option */}
              <div
                onClick={() => setPaymentOption("card")}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                  paymentOption === "card"
                    ? "bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-xs"
                    : "bg-transparent border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentOption === "card"}
                    onChange={() => setPaymentOption("card")}
                    className="accent-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-800">Card (Kredi Kartı)</span>
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                    %2 Ekstra
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    {currSymbol} {(subtotal + cardExtraAmount).toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    (+{currSymbol} {cardExtraAmount})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Note Box */}
          <div className="lg:col-span-4 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Klinik Notu (Note)
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: 1. faz cerrahi sonrası 7 gün antibiyotik kullanımı ve 6 ay osteointegrasyon beklenecektir."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 focus:bg-white focus:border-slate-900 focus:outline-hidden transition resize-none shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Drafts Modal */}
      <DraftsModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
}
