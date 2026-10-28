export interface MarkProps {
  readonly className?: string;
  readonly title?: string;
  readonly framed?: boolean;
}

export function Mark({
  className = "size-9",
  title,
  framed = false,
}: MarkProps) {
  const fg = framed ? "#F3EFE6" : "#172647";

  return (
    <svg
      className={className}
      viewBox={framed ? "160 160 704 704" : "250 220 520 584"}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : "true"}
    >
      {title ? <title>{title}</title> : null}
      {framed ? (
        <rect x="160" y="160" width="704" height="704" rx="156" fill="#172647" />
      ) : null}
      {/* Belge dış çerçevesi, sağ üst kıvrım ve sol T gövdesi */}
      <path
        d="M353 297V282C353 262.118 369.118 246 389 246H580C596.5 246 608.5 251.5 620.5 263.5L722.5 365.5C734.5 377.5 739 389.5 739 406V742C739 761.882 722.882 778 703 778H388C368.118 778 352 761.882 352 742V520C352 456 368 386 404 336"
        stroke={fg}
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sağ üst katlama iç çizgisi */}
      <path
        d="M608 252V335C608 356.539 625.461 374 647 374H732"
        stroke={fg}
        strokeWidth="23"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* T üst dalga çizgisi */}
      <path
        d="M284 364C316 336 358 335 415 335C466 335 502 326 531 307"
        stroke={fg}
        strokeWidth="24"
        strokeLinecap="round"
      />
      {/* Orta medikal artı (+) sembolü */}
      <rect x="522" y="438" width="48" height="148" rx="18" fill={fg} />
      <rect x="472" y="488" width="148" height="48" rx="18" fill={fg} />
      {/* Alt satır çizgileri */}
      <path
        d="M426 648H666"
        stroke={fg}
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M426 697H579"
        stroke={fg}
        strokeWidth="20"
        strokeLinecap="round"
      />
    </svg>
  );
}
