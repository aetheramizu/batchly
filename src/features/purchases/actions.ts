"use server";

import { revalidatePath } from "next/cache";
import { getActionUser } from "@/lib/auth";
import type { Country, TrackingStatus } from "@/lib/domain";
import { fail, friendlyDbError, ok, type ActionResult } from "@/lib/errors";
import {
  hasErrors,
  isTrackingStatusValue,
  validatePayment,
  validatePurchaseDraft,
  type FieldErrors,
  type PurchaseDraft,
} from "@/lib/validation";
import type { TablesInsert } from "@/lib/supabase/database.types";
import { purchaseImagePath } from "./queries";

const SAVE_ERROR = "Couldn't save this purchase.";

type Supabase = NonNullable<Awaited<ReturnType<typeof getActionUser>>>["supabase"];

/**
 * Re-derives structure from the stored source record instead of trusting the
 * client (CLAUDE.md §6, §37). Returns the column values for insert/update.
 */
type StructureValues = Pick<
  TablesInsert<"purchases">,
  "source_id" | "batch_id" | "country" | "tracking_status" | "last_updated_at"
>;

type Structure =
  | { kind: "error"; error: string }
  | { kind: "invalid"; fieldErrors: FieldErrors }
  | { kind: "ok"; values: StructureValues };

async function resolveStructure(supabase: Supabase, draft: PurchaseDraft): Promise<Structure> {
  const { data: source } = await supabase
    .from("sources")
    .select("id, type")
    .eq("id", draft.sourceId)
    .maybeSingle();
  if (!source) return { kind: "error", error: "Choose a source." };

  const checked = validatePurchaseDraft({ ...draft, sourceType: source.type });
  if (hasErrors(checked)) return { kind: "invalid", fieldErrors: checked };

  if (source.type === "GROUP_ORDER") {
    const { data: batch } = await supabase
      .from("batches")
      .select("id, source_id, country")
      .eq("id", draft.batchId)
      .maybeSingle();
    if (!batch || batch.source_id !== source.id || batch.country !== draft.country) {
      return {
        kind: "invalid",
        fieldErrors: { batchId: "Choose a batch from this source and country." },
      };
    }
    return {
      kind: "ok",
      values: {
        source_id: source.id,
        batch_id: batch.id,
        country: null,
        tracking_status: null,
        last_updated_at: null,
      },
    };
  }

  return {
    kind: "ok",
    values: {
      source_id: source.id,
      batch_id: null,
      country: draft.country as Country,
      tracking_status: draft.trackingStatus as TrackingStatus,
    },
  };
}

function detailValues(draft: PurchaseDraft) {
  return {
    item_name: draft.itemName.trim(),
    artist_group: draft.artistGroup.trim() || null,
    price: draft.price ?? 0,
    paid_amount: draft.paidAmount ?? 0,
    purchase_date: draft.purchaseDate,
    notes: draft.notes.trim() || null,
  };
}

export async function createPurchase(
  draft: PurchaseDraft,
): Promise<ActionResult<{ id: string }>> {
  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const structure = await resolveStructure(user.supabase, draft);
  if (structure.kind === "error") return fail(structure.error, { sourceId: structure.error });
  if (structure.kind === "invalid") return fail("Check the highlighted fields.", structure.fieldErrors);

  const { data, error } = await user.supabase
    .from("purchases")
    .insert({
      ...structure.values,
      ...detailValues(draft),
      purchase_origin: draft.origin === "TAKEN_OS" ? "TAKEN_OS" : "NEW",
      ownership_status: "ACTIVE",
    })
    .select("id")
    .single();

  if (error) return fail(friendlyDbError(error, "create purchase", SAVE_ERROR));

  revalidatePath("/", "layout");
  return ok({ id: data.id });
}

export async function updatePurchase(
  id: string,
  draft: PurchaseDraft,
): Promise<ActionResult<{ id: string }>> {
  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const structure = await resolveStructure(user.supabase, draft);
  if (structure.kind === "error") return fail(structure.error, { sourceId: structure.error });
  if (structure.kind === "invalid") return fail("Check the highlighted fields.", structure.fieldErrors);

  const { data, error } = await user.supabase
    .from("purchases")
    .update({ ...structure.values, ...detailValues(draft) })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return fail(friendlyDbError(error, "update purchase", SAVE_ERROR));
  if (!data) return fail("We couldn't find that purchase.");

  revalidatePath("/", "layout");
  return ok({ id: data.id });
}

/**
 * Stores the image path after the browser uploaded the file to Storage,
 * or clears it (and removes the file) when `hasImage` is false.
 */
export async function setPurchaseImage(
  id: string,
  hasImage: boolean,
): Promise<ActionResult> {
  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const path = purchaseImagePath(user.userId, id);

  if (!hasImage) {
    const { error: removeError } = await user.supabase.storage
      .from("purchase-images")
      .remove([path]);
    if (removeError) console.error("[batchly] remove image:", removeError);
  }

  const { data, error } = await user.supabase
    .from("purchases")
    .update({ image_url: hasImage ? path : null })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return fail(friendlyDbError(error, "set purchase image", "Couldn't update the image."));
  if (!data) return fail("We couldn't find that purchase.");

  revalidatePath("/", "layout");
  return ok(undefined);
}

/** Direct Seller tracking only. Group Order purchases are tracked via their batch. */
export async function updatePurchaseTracking(
  id: string,
  status: string,
): Promise<ActionResult> {
  if (!isTrackingStatusValue(status)) return fail("Choose a tracking status.");

  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const { data, error } = await user.supabase
    .from("purchases")
    .update({ tracking_status: status })
    .eq("id", id)
    .is("batch_id", null)
    .select("id")
    .maybeSingle();

  if (error) return fail(friendlyDbError(error, "update purchase tracking", "Couldn't update tracking."));
  if (!data) return fail("This purchase is tracked through its batch.");

  revalidatePath("/", "layout");
  return ok(undefined);
}

export async function updatePurchasePayment(
  id: string,
  paidAmount: number | null,
): Promise<ActionResult> {
  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const { data: purchase } = await user.supabase
    .from("purchases")
    .select("price, purchase_origin")
    .eq("id", id)
    .maybeSingle();
  if (!purchase) return fail("We couldn't find that purchase.");

  const errors = validatePayment(
    Number(purchase.price),
    paidAmount,
    {
      total: purchase.purchase_origin === "TAKEN_OS" ? "OS price" : "Price",
      paid: "Paid amount",
    },
    { total: "price", paid: "paidAmount" },
  );
  if (hasErrors(errors)) return fail("Check the paid amount.", errors);

  const { error } = await user.supabase
    .from("purchases")
    .update({ paid_amount: paidAmount ?? 0 })
    .eq("id", id);
  if (error) return fail(friendlyDbError(error, "update payment", "Couldn't update the payment."));

  revalidatePath("/", "layout");
  return ok(undefined);
}

/** Soft archive (CLAUDE.md §15). History and money records are kept. */
export async function setPurchaseArchived(
  id: string,
  archived: boolean,
): Promise<ActionResult> {
  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const { data, error } = await user.supabase
    .from("purchases")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return fail(friendlyDbError(error, "archive purchase", "Couldn't update this purchase."));
  if (!data) return fail("We couldn't find that purchase.");

  revalidatePath("/", "layout");
  return ok(undefined);
}
