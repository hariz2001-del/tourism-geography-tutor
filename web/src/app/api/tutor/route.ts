import { answerQuestion } from "@/lib/tutor/grounding";
import { answerWithLlmFallback } from "@/lib/tutor/llm-fallback";
import { tutorRequestSchema } from "@/lib/tutor/schema";
import type { CourseBrainRepository } from "@/lib/course-brain/repository";
import { createServerCourseBrainRepository } from "@/lib/supabase/server";

type TutorRepository = Pick<CourseBrainRepository, "getAllPublishedContent">;

export function createTutorRouteHandler(createRepository: () => TutorRepository) {
  return async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try { body = await request.json(); } catch { return Response.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
    const parsed = tutorRequestSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid tutor request." }, { status: 400 });
    try {
      const repository = createRepository();
      const units = await repository.getAllPublishedContent();
      const answer = answerQuestion({ question: parsed.data.question }, units);
      const finalAnswer = answer.kind === "out_of_scope"
        ? await answerWithLlmFallback(parsed.data.question, units, answer)
        : answer;
      return Response.json({ data: finalAnswer });
    } catch (error) {
      if (error instanceof Error && error.message === "Course Brain is not configured.") {
        return Response.json({ error: "The Course Brain is not configured." }, { status: 503 });
      }
      return Response.json({ error: "The Course Brain is temporarily unavailable." }, { status: 503 });
    }
  };
}

export const POST = createTutorRouteHandler(createServerCourseBrainRepository);
