import { LandingPage, landingMetadata } from "@/ui/landing";

export const metadata = landingMetadata("tr");

export default function HomePage() {
  return <LandingPage locale="tr" />;
}
