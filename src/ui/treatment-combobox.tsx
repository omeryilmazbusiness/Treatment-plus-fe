"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

import type { Treatment } from "@/modules/catalog/domain/catalog";
import { formatMoney, money, type Currency } from "@/shared/money";

export interface TreatmentComboboxProps {
  value?: string;
  treatmentName?: string;
  treatments: Treatment[];
  priceMap: Map<string, number>;
  currency: Currency;
  disabled?: boolean;
  placeholder?: string;
  onChange: (treatmentId: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
}

function formatPrice(amountMinor: number, currency: Currency): string {
  try {
    return formatMoney(money(amountMinor, currency));
  } catch {
    return `${(amountMinor / 100).toLocaleString("tr-TR")} ${currency === "TRY" ? "TL" : currency}`;
  }
}

function matchTurkish(text: string, query: string): boolean {
  if (!query) return true;
  const q = query.toLocaleLowerCase("tr-TR").trim();
  const t = text.toLocaleLowerCase("tr-TR");
  return t.includes(q);
}

export function TreatmentCombobox({
  value,
  treatmentName,
  treatments,
  priceMap,
  currency,
  disabled = false,
  placeholder = "-- Tedavi / İşlem Seçin --",
  onChange,
  onOpenChange,
  className = "",
}: TreatmentComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [openUpward, setOpenUpward] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Selected treatment from catalog
  const selectedTreatment = useMemo(() => {
    if (!value) return null;
    return treatments.find((t) => String(t.id) === String(value)) || null;
  }, [treatments, value]);


  // Filtered treatments based on search
  const filteredTreatments = useMemo(() => {
    if (!search.trim()) return treatments;
    return treatments.filter(
      (t) =>
        matchTurkish(t.name, search) ||
        (t.code && matchTurkish(t.code, search))
    );
  }, [treatments, search]);

  // Notify parent on open state changes
  const toggleOpen = useCallback(
    (nextState?: boolean) => {
      if (disabled) return;
      setIsOpen((prev) => {
        const next = typeof nextState === "boolean" ? nextState : !prev;
        onOpenChange?.(next);
        if (!next) {
          setSearch("");
          setHighlightedIndex(0);
        }
        return next;
      });
    },
    [disabled, onOpenChange]
  );

  // Check collision with screen bottom when opening
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setOpenUpward(true);
    } else {
      setOpenUpward(false);
    }

    // Auto-focus search input
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        toggleOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggleOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        toggleOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      toggleOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredTreatments.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(0, filteredTreatments.length - 1)
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const current = filteredTreatments[highlightedIndex];
      if (current) {
        onChange(String(current.id));
        toggleOpen(false);
      }
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeEl = listRef.current.querySelector(
      `[data-item-index="${highlightedIndex}"]`
    ) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  const displayName =
    selectedTreatment?.name ||
    treatmentName ||
    (value ? `Mevcut: ${value}` : "");

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative ${isOpen ? "z-40" : "z-10"} ${className}`}
    >
      {/* Trigger Butonu */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => toggleOpen()}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-1.5 text-left text-xs font-semibold shadow-2xs transition focus:outline-hidden ${
          isOpen
            ? "border-slate-900 bg-white ring-2 ring-slate-900/10 shadow-xs"
            : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white focus:border-slate-900"
        } ${
          disabled
            ? "cursor-not-allowed bg-slate-100 text-slate-400 opacity-80"
            : "cursor-pointer text-slate-900"
        }`}
      >
        <span
          className={`truncate ${
            displayName
              ? "font-semibold text-slate-900"
              : "font-normal text-slate-400"
          }`}
        >
          {displayName || placeholder}
        </span>

        <ChevronDown
          className={`size-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-slate-900" : "group-hover:text-slate-600"
          }`}
        />
      </button>

      {/* Açılır Menü (Popover Penceresi) */}
      {isOpen && !disabled && (
        <div
          className={`absolute left-0 ${
            openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } w-full min-w-[320px] max-w-[calc(100vw-2rem)] sm:min-w-[420px] rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl shadow-slate-900/15 backdrop-blur-xs`}
          role="listbox"
        >
          {/* Arama Alanı */}
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder="Tedavi adı veya kodu ile ara..."
              className="w-full rounded-xl border border-slate-200/70 bg-slate-50/80 py-1.5 pl-8.5 pr-8 text-xs text-slate-900 placeholder:text-slate-400 transition hover:bg-slate-100/70 focus:border-slate-900 focus:bg-white focus:outline-hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setHighlightedIndex(0);
                  inputRef.current?.focus();
                }}
                className="absolute right-2 top-2 rounded-md p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Liste Başlığı & Sayısı */}
          <div className="mb-1 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Tedavi Listesi</span>
            <span>
              {filteredTreatments.length} / {treatments.length}
            </span>
          </div>

          {/* Tedaviler Kaydırma Alanı */}
          <div
            ref={listRef}
            className="max-h-64 space-y-1 overflow-y-auto overscroll-contain pr-1"
          >
            {filteredTreatments.length === 0 ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search className="size-4" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Eşleşen tedavi bulunamadı
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  &ldquo;{search}&rdquo; aramasını kontrol edin
                </p>
              </div>
            ) : (
              filteredTreatments.map((t, idx) => {
                const isSelected = String(t.id) === String(value);
                const isHighlighted = idx === highlightedIndex;
                const price = priceMap.get(String(t.id));

                return (
                  <button
                    key={t.id}
                    data-item-index={idx}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => {
                      onChange(String(t.id));
                      toggleOpen(false);
                    }}
                    className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-2xs font-semibold"
                        : isHighlighted
                        ? "bg-slate-100/90 text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate text-xs ${
                          isSelected
                            ? "font-bold text-white"
                            : "font-semibold text-slate-900"
                        }`}
                      >
                        {t.name}
                      </div>
                      {t.code && (
                        <div
                          className={`text-[10px] ${
                            isSelected ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          Kod: {t.code}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {price !== undefined && price > 0 ? (
                        <span
                          className={`rounded-lg px-2 py-0.5 text-xs font-bold font-mono transition ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "border border-emerald-100 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {formatPrice(price, currency)}
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-medium ${
                            isSelected ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          Fiyat Tanımsız
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
