import type {
  Chapter,
  ChapterTopic,
  ExamQuestion,
  ExamQuestionScope,
  PublishedContentUnit,
  QuizAnswerFeedback,
  QuizQuestion,
  SubjectiveMarkingContext,
} from "./types";

type QueryResult = { data: unknown; error: { message: string } | null };

type QuerySource = { select(columns: string): QueryBuilder };
type QueryBuilder = {
  select(columns: string): QueryBuilder;
  eq(field: string, value: unknown): QueryBuilder;
  order(field: string, options?: { ascending?: boolean }): QueryBuilder;
  returns?(): Promise<QueryResult>;
};

export type SupabaseQueryAdapter = {
  from(table: string): QuerySource;
  rpc(functionName: string, parameters?: Record<string, unknown>): Promise<QueryResult>;
};

function requireData(result: QueryResult): unknown {
  if (result.error) throw new Error(`Course Brain query failed: ${result.error.message}`);
  return result.data ?? [];
}

async function execute(query: QueryBuilder): Promise<QueryResult> {
  if (query.returns) return query.returns();
  return query as unknown as Promise<QueryResult>;
}

function rows(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? data as Record<string, unknown>[] : [];
}

function shuffled<T>(values: T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function citationFrom(row: Record<string, unknown>) {
  const references = row.source_references;
  const reference = Array.isArray(references) ? references[0] : references;
  if (!reference || typeof reference !== "object") {
    throw new Error("Published Course Brain content requires a source reference.");
  }
  const source = reference as Record<string, unknown>;
  return { sourceFile: String(source.source_file), chapterLabel: String(source.chapter_label), pageOrSlide: Number(source.page_or_slide) };
}

function chapterCodeFrom(row: Record<string, unknown>): string {
  const topicsValue = row.topics;
  const topic = Array.isArray(topicsValue) ? topicsValue[0] : topicsValue;
  if (!topic || typeof topic !== "object") return "";
  const chaptersValue = (topic as Record<string, unknown>).chapters;
  const chapter = Array.isArray(chaptersValue) ? chaptersValue[0] : chaptersValue;
  if (!chapter || typeof chapter !== "object") return "";
  return String((chapter as Record<string, unknown>).code ?? "");
}

export function createCourseBrainRepository(client: SupabaseQueryAdapter) {
  return {
    async listChapters(): Promise<Chapter[]> {
      const result = await execute(client.from("chapters")
        .select("code, title, display_order")
        .order("display_order"));
      return rows(requireData(result)).map((row) => ({
        code: String(row.code), title: String(row.title), displayOrder: Number(row.display_order),
      }));
    },

    async listChapterTopics(chapterCode: string): Promise<ChapterTopic[]> {
      const result = await execute(client.from("topics")
        .select("id, name, summary, display_order, chapters!inner(code)")
        .eq("chapters.code", chapterCode)
        .order("display_order"));
      return rows(requireData(result)).map((row) => ({
        id: String(row.id), name: String(row.name), summary: row.summary === null ? null : String(row.summary), displayOrder: Number(row.display_order),
      }));
    },

    async getPublishedTopicContent(topicId: string): Promise<PublishedContentUnit[]> {
      const result = await execute(client.from("content_units")
        .select("id, topic_id, title, body, content_type, source_references(source_file, chapter_label, page_or_slide)")
        .eq("topic_id", topicId)
        .eq("status", "published")
        .order("created_at"));
      return rows(requireData(result)).map((row) => ({
        id: String(row.id), topicId: String(row.topic_id), title: String(row.title), body: String(row.body), contentType: String(row.content_type), citation: citationFrom(row),
      }));
    },

    /**
     * Every published unit in one chapter, in one round trip. The chapter page renders all
     * of its topics at once so that switching between them costs nothing, and doing that
     * with one query per topic would have traded a slow click for a slow first load.
     */
    async getPublishedChapterContent(chapterCode: string): Promise<PublishedContentUnit[]> {
      const result = await execute(client.from("content_units")
        .select("id, topic_id, title, body, content_type, source_references(source_file, chapter_label, page_or_slide), topics!inner(chapters!inner(code))")
        .eq("topics.chapters.code", chapterCode)
        .eq("status", "published")
        .order("created_at"));
      return rows(requireData(result)).map((row) => ({
        id: String(row.id), topicId: String(row.topic_id), title: String(row.title), body: String(row.body), contentType: String(row.content_type), citation: citationFrom(row),
      }));
    },

    async getAllPublishedContent(): Promise<PublishedContentUnit[]> {
      const result = await execute(client.from("content_units")
        .select("id, topic_id, title, body, content_type, source_references(source_file, chapter_label, page_or_slide), topics(chapter_id, chapters(code))")
        .eq("status", "published")
        .order("created_at"));
      return rows(requireData(result)).map((row) => ({
        id: String(row.id), topicId: String(row.topic_id), title: String(row.title), body: String(row.body), contentType: String(row.content_type),
        citation: { ...citationFrom(row), chapterCode: chapterCodeFrom(row), topicId: String(row.topic_id), contentUnitId: String(row.id) },
      }));
    },

    async getApprovedTopicQuiz(topicId: string): Promise<QuizQuestion | null> {
      const result = await client.rpc("get_public_topic_quiz", { p_topic_id: topicId });
      const row = rows(requireData(result))[0];
      if (!row) return null;
      const options = Array.isArray(row.options) ? row.options as Record<string, unknown>[] : [];
      return {
        id: String(row.id), question: String(row.question), explanation: String(row.explanation),
        options: shuffled(options.map((option) => ({ id: String(option.id), text: String(option.text) }))),
        citation: { sourceFile: String(row.source_file), chapterLabel: String(row.chapter_label), pageOrSlide: Number(row.page_or_slide) },
      };
    },

    async getPublicExamQuestionBatch(
      scope: ExamQuestionScope,
      questionType: ExamQuestion["questionType"],
      limit = 10,
    ): Promise<ExamQuestion[]> {
      const scopeValue = scope.type === "course" ? null : scope.type === "chapter" ? scope.code : scope.id;
      const parameters = {
        p_scope_type: scope.type,
        p_scope_value: scopeValue,
        p_question_type: questionType,
        p_limit: limit,
      };
      const result = await client.rpc("get_public_exam_question_batch", parameters);
      return rows(requireData(result)).map((row) => {
        const questionType = String(row.question_type);
        if (questionType !== "mcq" && questionType !== "subjective") {
          throw new Error("Course Brain returned an unsupported exam question type.");
        }
        const options = Array.isArray(row.options) ? row.options as Record<string, unknown>[] : [];
        return {
          id: String(row.id),
          topicId: String(row.topic_id),
          sourceContentUnitId: String(row.source_content_unit_id),
          questionType,
          question: String(row.question),
          difficulty: String(row.difficulty) as ExamQuestion["difficulty"],
          maxMarks: Number(row.max_marks),
          options: shuffled(options.map((option) => ({ id: String(option.id), text: String(option.text) }))),
          citation: { sourceFile: String(row.source_file), chapterLabel: String(row.chapter_label), pageOrSlide: Number(row.page_or_slide), chapterCode: String(row.chapter_code), topicId: String(row.topic_id), contentUnitId: String(row.source_content_unit_id) },
        };
      });
    },

    async checkApprovedQuizAnswer(quizId: string, optionId: string): Promise<QuizAnswerFeedback | null> {
      const result = await client.rpc("get_quiz_answer_review", { p_quiz_id: quizId, p_option_id: optionId });
      const row = rows(requireData(result))[0];
      if (!row) return null;
      return { isCorrect: Boolean(row.is_correct), explanation: String(row.explanation), answerScheme: String(row.answer_scheme) };
    },

    async getSubjectiveQuestionMarkingContext(quizId: string): Promise<SubjectiveMarkingContext | null> {
      const result = await client.rpc("get_subjective_question_marking_context", { p_quiz_id: quizId });
      const row = rows(requireData(result))[0];
      if (!row) return null;
      const criteria = Array.isArray(row.criteria) ? row.criteria as Record<string, unknown>[] : [];
      if (!criteria.length) return null;

      const sourceUnits = await Promise.all(criteria.map(async (criterion) => {
        const sourceUnitId = String(criterion.sourceContentUnitId);
        const sourceResult = await execute(client.from("content_units")
          .select("id, topic_id, title, body, content_type, source_references(source_file, chapter_label, page_or_slide)")
          .eq("id", sourceUnitId)
          .eq("status", "published"));
        const sourceRow = rows(requireData(sourceResult))[0];
        if (!sourceRow) throw new Error("Subjective marking criterion requires a published source.");
        return [sourceUnitId, {
          id: String(sourceRow.id), topicId: String(sourceRow.topic_id), title: String(sourceRow.title),
          body: String(sourceRow.body), contentType: String(sourceRow.content_type), citation: citationFrom(sourceRow),
        }] as const;
      }));
      const byId = new Map(sourceUnits);
      return {
        id: String(row.id), question: String(row.question), maxMarks: Number(row.max_marks),
        answerScheme: String(row.subjective_answer_scheme),
        criteria: criteria.map((criterion) => ({
          id: String(criterion.id), criterion: String(criterion.criterion), marks: Number(criterion.marks),
          acceptedConcepts: Array.isArray(criterion.acceptedConcepts) ? criterion.acceptedConcepts.map(String) : [],
          acceptedSynonyms: Array.isArray(criterion.acceptedSynonyms) ? criterion.acceptedSynonyms.map(String) : [],
          sourceUnit: byId.get(String(criterion.sourceContentUnitId))!,
        })),
      };
    },
  };
}

export type CourseBrainRepository = ReturnType<typeof createCourseBrainRepository>;
