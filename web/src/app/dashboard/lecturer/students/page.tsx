import Link from "next/link";
import DashboardShell, { EmptyPanel } from "@/components/dashboard/dashboard-shell";
import { requireProfile } from "@/lib/auth/session";
import { listClassroomStudents } from "@/lib/learners/lecturer";
import { formatDate, lecturerTabs } from "@/lib/learners/navigation";

export const metadata = { title: "Students · Tourism Geography Tutor" };

export default async function LecturerStudents() {
  await requireProfile("lecturer");
  const students = await listClassroomStudents();

  return (
    <DashboardShell
      eyebrow="Teaching"
      title="Students"
      description="Assessment results for everyone in your classroom."
      tabs={lecturerTabs}
      activeHref="/dashboard/lecturer/students"
    >
      {students.length === 0 ? (
        <EmptyPanel
          title="Your classroom has no students yet."
          detail="Students appear here once they are added to a classroom you teach."
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-graticule bg-surface">
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <caption className="sr-only">Students in your classroom and their assessment results</caption>
            <thead>
              <tr className="border-b border-graticule">
                <th scope="col" className="p-4 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">Student</th>
                <th scope="col" className="p-4 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">Attempts</th>
                <th scope="col" className="p-4 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">Best</th>
                <th scope="col" className="p-4 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">Latest</th>
                <th scope="col" className="p-4 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">Average</th>
                <th scope="col" className="p-4 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule">
              {students.map((student) => (
                <tr key={student.id}>
                  <th scope="row" className="p-4 font-normal">
                    <Link
                      className="font-medium text-ink-strong underline decoration-graticule underline-offset-4 transition-colors hover:text-meridian hover:decoration-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                      href={`/dashboard/lecturer/students/${student.id}`}
                    >
                      {student.displayName}
                    </Link>
                    <span className="block font-mono text-[0.8125rem] text-ink-muted">{student.username}</span>
                  </th>
                  <td className="p-4 text-ink">{student.attemptCount}</td>
                  <td className="p-4 text-ink">{student.bestPercentage === null ? "—" : `${student.bestPercentage}%`}</td>
                  <td className="p-4 text-ink">{student.latestPercentage === null ? "—" : `${student.latestPercentage}%`}</td>
                  <td className="p-4 text-ink">{student.averagePercentage === null ? "—" : `${student.averagePercentage}%`}</td>
                  <td className="p-4 font-mono text-[0.8125rem] text-ink-muted">
                    {student.lastActiveAt ? formatDate(student.lastActiveAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
