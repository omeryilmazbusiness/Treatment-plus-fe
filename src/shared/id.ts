/** ULID v2 string. Backend stores it as UUID. */
export type ID = string & { readonly __brand: "ID" };

const ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export function asID(value: string): ID {
  if (!ULID.test(value)) {
    throw new Error("id: expected canonical 26-char ULID");
  }
  return value as ID;
}

export function isID(value: string): value is ID {
  return ULID.test(value);
}
