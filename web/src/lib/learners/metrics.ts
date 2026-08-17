import type { AttemptAnswerRecord, AttemptSummary, TopicAccuracy } from "./types";

export function percentage(awardedMarks: number, totalMarks: number): number {
  if (totalMarks <= 0) return 0;
  return Math.round((awardedMarks / totalMarks) * 100);
}

export function attemptPercentage(attempt: AttemptSummary): number {
  return percentage(attempt.awardedMarks, attempt.totalMarks);
}

/**
 * A retake is meant to "fix" a score, so a learner needs both numbers: the best
 * they have managed and the most recent thing they did. Ties on percentage fall
 * back to the more recent attempt.
 */
export function summariseAttempts(attempts: AttemptSummary[]): {
  attemptCount: number;
  best: AttemptSummary | null;
  latest: AttemptSummary | null;
  averagePercentage: number | null;
} {
  if (attempts.length === 0) {
    return { attemptCount: 0, best: null, latest: null, averagePercentage: null };
  }

  const byNewest = [...attempts].sort(
    (a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt),
  );

  const best = byNewest.reduce((leader, candidate) =>
    attemptPercentage(candidate) > attemptPercentage(leader) ? candidate : leader,
  );

  const average = Math.round(
    attempts.reduce((sum, attempt) => sum + attemptPercentage(attempt), 0) / attempts.length,
  );

  return { attemptCount: attempts.length, best, latest: byNewest[0], averagePercentage: average };
}

/** Groups attempts by what was assessed, so "retake this one" has a stable identity. */
export function groupAttemptsByScope(attempts: AttemptSummary[]): Array<{
  key: string;
  mode: AttemptSummary["mode"];
  scopeValue: string | null;
  scopeLabel: string;
  attempts: AttemptSummary[];
  best: AttemptSummary;
  latest: AttemptSummary;
}> {
  const groups = new Map<string, AttemptSummary[]>();

  for (const attempt of attempts) {
    const key = `${attempt.mode}:${attempt.scopeValue ?? ""}`;
    groups.set(key, [...(groups.get(key) ?? []), attempt]);
  }

  return [...groups.entries()]
    .map(([key, grouped]) => {
      const { best, latest } = summariseAttempts(grouped);
      return {
        key,
        mode: grouped[0].mode,
        scopeValue: grouped[0].scopeValue,
        scopeLabel: grouped[0].scopeLabel,
        attempts: [...grouped].sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt)),
        best: best as AttemptSummary,
        latest: latest as AttemptSummary,
      };
    })
    .sort((a, b) => Date.parse(b.latest.submittedAt) - Date.parse(a.latest.submittedAt));
}

/**
 * Rolls recorded answers up per topic. Answers whose topic was deleted are
 * dropped rather than bucketed under a null topic, so the figures stay honest.
 */
export function topicAccuracy(
  answers: AttemptAnswerRecord[],
  topicNames: Map<string, { name: string; chapterCode: string }>,
): TopicAccuracy[] {
  const totals = new Map<string, { awardedMarks: number; totalMarks: number }>();

  for (const answer of answers) {
    if (!answer.topicId) continue;
    const running = totals.get(answer.topicId) ?? { awardedMarks: 0, totalMarks: 0 };
    totals.set(answer.topicId, {
      awardedMarks: running.awardedMarks + answer.awardedMarks,
      totalMarks: running.totalMarks + answer.maxMarks,
    });
  }

  return [...totals.entries()]
    .flatMap(([topicId, marks]) => {
      const topic = topicNames.get(topicId);
      if (!topic) return [];
      return [{
        topicId,
        topicName: topic.name,
        chapterCode: topic.chapterCode,
        awardedMarks: marks.awardedMarks,
        totalMarks: marks.totalMarks,
        accuracy: percentage(marks.awardedMarks, marks.totalMarks),
      }];
    })
    .sort((a, b) => a.accuracy - b.accuracy || a.topicName.localeCompare(b.topicName));
}

/** Only surfaces topics actually worth revisiting, so the prompt stays actionable. */
export function weakestTopics(accuracies: TopicAccuracy[], limit = 3, threshold = 80): TopicAccuracy[] {
  return accuracies.filter((topic) => topic.accuracy < threshold).slice(0, limit);
}
