import { LandingPage, landingMetadata } from "@/ui/landing";

export const metadata = landingMetadata("ru");

export default function LandingRuPage() {
  return <LandingPage locale="ru" />;
}
