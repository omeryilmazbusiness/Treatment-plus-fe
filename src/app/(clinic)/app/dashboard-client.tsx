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
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  PlusCircle,
  Quote,
  Search,
  Settings2,
  Sparkles,
  Stethoscope,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { createPatientAction, createPlanAction } from "@/app/(clinic)/app/plans/actions";
import type { ClinicSettings, Palette } from "@/modules/clinic/domain/clinic";
import type { Patient, Plan } from "@/modules/plan/domain/plan";

interface DashboardClientProps {
  initialSettings: ClinicSettings;
  initialPlans: Plan[];
  initialPatients: Patient[];
  userEmail: string;
  workspaceId: string;
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

export function DashboardClient({
  initialSettings,
  initialPatients,
  userEmail,
  workspaceId,
}: DashboardClientProps) {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);

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
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* 1. ÜST HERO & HOŞ GELDİNİZ BÖLÜMÜ */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="absolute -right-16 -top-16 -z-0 size-64 rounded-full bg-blue-50/60 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 -z-0 size-64 rounded-full bg-slate-100/70 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-800">
                <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Klinik Çalışma Alanı</span>
              </span>
              {initialSettings.name && (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  <Building2 className="size-3 text-slate-400" />
                  {initialSettings.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {getGreeting()},{" "}
              <span className="text-blue-950">
                {initialSettings.doctor?.name
                  ? `Dr. ${initialSettings.doctor.name}`
                  : initialSettings.name || "Hoş Geldiniz"}
              </span>
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
              {initialSettings.slogan
                ? `“${initialSettings.slogan}”`
                : "3D Tedavi planlama, interaktif hasta sunumları ve klinik yönetim merkezi."}
            </p>
          </div>

          {/* Hızlı Aksiyon Butonları */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setModalError("");
                setShowPatientModal(true);
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-98"
            >
              <UserPlus className="size-4 text-slate-500" />
              <span>Yeni Hasta Ekle</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModalError("");
                setIsNewPatientInPlan(patients.length === 0);
                setNewPlanTitle("");
                setShowPlanModal(true);
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-slate-900/10 transition hover:bg-slate-800 active:scale-98"
            >
              <PlusCircle className="size-4 text-blue-400" />
              <span>Yeni Tedavi Planı Oluştur</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. ANA İÇERİK IZGARASI (SOL 8 KOLON: GENİŞLETİLMİŞ KLİNİK BİLGİLERİ, SAĞ 4 KOLON: KOMPLE HASTA PORTFÖYÜ) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
        {/* SOL BÖLÜM (8 KOLON) - PREMIUM & ESTETİK KLİNİK PROFİLİ */}
        <section className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs lg:col-span-8 h-full">
          <div className="space-y-6">
            {/* 1. ÜST BAŞLIK & KLİNİK KİMLİĞİ HERO ALANI */}
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-base font-bold text-white shadow-md shadow-slate-900/10 ring-1 ring-black/5">
                  {initialSettings.name ? getInitials(initialSettings.name) : "KL"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight text-slate-900">
                      {initialSettings.name || "Klinik İsmi Tanımlanmamış"}
                    </h3>
                    {!hasMissingInfo ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <Check className="size-3" />
                        Aktif Profil
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                        <AlertCircle className="size-3" />
                        {missingFields.length} Eksik Bilgi
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: activePalette.hex }}
                      />
                      {activePalette.name}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                      {initialSettings.currency} ({currencySymbol})
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 italic font-medium">
                    {initialSettings.slogan
                      ? `“${initialSettings.slogan}”`
                      : "3D Tedavi planlama ve interaktif sunum merkezi"}
                  </p>
                </div>
              </div>

              <Link
                href="/app/clinic"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 self-start sm:self-auto"
              >
                <Settings2 className="size-3.5 text-slate-400" />
                <span>Profili Düzenle</span>
                <ArrowRight className="size-3 text-slate-400" />
              </Link>
            </div>

            {/* 2. ZARİF VE SAKİN EKSİK BİLGİ UYARISI (SADECE EKSİK VARSA GÖRÜNÜR) */}
            {hasMissingInfo && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-900">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertCircle className="size-4 shrink-0 text-amber-600" />
                  <p className="truncate text-xs">
                    <span className="font-semibold text-amber-950">Eksik Bilgiler:</span>{" "}
                    <span className="text-amber-800">
                      {missingFields.map((f) => f.label).join(", ")}
                    </span>
                  </p>
                </div>
                <Link
                  href="/app/clinic"
                  className="shrink-0 text-xs font-semibold text-amber-900 underline hover:text-amber-950 transition"
                >
                  Tamamla →
                </Link>
              </div>
            )}

            {/* 3. DİNGİN VE DÜZENLİ 2 KOLONLU BİLGİ ALANI */}
            <div className="grid grid-cols-1 gap-5 pt-1 sm:grid-cols-2">
              {/* Sol Panel: Sorumlu Hekim & İletişim */}
              <div className="rounded-2xl border border-slate-100/90 bg-slate-50/50 p-5 space-y-4 transition hover:bg-slate-50/80">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Stethoscope className="size-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Hekim & İletişim
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">PDF Anteti</span>
                </div>

                {/* Hekim Bilgisi */}
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">
                    {initialSettings.doctor?.name
                      ? `Dr. ${initialSettings.doctor.name}`
                      : <span className="text-slate-400 font-normal italic">Hekim tanımlanmamış</span>}
                  </p>
                  <p className="text-xs font-medium text-indigo-600">
                    {initialSettings.doctor?.title || "Diş Hekimi"}
                  </p>
                </div>

                {/* İletişim Bilgileri */}
                <div className="space-y-2 border-t border-slate-200/60 pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Phone className="size-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">
                      {initialSettings.phone || <span className="text-slate-400 font-normal italic">Telefon belirtilmedi</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{initialSettings.email || userEmail}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {initialSettings.address || <span className="text-slate-400 font-normal italic">Adres bilgisi eklenmedi</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sağ Panel: Tanıtım & Şablon Standartları */}
              <div className="rounded-2xl border border-slate-100/90 bg-slate-50/50 p-5 space-y-4 transition hover:bg-slate-50/80 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Quote className="size-3.5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Tanıtım & Şablon
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">Rapor Girişi</span>
                  </div>

                  {/* Tanıtım Ön Sözü */}
                  <p className="text-xs leading-relaxed text-slate-600 italic line-clamp-3">
                    “{initialSettings.aboutText ||
                      initialSettings.intro ||
                      initialSettings.welcomeBody ||
                      "Kliniğimize hoş geldiniz. Dijital tedavi planlama ve estetik diş hekimliği ile hastalarımıza özel çözümler sunuyoruz."}”
                  </p>
                </div>

                {/* Standartlar */}
                <div className="grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-3 text-xs">
                  <div className="rounded-xl border border-slate-200/60 bg-white p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Para Birimi</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{initialSettings.currency} ({currencySymbol})</span>
                  </div>
                  <div className="rounded-xl border border-slate-200/60 bg-white p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rapor Dili</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{initialSettings.locale === "tr" ? "Türkçe (TR)" : "English (EN)"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. ALT DİPNOT (SADECE BİLGİ METNİ, SAĞDAKİ YAZI SİLİNDİ) */}
          <div className="mt-8 border-t border-slate-100 pt-4 flex items-center text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-slate-400" />
              Bu bilgiler hasta sunumları ve PDF tedavi tekliflerinde antet olarak kullanılır.
            </span>
          </div>
        </section>

        {/* SAĞ BÖLÜM (4 KOLON): KOMPLE HASTA PORTFÖYÜ VE YÖNETİMİ (ALT ÇİZGİSİ EŞİTLENMİŞ) */}
        <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs lg:col-span-4 h-full">
          {/* Kart Üst Başlık & Aksiyon */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="size-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Kayıtlı Hastalar
                </h3>
                <p className="text-[11px] text-slate-400">
                  Portföy ({patients.length} hasta)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setModalError("");
                setShowPatientModal(true);
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
            >
              <Plus className="size-3" />
              <span>Hasta Ekle</span>
            </button>
          </div>

          {/* Hızlı Arama Girişi */}
          <div className="relative mt-4 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Hasta adı veya telefon ara..."
              value={patientSidebarSearch}
              onChange={(e) => setPatientSidebarSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 py-2 pl-8.5 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden"
            />
            {patientSidebarSearch && (
              <button
                type="button"
                onClick={() => setPatientSidebarSearch("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Hasta Listesi - Alt çizgiyi eşitlemek için dikey esneyebilir alan */}
          <div className="mt-4 flex-1 space-y-2 overflow-y-auto min-h-[300px] pr-1">
            {sidebarFilteredPatients.length === 0 ? (
              <div className="py-12 text-center">
                <User className="mx-auto size-8 text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-700">
                  {patientSidebarSearch
                    ? "Eşleşen hasta bulunamadı"
                    : "Henüz kayıtlı hasta bulunmuyor"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {patientSidebarSearch
                    ? "Farklı bir arama terimi deneyin."
                    : "Tedavi planlamasına başlamak için ilk hastanızı ekleyin."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setModalError("");
                    setShowPatientModal(true);
                  }}
                  className="mt-3.5 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                >
                  <UserPlus className="size-3.5" />
                  <span>Yeni Hasta Tanımla</span>
                </button>
              </div>
            ) : (
              sidebarFilteredPatients.map((pat) => (
                <div
                  key={pat.id}
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-blue-200 hover:bg-white hover:shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-2xs">
                      {getInitials(pat.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900 group-hover:text-blue-900">
                        {pat.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {pat.contact || "İletişim girilmedi"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartPlanForPatient(pat.id)}
                    className="inline-flex cursor-pointer shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                    title={`${pat.name} için tedavi planı başlat`}
                  >
                    <Plus className="size-3 text-blue-600" />
                    <span>Plan Başlat</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Alt Yeni Hasta Butonu */}
          <div className="mt-4 shrink-0 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => {
                setModalError("");
                setShowPatientModal(true);
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-800 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300"
            >
              <UserPlus className="size-3.5 text-slate-500" />
              <span>+ Yeni Hasta Tanımla</span>
            </button>
          </div>
        </div>
      </div>

      {/* YENİ TEDAVİ PLANI MODALI */}
      {showPlanModal && (
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
                    Hasta seçin ve tedavi detaylarını yapılandırın.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPlanModal(false);
                  setIsPatientDropdownOpen(false);
                }}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
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
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
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

      {/* YENİ HASTA EKLE MODALI */}
      {showPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 shadow-2xl shadow-slate-900/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Yeni Hasta Ekle</h3>
                  <p className="text-xs text-slate-500">
                    Klinik portföyünüze yeni bir hasta tanımlayın.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPatientModal(false)}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 active:scale-98"
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
