import "server-only";

import { cookies } from "next/headers";

import type { ClinicSettings } from "@/modules/clinic/domain/clinic";
import { needsSetup } from "@/modules/clinic/domain/setup";

/** Oturum çerezi: kullanıcı kurulumu bu oturum için erteledi (değer = clinicId). */
export const SETUP_LATER_COOKIE = "tp_setup_later";

/** /app açılışında kurulum sihirbazına yönlendirilmeli mi? */
export async function shouldRunSetup(
  settings: ClinicSettings,
  treatmentCount: number,
  clinicId: string
): Promise<boolean> {
  if (!needsSetup(settings, treatmentCount)) return false;
  const jar = await cookies();
  return jar.get(SETUP_LATER_COOKIE)?.value !== clinicId;
}

export async function clearSetupDeferral(): Promise<void> {
  try {
    const jar = await cookies();
    jar.delete(SETUP_LATER_COOKIE);
  } catch {
    // Render sırasında çerez yazılamaz; sessizce geç.
  }
}
