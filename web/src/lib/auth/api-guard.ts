import "server-only";
import { getProfile } from "./session";

/**
 * Wraps a route handler so it answers only a signed-in learner.
 *
 * The proxy already turns anonymous traffic away, but Next's own guidance is that
 * a proxy check is optimistic: it can be skipped by a request that never passes
 * through it. Every handler that reads course content or learner data makes its
 * own check here.
 *
 * It wraps the exported handler rather than living inside the factories, so the
 * route tests can still exercise the marking and grounding logic on its own.
 */
export function withSignedIn<Handler extends (request: Request) => Promise<Response>>(
  handler: Handler,
): (request: Request) => Promise<Response> {
  return async function guarded(request: Request): Promise<Response> {
    const profile = await getProfile();
    if (!profile) {
      return Response.json({ error: "Sign in to continue." }, { status: 401 });
    }
    return handler(request);
  };
}
