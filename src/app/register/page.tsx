import { Suspense } from "react";
import { AuthSliderCard } from "@/ui/auth/auth-slider-card";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthSliderCard initialMode="register" />
    </Suspense>
  );
}
