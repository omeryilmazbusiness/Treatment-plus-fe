import type { ReactNode } from "react";

type Tone = "ok" | "wait" | "off";

const tones: Record<Tone, string> = {
  ok: "bg-[var(--ok-soft)] text-[var(--ok)]",
  wait: "bg-[var(--wait-soft)] text-[var(--wait)]",
  off: "bg-[var(--line)] text-[var(--ink-soft)]",
};

export function Badge({
  children,
  tone = "off",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
