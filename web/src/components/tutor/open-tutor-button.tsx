"use client";

import { requestTutor } from "@/lib/tutor/open-event";

export default function OpenTutorButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={requestTutor}>
      {children}
    </button>
  );
}
