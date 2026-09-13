"use server";

import { revalidatePath } from "next/cache";
import { getActionUser } from "@/lib/auth";
import { fail, friendlyDbError, ok, type ActionResult } from "@/lib/errors";
import { hasErrors, validateSourceDraft, type SourceDraft } from "@/lib/validation";
import type { SourceSummary } from "@/features/purchases/queries";

export async function createSource(
  draft: SourceDraft,
): Promise<ActionResult<SourceSummary>> {
  const fieldErrors = validateSourceDraft(draft);
  if (hasErrors(fieldErrors)) return fail("Check the highlighted fields.", fieldErrors);

  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const { data, error } = await user.supabase
    .from("sources")
    .insert({
      name: draft.name.trim(),
      type: draft.type as SourceSummary["type"],
      platform: draft.platform.trim(),
    })
    .select("id, name, type, platform")
    .single();

  if (error) return fail(friendlyDbError(error, "create source", "Couldn't create this source."));

  revalidatePath("/", "layout");
  return ok(data);
}
