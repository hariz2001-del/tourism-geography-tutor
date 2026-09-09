const CHAPTER_PREFIX = /^CH(?:APTER)?\s*(\d+)\b/i;

/**
 * Keep compact chapter codes in URLs and database queries, but expand them for
 * learner-facing copy. Existing descriptive citation suffixes are preserved.
 */
export function formatChapterLabel(value: string): string {
  return value.replace(CHAPTER_PREFIX, "CHAPTER $1");
}
