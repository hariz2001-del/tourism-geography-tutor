"use client";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="en"><body><main role="alert" style={{ padding: "1.5rem", fontFamily: "Arial, sans-serif" }}><h1>Something went wrong</h1><p>The learning application could not load. Please try again.</p><button type="button" onClick={retry}>Try again</button></main></body></html>;
}
