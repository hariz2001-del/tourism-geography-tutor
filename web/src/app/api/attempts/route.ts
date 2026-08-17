import { getProfile } from "@/lib/auth/session";
import { attemptSubmissionSchema } from "@/lib/learners/attempt-schema";
import { loadOptionTexts, loadQuestionRecords, recordAttempt, type RecordedAnswer } from "@/lib/learners/attempts";
import type { AttemptAnswerFeedback } from "@/lib/learners/types";
import { gradeSubjectiveAnswer } from "@/lib/quiz/subjective-grader";
import { createServerOnlyCourseBrainRepository } from "@/lib/supabase/server";

/**
 * Marks a whole assessment in one request and, for a signed-in learner, records
 * the result.
 *
 * Marking happens here rather than in the browser: the client used to compute
 * its own total from per-question responses, which is fine for display but is
 * not something a stored score can be based on. Marks come from the database.
 *
 * Anonymous visitors get marked and receive their results as before; nothing is
 * persisted for them, and the assessment stays open without an account.
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = attemptSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid submission." }, { status: 400 });
  }
  const submission = parsed.data;

  try {
    const repository = createServerOnlyCourseBrainRepository();
    const questionIds = submission.answers.map((answer) => answer.questionId);
    const [records, optionTexts] = await Promise.all([
      loadQuestionRecords(questionIds),
      loadOptionTexts(
        submission.answers.flatMap((answer) => (answer.questionType === "mcq" ? [answer.optionId] : [])),
      ),
    ]);

    const recorded: RecordedAnswer[] = [];

    for (const [index, answer] of submission.answers.entries()) {
      const record = records.get(answer.questionId);
      if (!record || record.questionType !== answer.questionType) {
        return Response.json({ error: "One of those questions is no longer available." }, { status: 404 });
      }

      if (answer.questionType === "mcq") {
        const feedback = await repository.checkApprovedQuizAnswer(answer.questionId, answer.optionId);
        if (!feedback) {
          return Response.json({ error: "One of those answers could not be checked." }, { status: 404 });
        }
        const detail: AttemptAnswerFeedback = {
          isCorrect: feedback.isCorrect,
          explanation: feedback.explanation,
          answerScheme: feedback.answerScheme,
          selectedOptionText: optionTexts.get(answer.optionId),
          citation: record.citation,
        };
        recorded.push({
          questionId: record.id,
          topicId: record.topicId,
          chapterCode: record.chapterCode,
          questionText: record.question,
          questionType: "mcq",
          displayOrder: index + 1,
          selectedOptionId: answer.optionId,
          answerText: null,
          awardedMarks: feedback.isCorrect ? record.maxMarks : 0,
          maxMarks: record.maxMarks,
          feedback: detail,
        });
        continue;
      }

      const context = await repository.getSubjectiveQuestionMarkingContext(answer.questionId);
      if (!context) {
        return Response.json({ error: "One of those written questions could not be marked." }, { status: 404 });
      }
      const grade = await gradeSubjectiveAnswer(answer.answer, context);
      recorded.push({
        questionId: record.id,
        topicId: record.topicId,
        chapterCode: record.chapterCode,
        questionText: record.question,
        questionType: "subjective",
        displayOrder: index + 1,
        selectedOptionId: null,
        answerText: answer.answer,
        awardedMarks: grade.awardedMarks,
        maxMarks: grade.maxMarks,
        feedback: {
          answerScheme: grade.answerScheme,
          criteria: grade.criteria,
          citation: record.citation,
        },
      });
    }

    const awardedMarks = recorded.reduce((sum, answer) => sum + answer.awardedMarks, 0);
    const totalMarks = recorded.reduce((sum, answer) => sum + answer.maxMarks, 0);

    const profile = await getProfile();
    const attemptId = profile?.role === "student"
      ? await recordAttempt({
          studentId: profile.id,
          mode: submission.mode,
          scopeValue: submission.mode === "course" ? null : submission.scopeValue,
          scopeLabel: submission.scopeLabel,
          awardedMarks,
          totalMarks,
          answers: recorded,
        })
      : null;

    return Response.json({
      data: {
        attemptId,
        awardedMarks,
        totalMarks,
        // Keyed by question so the runner can render each result in place.
        results: Object.fromEntries(
          recorded.map((answer) => [answer.questionId, {
            awardedMarks: answer.awardedMarks,
            maxMarks: answer.maxMarks,
            ...answer.feedback,
          }]),
        ),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Course Brain is not configured.") {
      return Response.json({ error: "The Course Brain is not configured." }, { status: 503 });
    }
    return Response.json({ error: "Your answers could not be submitted." }, { status: 503 });
  }
}
