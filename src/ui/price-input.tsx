"use client";

import { useState } from "react";

export interface PriceInputProps {
  value: number; // minor units (kuruş)
  onChange: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  step?: number; // minor units to step by on ArrowUp / ArrowDown, default 100 (1 TL)
  id?: string;
  "aria-label"?: string;
}

/**
 * Formats minor units (kuruş) to a readable TL string for editing.
 * Whole liras (e.g. 150000 kuruş -> 1500 TL) format cleanly without trailing .00
 * Fractional liras format with Turkish comma (e.g. 150050 kuruş -> 1500,50).
 */
export function formatMinorUnitsToDisplay(minorUnits: number): string {
  if (!minorUnits || minorUnits <= 0) return "0";
  if (minorUnits % 100 === 0) {
    return String(minorUnits / 100);
  }
  const liras = Math.floor(minorUnits / 100);
  const cents = (minorUnits % 100).toString().padStart(2, "0");
  return `${liras},${cents}`;
}

/**
 * Parses user input string (accepting both comma and dot) into minor units (kuruş).
 * Examples:
 *   "1500" -> 150000
 *   "1500,50" -> 150050
 *   "1500.50" -> 150050
 *   "1.500,00" -> 150000
 *   "" or "0" -> 0
 */
export function parseDisplayToMinorUnits(input: string): number {
  if (!input) return 0;
  let str = input.trim();
  if (!str) return 0;

  // Handle mixed comma and dot notation (e.g. 1.500,50 vs 1,500.50)
  if (str.includes(".") && str.includes(",")) {
    const lastDot = str.lastIndexOf(".");
    const lastComma = str.lastIndexOf(",");
    if (lastComma > lastDot) {
      // 1.500,50 -> dot is thousands, comma is decimal
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      // 1,500.50 -> comma is thousands, dot is decimal
      str = str.replace(/,/g, "");
    }
  } else if (str.includes(",")) {
    // Single comma: 1500,50 -> 1500.50
    str = str.replace(",", ".");
  }

  // Keep digits and the first decimal dot
  const firstDot = str.indexOf(".");
  let cleaned = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch && ch >= "0" && ch <= "9") {
      cleaned += ch;
    } else if (ch === "." && i === firstDot) {
      cleaned += ".";
    }
  }

  if (!cleaned) return 0;

  const parts = cleaned.split(".");
  const liras = parseInt(parts[0] || "0", 10) || 0;

  if (parts.length > 1) {
    const centsStr = (parts[1] || "").slice(0, 2).padEnd(2, "0");
    const cents = parseInt(centsStr, 10) || 0;
    return liras * 100 + cents;
  }

  return liras * 100;
}

export function PriceInput({
  value,
  onChange,
  disabled = false,
  placeholder = "0",
  className = "",
  step = 100, // 100 kuruş = 1 TL
  id,
  "aria-label": ariaLabel,
}: PriceInputProps) {
  const [text, setText] = useState(() => formatMinorUnitsToDisplay(value));
  const [isFocused, setIsFocused] = useState(false);

  const displayedText = isFocused ? text : formatMinorUnitsToDisplay(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);
    const parsed = parseDisplayToMinorUnits(raw);
    onChange(parsed);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatMinorUnitsToDisplay(value);
    setText(formatted);
    setIsFocused(true);
    // If current value is 0, auto-select so user can immediately type desired amount
    if (value === 0 || formatted === "0") {
      e.target.select();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseDisplayToMinorUnits(text);
    onChange(parsed);
    setText(formatMinorUnitsToDisplay(parsed));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const current = parseDisplayToMinorUnits(text);
      const increment = e.shiftKey ? step * 10 : step; // e.g. Shift: 10 TL, Normal: 1 TL
      const next = current + increment;
      onChange(next);
      setText(formatMinorUnitsToDisplay(next));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const current = parseDisplayToMinorUnits(text);
      const decrement = e.shiftKey ? step * 10 : step;
      const next = Math.max(0, current - decrement);
      onChange(next);
      setText(formatMinorUnitsToDisplay(next));
    }
  };

  return (
    <input
      id={id}
      aria-label={ariaLabel}
      type="text"
      inputMode="decimal"
      disabled={disabled}
      placeholder={placeholder}
      value={displayedText}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      className={className}
    />
  );
}
