import { describe, expect, it } from "vitest";
import { createCourseBrainRepository } from "./repository";

function queryBuilder(rows: unknown[]) {
  const filters: unknown[][] = [];
  const builder = {
    select: () => builder,
    eq: (field: string, value: unknown) => { filters.push([field, "eq", value]); return builder; },
    order: () => builder,
    returns: async () => ({ data: rows, error: null }),
  };
  return { builder, filters };
}

describe("Course Brain repository", () => {
  it("lists chapters ordered by display order", async () => {
    const query = queryBuilder([
      { code: "CH1", title: "Chapter 1", display_order: 1 },
      { code: "CH2", title: "CH2", display_order: 2 },
    ]);
    const repository = createCourseBrainRepository({ from: () => query.builder, rpc: async () => ({ data: [], error: null }) });

    await expect(repository.listChapters()).resolves.toEqual([
      { code: "CH1", title: "Chapter 1", displayOrder: 1 },
      { code: "CH2", title: "CH2", displayOrder: 2 },
    ]);
  });

  it("always applies the published filter when reading topic content", async () => {
    const query = queryBuilder([{ id: "unit-1", topic_id: "topic-1", title: "A", body: "B", content_type: "explanation", status: "published", source_references: [{ source_file: "reviewed.pdf", chapter_label: "Chapter 1", page_or_slide: 4 }] }]);
    const repository = createCourseBrainRepository({ from: () => query.builder, rpc: async () => ({ data: [], error: null }) });

    const result = await repository.getPublishedTopicContent("topic-1");

    expect(query.filters).toContainEqual(["topic_id", "eq", "topic-1"]);
    expect(query.filters).toContainEqual(["status", "eq", "published"]);
    expect(result[0].citation).toMatchObject({ sourceFile: "reviewed.pdf", pageOrSlide: 4 });
  });

  it("accepts Supabase's object shape for the one-to-one source reference relation", async () => {
    const query = queryBuilder([{ id: "unit-1", topic_id: "topic-1", title: "A", body: "B", content_type: "explanation", source_references: { source_file: "reviewed.pdf", chapter_label: "Chapter 1", page_or_slide: 4 } }]);
    const repository = createCourseBrainRepository({ from: () => query.builder, rpc: async () => ({ data: [], error: null }) });

    await expect(repository.getPublishedTopicContent("topic-1")).resolves.toMatchObject([
      { citation: { sourceFile: "reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 4 } },
    ]);
  });

  it("includes chapter/topic navigation fields on every published unit's citation", async () => {
    const query = queryBuilder([{
      id: "unit-1", topic_id: "topic-1", title: "A", body: "B", content_type: "explanation",
      source_references: { source_file: "reviewed.pdf", chapter_label: "Chapter 1", page_or_slide: 4 },
      topics: { chapter_id: "chapter-1", chapters: { code: "CH1" } },
    }]);
    const repository = createCourseBrainRepository({ from: () => query.builder, rpc: async () => ({ data: [], error: null }) });

    const result = await repository.getAllPublishedContent();

    expect(query.filters).toContainEqual(["status", "eq", "published"]);
    expect(result[0].citation).toMatchObject({ chapterCode: "CH1", topicId: "topic-1", contentUnitId: "unit-1" });
  });
});
