import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";

import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Treatment Plus",
    template: "%s · Treatment Plus",
  },
  description: "Klinik tedavi planı platformu. Cookie tarayıcıda Next BFF’de kalır.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${sans.variable} ${serif.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
