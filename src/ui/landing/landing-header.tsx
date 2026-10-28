import React from "react";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

import { Mark } from "@/ui/mark";

export interface LandingHeaderProps {
  readonly brandName?: string;
  readonly registerHref?: string;
  readonly loginHref?: string;
}

export function LandingHeader({
  brandName = "Treatment+",
  registerHref = "/register",
  loginHref = "/login",
}: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Marka / Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 focus:outline-hidden"
        >
          <Mark className="h-10 w-10 transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              {brandName}
            </span>
            <span className="text-[10px] font-bold tracking-[0.18em] text-blue-600 uppercase">
              3D Dental SaaS
            </span>
          </div>
        </Link>

        {/* Sağ Üst Giriş Yap & Kayıt Ol Butonları */}
        <div className="flex items-center gap-3">
          <Link
            href={loginHref}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
          >
            <LogIn className="h-4 w-4 text-slate-500" />
            <span>Giriş Yap</span>
          </Link>
          <Link
            href={registerHref}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-500 hover:shadow-blue-600/25"
          >
            <UserPlus className="h-4 w-4 text-cyan-400" />
            <span>Kayıt Ol</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
