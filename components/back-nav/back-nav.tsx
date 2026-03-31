import Link from "next/link";
import type { ReactNode } from "react";

function IconChevronLeft() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function BackNav({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-md py-1.5 pl-1 pr-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
    >
      <IconChevronLeft />
      {children}
    </Link>
  );
}
