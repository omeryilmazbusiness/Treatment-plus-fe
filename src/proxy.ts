import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, localeHref } from "@/shared/locale";

/**
 * Kök yola gelen ziyaretçiyi, daha önce seçtiği dile yönlendirir.
 * Varsayılan dil (tr) kökte kalır; seçim yoksa hiçbir şey değişmez.
 */
export function proxy(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;

  if (isLocale(saved) && saved !== DEFAULT_LOCALE) {
    return NextResponse.redirect(new URL(localeHref(saved), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
