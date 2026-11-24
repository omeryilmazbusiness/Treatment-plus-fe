import React from "react";
import Image from "next/image";
import { Play } from "lucide-react";

import { Mark } from "@/ui/mark";

/**
 * Landing'deki cihaz çerçeveleri ve plan kapağı.
 * Boyutlar kapsayıcıya göre ölçeklenir (container query birimleri), böylece aynı
 * bileşen hero'da büyük, vitrinde küçük kullanılabilir.
 */

export const MOCK_CLINIC_NAME = "Smile Clinic";

export interface PlanCoverProps {
  readonly title: string;
  readonly patient: string;
  readonly className?: string;
  /** Kapak altındaki başlık yerine oynat düğmesi gösterilir (film sayfası). */
  readonly playable?: boolean;
  /** Geniş (yatay) alanlar için: metin küçülür, diş sağa yaslanır. */
  readonly landscape?: boolean;
}

/** Hastaya özel plan kapağı: gradyan zemin, diş görseli ve büyük başlık. */
export function PlanCover({
  title,
  patient,
  className = "",
  playable = false,
  landscape = false,
}: PlanCoverProps) {
  return (
    <div
      className={`@container relative isolate overflow-hidden bg-gradient-to-br from-[#7c5ce0] via-[#4a6fe3] to-[#2fb4f0] ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute -top-[20%] -right-[25%] h-[85%] w-[85%] rounded-full bg-white/25 blur-3xl"
      />
      <Image
        src="/tooth-hero.png"
        alt=""
        fill
        sizes="(min-width: 1024px) 320px, 220px"
        className={
          landscape
            ? "object-contain object-[78%_50%] p-[3%] drop-shadow-[0_18px_28px_rgba(20,30,90,0.45)]"
            : "object-contain object-[50%_28%] p-[16%] pb-[34%] drop-shadow-[0_18px_28px_rgba(20,30,90,0.45)]"
        }
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#1b1f5c]/85 via-[#1b1f5c]/40 to-transparent"
      />
      {playable ? (
        <span
          aria-hidden="true"
          className={`absolute start-1/2 flex -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full bg-white/90 text-blue-600 shadow-xl rtl:translate-x-1/2 ${
            landscape ? "top-1/2 h-[9cqw] w-[9cqw]" : "top-[34%] h-[22cqw] w-[22cqw]"
          }`}
        >
          <Play
            className={`translate-x-[0.6cqw] fill-current rtl:-translate-x-[0.6cqw] ${
              landscape ? "h-[3.6cqw] w-[3.6cqw]" : "h-[9cqw] w-[9cqw]"
            }`}
          />
        </span>
      ) : null}
      <div
        className={
          landscape
            ? "absolute bottom-0 start-0 w-[55%] p-[5cqw]"
            : "absolute inset-x-0 bottom-0 p-[9cqw]"
        }
      >
        <p
          className={`leading-[0.98] font-extrabold tracking-tight text-white uppercase rtl:leading-[1.25] ${
            landscape ? "text-[4.6cqw]" : "text-[10.5cqw]"
          }`}
        >
          {title}
        </p>
        <span
          className={`block rounded-full bg-white/70 ${
            landscape
              ? "mt-[1.6cqw] h-[0.4cqw] w-[7cqw]"
              : "mt-[3.5cqw] h-[0.7cqw] w-[16cqw]"
          }`}
        />
        <p
          className={`font-medium text-white/80 ${
            landscape ? "mt-[1.4cqw] text-[2.2cqw]" : "mt-[3cqw] text-[4.4cqw]"
          }`}
        >
          {patient}
        </p>
      </div>
    </div>
  );
}

export interface FrameProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

/** `absolute` verilmediyse `relative`; ikisi birden verilince `relative` kazanırdı. */
function positioned(className: string): string {
  return className.includes("absolute") ? "" : "relative";
}

/** Mockup görselleri `public/mockups` altında; ekran alanı saydam, ölçüler piksel cinsinden. */
interface MockupSpec {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly screen: {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
    /** Ekran köşe yarıçapı (piksel); saydam köşelerden beyaz taşmasını önler. */
    readonly radius?: number;
  };
}

const LAPTOP_MOCKUP: MockupSpec = {
  src: "/mockups/laptop.png",
  width: 621,
  height: 360,
  screen: { x: 67, y: 8, w: 487, h: 310 },
};

const PHONE_MOCKUP: MockupSpec = {
  src: "/mockups/phone.png",
  width: 498,
  height: 1024,
  screen: { x: 20, y: 17, w: 458, h: 990, radius: 44 },
};

interface MockupFrameProps extends FrameProps {
  readonly spec: MockupSpec;
  readonly sizes: string;
  readonly shadow: string;
  /** Ekranın üstüne binen ek katman (durum çubuğu, ana ekran çubuğu gibi). */
  readonly overlay?: React.ReactNode;
}

/**
 * Gerçek cihaz görseli + saydam ekrana yerleşen içerik.
 * Köşeleri kasa görseli kapatır; telefonda ek olarak hafif yuvarlatılır.
 */
function MockupFrame({ children, className = "", spec, sizes, shadow, overlay }: MockupFrameProps) {
  const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(3)}%`;
  return (
    <div
      className={`${positioned(className)} ${className}`}
      style={{ aspectRatio: `${spec.width} / ${spec.height}` }}
    >
      <div className={`absolute inset-0 ${shadow}`}>
        <div
          className="@container absolute overflow-hidden bg-white"
          style={{
            left: pct(spec.screen.x, spec.width),
            top: pct(spec.screen.y, spec.height),
            width: pct(spec.screen.w, spec.width),
            height: pct(spec.screen.h, spec.height),
            borderRadius: spec.screen.radius
              ? `${((spec.screen.radius / spec.screen.w) * 100).toFixed(2)}% / ${((spec.screen.radius / spec.screen.h) * 100).toFixed(2)}%`
              : undefined,
          }}
        >
          {children}
          {overlay}
        </div>
        <Image
          src={spec.src}
          alt=""
          fill
          sizes={sizes}
          className="pointer-events-none object-contain select-none"
        />
      </div>
    </div>
  );
}

/** Dizüstü bilgisayar mockup'ı (ekran ≈ 16:10). */
export function LaptopFrame({ children, className = "" }: FrameProps) {
  return (
    <MockupFrame
      spec={LAPTOP_MOCKUP}
      className={className}
      sizes="(min-width: 1024px) 720px, 90vw"
      shadow="[filter:drop-shadow(0_34px_38px_rgba(8,12,40,0.42))]"
    >
      {children}
    </MockupFrame>
  );
}

/** Telefon mockup'ı (iPhone, dinamik ada kasa görselinde). */
export function PhoneFrame({ children, className = "" }: FrameProps) {
  return (
    <MockupFrame
      spec={PHONE_MOCKUP}
      className={className}
      sizes="(min-width: 1024px) 300px, 45vw"
      shadow="[filter:drop-shadow(0_0_1.2px_rgba(255,255,255,0.6))_drop-shadow(0_26px_30px_rgba(8,12,40,0.45))]"
      overlay={
        <span
          aria-hidden="true"
          className="absolute bottom-[1.1%] start-1/2 z-10 h-[0.45%] w-[34%] -translate-x-1/2 rounded-full bg-white mix-blend-difference rtl:translate-x-1/2"
        />
      }
    >
      {children}
    </MockupFrame>
  );
}

/** Basılı/PDF sayfası. */
export function PaperFrame({ children, className = "" }: FrameProps) {
  return (
    <div
      className={`@container ${positioned(className)} aspect-[3/4] overflow-hidden rounded-[2.5%] bg-white shadow-[0_26px_60px_-14px_rgba(0,0,0,0.65)] ring-1 ring-black/5 ${className}`}
    >
      {children}
    </div>
  );
}

export interface ScreenIntroProps {
  readonly label: string;
  readonly title: string;
  readonly subtitle: string;
  readonly button: string;
  readonly clinicName?: string;
}

/** Dizüstü ekranının sağ paneli: marka, etiket, başlık ve düğme. */
export function ScreenIntro({
  label,
  title,
  subtitle,
  button,
  clinicName = MOCK_CLINIC_NAME,
}: ScreenIntroProps) {
  return (
    <div className="@container flex h-full flex-col justify-center gap-[3cqw] bg-white p-[9cqw] text-[#1d1d1f]">
      <div className="flex items-center gap-[2.4cqw]" dir="ltr">
        <Mark className="h-[8cqw] w-[8cqw]" />
        <span className="text-[3.6cqw] font-bold tracking-[0.14em] uppercase">
          {clinicName}
        </span>
      </div>
      <p className="mt-[5cqw] text-[3.4cqw] font-semibold tracking-[0.16em] text-blue-600 uppercase">
        {label}
      </p>
      <p className="text-[10cqw] leading-[1.05] font-extrabold tracking-tight rtl:leading-[1.3]">
        {title}
      </p>
      <p className="text-[3.8cqw] text-slate-500">{subtitle}</p>
      <span className="mt-[3.5cqw] inline-flex w-fit rounded-full bg-[#1d1d1f] px-[5cqw] py-[2.4cqw] text-[3.6cqw] font-semibold text-white">
        {button}
      </span>
    </div>
  );
}
