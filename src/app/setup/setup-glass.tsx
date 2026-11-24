"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";

import type { SetupStepKey } from "@/modules/clinic/domain/setup";

/* Duaa kurulum ekranının koyu "sıvı cam" dili — Treatment Plus adımlarına uyarlandı. */

export const STEP_TINTS: Record<SetupStepKey | "done", string> = {
  clinic: "from-sky-400 to-blue-600",
  doctor: "from-teal-400 to-emerald-600",
  prefs: "from-violet-400 to-fuchsia-600",
  prices: "from-amber-400 to-orange-500",
  done: "from-emerald-400 to-green-600",
};

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function AppIcon({
  icon: Icon,
  tint,
  size = "lg",
}: {
  icon: LucideIcon;
  tint: SetupStepKey | "done";
  size?: "sm" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center bg-gradient-to-b text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_24px_-12px_rgba(15,23,42,0.55)]",
        STEP_TINTS[tint],
        size === "lg" ? "h-16 w-16 rounded-[20px]" : "h-9 w-9 rounded-[11px]"
      )}
    >
      <Icon className={size === "lg" ? "h-8 w-8" : "h-[18px] w-[18px]"} strokeWidth={1.75} />
    </span>
  );
}

export function StepHero({
  icon,
  tint,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  tint: SetupStepKey | "done";
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <AppIcon icon={icon} tint={tint} />
      <div className="space-y-1">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-white">{title}</h2>
        <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-white/55">{subtitle}</p>
      </div>
    </div>
  );
}

export function GlassGroup({
  title,
  footer,
  children,
  className,
}: {
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("space-y-1.5", className)}>
      {title ? (
        <h3 className="px-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-white/55">
          {title}
        </h3>
      ) : null}
      <div className="setup-group divide-y divide-white/[0.08] overflow-hidden rounded-[18px]">
        {children}
      </div>
      {footer ? <p className="px-4 text-[11px] leading-relaxed text-white/55">{footer}</p> : null}
    </section>
  );
}

export function GlassField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="px-4">
      <div className="flex min-h-[46px] items-center gap-3">
        <label htmlFor={id} className="w-[104px] shrink-0 text-[13px] font-medium text-white/90">
          {label}
        </label>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="-mt-1 pb-2 ps-[116px] text-[11px] font-medium text-rose-300"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const GlassInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function GlassInput({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      className={cx(
        "h-[46px] w-full bg-transparent text-[14px] text-white outline-none placeholder:text-white/35 disabled:text-white/40",
        invalid && "text-rose-300",
        className
      )}
      {...props}
    />
  );
});

type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "glass" | "plain";
};

export const PillButton = forwardRef<HTMLButtonElement, PillProps>(function PillButton(
  { className, variant = "primary", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[14px] font-semibold tracking-[-0.01em] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f24]",
        variant === "primary" &&
          "bg-white text-zinc-950 shadow-[inset_0_-1px_0_rgba(15,23,42,0.08),0_12px_32px_-14px_rgba(186,230,253,0.55)] hover:bg-white/90",
        variant === "glass" && "setup-pill text-white/90 hover:bg-white/[0.14]",
        variant === "plain" &&
          "h-9 px-3 text-[13px] font-medium text-white/55 hover:translate-y-0 hover:text-white/90",
        className
      )}
      {...props}
    />
  );
});
