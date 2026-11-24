import React from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Mark } from "@/ui/mark";
import { DEFAULT_CONTACT_INFO, type ContactInfo } from "./landing-data";
import type { LandingDictionary } from "./i18n";

export interface LandingFooterProps {
  readonly copy: LandingDictionary["footer"];
  readonly brandName?: string;
  readonly contact?: Omit<ContactInfo, "address">;
}

const LINK =
  "text-slate-400 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300";

export function LandingFooter({
  copy,
  brandName = "Treatment+",
  contact = DEFAULT_CONTACT_INFO,
}: LandingFooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#070a14] text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Mark light className="h-9 w-9" />
              <span dir="ltr" className="text-lg font-extrabold tracking-tight text-white">
                {brandName}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              {copy.description}
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold tracking-[0.16em] text-white uppercase">
              {copy.platformTitle}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/ornekler/classic" className={LINK}>
                  {copy.classicLink}
                </Link>
              </li>
              <li>
                <Link href="/ornekler/ultimate" className={LINK}>
                  {copy.ultimateLink}
                </Link>
              </li>
              <li>
                <Link href="/register" className={LINK}>
                  {copy.register}
                </Link>
              </li>
              <li>
                <Link href="/login" className={LINK}>
                  {copy.login}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold tracking-[0.16em] text-white uppercase">
              {copy.contactTitle}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-sky-300" />
                <a href={`mailto:${contact.email}`} dir="ltr" className={LINK}>
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-sky-300" />
                <span dir="ltr">{contact.phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                <span>{copy.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-xs text-slate-500 sm:flex-row">
          <p>
            © 2026 {brandName} B2B Dental SaaS. {copy.rights}
          </p>
          <div className="flex gap-6">
            <Link href="/healthz" className={LINK}>
              {copy.status}
            </Link>
            <Link href="/register" className={LINK}>
              {copy.newClinic}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
