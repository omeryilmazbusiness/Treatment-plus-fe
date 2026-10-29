import { Suspense } from "react";
import { AuthSliderCard } from "@/ui/auth/auth-slider-card";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthSliderCard initialMode="login" />
    </Suspense>
  );
}
