import { fetchInitialDataAction } from "./actions";
import { ClinicSettingsClient } from "./clinic-settings-client";

export default async function ClinicHomePage() {
  const result = await fetchInitialDataAction();

  if (!result.success || !result.data) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-serif text-2xl font-medium text-ink">
          Veriler Yüklenemedi
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {result.error || "Klinik bilgileri alınırken bir hata oluştu."}
        </p>
      </main>
    );
  }

  return (
    <ClinicSettingsClient
      initialProducts={result.data.products}
      initialSettings={result.data.settings}
      userEmail={result.data.userEmail}
    />
  );
}
