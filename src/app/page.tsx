import {
  LandingFeatures,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingStatsBanner,
  LandingWorkflow,
} from "@/ui/landing";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-white font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingStatsBanner />
        <LandingWorkflow />
      </main>
      <LandingFooter />
    </div>
  );
}
