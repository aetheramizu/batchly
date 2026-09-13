"use server";

import { revalidatePath } from "next/cache";
import { getActionUser } from "@/lib/auth";
import { fail, friendlyDbError, ok, type ActionResult } from "@/lib/errors";
import { hasErrors, validateOsDraft, type OsDraft } from "@/lib/validation";

/**
 * Give OS: the purchase stays in history with ownership GIVEN_OS
 * (CLAUDE.md §11). Also used to edit OS details of an already-given purchase.
 * Price, source, batch and costs are left untouched.
 */
export async function giveOs(purchaseId: string, draft: OsDraft): Promise<ActionResult> {
  const fieldErrors = validateOsDraft(draft);
  if (hasErrors(fieldErrors)) return fail("Check the highlighted fields.", fieldErrors);

  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const { data, error } = await user.supabase
    .from("purchases")
    .update({
      ownership_status: "GIVEN_OS",
      os_price: draft.osPrice,
      os_paid_amount: draft.osPaidAmount,
      os_date: draft.osDate,
      os_notes: draft.osNotes.trim() || null,
    })
    .eq("id", purchaseId)
    .select("id")
    .maybeSingle();

  if (error) return fail(friendlyDbError(error, "give os", "Couldn't record this OS."));
  if (!data) return fail("We couldn't find that purchase.");

  revalidatePath("/", "layout");
  return ok(undefined);
}
