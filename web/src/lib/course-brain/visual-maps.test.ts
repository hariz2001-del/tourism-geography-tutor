import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { contentImages } from "./content-images";
import { topicDiagrams } from "./diagrams";

/**
 * Both visual maps are hardcoded TypeScript literals keyed on database UUIDs,
 * and the lookup in content-unit.tsx fails silent: an unresolved key renders
 * nothing, with no error and no warning. Re-importing a unit gives it a new
 * UUID — which is exactly what the insert-then-delete split procedure does —
 * so a split can silently drop a unit's image and nobody finds out until a
 * learner does.
 *
 * These tests turn that silent failure loud.
 */

// Vitest runs with `web/` as its root, and the jsdom environment does not
// give import.meta.url a file:// scheme, so resolve from the working directory.
const rootDirectory = process.cwd();
const publicDirectory = path.join(rootDirectory, "public");

describe("visual maps — asset integrity (offline)", () => {
  it("every contentImages src exists in public/", () => {
    const missing = Object.entries(contentImages)
      .filter(([, image]) => !existsSync(path.join(publicDirectory, image.src)))
      .map(([unitId, image]) => `${unitId} -> ${image.src}`);

    expect(missing).toEqual([]);
  });

  it("every topicDiagrams src exists in public/", () => {
    const missing = Object.entries(topicDiagrams)
      .filter(([, diagram]) => !existsSync(path.join(publicDirectory, diagram.src)))
      .map(([topicId, diagram]) => `${topicId} -> ${diagram.src}`);

    expect(missing).toEqual([]);
  });
});

/**
 * The referential half needs the live database. Content is served from
 * Supabase at runtime, so the map keys are only meaningful against live rows.
 * Vitest does not load .env.local the way Next.js does, so read it directly;
 * skip rather than fail when it is absent, so the offline checks above still
 * run in an environment without secrets.
 */
function supabaseCredentials(): { url: string; key: string } | null {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const envPath = path.join(rootDirectory, ".env.local");
    if (!existsSync(envPath)) return null;
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (!match) continue;
      const value = match[2].replace(/^["']|["']$/g, "");
      if (match[1] === "NEXT_PUBLIC_SUPABASE_URL") url ??= value;
      if (match[1] === "NEXT_PUBLIC_SUPABASE_ANON_KEY") key ??= value;
    }
  }

  return url && key ? { url, key } : null;
}

async function liveIds(credentials: { url: string; key: string }, query: string): Promise<Set<string>> {
  const response = await fetch(`${credentials.url}/rest/v1/${query}`, {
    headers: { apikey: credentials.key, Authorization: `Bearer ${credentials.key}` },
  });
  if (!response.ok) throw new Error(`${query} -> HTTP ${response.status}`);
  const rows = (await response.json()) as Array<{ id: string }>;
  return new Set(rows.map((row) => row.id));
}

const credentials = supabaseCredentials();
const describeLive = credentials ? describe : describe.skip;

describeLive("visual maps — referential integrity (needs Supabase credentials)", () => {
  it("every contentImages key is a live published content_unit", async () => {
    const published = await liveIds(credentials!, "content_units?select=id&status=eq.published");
    const orphans = Object.keys(contentImages).filter((unitId) => !published.has(unitId));

    expect(orphans).toEqual([]);
  }, 30_000);

  it("every topicDiagrams key is a live topic", async () => {
    const topics = await liveIds(credentials!, "topics?select=id");
    const orphans = Object.keys(topicDiagrams).filter((topicId) => !topics.has(topicId));

    expect(orphans).toEqual([]);
  }, 30_000);
});
