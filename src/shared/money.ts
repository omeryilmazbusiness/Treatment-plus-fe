export const Currency = {
  TRY: "TRY",
  EUR: "EUR",
  USD: "USD",
} as const;

export type Currency = (typeof Currency)[keyof typeof Currency];

/** Amount is integer minor units (kuruş / cent). Float is forbidden. */
export type Money = {
  readonly amount: number;
  readonly currency: Currency;
};

export function money(amount: number, currency: Currency): Money {
  if (!Number.isInteger(amount)) {
    throw new Error("money: amount must be an integer minor unit");
  }
  if (!isCurrency(currency)) {
    throw new Error(`money: unsupported currency ${currency}`);
  }
  return { amount, currency };
}

export function zero(currency: Currency): Money {
  return money(0, currency);
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function sub(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

export function isZero(m: Money): boolean {
  return m.amount === 0;
}

export function formatMoney(m: Money, locale = "tr-TR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: m.currency,
  }).format(m.amount / 100);
}

function isCurrency(value: string): value is Currency {
  return value === Currency.TRY || value === Currency.EUR || value === Currency.USD;
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`money: currency mismatch ${a.currency} vs ${b.currency}`);
  }
}
