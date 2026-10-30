"use client";

import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  FilePlus,
  FileText,
  Filter,
  Pencil,
  Phone,
  Plus,
  PlusCircle,
  Search,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import type { Patient, Plan } from "@/modules/plan/domain/plan";
import { formatMoney, money } from "@/shared/money";
import { createPatientAction, createPlanAction } from "./actions";
import { PlanShareModal } from "./plan-share-modal";

interface Props {
  workspaceId: string;
  initialPlans: Plan[];
  initialPatients: Patient[];
}

const TITLE_SUGGESTIONS = [
  "İmplant ve Kuron Planı",
  "Estetik Gülüş Tasarımı",
  "Zirkonyum Kaplama",
  "Kanal ve Dolgu Tedavisi",
  "Ortodonti & Şeffaf Plak",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) return "H";
  if (parts.length === 1 || !last) return first.slice(0, 2).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
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
  const [sharePlan, setSharePlan] = useState<Plan | null>(null);
  const [isPending, startTransition] = useTransition();

  // Combine server plans with any newly created plans
  const plans = useMemo(() => [
    ...createdPlans.filter((cp) => !initialPlans.some((ip) => ip.id === cp.id)),
    ...initialPlans,
  ], [createdPlans, initialPlans]);

  const patients = useMemo(() => [
    ...initialPatients,
    ...createdPatients.filter((cp) => !initialPatients.some((ip) => ip.id === cp.id)),
  ], [initialPatients, createdPatients]);

  useEffect(() => {
    router.refresh();
  }, [router]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ready" | "draft">("all");

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

  // Custom Combobox state for modal
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close combobox when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
    }
    if (isPatientDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPatientDropdownOpen]);

  // Filtered patients for the combobox inside modal
  const filteredModalPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const q = patientSearch.toLowerCase().trim();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.contact && p.contact.toLowerCase().includes(q))
    );
  }, [patients, patientSearch]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? patients[0],
    [patients, selectedPatientId]
  );

  // Filtered plans for the table
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      // Status filter
      if (statusFilter === "ready" && p.status?.toLowerCase() === "draft") return false;
      if (statusFilter === "draft" && p.status?.toLowerCase() !== "draft") return false;

      // Search filter
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      const pName = p.patient?.name?.toLowerCase() || "";
      const pTitle = p.title?.toLowerCase() || "";
      const pContact = p.patient?.contact?.toLowerCase() || "";
      return pName.includes(q) || pTitle.includes(q) || pContact.includes(q);
    });
  }, [plans, statusFilter, searchTerm]);

  // Metrics
  const readyCount = useMemo(
    () => plans.filter((p) => p.status?.toLowerCase() !== "draft").length,
    [plans]
  );
  const draftCount = useMemo(
    () => plans.filter((p) => p.status?.toLowerCase() === "draft").length,
    [plans]
  );

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
        planTitle.trim() || "Tedavi Planı",
        ["Dentin Çürüğü"],
        workspaceId
      );

      if (!planRes.success || !planRes.data) {
        setFormError(planRes.error || "Plan oluşturulamadı.");
        return;
      }

      setCreatedPlans((prev) => [planRes.data!, ...prev]);
      setShowModal(false);
      router.push(`/app/plans/${planRes.data.id}`);
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* 1. Üst Başlık & Eylem Butonu */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tedavi Planları
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError("");
            setIsCreatingPatient(patients.length === 0);
            setShowModal(true);
          }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-98"
        >
          <PlusCircle className="size-4" />
          <span>Yeni Tedavi Planı Oluştur</span>
        </button>
      </div>

      {/* 2. Hızlı Metrik Kartları (3 Adet Sade Kart) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Toplam Plan Sayısı</span>
            <FileText className="size-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{plans.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Hazır & Onaylı Sunumlar</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{readyCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Aktif Taslaklar</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">{draftCount}</p>
        </div>
      </div>

      {/* 3. Arama & Filtreleme Çubuğu */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Arama Inputu */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Hasta adı, telefon veya plan başlığı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Durum Filtre Butonları */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Filter className="size-3.5 text-slate-400 ml-1 mr-1" />
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tümü ({plans.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ready")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "ready"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Hazır ({readyCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "draft"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Taslak ({draftCount})
          </button>
        </div>
      </div>

      {/* 4. Planlar Tablosu */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredPlans.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FilePlus className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              {searchTerm || statusFilter !== "all"
                ? "Aramanıza uygun plan bulunamadı"
                : "Henüz bir tedavi planı bulunmuyor"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {searchTerm || statusFilter !== "all"
                ? "Farklı bir arama terimi deneyin veya filtreleri temizleyin."
                : "İlk hastanız için seans bazlı, kurumsal ve 3D destekli tedavi planı oluşturun."}
            </p>
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setIsCreatingPatient(patients.length === 0);
                setShowModal(true);
              }}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
            >
              <PlusCircle className="size-3.5" />
              <span>Yeni Plan Başlat</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Hasta</th>
                  <th className="px-6 py-4">Plan Başlığı</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Seans / Kalem</th>
                  <th className="px-6 py-4 text-right">Genel Toplam</th>
                  <th className="px-6 py-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.map((p) => {
                  const m = money(p.totalsGrand, p.currency);
                  const isReady = p.status?.toLowerCase() !== "draft";
                  const patientName = p.patient?.name || "İsimsiz Hasta";
                  const visitsCount = p.visits?.length || 0;
                  const snapshotItems = (p.snapshotJson as { items?: unknown[] })?.items;
                  const itemsCount = p.items?.length || snapshotItems?.length || 0;

                  return (
                    <tr
                      key={p.id}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      {/* Hasta Bilgisi */}
                      <td className="px-6 py-4.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            {getInitials(patientName)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {patientName}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Phone className="size-3" />
                              <span>{p.patient?.contact || "İletişim yok"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan Başlığı */}
                      <td className="px-6 py-4.5 align-middle">
                        <Link
                          href={`/app/plans/${p.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 transition"
                        >
                          {p.title || "Tedavi Planı"}
                        </Link>
                      </td>

                      {/* Durum Rozeti */}
                      <td className="px-6 py-4.5 align-middle">
                        {p.status?.toLowerCase() === "accepted" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            <span className="size-1.5 rounded-full bg-emerald-600" />
                            Hasta Onayladı
                          </span>
                        ) : p.status?.toLowerCase() === "viewed" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                            <span className="size-1.5 rounded-full bg-cyan-600" />
                            İncelendi
                          </span>
                        ) : p.status?.toLowerCase() === "sent" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            <span className="size-1.5 rounded-full bg-blue-600" />
                            Gönderildi
                          </span>
                        ) : isReady ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <span className="size-1.5 rounded-full bg-emerald-600" />
                            Hazır
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Taslak
                          </span>
                        )}
                      </td>

                      {/* Seans / Kalem */}
                      <td className="px-6 py-4.5 align-middle text-center text-xs whitespace-nowrap text-slate-600 font-medium">
                        <span>{visitsCount}</span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span>{itemsCount}</span>
                      </td>

                      {/* Tutar */}
                      <td className="px-6 py-4.5 align-middle text-right font-bold text-slate-900 text-sm">
                        {formatMoney(m)}
                      </td>

                      {/* İşlem */}
                      <td className="px-6 py-4.5 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {isReady && (
                            <button
                              type="button"
                              onClick={() => setSharePlan(p)}
                              title="Plan Sunumu & Dokümanlar (Web & PDF)"
                              aria-label="Plan Sunumu & Dokümanlar"
                              className="inline-flex size-8.5 cursor-pointer items-center justify-center rounded-xl border border-slate-900/15 bg-slate-900/[0.05] text-slate-800 shadow-2xs transition-all duration-150 hover:scale-105 hover:border-slate-900 hover:bg-slate-900 hover:text-white hover:shadow-xs active:scale-95 group-hover:border-slate-900/25"
                            >
                              <FileText className="size-4" />
                            </button>
                          )}

                          <Link
                            href={`/app/plans/${p.id}`}
                            title={isReady ? "Görüntüle" : "Düzenle"}
                            aria-label={isReady ? "Görüntüle" : "Düzenle"}
                            className="inline-flex size-8.5 cursor-pointer items-center justify-center rounded-xl border border-slate-900/15 bg-slate-900/[0.05] text-slate-800 shadow-2xs transition-all duration-150 hover:scale-105 hover:border-slate-900 hover:bg-slate-900 hover:text-white hover:shadow-xs active:scale-95 group-hover:border-slate-900/25"
                          >
                            {isReady ? (
                              <Eye className="size-4" />
                            ) : (
                              <Pencil className="size-3.5" />
                            )}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* YENİ PLAN OLUŞTURMA MODALI (PREMIUM & ULTRA ŞIK COMBOBOX DROPDOWN İLE) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-lg overflow-visible rounded-3xl border border-slate-200/80 bg-white p-7 shadow-2xl shadow-slate-900/10">
            {/* Modal Üst Başlık */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Yeni Tedavi Planı Oluştur
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hasta seçin ve seans planlamasına başlayın.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setIsPatientDropdownOpen(false);
                }}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-6 space-y-5">
              {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs font-medium text-rose-800">
                  {formError}
                </div>
              )}

              {/* Hasta Seçim Tabı */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Hasta Bilgisi
                </label>

                {patients.length > 0 && (
                  <div className="mt-2 flex rounded-xl border border-slate-200/80 bg-slate-100/80 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingPatient(false);
                        setIsPatientDropdownOpen(false);
                      }}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
                        !isCreatingPatient
                          ? "bg-white text-slate-950 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Users className="size-3.5" />
                      <span>Kayıtlı Hasta Seç</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingPatient(true);
                        setIsPatientDropdownOpen(false);
                      }}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
                        isCreatingPatient
                          ? "bg-white text-slate-950 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <UserPlus className="size-3.5" />
                      <span>+ Yeni Hasta Tanımla</span>
                    </button>
                  </div>
                )}

                {/* Kayıtlı Hasta Seçimi (ÖZEL COMBOBOX DROPDOWN) */}
                {!isCreatingPatient && patients.length > 0 ? (
                  <div ref={dropdownRef} className="relative mt-2.5">
                    <button
                      type="button"
                      onClick={() => setIsPatientDropdownOpen((prev) => !prev)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-left transition hover:border-slate-300 hover:bg-slate-50 focus:border-slate-900 focus:bg-white focus:outline-hidden"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-bold text-xs text-white">
                          {selectedPatient ? getInitials(selectedPatient.name) : "H"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {selectedPatient?.name || "Hasta Seçin"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {selectedPatient?.contact
                              ? selectedPatient.contact
                              : "İletişim bilgisi yok"}
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        className={`size-4 text-slate-400 transition-transform duration-200 ${
                          isPatientDropdownOpen ? "rotate-180 text-slate-700" : ""
                        }`}
                      />
                    </button>

                    {/* Açılır Liste */}
                    {isPatientDropdownOpen && (
                      <div className="absolute left-0 top-full z-60 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15">
                        <div className="relative border-b border-slate-100 pb-2">
                          <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Hasta adı veya telefon ara..."
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                            autoFocus
                            className="w-full rounded-xl bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden"
                          />
                        </div>

                        <div className="mt-1.5 max-h-52 overflow-y-auto space-y-1">
                          {filteredModalPatients.length === 0 ? (
                            <div className="py-4 text-center text-xs text-slate-400">
                              Eşleşen hasta bulunamadı.
                            </div>
                          ) : (
                            filteredModalPatients.map((pat) => {
                              const isSelected = pat.id === selectedPatientId;
                              return (
                                <button
                                  key={pat.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedPatientId(pat.id);
                                    setIsPatientDropdownOpen(false);
                                  }}
                                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl p-2.5 text-left transition ${
                                    isSelected
                                      ? "bg-slate-900 text-white"
                                      : "hover:bg-slate-50 text-slate-800"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                        isSelected
                                          ? "bg-white/20 text-white"
                                          : "bg-slate-100 text-slate-700"
                                      }`}
                                    >
                                      {getInitials(pat.name)}
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold leading-tight">
                                        {pat.name}
                                      </p>
                                      <p
                                        className={`text-[11px] ${
                                          isSelected ? "text-slate-300" : "text-slate-400"
                                        }`}
                                      >
                                        {pat.contact || "İletişim yok"}
                                      </p>
                                    </div>
                                  </div>

                                  {isSelected && <Check className="size-4 text-white" />}
                                </button>
                              );
                            })
                          )}
                        </div>

                        <div className="mt-2 border-t border-slate-100 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingPatient(true);
                              setIsPatientDropdownOpen(false);
                            }}
                            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Plus className="size-3.5" />
                            <span>Yeni Hasta Kaydı Başlat</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Yeni Hasta Formu */
                  <div className="mt-3 space-y-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Hasta Adı ve Soyadı *
                      </label>
                      <div className="relative mt-1">
                        <User className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Örn: Ayşe Demir"
                          value={newPatientName}
                          onChange={(e) => setNewPatientName(e.target.value)}
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Telefon / İletişim Bilgisi
                      </label>
                      <div className="relative mt-1">
                        <Phone className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Örn: +90 532 000 00 00"
                          value={newPatientContact}
                          onChange={(e) => setNewPatientContact(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Plan Başlığı & Şablon Önerileri */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Tedavi Plan Başlığı
                </label>
                <div className="relative mt-2">
                  <FileText className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Örn: Estetik Gülüş Tasarımı ve İmplant"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {TITLE_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setPlanTitle(sug)}
                      className="cursor-pointer rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Butonları */}
              <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setIsPatientDropdownOpen(false);
                  }}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 active:scale-98"
                >
                  <span>{isPending ? "Oluşturuluyor..." : "Planı Başlat & Düzenle"}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ultimate Web Sunumu & Paylaşım Modalı */}
      {sharePlan && (
        <PlanShareModal
          isOpen={Boolean(sharePlan)}
          onClose={() => setSharePlan(null)}
          planId={sharePlan.id}
          planTitle={sharePlan.title}
          patientName={sharePlan.patient?.name || "Kayıtlı Hasta"}
          patientContact={sharePlan.patient?.contact}
          isReady={sharePlan.status !== "draft"}
        />
      )}
    </div>
  );
}
