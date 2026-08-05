import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">
        Tourism Geography Tutor
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-slate-950">
        Learn from approved course materials.
      </h1>
      <p className="max-w-2xl text-lg leading-8 text-slate-700">
        Explore reviewed material, practise with source-linked questions, and ask
        for explanations grounded in your course content.
      </p>
      <div>
        <Link
          className="inline-flex rounded-md bg-slate-900 px-5 py-3 font-semibold text-white outline-offset-4 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-slate-900"
          href="/chapters/CH1"
        >
          Start Chapter 1
        </Link>
      </div>
    </main>
  );
}
