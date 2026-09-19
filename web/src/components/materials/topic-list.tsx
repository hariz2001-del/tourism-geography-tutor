"use client";

import { useState } from "react";
import { TopicLinks } from "@/app/chapters/[chapterCode]/chapter-topics";
import { chapterAccent } from "@/lib/course-brain/chapter-accent";
import type { ChapterTopic } from "@/lib/course-brain/types";

/**
 * The chapter's topics. These are still real links — copyable, openable in a new tab — but a
 * plain click switches the panel that is already in the document instead of asking the server
 * for the page again.
 */
export default function TopicList({ chapterCode, topics }: { chapterCode: string; topics: ChapterTopic[] }) {
  const [openOnMobile, setOpenOnMobile] = useState(topics.length <= 4);
  const accent = chapterAccent(chapterCode);

  const links = (
    <TopicLinks
      chapterCode={chapterCode}
      renderLink={(topic, { href, isActive, onClick }) => (
        <li key={topic.id}>
          <a
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? `-ml-px flex min-h-11 items-center border-l-2 px-4 py-2 text-[0.9375rem] font-semibold text-ink-strong transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.tint}`
                : "-ml-px flex min-h-11 items-center border-l-2 border-l-transparent px-4 py-2 text-[0.9375rem] text-ink-muted transition-colors duration-150 hover:border-l-graticule hover:text-ink active:bg-meridian/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            }
            href={href}
            onClick={(event) => {
              onClick(event);
              // a modified click was left to the browser; only close the drawer on a real switch
              if (event.defaultPrevented) setOpenOnMobile(false);
            }}
          >
            {topic.name}
          </a>
        </li>
      )}
      topics={topics}
    />
  );

  return (
    <nav aria-label="Chapter topics">
      <details
        className="rounded-card border border-graticule bg-surface lg:hidden"
        onToggle={(event) => setOpenOnMobile((event.currentTarget as HTMLDetailsElement).open)}
        open={openOnMobile}
      >
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-2 marker:hidden [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted">Topics</span>
            <span className="mt-0.5 block font-medium text-ink-strong">
              <SelectedTopicName topics={topics} />
            </span>
          </span>
          <span aria-hidden="true" className="font-mono text-lg text-meridian">⌄</span>
        </summary>
        <ul className="border-t border-graticule">{links}</ul>
      </details>
      <div className="hidden lg:block">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted">Topics</p>
        <ul className="mt-3 border-l border-graticule">{links}</ul>
      </div>
    </nav>
  );
}

function SelectedTopicName({ topics }: { topics: ChapterTopic[] }) {
  return (
    <TopicLinks
      chapterCode=""
      renderLink={(topic, { isActive }) => (isActive ? <span key={topic.id}>{topic.name}</span> : null)}
      topics={topics}
    />
  );
}
