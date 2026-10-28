import React from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Mark } from "@/ui/mark";
import {
  DEFAULT_CONTACT_INFO,
  type ContactInfo,
} from "./landing-data";

export interface LandingFooterProps {
  readonly brandName?: string;
  readonly contact?: ContactInfo;
}

export function LandingFooter({
  brandName = "Treatment+",
  contact = DEFAULT_CONTACT_INFO,
}: LandingFooterProps) {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50 text-slate-600">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Marka ve Açıklama */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Mark className="h-9 w-9" />
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                {brandName}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              Diş klinikleri ve poliklinikler için geliştirilen 3 boyutlu
              interaktif tedavi planlama, prosedür simülasyonu ve hasta onay
              platformu.
            </p>
          </div>

          {/* Hızlı Bağlantılar */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/ornekler/classic"
                  className="transition-colors hover:text-blue-600"
                >
                  Classic Paket Örnekleri
                </Link>
              </li>
              <li>
                <Link
                  href="/ornekler/ultimate"
                  className="transition-colors hover:text-blue-600"
                >
                  Ultimate Paket Örnekleri
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="transition-colors hover:text-blue-600"
                >
                  Kayıt Ol
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-blue-600"
                >
                  Giriş Yap
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
              İletişim
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-blue-600" />
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-blue-600"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-blue-600" />
                <span>{contact.phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>{contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>© 2026 {brandName} B2B Dental SaaS. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <Link href="/healthz" className="hover:text-slate-600">
              Sistem Durumu
            </Link>
            <Link href="/register" className="hover:text-slate-600">
              Yeni Klinik Kaydı
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
