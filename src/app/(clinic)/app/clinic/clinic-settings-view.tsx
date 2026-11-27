"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Coins,
  Download,
  FileCheck2,
  FileText,
  Globe,
  ImageIcon,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
  UserCheck,
  X,
} from "lucide-react";

import {
  A4Document,
  exportPlanElementToPdf,
  SAMPLE_TREATMENT_ITEMS,
  SAMPLE_TREATMENT_ITEMS_EN,
  TEMPLATE_META,
  normalizeTemplateId,
  type TemplateId,
  type PdfPlanData,
} from "@/ui/pdf-templates";

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
  userEmail,
  workspaceId: _workspaceId,
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
  const [settings, setSettings] = useState<ClinicSettings>(() => ({
    ...initialSettings,
    templateId: normalizeTemplateId(initialSettings.templateId),
    showMotifs: initialSettings.showMotifs !== false,
  }));
  const [savedSettings, setSavedSettings] = useState<ClinicSettings>(() => ({
    ...initialSettings,
    templateId: normalizeTemplateId(initialSettings.templateId),
    showMotifs: initialSettings.showMotifs !== false,
  }));
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);
  const [pdfTextTab, setPdfTextTab] = useState<"welcome" | "legal">("welcome");
  const [pdfFormat, setPdfFormat] = useState<"booklet" | "summary">("booklet");
  const [pdfPreviewPage, setPdfPreviewPage] = useState<number>(1);
  const [pdfZoom, setPdfZoom] = useState<number>(62);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const printAllRef = useRef<HTMLDivElement>(null);

  const PAGE_TITLES = [
    "1. Kapak",
    "2. Sıcak Bir Karşılama",
    "3. Hasta Koordinatörü & VIP Destek",
    "4. Kliniğimiz Hakkında",
    "5. Klinik Rakamları & Kapasite",
    "6. Baş Cerrah & Hekim Profili",
    "7. Hekim Fotoğrafı & Uzmanlık",
    "8. Mevcut Durum & Diş Haritası",
    "9. Teşhis & Detaylı İnceleme",
    "10. 1. Seans: Cerrahi & İmplant",
    "11. All-on-4 Biyomekanik Konsept",
    "12. 2. Seans: Kalıcı Zirkonyum Köprü",
    "13. Kalıcı Köprü Uygulaması & Takip",
    "14. Tedavi Planınızı 3D İzleyin",
    "15. 3D Cerrahi Simülasyon Oynatıcı",
    "16. Neden Zirkonyum Köprü?",
    "17. Sonuç: Kusursuz Gülüş Dönüşümü",
    "18. Kendi Bünyemizdeki Laboratuvar",
    "19. Laboratuvar Standartlarımız",
    "20. Uluslararası Akreditasyon & Ödüller",
    "21. Avrupa Sağlık Ödülleri",
    "22. Konaklamanız: 5 Yıldızlı Otel",
    "23. 5 Yıldızlı Rezidans & VIP Transfer",
    "24. İletişim, Kroki & Randevu",
  ];

  const livePdfData = useMemo<PdfPlanData>(() => {
    const isEn = settings.locale === "en";
    const items = isEn ? SAMPLE_TREATMENT_ITEMS_EN : SAMPLE_TREATMENT_ITEMS;
    const grandTotal = items.reduce((sum, item) => sum + item.amount, 0);

    return {
      templateId: (settings.templateId as TemplateId) || "klinik-minimal",
      palette: settings.palette,
      paletteKey: settings.palette,
      clinicName: settings.name || (isEn ? "Modern Dental Clinic" : "Modern Diş Kliniği"),
      slogan: settings.slogan || (isEn ? "Excellence in Dental Care" : "Gülüşünüz Bizim Tutkumuz"),
      phone: settings.phone || "+90 212 555 0100",
      email: settings.email || userEmail || "info@klinik.com",
      website: settings.website || "www.treatment-plus.com",
      address: settings.address || (isEn ? "Nisantasi, Istanbul" : "Nişantaşı, İstanbul"),
      logoUrl: getMediaUrl(settings.logoKey) || undefined,
      doctorName: settings.doctor?.name || "Dr. Dt. Selin Arslan",
      doctorTitle:
        settings.signerTitle ||
        settings.doctor?.title ||
        (isEn ? "Chief Oral Surgeon" : "Klinik Direktörü"),
      doctorBio: settings.doctor?.bio,
      doctorPhotoUrl: getMediaUrl(settings.doctor?.photoKey),
      doctorStats: settings.doctor?.stats,
      aboutText: settings.aboutText,
      highlights: settings.highlights,
      labStats: settings.lab?.stats,
      hotelDetails: settings.hotel
        ? {
            name: settings.hotel.name,
            text: settings.hotel.text,
            imageKey: settings.hotel.imageKey,
          }
        : undefined,
      patientName: isEn ? "John Doe" : "Ali Yılmaz",
      patientId: "#P-2026-089",
      planNo: "TP-2026-0842",
      dateStr: new Date().toLocaleDateString(isEn ? "en-US" : "tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      locale: settings.locale,
      currency: settings.currency,
      welcomeText: settings.welcomeBody || "",
      welcomeBody: settings.welcomeBody || "",
      kvkkText: settings.legal || "",
      legalText: settings.legal || "",
      showMotifs: settings.showMotifs !== false,
      format: pdfFormat,
      activePage: pdfFormat === "booklet" ? pdfPreviewPage : undefined,
      items,
      grandTotal,
    };
  }, [settings, pdfFormat, pdfPreviewPage, userEmail]);

  const handleExportSamplePdf = async () => {
    if (!printAllRef.current) return;
    try {
      setIsExportingPdf(true);
      await exportPlanElementToPdf(
        printAllRef.current,
        `${settings.name || "Klinik"}-Tedavi-Plani-Ornek.pdf`
      );
    } catch (err) {
      console.error("PDF indirme hatası:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

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
                {/* Dil, Para Birimi, Palet */}
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
                </div>

                {/* 6 Şablon Seçici & Dekoratif Yan Motifler */}
                <div className={softCard}>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className={`${labelCls} inline-flex items-center gap-1.5`}>
                      <Layers className="size-3.5" /> Şablon Tasarımı (6 Tema)
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {TEMPLATE_META.find((t) => t.id === (settings.templateId || "klinik-minimal"))?.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {TEMPLATE_META.map((tmpl) => {
                      const isSelected = (settings.templateId || "klinik-minimal") === tmpl.id;

                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => handleFieldChange("templateId", tmpl.id as TemplateId)}
                          className={`group relative flex flex-col justify-between rounded-2xl border p-3 text-left transition cursor-pointer ${
                            isSelected
                              ? "border-[#0b1f4d] bg-white shadow-md ring-2 ring-[#0b1f4d]/20"
                              : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          {/* Üst Kısım: Mini Wireframe & Rozet */}
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border overflow-hidden relative shadow-2xs transition-colors"
                              style={{
                                backgroundColor: isSelected ? currentPalette.bgSoft : "#f8fafc",
                                borderColor: isSelected ? currentPalette.primaryHex : "#e2e8f0",
                              }}
                            >
                              {/* Şablona Özel Mini Tel Çerçeve Çizimi */}
                              <div className="relative size-full flex flex-col overflow-hidden">
                                {/* MODERN (Altıgen & Altın Çizgi) */}
                                {tmpl.id === "modern-geometric" && (
                                  <div className="size-full flex flex-col bg-[#F8FAFC] relative overflow-hidden">
                                    <div className="h-3 w-full bg-[#1E293B] border-b border-[#E5A93C]" />
                                    <div className="absolute right-1 top-3.5 size-4 rotate-45 rounded-2xs bg-[#1E293B] border border-[#E5A93C]" />
                                    <div className="flex-1 p-1.5 space-y-1">
                                      <div className="h-1 w-2/3 bg-[#1E293B] rounded-2xs" />
                                      <div className="h-1 w-1/2 bg-[#E5A93C]/70 rounded-2xs" />
                                    </div>
                                    <div className="h-1.5 w-full bg-[#1E293B]" />
                                  </div>
                                )}
                                {/* NATURE (Botanik Yaprak, Pembe Çiçek & Çift Çerçeve) */}
                                {tmpl.id === "botanical-serenity" && (
                                  <div className="size-full bg-[#FAFBF7] p-1 flex flex-col justify-between border border-[#588157]/60 relative">
                                    <div className="flex justify-between items-center">
                                      <div className="size-2 rounded-full bg-[#588157]" />
                                      <div className="size-2 rounded-full bg-[#F4ACB7]" />
                                    </div>
                                    <div className="space-y-0.5 px-0.5">
                                      <div className="h-1 w-2/3 bg-[#3A5A40]/70 rounded-2xs mx-auto" />
                                      <div className="h-1 w-1/2 bg-[#B5945B]/50 rounded-2xs mx-auto" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <div className="size-1.5 rounded-full bg-[#F4ACB7]" />
                                      <div className="size-2 rounded-full bg-[#3A5A40]" />
                                    </div>
                                  </div>
                                )}
                                {/* SOFT (Pastel Dalgalar & Bulut) */}
                                {tmpl.id === "liquid-art" && (
                                  <div className="size-full bg-[#FFFDF9] flex flex-col justify-between relative overflow-hidden">
                                    <div className="h-3 w-full bg-gradient-to-r from-[#FBCFE8] via-[#DDD6FE] to-[#BAE6FD]" />
                                    <div className="flex-1 p-1 flex flex-col justify-center space-y-0.5">
                                      <div className="h-1 w-3/4 bg-[#F9A8D4]/70 rounded-2xs" />
                                      <div className="h-1 w-1/2 bg-[#7DD3FC]/80 rounded-2xs" />
                                    </div>
                                    <div className="h-2.5 w-full bg-gradient-to-r from-[#BAE6FD] via-[#FEF08A] to-[#FBCFE8]" />
                                  </div>
                                )}
                                {/* PREMİUM (Siyah & Altın V-Kalkan + Krem İç) */}
                                {tmpl.id === "noir-gold" && (
                                  <div className="size-full bg-[#F5EFE0] border border-[#D4AF37] flex flex-col justify-between relative overflow-hidden">
                                    <div className="h-4 w-full bg-[#141414] border-b-2 border-[#D4AF37] flex items-center justify-center [clip-path:polygon(0_0,100%_0,100%_70%,50%_100%,0_70%)]">
                                      <div className="h-0.5 w-5 bg-[#D4AF37]" />
                                    </div>
                                    <div className="flex-1 px-1.5 py-0.5 space-y-0.5 flex flex-col justify-center">
                                      <div className="h-1 w-3/4 bg-[#18181B]/80 rounded-2xs" />
                                      <div className="h-1 w-1/2 bg-[#D4AF37] rounded-2xs" />
                                    </div>
                                    <div className="h-1.5 w-full bg-[#141414] border-t border-[#D4AF37]" />
                                  </div>
                                )}
                                {/* TEKNO (Siber Lacivert & Neon Cyan Mikroçip) */}
                                {tmpl.id === "royal-gold" && (
                                  <div className="size-full bg-[#051020] p-1 border border-[#00E5FF]/50 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="w-full h-0.5 bg-[#00E5FF]/40 absolute top-1.5" />
                                    <div className="size-5 rounded-xs border border-[#00E5FF] bg-[#081E3A] flex items-center justify-center shadow-[0_0_6px_#00E5FF]">
                                      <div className="size-2 bg-[#00E5FF]/60 rounded-2xs" />
                                    </div>
                                    <div className="w-full h-0.5 bg-[#00E5FF]/40 absolute bottom-1.5" />
                                  </div>
                                )}
                                {/* KLASİK (Orijinal Wise Dental) */}
                                {tmpl.id === "klinik-minimal" && (
                                  <div className="relative size-full flex flex-col bg-white">
                                    <div className="h-4 w-full flex flex-col items-center justify-center bg-[#0b2938] [clip-path:polygon(0_0,100%_0,100%_65%,0_100%)]">
                                      <div className="h-0.5 w-6 bg-[#E5B94E] rounded-2xs" />
                                    </div>
                                    <div className="flex-1 p-1 space-y-0.5 flex flex-col justify-around">
                                      <div className="h-1 w-3/4 bg-slate-300 rounded-2xs" />
                                      <div className="h-1 w-1/2 bg-slate-200 rounded-2xs" />
                                    </div>
                                    <div className="h-2 w-full bg-[#0b2938] [clip-path:polygon(0_70%,100%_0,100%_100%,0_100%)]" />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase ${
                                  isSelected
                                    ? "bg-[#0b1f4d] text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {tmpl.badge}
                              </span>
                              {isSelected && (
                                <div className="flex size-4 items-center justify-center rounded-full bg-[#0b1f4d] text-white">
                                  <Check className="size-2.5" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Alt Kısım: Başlık & Açıklama */}
                          <div className="mt-2.5">
                            <h4
                              className={`text-xs ${
                                isSelected ? "font-bold text-[#0b1f4d]" : "font-semibold text-slate-800"
                              }`}
                            >
                              {tmpl.name}
                            </h4>
                            <p className="mt-0.5 text-[10px] text-slate-500 leading-tight">
                              {tmpl.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dekoratif Yan Motifler Toggle */}
                  <div className="mt-3.5 rounded-2xl border border-slate-200/90 bg-white p-3.5 flex items-center justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                        <Sparkles className="size-3.5" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-800">
                          Dekoratif Yan Motifleri Göster
                        </span>
                        <p className="text-[10.5px] text-slate-500 leading-tight">
                          Çiçek, yaprak, balon veya geometrik filigran gibi tematik SVG motiflerini gösterir.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFieldChange("showMotifs", !(settings.showMotifs !== false))}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        settings.showMotifs !== false ? "bg-[#0b1f4d]" : "bg-slate-300"
                      }`}
                      aria-pressed={settings.showMotifs !== false}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          settings.showMotifs !== false ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Karşılama ve Yasal Metinler */}
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

              {/* Canlı Önizleme (Sağ Kolon) */}
              <div className="space-y-4 md:col-span-7 md:sticky md:top-2">
                {/* Önizleme Kontrol Üst Barı */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] bg-white p-4 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Canlı Önizleme (A4)
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        210 × 297 mm • 24 Sayfalık Kapsamlı Kitapçık
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Format Switcher */}
                    <div className="flex items-center rounded-xl bg-slate-100 p-0.5 text-[10px] font-semibold text-slate-600">
                      <button
                        type="button"
                        onClick={() => setPdfFormat("booklet")}
                        className={`tp-tab rounded-lg px-2.5 py-1.5 transition ${
                          pdfFormat === "booklet"
                            ? "bg-[#0b1f4d] text-white font-bold"
                            : "hover:text-[#0b1f4d]"
                        }`}
                      >
                        24 Sayfa Kitapçık
                      </button>
                      <button
                        type="button"
                        onClick={() => setPdfFormat("summary")}
                        className={`tp-tab rounded-lg px-2.5 py-1.5 transition ${
                          pdfFormat === "summary"
                            ? "bg-[#0b1f4d] text-white font-bold"
                            : "hover:text-[#0b1f4d]"
                        }`}
                      >
                        1 Sayfa Özet
                      </button>
                    </div>

                    {/* Zoom Switcher */}
                    <div className="hidden sm:flex items-center rounded-xl bg-slate-100 p-0.5 text-[10px] font-semibold text-slate-600">
                      {[50, 62, 75, 100].map((sc) => (
                        <button
                          key={sc}
                          type="button"
                          onClick={() => setPdfZoom(sc)}
                          className={`tp-tab rounded-lg px-2 py-1 transition ${
                            pdfZoom === sc
                              ? "bg-white text-slate-900 font-bold shadow-2xs"
                              : "hover:text-slate-900"
                          }`}
                        >
                          %{sc}
                        </button>
                      ))}
                    </div>

                    {/* Download Sample PDF Button */}
                    <button
                      type="button"
                      onClick={handleExportSamplePdf}
                      disabled={isExportingPdf}
                      className="tp-btn tp-btn-primary inline-flex items-center gap-1.5 rounded-xl bg-[#0b1f4d] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-[#0b1f4d]/25 hover:bg-[#08173d] transition active:scale-95 disabled:opacity-60"
                      title="Mevcut tasarım ve verilerle 24 sayfalık vektörel PDF çıktısını test edin"
                    >
                      {isExportingPdf ? (
                        <Loader2 className="size-3.5 animate-spin text-white" />
                      ) : (
                        <Download className="size-3.5 text-white" />
                      )}
                      <span>Örnek PDF İndir</span>
                    </button>
                  </div>
                </div>

                {/* Kitapçık Modunda Sayfa Gezinti Çubuğu */}
                {pdfFormat === "booklet" && (
                  <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs shadow-xs">
                    <button
                      type="button"
                      disabled={pdfPreviewPage <= 1}
                      onClick={() => setPdfPreviewPage((p) => Math.max(1, p - 1))}
                      className="tp-btn cursor-pointer rounded-xl bg-slate-100 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      &larr; Önceki
                    </button>

                    <div className="flex items-center gap-2">
                      <select
                        value={pdfPreviewPage}
                        onChange={(e) => setPdfPreviewPage(Number(e.target.value))}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden"
                      >
                        {PAGE_TITLES.map((t, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            {t} ({idx + 1} / 24)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={pdfPreviewPage >= 24}
                      onClick={() => setPdfPreviewPage((p) => Math.min(24, p + 1))}
                      className="tp-btn cursor-pointer rounded-xl bg-slate-100 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Sonraki &rarr;
                    </button>
                  </div>
                )}

                {/* A4 Çalışma Masası (Viewport Container) */}
                <div className="relative rounded-[1.75rem] border border-slate-200/90 bg-slate-100/90 p-4 sm:p-6 overflow-hidden flex flex-col items-center justify-start shadow-inner">
                  <div
                    className="transition-all duration-200 ease-out flex justify-center w-full"
                    style={{
                      height: `calc(297mm * ${pdfZoom / 100} + 16px)`,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        transform: `scale(${pdfZoom / 100})`,
                        transformOrigin: "top center",
                        width: "210mm",
                        minHeight: "297mm",
                      }}
                      className="shadow-2xl ring-1 ring-black/5"
                    >
                      <div
                        ref={previewRef}
                        className="bg-white"
                      >
                        <A4Document data={livePdfData} />
                      </div>
                    </div>
                  </div>

                  {/* Gizli Tüm Sayfalar (Yazdırma & İndirme İçin) */}
                  <div style={{ display: "none" }}>
                    <div ref={printAllRef}>
                      <A4Document
                        data={{ ...livePdfData, activePage: undefined, format: "booklet" }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between w-full text-[10px] text-slate-400 font-medium px-2">
                    <span>Vektörel Keskinlik • Türkçe UTF-8 Karakter & Para Birimi Destekli</span>
                    <span className="font-mono">1:1 Canlı Eşleşme</span>
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
