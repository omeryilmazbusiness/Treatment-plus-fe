const TITLE_PREFIX = /^\s*(dr|dt|doç|doc|prof|uzm|op|opr|yrd)\.?(\s|$)/i;

/**
 * Hekim adını tek bir unvanla gösterir. Ad zaten "Dr." / "Dt." / "Prof."
 * gibi bir unvanla başlıyorsa olduğu gibi bırakır; yoksa "Dr." ekler.
 */
export function doctorDisplayName(name: string | undefined | null): string {
  const trimmed = (name ?? "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return TITLE_PREFIX.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
}
