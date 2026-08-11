import { z } from "zod";

export const quizAnswerRequestSchema = z.object({
  quizId: z.string().uuid("quizId must be a UUID"),
  optionId: z.string().uuid("optionId must be a UUID"),
});

export const subjectiveQuizRequestSchema = z.object({
  quizId: z.string().uuid("quizId must be a UUID"),
  answer: z.string().trim().min(1, "answer is required").max(10000, "answer must be 10,000 characters or fewer"),
});
