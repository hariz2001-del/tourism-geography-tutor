import type { Citation } from "../course-brain/types";

export type TutorQuestion = {
  question: string;
  topicId: string;
};

export type GroundedTutorAnswer = {
  kind: "grounded";
  text: string;
  citations: Citation[];
};

export type OutOfScopeTutorAnswer = {
  kind: "out_of_scope";
  text: string;
  citations: [];
};

export type TutorAnswer = GroundedTutorAnswer | OutOfScopeTutorAnswer;
