import Image from "next/image";
import RoleChooser from "./role-chooser";

export const metadata = { title: "Choose a role · Tourism Geography Tutor" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[30rem] flex-col justify-center gap-6 px-6 py-12">
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
        <p className="text-ink">Choose how you would like to explore. You can switch at any time.</p>
      </div>

      {error ? (
        <p role="alert" className="text-center text-danger">
          The course could not be opened just now. Please try again in a moment.
        </p>
      ) : null}

      <RoleChooser next={safeNext} />
    </main>
  );
}
