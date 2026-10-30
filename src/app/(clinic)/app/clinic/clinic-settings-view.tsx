"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useId, useMemo, useState, useTransition } from "react";
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
  Info,
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
    name: "Derin Lacivert (Navy)",
    description: "Kurumsal, güven veren gece mavisi tonu.",
    primaryHex: "#0f172a",
    accentHex: "#2563eb",
    bgSoft: "#f1f5f9",
    borderHex: "#cbd5e1",
  },
  forest: {
    name: "Zümrüt Orman (Forest)",
    description: "Doğallık, dinginlik ve sağlık tonu.",
    primaryHex: "#064e3b",
    accentHex: "#059669",
    bgSoft: "#ecfdf5",
    borderHex: "#a7f3d0",
  },
  rose: {
    name: "Zarif Gül (Rose)",
    description: "Sıcak, estetik ve premium gül kurusu.",
    primaryHex: "#881337",
    accentHex: "#e11d48",
    bgSoft: "#fff1f2",
    borderHex: "#fecdd3",
  },
  slate: {
    name: "Arduvaz Taş (Slate)",
    description: "Modern, minimalist ve tarafsız gri-füme.",
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
  userEmail,
  workspaceId,
  initialTreatments = [],
  initialPriceList = null,
  initialTab = "general",
}: ClinicSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (initialTab && ["general", "media", "doctor", "pdf", "pricing"].includes(initialTab)) {
      return initialTab;
    }
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlTab = sp.get("tab") as TabType | null;
      if (urlTab && ["general", "media", "doctor", "pdf", "pricing"].includes(urlTab)) {
        return urlTab;
      }
    }
    return "general";
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (!sp.get("tab")) {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", activeTab);
        window.history.replaceState(null, "", url.toString());
      }
    }

    const onPopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const urlTab = sp.get("tab") as TabType | null;
      if (urlTab && ["general", "media", "doctor", "pdf", "pricing"].includes(urlTab)) {
        setActiveTab(urlTab);
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

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newTreatName.trim();
    if (!name) {
      setPricingStatus({ type: "error", message: "Lütfen bir tedavi işlemi adı yazın." });
      return;
    }
    setIsAddingTreatment(true);
    setPricingStatus(null);
    try {
      const res = await createTreatmentWithPriceAction({
        name,
        code: newTreatCode.trim() || undefined,
        priceMinor: newTreatPrice,
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
        message: `"${newTr.name}" başarıyla kaydedildi ve tedavi planlarında kullanıma açıldı.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bir hata oluştu.";
      setPricingStatus({ type: "error", message: msg });
    } finally {
      setIsAddingTreatment(false);
    }
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Üst Başlık & Sekme Çubuğu */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Klinik Ayarları & Marka Kimliği
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {userEmail} • Workspace: {workspaceId} • Hastalarınıza sunacağınız kurumsal PDF şablonunu ve klinik profilinizi yapılandırın.
          </p>
        </div>

        {/* Bildirim Çubuğu */}
        {saveStatus !== "idle" && (
          <div
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${saveStatus === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-rose-200 bg-rose-50 text-rose-800"
              }`}
          >
            {saveStatus === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-600" />
            ) : null}
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Modern Sekme (Tab) Menüsü */}
      <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs gap-1.5">
        <button
          type="button"
          onClick={() => handleTabChange("general")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "general"
            ? "bg-slate-900 text-white shadow-xs"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          <Building2 className="size-3.5" />
          <span>Genel Bilgiler</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("media")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "media"
            ? "bg-slate-900 text-white shadow-xs"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          <ImageIcon className="size-3.5" />
          <span>Medya & Logo Yükleme</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("doctor")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "doctor"
            ? "bg-slate-900 text-white shadow-xs"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          <UserCheck className="size-3.5" />
          <span>Hekim Profili</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("pdf")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "pdf"
            ? "bg-slate-900 text-white shadow-xs"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          <FileCheck2 className="size-3.5" />
          <span>PDF Şablonu (Canlı Önizleme)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("pricing")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "pricing"
            ? "bg-slate-900 text-white shadow-xs"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          <Coins className="size-3.5" />
          <span>Tedavi & Fiyat Listesi</span>
          {totalChanges > 0 && (
            <span className="flex size-1.5 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* 1. SEKME: GENEL BİLGİLER */}
      {activeTab === "general" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Temel İletişim ve Klinik Bilgileri
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Bu bilgiler hastalarınıza iletilecek PDF planlarının antetinde ve portalında görünür.
                </p>
              </div>
              <button
                type="submit"
                disabled={!isDirty || isPending}
                className={`inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  !isDirty || isPending
                    ? "cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200/80 opacity-60 shadow-none"
                    : "cursor-pointer bg-slate-900 text-white shadow-2xs hover:bg-slate-800"
                }`}
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                <span>Kaydet</span>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Klinik Adı *
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Örn: DentArt Ağız ve Diş Sağlığı"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Kurumsal Slogan
                </label>
                <input
                  type="text"
                  value={settings.slogan}
                  onChange={(e) => handleFieldChange("slogan", e.target.value)}
                  placeholder="Örn: Gülüşünüz Estetikle Buluşuyor"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Telefon Numarası
                </label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="+90 212 000 00 00"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Kurumsal E-posta
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="info@dentart.com"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Web Sitesi
                </label>
                <div className="relative mt-1.5">
                  <Globe className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={settings.website}
                    onChange={(e) => handleFieldChange("website", e.target.value)}
                    placeholder="https://www.dentart.com"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Çalışma Gün ve Saatleri
                </label>
                <input
                  type="text"
                  value={settings.hours}
                  onChange={(e) => handleFieldChange("hours", e.target.value)}
                  placeholder="Hafta içi: 09:00 - 19:00, Cmt: 09:00 - 16:00"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Klinik Açık Adresi
                </label>
                <div className="relative mt-1.5">
                  <MapPin className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                  <textarea
                    rows={2}
                    value={settings.address}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                    placeholder="Levent Mah. Nispetiye Cad. No:12 Beşiktaş / İstanbul"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Google Harita Linki (Map URL)
                </label>
                <input
                  type="text"
                  value={settings.mapUrl}
                  onChange={(e) => handleFieldChange("mapUrl", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 2. SEKME: MEDYA & LOGO YÜKLEME */}
      {activeTab === "media" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Görsel Varlıklar & Marka Logoları
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Klinik logonuzu ve sunumlarda kullanılacak kapak fotoğraflarını yükleyin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={!isDirty || isPending}
                className={`inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  !isDirty || isPending
                    ? "cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200/80 opacity-60 shadow-none"
                    : "cursor-pointer bg-slate-900 text-white shadow-2xs hover:bg-slate-800"
                }`}
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                <span>Kaydet</span>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* 1. Kurumsal Logo */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 p-5 bg-slate-50/50">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">1. Kurumsal Logo</span>
                    {settings.logoKey ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <Check className="size-3" /> Yüklendi
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    PDF antetinde ve hasta portalında kullanılır.
                  </p>
                  <div className="mt-4 flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white overflow-hidden p-2">
                    {settings.logoKey ? (
                      <img
                        src={getMediaUrl(settings.logoKey)!}
                        alt="Kurumsal Logo"
                        className="max-h-32 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-4">
                        <ImageIcon className="mx-auto size-8 text-slate-300 stroke-[1.5]" />
                        <span className="mt-1.5 block text-xs font-medium text-slate-500">Logo yüklenmedi</span>
                        <span className="mt-0.5 block text-[10px] text-slate-400">PNG, JPG, WebP (Maks. 5MB)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    id={logoInputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "logo")}
                    className="hidden"
                  />
                  <label
                    htmlFor={logoInputId}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                  >
                    {uploadingKind === "logo" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>{settings.logoKey ? "Logoyu Değiştir" : "Logo Seç & Yükle"}</span>
                  </label>
                  {settings.logoKey ? (
                    <button
                      type="button"
                      onClick={() => handleFieldChange("logoKey", "")}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                      title="Logoyu Kaldır"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* 2. Kapak Fotoğrafı */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 p-5 bg-slate-50/50">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">2. Kapak Fotoğrafı</span>
                    {settings.coverKey ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <Check className="size-3" /> Yüklendi
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    24 sayfalık PDF&apos;in 1. kapağında yer alır.
                  </p>
                  <div className="mt-4 flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white overflow-hidden p-1">
                    {settings.coverKey ? (
                      <img
                        src={getMediaUrl(settings.coverKey)!}
                        alt="Kapak Fotoğrafı"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-4">
                        <ImageIcon className="mx-auto size-8 text-slate-300 stroke-[1.5]" />
                        <span className="mt-1.5 block text-xs font-medium text-slate-500">Kapak yüklenmedi</span>
                        <span className="mt-0.5 block text-[10px] text-slate-400">Yüksek çözünürlüklü yatay görsel</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    id={coverInputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "cover")}
                    className="hidden"
                  />
                  <label
                    htmlFor={coverInputId}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                  >
                    {uploadingKind === "cover" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>{settings.coverKey ? "Kapağı Değiştir" : "Kapak Seç & Yükle"}</span>
                  </label>
                  {settings.coverKey ? (
                    <button
                      type="button"
                      onClick={() => handleFieldChange("coverKey", "")}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                      title="Kapağı Kaldır"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* 3. Klinik Tanıtım Görseli */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 p-5 bg-slate-50/50">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">3. Klinik Tanıtım Görseli</span>
                    {settings.aboutKey ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <Check className="size-3" /> Yüklendi
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Klinik içi veya ekip fotoğrafı.
                  </p>
                  <div className="mt-4 flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white overflow-hidden p-1">
                    {settings.aboutKey ? (
                      <img
                        src={getMediaUrl(settings.aboutKey)!}
                        alt="Klinik Görseli"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-4">
                        <ImageIcon className="mx-auto size-8 text-slate-300 stroke-[1.5]" />
                        <span className="mt-1.5 block text-xs font-medium text-slate-500">Görsel yüklenmedi</span>
                        <span className="mt-0.5 block text-[10px] text-slate-400">Klinik içi veya ekip fotoğrafı</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    id={aboutInputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "about")}
                    className="hidden"
                  />
                  <label
                    htmlFor={aboutInputId}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                  >
                    {uploadingKind === "about" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>{settings.aboutKey ? "Görseli Değiştir" : "Görsel Seç & Yükle"}</span>
                  </label>
                  {settings.aboutKey ? (
                    <button
                      type="button"
                      onClick={() => handleFieldChange("aboutKey", "")}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                      title="Görseli Kaldır"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SEKME: HEKİM PROFİLİ */}
      {activeTab === "doctor" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sorumlu Hekim ve İmza Yetkilisi
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Hastalarınıza sunulan tedavi planlarında onaylayıcı hekim kartı olarak gösterilir.
                </p>
              </div>
              <button
                type="submit"
                disabled={!isDirty || isPending}
                className={`inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  !isDirty || isPending
                    ? "cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200/80 opacity-60 shadow-none"
                    : "cursor-pointer bg-slate-900 text-white shadow-2xs hover:bg-slate-800"
                }`}
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                <span>Kaydet</span>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Hekim Adı ve Soyadı *
                </label>
                <input
                  type="text"
                  value={settings.doctor.name}
                  onChange={(e) => handleDoctorChange("name", e.target.value)}
                  placeholder="Örn: Dr. Dt. Selim Aydın"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Uzmanlık & Ana Unvan
                </label>
                <input
                  type="text"
                  value={settings.doctor.title}
                  onChange={(e) => handleDoctorChange("title", e.target.value)}
                  placeholder="Örn: Protetik Diş Tedavisi Uzmanı & Başhekim"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Alt Başlık / İkinci Unvan
                </label>
                <input
                  type="text"
                  value={settings.doctor.subtitle}
                  onChange={(e) => handleDoctorChange("subtitle", e.target.value)}
                  placeholder="Örn: İmplantoloji ve Estetik Diş Hekimi"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  İmza Yetkilisi Başlığı (PDF Alt İmza)
                </label>
                <input
                  type="text"
                  value={settings.signerTitle}
                  onChange={(e) => handleFieldChange("signerTitle", e.target.value)}
                  placeholder="Örn: Klinik Direktörü & Başhekim"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Hekim Kısa Biyografisi (PDF Hekim Tanıtım Sayfası)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    PDF ve web sunumunda hekim kartında yer alır
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={settings.doctor.bio}
                  onChange={(e) => handleDoctorChange("bio", e.target.value)}
                  placeholder="15 yılı aşkın süredir ileri cerrahi ve gülüş estetiği alanında uluslararası vakaları yönetmektedir..."
                  className="mt-1.5 w-full min-h-[140px] resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              {/* Hekim Portre Fotoğrafı */}
              <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="relative size-16 shrink-0 rounded-full border border-slate-300 bg-white flex items-center justify-center overflow-hidden font-bold text-slate-400 shadow-xs">
                  {settings.doctor.photoKey ? (
                    <img
                      src={getMediaUrl(settings.doctor.photoKey)!}
                      alt={settings.doctor.name || "Hekim Fotoğrafı"}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserCheck className="size-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="text-xs font-semibold text-slate-900">Hekim Portre Fotoğrafı</span>
                    {settings.doctor.photoKey ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <Check className="size-3" /> Yüklendi
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    PDF hasta sunumu ve hekim kartında yer alır.
                  </p>
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
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition"
                  >
                    {uploadingKind === "doctor" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>{settings.doctor.photoKey ? "Fotoğrafı Değiştir" : "Fotoğraf Yükle"}</span>
                  </label>
                  {settings.doctor.photoKey ? (
                    <button
                      type="button"
                      onClick={() => handleDoctorChange("photoKey", "")}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                      title="Fotoğrafı Kaldır"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 4. SEKME: PDF ŞABLONU (İKİYE BÖLÜNMÜŞ EKRAN / SPLIT-SCREEN) */}
      {activeTab === "pdf" && (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Sol Kolon: Şablon Ayar Paneli */}
          <div className="space-y-4 lg:col-span-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              {/* Başlık & Hızlı Kaydet */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Şablon Yapılandırması
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    PDF planının dil, kur, renk ve metin detaylarını özelleştirin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={!isDirty || isPending}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    !isDirty || isPending
                      ? "cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200/80 opacity-60 shadow-none"
                      : "cursor-pointer bg-slate-900 text-white shadow-2xs hover:bg-slate-800"
                  }`}
                >
                  {isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  <span>Kaydet</span>
                </button>
              </div>

              {/* 1. Satır: Belge Dili ve Para Birimi (Yan Yana Segmented Control) */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Belge Dili */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                      <Globe className="size-3.5 text-slate-400" />
                      Belge Dili
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 uppercase">
                      {settings.locale}
                    </span>
                  </div>
                  <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => handleFieldChange("locale", "tr" as Locale)}
                      className={`flex-1 cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition text-center ${
                        settings.locale === "tr"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Türkçe (TR)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange("locale", "en" as Locale)}
                      className={`flex-1 cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition text-center ${
                        settings.locale === "en"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      English (EN)
                    </button>
                  </div>
                </div>

                {/* Para Birimi */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                      <Coins className="size-3.5 text-slate-400" />
                      Para Birimi (Kur)
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {currencySymbol}
                    </span>
                  </div>
                  <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                    {(["TRY", "EUR", "USD"] as Currency[]).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => handleFieldChange("currency", curr)}
                        className={`flex-1 cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition text-center ${
                          settings.currency === curr
                            ? "bg-white text-slate-900 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {CURRENCY_SYMBOLS[curr]} {curr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Satır: Kurumsal Renk Paleti (Tek Sıra / Yan Yana 4 Renk) */}
              <div className="mt-4 border-t border-slate-100 pt-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                    <PaletteIcon className="size-3.5 text-slate-400" />
                    Kurumsal Renk Teması
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {settings.palette === "navy"
                      ? "Lacivert"
                      : settings.palette === "forest"
                      ? "Zümrüt"
                      : settings.palette === "rose"
                      ? "Gül"
                      : "Arduvaz"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(PALETTE_CONFIGS) as Palette[]).map((palKey) => {
                    const pal = PALETTE_CONFIGS[palKey];
                    const isSelected = settings.palette === palKey;
                    const label =
                      palKey === "navy"
                        ? "Lacivert"
                        : palKey === "forest"
                        ? "Zümrüt"
                        : palKey === "rose"
                        ? "Gül"
                        : "Arduvaz";

                    return (
                      <button
                        key={palKey}
                        type="button"
                        onClick={() => handleFieldChange("palette", palKey)}
                        className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border py-2 px-1 sm:px-2.5 text-center transition cursor-pointer ${
                          isSelected
                            ? "border-slate-900 bg-slate-900/5 shadow-2xs ring-1 ring-slate-900"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Çift Renkli Swatch Çemberi */}
                        <span
                          className="flex size-4.5 shrink-0 items-center justify-center rounded-full shadow-2xs ring-1 ring-black/10"
                          style={{ backgroundColor: pal.primaryHex }}
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: pal.accentHex }}
                          />
                        </span>

                        <span
                          className={`truncate text-xs ${
                            isSelected
                              ? "font-bold text-slate-900"
                              : "font-medium text-slate-700"
                          }`}
                        >
                          {label}
                        </span>

                        {isSelected && (
                          <Check className="size-3.5 shrink-0 text-slate-900" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Satır: Şablon Metinleri (Sade & Karmaşadan Uzak) */}
              <div className="mt-5 border-t border-slate-100 pt-4 space-y-3">
                {/* Minimal İkili Sekme */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setPdfTextTab("welcome")}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        pdfTextTab === "welcome"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Karşılama Yazısı
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfTextTab("legal")}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        pdfTextTab === "legal"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Yasal & KVKK
                    </button>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400">
                    {pdfTextTab === "welcome" ? "PDF 1. Sayfa Açılışı" : "PDF Alt Dipnotu"}
                  </span>
                </div>

                {/* Tek, Ferah ve Sade Metin Alanı */}
                {pdfTextTab === "welcome" ? (
                  <div>
                    <textarea
                      rows={5}
                      value={settings.welcomeBody || settings.intro}
                      onChange={(e) => {
                        handleFieldChange("welcomeBody", e.target.value);
                        handleFieldChange("intro", e.target.value);
                      }}
                      placeholder="Sayın hastamız, size özel hazırlanan tedavi planı sunulmuştur..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 shadow-2xs transition focus:border-slate-900 focus:outline-hidden"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Bu metin PDF teklifinin ilk sayfasında hastaya hitaben gösterilir.
                    </p>
                  </div>
                ) : (
                  <div>
                    <textarea
                      rows={5}
                      value={settings.legal}
                      onChange={(e) => handleFieldChange("legal", e.target.value)}
                      placeholder="İşbu tedavi planı hekim muayenesi sonrası ön tanı niteliğindedir..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 shadow-2xs transition focus:border-slate-900 focus:outline-hidden"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Bu metin PDF teklifinin alt kısmında hukuki ön tanı ve KVKK dipnotu olarak yer alır.
                    </p>
                  </div>
                )}
              </div>

              {/* Bilgi Çizgisi */}
              <div className="mt-4 border-t border-slate-100 pt-3 text-center">
                <span className="text-[11px] text-slate-400">
                  Değişiklikler anlık sağdaki canlı önizlemeye yansır.
                </span>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Sticky Beyaz A4 Formunda Canlı PDF Önizleme */}
          <div className="lg:col-span-6 lg:sticky lg:top-6">
            {/* A4 Kağıt Kartı */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
              {/* Kurumsal Renk Üst Çizgisi */}
              <div
                className="h-1.5 w-full rounded-full transition-colors duration-300"
                style={{ backgroundColor: currentPalette.primaryHex }}
              />

              {/* Antet Başlığı */}
              <div className="mt-5 flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-11 items-center justify-center rounded-xl font-bold text-white shadow-xs transition-colors duration-300 overflow-hidden"
                    style={{
                      backgroundColor: settings.logoKey ? "#ffffff" : currentPalette.primaryHex,
                      border: settings.logoKey ? "1px solid #e2e8f0" : undefined,
                    }}
                  >
                    {settings.logoKey ? (
                      <img
                        src={getMediaUrl(settings.logoKey)!}
                        alt="Logo"
                        className="size-full object-contain p-1"
                      />
                    ) : settings.name ? (
                      settings.name.charAt(0).toUpperCase()
                    ) : (
                      "D"
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {settings.name || "Klinik Adı"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {settings.slogan || "Gülüşünüz Estetikle Buluşuyor"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {settings.phone || "+90 212 000 00 00"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                    style={{
                      backgroundColor: currentPalette.bgSoft,
                      color: currentPalette.primaryHex,
                    }}
                  >
                    {settings.locale === "en" ? "TREATMENT PLAN" : "TEDAVİ PLANI"}
                  </span>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Tarih: {new Date().toLocaleDateString("tr-TR")}
                  </p>
                  <p className="text-[10px] text-slate-400">No: #TP-2026-001</p>
                </div>
              </div>

              {/* Hasta Karşılama */}
              <div className="mt-4 rounded-lg bg-slate-50/70 p-3 text-[11px] leading-relaxed text-slate-600">
                {settings.welcomeBody ||
                  "Değerli hastamız, size özel hazırlanan tedavi planı ve seans detayları aşağıda sunulmuştur."}
              </div>

              {/* Örnek Tedavi Tablosu */}
              <div className="mt-5 overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-left text-[11px]">
                  <thead
                    style={{
                      backgroundColor: currentPalette.bgSoft,
                      color: currentPalette.primaryHex,
                    }}
                    className="font-bold border-b border-slate-100"
                  >
                    <tr>
                      <th className="px-3 py-2">
                        {settings.locale === "en" ? "Procedure" : "İşlem / Tedavi"}
                      </th>
                      <th className="px-3 py-2 text-center">
                        {settings.locale === "en" ? "Session" : "Seans"}
                      </th>
                      <th className="px-3 py-2 text-right">
                        {settings.locale === "en" ? "Amount" : "Tutar"} ({settings.currency})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        Titanyum İmplant Tedavisi (SLA)
                      </td>
                      <td className="px-3 py-2 text-center text-slate-500">1. Seans</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">
                        {currencySymbol} 18.000
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        Zirkonyum Kuron Kaplama (CAD/CAM)
                      </td>
                      <td className="px-3 py-2 text-center text-slate-500">2. Seans</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">
                        {currencySymbol} 12.500
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        Panoramik Röntgen ve 3D Analiz
                      </td>
                      <td className="px-3 py-2 text-center text-slate-500">Dahil</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">
                        {currencySymbol} 0
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Toplam Tutar Alanı */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-500">
                  {settings.locale === "en" ? "Grand Total:" : "Genel Toplam:"}
                </span>
                <span
                  className="text-base font-extrabold tracking-tight"
                  style={{ color: currentPalette.primaryHex }}
                >
                  {currencySymbol} 30.500
                </span>
              </div>

              {/* Alt İmza & Hekim Alanı */}
              <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">
                    {settings.doctor.name || "Dr. Dt. Sorumlu Hekim"}
                  </p>
                  <p className="text-slate-400">
                    {settings.signerTitle || settings.doctor.title || "Klinik Direktörü"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="h-6 w-20 border-b border-dashed border-slate-300" />
                  <span className="text-[9px] text-slate-400">Kaşe & İmza</span>
                </div>
              </div>

              {/* Alt Filigran */}
              <div className="mt-4 text-center text-[9px] text-slate-300">
                Treatment Plus Clinical Systems • 24 Sayfalık Kurumsal Wise PDF
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SEKME: TEDAVİ İŞLEMLERİ & FİYAT LİSTESİ */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          {/* Bildirim / Toast Banner */}
          {pricingStatus && (
            <div
              className={`flex items-center justify-between gap-2 rounded-xl p-4 text-xs font-semibold shadow-xs transition-all ${
                pricingStatus.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {pricingStatus.type === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-rose-600" />
                )}
                <span>{pricingStatus.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setPricingStatus(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-black/5 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {/* 1. KART: YENİ İŞLEM VE FİYAT TANIMLAMA */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="size-4 text-slate-900" />
                    Yeni Tedavi İşlemi & Fiyat Tanımla
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Buraya eklediğiniz tüm işlemler tedavi planı oluştururken işlem seçme listesinde yer alacak ve seçildiğinde belirlediğiniz fiyat otomatik gelecektir.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                  <span>Aktif Para Birimi:</span>
                  <span className="font-bold text-slate-900">{settings.currency} ({currencySymbol})</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddTreatment} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
              {/* İşlem Adı */}
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                  Tedavi / İşlem Adı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Zirkonyum Kaplama, Diş Beyazlatma, Gece Plağı..."
                  value={newTreatName}
                  onChange={(e) => setNewTreatName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-hidden transition"
                />
              </div>

              {/* İşlem Kodu (Opsiyonel) */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                  İşlem Kodu <span className="text-slate-400 font-normal">(Opsiyonel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Örn: TR06 (Boşsa oto)"
                  value={newTreatCode}
                  onChange={(e) => setNewTreatCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-hidden transition uppercase"
                />
              </div>

              {/* Standart Birim Fiyat */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                  Birim Fiyat ({currencySymbol})
                </label>
                <div className="relative">
                  <PriceInput
                    value={newTreatPrice}
                    onChange={(val) => setNewTreatPrice(val)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white px-3 py-2.5 pr-8 text-right text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-hidden transition"
                  />
                  <span className="pointer-events-none absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                    {currencySymbol}
                  </span>
                </div>
              </div>

              {/* Ekle Butonu */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isAddingTreatment || !newTreatName.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isAddingTreatment ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  <span>İşlemi Ekle</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. KART: MEVCUT TEDAVİLER VE FİYAT LİSTESİ */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="size-4 text-slate-900" />
                  Kayıtlı Tedavi İşlemleri ve Standart Fiyatlar
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Toplam <span className="font-semibold text-slate-800">{treatmentsList.length}</span> adet tanımlı tedavi işlemi bulunmaktadır. Fiyatları doğrudan satır üzerinden değiştirebilirsiniz.
                </p>
              </div>

              {/* Arama ve Toplu Kaydet Butonu */}
              <div className="flex items-center gap-3">
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="İşlem adı veya kod ile ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-hidden transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                {totalChanges > 0 && (
                  <button
                    type="button"
                    onClick={handleSaveAllChanges}
                    disabled={isSavingPrices}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    {isSavingPrices ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    <span>Değişiklikleri Kaydet ({totalChanges})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Değişiklik Bildirimi Banner */}
            {totalChanges > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 font-medium">
                <span className="flex size-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>
                  {pendingDeleteIds.size > 0 && dirtyPrices.size > 0 ? (
                    <>
                      <strong>{pendingDeleteIds.size}</strong> işlem silinmek üzere işaretlendi ve{" "}
                      <strong>{dirtyPrices.size}</strong> işlemin fiyatı değiştirildi.
                    </>
                  ) : pendingDeleteIds.size > 0 ? (
                    <>
                      <strong>{pendingDeleteIds.size}</strong> işlem silinmek üzere işaretlendi.
                    </>
                  ) : (
                    <>
                      <strong>{dirtyPrices.size}</strong> işlemin fiyatında değişiklik yapıldı.
                    </>
                  )}{" "}
                  Değişiklikleri onaylamak için sağ üstteki <strong>&quot;Değişiklikleri Kaydet&quot;</strong> butonuna tıklayabilirsiniz.
                </span>
              </div>
            )}

            {/* Tedavi Listesi Tablosu */}
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 w-24">Kod</th>
                    <th scope="col" className="px-4 py-3">İşlem / Tedavi Adı</th>
                    <th scope="col" className="px-4 py-3 w-48 text-right">Standart Fiyat ({currencySymbol})</th>
                    <th scope="col" className="px-4 py-3 w-28 text-center">Durum</th>
                    <th scope="col" className="px-4 py-3 w-28 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTreatments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                        {searchQuery ? (
                          <div>
                            <p className="font-medium text-slate-600">Aramanıza uygun işlem bulunamadı.</p>
                            <button
                              type="button"
                              onClick={() => setSearchQuery("")}
                              className="mt-2 text-xs font-semibold text-slate-900 underline"
                            >
                              Aramayı temizle
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-slate-600">Henüz tanımlı tedavi işlemi bulunmuyor.</p>
                            <p className="mt-1 text-[11px] text-slate-400">Yukarıdaki formdan yeni işlemler ekleyebilirsiniz.</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredTreatments.map((t) => {
                      const treatId = String(t.id);
                      const isPendingDelete = pendingDeleteIds.has(treatId);
                      const isPriceDirty = dirtyPrices.has(treatId);
                      const currentAmount = isPriceDirty ? dirtyPrices.get(treatId)! : (priceMap.get(treatId) ?? 0);
                      const isEditingName = editingTreatmentId === treatId;

                      return (
                        <tr
                          key={treatId}
                          className={`transition ${
                            isPendingDelete
                              ? "bg-rose-50/50"
                              : isPriceDirty
                              ? "bg-amber-50/20"
                              : "hover:bg-slate-50/60"
                          }`}
                        >
                          {/* Kod */}
                          <td className="px-4 py-3 font-mono font-semibold text-slate-700">
                            <span
                              className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                                isPendingDelete
                                  ? "bg-rose-100/70 border-rose-200 text-rose-700 line-through"
                                  : "bg-slate-100 border-slate-200 text-slate-700"
                              }`}
                            >
                              {t.code}
                            </span>
                          </td>

                          {/* İsim */}
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {isEditingName ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editingTreatmentName}
                                  onChange={(e) => setEditingTreatmentName(e.target.value)}
                                  className="w-full max-w-sm rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveTreatmentName(treatId);
                                    if (e.key === "Escape") setEditingTreatmentId(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveTreatmentName(treatId)}
                                  disabled={isUpdatingTreatment}
                                  className="rounded-md bg-slate-900 p-1 text-white hover:bg-slate-800"
                                  title="Kaydet"
                                >
                                  <Check className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingTreatmentId(null)}
                                  className="rounded-md bg-slate-100 p-1 text-slate-600 hover:bg-slate-200"
                                  title="İptal"
                                >
                                  <X className="size-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group">
                                <span
                                  className={
                                    isPendingDelete
                                      ? "line-through text-rose-500 font-normal"
                                      : !t.isActive
                                      ? "line-through text-slate-400"
                                      : ""
                                  }
                                >
                                  {t.name}
                                </span>
                                {isPendingDelete && (
                                  <span className="rounded-md bg-rose-100 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                                    Silinecek
                                  </span>
                                )}
                                {!isPendingDelete && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTreatmentId(treatId);
                                      setEditingTreatmentName(t.name);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition rounded p-0.5 text-slate-400 hover:text-slate-800"
                                    title="İşlem Adını Düzenle"
                                  >
                                    <Pencil className="size-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Fiyat Input */}
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center justify-end">
                              <div className="relative">
                                <PriceInput
                                  value={currentAmount}
                                  disabled={isPendingDelete}
                                  onChange={(val) => handlePriceChange(treatId, val)}
                                  placeholder="0"
                                  className={`w-32 rounded-lg border px-2.5 py-1 text-right text-xs font-bold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-hidden transition ${
                                    isPendingDelete
                                      ? "border-rose-200 bg-rose-50/40 text-rose-400 line-through opacity-70"
                                      : isPriceDirty
                                      ? "border-amber-400 bg-amber-50/40 text-amber-950 font-extrabold ring-1 ring-amber-300"
                                      : "border-slate-200 bg-white hover:bg-slate-50/50"
                                  }`}
                                />
                                <span className="pointer-events-none absolute left-2 top-1 text-[11px] font-bold text-slate-400">
                                  {currencySymbol}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Durum Toggle */}
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              disabled={isPendingDelete}
                              onClick={() => handleToggleActive(treatId, t.isActive ?? true)}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition ${
                                isPendingDelete
                                  ? "bg-slate-100 text-slate-400 border border-slate-200 opacity-50 cursor-not-allowed"
                                  : t.isActive ?? true
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  t.isActive ?? true ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />
                              {t.isActive ?? true ? "Aktif" : "Pasif"}
                            </button>
                          </td>

                          {/* İşlemler / Silme */}
                          <td className="px-4 py-3 text-right">
                            {isPendingDelete ? (
                              <button
                                type="button"
                                onClick={() => handleUndoDelete(treatId)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition"
                                title="Silme işlemini geri al"
                              >
                                <Undo2 className="size-3 text-slate-500" />
                                <span>Geri Al</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleMarkDelete(treatId)}
                                className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                title="İşlemi Sil (Kaydetmek için yukarıdaki butona tıklayın)"
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

            {/* Bilgilendirme Notu */}
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-xs text-slate-600">
              <Info className="size-4 shrink-0 text-slate-500 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">
                  Tedavi Planları ile Otomatik Entegrasyon
                </p>
                <p className="mt-0.5 text-slate-500 leading-relaxed">
                  Bu sekmede tanımladığınız tüm işlemler ve belirlediğiniz birim fiyatlar anında senkronize olur. Hekim veya asistan bir hasta için <strong>Tedavi Planı</strong> hazırlarken &quot;Tedavi Ekle&quot; dediğinde açılır listede buradaki işlemler yer alır ve işlem seçildiği anda belirlenen standart fiyat tedavi satırına otomatik yansıtılır. Hekim dilerse plan özelinde fiyatı değiştirebilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}