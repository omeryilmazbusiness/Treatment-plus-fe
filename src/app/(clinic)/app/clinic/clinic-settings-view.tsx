"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Coins,
  FileCheck2,
  FileText,
  Globe,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Palette as PaletteIcon,
  Pencil,
  Phone,
  Plus,
  Save,
  Search,
  Trash2,
  Undo2,
  Upload,
  UserCheck,
  X,
} from "lucide-react";

import {
  batchSaveTreatmentPricesAction,
  createTreatmentWithPriceAction,
  deleteTreatmentAction,
  updateClinicSettingsAction,
  updateTreatmentItemAction,
  uploadMediaAction,
} from "@/app/(clinic)/app/actions";
import type { PriceList, Treatment } from "@/modules/catalog/domain/catalog";
import type {
  ClinicSettings,
  Locale,
  Palette,
} from "@/modules/clinic/domain/clinic";
import type { Currency } from "@/shared/money";
import { PriceInput } from "@/ui/price-input";

interface ClinicSettingsViewProps {
  initialSettings: ClinicSettings;
  userEmail: string;
  workspaceId: string;
  initialTreatments?: Treatment[];
  initialPriceList?: PriceList | null;
  initialTab?: TabType;
}

type TabType = "general" | "media" | "doctor" | "pdf" | "pricing";

const PALETTE_CONFIGS: Record<
  Palette,
  {
    name: string;
    description: string;
    primaryHex: string;
    accentHex: string;
    bgSoft: string;
    borderHex: string;
  }
> = {
  navy: {
    name: "Navy",
    description: "",
    primaryHex: "#0f172a",
    accentHex: "#2563eb",
    bgSoft: "#f1f5f9",
    borderHex: "#cbd5e1",
  },
  forest: {
    name: "Forest",
    description: "",
    primaryHex: "#064e3b",
    accentHex: "#059669",
    bgSoft: "#ecfdf5",
    borderHex: "#a7f3d0",
  },
  rose: {
    name: "Rose",
    description: "",
    primaryHex: "#881337",
    accentHex: "#e11d48",
    bgSoft: "#fff1f2",
    borderHex: "#fecdd3",
  },
  slate: {
    name: "Slate",
    description: "",
    primaryHex: "#334155",
    accentHex: "#64748b",
    bgSoft: "#f8fafc",
    borderHex: "#cbd5e1",
  },
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: "₺",
  EUR: "€",
  USD: "$",
};

function isDeepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }
  const keys1 = Object.keys(obj1) as (keyof typeof obj1)[];
  const keys2 = Object.keys(obj2) as (keyof typeof obj2)[];
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key)) return false;
    if (
      !isDeepEqual(
        (obj1 as Record<string, unknown>)[key as string],
        (obj2 as Record<string, unknown>)[key as string]
      )
    ) {
      return false;
    }
  }
  return true;
}

