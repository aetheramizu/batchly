"use server";

import { revalidatePath } from "next/cache";
import { getActionUser } from "@/lib/auth";
import type { CostType } from "@/lib/domain";
import { fail, friendlyDbError, ok, type ActionResult } from "@/lib/errors";
import { hasErrors, validateCostDraft, type CostDraft } from "@/lib/validation";

type CostInput = CostDraft & { paid: boolean };

function values(input: CostInput) {
  return {
    type: input.type as CostType,
    amount: input.amount ?? 0,
    paid: input.paid,
    notes: input.notes.trim() || null,
  };
}

export async function addCost(purchaseId: string, input: CostInput): Promise<ActionResult> {
  const fieldErrors = validateCostDraft(input);
  if (hasErrors(fieldErrors)) return fail("Check the highlighted fields.", fieldErrors);

  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  // The composite foreign key rejects purchases owned by someone else.
  const { error } = await user.supabase
    .from("additional_costs")
    .insert({ purchase_id: purchaseId, ...values(input) });
  if (error) return fail(friendlyDbError(error, "add cost", "Couldn't add this cost."));

  revalidatePath("/", "layout");
  return ok(undefined);
}

export async function updateCost(costId: string, input: CostInput): Promise<ActionResult> {
  const fieldErrors = validateCostDraft(input);
  if (hasErrors(fieldErrors)) return fail("Check the highlighted fields.", fieldErrors);

  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const { data, error } = await user.supabase
    .from("additional_costs")
    .update(values(input))
    .eq("id", costId)
    .select("id")
    .maybeSingle();
  if (error) return fail(friendlyDbError(error, "update cost", "Couldn't save this cost."));
  if (!data) return fail("We couldn't find that cost.");

  revalidatePath("/", "layout");
  return ok(undefined);
}

export async function setCostPaid(costId: string, paid: boolean): Promise<ActionResult> {
  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const { data, error } = await user.supabase
    .from("additional_costs")
    .update({ paid })
    .eq("id", costId)
    .select("id")
    .maybeSingle();
  if (error) return fail(friendlyDbError(error, "set cost paid", "Couldn't update this cost."));
  if (!data) return fail("We couldn't find that cost.");

  revalidatePath("/", "layout");
  return ok(undefined);
}

export async function deleteCost(costId: string): Promise<ActionResult> {
  const user = await getActionUser();
  if (!user) return fail("Your session has ended. Sign in again.");

  const { error } = await user.supabase.from("additional_costs").delete().eq("id", costId);
  if (error) return fail(friendlyDbError(error, "delete cost", "Couldn't remove this cost."));

  revalidatePath("/", "layout");
  return ok(undefined);
}
