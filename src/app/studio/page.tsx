import { Metadata } from "next";
import { TreatmentStudio } from "@/ui/treatment-studio";

export const metadata: Metadata = {
  title: "Treatment Studio · 3D Dental Treatment Planner & Documentation",
  description:
    "Dental klinikler için interaktif hasta dokümantasyonu, FDI odontogram, panoramik röntgen inceleme, Three.js & GSAP 3D tedavi simülasyonu ve KVKK uyumlu hasta mikro sitesi.",
};

export default function StudioPage() {
  return <TreatmentStudio backHref="/" />;
}

