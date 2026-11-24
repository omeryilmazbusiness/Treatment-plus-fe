import type { ClinicSettings } from "./clinic";

/**
 * İlk kurulum sihirbazı — saf kurallar (React/Next yok).
 *
 * Adımlar: klinik kimliği → hekim → tercihler → fiyat listesi.
 * `clinic` ve `doctor` zorunlu; `prefs` ve `prices` isteğe bağlıdır ama
 * fiyat listesi (tedavi kataloğu) olmadan teklif hazırlanamaz.
 */
export const SETUP_STEPS = ["clinic", "doctor", "prefs", "prices"] as const;
export type SetupStepKey = (typeof SETUP_STEPS)[number];
export type SetupStepStatus = "pending" | "done";

export const REQUIRED_SETUP_STEPS: readonly SetupStepKey[] = ["clinic", "doctor"];

export type SetupStep = {
  key: SetupStepKey;
  status: SetupStepStatus;
  required: boolean;
};

export type SetupOverview = {
  steps: SetupStep[];
  totalSteps: number;
  doneCount: number;
  /** Zorunlu adımlar ve fiyat listesi tamam. */
  completed: boolean;
};

/** Kayıt formunun bıraktığı yer tutucu değerler "doldurulmuş" sayılmaz. */
const PLACEHOLDER_ADDRESSES = new Set(["istanbul, türkiye", "i̇stanbul, türkiye"]);

export function isPlaceholderPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return true;
  return /0{6,}$/.test(digits);
}

export function isPlaceholderAddress(address: string): boolean {
  const normalized = address.trim().toLocaleLowerCase("tr");
  return normalized.length < 6 || PLACEHOLDER_ADDRESSES.has(normalized);
}

export type ClinicStepDraft = Pick<ClinicSettings, "name" | "phone" | "email" | "address">;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export function validateClinicStep(
  draft: ClinicStepDraft
): FieldErrors<keyof ClinicStepDraft> {
  const errors: FieldErrors<keyof ClinicStepDraft> = {};
  if (draft.name.trim().length < 2) errors.name = "Klinik adı en az 2 karakter olmalı.";
  if (isPlaceholderPhone(draft.phone)) errors.phone = "Geçerli bir telefon numarası girin.";
  if (isPlaceholderAddress(draft.address)) errors.address = "Klinik adresini girin.";
  const email = draft.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Geçerli bir e-posta girin.";
  }
  return errors;
}

export type DoctorStepDraft = { name: string; title: string };

export function validateDoctorStep(
  draft: DoctorStepDraft
): FieldErrors<keyof DoctorStepDraft> {
  const errors: FieldErrors<keyof DoctorStepDraft> = {};
  if (draft.name.trim().length < 2) errors.name = "Hekim adını girin.";
  if (draft.title.trim().length < 2) errors.title = "Unvanı girin.";
  return errors;
}

export function clinicStepComplete(settings: ClinicSettings): boolean {
  return Object.keys(validateClinicStep(settings)).length === 0;
}

export function doctorStepComplete(settings: ClinicSettings): boolean {
  return (
    Object.keys(
      validateDoctorStep({ name: settings.doctor.name, title: settings.doctor.title })
    ).length === 0
  );
}

/**
 * /app açılışında sihirbaza yönlendirme kararı. Kasıtlı olarak dar:
 * klinik kimliği eksikse ya da hiç tedavi kataloğu yoksa kurulum gerekir.
 */
export function needsSetup(settings: ClinicSettings, treatmentCount: number): boolean {
  return !clinicStepComplete(settings) || treatmentCount === 0;
}

export function buildSetupOverview(
  settings: ClinicSettings,
  opts: { treatmentCount: number; prefsConfirmed: boolean }
): SetupOverview {
  const status: Record<SetupStepKey, SetupStepStatus> = {
    clinic: clinicStepComplete(settings) ? "done" : "pending",
    doctor: doctorStepComplete(settings) ? "done" : "pending",
    prefs: opts.prefsConfirmed ? "done" : "pending",
    prices: opts.treatmentCount > 0 ? "done" : "pending",
  };
  const steps: SetupStep[] = SETUP_STEPS.map((key) => ({
    key,
    status: status[key],
    required: REQUIRED_SETUP_STEPS.includes(key),
  }));
  const doneCount = steps.filter((s) => s.status === "done").length;
  const completed =
    REQUIRED_SETUP_STEPS.every((k) => status[k] === "done") && status.prices === "done";
  return { steps, totalSteps: steps.length, doneCount, completed };
}

export function statusOf(o: SetupOverview, key: SetupStepKey): SetupStepStatus {
  return o.steps.find((s) => s.key === key)?.status ?? "pending";
}

/** İlk bekleyen adım; hepsi tamamsa null (özet ekranı). */
export function initialStep(o: SetupOverview): SetupStepKey | null {
  for (const s of o.steps) if (s.status === "pending") return s.key;
  return null;
}

export function neighborStep(
  o: SetupOverview,
  step: SetupStepKey,
  dir: -1 | 1
): SetupStepKey | null {
  const i = SETUP_STEPS.indexOf(step);
  if (i < 0) return null;
  return SETUP_STEPS[i + dir] ?? null;
}

/** Zorunlu bir adım bitmeden sonraki adımlar kilitli kalır. */
export function isStepLocked(o: SetupOverview, key: SetupStepKey): boolean {
  const i = SETUP_STEPS.indexOf(key);
  for (let j = 0; j < i; j++) {
    const prev = SETUP_STEPS[j];
    if (prev && REQUIRED_SETUP_STEPS.includes(prev) && statusOf(o, prev) === "pending") {
      return true;
    }
  }
  return false;
}
