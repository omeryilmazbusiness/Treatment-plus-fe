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
  Lock,
  Minus,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Unlock,
  Wallet,
  X,
} from "lucide-react";
import { FdiOdontogram, TOOTH_METADATA } from "./fdi-odontogram";
import {
  inferTreatmentType,
  type StudioPlanItem,
  type StudioVisit,
  type ToothCondition,
  type TreatmentType,
} from "./types";
import type { Treatment } from "@/modules/catalog/domain/catalog";

interface TreatmentsModuleProps {
  conditions: Record<string, ToothCondition>;
  items: StudioPlanItem[];
  visits: StudioVisit[];
  currency?: "EUR" | "USD" | "TRY";
  onItemsChange: (items: StudioPlanItem[]) => void;
  onVisitsChange: (visits: StudioVisit[]) => void;
  isLocked?: boolean;
  onUnlockPlan?: () => Promise<boolean> | boolean;
  treatmentsCatalog?: Treatment[];
  priceMap?: Map<string, number>;
}

export function TreatmentsModule({
  conditions,
  items,
  visits,
  currency = "EUR",
  onItemsChange,
  onVisitsChange,
  isLocked = false,
  onUnlockPlan,
  treatmentsCatalog,
  priceMap,
}: TreatmentsModuleProps) {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [paymentOption, setPaymentOption] = useState<"cash" | "card">("cash");
  const [note, setNote] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Strictly treatments registered in Clinic Settings (Ayarlar > Tedavi & Fiyat Listesi)
  const clinicCatalog = useMemo(() => {
    if (treatmentsCatalog) {
      return treatmentsCatalog
        .filter((t) => t.isActive !== false)
        .map((t) => {
          const minor = priceMap?.get(String(t.id)) ?? 0;
          const price = minor > 0 ? minor / 100 : 0;
          return {
            id: String(t.id),
            code: t.code || "",
            name: t.name,
            price,
            type: inferTreatmentType(t.name, t.code),
          };
        });
    }
    // Standalone demo fallback only when no clinic session is available
    return [
      { id: "demo-tr01", code: "TR01", name: "Kompozit Dolgu (Estetik)", price: 1500, type: "filling" as const },
      { id: "demo-tr02", code: "TR02", name: "Kanal Tedavisi (Endodonti)", price: 3500, type: "root_canal" as const },
      { id: "demo-tr03", code: "TR03", name: "Zirkonyum Porselen Kron", price: 4800, type: "crown" as const },
      { id: "demo-tr04", code: "TR04", name: "Dental İmplant Tedavisi", price: 14000, type: "implant" as const },
    ];
  }, [treatmentsCatalog, priceMap]);

  // Filtered clinic treatments
  const filteredClinicTreatments = useMemo(() => {
    if (!searchQuery.trim()) return clinicCatalog;
    const q = searchQuery.toLowerCase().trim();
    return clinicCatalog.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.code && t.code.toLowerCase().includes(q))
    );
  }, [clinicCatalog, searchQuery]);

  // Adding treatment procedure from catalog
  const handleAddTreatmentItem = async (treatment: {
    id: string;
    code?: string;
    name: string;
    price: number;
    type: TreatmentType;
  }) => {
    if (isLocked) {
      if (onUnlockPlan) {
        const ok = await onUnlockPlan();
        if (!ok) return;
      } else {
        return;
      }
    }

    const targetTeeth = [...selectedTeeth];
    const targetVisitId = visits[0]?.id || "v-1";

    const newItem: StudioPlanItem = {
      id: `it-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      treatmentId: treatment.id.startsWith("demo-") ? undefined : treatment.id,
      treatmentCode: treatment.code,
      treatmentType: treatment.type,
      treatmentName: treatment.name,
      teeth: targetTeeth,
      quantity: targetTeeth.length || 1,
      unitPrice: treatment.price,
      visitId: targetVisitId,
    };

    onItemsChange([...items, newItem]);
    setSelectedTeeth([]);
  };

  const handleRemoveItem = (id: string) => {
    if (isLocked) return;
    onItemsChange(items.filter((it) => it.id !== id));
  };

  const handleUpdateItemQuantity = (id: string, delta: number) => {
    if (isLocked) return;
    onItemsChange(
      items.map((it) => {
        if (it.id === id) {
          const current = it.quantity || 1;
          const updated = Math.max(1, current + delta);
          return { ...it, quantity: updated };
        }
        return it;
      })
    );
  };

  // Pricing calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => {
      return acc + (it.unitPrice || 0) * (it.quantity || 1);
    }, 0);
  }, [items]);

  const currSymbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "₺";

  return (
    <div className="space-y-6">
      {/* Kilitli Plan Bilgilendirme Uyarısı */}
      {isLocked && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 font-semibold shadow-2xs">
          <Lock className="size-4 text-amber-600 shrink-0" />
          <span>Bu tedavi planı onaylanıp kilitlendiği için tedavi kalemleri ve seanslar düzenlemeye kapatılmıştır (salt okunur mod).</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. Odontogram & Treatment Action Panel                         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs items-stretch">
        {/* Left 8/9 Columns: Anatomical Odontogram */}
        <div className="xl:col-span-8 2xl:col-span-9 flex flex-col h-full">
          <FdiOdontogram
            conditions={conditions}
            selectedTeeth={selectedTeeth}
            onToggleTooth={handleToggleTooth}
            activeTreatments={activeTreatmentsMap}
            className="w-full select-none rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 transition-all flex flex-col justify-between h-full"
          />
        </div>

        {/* Right 4/3 Columns: Treatment Status Buttons (Yalnızca Ayarlardaki Tedaviler) */}
        <div className="xl:col-span-4 2xl:col-span-3 flex flex-col justify-between space-y-3.5 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 transition h-full">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-slate-900 ring-2 ring-slate-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Tedavi Belirle
                </span>
                <span
                  className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700"
                  title="Klinik Ayarlarındaki Tedavi & Fiyat Listesi ile birebir senkronize"
                >
                  {clinicCatalog.length} İşlem
                </span>
              </div>
              {selectedTeeth.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTeeth([])}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                >
                  Seçimi Kaldır
                </button>
              )}
            </div>

            {/* Selected teeth notification */}
            {selectedTeeth.length > 0 ? (
              <div className="flex items-center gap-2 p-2 px-2.5 rounded-xl bg-slate-900 text-white shadow-2xs">
                <span className="text-[11px] font-bold text-slate-300">
                  {selectedTeeth.length} Diş Seçili:
                </span>
                <span className="text-xs text-white font-mono font-bold tracking-tight">
                  {selectedTeeth.map((t) => `#${t}`).join(", ")}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 leading-snug">
                Odontogramdan diş seçip işleme tıklayın:
              </p>
            )}

            {/* Kilitli Plan Bilgilendirme Bannerı */}
            {isLocked && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Lock className="size-3.5 text-amber-600 shrink-0" />
                  <span>Plan Kilitli (Salt Okunur)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Tedavi eklemek veya değiştirmek için kilidi açabilirsiniz.
                </p>
                {onUnlockPlan && (
                  <button
                    type="button"
                    onClick={onUnlockPlan}
                    className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 text-xs shadow-2xs transition cursor-pointer"
                  >
                    <Unlock className="size-3.5" />
                    <span>Kilidi Aç & Düzenle</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick search input (only if > 6 treatments) */}
            {clinicCatalog.length > 6 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="İşlem veya kod ara (TR01, Dolgu...)"
                  className="w-full rounded-xl border border-slate-200/80 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            )}

            {/* Registered Clinic Treatments List (Strictly from Settings) */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredClinicTreatments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {searchQuery
                    ? "Aramanızla eşleşen kayıtlı tedavi bulunamadı."
                    : "Klinik ayarlarında kayıtlı tedavi işlemi bulunmuyor."}
                </div>
              ) : (
                filteredClinicTreatments.map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => handleAddTreatmentItem(tr)}
                    className="group w-full flex items-center justify-between gap-2.5 rounded-xl border border-slate-200/90 bg-white p-2.5 text-left transition shadow-2xs hover:border-slate-400 hover:bg-slate-100/70 hover:shadow-xs active:scale-[0.99] cursor-pointer"
                    title={`${tr.name} - ${currSymbol} ${tr.price.toLocaleString()}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {tr.code && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] font-bold text-slate-700 border border-slate-200/60 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          {tr.code}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-slate-950">
                        {tr.name}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs font-bold text-slate-900">
                        {tr.price > 0 ? `${currSymbol} ${tr.price.toLocaleString()}` : `0 ${currSymbol}`}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {!isLocked && items.length > 0 && (
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                {items.length} işlem eklendi
              </span>
              <button
                type="button"
                onClick={() => {
                  onItemsChange([]);
                  setSelectedTeeth([]);
                }}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50/80 hover:text-rose-700 cursor-pointer active:scale-95"
                title="Tüm tedavi işlemlerini sıfırla"
              >
                <RotateCcw className="size-3 text-slate-400 group-hover:text-rose-600 group-hover:-rotate-45 transition-transform" />
                <span>Planı Sıfırla</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. Treatment Plan Table (Left) & Pricing + Notes (Right)       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left 8/9 Columns: Treatment Plan Table Card */}
        <div className="xl:col-span-8 2xl:col-span-9 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-slate-900 ring-2 ring-slate-200" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Tedavi Planınız (Your Treatment Plan)
              </h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                {items.length} Kalem
              </span>
            </div>
            {!isLocked && items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onItemsChange([]);
                  setSelectedTeeth([]);
                }}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50/80 hover:text-rose-700 cursor-pointer active:scale-95"
                title="Tüm tedavi işlemlerini sıfırla"
              >
                <RotateCcw className="size-3 text-slate-400 group-hover:text-rose-600 group-hover:-rotate-45 transition-transform" />
                <span>Planı Sıfırla</span>
              </button>
            )}
          </div>

          {/* Item List Table */}
          {items.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Henüz tedavi kalemi eklenmedi. Yukarıdaki odontogramdan diş seçip klinik işlemine tıklayın.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/60">
                    <th className="py-2.5 px-3 rounded-l-lg">İşlem / Tedavi</th>
                    <th className="py-2.5 px-3">Diş No (FDI)</th>
                    <th className="py-2.5 px-3 text-center">Adet</th>
                    <th className="py-2.5 px-3 text-right">Birim Fiyat</th>
                    <th className="py-2.5 px-3 text-right">Toplam Tutar</th>
                    <th className="py-2.5 px-3 text-center rounded-r-lg">İşlem</th>
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
                              <span className="rounded bg-slate-900 text-white px-1.5 py-0.5 text-[9px] font-bold">
                                PAKET
                              </span>
                            )}
                            {item.treatmentCode && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700 border border-slate-200/60">
                                {item.treatmentCode}
                              </span>
                            )}
                            <span>{item.treatmentName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {item.teeth && item.teeth.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1">
                              {item.teeth.map((t) => (
                                <span
                                  key={t}
                                  className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium italic">
                              Genel / Tüm Ağız
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            {!isLocked && (
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQuantity(item.id, -1)}
                                className="size-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition text-xs font-bold cursor-pointer"
                                title="Adet azalt"
                              >
                                -
                              </button>
                            )}
                            <span className="inline-flex items-center justify-center min-w-7 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-xs">
                              {item.quantity}
                            </span>
                            {!isLocked && (
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQuantity(item.id, 1)}
                                className="size-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition text-xs font-bold cursor-pointer"
                                title="Adet artır"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-600">
                          {item.unitPrice ? `${currSymbol} ${item.unitPrice.toLocaleString()}` : "Dahil"}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {lineTotal > 0 ? `${currSymbol} ${lineTotal.toLocaleString()}` : "—"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {!isLocked ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 4/3 Columns: Pricing Card + Note Card below it */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-4">
          {/* 1. Fiyat & Ödeme Seçenekleri Kartı */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-slate-900 ring-2 ring-slate-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Toplam Tutar
                </span>
              </div>
              <span className="text-xl font-black text-slate-900">
                {currSymbol} {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                ÖDEME SEÇENEKLERİ (PAYMENT OPTIONS)
              </div>

              {/* Cash option */}
              <div
                onClick={() => {
                  if (!isLocked) setPaymentOption("cash");
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  isLocked ? "cursor-default" : "cursor-pointer"
                } ${
                  paymentOption === "cash"
                    ? "bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    disabled={isLocked}
                    checked={paymentOption === "cash"}
                    onChange={() => {
                      if (!isLocked) setPaymentOption("cash");
                    }}
                    className="accent-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-800">Cash (Nakit)</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    {currSymbol} {subtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Card option */}
              <div
                onClick={() => {
                  if (!isLocked) setPaymentOption("card");
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  isLocked ? "cursor-default" : "cursor-pointer"
                } ${
                  paymentOption === "card"
                    ? "bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    disabled={isLocked}
                    checked={paymentOption === "card"}
                    onChange={() => {
                      if (!isLocked) setPaymentOption("card");
                    }}
                    className="accent-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-800">Card (Kredi Kartı)</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    {currSymbol} {subtotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Klinik Notu Kartı (Fiyat kartının hemen altında) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-slate-900 ring-2 ring-slate-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Klinik Notu (Note)
                </span>
              </div>
            </div>
            <textarea
              rows={4}
              disabled={isLocked}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: 1. faz cerrahi sonrası 7 gün antibiyotik kullanımı ve 6 ay osteointegrasyon beklenecektir."
              className="w-full text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition resize-y shadow-2xs disabled:bg-slate-100/80 disabled:text-slate-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}