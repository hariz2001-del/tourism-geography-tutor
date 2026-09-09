import type { CourseBrainRepository } from "@/lib/course-brain/repository";
import type { ExamQuestion } from "@/lib/course-brain/types";

/**
 * How many questions each chapter contributes to a course-wide paper.
 *
 * Remainders go to the earliest chapters, so 20 across 3 chapters is 7/7/6
 * rather than 6/6/6 and a missing pair.
 */
export function chapterShares(total: number, chapterCount: number): number[] {
  if (chapterCount <= 0 || total <= 0) return [];
  const base = Math.floor(total / chapterCount);
  const remainder = total % chapterCount;
  return Array.from({ length: chapterCount }, (_, index) => base + (index < remainder ? 1 : 0));
}

/** One paper, not four chapter blocks in a row. */
function shuffled(questions: ExamQuestion[]): ExamQuestion[] {
  const order = [...questions];
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return order;
}

/**
 * A course paper drawn chapter by chapter rather than from one pool.
 *
 * Chapters do not hold equal numbers of generated questions — at the time of
 * writing the smallest holds 18 objective questions and the largest 41 — so a
 * single course-wide draw can over-sample the largest chapter and miss the
 * smallest one entirely. A full course exam should ask about the whole course,
 * so each chapter contributes its own share.
 *
 * A chapter that cannot fill its share does not fail the paper: the shortfall is
 * topped up from the course-wide pool, skipping questions already drawn. That
 * keeps the exam available while the lecturer's review moves questions in and
 * out of the approved set.
 */
export async function drawCoursePaper(repository: CourseBrainRepository, total: number): Promise<ExamQuestion[]> {
  const chapters = await repository.listChapters();
  if (chapters.length === 0) return [];

  const shares = chapterShares(total, chapters.length);
  const drawn = await Promise.all(
    chapters.map((chapter, index) =>
      repository.getPublicExamQuestionBatch({ type: "chapter", code: chapter.code }, "mcq", shares[index]),
    ),
  );

  const questions = drawn.flat();
  if (questions.length < total) {
    const seen = new Set(questions.map((question) => question.id));
    const topUp = await repository.getPublicExamQuestionBatch({ type: "course" }, "mcq", total);
    for (const question of topUp) {
      if (questions.length >= total) break;
      if (!seen.has(question.id)) {
        seen.add(question.id);
        questions.push(question);
      }
    }
  }

  return shuffled(questions).slice(0, total);
}
