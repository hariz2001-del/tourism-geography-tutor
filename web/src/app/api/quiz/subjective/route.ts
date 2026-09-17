import { subjectiveQuizRequestSchema } from "@/lib/course-brain/quiz-schema";
import type { CourseBrainRepository } from "@/lib/course-brain/repository";
import { gradeSubjectiveAnswer } from "@/lib/quiz/subjective-grader";
import { createServerOnlyCourseBrainRepository } from "@/lib/supabase/server";
import { withSignedIn } from "@/lib/auth/api-guard";

type SubjectiveRepository = Pick<CourseBrainRepository, "getSubjectiveQuestionMarkingContext">;

export function createSubjectiveQuizRouteHandler(createRepository: () => SubjectiveRepository) {
  return async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try { body = await request.json(); } catch { return Response.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
    const parsed = subjectiveQuizRequestSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid subjective quiz answer." }, { status: 400 });
    try {
      const context = await createRepository().getSubjectiveQuestionMarkingContext(parsed.data.quizId);
      if (!context) return Response.json({ error: "Subjective quiz question is unavailable." }, { status: 404 });
      return Response.json({ data: await gradeSubjectiveAnswer(parsed.data.answer, context) });
    } catch (error) {
      if (error instanceof Error && error.message === "Course Brain is not configured.") return Response.json({ error: "The Course Brain is not configured." }, { status: 503 });
      return Response.json({ error: "The Course Brain is temporarily unavailable." }, { status: 503 });
    }
  };
}

export const POST = withSignedIn(createSubjectiveQuizRouteHandler(createServerOnlyCourseBrainRepository));
