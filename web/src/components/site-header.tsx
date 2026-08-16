"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Course", mobileLabel: "Course", matches: (path: string) => path === "/" || path.startsWith("/chapters/") },
  { href: "/about", label: "Guide", mobileLabel: "Guide", matches: (path: string) => path === "/about" },
  { href: "/practice/course", label: "Full exam", mobileLabel: "Exam", matches: (path: string) => path === "/practice/course" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-graticule bg-chart/95">
      <div className="mx-auto flex min-h-16 w-full max-w-[86rem] items-center justify-between gap-2 px-4 py-2 sm:gap-3 sm:px-6">
        <Link
          className="whitespace-nowrap font-display text-[1.0625rem] font-semibold text-ink-strong transition-colors hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          href="/"
        >
          <span className="sm:hidden">TG Tutor</span>
          <span className="hidden sm:inline">Tourism Geography Tutor</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {navigation.map((item) => {
            const isCurrent = item.matches(pathname);
            return (
              <Link
                key={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={
                  isCurrent
                    ? "inline-flex min-h-11 items-center border-b-2 border-meridian px-1.5 text-[0.9375rem] font-medium text-ink-strong sm:px-3 sm:text-base"
                    : "inline-flex min-h-11 items-center border-b-2 border-transparent px-1.5 text-[0.9375rem] text-ink-muted transition-colors hover:border-graticule hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian sm:px-3 sm:text-base"
                }
                href={item.href}
              >
                <span className="sm:hidden">{item.mobileLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
