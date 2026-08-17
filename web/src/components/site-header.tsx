"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";
import type { Profile } from "@/lib/auth/types";

const navigation = [
  { href: "/", label: "Course", mobileLabel: "Course", matches: (path: string) => path === "/" || path.startsWith("/chapters/") },
  { href: "/flashcards", label: "Flashcards", mobileLabel: "Cards", matches: (path: string) => path === "/flashcards" },
  { href: "/about", label: "Guide", mobileLabel: "Guide", matches: (path: string) => path === "/about" },
  { href: "/practice/course", label: "Full exam", mobileLabel: "Exam", matches: (path: string) => path === "/practice/course" },
];

const linkClass = (isCurrent: boolean) =>
  isCurrent
    ? "inline-flex min-h-11 items-center justify-center border-b-2 border-meridian px-1.5 text-[0.9375rem] font-medium text-ink-strong sm:px-3 sm:text-base"
    : "inline-flex min-h-11 items-center justify-center border-b-2 border-transparent px-1.5 text-[0.9375rem] text-ink-muted transition-colors hover:border-graticule hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian sm:px-3 sm:text-base";

export default function SiteHeader({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();

  const items = profile
    ? [
        ...navigation,
        {
          href: "/dashboard",
          label: profile.role === "lecturer" ? "Teaching" : "My learning",
          mobileLabel: profile.role === "lecturer" ? "Teach" : "Mine",
          matches: (path: string) => path.startsWith("/dashboard"),
        },
      ]
    : navigation;

  return (
    <header className="border-b border-graticule bg-chart/95">
      <div className="mx-auto flex min-h-16 w-full max-w-[86rem] flex-wrap items-center justify-between gap-x-2 px-4 py-2 sm:flex-nowrap sm:gap-3 sm:px-6">
        <Link
          className="whitespace-nowrap font-display text-[1.0625rem] font-semibold text-ink-strong transition-colors hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          href="/"
        >
          <span className="sm:hidden">TG Tutor</span>
          <span className="hidden sm:inline">Tourism Geography Tutor</span>
        </Link>

        <nav
          aria-label="Primary"
          className={`order-2 grid w-full items-center gap-1 sm:order-none sm:flex sm:w-auto sm:gap-2 ${profile ? "grid-cols-5" : "grid-cols-4"}`}
        >
          {items.map((item) => {
            const isCurrent = item.matches(pathname);
            return (
              <Link
                key={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={linkClass(isCurrent)}
                href={item.href}
              >
                <span className="sm:hidden">{item.mobileLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <span className="hidden max-w-[12rem] truncate text-[0.9375rem] text-ink-muted lg:inline">
                {profile.displayName}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-card border border-graticule bg-surface px-3 text-[0.9375rem] font-medium text-meridian transition-colors hover:border-meridian hover:bg-meridian/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              className="inline-flex min-h-11 items-center rounded-card border border-graticule bg-surface px-3 text-[0.9375rem] font-medium text-meridian transition-colors hover:border-meridian hover:bg-meridian/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
              href="/login"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
