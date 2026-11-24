"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  FileText,
  LayoutDashboard,
  PencilLine,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  MAX_TABS,
  newTabId,
  parseTabs,
  readTabsRaw,
  subscribeTabs,
  writeTabs,
  DEFAULT_TABS_RAW,
  type TabsState,
} from "./tabs-store";

function describe(href: string): { title: string; icon: LucideIcon } {
  if (href === "/app") return { title: "Genel Bakış", icon: LayoutDashboard };
  if (href === "/app/plans") return { title: "Tedavi Planları", icon: FileText };
  if (href.startsWith("/app/plans/")) return { title: "Plan Detayı", icon: PencilLine };
  if (href.startsWith("/app/clinic")) return { title: "Klinik & Şablon", icon: Building2 };
  if (href.startsWith("/app/settings")) return { title: "Ayarlar", icon: Settings };
  return { title: "Ekran", icon: LayoutDashboard };
}

/**
 * Up to three simultaneously open screens. Switching a tab navigates to the
 * route that tab was last on; navigating inside a tab updates that tab.
 */
export function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const raw = useSyncExternalStore(subscribeTabs, readTabsRaw, () => DEFAULT_TABS_RAW);
  const state = useMemo(() => parseTabs(raw), [raw]);
  // Stored tabs only exist on the client; hide the strip until hydrated to avoid a flash of the default tab.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Any navigation to a different screen opens it as a new tab (max 3).
  // - already open in a tab  -> that tab is activated
  // - first load / 3 tabs open -> the active tab is re-pointed instead
  const firstRun = useRef(true);
  useEffect(() => {
    const isFirst = firstRun.current;
    firstRun.current = false;
    if (!pathname.startsWith("/app")) return;

    const cur = parseTabs(readTabsRaw());
    const active = cur.tabs.find((t) => t.id === cur.active) ?? cur.tabs[0];
    if (!active || active.href === pathname) return;

    const existing = cur.tabs.find((t) => t.href === pathname);
    if (existing) {
      writeTabs({ ...cur, active: existing.id });
      return;
    }
    if (!isFirst && cur.tabs.length < MAX_TABS) {
      const id = newTabId();
      writeTabs({ tabs: [...cur.tabs, { id, href: pathname }], active: id });
      return;
    }
    writeTabs({
      ...cur,
      tabs: cur.tabs.map((t) => (t.id === active.id ? { ...t, href: pathname } : t)),
    });
  }, [pathname]);

  const activate = useCallback(
    (id: string) => {
      const target = state.tabs.find((t) => t.id === id);
      if (!target) return;
      writeTabs({ ...state, active: id });
      if (target.href !== pathname) router.push(target.href);
    },
    [state, pathname, router],
  );

  const close = useCallback(
    (id: string) => {
      if (state.tabs.length <= 1) return;
      const idx = state.tabs.findIndex((t) => t.id === id);
      const tabs = state.tabs.filter((t) => t.id !== id);
      let next: TabsState = { tabs, active: state.active };
      if (state.active === id) {
        const neighbour = tabs[Math.min(idx, tabs.length - 1)] ?? tabs[0];
        if (!neighbour) return;
        next = { tabs, active: neighbour.id };
        writeTabs(next);
        if (neighbour.href !== pathname) router.push(neighbour.href);
        return;
      }
      writeTabs(next);
    },
    [state, pathname, router],
  );

  return (
    <div
      role="tablist"
      aria-label="Açık ekranlar"
      className={`flex min-w-0 flex-1 items-center gap-1.5 overflow-x-hidden px-1 py-1 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hydrated ? "opacity-100" : "opacity-0"
      }`}
    >
      {state.tabs.map((tab) => {
        const isActive = tab.id === state.active;
        const { title, icon: Icon } = describe(tab.href);
        return (
          <div key={tab.id} className="group relative shrink-0">
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={title}
              title={title}
              onClick={() => activate(tab.id)}
              className={`tp-tab flex size-10 cursor-pointer items-center justify-center rounded-xl ${
                isActive
                  ? "bg-white text-indigo-500 shadow-[0_8px_24px_-8px_rgba(79,70,229,0.45)] ring-1 ring-white"
                  : "text-slate-500 hover:bg-white/60 hover:text-[#0b1f4d]"
              }`}
            >
              <Icon className="size-5" strokeWidth={1.8} />
            </button>
            {state.tabs.length > 1 && (
              <button
                type="button"
                aria-label={`${title} sekmesini kapat`}
                title="Kapat"
                onClick={() => close(tab.id)}
                className={`tp-icon-btn absolute -right-1 -top-1 flex size-4 cursor-pointer items-center justify-center rounded-full bg-slate-600/85 text-white hover:bg-rose-500 focus-visible:opacity-100 ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <X className="size-2.5" strokeWidth={3} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
