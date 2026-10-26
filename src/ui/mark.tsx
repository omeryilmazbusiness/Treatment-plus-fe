export function Mark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M9 20.5c2.2-4.4 4.6-8.8 7-8.8s3.6 2.6 5 5.4c.9 1.8 1.8 3.6 3 3.6"
        stroke="#f4f0e8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
