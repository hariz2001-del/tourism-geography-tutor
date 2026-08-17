"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full rounded-card bg-meridian px-5 py-3 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px disabled:cursor-not-allowed disabled:bg-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <label htmlFor="username" className="block font-medium text-ink-strong">
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          className="min-h-11 w-full rounded-card border border-graticule bg-chart px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block font-medium text-ink-strong">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-11 w-full rounded-card border border-graticule bg-chart px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
