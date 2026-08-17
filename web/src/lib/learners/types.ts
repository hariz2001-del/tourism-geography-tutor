import type { Citation } from "@/lib/course-brain/types";

export type AssessmentMode = "topic" | "chapter" | "course";

export type SavedBookmark = {
  id: string;
  contentUnitId: string;
  source: "content" | "flashcard";
  createdAt: string;
  title: string;
  body: string;
  contentType: string;
  topicId: string;
  topicName: string;
  chapterCode: string;
  chapterTitle: string;
  citation: Citation;
};

export type StudiedTopic = {
  topicId: string;
  topicName: string;
  chapterCode: string;
  chapterTitle: string;
  firstViewedAt: string;
  lastViewedAt: string;
  viewCount: number;
};

export type AttemptSummary = {
  id: string;
  mode: AssessmentMode;
  scopeValue: string | null;
  scopeLabel: string;
  awardedMarks: number;
  totalMarks: number;
  questionCount: number;
  submittedAt: string;
};

export type AttemptAnswerRecord = {
  id: string;
  displayOrder: number;
  questionText: string;
  questionType: "mcq" | "subjective";
  topicId: string | null;
  chapterCode: string | null;
  answerText: string | null;
  selectedOptionId: string | null;
  awardedMarks: number;
  maxMarks: number;
  feedback: AttemptAnswerFeedback;
};

// Mirrors what ExamRunner renders at submission time, stored verbatim so a past
// attempt replays exactly as it was marked.
export type AttemptAnswerFeedback = {
  isCorrect?: boolean;
  explanation?: string;
  answerScheme?: string;
  selectedOptionText?: string;
  citation?: Citation;
  criteria?: Array<{
    awardedMarks: number;
    maxMarks: number;
    feedback: string;
    citations: Citation[];
  }>;
};

export type AttemptDetail = AttemptSummary & { answers: AttemptAnswerRecord[] };

export type TopicAccuracy = {
  topicId: string;
  topicName: string;
  chapterCode: string;
  awardedMarks: number;
  totalMarks: number;
  accuracy: number;
};

export type ClassroomStudent = {
  id: string;
  username: string;
  displayName: string;
  attemptCount: number;
  bestPercentage: number | null;
  latestPercentage: number | null;
  averagePercentage: number | null;
  lastActiveAt: string | null;
};
