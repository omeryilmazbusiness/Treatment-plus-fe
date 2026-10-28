"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";

import type { Diagnosis, PriceList, Treatment } from "@/modules/catalog/domain/catalog";
import type { ClinicSettings } from "@/modules/clinic/domain/clinic";
import type { Patient, Plan } from "@/modules/plan/domain/plan";
import { formatMoney, money } from "@/shared/money";
import { Badge } from "@/ui/badge";
import { PriceInput } from "@/ui/price-input";
import { readyPlanAction, savePlanDetailsAction } from "../actions";

interface Props {
  workspaceId: string;
  initialPlan: Plan;
  patients: Patient[];
  diagnosesCatalog: Diagnosis[];
  treatmentsCatalog: Treatment[];
  priceLists: PriceList[];
  clinicSettings: ClinicSettings;
}

export function ClassicPlanClient({
  workspaceId,
  initialPlan,
  diagnosesCatalog,
  treatmentsCatalog,
  priceLists,
  clinicSettings,
}: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const isLocked = plan.status === "ready";

  const [title, setTitle] = useState(plan.title);
  const [diagnoses, setDiagnoses] = useState<string[]>(plan.diagnoses ?? []);

  // Visits
  const [visits, setVisits] = useState(
    (plan.visits ?? []).map((v, i) => ({
      id: v.id ? String(v.id) : `v-temp-${i + 1}`,
      order_num: v.orderNum || i + 1,
      title: v.title || `${i + 1}. Seans`,
    }))
  );

  // Items
  const [items, setItems] = useState(
    (plan.items ?? []).map((it, i) => ({
      id: it.id ? String(it.id) : undefined,
      visit_id: it.visitId ? String(it.visitId) : visits[0]?.id,
      treatment_id: it.treatmentId ? String(it.treatmentId) : undefined,
      treatment_name: it.treatmentName || "",
      tooth_number: it.toothNumber || "",
      quantity: it.quantity || 1,
      unit_price: it.unitPrice || 0, // minor units (kuruş)
      is_package: Boolean(it.isPackage),
      order_num: it.orderNum || i + 1,
    }))
  );

  // Discounts
  const [discounts, setDiscounts] = useState(
    (plan.discounts ?? []).map((d, i) => ({
      id: d.id ? String(d.id) : undefined,
      label: d.label || "İndirim",
      amount: d.amount || 0, // minor units (kuruş)
      order_num: d.orderNum || i + 1,
    }))
  );

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "ok" | "err" } | null>(null);
  const [showConfirmReady, setShowConfirmReady] = useState(false);
  const [customDiagInput, setCustomDiagInput] = useState("");

  // Price map from default price list
  const defaultList = priceLists.find((pl) => pl.isDefault) || priceLists[0];
  const priceMap = new Map<string, number>();
  if (defaultList?.items) {
    for (const pi of defaultList.items) {
      priceMap.set(String(pi.treatmentId), pi.amount);
    }
  }

  // Visit helpers
  const handleAddVisit = () => {
    if (isLocked) return;
    const nextNum = visits.length + 1;
    const newV = {
      id: `v-temp-${Date.now()}`,
      order_num: nextNum,
      title: `${nextNum}. Seans: Kontrol & İşlem`,
    };
    setVisits([...visits, newV]);
  };

  const handleUpdateVisitTitle = (vId: string, newTitle: string) => {
    if (isLocked) return;
    setVisits(
      visits.map((v) => (v.id === vId ? { ...v, title: newTitle } : v))
    );
  };

  // Item helpers
  const handleAddItem = (visitId: string) => {
    if (isLocked) return;
    const firstTr = treatmentsCatalog[0];
    const defaultAmount = firstTr ? priceMap.get(String(firstTr.id)) ?? 0 : 0;

    const newItem = {
      id: undefined,
      visit_id: visitId,
      treatment_id: firstTr ? String(firstTr.id) : undefined,
      treatment_name: firstTr ? firstTr.name : "Yeni Tedavi",
      tooth_number: "",
      quantity: 1,
      unit_price: defaultAmount,
      is_package: false,
      order_num: items.length + 1,
    };
    setItems([...items, newItem]);
  };

  const handleTreatmentChange = (itemIndex: number, treatId: string) => {
    if (isLocked) return;
    const tr = treatmentsCatalog.find((t) => String(t.id) === treatId);
    if (!tr) return;
    const catalogAmount = priceMap.get(treatId) ?? 0;

    setItems((prev) =>
      prev.map((it, idx) =>
        idx === itemIndex
          ? {
              ...it,
              treatment_id: treatId,
              treatment_name: tr.name,
              unit_price: catalogAmount,
              is_package: tr.name.toLowerCase().includes("paket"),
            }
          : it
      )
    );
  };

  const handleItemFieldChange = (
    itemIndex: number,
    field: "tooth_number" | "quantity" | "unit_price" | "is_package",
    value: unknown
  ) => {
    if (isLocked) return;
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== itemIndex) return it;
        return { ...it, [field]: value };
      })
    );
  };

  const handleRemoveItem = (itemIndex: number) => {
    if (isLocked) return;
    setItems(items.filter((_, idx) => idx !== itemIndex));
  };

  // Discount helpers
  const handleAddDiscount = () => {
    if (isLocked) return;
    setDiscounts([
      ...discounts,
      {
        id: undefined,
        label: "Nakit İndirimi",
        amount: 20000,
        order_num: discounts.length + 1,
      },
    ]);
  };

  const handleRemoveDiscount = (idx: number) => {
    if (isLocked) return;
    setDiscounts(discounts.filter((_, i) => i !== idx));
  };

  // Diagnoses toggle
  const toggleDiagnosis = (diagName: string) => {
    if (isLocked) return;
    if (diagnoses.includes(diagName)) {
      setDiagnoses(diagnoses.filter((d) => d !== diagName));
    } else {
      setDiagnoses([...diagnoses, diagName]);
    }
  };

  const addCustomDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDiagInput.trim() || isLocked) return;
    if (!diagnoses.includes(customDiagInput.trim())) {
      setDiagnoses([...diagnoses, customDiagInput.trim()]);
    }
    setCustomDiagInput("");
  };

  // Save Draft (Sends to server, server calculates and returns authoritative totals)
  const handleSaveDraft = () => {
    if (isLocked) return;
    setMessage(null);

    startTransition(async () => {
      const res = await savePlanDetailsAction(String(plan.id), {
        workspaceId,
        title: title.trim(),
        diagnoses,
        visits: visits.map((v, i) => ({
          id: v.id?.startsWith("v-temp-") ? undefined : v.id,
          order_num: i + 1,
          title: v.title,
        })),
        items: items.map((it, i) => ({
          id: it.id,
          visit_id: it.visit_id?.startsWith("v-temp-") ? undefined : it.visit_id,
          treatment_id: it.treatment_id,
          treatment_name: it.treatment_name,
          tooth_number: it.tooth_number || undefined,
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
          is_package: Boolean(it.is_package),
          order_num: i + 1,
        })),
        discounts: discounts.map((d, i) => ({
          id: d.id,
          label: d.label,
          amount: Number(d.amount) || 0,
          order_num: i + 1,
        })),
      });

      if (!res.success || !res.data) {
        setMessage({ text: res.error || "Plan kaydedilemedi", type: "err" });
        return;
      }

      setPlan(res.data);
      setMessage({
        text: "Plan başarıyla kaydedildi. Genel toplam sunucu tarafından hesaplandı.",
        type: "ok",
      });
    });
  };

  // Lock and ready
  const handleLockReady = () => {
    setMessage(null);
    setShowConfirmReady(false);

    startTransition(async () => {
      // First save current inputs
      await savePlanDetailsAction(String(plan.id), {
        workspaceId,
        title: title.trim(),
        diagnoses,
        visits: visits.map((v, i) => ({
          id: v.id?.startsWith("v-temp-") ? undefined : v.id,
          order_num: i + 1,
          title: v.title,
        })),
        items: items.map((it, i) => ({
          id: it.id,
          visit_id: it.visit_id?.startsWith("v-temp-") ? undefined : it.visit_id,
          treatment_id: it.treatment_id,
          treatment_name: it.treatment_name,
          tooth_number: it.tooth_number || undefined,
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
          is_package: Boolean(it.is_package),
          order_num: i + 1,
        })),
        discounts: discounts.map((d, i) => ({
          id: d.id,
          label: d.label,
          amount: Number(d.amount) || 0,
          order_num: i + 1,
        })),
      });

      // Now set ready
      const res = await readyPlanAction(String(plan.id), workspaceId);
      if (!res.success || !res.data) {
        setMessage({ text: res.error || "Plan kilitlenemedi", type: "err" });
        return;
      }

      setPlan(res.data);
      router.refresh();
      setMessage({
        text: "Plan başarıyla kilitlendi (READY). Snapshot donduruldu, PDF baskı verisi hazır.",
        type: "ok",
      });
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/app/plans"
            onClick={() => router.refresh()}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft hover:text-teal"
          >
            &larr; Planlara Dön
          </Link>
          <span className="text-line">/</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink">
            Classic Form
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isLocked ? (
            <Badge tone="ok">🔒 Hazır (Snapshot Kilitli)</Badge>
          ) : (
            <Badge tone="wait">✏️ Taslak Düzenleme</Badge>
          )}
          <span className="text-xs text-ink-soft">
            Para birimi: <strong>{plan.currency} (kuruş bazlı tam sayı)</strong>
          </span>
        </div>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            message.type === "ok"
              ? "border-teal/30 bg-teal/10 text-teal-deep"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Patient Header Card */}
      <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal">
                Hasta Bilgisi
              </span>
              <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs text-teal font-medium">
                🔒 Şifreli İletişim (AES-256)
              </span>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-medium text-ink">
              {plan.patient?.name || "Kayıtlı Hasta"}
            </h2>
            {plan.patient?.contact && (
              <p className="mt-0.5 text-sm text-ink-soft">
                İletişim: {plan.patient.contact}
              </p>
            )}
          </div>

          <div className="w-full sm:w-72">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Plan Başlığı
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-hidden focus:border-teal disabled:opacity-75"
            />
          </div>
        </div>
      </div>

      {/* Diagnoses Section */}
      <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-medium text-ink">
              Teşhis(ler)
            </h3>
            <p className="text-xs text-ink-soft">
              Katalogdan seçin veya hastaya özel teşhis ekleyin.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {diagnosesCatalog.map((d) => {
            const isSelected = diagnoses.includes(d.name);
            return (
              <button
                key={d.id}
                type="button"
                disabled={isLocked}
                onClick={() => toggleDiagnosis(d.name)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? "bg-teal text-white shadow-xs"
                    : "border border-line bg-paper text-ink hover:border-teal"
                } disabled:cursor-not-allowed`}
              >
                {isSelected ? "✓ " : "+ "}
                {d.name} {d.code ? `(${d.code})` : ""}
              </button>
            );
          })}

          {/* Any custom diagnoses not in catalog */}
          {diagnoses
            .filter((d) => !diagnosesCatalog.some((c) => c.name === d))
            .map((customD, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 rounded-xl bg-teal px-3.5 py-1.5 text-xs font-medium text-white"
              >
                ✓ {customD}
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => toggleDiagnosis(customD)}
                    className="ml-1 text-white/80 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
        </div>

        {!isLocked && (
          <form onSubmit={addCustomDiagnosis} className="mt-4 flex max-w-sm gap-2">
            <input
              type="text"
              placeholder="Özel teşhis yaz..."
              value={customDiagInput}
              onChange={(e) => setCustomDiagInput(e.target.value)}
              className="flex-1 rounded-xl border border-line bg-paper px-3 py-1.5 text-xs text-ink outline-hidden focus:border-teal"
            />
            <button
              type="submit"
              className="rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper-2"
            >
              Ekle
            </button>
          </form>
        )}
      </div>

      {/* Main Grid: Visits & Items vs Totals Sidebar */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Visits & Items & Discounts */}
        <div className="space-y-6 lg:col-span-2">
          {visits.map((visit) => {
            const visitItems = items.filter((it) => it.visit_id === visit.id);
            return (
              <div
                key={visit.id}
                className="overflow-hidden rounded-2xl border border-line bg-paper-2 shadow-xs"
              >
                {/* Visit Header */}
                <div className="flex items-center justify-between border-b border-line bg-paper/60 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-teal text-xs font-bold text-white">
                      {visit.order_num}
                    </span>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={visit.title}
                      onChange={(e) =>
                        handleUpdateVisitTitle(visit.id, e.target.value)
                      }
                      className="rounded-lg border-0 bg-transparent font-serif text-base font-medium text-ink focus:bg-paper focus:ring-1 focus:ring-teal disabled:opacity-90"
                    />
                  </div>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => handleAddItem(visit.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal/10 px-3 py-1 text-xs font-medium text-teal hover:bg-teal hover:text-white"
                    >
                      + Tedavi Ekle
                    </button>
                  )}
                </div>

                {/* Items in this visit */}
                <div className="p-4 sm:p-6">
                  {visitItems.length === 0 ? (
                    <p className="py-4 text-center text-xs text-ink-soft">
                      Bu seansta henüz satır yok. “+ Tedavi Ekle” butonuna tıklayın.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {visitItems.map((item) => {
                        const originalIndex = items.findIndex((it) => it === item);
                        const lineTotalMinor = item.is_package
                          ? 0
                          : (Number(item.quantity) || 0) *
                            (Number(item.unit_price) || 0);
                        const lineMoney = money(lineTotalMinor, plan.currency);

                        return (
                          <div
                            key={originalIndex}
                            className={`rounded-xl border p-4 transition ${
                              item.is_package
                                ? "border-wait/40 bg-wait/5"
                                : "border-line bg-paper/40"
                            }`}
                          >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
                              {/* Treatment dropdown */}
                              <div className="sm:col-span-5">
                                <label className="text-xs text-ink-soft">Tedavi</label>
                                <select
                                  disabled={isLocked}
                                  value={item.treatment_id ?? ""}
                                  onChange={(e) =>
                                    handleTreatmentChange(
                                      originalIndex,
                                      e.target.value
                                    )
                                  }
                                  className="mt-0.5 w-full rounded-lg border border-line bg-paper-2 px-2.5 py-1.5 text-xs text-ink outline-hidden focus:border-teal disabled:opacity-75"
                                >
                                  {treatmentsCatalog.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Diş No */}
                              <div className="sm:col-span-2">
                                <label className="text-xs text-ink-soft">Diş No</label>
                                <input
                                  type="text"
                                  disabled={isLocked}
                                  placeholder="Örn: 16"
                                  value={item.tooth_number}
                                  onChange={(e) =>
                                    handleItemFieldChange(
                                      originalIndex,
                                      "tooth_number",
                                      e.target.value
                                    )
                                  }
                                  className="mt-0.5 w-full rounded-lg border border-line bg-paper-2 px-2.5 py-1.5 text-xs text-ink outline-hidden focus:border-teal disabled:opacity-75"
                                />
                              </div>

                              {/* Adet */}
                              <div className="sm:col-span-1">
                                <label className="text-xs text-ink-soft">Adet</label>
                                <input
                                  type="number"
                                  min="1"
                                  disabled={isLocked}
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleItemFieldChange(
                                      originalIndex,
                                      "quantity",
                                      val === "" ? "" : Math.max(1, parseInt(val, 10) || 1)
                                    );
                                  }}
                                  onBlur={() => {
                                    if (!item.quantity || Number(item.quantity) < 1) {
                                      handleItemFieldChange(originalIndex, "quantity", 1);
                                    }
                                  }}
                                  className="mt-0.5 w-full rounded-lg border border-line bg-paper-2 px-2 py-1.5 text-xs text-ink outline-hidden focus:border-teal disabled:opacity-75"
                                />
                              </div>

                              {/* Birim Fiyat (TL input converted to kuruş) */}
                              <div className="sm:col-span-2">
                                <label className="text-xs text-ink-soft">
                                  Birim Fiyat (TL)
                                </label>
                                <PriceInput
                                  disabled={isLocked}
                                  value={item.unit_price}
                                  onChange={(val) =>
                                    handleItemFieldChange(
                                      originalIndex,
                                      "unit_price",
                                      val
                                    )
                                  }
                                  className="mt-0.5 w-full rounded-lg border border-line bg-paper-2 px-2.5 py-1.5 text-xs text-ink outline-hidden focus:border-teal disabled:opacity-75"
                                />
                              </div>

                              {/* Satır Toplamı & Sil */}
                              <div className="flex items-center justify-between sm:col-span-2 sm:justify-end sm:gap-2">
                                <div className="text-right">
                                  <div className="text-xs font-semibold text-ink">
                                    {formatMoney(lineMoney)}
                                  </div>
                                  {item.is_package && (
                                    <span className="text-[10px] text-wait font-medium">
                                      Paket İçi (0 TL)
                                    </span>
                                  )}
                                </div>
                                {!isLocked && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(originalIndex)}
                                    className="rounded-md p-1 text-ink-soft hover:bg-danger/10 hover:text-danger"
                                    title="Satırı Sil"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Paket İçi Toggle */}
                            <div className="mt-2.5 flex items-center gap-2 border-t border-line/40 pt-2">
                              <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
                                <input
                                  type="checkbox"
                                  disabled={isLocked}
                                  checked={item.is_package}
                                  onChange={(e) =>
                                    handleItemFieldChange(
                                      originalIndex,
                                      "is_package",
                                      e.target.checked
                                    )
                                  }
                                  className="rounded text-teal focus:ring-teal"
                                />
                                <span>Paket içi mi?</span>
                              </label>
                              {item.is_package && (
                                <span className="rounded bg-wait/15 px-2 py-0.5 text-[11px] font-medium text-wait">
                                  Paket içi satır toplamı şişirmez
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Visit Button */}
          {!isLocked && (
            <button
              type="button"
              onClick={handleAddVisit}
              className="w-full rounded-2xl border-2 border-dashed border-line bg-paper/50 py-4 text-center text-sm font-medium text-ink-soft transition hover:border-teal hover:bg-paper hover:text-teal"
            >
              + Yeni Seans Ekle
            </button>
          )}

          {/* Discounts Box */}
          <div className="rounded-2xl border border-line bg-paper-2 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-ink">
                  İndirimler
                </h3>
                <p className="text-xs text-ink-soft">
                  Plan geneline uygulanacak etiketli indirimler (Örn: Nakit indirimi).
                </p>
              </div>
              {!isLocked && (
                <button
                  type="button"
                  onClick={handleAddDiscount}
                  className="rounded-lg bg-teal/10 px-3 py-1 text-xs font-medium text-teal hover:bg-teal hover:text-white"
                >
                  + İndirim Ekle
                </button>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {discounts.length === 0 ? (
                <p className="py-2 text-xs text-ink-soft">
                  Henüz indirim eklenmedi.
                </p>
              ) : (
                discounts.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-line bg-paper/40 p-3"
                  >
                    <input
                      type="text"
                      disabled={isLocked}
                      placeholder="İndirim Etiketi"
                      value={d.label}
                      onChange={(e) =>
                        setDiscounts(
                          discounts.map((item, i) =>
                            i === idx ? { ...item, label: e.target.value } : item
                          )
                        )
                      }
                      className="flex-1 rounded-lg border border-line bg-paper-2 px-3 py-1.5 text-xs text-ink outline-hidden focus:border-teal disabled:opacity-75"
                    />
                    <div className="w-32">
                      <PriceInput
                        disabled={isLocked}
                        placeholder="Tutar (TL)"
                        value={d.amount}
                        onChange={(val) =>
                          setDiscounts(
                            discounts.map((item, i) =>
                              i === idx ? { ...item, amount: val } : item
                            )
                          )
                        }
                        className="w-full rounded-lg border border-line bg-paper-2 px-3 py-1.5 text-xs text-ink outline-hidden focus:border-teal disabled:opacity-75"
                      />
                    </div>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDiscount(idx)}
                        className="rounded-md p-1 text-ink-soft hover:bg-danger/10 hover:text-danger"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Server Totals & Actions Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-6 rounded-2xl border border-line bg-paper-2 p-6 shadow-sm">
            <h3 className="font-serif text-lg font-medium text-ink">
              Hesap Özeti
            </h3>
            <p className="text-xs text-ink-soft">
              Toplamı ekran değil sunucu hesaplar.
            </p>

            {/* Totals Breakdown */}
            <div className="mt-5 space-y-3 border-y border-line py-4 text-sm">
              <div className="flex items-center justify-between text-ink-soft">
                <span>Ara Toplam:</span>
                <span className="font-semibold text-ink">
                  {formatMoney(money(plan.totalsSubtotal, plan.currency))}
                </span>
              </div>
              <div className="flex items-center justify-between text-ink-soft">
                <span>İndirim:</span>
                <span className="font-semibold text-danger">
                  - {formatMoney(money(plan.totalsDiscount, plan.currency))}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-line/60 pt-3 text-base font-bold text-ink">
                <span>Genel Toplam:</span>
                <span className="text-teal-deep">
                  {formatMoney(money(plan.totalsGrand, plan.currency))}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-line/80 bg-paper p-3 text-xs text-ink-soft space-y-1">
              <div>⚙️ <strong>Server-Authoritative:</strong></div>
              <div>• Kuruş bazlı para türü kullanılır (float yok).</div>
              <div>• Paket içi satırlar genel toplamı şişirmez.</div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              {!isLocked ? (
                <>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSaveDraft}
                    className="w-full rounded-xl border border-teal bg-paper px-4 py-2.5 text-sm font-semibold text-teal transition hover:bg-teal hover:text-white disabled:opacity-50"
                  >
                    {isPending ? "Kaydediliyor..." : "Taslağı Kaydet & Hesaplat"}
                  </button>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setShowConfirmReady(true)}
                    className="w-full rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-deep disabled:opacity-50"
                  >
                    🔒 Planı Onayla & Kilitle (Ready)
                  </button>
                </>
              ) : (
                <div className="rounded-xl border border-ok/30 bg-ok/10 p-4 text-center">
                  <div className="text-sm font-semibold text-ok">
                    ✓ Plan Kilitlendi (Ready)
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    Snapshot donduruldu. Bu aşamada PDF basılmaz; basılacak veri hazır olur.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Clinic Branding Info */}
          <div className="rounded-2xl border border-line bg-paper-2 p-5 text-xs text-ink-soft">
            <div className="font-semibold uppercase tracking-wider text-ink">
              Klinik Ayarları (Salt Okunur)
            </div>
            <div className="mt-2 space-y-1">
              <div>Klinik: <strong>{clinicSettings.name || "Örnek Klinik"}</strong></div>
              <div>Telefon: {clinicSettings.phone || "+90 555 000 0000"}</div>
              <div>Palet: <Badge>{clinicSettings.palette}</Badge></div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Ready */}
      {showConfirmReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-paper-2 p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-medium text-ink">
              Planı Kilitlemek İstiyor musunuz?
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              Bu işlem planı <strong>READY</strong> durumuna geçirir ve mevcut klinik bilgileri, hasta bilgileri, seanslar ve fiyatları <strong>değiştirilemez snapshot</strong> olarak kilitler.
            </p>
            <p className="mt-2 text-xs text-wait">
              ⚠️ Kilitlendikten sonra satır eklenemez veya silinemez.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmReady(false)}
                className="rounded-xl border border-line px-4 py-2 text-sm text-ink-soft hover:bg-paper"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleLockReady}
                className="rounded-xl bg-teal px-5 py-2 text-sm font-medium text-white hover:bg-teal-deep disabled:opacity-50"
              >
                {isPending ? "Kilitleniyor..." : "Evet, Kilitle (Ready)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locked Snapshot Card (Visible when ready) */}
      {isLocked && Boolean(plan.snapshotJson) && (
        <div className="mt-10 overflow-hidden rounded-3xl border-2 border-teal/40 bg-paper-2 p-8 shadow-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal">
                PDF Baskı Önizlemesi (Veri Hazır)
              </span>
              <h2 className="mt-1 font-serif text-3xl font-medium text-ink">
                {clinicSettings.name || "Tedavi Planı"}
              </h2>
              <p className="text-sm text-ink-soft">
                Hasta: <strong>{plan.patient?.name}</strong> • İletişim: {plan.patient?.contact}
              </p>
            </div>
            <div className="text-right">
              <Badge tone="ok">Snapshot Kilitli</Badge>
              <div className="mt-1 text-xs text-ink-soft">
                Public Link Yok · Güvenli Tenant İçi
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {/* Snapshot Visits & Items */}
            {visits.map((v) => {
              const vItems = items.filter((it) => it.visit_id === v.id);
              return (
                <div key={v.id} className="rounded-xl border border-line/80 bg-paper p-5">
                  <h4 className="font-serif font-medium text-ink">{v.title}</h4>
                  <table className="mt-3 w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-line text-ink-soft">
                        <th className="pb-2">Tedavi</th>
                        <th className="pb-2">Diş</th>
                        <th className="pb-2">Adet</th>
                        <th className="pb-2 text-right">Birim Fiyat</th>
                        <th className="pb-2 text-right">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/40">
                      {vItems.map((it, i) => (
                        <tr key={i} className="text-ink">
                          <td className="py-2 font-medium">
                            {it.treatment_name}
                            {it.is_package && (
                              <span className="ml-2 text-wait">(Paket İçi)</span>
                            )}
                          </td>
                          <td className="py-2 text-ink-soft">{it.tooth_number || "—"}</td>
                          <td className="py-2">{it.quantity}</td>
                          <td className="py-2 text-right">
                            {formatMoney(money(it.unit_price, plan.currency))}
                          </td>
                          <td className="py-2 text-right font-semibold">
                            {formatMoney(
                              money(
                                it.is_package ? 0 : it.quantity * it.unit_price,
                                plan.currency
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* Grand Total Footer */}
            <div className="flex flex-col items-end gap-1 border-t border-line pt-4 text-sm">
              <div className="text-ink-soft">
                Ara Toplam: {formatMoney(money(plan.totalsSubtotal, plan.currency))}
              </div>
              <div className="text-danger">
                İndirim: - {formatMoney(money(plan.totalsDiscount, plan.currency))}
              </div>
              <div className="font-serif text-2xl font-bold text-teal-deep">
                Genel Toplam: {formatMoney(money(plan.totalsGrand, plan.currency))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
