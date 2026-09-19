import type { DashboardTab } from "@/components/dashboard/dashboard-shell";
import type { AssessmentMode } from "./types";

export const studentTabs: DashboardTab[] = [
  { href: "/dashboard/student", label: "Overview" },
  { href: "/dashboard/student/results", label: "Results" },
  { href: "/dashboard/student/progress", label: "Studied" },
  { href: "/dashboard/student/bookmarks", label: "Saved" },
];

export const lecturerTabs: DashboardTab[] = [
  { href: "/dashboard/lecturer", label: "Overview" },
  { href: "/dashboard/lecturer/students", label: "Students" },
  { href: "/dashboard/lecturer/exams", label: "Exams" },
  { href: "/dashboard/lecturer/questions", label: "Question bank" },
  { href: "/dashboard/lecturer/review", label: "Approval queue" },
];

/** Rebuilds the practice URL an attempt came from, so "retake" lands on the same assessment. */
export function retakeHref(mode: AssessmentMode, scopeValue: string | null): string {
  // A built exam is sat at its own address; the scope carries which paper it was.
  if (mode === "exam") return scopeValue ? `/exams/${scopeValue}` : "/exams";
  if (mode === "course") return "/practice/course";
  if (!scopeValue) return "/practice/course";
  return mode === "topic"
    ? `/practice/topic?topic=${encodeURIComponent(scopeValue)}`
    : `/practice/chapter?chapter=${encodeURIComponent(scopeValue)}`;
}

export function topicHref(chapterCode: string, topicId: string): string {
  return `/chapters/${chapterCode}?topic=${encodeURIComponent(topicId)}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
