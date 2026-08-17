import Link from "next/link";
import LoginForm from "./login-form";

export const metadata = { title: "Sign in · Tourism Geography Tutor" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[28rem] flex-col justify-center gap-6 px-6 py-12">
      <div className="space-y-2">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">
          Tourism Geography Tutor
        </p>
        <h1 className="font-display text-[2rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink-strong">
          Sign in
        </h1>
        <p className="text-ink">
          Signing in saves your bookmarks, reading history, and assessment results.
        </p>
      </div>

      <div className="rounded-card border border-graticule bg-surface p-5">
        <LoginForm next={safeNext} />
      </div>

      <p className="text-ink-muted">
        The course materials, flashcards, and practice assessments are open without an
        account.{" "}
        <Link
          href="/"
          className="text-meridian underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
        >
          Continue without signing in
        </Link>
        .
      </p>
    </main>
  );
}
