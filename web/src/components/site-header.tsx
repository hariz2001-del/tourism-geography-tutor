"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";
import type { Profile } from "@/lib/auth/types";
import ThemeToggle from "@/components/theme-toggle";

const navigation = [
  { href: "/about", label: "GUIDE", mobileLabel: "Guide", matches: (path: string) => path === "/about" },
  { href: "/", label: "Course", mobileLabel: "Course", matches: (path: string) => path === "/" || path.startsWith("/chapters/") },
  { href: "/flashcards", label: "Flashcards", mobileLabel: "Cards", matches: (path: string) => path === "/flashcards" },
  { href: "/practice/course", label: "Full exam", mobileLabel: "Exam", matches: (path: string) => path === "/practice/course" },
];

const linkClass = (isCurrent: boolean) =>
  isCurrent
    ? "inline-flex min-h-10 items-center justify-center rounded-full bg-meridian px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-chart shadow-sm sm:text-sm"
    : "inline-flex min-h-10 items-center justify-center rounded-full px-3 text-[0.8125rem] font-medium uppercase tracking-[0.06em] text-ink-muted transition-colors hover:bg-surface hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian sm:text-sm";

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
    <header className="border-b border-graticule bg-surface/92 shadow-[0_3px_16px_rgb(28_63_91_/_5%)] backdrop-blur">
      {/* A thin stripe in the badge's own navy, sky blue and green, so the header and the logo read as one. */}
      <div aria-hidden="true" className="h-1 bg-[linear-gradient(90deg,#1f4e8c,#2f77c0_48%,#3a8a3a)]" />
      <div className="mx-auto flex min-h-16 w-full max-w-[86rem] flex-wrap items-center justify-between gap-x-2 px-4 py-2 sm:flex-nowrap sm:gap-3 sm:px-6">
        <Link
          className="flex items-center gap-2.5 whitespace-nowrap font-display text-[1.0625rem] font-semibold text-ink-strong transition-colors hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          href="/"
        >
          {/* The link's own words already name the site, so the badge is not read out twice. */}
          <Image
            alt=""
            aria-hidden="true"
            className="h-10 w-10 shrink-0 drop-shadow-sm"
            height={512}
            priority
            src="/brand/geotourism-learning-badge.png"
            width={512}
          />
          <span className="sm:hidden">TG Tutor</span>
          <span className="hidden sm:inline">Tourism Geography Tutor</span>
        </Link>

        {profile ? (
        <nav
          aria-label="Primary"
          className="order-2 grid w-full grid-cols-5 items-center gap-1 sm:order-none sm:flex sm:w-auto sm:gap-2"
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
        ) : null}

        <div className="flex items-center gap-2">
          <ThemeToggle />
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
          ) : null}
        </div>
      </div>
    </header>
  );
}
