"use client";

import { LogOut } from "lucide-react";

import { logoutClinicAction } from "@/app/login/actions";
import { clearTabs } from "./tabs-store";

/** Header logout. Clears the persisted tab strip so accounts never share tabs. */
export function LogoutButton() {
  return (
    <form action={logoutClinicAction} onSubmit={clearTabs}>
      <button
        type="submit"
        aria-label="Çıkış Yap"
        title="Çıkış Yap"
        className="flex size-11 cursor-pointer items-center justify-center rounded-xl text-[#0b1f4d] tp-icon-btn hover:bg-white/70 hover:text-rose-600"
      >
        <LogOut className="size-6" strokeWidth={1.8} />
      </button>
    </form>
  );
}
