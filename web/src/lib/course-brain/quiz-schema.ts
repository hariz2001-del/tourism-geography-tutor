import { z } from "zod";

export const quizAnswerRequestSchema = z.object({
  quizId: z.string().uuid("quizId must be a UUID"),
  optionId: z.string().uuid("optionId must be a UUID"),
});
