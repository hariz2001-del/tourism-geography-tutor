import type { PublishedContentUnit } from "../course-brain/types";
import type { AiGroundedTutorAnswer, OutOfScopeTutorAnswer } from "./types";

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";

type LlmVerdict = { found: true; answer: string; sourceUnitId: string } | { found: false };

function systemPrompt(): string {
  return [
    "You are a course tutor. Answer ONLY using the excerpts provided in the user message.",
    "Never use outside knowledge, even if you know the answer yourself. If the excerpts do not cover the question, say so.",
    "Reply with strict JSON only, no prose outside the JSON object, matching exactly one of these two shapes:",
    '{"found": true, "answer": "<answer using only the excerpts>", "sourceUnitId": "<id of the single excerpt that best supports the answer>"}',
    '{"found": false}',
  ].join(" ");
}

function excerptsBlock(units: PublishedContentUnit[]): string {
  return units.map((unit) => `id: ${unit.id}\ntitle: ${unit.title}\nbody: ${unit.body}`).join("\n\n");
}

function parseVerdict(content: string): LlmVerdict | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const record = parsed as Record<string, unknown>;
  if (record.found === false) return { found: false };
  if (record.found === true && typeof record.answer === "string" && typeof record.sourceUnitId === "string") {
    return { found: true, answer: record.answer, sourceUnitId: record.sourceUnitId };
  }
  return null;
}

// Sends the whole published corpus as context on every fallback call. Fine at
// today's scale (well under the context window); would need retrieval instead
// of "send everything" if the content set grows much larger.
export async function answerWithLlmFallback(
  question: string,
  units: PublishedContentUnit[],
  outOfScope: OutOfScopeTutorAnswer,
): Promise<AiGroundedTutorAnswer | OutOfScopeTutorAnswer> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || units.length === 0) return outOfScope;

  let verdict: LlmVerdict | null;
  try {
    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: systemPrompt() },
          { role: "user", content: `Excerpts:\n${excerptsBlock(units)}\n\nQuestion: ${question}` },
        ],
        response_format: { type: "json_object" },
        stream: false,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return outOfScope;
    const body = await response.json() as { choices?: { message?: { content?: string } }[] };
    const content = body.choices?.[0]?.message?.content;
    verdict = content ? parseVerdict(content) : null;
  } catch {
    return outOfScope;
  }

  if (!verdict || !verdict.found) return outOfScope;
  const sourceUnit = units.find((unit) => unit.id === verdict.sourceUnitId);
  if (!sourceUnit || !verdict.answer.trim()) return outOfScope;

  return { kind: "ai_grounded", text: verdict.answer, citations: [sourceUnit.citation] };
}
