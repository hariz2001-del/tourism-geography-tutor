import { quizAnswerRequestSchema } from "@/lib/course-brain/quiz-schema";
import type { CourseBrainRepository } from "@/lib/course-brain/repository";
import { createServerOnlyCourseBrainRepository } from "@/lib/supabase/server";
import { withSignedIn } from "@/lib/auth/api-guard";

type AnswerRepository = Pick<CourseBrainRepository, "checkApprovedQuizAnswer">;

export function createQuizAnswerRouteHandler(createRepository: () => AnswerRepository) {
  return async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try { body = await request.json(); } catch { return Response.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
    const parsed = quizAnswerRequestSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid quiz answer." }, { status: 400 });
    try {
      const feedback = await createRepository().checkApprovedQuizAnswer(parsed.data.quizId, parsed.data.optionId);
      if (!feedback) return Response.json({ error: "Quiz question or option is unavailable." }, { status: 404 });
      return Response.json({ data: feedback });
    } catch (error) {
      if (error instanceof Error && error.message === "Course Brain is not configured.") {
        return Response.json({ error: "The Course Brain is not configured." }, { status: 503 });
      }
      return Response.json({ error: "The Course Brain is temporarily unavailable." }, { status: 503 });
    }
  };
}

export const POST = withSignedIn(createQuizAnswerRouteHandler(createServerOnlyCourseBrainRepository));
