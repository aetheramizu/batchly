"use server";

import { revalidatePath } from "next/cache";
import { getActionUser } from "@/lib/auth";
import type { Country, TrackingStatus } from "@/lib/domain";
import { fail, friendlyDbError, ok, type ActionResult } from "@/lib/errors";
import {
  hasErrors,
  isTrackingStatusValue,
  MAX_NOTES,
  validateBatchDraft,
} from "@/lib/validation";
import type { BatchOption } from "@/features/purchases/queries";

export async function createBatch(input: {
  sourceId: string;
  country: string;
  batchNumber: string;
  batchDate?: string | null;
}): Promise<ActionResult<BatchOption>> {
  const fieldErrors = validateBatchDraft(input);
  if (hasErrors(fieldErrors)) return fail("Check the highlighted fields.", fieldErrors);

  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  // Batches only exist for Group Order sources (CLAUDE.md §7).
  const { data: source } = await user.supabase
    .from("sources")
    .select("type")
    .eq("id", input.sourceId)
    .maybeSingle();
  if (!source) return fail("Choose a source before creating a batch.");
  if (source.type !== "GROUP_ORDER") {
    return fail("Batches can only be created for Group Order sources.");
  }

  const batchDate = input.batchDate?.trim() || null;

  const { data, error } = await user.supabase
    .from("batches")
    .insert({
      source_id: input.sourceId,
      country: input.country as Country,
      batch_number: input.batchNumber.trim(),
      batch_date: batchDate,
    })
    .select("id, source_id, batch_number, country, status, last_updated_at, batch_date")
    .single();

  if (error) {
    if (error.code === "23505") {
      return fail("This batch already exists.", {
        batchNumber: "A batch with this number already exists for this source and country.",
      });
    }
    return fail(friendlyDbError(error, "create batch", "Couldn't create this batch."));
  }

  revalidatePath("/", "layout");
  return ok({ ...data, purchaseCount: 0 });
}

/** Batch-level tracking: every purchase in the batch shows this status. */
export async function updateBatchStatus(
  batchId: string,
  status: string,
): Promise<ActionResult<{ status: TrackingStatus }>> {
  if (!isTrackingStatusValue(status)) return fail("Choose a tracking status.");

  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  // last_updated_at is bumped by the database trigger only when status changes.
  const { data, error } = await user.supabase
    .from("batches")
    .update({ status })
    .eq("id", batchId)
    .select("status")
    .maybeSingle();

  if (error) return fail(friendlyDbError(error, "update batch status", "Couldn't update the batch."));
  if (!data) return fail("We couldn't find that batch.");

  revalidatePath("/", "layout");
  return ok({ status: data.status });
}

export async function updateBatchDetails(
  batchId: string,
  input: { batchNumber: string; batchDate?: string | null; notes: string },
): Promise<ActionResult> {
  const fieldErrors = validateBatchDraft(input);
  if (input.notes.length > MAX_NOTES) fieldErrors.notes = `Keep notes under ${MAX_NOTES} characters.`;
  if (hasErrors(fieldErrors)) return fail("Check the highlighted fields.", fieldErrors);

  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const batchDate = input.batchDate?.trim() || null;

  const { data, error } = await user.supabase
    .from("batches")
    .update({
      batch_number: input.batchNumber.trim(),
      batch_date: batchDate,
      notes: input.notes.trim() || null,
    })
    .eq("id", batchId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return fail("This batch number is already used.", {
        batchNumber: "Another batch from this source and country already uses this number.",
      });
    }
    return fail(friendlyDbError(error, "update batch", "Couldn't save this batch."));
  }
  if (!data) return fail("We couldn't find that batch.");

  revalidatePath("/", "layout");
  return ok(undefined);
}
