"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Check, Languages } from "lucide-react";

import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_META,
  localeHref,
  type Locale,
} from "@/shared/locale";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export interface LanguageSwitcherProps {
  readonly locale: Locale;
  readonly label: string;
  /** "dark": koyu zemin üzerinde açık renkli buton. */
  readonly tone?: "light" | "dark";
}

/** Dil tercihini yalnızca dil kodu olarak, bu origin üzerinde saklar. */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function LanguageSwitcher({
  locale,
  label,
  tone = "light",
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
          tone === "dark"
            ? "text-white/80 hover:bg-white/10 hover:text-white"
            : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-950"
        }`}
      >
        <Languages
          aria-hidden="true"
          className={`h-[18px] w-[18px] ${tone === "dark" ? "text-sky-300" : "text-blue-600"}`}
        />
        <span className="hidden text-xs tracking-wide sm:inline" dir="ltr">
          {LOCALE_META[locale].shortCode}
        </span>
      </button>

      {open ? (
        <ul
          id={menuId}
          aria-label={label}
          className="absolute end-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl bg-white p-1.5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5"
        >
          {LOCALES.map((code) => {
            const active = code === locale;
            const meta = LOCALE_META[code];
            return (
              <li key={code}>
                <Link
                  href={localeHref(code)}
                  hrefLang={code}
                  lang={code}
                  dir={meta.dir}
                  aria-current={active ? "true" : undefined}
                  onClick={() => {
                    rememberLocale(code);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    active
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-950"
                  }`}
                >
                  <span>{meta.nativeName}</span>
                  {active ? (
                    <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
