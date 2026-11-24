import { LandingPage, landingMetadata } from "@/ui/landing";

export const metadata = landingMetadata("en");

export default function LandingEnPage() {
  return <LandingPage locale="en" />;
}
