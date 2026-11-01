"use client";

import React, { useMemo, useState } from "react";
import {
  BadgePercent,
  Minus,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { FdiOdontogram, TOOTH_METADATA } from "./fdi-odontogram";
import {
  inferTreatmentType,
  type PlanDiscount,
  type StudioPlanItem,
  type StudioVisit,
  type ToothCondition,
  type TreatmentType,
} from "./types";
import type { Treatment } from "@/modules/catalog/domain/catalog";
import { PriceInput } from "@/ui/price-input";
import { formatMoney, money, type Currency } from "@/shared/money";

function generateStudioItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `it-${crypto.randomUUID()}`;
  }
  return `it-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

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
  discounts?: PlanDiscount[];
  onDiscountsChange?: (discounts: PlanDiscount[]) => void;
  onLockReady?: () => Promise<void> | void;
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
  discounts = [],
  onDiscountsChange,
  onLockReady,
}: TreatmentsModuleProps) {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [note, setNote] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleToggleTooth = (toothNumber: string) => {
    if (isLocked) return;
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
  const handleAddTreatmentItem = (treatment: {
    id: string;
    code?: string;
    name: string;
    price: number;
    type: TreatmentType;
  }) => {
    if (isLocked) return;

    const targetTeeth = [...selectedTeeth];
    const targetVisitId = visits[0]?.id || "v-1";

    const newItem: StudioPlanItem = {
      id: generateStudioItemId(),
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

  // Discount handlers
  const handleAddDiscount = () => {
    if (isLocked) return;
    const nextDiscounts = [
      ...discounts,
      {
        id: undefined,
        label: "Nakit İndirimi",
        amount: 20000,
        order_num: discounts.length + 1,
      },
    ];
    onDiscountsChange?.(nextDiscounts);
  };

  const handleUpdateDiscount = (idx: number, field: "label" | "amount", value: string | number) => {
    if (isLocked) return;
    const nextDiscounts = discounts.map((d, i) =>
      i === idx ? { ...d, [field]: value } : d
    );
    onDiscountsChange?.(nextDiscounts);
  };

  const handleRemoveDiscount = (idx: number) => {
    if (isLocked) return;
    const nextDiscounts = discounts.filter((_, i) => i !== idx);
    onDiscountsChange?.(nextDiscounts);
  };

  // Pricing calculations
  const subtotalMinor = useMemo(() => {
    return items.reduce((acc, it) => {
      if (it.isPackage) return acc;
      return acc + (Number(it.quantity) || 1) * Math.round((Number(it.unitPrice) || 0) * 100);
    }, 0);
  }, [items]);

  const totalDiscountMinor = useMemo(() => {
    return discounts.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  }, [discounts]);

  const grandTotalMinor = Math.max(0, subtotalMinor - totalDiscountMinor);

  const currSymbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "₺";

  return (
    <div className="space-y-6">


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
            readonly={isLocked}
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
              {selectedTeeth.length > 0 && !isLocked && (
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



            {/* Quick search input (only if > 6 treatments) */}
            {clinicCatalog.length > 6 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLocked}
                  placeholder="İşlem veya kod ara (TR01, Dolgu...)"
                  className="w-full rounded-xl border border-slate-200/80 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
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
                    disabled={isLocked}
                    onClick={() => handleAddTreatmentItem(tr)}
                    className="group w-full flex items-center justify-between gap-2.5 rounded-xl border border-slate-200/90 bg-white p-2.5 text-left transition shadow-2xs hover:border-slate-400 hover:bg-slate-100/70 hover:shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200/90 disabled:hover:bg-white disabled:active:scale-100"
                    title={
                      isLocked
                        ? "Plan kilitli (Değişiklik yapmak için kilidi açın)"
                        : `${tr.name} - ${currSymbol} ${tr.price.toLocaleString()}`
                    }
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
        {/* Left 8/9 Columns: Treatment Plan Table Card + Discounts Card */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
          {/* 1. Tedavi Planınız Tablo Kartı */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
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
                  {items.map((item, idx) => {
                    const lineTotal = (item.quantity || 1) * (item.unitPrice || 0);
                    return (
                      <tr key={item.id ? `${item.id}-${idx}` : `item-${idx}`} className="hover:bg-slate-50/70 transition">
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

        {/* 2. İndirimler & İskontolar Kartı (Tedavi Planınız Kartının Altında) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BadgePercent className="size-4 text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                İndirimler & İskontolar
              </h3>
              {discounts.length > 0 && (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                  - {formatMoney(money(totalDiscountMinor, currency))}
                </span>
              )}
            </div>
            {!isLocked && (
              <button
                type="button"
                onClick={handleAddDiscount}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition"
              >
                <Plus className="size-3.5" />
                <span>İndirim Ekle</span>
              </button>
            )}
          </div>

          <div className="mt-3 space-y-2">
            {discounts.length === 0 ? (
              <p className="py-3 text-center text-xs text-slate-400">
                Bu plana henüz özel indirim uygulanmadı.
              </p>
            ) : (
              discounts.map((d, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2 text-xs"
                >
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder="İndirim Etiketi (Örn: Nakit İndirimi)"
                    value={d.label}
                    onChange={(e) => handleUpdateDiscount(idx, "label", e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden"
                  />
                  <div className="w-32">
                    <PriceInput
                      disabled={isLocked}
                      placeholder="Tutar"
                      value={d.amount}
                      onChange={(val) => handleUpdateDiscount(idx, "amount", val)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-right text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden"
                    />
                  </div>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDiscount(idx)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      title="İndirimi Kaldır"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right 4/3 Columns: Fatura & Hesap Özeti Card + Note Card below it */}
      <div className="xl:col-span-4 2xl:col-span-3 space-y-4">
        {/* Fatura & Hesap Özeti Kartı */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                <Receipt className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Fatura & Hesap Özeti
                </h3>
                <p className="text-[11px] text-slate-500">
                  Resmi kuruş hassasiyetli tutarlar
                </p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {items.length} Kalem
            </span>
          </div>

          {/* Fatura / Masraf Dökümü (Kasa Fişi & Fatura Formatı) */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-dashed border-slate-200 pb-2">
              <span>Hizmet / İşlem</span>
              <span>Tutar</span>
            </div>

            {items.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                Henüz tedavi kalemi eklenmedi.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
                {visits.length > 0 && visits.some((v) => items.some((it) => it.visitId === v.id)) ? (
                  visits.map((visit) => {
                    const visitItems = items.filter((it) => it.visitId === visit.id);
                    if (visitItems.length === 0) return null;

                    return (
                      <div key={visit.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="truncate">{visit.title}</span>
                        </div>

                        <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                          {visitItems.map((item, idx) => {
                            const itemUnitMinor = Math.round((Number(item.unitPrice) || 0) * 100);
                            const itemTotalMinor = item.isPackage
                              ? 0
                              : (Number(item.quantity) || 1) * itemUnitMinor;

                            return (
                              <div
                                key={idx}
                                className="flex items-start justify-between gap-2 text-xs"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-semibold text-slate-800">
                                    {item.treatmentName || "Tedavi"}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    {item.teeth && item.teeth.length > 0 && (
                                      <span className="rounded bg-slate-200/80 px-1 font-semibold text-slate-700">
                                        Diş: {item.teeth.join(", ")}
                                      </span>
                                    )}
                                    <span>
                                      {item.quantity || 1} Adet ×{" "}
                                      {formatMoney(money(itemUnitMinor, currency))}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  {item.isPackage ? (
                                    <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                      Paket İçi
                                    </span>
                                  ) : (
                                    <span className="font-bold text-slate-900">
                                      {formatMoney(money(itemTotalMinor, currency))}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="space-y-1.5">
                    {items.map((item, idx) => {
                      const itemUnitMinor = Math.round((Number(item.unitPrice) || 0) * 100);
                      const itemTotalMinor = item.isPackage
                        ? 0
                        : (Number(item.quantity) || 1) * itemUnitMinor;

                      return (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-slate-800">
                              {item.treatmentName || "Tedavi"}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              {item.teeth && item.teeth.length > 0 && (
                                <span className="rounded bg-slate-200/80 px-1 font-semibold text-slate-700">
                                  Diş: {item.teeth.join(", ")}
                                </span>
                              )}
                              <span>
                                {item.quantity || 1} Adet ×{" "}
                                {formatMoney(money(itemUnitMinor, currency))}
                              </span>
                            </div>
                          </div>

                            <div className="text-right shrink-0">
                              {item.isPackage ? (
                                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                  Paket İçi
                                </span>
                              ) : (
                                <span className="font-bold text-slate-900">
                                  {formatMoney(money(itemTotalMinor, currency))}
                                </span>
                              )}
                            </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Varsa seansı eşleşmeyen diğer kalemler */}
                {visits.length > 0 &&
                  items.filter((it) => !visits.some((v) => v.id === it.visitId)).length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-700">Diğer İşlemler</div>
                      <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                        {items
                          .filter((it) => !visits.some((v) => v.id === it.visitId))
                          .map((item, idx) => {
                            const itemUnitMinor = Math.round((Number(item.unitPrice) || 0) * 100);
                            const itemTotalMinor = item.isPackage
                              ? 0
                              : (Number(item.quantity) || 1) * itemUnitMinor;

                            return (
                              <div
                                key={idx}
                                className="flex items-start justify-between gap-2 text-xs"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-semibold text-slate-800">
                                    {item.treatmentName || "Tedavi"}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    {item.teeth && item.teeth.length > 0 && (
                                      <span className="rounded bg-slate-200/80 px-1 font-semibold text-slate-700">
                                        Diş: {item.teeth.join(", ")}
                                      </span>
                                    )}
                                    <span>
                                      {item.quantity || 1} Adet ×{" "}
                                      {formatMoney(money(itemUnitMinor, currency))}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  {item.isPackage ? (
                                    <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                      Paket İçi
                                    </span>
                                  ) : (
                                    <span className="font-bold text-slate-900">
                                      {formatMoney(money(itemTotalMinor, currency))}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                {/* Uygulanan İndirimler */}
                {discounts.length > 0 && (
                  <div className="pt-2 border-t border-dashed border-slate-200 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                      Uygulanan İndirimler
                    </div>
                    {discounts.map((d, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-rose-600"
                      >
                        <span className="truncate">{d.label || "İndirim"}</span>
                        <span className="font-bold shrink-0">
                          - {formatMoney(money(d.amount, currency))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tutar Dökümü */}
          <div className="space-y-2 border-y border-slate-100 py-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Ara Toplam:</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatMoney(money(subtotalMinor, currency))}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Toplam İndirim:</span>
              <span className="font-bold text-rose-600 text-sm">
                - {formatMoney(money(totalDiscountMinor, currency))}
              </span>
            </div>
          </div>

          {/* Genel Toplam Vurgulu Kartı */}
          <div className="rounded-xl bg-slate-900 p-4 text-white shadow-xs">
            <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              Genel Toplam (KDV Dahil)
            </div>
            <div className="mt-1 text-2xl font-black tracking-tight">
              {formatMoney(money(grandTotalMinor, currency))}
            </div>
          </div>
        </div>

        {/* Klinik Notu Kartı */}
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