"use client";

import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Filter,
  Mail,
  MapPin,
  Phone,
  Plus,
  PencilLine,
  PlusCircle,
  Search,
  Pencil,
  Stethoscope,
  User,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { createPatientAction, createPlanAction } from "@/app/(clinic)/app/plans/actions";
import type { ClinicSettings, Palette } from "@/modules/clinic/domain/clinic";
import { doctorDisplayName } from "@/modules/clinic/domain/doctor";
import { buildSetupOverview, needsSetup } from "@/modules/clinic/domain/setup";
import type { Patient, Plan } from "@/modules/plan/domain/plan";
import type { Subscription, UpgradeOffer } from "@/modules/subscription/domain/subscription";
import { formatMoney, money } from "@/shared/money";

import { PlansCard, SetupProgressChip } from "./dashboard-widgets";

interface DashboardClientProps {
  initialSettings: ClinicSettings;
  initialPlans: Plan[];
  initialPatients: Patient[];
  userEmail: string;
  workspaceId: string;
  treatmentCount: number;
  subscription: Subscription | null;
  upgradeOffer: UpgradeOffer | null;
}

const TITLE_SUGGESTIONS = [
  "İmplant ve Kuron Planı",
  "Estetik Gülüş Tasarımı",
  "Zirkonyum Kaplama",
  "Kanal ve Dolgu Tedavisi",
  "Ortodonti & Şeffaf Plak",
];

const PALETTE_META: Record<Palette, { name: string; hex: string; bg: string }> = {
  navy: { name: "Derin Lacivert", hex: "#0f172a", bg: "bg-slate-900" },
  forest: { name: "Zümrüt Orman", hex: "#064e3b", bg: "bg-emerald-900" },
  rose: { name: "Zarif Gül", hex: "#881337", bg: "bg-rose-900" },
  slate: { name: "Arduvaz Taş", hex: "#334155", bg: "bg-slate-700" },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) return "H";
  if (parts.length === 1 || !last) return first.slice(0, 2).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Günaydın";
  if (hour >= 12 && hour < 18) return "İyi Günler";
  return "İyi Akşamlar";
}

function formatPlanDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(d);
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tp-btn inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-xl px-6 text-base font-semibold ${
        primary
          ? "tp-btn-primary bg-[#0b1f4d] text-white shadow-lg shadow-[#0b1f4d]/25 hover:bg-[#132a5c]"
          : "text-[#0b1f4d] hover:bg-slate-50"
      }`}
    >
      <Icon className="size-6" strokeWidth={1.8} />
      <span>{label}</span>
    </button>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`tp-tab -mb-px inline-flex cursor-pointer items-center gap-2.5 border-b-2 pb-4 text-base font-semibold ${
        active
          ? "border-[#0b1f4d] text-[#0b1f4d]"
          : "border-transparent text-slate-400 hover:text-slate-700"
      }`}
    >
      <Icon className="size-5" strokeWidth={1.9} />
      <span>{label}</span>
      <span className={`text-sm font-bold tabular-nums ${active ? "text-[#0b1f4d]" : "text-slate-400"}`}>
        {count}
      </span>
    </button>
  );
}

function InfoItem({
  icon: Icon,
  value,
  tone,
}: {
  icon: LucideIcon;
  value?: string;
  tone: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 py-1.5 pr-3">
      <Icon className={`size-5 shrink-0 ${tone}`} strokeWidth={1.7} />
      <p
        className={`min-w-0 flex-1 truncate text-sm font-medium ${
          value ? "text-[#0b1f4d]" : "text-slate-300"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export function DashboardClient({
  initialSettings,
  initialPlans,
  initialPatients,
  userEmail,
  workspaceId,
  treatmentCount,
  subscription,
  upgradeOffer,
}: DashboardClientProps) {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);

  // Plans / drafts tabs
  const { readyPlans, draftPlans } = useMemo(() => {
    const byDate = (a: Plan, b: Plan) =>
      (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || "");
    const sorted = [...initialPlans].sort(byDate);
    return {
      readyPlans: sorted.filter((p) => p.status?.toLowerCase() !== "draft"),
      draftPlans: sorted.filter((p) => p.status?.toLowerCase() === "draft"),
    };
  }, [initialPlans]);
  const [tab, setTab] = useState<"plans" | "drafts" | null>(null);
  const activeTab = tab ?? (readyPlans.length === 0 && draftPlans.length > 0 ? "drafts" : "plans");
  const tabPlans = activeTab === "plans" ? readyPlans : draftPlans;

  // Planlar / Taslaklar ortak arama + soft filter
  type PlanFilter = "all" | "patient" | "date";
  const [planSearch, setPlanSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [planFilterOpen, setPlanFilterOpen] = useState(false);
  const planFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!planFilterOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!planFilterRef.current?.contains(e.target as Node)) setPlanFilterOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [planFilterOpen]);

  const visiblePlans = useMemo(() => {
    const q = planSearch.trim().toLowerCase();
    if (!q) return tabPlans;
    return tabPlans.filter((p) => {
      const patientName = (
        p.patient?.name ||
        patients.find((x) => x.id === p.patientId)?.name ||
        ""
      ).toLowerCase();
      const title = (p.title || "").toLowerCase();
      const dateRaw = (p.updatedAt || p.createdAt || "").toLowerCase();
      const dateFmt = formatPlanDate(p.updatedAt || p.createdAt).toLowerCase();
      if (planFilter === "patient") return patientName.includes(q);
      if (planFilter === "date") return dateRaw.includes(q) || dateFmt.includes(q);
      return patientName.includes(q) || title.includes(q) || dateRaw.includes(q) || dateFmt.includes(q);
    });
  }, [tabPlans, planSearch, planFilter, patients]);

  // Modals state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [modalError, setModalError] = useState("");

  // Plan modal fields
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? "");
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [isNewPatientInPlan, setIsNewPatientInPlan] = useState(patients.length === 0);
  const [quickPatientName, setQuickPatientName] = useState("");
  const [quickPatientContact, setQuickPatientContact] = useState("");

  // Custom Combobox State
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Patient modal state
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientContact, setNewPatientContact] = useState("");

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

  // Filtered patients for the combobox
  const filteredPatients = useMemo(() => {
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

  // Check for missing clinic fields
  const missingFields = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (!initialSettings.name?.trim()) {
      list.push({ key: "name", label: "Klinik Adı" });
    }
    if (!initialSettings.doctor?.name?.trim()) {
      list.push({ key: "doctor", label: "Sorumlu Hekim" });
    }
    if (!initialSettings.phone?.trim()) {
      list.push({ key: "phone", label: "İletişim Telefonu" });
    }
    if (!initialSettings.address?.trim()) {
      list.push({ key: "address", label: "Açık Adres" });
    }
    if (!initialSettings.logoKey?.trim()) {
      list.push({ key: "logo", label: "Klinik Logosu" });
    }
    if (
      !initialSettings.slogan?.trim() &&
      !initialSettings.intro?.trim() &&
      !initialSettings.aboutText?.trim()
    ) {
      list.push({ key: "slogan", label: "Slogan & Tanıtım" });
    }
    return list;
  }, [initialSettings]);

  const hasMissingInfo = missingFields.length > 0;

  const doctorName = doctorDisplayName(initialSettings.doctor?.name);

  // Kurulum ilerlemesi: sihirbazın aynı kuralları (domain/setup.ts).
  const { setupDone, setupTotal, setupPercent } = useMemo(() => {
    const overview = buildSetupOverview(initialSettings, {
      treatmentCount,
      prefsConfirmed: !needsSetup(initialSettings, treatmentCount),
    });
    return {
      setupDone: overview.doneCount,
      setupTotal: overview.totalSteps,
      setupPercent: Math.round((overview.doneCount / overview.totalSteps) * 100),
    };
  }, [initialSettings, treatmentCount]);

  // Sidebar patient search state
  const [patientSidebarSearch, setPatientSidebarSearch] = useState("");

  const sidebarFilteredPatients = useMemo(() => {
    if (!patientSidebarSearch.trim()) return patients;
    const q = patientSidebarSearch.toLowerCase().trim();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.contact && p.contact.toLowerCase().includes(q))
    );
  }, [patients, patientSidebarSearch]);

  // Quick Action: Start Plan for Specific Patient
  const handleStartPlanForPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsNewPatientInPlan(false);
    setNewPlanTitle("");
    setModalError("");
    setShowPlanModal(true);
  };

  // Handle Create Quick Patient (Standalone modal)
  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    if (!newPatientName.trim()) {
      setModalError("Hasta adı ve soyadı zorunludur.");
      return;
    }

    startTransition(async () => {
      const res = await createPatientAction(
        newPatientName.trim(),
        newPatientContact.trim(),
        workspaceId
      );
      if (!res.success || !res.data) {
        setModalError(res.error || "Hasta kaydedilemedi.");
        return;
      }

      setPatients((prev) => [res.data!, ...prev]);
      setSelectedPatientId(res.data.id);
      setNewPatientName("");
      setNewPatientContact("");
      setShowPatientModal(false);
      router.refresh();
    });
  };

  // Handle Create Plan
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    startTransition(async () => {
      let patientIdToUse = selectedPatientId;

      if (isNewPatientInPlan) {
        if (!quickPatientName.trim()) {
          setModalError("Yeni hasta için ad ve soyad zorunludur.");
          return;
        }
        const patRes = await createPatientAction(
          quickPatientName.trim(),
          quickPatientContact.trim(),
          workspaceId
        );
        if (!patRes.success || !patRes.data) {
          setModalError(patRes.error || "Hasta kaydedilemedi.");
          return;
        }
        patientIdToUse = patRes.data.id;
        setPatients((prev) => [patRes.data!, ...prev]);
      }

      if (!patientIdToUse) {
        setModalError("Lütfen bir hasta seçin veya yeni hasta tanımlayın.");
        return;
      }

      const title = newPlanTitle.trim() || "Tedavi Planı";
      const planRes = await createPlanAction(
        patientIdToUse,
        title,
        [],
        workspaceId,
        initialSettings.currency || "TRY"
      );

      if (!planRes.success || !planRes.data) {
        setModalError(planRes.error || "Plan oluşturulamadı.");
        return;
      }

      setShowPlanModal(false);
      router.push(`/app/plans/${planRes.data.id}`);
    });
  };

  const activePalette =
    PALETTE_META[initialSettings.palette] || PALETTE_META.navy;

  const currencySymbol =
    initialSettings.currency === "TRY"
      ? "₺"
      : initialSettings.currency === "EUR"
      ? "€"
      : "$";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12.5rem)] w-full max-w-[1500px] flex-col pb-4 lg:h-[calc(100dvh-8.5rem)] lg:min-h-[480px]">
      <section className="relative flex flex-1 flex-col overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white shadow-[0_16px_48px_-28px_rgba(15,23,42,0.18)] lg:min-h-0">

        {/* ÜST: KARŞILAMA + AKSİYONLAR */}
        <div className="relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:py-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-400">{getGreeting()}</p>
            <h1 className="truncate text-4xl font-bold tracking-tight text-[#0b1f4d] lg:text-3xl">
              {doctorName || initialSettings.name || "Hoş Geldiniz"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SetupProgressChip
              percent={setupPercent}
              doneCount={setupDone}
              totalSteps={setupTotal}
            />
            <ActionButton
              icon={UserPlus}
              label="Yeni Hasta"
              onClick={() => {
                setModalError("");
                setShowPatientModal(true);
              }}
            />
            <ActionButton
              icon={PlusCircle}
              label="Yeni Plan"
              primary
              onClick={() => {
                setModalError("");
                setIsNewPatientInPlan(patients.length === 0);
                setNewPlanTitle("");
                setShowPlanModal(true);
              }}
            />
          </div>
        </div>

        <div className="relative h-px bg-slate-100" />

        {/* ORTA: PLANLAR / TASLAKLAR + HASTALAR */}
        <div className="relative grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)]">
          {/* Planlar & Taslaklar */}
          <div className="flex min-h-[320px] min-w-0 flex-col px-6 py-7 sm:px-10 lg:col-span-8 lg:min-h-0 lg:overflow-x-clip lg:py-5">
            <div role="tablist" aria-label="Planlar" className="flex gap-8 border-b border-slate-100">
              <TabButton
                active={activeTab === "plans"}
                icon={FileText}
                label="Planlar"
                count={readyPlans.length}
                onClick={() => setTab("plans")}
              />
              <TabButton
                active={activeTab === "drafts"}
                icon={PencilLine}
                label="Taslaklar"
                count={draftPlans.length}
                onClick={() => setTab("drafts")}
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  aria-label="Plan veya hasta ara"
                  placeholder={
                    planFilter === "patient"
                      ? "Hastaya göre ara…"
                      : planFilter === "date"
                        ? "Tarihe göre ara…"
                        : "Hasta, plan veya tarih ara…"
                  }
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                  className="h-11 w-full rounded-2xl bg-slate-50 pl-10 pr-9 text-sm text-[#0b1f4d] placeholder:text-slate-400 outline-hidden ring-1 ring-slate-900/[0.05] transition focus:bg-white focus:ring-[#0b1f4d]/20"
                />
                {planSearch && (
                  <button
                    type="button"
                    aria-label="Aramayı temizle"
                    onClick={() => setPlanSearch("")}
                    className="tp-icon-btn absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <div ref={planFilterRef} className="relative shrink-0">
                <button
                  type="button"
                  aria-label="Filtrele"
                  aria-expanded={planFilterOpen}
                  aria-haspopup="listbox"
                  data-testid="plan-filter"
                  onClick={() => setPlanFilterOpen((v) => !v)}
                  className={`tp-icon-btn flex size-11 items-center justify-center rounded-2xl ring-1 transition ${
                    planFilter !== "all" || planFilterOpen
                      ? "bg-[#0b1f4d] text-white ring-[#0b1f4d]"
                      : "bg-slate-50 text-[#0b1f4d] ring-slate-900/[0.05] hover:bg-white"
                  }`}
                >
                  <Filter className="size-4" strokeWidth={2} />
                </button>
                {planFilterOpen && (
                  <div
                    role="listbox"
                    aria-label="Arama filtresi"
                    data-testid="plan-filter-menu"
                    className="tp-panel-enter absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl bg-white/95 p-1.5 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/[0.06] backdrop-blur-xl"
                  >
                    {(
                      [
                        { id: "all", label: "Tümü" },
                        { id: "patient", label: "Hastaya göre" },
                        { id: "date", label: "Tarihe göre" },
                      ] as const
                    ).map((opt) => {
                      const active = planFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="option"
                          aria-selected={active}
                          data-testid={`plan-filter-${opt.id}`}
                          onClick={() => {
                            setPlanFilter(opt.id);
                            setPlanFilterOpen(false);
                          }}
                          className={`tp-tab flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
                            active
                              ? "bg-[#0b1f4d] text-white"
                              : "text-slate-600 hover:bg-slate-50 hover:text-[#0b1f4d]"
                          }`}
                        >
                          {opt.label}
                          {active && <Check className="size-4" strokeWidth={2.4} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div
              key={activeTab}
              role="tabpanel"
              className="tp-panel-enter tp-stagger flex flex-1 flex-col gap-2.5 overflow-x-clip p-0.5 pt-3 lg:min-h-0 lg:overflow-y-auto [scrollbar-gutter:stable]"
            >
              {visiblePlans.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
                  {planSearch.trim() ? (
                    <>
                      <Search className="size-12 text-slate-200" strokeWidth={1.4} />
                      <p className="text-sm font-medium text-slate-400">Sonuç bulunamadı</p>
                    </>
                  ) : activeTab === "plans" ? (
                    <FileText className="size-12 text-slate-200" strokeWidth={1.4} />
                  ) : (
                    <PencilLine className="size-12 text-slate-200" strokeWidth={1.4} />
                  )}
                  {!planSearch.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalError("");
                      setIsNewPatientInPlan(patients.length === 0);
                      setNewPlanTitle("");
                      setShowPlanModal(true);
                    }}
                    className="tp-btn tp-btn-primary inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0b1f4d] px-5 py-2.5 text-base font-semibold text-white shadow-md shadow-[#0b1f4d]/25"
                  >
                    <Plus className="size-4" strokeWidth={2.2} />
                    Yeni Plan
                  </button>
                  )}
                </div>
              ) : (
                visiblePlans.map((p) => {
                  const isDraft = p.status?.toLowerCase() === "draft";
                  const patientName =
                    p.patient?.name ||
                    patients.find((x) => x.id === p.patientId)?.name ||
                    "İsimsiz Hasta";
                  const date = formatPlanDate(p.updatedAt || p.createdAt);
                  return (
                    <Link
                      key={p.id}
                      href={`/app/plans/${p.id}`}
                      className="tp-card group flex min-w-0 items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-[0_10px_28px_-16px_rgba(15,23,42,0.32)] ring-1 ring-slate-900/[0.04]"
                    >
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                          isDraft ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                        }`}
                      >
                        {isDraft ? (
                          <PencilLine className="size-5" strokeWidth={1.9} />
                        ) : (
                          <FileText className="size-5" strokeWidth={1.9} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-[#0b1f4d]">
                          {p.title || "Tedavi Planı"}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-slate-400">
                          {patientName}
                          {date && <span className="text-slate-300"> · </span>}
                          {date}
                        </p>
                      </div>
                      <span className="shrink-0 text-lg font-semibold tabular-nums text-[#0b1f4d]">
                        {formatMoney(money(p.totalsGrand, p.currency))}
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-slate-300 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-[#0b1f4d]" />
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Hastalar */}
          <div className="flex min-w-0 flex-col border-t border-slate-100 px-6 py-7 sm:px-10 lg:col-span-4 lg:min-h-0 lg:overflow-x-clip lg:overflow-y-auto lg:border-l lg:border-slate-100 lg:border-t-0 lg:px-6 lg:py-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="flex shrink-0 items-center gap-2 text-[#0b1f4d]">
                <Users className="size-5 text-[#0b1f4d]" strokeWidth={1.8} />
                <span className="text-xl font-bold tabular-nums">{patients.length}</span>
              </div>
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  aria-label="Hasta ara"
                  placeholder="Hasta ara"
                  value={patientSidebarSearch}
                  onChange={(e) => setPatientSidebarSearch(e.target.value)}
                  className="w-full bg-transparent py-1.5 pl-6 pr-6 text-sm text-[#0b1f4d] placeholder:text-slate-300 focus:outline-hidden"
                />
                {patientSidebarSearch && (
                  <button
                    type="button"
                    aria-label="Temizle"
                    onClick={() => setPatientSidebarSearch("")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                aria-label="Hasta Ekle"
                title="Hasta Ekle"
                onClick={() => {
                  setModalError("");
                  setShowPatientModal(true);
                }}
                className="tp-icon-btn flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#0b1f4d] hover:bg-slate-50"
              >
                <UserPlus className="size-5" strokeWidth={1.8} />
              </button>
            </div>

            <div className="tp-stagger mt-2 flex max-h-[340px] min-h-[160px] flex-col gap-2 overflow-x-clip overflow-y-auto p-0.5 lg:min-h-[56px] lg:flex-1 [@media(max-height:800px)]:lg:min-h-0 lg:max-h-none">
              {sidebarFilteredPatients.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-8">
                  <User className="size-12 text-slate-200" strokeWidth={1.4} />
                </div>
              ) : (
                sidebarFilteredPatients.map((pat) => (
                  <div
                    key={pat.id}
                    className="tp-card flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-[0_10px_28px_-16px_rgba(15,23,42,0.32)] ring-1 ring-slate-900/[0.04]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold tracking-wide text-[#0b1f4d]">
                        {getInitials(pat.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-[#0b1f4d]">
                          {pat.name}
                        </p>
                        {pat.contact && (
                          <p className="truncate text-sm text-slate-400">{pat.contact}</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartPlanForPatient(pat.id)}
                      aria-label={`${pat.name} için tedavi planı başlat`}
                      title={`${pat.name} için tedavi planı başlat`}
                      className="tp-icon-btn flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-[#0b1f4d] hover:bg-[#0b1f4d] hover:text-white"
                    >
                      <Plus className="size-5" strokeWidth={2.2} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <PlansCard subscription={subscription} upgradeOffer={upgradeOffer} />
          </div>
        </div>

        <div className="relative h-px bg-slate-100" />

        {/* ALT: KLİNİK */}
        <div className="relative flex flex-col gap-1 px-6 py-5 sm:px-10 lg:py-3 2xl:flex-row 2xl:items-center 2xl:gap-3">
          <div className="flex min-w-0 items-center gap-3 2xl:w-80 2xl:shrink-0">
            <Building2 className="size-6 shrink-0 text-blue-600" strokeWidth={1.8} />
            <h2 className="truncate text-base font-bold text-[#0b1f4d]">
              {initialSettings.name || "Klinik"}
            </h2>
            {hasMissingInfo ? (
              <Link
                href="/app/clinic"
                title={missingFields.map((f) => f.label).join(", ")}
                className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 transition hover:text-amber-700"
              >
                <AlertCircle className="size-5" />
                {missingFields.length}
              </Link>
            ) : (
              <Check className="size-5 text-emerald-600" />
            )}
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: activePalette.hex }}
              />
              {currencySymbol}
            </span>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={Stethoscope}
              tone="text-[#0b1f4d]"
              value={doctorName}
            />
            <InfoItem icon={Phone} tone="text-emerald-500" value={initialSettings.phone} />
            <InfoItem icon={Mail} tone="text-sky-500" value={initialSettings.email || userEmail} />
            <InfoItem icon={MapPin} tone="text-rose-500" value={initialSettings.address} />
          </div>

          <Link
            href="/app/clinic"
            aria-label="Profili Düzenle"
            title="Profili Düzenle"
            className="tp-icon-btn absolute right-4 top-2.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 hover:text-[#0b1f4d] sm:right-8 2xl:static 2xl:size-11"
          >
            <Pencil className="size-5" strokeWidth={1.8} />
          </Link>
        </div>
      </section>

      {/* YENİ TEDAVİ PLANI MODALI */}
      {showPlanModal && (
        <div className="tp-backdrop-enter fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-xl">
          <div className="tp-modal-enter w-full max-w-lg overflow-visible rounded-[2rem] border border-slate-200/80 bg-white p-7 shadow-2xl shadow-slate-900/15">
            {/* Modal Üst Başlık */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center text-[#0b1f4d]">
                  <FileText className="size-5" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Yeni Tedavi Planı Oluştur
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPlanModal(false);
                  setIsPatientDropdownOpen(false);
                }}
                className="tp-icon-btn flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="mt-6 space-y-5">
              {modalError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs font-medium text-rose-800">
                  {modalError}
                </div>
              )}

              {/* Hasta Seçim Segmenti (Tab) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Hasta Bilgisi
                </label>

                {patients.length > 0 && (
                  <div className="mt-2 flex rounded-xl border border-slate-200/80 bg-slate-100/80 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewPatientInPlan(false);
                        setIsPatientDropdownOpen(false);
                      }}
                      className={`tp-tab flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold ${
                        !isNewPatientInPlan
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
                        setIsNewPatientInPlan(true);
                        setIsPatientDropdownOpen(false);
                      }}
                      className={`tp-tab flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold ${
                        isNewPatientInPlan
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
                {!isNewPatientInPlan && patients.length > 0 ? (
                  <div ref={dropdownRef} className="relative mt-2.5">
                    {/* Tetikleyici Buton */}
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
                        {/* Arama Girişi */}
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

                        {/* Hasta Listesi */}
                        <div className="mt-1.5 max-h-52 overflow-y-auto space-y-1">
                          {filteredPatients.length === 0 ? (
                            <div className="py-4 text-center text-xs text-slate-400">
                              Eşleşen hasta bulunamadı.
                            </div>
                          ) : (
                            filteredPatients.map((pat) => {
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

                        {/* Hızlı Yeni Hasta Butonu */}
                        <div className="mt-2 border-t border-slate-100 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsNewPatientInPlan(true);
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
                  /* Yeni Hasta Tanımlama Alanları */
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
                          value={quickPatientName}
                          onChange={(e) => setQuickPatientName(e.target.value)}
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
                          value={quickPatientContact}
                          onChange={(e) => setQuickPatientContact(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Plan Başlığı & Hızlı Şablon Önerileri */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Tedavi Plan Başlığı
                </label>
                <div className="relative mt-2">
                  <FileText className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Örn: Estetik Gülüş Tasarımı ve İmplant"
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Hızlı Öneri Çipleri */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {TITLE_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewPlanTitle(sug)}
                      className="cursor-pointer rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Alt Butonlar */}
              <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanModal(false);
                    setIsPatientDropdownOpen(false);
                  }}
                  className="tp-btn cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="tp-btn tp-btn-primary inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0b1f4d] px-6 py-2.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  <span>{isPending ? "Oluşturuluyor..." : "Planı Başlat & Düzenle"}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ HASTA EKLE MODALI */}
      {showPatientModal && (
        <div className="tp-backdrop-enter fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-xl">
          <div className="tp-modal-enter w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white p-7 shadow-2xl shadow-slate-900/15">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center text-[#0b1f4d]">
                  <UserPlus className="size-5" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Yeni Hasta Ekle</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPatientModal(false)}
                className="tp-icon-btn flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="mt-6 space-y-4">
              {modalError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs font-medium text-rose-800">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Hasta Adı ve Soyadı *
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Örn: Ayşe Demir"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Telefon / İletişim Bilgisi
                </label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Örn: +90 532 000 00 00"
                    value={newPatientContact}
                    onChange={(e) => setNewPatientContact(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPatientModal(false)}
                  className="tp-btn cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="tp-btn tp-btn-primary inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-br from-[#0b1f4d] to-[#132a5c] px-6 py-2.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  <span>{isPending ? "Kaydediliyor..." : "Hastayı Kaydet"}</span>
                  <Check className="size-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
