"use client";

import { useMemo, useState, useTransition } from "react";
import CitationCard from "@/components/tutor/citation-card";
import { toggleBookmark } from "@/app/bookmark-actions";
import type { Chapter, Flashcard } from "@/lib/course-brain/types";

type Rating = "known" | "review";

function shuffled<T>(values: T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function filteredCards(cards: Flashcard[], chapterCode: string, topicId: string): Flashcard[] {
  return cards.filter((card) =>
    (chapterCode === "all" || card.chapterCode === chapterCode)
    && (topicId === "all" || card.topicId === topicId),
  );
}

export default function FlashcardDeck({
  cards,
  chapters,
  initialChapterCode,
  initialTopicId,
  savesMarkedCards = false,
}: {
  cards: Flashcard[];
  chapters: Chapter[];
  initialChapterCode?: string;
  initialTopicId?: string;
  // True only for a signed-in learner. Marking a card for review then also saves
  // it, so the session's outcome outlives the session.
  savesMarkedCards?: boolean;
}) {
  const requestedTopic = initialTopicId && cards.some((card) => card.topicId === initialTopicId)
    ? initialTopicId
    : "all";
  const requestedChapter = initialChapterCode && cards.some((card) => card.chapterCode === initialChapterCode)
    ? initialChapterCode
    : requestedTopic === "all"
      ? "all"
      : cards.find((card) => card.topicId === requestedTopic)?.chapterCode ?? "all";
  const [chapterCode, setChapterCode] = useState(requestedChapter);
  const [topicId, setTopicId] = useState(requestedTopic);
  const [deck, setDeck] = useState(() => filteredCards(cards, requestedChapter, requestedTopic));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const topics = useMemo(() => {
    const seen = new Set<string>();
    return cards
      .filter((card) => chapterCode === "all" || card.chapterCode === chapterCode)
      .filter((card) => {
        if (seen.has(card.topicId)) return false;
        seen.add(card.topicId);
        return true;
      })
      .map((card) => ({ id: card.topicId, name: card.topicName }));
  }, [cards, chapterCode]);

  function startSession(nextDeck: Flashcard[]) {
    setDeck(nextDeck);
    setCurrentIndex(0);
    setIsRevealed(false);
    setRatings({});
    setIsComplete(false);
  }

  function selectChapter(nextChapterCode: string) {
    setChapterCode(nextChapterCode);
    setTopicId("all");
    startSession(filteredCards(cards, nextChapterCode, "all"));
  }

  function selectTopic(nextTopicId: string) {
    setTopicId(nextTopicId);
    startSession(filteredCards(cards, chapterCode, nextTopicId));
  }

  function rateCurrent(rating: Rating) {
    const current = deck[currentIndex];
    if (!current) return;
    setRatings((existing) => ({ ...existing, [current.id]: rating }));
    if (savesMarkedCards) {
      // A card marked for review is saved; "Got it" clears any earlier save, so
      // the saved list tracks what the learner currently finds difficult.
      startSaving(async () => {
        await toggleBookmark(current.id, "flashcard", rating === "review");
      });
    }
    if (currentIndex === deck.length - 1) {
      setIsComplete(true);
      return;
    }
    setCurrentIndex((index) => index + 1);
    setIsRevealed(false);
  }

  const reviewedCount = Object.keys(ratings).length;
  const knownCount = Object.values(ratings).filter((rating) => rating === "known").length;
  const reviewCards = deck.filter((card) => ratings[card.id] === "review");
  const current = deck[currentIndex];

  return (
    <div className="space-y-6">
      <section aria-label="Choose flashcards" className="grid gap-4 rounded-card border border-graticule bg-surface p-4 sm:grid-cols-2">
        <label className="space-y-1.5 font-medium text-ink-strong">
          <span className="block">Chapter</span>
          <select
            className="min-h-11 w-full rounded-card border border-graticule bg-chart px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            onChange={(event) => selectChapter(event.target.value)}
            value={chapterCode}
          >
            <option value="all">All chapters</option>
            {chapters.map((chapter) => <option key={chapter.code} value={chapter.code}>{chapter.code}: {chapter.title}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 font-medium text-ink-strong">
          <span className="block">Topic</span>
          <select
            className="min-h-11 w-full rounded-card border border-graticule bg-chart px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            onChange={(event) => selectTopic(event.target.value)}
            value={topicId}
          >
            <option value="all">All topics</option>
            {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
          </select>
        </label>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-mono text-sm text-ink-muted">{deck.length} {deck.length === 1 ? "card" : "cards"} in this deck</p>
          <div
            aria-label="Flashcard progress"
            aria-valuemax={deck.length}
            aria-valuemin={0}
            aria-valuenow={reviewedCount}
            className="h-1.5 w-48 overflow-hidden rounded-full bg-graticule"
            role="progressbar"
          >
            <div className="h-full bg-meridian transition-[width]" style={{ width: `${deck.length ? (reviewedCount / deck.length) * 100 : 0}%` }} />
          </div>
        </div>
        <button
          className="inline-flex min-h-11 items-center rounded-card border border-graticule bg-surface px-4 font-medium text-meridian transition-colors hover:border-meridian hover:bg-meridian/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          onClick={() => startSession(shuffled(filteredCards(cards, chapterCode, topicId)))}
          type="button"
        >
          Shuffle deck
        </button>
      </div>

      {isComplete ? (
        <section aria-live="polite" className="space-y-6 rounded-card border border-graticule bg-surface p-6 text-center sm:p-10">
          <div className="space-y-2">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-lowland">Deck complete</p>
            <h2 className="font-display text-3xl font-semibold text-ink-strong">You reviewed {deck.length} {deck.length === 1 ? "idea" : "ideas"}.</h2>
            <p className="text-lg text-ink">You knew {knownCount} and marked {reviewCards.length} to review again.</p>
            {savesMarkedCards && reviewCards.length ? (
              <p aria-busy={isSaving} className="text-ink-muted">
                {isSaving
                  ? "Saving your marked cards…"
                  : "Your marked cards are in Saved material on your dashboard."}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {reviewCards.length ? (
              <button className="inline-flex min-h-11 items-center rounded-card bg-meridian px-5 font-medium text-chart hover:bg-ink-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" onClick={() => startSession(reviewCards)} type="button">
                Review marked cards
              </button>
            ) : null}
            <button className="inline-flex min-h-11 items-center rounded-card border border-graticule bg-chart px-5 font-medium text-meridian hover:border-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" onClick={() => startSession(filteredCards(cards, chapterCode, topicId))} type="button">
              Study deck again
            </button>
          </div>
        </section>
      ) : current ? (
        <section className="overflow-hidden rounded-card border border-graticule bg-surface shadow-[0_18px_50px_-38px_rgba(6,35,43,0.55)]">
          <div className="flex items-center justify-between gap-3 border-b border-graticule bg-chart px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-ink-muted">
            <span>{current.chapterCode} · {current.topicName}</span>
            <span>Card {currentIndex + 1} of {deck.length}</span>
          </div>
          <div className="min-h-[22rem] p-6 sm:p-10">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <p className={`font-mono text-xs font-medium uppercase tracking-[0.14em] ${current.contentType === "key_takeaway" ? "text-lowland" : "text-meridian"}`}>
                {current.contentType === "key_takeaway" ? "Key idea" : "Recall this term"}
              </p>
              <h2 className="mt-5 text-balance font-display text-[2rem]/[1.15] font-semibold text-ink-strong sm:text-[2.75rem]">{current.title}</h2>
              {!isRevealed ? (
                <>
                  <p className="mt-5 max-w-[46ch] text-ink-muted">Explain it in your own words before revealing the answer.</p>
                  <button className="mt-8 inline-flex min-h-12 items-center rounded-card bg-meridian px-6 font-medium text-chart transition-colors hover:bg-ink-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" onClick={() => setIsRevealed(true)} type="button">
                    Show answer
                  </button>
                </>
              ) : (
                <div className="mt-7 w-full space-y-5 text-left" aria-live="polite">
                  <div className="rounded-card border-l-2 border-l-meridian bg-meridian/6 p-5">
                    <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-meridian">Answer</p>
                    <p className="mt-2 text-[1.125rem]/[1.7] text-ink">{current.answer}</p>
                  </div>
                  <CitationCard citation={current.citation} actionLabel="Review this topic" />
                  <fieldset className="space-y-3">
                    <legend className="font-medium text-ink-strong">How well did you know it?</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button className="min-h-12 rounded-card border border-relief bg-relief/6 px-5 font-medium text-relief hover:bg-relief/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relief" onClick={() => rateCurrent("review")} type="button">Review again</button>
                      <button className="min-h-12 rounded-card border border-lowland bg-lowland/8 px-5 font-medium text-lowland hover:bg-lowland/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lowland" onClick={() => rateCurrent("known")} type="button">Got it</button>
                    </div>
                  </fieldset>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <p role="status" className="rounded-card border border-graticule bg-surface p-5 text-ink">No flashcards are available for this selection.</p>
      )}
    </div>
  );
}
