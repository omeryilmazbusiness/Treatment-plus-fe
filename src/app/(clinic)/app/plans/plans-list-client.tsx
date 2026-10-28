"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";

import type { Patient, Plan } from "@/modules/plan/domain/plan";
import { formatMoney, money } from "@/shared/money";
import { Badge } from "@/ui/badge";
import { createPatientAction, createPlanAction } from "./actions";

interface Props {
  workspaceId: string;
  initialPlans: Plan[];
  initialPatients: Patient[];
}

export function PlansListClient({
  workspaceId,
  initialPlans,
  initialPatients,
}: Props) {
  const router = useRouter();
  const [createdPlans, setCreatedPlans] = useState<Plan[]>([]);
  const [createdPatients, setCreatedPatients] = useState<Patient[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Combine server plans with any newly created plans
  const plans = [
    ...createdPlans.filter((cp) => !initialPlans.some((ip) => ip.id === cp.id)),
    ...initialPlans,
  ];

  const patients = [
    ...initialPatients,
    ...createdPatients.filter((cp) => !initialPatients.some((ip) => ip.id === cp.id)),
  ];

  useEffect(() => {
    router.refresh();
  }, [router]);

  // Modal form state
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatients[0]?.id ?? ""
  );
  const [isCreatingPatient, setIsCreatingPatient] = useState(
    initialPatients.length === 0
  );
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientContact, setNewPatientContact] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [formError, setFormError] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    startTransition(async () => {
      let patientId = selectedPatientId;

      if (isCreatingPatient) {
        if (!newPatientName.trim()) {
          setFormError("Hasta adı zorunludur.");
          return;
        }
        const patRes = await createPatientAction(
          newPatientName.trim(),
          newPatientContact.trim(),
          workspaceId
        );
        if (!patRes.success || !patRes.data) {
          setFormError(patRes.error || "Hasta eklenemedi.");
          return;
        }
        patientId = patRes.data.id;
        setCreatedPatients((prev) => [...prev, patRes.data!]);
      }

      if (!patientId) {
        setFormError("Lütfen bir hasta seçin veya yeni hasta ekleyin.");
        return;
      }

      const planRes = await createPlanAction(
        patientId,
        planTitle.trim() || "Tedavi Planı (Classic)",
        ["Dentin Çürüğü"],
        workspaceId
      );

      if (!planRes.success || !planRes.data) {
        setFormError(planRes.error || "Plan oluşturulamadı.");
        return;
      }

      setCreatedPlans((prev) => [planRes.data!, ...prev]);
      setShowModal(false);
      // Navigate to plan detail
      router.push(`/app/plans/${planRes.data.id}`);
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">
              Tedavi Planları
            </h1>
            <Badge tone="ok">Faz 4 · Classic Form</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            “Bu hasta için ne, kaç seans, kaça?” — Sunucu hesaplamalı, PDF verisi hazır planlar.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-deep"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Classic Plan Oluştur
        </button>
      </div>

      {/* Plan List */}
      <div className="mt-8">
        {plans.length === 0 ? (
          <div className="rounded-2xl border border-line bg-paper-2 p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-teal/10 text-teal">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 font-serif text-lg font-medium text-ink">Henüz plan bulunmuyor</h3>
            <p className="mt-1 text-sm text-ink-soft">
              İlk hastanız için 2 seanslı, indirimli ve server-hesaplamalı classic planınızı oluşturun.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-deep"
            >
              Hemen Başla
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-paper-2 shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper text-xs font-semibold uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="w-[24%] min-w-[210px] px-6 py-4">Hasta</th>
                  <th className="w-[30%] min-w-[220px] px-6 py-4">Plan Başlığı</th>
                  <th className="w-[14%] min-w-[140px] px-6 py-4">Durum</th>
                  <th className="w-[11%] min-w-[110px] px-6 py-4">Seanslar</th>
                  <th className="w-[10%] min-w-[110px] px-6 py-4 text-right">Genel Toplam</th>
                  <th className="w-[11%] min-w-[130px] px-6 py-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {plans.map((p) => {
                  const m = money(p.totalsGrand, p.currency);
                  const isReady = p.status?.toLowerCase() === "ready";
                  return (
                    <tr
                      key={p.id}
                      className="group transition-colors hover:bg-paper/40"
                    >
                      {/* Hasta Bilgisi: Okunaklı İsim + Hemen Altında İletişim */}
                      <td className="px-6 py-4.5 align-top">
                        <div className="font-semibold text-ink text-base tracking-tight whitespace-nowrap">
                          {p.patient?.name || "İsimsiz Hasta"}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
                          <svg className="size-3.5 text-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="font-medium tracking-tight text-ink/80">
                            {p.patient?.contact ? p.patient.contact : "İletişim bilgisi yok"}
                          </span>
                        </div>
                      </td>

                      {/* Plan Başlığı & Teşhisler */}
                      <td className="px-6 py-4.5 align-top">
                        <Link
                          href={`/app/plans/${p.id}`}
                          className="font-medium text-teal hover:underline text-sm"
                        >
                          {p.title || "Classic Plan"}
                        </Link>
                        {p.diagnoses && p.diagnoses.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {p.diagnoses.map((d, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-md border border-line/70 bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft whitespace-nowrap"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Durum */}
                      <td className="px-6 py-4.5 align-top whitespace-nowrap">
                        {isReady ? (
                          <Badge tone="ok">🔒 Hazır (Kilitli)</Badge>
                        ) : (
                          <Badge tone="wait">✏️ Taslak</Badge>
                        )}
                      </td>

                      {/* Seanslar */}
                      <td className="px-6 py-4.5 align-top whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-line/70 bg-paper px-2.5 py-1 text-xs font-medium text-ink">
                          <svg className="size-3.5 text-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {p.visits && p.visits.length > 0
                            ? `${p.visits.length} Seans`
                            : "2 Seans"}
                        </span>
                      </td>

                      {/* Genel Toplam */}
                      <td className="px-6 py-4.5 align-top text-right whitespace-nowrap">
                        <div className="font-serif text-base font-bold text-ink">
                          {formatMoney(m)}
                        </div>
                      </td>

                      {/* İşlem */}
                      <td className="px-6 py-4.5 align-top text-right whitespace-nowrap">
                        <Link
                          href={`/app/plans/${p.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-teal hover:bg-teal hover:text-white shadow-2xs"
                        >
                          <span>{isReady ? "İncele (Kilitli)" : "Düzenle"}</span>
                          <span className="text-sm leading-none">&rarr;</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-paper-2 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h2 className="font-serif text-xl font-medium text-ink">
                Yeni Classic Tedavi Planı
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-ink-soft hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs text-danger">
                  {formError}
                </div>
              )}

              {/* Patient Selector */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Hasta
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingPatient(!isCreatingPatient)}
                    className="text-xs font-medium text-teal hover:underline"
                  >
                    {isCreatingPatient ? "Mevcut Hastalardan Seç" : "+ Yeni Hasta Ekle"}
                  </button>
                </div>

                {isCreatingPatient ? (
                  <div className="mt-2 space-y-2 rounded-xl border border-line bg-paper p-3">
                    <input
                      type="text"
                      placeholder="Hasta Adı Soyadı *"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      className="w-full rounded-lg border border-line bg-paper-2 px-3 py-2 text-sm text-ink outline-hidden focus:border-teal"
                      required
                    />
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="İletişim (Telefon / E-posta) - Şifreli saklanır"
                        value={newPatientContact}
                        onChange={(e) => setNewPatientContact(e.target.value)}
                        className="w-full rounded-lg border border-line bg-paper-2 px-3 py-2 text-sm text-ink outline-hidden focus:border-teal"
                      />
                      <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-teal">
                        🔒 AES-256
                      </span>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-paper-2 px-3 py-2.5 text-sm text-ink outline-hidden focus:border-teal"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.contact ? `(${p.contact})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Plan Title */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Plan Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: 2026 Kapsamlı Tedavi Planı"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper-2 px-3 py-2.5 text-sm text-ink outline-hidden focus:border-teal"
                />
              </div>

              <div className="rounded-xl border border-line/70 bg-paper p-3 text-xs text-ink-soft">
                💡 Yeni plan <strong>2 seans</strong> ile taslak olarak başlayacak. Tedavileri seçip indirim eklediğinizde sunucu genel toplamı hesaplar.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-line px-4 py-2 text-sm text-ink-soft hover:bg-paper"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-teal px-5 py-2 text-sm font-medium text-white hover:bg-teal-deep disabled:opacity-50"
                >
                  {isPending ? "Oluşturuluyor..." : "Planı Başlat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
