import { attemptPercentage, groupAttemptsByScope, percentage, summariseAttempts, topicAccuracy, weakestTopics } from "./metrics";
import type { AttemptAnswerRecord, AttemptSummary } from "./types";

function attempt(overrides: Partial<AttemptSummary> & { id: string; submittedAt: string }): AttemptSummary {
  return {
    mode: "topic",
    scopeValue: "topic-1",
    scopeLabel: "Topic quiz",
    awardedMarks: 5,
    totalMarks: 10,
    questionCount: 5,
    ...overrides,
  };
}

function answer(overrides: Partial<AttemptAnswerRecord> & { id: string }): AttemptAnswerRecord {
  return {
    displayOrder: 1,
    questionText: "Question",
    questionType: "mcq",
    topicId: "topic-1",
    chapterCode: "CH1",
    answerText: null,
    selectedOptionId: "option-1",
    awardedMarks: 1,
    maxMarks: 1,
    feedback: {},
    ...overrides,
  };
}

describe("percentage", () => {
  it("rounds to a whole percent", () => {
    expect(percentage(2, 3)).toBe(67);
  });

  it("treats a zero-mark assessment as zero rather than dividing by zero", () => {
    expect(percentage(0, 0)).toBe(0);
  });
});

describe("summariseAttempts", () => {
  it("reports nothing for a learner who has not been assessed", () => {
    expect(summariseAttempts([])).toEqual({
      attemptCount: 0, best: null, latest: null, averagePercentage: null,
    });
  });

  it("separates the best score from the most recent one", () => {
    const attempts = [
      attempt({ id: "a", submittedAt: "2026-08-01T10:00:00Z", awardedMarks: 9, totalMarks: 10 }),
      attempt({ id: "b", submittedAt: "2026-08-03T10:00:00Z", awardedMarks: 4, totalMarks: 10 }),
    ];

    const summary = summariseAttempts(attempts);

    // A retake that went badly must not erase the learner's best result.
    expect(summary.best?.id).toBe("a");
    expect(summary.latest?.id).toBe("b");
    expect(summary.attemptCount).toBe(2);
    expect(summary.averagePercentage).toBe(65);
  });

  it("prefers the more recent attempt when two score the same", () => {
    const attempts = [
      attempt({ id: "older", submittedAt: "2026-08-01T10:00:00Z", awardedMarks: 5, totalMarks: 10 }),
      attempt({ id: "newer", submittedAt: "2026-08-05T10:00:00Z", awardedMarks: 5, totalMarks: 10 }),
    ];

    expect(summariseAttempts(attempts).best?.id).toBe("newer");
  });
});

describe("groupAttemptsByScope", () => {
  it("keeps separate assessments apart and orders by most recent activity", () => {
    const groups = groupAttemptsByScope([
      attempt({ id: "t1", submittedAt: "2026-08-01T10:00:00Z" }),
      attempt({ id: "t2", submittedAt: "2026-08-04T10:00:00Z", awardedMarks: 8 }),
      attempt({ id: "c1", submittedAt: "2026-08-02T10:00:00Z", mode: "course", scopeValue: null, scopeLabel: "Full course exam" }),
    ]);

    expect(groups.map((group) => group.key)).toEqual(["topic:topic-1", "course:"]);
    expect(groups[0].attempts).toHaveLength(2);
    expect(groups[0].best.id).toBe("t2");
    expect(groups[0].latest.id).toBe("t2");
  });
});

describe("topicAccuracy", () => {
  const topicNames = new Map([
    ["topic-1", { name: "Climate", chapterCode: "CH3" }],
    ["topic-2", { name: "Landforms", chapterCode: "CH4" }],
  ]);

  it("aggregates marks per topic and orders weakest first", () => {
    const result = topicAccuracy([
      answer({ id: "1", topicId: "topic-1", awardedMarks: 1, maxMarks: 1 }),
      answer({ id: "2", topicId: "topic-1", awardedMarks: 0, maxMarks: 1 }),
      answer({ id: "3", topicId: "topic-2", awardedMarks: 0, maxMarks: 4 }),
    ], topicNames);

    expect(result.map((topic) => [topic.topicName, topic.accuracy])).toEqual([
      ["Landforms", 0],
      ["Climate", 50],
    ]);
  });

  it("drops answers whose topic no longer exists instead of inventing a bucket", () => {
    const result = topicAccuracy([
      answer({ id: "1", topicId: null }),
      answer({ id: "2", topicId: "deleted-topic" }),
      answer({ id: "3", topicId: "topic-1" }),
    ], topicNames);

    expect(result).toHaveLength(1);
    expect(result[0].topicId).toBe("topic-1");
  });
});

describe("weakestTopics", () => {
  it("only surfaces topics below the revisit threshold", () => {
    const accuracies = [
      { topicId: "a", topicName: "A", chapterCode: "CH1", awardedMarks: 1, totalMarks: 10, accuracy: 10 },
      { topicId: "b", topicName: "B", chapterCode: "CH1", awardedMarks: 9, totalMarks: 10, accuracy: 90 },
    ];

    expect(weakestTopics(accuracies).map((topic) => topic.topicId)).toEqual(["a"]);
  });

  it("caps how many it recommends", () => {
    const accuracies = Array.from({ length: 6 }, (_, index) => ({
      topicId: `t${index}`, topicName: `T${index}`, chapterCode: "CH1",
      awardedMarks: 0, totalMarks: 10, accuracy: index,
    }));

    expect(weakestTopics(accuracies)).toHaveLength(3);
  });
});

describe("attemptPercentage", () => {
  it("scores an attempt out of its own total", () => {
    expect(attemptPercentage(attempt({ id: "a", submittedAt: "2026-08-01T10:00:00Z", awardedMarks: 3, totalMarks: 4 }))).toBe(75);
  });
});
