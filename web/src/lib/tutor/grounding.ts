import type { PublishedContentUnit } from "../course-brain/types";
import type { TutorAnswer, TutorQuestion } from "./types";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "does", "for", "how", "in", "is", "of", "the",
  "to", "what", "when", "where", "which", "with",
]);

function terms(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((term) => !STOP_WORDS.has(term)) ?? [],
  );
}

function overlap(questionTerms: Set<string>, unit: PublishedContentUnit): number {
  const unitTerms = terms(`${unit.title} ${unit.body}`);
  return [...questionTerms].filter((term) => unitTerms.has(term)).length;
}

export function answerQuestion(
  input: TutorQuestion,
  units: PublishedContentUnit[],
): TutorAnswer {
  const questionTerms = terms(input.question);
  const supported = units
    .map((unit) => ({ unit, score: overlap(questionTerms, unit) }))
    .filter(({ score }) => score >= 2)
    .sort((left, right) => right.score - left.score);

  const best = supported[0]?.unit;
  if (!best) {
    return {
      kind: "out_of_scope",
      text: "I could not find a confident answer to that. Try rephrasing the question or asking about a more specific Tourism Geography topic.",
      citations: [],
    };
  }

  return {
    kind: "grounded",
    text: best.body,
    citations: [best.citation],
  };
}
