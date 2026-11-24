"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

/**
 * Soft, heavy page enter for every /app screen change.
 * Re-keys on pathname so the settle animation always replays.
 */
export function MotionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="tp-page-enter min-h-0 flex-1">
      {children}
    </div>
  );
}
