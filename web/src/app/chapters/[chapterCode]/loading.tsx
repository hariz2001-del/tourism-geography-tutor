/**
 * The chapter skeleton.
 *
 * It used to say "Loading Chapter 1 materials…" whichever chapter you opened — a route-level
 * loading file is rendered before the params are resolved, so it cannot know. Rather than name
 * the wrong chapter, it now shows the shape the page is about to take: sidebar, heading and
 * cards. Same layout, so nothing jumps when the content lands.
 */
export default function Loading() {
  return (
    <main aria-busy="true" className="tutor-dock-space mx-auto flex min-h-screen max-w-[86rem] flex-col gap-8 px-6 py-8">
      <span className="sr-only" role="status">
        Loading chapter materials
      </span>

      <div className="h-9 w-full max-w-md animate-pulse rounded-card bg-chart" />

      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((row) => (
              <div className="h-9 animate-pulse rounded-card bg-chart" key={row} />
            ))}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-16 animate-pulse rounded bg-chart" />
            <div className="h-10 w-3/4 animate-pulse rounded-card bg-chart" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-chart" />
          </div>
          {[0, 1, 2].map((card) => (
            <div className="space-y-2 rounded-card border border-graticule bg-surface p-5" key={card}>
              <div className="h-5 w-2/5 animate-pulse rounded bg-chart" />
              <div className="h-4 w-full animate-pulse rounded bg-chart" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-chart" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-chart" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
