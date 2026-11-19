import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/home" className={`brand ${className}`} aria-label="NexStock — Início">
      <svg className="brand-mark" width="38" height="34" viewBox="0 0 40 36" fill="none" aria-hidden="true">
        <path d="M7 2h11l7 10H0L7 2Zm16 0h9l8 10H30L23 2ZM4 14h32a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z" fill="currentColor" />
        <path d="M11 29V17h4l10 8v-8h4v12h-4l-10-8v8h-4Z" fill="var(--color-surface)" />
      </svg>
      <span>exStock</span>
    </Link>
  );
}
