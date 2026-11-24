import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  IBM_Plex_Sans,
  Inter,
  Noto_Sans_Arabic,
  Source_Serif_4,
} from "next/font/google";

import { loadConfig } from "@/platform/config/env";

import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-sans",
  display: "swap",
});

/** Landing sayfası için; diğer ekranlar IBM Plex Sans kullanmaya devam eder. */
const landing = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-source-serif",
  display: "swap",
});

/** Arapça sayfa için; yalnızca RTL içerik kullanıldığında indirilir. */
const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-arabic",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(loadConfig().app.url),
  title: {
    default: "Treatment Plus",
    template: "%s · Treatment Plus",
  },
  description: "Klinik tedavi planı platformu. Cookie tarayıcıda Next BFF’de kalır.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${sans.variable} ${serif.variable} ${arabic.variable} ${landing.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
