"use client";

export default function ErrorState({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main className="p-6" role="alert"><p>Chapter materials could not be loaded. Please try again.</p><button type="button" onClick={retry}>Try again</button></main>;
}
