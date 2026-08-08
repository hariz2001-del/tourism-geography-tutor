import { z } from "zod";

export const tutorRequestSchema = z.object({
  question: z.string({ error: "question is required" }).trim().min(1, "question is required").max(500, "question is too long"),
});

export type TutorRequest = z.infer<typeof tutorRequestSchema>;
