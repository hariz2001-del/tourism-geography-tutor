export type Citation = {
  sourceFile: string;
  chapterLabel: string;
  pageOrSlide: number;
  chapterCode?: string;
  topicId?: string;
  contentUnitId?: string;
};

export type ChapterTopic = {
  id: string;
  name: string;
  summary: string | null;
  displayOrder: number;
};

export type Chapter = {
  code: string;
  title: string;
  displayOrder: number;
};

export type PublishedContentUnit = {
  id: string;
  topicId: string;
  title: string;
  body: string;
  contentType: string;
  citation: Citation;
};

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  explanation: string;
  options: QuizOption[];
  citation: Citation;
};

export type ExamQuestionScope =
  | { type: "topic"; id: string }
  | { type: "chapter"; code: string }
  | { type: "course" };

export type ExamQuestion = {
  id: string;
  topicId: string;
  sourceContentUnitId: string;
  questionType: "mcq" | "subjective";
  question: string;
  difficulty: "introductory" | "intermediate" | "application";
  maxMarks: number;
  options: QuizOption[];
  citation: Citation;
};

export type QuizAnswerFeedback = {
  isCorrect: boolean;
  explanation: string;
};

// This shape is deliberately server-only. It contains reviewed marking material
// and must never be passed to a Client Component or returned by a public API.
export type SubjectiveMarkingContext = {
  id: string;
  question: string;
  maxMarks: number;
  answerScheme: string;
  criteria: Array<{
    id: string;
    criterion: string;
    marks: number;
    acceptedConcepts: string[];
    acceptedSynonyms: string[];
    sourceUnit: PublishedContentUnit;
  }>;
};

export type SubjectiveGrade = {
  awardedMarks: number;
  maxMarks: number;
  criteria: Array<{
    awardedMarks: number;
    maxMarks: number;
    feedback: string;
    citations: Citation[];
  }>;
};
