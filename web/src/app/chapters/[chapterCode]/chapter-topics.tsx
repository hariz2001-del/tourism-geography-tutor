"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import TutorPanel from "@/components/tutor/tutor-panel";
import { recordTopicView } from "./actions";

/**
 * Every topic in the chapter is rendered on the server and sent at once; this decides which
 * one is on screen.
 *
 * Before, each topic in the sidebar was a route change, and each route change re-ran the
 * whole page on the server: chapters, topics, that topic's units, its quiz, the session and
 * the learner's bookmarks — five or six round trips to the database before anything could
 * paint. The content of a chapter is small and it does not change while someone reads it, so
 * it is fetched once and switching is now a state change: no network, no spinner.
 *
 * The URL still leads: a deep link renders its topic on the server, and switching pushes the
 * new `?topic=` with `history.pushState` so back and forward keep working without a fetch.
 */
type ChapterTopicsValue = {
  activeTopicId: string;
  setActiveTopicId: (topicId: string) => void;
};

const ChapterTopicsContext = createContext<ChapterTopicsValue | null>(null);

function useChapterTopics(): ChapterTopicsValue {
  const value = useContext(ChapterTopicsContext);
  if (!value) throw new Error("useChapterTopics must be used inside ChapterTopicsProvider");
  return value;
}

export function ChapterTopicsProvider({
  chapterCode,
  initialTopicId,
  topicIds,
  children,
}: {
  chapterCode: string;
  initialTopicId: string;
  topicIds: string[];
  children: React.ReactNode;
}) {
  const [activeTopicId, setActive] = useState(initialTopicId);

  const setActiveTopicId = useCallback(
    (topicId: string) => {
      setActive(topicId);
      window.history.pushState(null, "", `/chapters/${chapterCode}?topic=${encodeURIComponent(topicId)}`);
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [chapterCode],
  );

  // Back and forward move between topics without touching the server.
  useEffect(() => {
    function onPopState() {
      const topicId = new URLSearchParams(window.location.search).get("topic");
      setActive(topicId && topicIds.includes(topicId) ? topicId : initialTopicId);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [initialTopicId, topicIds]);

  const value = useMemo(() => ({ activeTopicId, setActiveTopicId }), [activeTopicId, setActiveTopicId]);
  return <ChapterTopicsContext.Provider value={value}>{children}</ChapterTopicsContext.Provider>;
}

/**
 * Jump to a particular card, wherever in the chapter it lives.
 *
 * The attraction wheel indexes cards across five other topics, all of them already rendered
 * and hidden. Switching the panel is a state change, so the target does not exist in layout
 * until React has painted — hence the two frames before scrolling.
 *
 * The hash is set with `replaceState` rather than by assigning `location.hash`: assigning
 * would push a second history entry on top of the one the topic switch just pushed, and the
 * back button would need two presses to undo one click. The `hashchange` event is dispatched
 * by hand so the card still flashes its highlight.
 */
export function useGoToUnit(): (topicId: string, unitId: string) => void {
  const { activeTopicId, setActiveTopicId } = useChapterTopics();
  return useCallback(
    (topicId: string, unitId: string) => {
      if (topicId !== activeTopicId) setActiveTopicId(topicId);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const anchor = `#unit-${unitId}`;
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${anchor}`);
          window.dispatchEvent(new HashChangeEvent("hashchange"));
          document.getElementById(`unit-${unitId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });
    },
    [activeTopicId, setActiveTopicId],
  );
}

/** One topic's server-rendered content. Present in the document from the start, shown on demand. */
export function TopicPanel({ topicId, children }: { topicId: string; children: React.ReactNode }) {
  const { activeTopicId } = useChapterTopics();
  const isActive = topicId === activeTopicId;
  return (
    <div className="space-y-10" hidden={!isActive} id={`topic-${topicId}`}>
      {children}
    </div>
  );
}

/** The sidebar. Real links, so they can be opened in a new tab, but a click switches in place. */
export function TopicLinks({
  chapterCode,
  topics,
  renderLink,
}: {
  chapterCode: string;
  topics: { id: string; name: string }[];
  renderLink: (topic: { id: string; name: string }, props: {
    href: string;
    isActive: boolean;
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  }) => React.ReactNode;
}) {
  const { activeTopicId, setActiveTopicId } = useChapterTopics();
  return (
    <>
      {topics.map((topic) =>
        renderLink(topic, {
          href: `/chapters/${chapterCode}?topic=${encodeURIComponent(topic.id)}`,
          isActive: topic.id === activeTopicId,
          onClick: (event) => {
            // let the browser handle new-tab, download and modified clicks
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            setActiveTopicId(topic.id);
          },
        }),
      )}
    </>
  );
}

/** The selected topic's name, for the parts of the page outside its panel. */
export function ActiveTopicName({ names }: { names: Record<string, string> }) {
  const { activeTopicId } = useChapterTopics();
  return <>{names[activeTopicId] ?? ""}</>;
}

/** The tutor sits outside the panels, so it needs telling which topic is on screen. */
export function ActiveTutorPanel({ names }: { names: Record<string, string> }) {
  const { activeTopicId } = useChapterTopics();
  return <TutorPanel topicTitle={names[activeTopicId] ?? ""} />;
}

/**
 * Reading history follows what is on screen rather than what was fetched — otherwise
 * pre-rendering the whole chapter would mark every topic in it as read at once.
 */
export function ActiveTopicRecorder() {
  const { activeTopicId } = useChapterTopics();
  useEffect(() => {
    void recordTopicView(activeTopicId);
  }, [activeTopicId]);
  return null;
}