function getMediaUrl(key?: string | null): string | null {
  if (!key || !key.trim()) return null;
  const trimmed = key.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  const cleanKey = trimmed.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/api/media/${cleanKey}`;
}

export function ClinicSettingsView({
  initialSettings,
  initialTreatments = [],
  initialPriceList = null,
  initialTab = "general",
}: ClinicSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>(() =>
    initialTab && ["general", "media", "doctor", "pdf", "pricing"].includes(initialTab)
      ? initialTab
      : "general"
  );

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
  };

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (!sp.get("tab")) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", activeTab);
      window.history.replaceState(null, "", url.toString());
    }

    const onPopState = () => {
      const next = new URLSearchParams(window.location.search).get("tab") as TabType | null;
      if (next && ["general", "media", "doctor", "pdf", "pricing"].includes(next)) {
        setActiveTab(next);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [settings, setSettings] = useState<ClinicSettings>(initialSettings);
  const [savedSettings, setSavedSettings] = useState<ClinicSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);
  const [pdfTextTab, setPdfTextTab] = useState<"welcome" | "legal">("welcome");

  // Treatments & Pricing tab state
  const [treatmentsList, setTreatmentsList] = useState<Treatment[]>(initialTreatments || []);
  const [priceMap, setPriceMap] = useState<Map<string, number>>(() => {
    const m = new Map<string, number>();
    if (initialPriceList?.items) {
      for (const it of initialPriceList.items) {
        m.set(String(it.treatmentId), it.amount);
      }
    }
    return m;
  });

  const [dirtyPrices, setDirtyPrices] = useState<Map<string, number>>(new Map());
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const [isSavingPrices, setIsSavingPrices] = useState(false);

  const totalChanges = dirtyPrices.size + pendingDeleteIds.size;

  const [newTreatName, setNewTreatName] = useState("");
  const [newTreatCode, setNewTreatCode] = useState("");
  const [newTreatPrice, setNewTreatPrice] = useState(0);
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  const treatNameInputRef = useRef<HTMLInputElement | null>(null);

  const QUICK_TREATMENT_TEMPLATES = useMemo(
    () => [
      { code: "TR01", name: "Kompozit Dolgu (Estetik)", priceMinor: 150000 },
      { code: "TR02", name: "Kanal Tedavisi (Endodonti)", priceMinor: 350000 },
      { code: "TR03", name: "Zirkonyum Porselen Kron", priceMinor: 480000 },
      { code: "TR04", name: "Dental İmplant Tedavisi", priceMinor: 1400000 },
      { code: "TR06", name: "Diş Çekimi (Cerrahi Ekstraksiyon)", priceMinor: 180000 },
      { code: "TR07", name: "Multi-Unit Abutment & İyileşme Başlığı", priceMinor: 320000 },
      { code: "TR08", name: "Fissür Örtücü (Koruyucu Sealant)", priceMinor: 90000 },
      { code: "TR09", name: "Lamina Veneer (Yaprak Porselen)", priceMinor: 650000 },
      { code: "TR10", name: "Kalıcı Zirkonyum Köprü Protezi", priceMinor: 1440000 },
      { code: "TR11", name: "Diş Taşı Temizliği (Detertraj & Polisaj)", priceMinor: 160000 },
      { code: "TR12", name: "Ofis Tipi Diş Beyazlatma (Bleaching)", priceMinor: 420000 },
      { code: "TR13", name: "Sinüs Lifting & Kemik Grefti", priceMinor: 850000 },
    ],
    []
  );

  const [editingTreatmentId, setEditingTreatmentId] = useState<string | null>(null);
  const [editingTreatmentName, setEditingTreatmentName] = useState("");
  const [isUpdatingTreatment, setIsUpdatingTreatment] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [pricingStatus, setPricingStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const filteredTreatments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return treatmentsList;
    return treatmentsList.filter(
      (t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)
    );
  }, [treatmentsList, searchQuery]);

  const submitNewTreatment = async (params: {
    name: string;
    code?: string;
    priceMinor: number;
  }) => {
    const name = params.name.trim();
    if (!name) {
      setPricingStatus({
        type: "error",
        message: "Lütfen eklenecek tedavi işleminin adını yazın veya aşağıdaki hazır şablonlardan birine tıklayın.",
      });
      treatNameInputRef.current?.focus();
      return;
    }
    setIsAddingTreatment(true);
    setPricingStatus(null);
    try {
      const res = await createTreatmentWithPriceAction({
        name,
        code: params.code?.trim() || undefined,
        priceMinor: params.priceMinor,
      });
      if (!res.success || !res.data) {
        setPricingStatus({ type: "error", message: res.error || "İşlem eklenemedi." });
        return;
      }
      const { treatment: newTr, amount } = res.data;
      setTreatmentsList((prev) => [...prev, newTr]);
      setPriceMap((prev) => new Map(prev).set(String(newTr.id), amount));
      setNewTreatName("");
      setNewTreatCode("");
      setNewTreatPrice(0);
      setPricingStatus({
        type: "success",
        message: `"${newTr.name}" (${newTr.code}) başarıyla kaydedildi ve tedavi planlarında kullanıma açıldı.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bir hata oluştu.";
      setPricingStatus({ type: "error", message: msg });
    } finally {
      setIsAddingTreatment(false);
    }
  };

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitNewTreatment({
      name: newTreatName,
      code: newTreatCode,
      priceMinor: newTreatPrice,
    });
  };

  const handlePriceChange = (treatId: string, newMinorAmount: number) => {
    const originalAmount = priceMap.get(treatId) ?? 0;
    setDirtyPrices((prev) => {
      const next = new Map(prev);
      if (newMinorAmount === originalAmount) {
        next.delete(treatId);
      } else {
        next.set(treatId, newMinorAmount);
      }
      return next;
    });
  };

  const handleMarkDelete = (treatId: string) => {
    setPendingDeleteIds((prev) => new Set(prev).add(treatId));
  };

  const handleUndoDelete = (treatId: string) => {
    setPendingDeleteIds((prev) => {
      const next = new Set(prev);
      next.delete(treatId);
      return next;
    });
  };

  const handleSaveAllChanges = async () => {
    if (dirtyPrices.size === 0 && pendingDeleteIds.size === 0) return;
    setIsSavingPrices(true);
    setPricingStatus(null);
    try {
      // 1. Process deletions
      if (pendingDeleteIds.size > 0) {
        for (const id of pendingDeleteIds) {
          const res = await deleteTreatmentAction(id);
          if (!res.success) {
            setPricingStatus({ type: "error", message: res.error || "İşlem silinemedi." });
            return;
          }
        }
        setTreatmentsList((prev) =>
          prev.filter((t) => !pendingDeleteIds.has(String(t.id)))
        );
        setPriceMap((prev) => {
          const next = new Map(prev);
          for (const id of pendingDeleteIds) {
            next.delete(id);
          }
          return next;
        });
      }

      // 2. Process price updates (skipping deleted ones)
      const validUpdates = Array.from(dirtyPrices.entries())
        .filter(([id]) => !pendingDeleteIds.has(id))
        .map(([treatmentId, amount]) => ({
          treatmentId,
          amount,
        }));

      if (validUpdates.length > 0) {
        const res = await batchSaveTreatmentPricesAction(validUpdates);
        if (!res.success) {
          setPricingStatus({ type: "error", message: res.error || "Fiyatlar kaydedilemedi." });
          return;
        }
        setPriceMap((prev) => {
          const next = new Map(prev);
          for (const u of validUpdates) {
            next.set(u.treatmentId, u.amount);
          }
          return next;
        });
      }

      const delCount = pendingDeleteIds.size;
      const priceCount = validUpdates.length;

      setDirtyPrices(new Map());
      setPendingDeleteIds(new Set());

      let msg = "Tüm değişiklikler başarıyla kaydedildi.";
      if (delCount > 0 && priceCount > 0) {
        msg = `${delCount} işlem silindi, ${priceCount} işlemin fiyatı güncellendi.`;
      } else if (delCount > 0) {
        msg = `${delCount} tedavi işlemi başarıyla silindi.`;
      } else if (priceCount > 0) {
        msg = `${priceCount} işlemin fiyatı güncellendi.`;
      }

      setPricingStatus({
        type: "success",
        message: msg,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Değişiklikler kaydedilemedi.";
      setPricingStatus({ type: "error", message: msg });
    } finally {
      setIsSavingPrices(false);
    }
  };

  const handleSaveTreatmentName = async (treatId: string) => {
    if (!editingTreatmentName.trim()) return;
    setIsUpdatingTreatment(true);
    try {
      const res = await updateTreatmentItemAction({
        id: treatId,
        name: editingTreatmentName.trim(),
      });
      if (!res.success || !res.data) {
        setPricingStatus({ type: "error", message: res.error || "İsim güncellenemedi." });
        return;
      }
      setTreatmentsList((prev) =>
        prev.map((t) => (t.id === treatId ? { ...t, name: res.data!.name } : t))
      );
      setEditingTreatmentId(null);
      setPricingStatus({
        type: "success",
        message: "İşlem adı güncellendi.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Hata oluştu.";
      setPricingStatus({ type: "error", message: msg });
    } finally {
      setIsUpdatingTreatment(false);
    }
  };

  const handleToggleActive = async (treatId: string, currentActive: boolean) => {
    try {
      const res = await updateTreatmentItemAction({
        id: treatId,
        isActive: !currentActive,
      });
      if (!res.success || !res.data) {
        setPricingStatus({ type: "error", message: res.error || "Durum değiştirilemedi." });
        return;
      }
      setTreatmentsList((prev) =>
        prev.map((t) => (t.id === treatId ? { ...t, isActive: res.data!.isActive } : t))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Hata oluştu.";
      setPricingStatus({ type: "error", message: msg });
    }
  };

  const isDirty = !isDeepEqual(settings, savedSettings);

  const logoInputId = useId();
  const coverInputId = useId();
  const doctorInputId = useId();
  const aboutInputId = useId();

  const currentPalette = PALETTE_CONFIGS[settings.palette] || PALETTE_CONFIGS.navy;
  const currencySymbol = CURRENCY_SYMBOLS[settings.currency] || "₺";

  const handleFieldChange = <K extends keyof ClinicSettings>(
    field: K,
    val: ClinicSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
    setSaveStatus("idle");
  };

  const handleDoctorChange = <K extends keyof ClinicSettings["doctor"]>(
    field: K,
    val: ClinicSettings["doctor"][K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      doctor: {
        ...prev.doctor,
        [field]: val,
      },
    }));
    setSaveStatus("idle");
  };

  // Save Settings Action
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isDirty || isPending) return;
    setStatusMessage("");

    startTransition(async () => {
      const res = await updateClinicSettingsAction(settings);
      if (res.success && res.data) {
        setSettings(res.data);
        setSavedSettings(res.data);
        setSaveStatus("success");
        setStatusMessage("Değişiklikler başarıyla kaydedildi.");
        setTimeout(() => setSaveStatus("idle"), 4000);
      } else {
        setSaveStatus("error");
        setStatusMessage(res.error || "Ayarlar kaydedilirken bir hata oluştu.");
      }
    });
  };

  // Image File Upload Helper
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "logo" | "cover" | "doctor" | "about"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKind(kind);
    setStatusMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const res = await uploadMediaAction(formData);
    setUploadingKind(null);
    e.target.value = "";

    if (res.success && res.data?.key) {
      const newKey = res.data.key;
      const updated: ClinicSettings = {
        ...settings,
        ...(kind === "logo" && { logoKey: newKey }),
        ...(kind === "cover" && { coverKey: newKey }),
        ...(kind === "about" && { aboutKey: newKey }),
        ...(kind === "doctor" && {
          doctor: {
            ...settings.doctor,
            photoKey: newKey,
          },
        }),
      };
      setSettings(updated);

      // Otomatik olarak ayarları güncelle ve kaydet
      const saveRes = await updateClinicSettingsAction(updated);
      const kindLabel =
        kind === "logo"
          ? "Logo"
          : kind === "cover"
          ? "Kapak fotoğrafı"
          : kind === "doctor"
          ? "Hekim fotoğrafı"
          : "Klinik tanıtım görseli";

      if (saveRes.success && saveRes.data) {
        setSettings(saveRes.data);
        setSavedSettings(saveRes.data);
        setSaveStatus("success");
        setStatusMessage(`${kindLabel} başarıyla yüklendi ve kaydedildi.`);
      } else {
        setSaveStatus("success");
        setStatusMessage(`${kindLabel} yüklendi. Değişikliği onaylamak için lütfen "Kaydet" butonuna tıklayın.`);
      }
      setTimeout(() => setSaveStatus("idle"), 4000);
    } else {
      setSaveStatus("error");
      setStatusMessage(res.error || "Dosya yüklenirken bir hata oluştu.");
    }
  };

  const STEPS: { id: TabType; label: string; icon: typeof Building2 }[] = [
    { id: "general", label: "Profil", icon: Building2 },
    { id: "media", label: "Medya", icon: ImageIcon },
    { id: "doctor", label: "Hekim", icon: UserCheck },
    { id: "pdf", label: "Şablon", icon: FileCheck2 },
    { id: "pricing", label: "Fiyatlar", icon: Coins },
  ];
  const stepIndex = Math.max(0, STEPS.findIndex((s) => s.id === activeTab));

  const fieldCls =
    "mt-1.5 w-full rounded-2xl bg-slate-50 px-3.5 py-2.5 text-sm text-[#0b1f4d] placeholder:text-slate-400 outline-hidden ring-1 ring-slate-900/[0.05] transition focus:bg-white focus:ring-[#0b1f4d]/20";
  const labelCls = "block text-xs font-semibold text-slate-500";
  const softCard =
    "rounded-[1.75rem] bg-slate-50/70 p-5 ring-1 ring-slate-900/[0.04] sm:p-6";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12.5rem)] w-full max-w-[1500px] flex-col pb-4 lg:h-[calc(100dvh-8.5rem)] lg:min-h-[480px]">
      <section className="relative flex flex-1 flex-col overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white shadow-[0_16px_48px_-28px_rgba(15,23,42,0.18)] lg:min-h-0">
        {/* Header */}
        <div className="relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:py-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-400">Klinik Profili</p>
            <h1 className="truncate text-3xl font-bold tracking-tight text-[#0b1f4d] lg:text-[1.75rem]">
              {settings.name?.trim() || "Klinik & Şablon"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {saveStatus !== "idle" && (
              <div
                className={`inline-flex h-11 max-w-[260px] items-center gap-2 truncate rounded-2xl px-3.5 text-sm font-semibold ${
                  saveStatus === "success"
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
                    : "bg-rose-50 text-rose-800 ring-1 ring-rose-200/80"
                }`}
              >
                {saveStatus === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0" />
                ) : (
                  <AlertCircle className="size-4 shrink-0" />
                )}
                <span className="truncate">{statusMessage}</span>
              </div>
            )}
            {activeTab === "pricing" ? (
              totalChanges > 0 ? (
                <button
                  type="button"
                  onClick={() => void handleSaveAllChanges()}
                  disabled={isSavingPrices}
                  className="tp-btn tp-btn-primary inline-flex h-11 items-center gap-2 rounded-xl bg-[#0b1f4d] px-5 text-sm font-semibold text-white shadow-lg shadow-[#0b1f4d]/25 disabled:opacity-60"
                >
                  {isSavingPrices ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Kaydet
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">
                    {totalChanges}
                  </span>
                </button>
              ) : null
            ) : (
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={!isDirty || isPending}
                className={`tp-btn inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold ${
                  !isDirty || isPending
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "tp-btn-primary bg-[#0b1f4d] text-white shadow-lg shadow-[#0b1f4d]/25"
                }`}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Kaydet
              </button>
            )}
          </div>
        </div>

        <div className="relative h-px bg-slate-100" />

        {/* Stepped tabs */}
        <div className="relative px-6 pt-4 sm:px-8">
          <div className="mb-3 h-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#0b1f4d] transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div
            role="tablist"
            aria-label="Klinik profil adımları"
            className="flex gap-1 overflow-x-auto pb-1"
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const active = activeTab === step.id;
              const done = i < stepIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleTabChange(step.id)}
                  className={`tp-tab group inline-flex shrink-0 items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm font-semibold ${
                    active
                      ? "bg-[#0b1f4d] text-white shadow-[0_10px_28px_-14px_rgba(11,31,77,0.45)]"
                      : done
                        ? "bg-slate-50 text-[#0b1f4d] ring-1 ring-slate-900/[0.04]"
                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <span
                    className={`flex size-7 items-center justify-center rounded-xl text-xs font-bold tabular-nums ${
                      active
                        ? "bg-white/15 text-white"
                        : done
                          ? "bg-[#0b1f4d]/10 text-[#0b1f4d]"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {done && !active ? (
                      <Check className="size-3.5" strokeWidth={2.6} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <Icon className="size-4 opacity-80" strokeWidth={1.9} />
                  <span>{step.label}</span>
                  {step.id === "pricing" && totalChanges > 0 ? (
                    <span
                      className={`size-1.5 rounded-full ${
                        active ? "bg-amber-300" : "bg-amber-500"
                      }`}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative mt-3 h-px bg-slate-100" />

        {/* Panel */}
        <div
          key={activeTab}
          className="tp-panel-enter flex min-h-0 flex-1 flex-col overflow-x-clip overflow-y-auto px-6 py-6 sm:px-8 lg:py-5"
        >
          {/* 1. PROFİL */}
          {activeTab === "general" && (
            <form
              onSubmit={handleSave}
              className="tp-stagger mx-auto grid w-full max-w-4xl grid-cols-1 gap-5 md:grid-cols-2"
            >
              <div>
                <label className={labelCls}>Klinik adı *</label>
                <input
                  type="text"
                  required
                  value={settings.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Örn: DentArt"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>Slogan</label>
                <input
                  type="text"
                  value={settings.slogan}
                  onChange={(e) => handleFieldChange("slogan", e.target.value)}
                  placeholder="Kısa marka cümlesi"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-3.5" /> Telefon
                  </span>
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="+90 …"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" /> E-posta
                  </span>
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="info@klinik.com"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>Web sitesi</label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => handleFieldChange("website", e.target.value)}
                  placeholder="https://"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>Çalışma saatleri</label>
                <input
                  type="text"
                  value={settings.hours}
                  onChange={(e) => handleFieldChange("hours", e.target.value)}
                  placeholder="Pzt–Cum 09:00–18:00"
                  className={fieldCls}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> Adres
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={settings.address}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  placeholder="Klinik adresi"
                  className={`${fieldCls} min-h-[88px] resize-y`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Harita bağlantısı</label>
                <input
                  type="url"
                  value={settings.mapUrl}
                  onChange={(e) => handleFieldChange("mapUrl", e.target.value)}
                  placeholder="Google Maps URL"
                  className={fieldCls}
                />
              </div>
            </form>
          )}

          {/* 2. MEDYA */}
          {activeTab === "media" && (
            <div className="tp-stagger mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
              {(
                [
                  {
                    kind: "logo" as const,
                    title: "Logo",
                    key: settings.logoKey,
                    inputId: logoInputId,
                    clear: () => handleFieldChange("logoKey", ""),
                    fit: "object-contain p-3",
                  },
                  {
                    kind: "cover" as const,
                    title: "Kapak",
                    key: settings.coverKey,
                    inputId: coverInputId,
                    clear: () => handleFieldChange("coverKey", ""),
                    fit: "object-cover",
                  },
                  {
                    kind: "about" as const,
                    title: "Tanıtım",
                    key: settings.aboutKey,
                    inputId: aboutInputId,
                    clear: () => handleFieldChange("aboutKey", ""),
                    fit: "object-cover",
                  },
                ] as const
              ).map((item) => (
                <div key={item.kind} className={`${softCard} flex flex-col`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0b1f4d]">{item.title}</h3>
                    {item.key ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <Check className="size-3" /> Hazır
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/[0.05]">
                    {item.key ? (
                      <img
                        src={getMediaUrl(item.key)!}
                        alt={item.title}
                        className={`size-full ${item.fit}`}
                      />
                    ) : (
                      <ImageIcon className="size-8 text-slate-300" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      id={item.inputId}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, item.kind)}
                      className="hidden"
                    />
                    <label
                      htmlFor={item.inputId}
                      className="tp-btn inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#0b1f4d] ring-1 ring-slate-900/[0.06]"
                    >
                      {uploadingKind === item.kind ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      {item.key ? "Değiştir" : "Yükle"}
                    </label>
                    {item.key ? (
                      <button
                        type="button"
                        onClick={item.clear}
                        className="tp-icon-btn inline-flex size-10 items-center justify-center rounded-xl text-rose-500 ring-1 ring-rose-100 hover:bg-rose-50"
                        title="Kaldır"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. HEKİM */}
          {activeTab === "doctor" && (
            <form
              onSubmit={handleSave}
              className="tp-stagger mx-auto grid w-full max-w-4xl grid-cols-1 gap-5 md:grid-cols-2"
            >
              <div>
                <label className={labelCls}>Hekim adı *</label>
                <input
                  type="text"
                  required
                  value={settings.doctor.name}
                  onChange={(e) => handleDoctorChange("name", e.target.value)}
                  placeholder="Dr. Dt. …"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>Unvan</label>
                <input
                  type="text"
                  value={settings.doctor.title}
                  onChange={(e) => handleDoctorChange("title", e.target.value)}
                  placeholder="Uzmanlık / başhekim"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>Alt unvan</label>
                <input
                  type="text"
                  value={settings.doctor.subtitle}
                  onChange={(e) => handleDoctorChange("subtitle", e.target.value)}
                  placeholder="İkinci unvan"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>İmza başlığı</label>
                <input
                  type="text"
                  value={settings.signerTitle}
                  onChange={(e) => handleFieldChange("signerTitle", e.target.value)}
                  placeholder="PDF alt imza"
                  className={fieldCls}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Kısa biyografi</label>
                <textarea
                  rows={4}
                  value={settings.doctor.bio}
                  onChange={(e) => handleDoctorChange("bio", e.target.value)}
                  placeholder="Hekim tanıtım metni"
                  className={`${fieldCls} min-h-[120px] resize-y`}
                />
              </div>
              <div className="md:col-span-2 flex flex-col items-center gap-4 rounded-[1.75rem] bg-slate-50/70 p-5 ring-1 ring-slate-900/[0.04] sm:flex-row">
                <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-900/[0.06]">
                  {settings.doctor.photoKey ? (
                    <img
                      src={getMediaUrl(settings.doctor.photoKey)!}
                      alt={settings.doctor.name || "Hekim"}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserCheck className="size-7 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-sm font-semibold text-[#0b1f4d]">Portre fotoğrafı</p>
                  <p className="text-xs text-slate-400">PDF hekim kartında görünür</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id={doctorInputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "doctor")}
                    className="hidden"
                  />
                  <label
                    htmlFor={doctorInputId}
                    className="tp-btn inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#0b1f4d] ring-1 ring-slate-900/[0.06]"
                  >
                    {uploadingKind === "doctor" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    {settings.doctor.photoKey ? "Değiştir" : "Yükle"}
                  </label>
                  {settings.doctor.photoKey ? (
                    <button
                      type="button"
                      onClick={() => handleDoctorChange("photoKey", "")}
                      className="tp-icon-btn inline-flex size-10 items-center justify-center rounded-xl text-rose-500 ring-1 ring-rose-100 hover:bg-rose-50"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </form>
          )}

          {/* 4. ŞABLON */}
          {activeTab === "pdf" && (
            <div className="tp-stagger mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-6 md:grid-cols-12">
              <div className="space-y-4 md:col-span-5">
                <div className={softCard}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className={`${labelCls} inline-flex items-center gap-1.5`}>
                        <Globe className="size-3.5" /> Dil
                      </span>
                      <div className="mt-1.5 flex rounded-2xl bg-white p-1 ring-1 ring-slate-900/[0.05]">
                        {(["tr", "en"] as Locale[]).map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => handleFieldChange("locale", loc)}
                            className={`tp-tab flex-1 rounded-xl py-2 text-xs font-semibold ${
                              settings.locale === loc
                                ? "bg-[#0b1f4d] text-white"
                                : "text-slate-500 hover:text-[#0b1f4d]"
                            }`}
                          >
                            {loc === "tr" ? "TR" : "EN"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className={`${labelCls} inline-flex items-center gap-1.5`}>
                        <Coins className="size-3.5" /> Para birimi
                      </span>
                      <div className="mt-1.5 flex rounded-2xl bg-white p-1 ring-1 ring-slate-900/[0.05]">
                        {(["TRY", "EUR", "USD"] as Currency[]).map((cur) => (
                          <button
                            key={cur}
                            type="button"
                            onClick={() => handleFieldChange("currency", cur)}
                            className={`tp-tab flex-1 rounded-xl py-2 text-xs font-semibold ${
                              settings.currency === cur
                                ? "bg-[#0b1f4d] text-white"
                                : "text-slate-500 hover:text-[#0b1f4d]"
                            }`}
                          >
                            {CURRENCY_SYMBOLS[cur]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className={`${labelCls} inline-flex items-center gap-1.5`}>
                      <PaletteIcon className="size-3.5" /> Renk paleti
                    </span>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {(Object.keys(PALETTE_CONFIGS) as Palette[]).map((palKey) => {
                        const pal = PALETTE_CONFIGS[palKey];
                        const active = settings.palette === palKey;
                        return (
                          <button
                            key={palKey}
                            type="button"
                            onClick={() => handleFieldChange("palette", palKey)}
                            className={`tp-tab flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left ${
                              active
                                ? "bg-white ring-2 ring-[#0b1f4d]/30"
                                : "bg-white/60 ring-1 ring-slate-900/[0.04] hover:bg-white"
                            }`}
                          >
                            <span
                              className="size-7 shrink-0 rounded-xl shadow-inner"
                              style={{ backgroundColor: pal.primaryHex }}
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-semibold text-[#0b1f4d]">
                                {pal.name}
                              </span>
                            </span>
                            {active ? (
                              <Check className="ml-auto size-3.5 shrink-0 text-[#0b1f4d]" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className={softCard}>
                  <div className="flex rounded-2xl bg-white p-1 ring-1 ring-slate-900/[0.05]">
                    {(
                      [
                        { id: "welcome" as const, label: "Karşılama", icon: FileText },
                        { id: "legal" as const, label: "Yasal", icon: FileCheck2 },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPdfTextTab(t.id)}
                        className={`tp-tab flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold ${
                          pdfTextTab === t.id
                            ? "bg-[#0b1f4d] text-white"
                            : "text-slate-500 hover:text-[#0b1f4d]"
                        }`}
                      >
                        <t.icon className="size-3.5" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={7}
                    value={
                      pdfTextTab === "welcome" ? settings.welcomeBody : settings.legal
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        pdfTextTab === "welcome" ? "welcomeBody" : "legal",
                        e.target.value
                      )
                    }
                    placeholder={
                      pdfTextTab === "welcome"
                        ? "Hasta karşılama metni"
                        : "Yasal uyarı metni"
                    }
                    className={`${fieldCls} mt-3 min-h-[160px] resize-y`}
                  />
                </div>
              </div>

              {/* Live preview */}
              <div className="md:col-span-7 md:sticky md:top-2">
                <div className="overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/[0.06] sm:p-7">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-11 items-center justify-center overflow-hidden rounded-xl font-bold text-white"
                        style={{
                          backgroundColor: settings.logoKey
                            ? "#ffffff"
                            : currentPalette.primaryHex,
                          border: settings.logoKey ? "1px solid #e2e8f0" : undefined,
                        }}
                      >
                        {settings.logoKey ? (
                          <img
                            src={getMediaUrl(settings.logoKey)!}
                            alt=""
                            className="size-full object-contain p-1"
                          />
                        ) : (
                          (settings.name || "D").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {settings.name || "Klinik Adı"}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {settings.slogan || "Slogan"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: currentPalette.bgSoft,
                          color: currentPalette.primaryHex,
                        }}
                      >
                        {settings.locale === "en" ? "TREATMENT PLAN" : "TEDAVİ PLANI"}
                      </span>
                      <p className="mt-1 text-[10px] text-slate-400" suppressHydrationWarning>
                        {new Date().toLocaleDateString(
                          settings.locale === "en" ? "en-GB" : "tr-TR"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50/80 p-3 text-[11px] leading-relaxed text-slate-600">
                    {settings.welcomeBody ||
                      "Değerli hastamız, size özel hazırlanan tedavi planı aşağıda sunulmuştur."}
                  </div>

                  <div className="mt-5 overflow-hidden rounded-xl ring-1 ring-slate-100">
                    <table className="w-full text-left text-[11px]">
                      <thead
                        style={{
                          backgroundColor: currentPalette.bgSoft,
                          color: currentPalette.primaryHex,
                        }}
                        className="font-bold"
                      >
                        <tr>
                          <th className="px-3 py-2">
                            {settings.locale === "en" ? "Procedure" : "İşlem"}
                          </th>
                          <th className="px-3 py-2 text-center">
                            {settings.locale === "en" ? "Session" : "Seans"}
                          </th>
                          <th className="px-3 py-2 text-right">
                            {settings.locale === "en" ? "Amount" : "Tutar"} (
                            {settings.currency})
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        <tr>
                          <td className="px-3 py-2 font-medium text-slate-900">
                            Titanyum İmplant
                          </td>
                          <td className="px-3 py-2 text-center">1</td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-900">
                            {currencySymbol} 18.000
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium text-slate-900">
                            Zirkonyum Kron
                          </td>
                          <td className="px-3 py-2 text-center">2</td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-900">
                            {currencySymbol} 12.500
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="max-w-[55%] text-[10px] leading-relaxed text-slate-400">
                      {settings.legal ||
                        (settings.locale === "en"
                          ? "Prices may vary based on clinical findings."
                          : "Fiyatlar klinik bulgulara göre değişiklik gösterebilir.")}
                    </p>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">
                        {settings.locale === "en" ? "Total" : "Toplam"}
                      </p>
                      <p
                        className="text-base font-bold tabular-nums"
                        style={{ color: currentPalette.primaryHex }}
                      >
                        {currencySymbol} 30.500
                      </p>
                      <p className="mt-2 text-[10px] font-semibold text-slate-700">
                        {settings.doctor.name || settings.signerTitle || "Hekim"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. FİYATLAR */}
          {activeTab === "pricing" && (
            <div className="tp-stagger mx-auto flex w-full max-w-5xl flex-col gap-5">
              {pricingStatus ? (
                <div
                  className={`inline-flex items-center gap-2 self-start rounded-2xl px-3.5 py-2.5 text-sm font-semibold ${
                    pricingStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
                      : "bg-rose-50 text-rose-800 ring-1 ring-rose-200/80"
                  }`}
                >
                  {pricingStatus.type === "success" ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" />
                  )}
                  <span>{pricingStatus.message}</span>
                  <button
                    type="button"
                    onClick={() => setPricingStatus(null)}
                    className="ml-1 rounded-lg p-0.5 opacity-60 hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : null}

              <div className={softCard}>
                <form
                  onSubmit={handleAddTreatment}
                  noValidate
                  className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end"
                >
                  <div className="sm:col-span-5">
                    <label className={labelCls}>Yeni işlem</label>
                    <input
                      ref={treatNameInputRef}
                      type="text"
                      value={newTreatName}
                      onChange={(e) => setNewTreatName(e.target.value)}
                      placeholder="Tedavi adı"
                      className={fieldCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Kod</label>
                    <input
                      type="text"
                      value={newTreatCode}
                      onChange={(e) => setNewTreatCode(e.target.value)}
                      placeholder="TR…"
                      className={fieldCls}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={labelCls}>
                      Fiyat ({currencySymbol})
                    </label>
                    <div className="mt-1.5">
                      <PriceInput
                        value={newTreatPrice}
                        onChange={setNewTreatPrice}
                        className="w-full rounded-2xl bg-slate-50 px-3.5 py-2.5 text-sm text-[#0b1f4d] outline-hidden ring-1 ring-slate-900/[0.05] focus:bg-white focus:ring-[#0b1f4d]/20"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isAddingTreatment}
                      className="tp-btn tp-btn-primary inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-[#0b1f4d] text-sm font-semibold text-white shadow-md shadow-[#0b1f4d]/20 disabled:opacity-60"
                    >
                      {isAddingTreatment ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                      Ekle
                    </button>
                  </div>
                </form>

                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Hızlı ekle
                  </p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {QUICK_TREATMENT_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.code}
                        type="button"
                        disabled={isAddingTreatment}
                        onClick={() => {
                          void submitNewTreatment({
                            name: tpl.name,
                            code: tpl.code,
                            priceMinor: tpl.priceMinor,
                          });
                        }}
                        className="tp-tab shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-900/[0.05] hover:text-[#0b1f4d] disabled:opacity-50"
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={softCard}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="İşlem veya kod ara"
                      className="h-11 w-full rounded-2xl bg-white pl-10 pr-9 text-sm text-[#0b1f4d] placeholder:text-slate-400 outline-hidden ring-1 ring-slate-900/[0.05] transition focus:ring-[#0b1f4d]/20"
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700"
                      >
                        <X className="size-3.5" />
                      </button>
                    ) : null}
                  </div>
                  {totalChanges > 0 ? (
                    <p className="text-xs font-semibold text-amber-700">
                      {totalChanges} bekleyen değişiklik
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/[0.05]">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-4 py-3 w-24">Kod</th>
                        <th className="px-4 py-3">İşlem</th>
                        <th className="px-4 py-3 w-44 text-right">
                          Fiyat ({currencySymbol})
                        </th>
                        <th className="px-4 py-3 w-28 text-center">Durum</th>
                        <th className="px-4 py-3 w-24 text-right" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredTreatments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-12 text-center text-sm text-slate-400"
                          >
                            {searchQuery
                              ? "Sonuç yok"
                              : "Henüz işlem eklenmedi"}
                          </td>
                        </tr>
                      ) : (
                        filteredTreatments.map((t) => {
                          const treatId = String(t.id);
                          const isPendingDelete = pendingDeleteIds.has(treatId);
                          const dirty = dirtyPrices.has(treatId);
                          const displayPrice =
                            dirtyPrices.get(treatId) ?? priceMap.get(treatId) ?? 0;
                          const isEditing = editingTreatmentId === treatId;

                          return (
                            <tr
                              key={treatId}
                              className={`transition ${
                                isPendingDelete
                                  ? "bg-rose-50/50 opacity-60"
                                  : dirty
                                    ? "bg-amber-50/40"
                                    : "hover:bg-slate-50/80"
                              }`}
                            >
                              <td className="px-4 py-3 font-mono text-xs text-slate-400">
                                {t.code}
                              </td>
                              <td className="px-4 py-3">
                                {isEditing ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={editingTreatmentName}
                                      onChange={(e) =>
                                        setEditingTreatmentName(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                          void handleSaveTreatmentName(treatId);
                                        if (e.key === "Escape")
                                          setEditingTreatmentId(null);
                                      }}
                                      className="w-full rounded-xl bg-slate-50 px-2.5 py-1.5 text-sm text-[#0b1f4d] outline-hidden ring-1 ring-[#0b1f4d]/20"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      disabled={isUpdatingTreatment}
                                      onClick={() =>
                                        void handleSaveTreatmentName(treatId)
                                      }
                                      className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                                    >
                                      {isUpdatingTreatment ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                      ) : (
                                        <Check className="size-3.5" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTreatmentId(null)}
                                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                                    >
                                      <X className="size-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isPendingDelete}
                                    onClick={() => {
                                      setEditingTreatmentId(treatId);
                                      setEditingTreatmentName(t.name);
                                    }}
                                    className="group inline-flex max-w-full items-center gap-1.5 text-left font-semibold text-[#0b1f4d] disabled:cursor-default"
                                  >
                                    <span className="truncate">{t.name}</span>
                                    <Pencil className="size-3 shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100" />
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <PriceInput
                                  value={displayPrice}
                                  onChange={(val) =>
                                    handlePriceChange(treatId, val)
                                  }
                                  disabled={isPendingDelete}
                                  className="ml-auto w-36 rounded-xl bg-slate-50 px-2.5 py-1.5 text-right text-sm font-semibold tabular-nums text-[#0b1f4d] outline-hidden ring-1 ring-slate-900/[0.05] focus:bg-white focus:ring-[#0b1f4d]/20 disabled:opacity-50"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  disabled={isPendingDelete}
                                  onClick={() =>
                                    void handleToggleActive(
                                      treatId,
                                      t.isActive ?? true
                                    )
                                  }
                                  className={`tp-tab inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                    t.isActive ?? true
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {t.isActive ?? true ? "Aktif" : "Pasif"}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {isPendingDelete ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUndoDelete(treatId)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white"
                                  >
                                    <Undo2 className="size-3.5" />
                                    Geri
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkDelete(treatId)}
                                    className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                                    title="Sil"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
