import Link from "next/link";
import type { ReactNode } from "react";

export type DashboardTab = { href: string; label: string };

export default function DashboardShell({
  eyebrow,
  title,
  description,
  tabs,
  activeHref,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  tabs: DashboardTab[];
  activeHref: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[72rem] flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">
          {eyebrow}
        </p>
        <h1 className="font-display text-[2rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink-strong md:text-[2.5rem]">
          {title}
        </h1>
        {description ? <p className="max-w-[62ch] text-lg text-ink">{description}</p> : null}
      </header>

      <nav aria-label="Dashboard sections" className="flex flex-wrap gap-1 border-b border-graticule">
        {tabs.map((tab) => {
          const isCurrent = tab.href === activeHref;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isCurrent ? "page" : undefined}
              className={
                isCurrent
                  ? "inline-flex min-h-11 items-center border-b-2 border-meridian px-3 font-medium text-ink-strong"
                  : "inline-flex min-h-11 items-center border-b-2 border-transparent px-3 text-ink-muted transition-colors hover:border-graticule hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </main>
  );
}

export function StatTile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-card border border-graticule bg-surface p-4">
      <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-[1.75rem] font-semibold leading-tight text-ink-strong">{value}</p>
      {detail ? <p className="mt-1 text-[0.9375rem] text-ink-muted">{detail}</p> : null}
    </div>
  );
}

export function EmptyPanel({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <div role="status" className="space-y-3 rounded-card border border-graticule bg-surface p-6">
      <p className="font-medium text-ink-strong">{title}</p>
      <p className="text-ink">{detail}</p>
      {action}
    </div>
  );
}
