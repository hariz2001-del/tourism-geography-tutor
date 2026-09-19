/**
 * Moving one question up or down a paper.
 *
 * Kept pure and separate from the action: the fiddly part is the edges, and that
 * is worth testing without a database. Display orders are rewritten from 1 by the
 * caller, so this only has to get the sequence right.
 */
export function reordered(ids: string[], movingId: string, direction: "up" | "down"): string[] {
  const index = ids.indexOf(movingId);
  if (index === -1) return ids;

  const target = direction === "up" ? index - 1 : index + 1;
  // Already at the top or the bottom: the paper is unchanged rather than wrapped around.
  if (target < 0 || target >= ids.length) return ids;

  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
