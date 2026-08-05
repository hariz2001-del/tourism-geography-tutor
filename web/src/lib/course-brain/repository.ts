import type {
  ChapterTopic,
  PublishedContentUnit,
  QuizAnswerFeedback,
  QuizQuestion,
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

function citationFrom(row: Record<string, unknown>) {
  const references = row.source_references;
  const reference = Array.isArray(references) ? references[0] : references;
  if (!reference || typeof reference !== "object") {
    throw new Error("Published Course Brain content requires a source reference.");
  }
  const source = reference as Record<string, unknown>;
  return { sourceFile: String(source.source_file), chapterLabel: String(source.chapter_label), pageOrSlide: Number(source.page_or_slide) };
}

export function createCourseBrainRepository(client: SupabaseQueryAdapter) {
  return {
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

    async getApprovedTopicQuiz(topicId: string): Promise<QuizQuestion | null> {
      const result = await client.rpc("get_public_topic_quiz", { p_topic_id: topicId });
      const row = rows(requireData(result))[0];
      if (!row) return null;
      const options = Array.isArray(row.options) ? row.options as Record<string, unknown>[] : [];
      return {
        id: String(row.id), question: String(row.question), explanation: String(row.explanation),
        options: options.map((option) => ({ id: String(option.id), text: String(option.text) })),
        citation: { sourceFile: String(row.source_file), chapterLabel: String(row.chapter_label), pageOrSlide: Number(row.page_or_slide) },
      };
    },

    async checkApprovedQuizAnswer(quizId: string, optionId: string): Promise<QuizAnswerFeedback | null> {
      const result = await client.rpc("check_public_quiz_answer", { p_quiz_id: quizId, p_option_id: optionId });
      const row = rows(requireData(result))[0];
      if (!row) return null;
      return { isCorrect: Boolean(row.is_correct), explanation: String(row.explanation) };
    },
  };
}

export type CourseBrainRepository = ReturnType<typeof createCourseBrainRepository>;
