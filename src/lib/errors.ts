// Maps database/auth failures to plain messages (CLAUDE.md §38).
// Technical details go to the server log, never to the user.

type MaybePostgrestError = { code?: string; message?: string } | null | undefined;

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };

export const GENERIC_ERROR = "Something went wrong. Please try again.";

export function friendlyDbError(
  error: MaybePostgrestError,
  context: string,
  fallback = GENERIC_ERROR,
): string {
  console.error(`[batchly] ${context}:`, error);
  switch (error?.code) {
    case "23505":
      return "This already exists. Use a different value.";
    case "23503":
      return `${fallback} Please check the selected source or batch.`;
    case "23514":
      return `${fallback} Please check the amounts and selections.`;
    case "PGRST116":
      return "We couldn't find that record. It may have been removed.";
    default:
      return fallback;
  }
}

export function fail(
  error: string,
  fieldErrors?: Partial<Record<string, string>>,
): { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> } {
  return { ok: false, error, fieldErrors };
}

export function ok<T>(data: T): { ok: true; data: T } {
  return { ok: true, data };
}
