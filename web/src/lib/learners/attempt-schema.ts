import { z } from "zod";

export const attemptSubmissionSchema = z.object({
  mode: z.enum(["topic", "chapter", "course"]),
  scopeValue: z.string().min(1).nullable(),
  scopeLabel: z.string().trim().min(1).max(120),
  answers: z
    .array(
      z.union([
        z.object({
          questionId: z.string().uuid("questionId must be a UUID"),
          questionType: z.literal("mcq"),
          optionId: z.string().uuid("optionId must be a UUID"),
        }),
        z.object({
          questionId: z.string().uuid("questionId must be a UUID"),
          questionType: z.literal("subjective"),
          answer: z.string().trim().min(1, "answer is required").max(10000),
        }),
      ]),
    )
    .min(1, "an assessment needs at least one answer")
    .max(50, "an assessment cannot exceed 50 questions"),
});

export type AttemptSubmission = z.infer<typeof attemptSubmissionSchema>;
