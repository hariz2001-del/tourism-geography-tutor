import Image from "next/image";
import LoginForm from "./login-form";

export const metadata = { title: "Sign in · Tourism Geography Tutor" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[28rem] flex-col justify-center gap-6 px-6 py-12">
      {/* The badge and the course name together: this is the first page anyone sees. */}
      <div className="flex flex-col items-center gap-3 text-center">
        <Image
          alt="Geotourism Learning — an interactive educational platform"
          className="h-32 w-32"
          height={512}
          priority
          src="/brand/geotourism-learning-badge.png"
          width={512}
        />
        <h1 className="font-display text-[2rem]/[1.15] font-semibold tracking-[-0.015em] text-ink-strong">
          Tourism Geography Tutor
        </h1>
        <p className="text-ink">
          Sign in to open the course, the flashcards, the tutor, and your results.
        </p>
      </div>

      <div className="rounded-card border border-graticule bg-surface p-5">
        <LoginForm next={safeNext} />
      </div>

      <p className="text-center text-ink-muted">
        Ask your lecturer if you do not have an account yet.
      </p>
    </main>
  );
}
