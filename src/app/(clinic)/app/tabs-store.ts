/**
 * Client-side store for the multi-screen tab strip (max 3 tabs).
 * Persisted in localStorage when "remember tabs" is on, else in sessionStorage.
 */

export const MAX_TABS = 3;

const TABS_KEY = "tp.app.tabs.v1";
const PREFS_KEY = "tp.app.prefs.v1";

export type Tab = { id: string; href: string };
export type TabsState = { tabs: Tab[]; active: string };

const DEFAULT_STATE: TabsState = { tabs: [{ id: "t1", href: "/app" }], active: "t1" };
export const DEFAULT_TABS_RAW = JSON.stringify(DEFAULT_STATE);

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeTabs(cb: () => void): () => void {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function readRememberTabs(): boolean {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw) as { rememberTabs?: unknown };
    return parsed.rememberTabs !== false;
  } catch {
    return true;
  }
}

function storage(): Storage | null {
  try {
    return readRememberTabs() ? localStorage : sessionStorage;
  } catch {
    return null;
  }
}

export function readTabsRaw(): string {
  return storage()?.getItem(TABS_KEY) ?? DEFAULT_TABS_RAW;
}

export function newTabId(): string {
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function isSafeHref(href: unknown): href is string {
  return typeof href === "string" && (href === "/app" || href.startsWith("/app/")) && !href.includes("//");
}

/** Validates untrusted storage content; always returns a usable state. */
export function parseTabs(raw: string): TabsState {
  try {
    const data = JSON.parse(raw) as Partial<TabsState>;
    const seen = new Set<string>();
    const tabs: Tab[] = [];
    for (const t of Array.isArray(data.tabs) ? data.tabs : []) {
      if (!t || typeof t.id !== "string" || !isSafeHref(t.href) || seen.has(t.id)) continue;
      seen.add(t.id);
      tabs.push({ id: t.id, href: t.href });
      if (tabs.length === MAX_TABS) break;
    }
    if (tabs.length === 0) return DEFAULT_STATE;
    const first = tabs[0];
    if (!first) return DEFAULT_STATE;
    const active = tabs.some((t) => t.id === data.active) ? (data.active as string) : first.id;
    return { tabs, active };
  } catch {
    return DEFAULT_STATE;
  }
}

export function writeTabs(state: TabsState): void {
  try {
    storage()?.setItem(TABS_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode / quota): tabs stay in-memory per navigation
  }
  notify();
}

export function resetTabs(href = "/app"): void {
  writeTabs({ tabs: [{ id: "t1", href }], active: "t1" });
}

/** Switches persistence mode and carries the current tabs over. */
export function setRememberTabs(remember: boolean): void {
  const current = readTabsRaw();
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ rememberTabs: remember }));
    const from = remember ? sessionStorage : localStorage;
    from.removeItem(TABS_KEY);
  } catch {
    // ignore
  }
  try {
    (remember ? localStorage : sessionStorage).setItem(TABS_KEY, current);
  } catch {
    // ignore
  }
  notify();
}

/** Called on logout so the next account never inherits another user's tabs. */
export function clearTabs(): void {
  try {
    localStorage.removeItem(TABS_KEY);
    sessionStorage.removeItem(TABS_KEY);
  } catch {
    // ignore
  }
  notify();
}
