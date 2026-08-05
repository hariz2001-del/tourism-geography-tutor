import { z } from "zod";

export const tutorRequestSchema = z.object({
  chapterCode: z.string().regex(/^CH[0-9]+$/, "chapterCode must be a chapter code"),
  topicId: z.string().trim().min(1, "topicId is required"),
  question: z.string({ error: "question is required" }).trim().min(1, "question is required").max(500, "question is too long"),
});

export type TutorRequest = z.infer<typeof tutorRequestSchema>;
