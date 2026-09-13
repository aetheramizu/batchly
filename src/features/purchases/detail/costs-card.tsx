"use client";

import { Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { describedBy, Field, FormAlert, Textarea } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Card, CardHeader } from "@/components/ui/surface";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { COST_TYPES, COST_TYPE_LABEL, type CostType } from "@/lib/domain";
import { formatMoneyInput, formatRupiah, parseMoneyInput } from "@/lib/format";
import type { FieldErrors } from "@/lib/validation";
import { addCost, deleteCost, setCostPaid, updateCost } from "@/features/costs/actions";
import type { CostRow } from "../queries";

export function CostsCard({
  purchaseId,
  costs,
  givenOs,
}: {
  purchaseId: string;
  costs: CostRow[];
  givenOs: boolean;
}) {
  const [editing, setEditing] = useState<CostRow | "new" | null>(null);
  const [removing, setRemoving] = useState<CostRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const toast = useToast();

  const total = costs.reduce((sum, c) => sum + c.amount, 0);
  const unpaid = costs.filter((c) => !c.paid).reduce((sum, c) => sum + c.amount, 0);

  async function togglePaid(cost: CostRow) {
    setBusyId(cost.id);
    const result = await setCostPaid(cost.id, !cost.paid);
    setBusyId(null);
    if (!result.ok) toast.error(result.error);
  }

  async function confirmRemove() {
    if (!removing) return;
    setBusyId(removing.id);
    const result = await deleteCost(removing.id);
    setBusyId(null);
    if (!result.ok) return toast.error(result.error);
    toast.success("Cost removed");
    setRemoving(null);
  }

  return (
    <Card>
      <CardHeader
        title="Additional costs"
        description={
          givenOs
            ? "Costs you paid stay in your history after giving OS."
            : "Tax, packing, domestic shipping and other costs you record."
        }
        action={
          <Button variant="secondary" size="sm" onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" />
            Add cost
          </Button>
        }
      />

      {costs.length === 0 ? (
        <div className="mx-5 mb-5 flex items-center gap-3 rounded-[var(--radius-control)] border border-dashed border-line-strong px-4 py-4 text-sm text-ink-2">
          <Receipt className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
          No additional costs recorded.
        </div>
      ) : (
        <>
          <ul className="divide-y divide-line border-t border-line">
            {costs.map((cost) => (
              <li key={cost.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3">
                <div className="min-w-0 basis-full sm:flex-1 sm:basis-0">
                  <p className="font-medium">{COST_TYPE_LABEL[cost.type]}</p>
                  {cost.notes && <p className="text-sm text-ink-3 sm:truncate">{cost.notes}</p>}
                </div>
                <p className="tabular mr-auto font-medium sm:mr-0">{formatRupiah(cost.amount)}</p>
                <button
                  type="button"
                  onClick={() => togglePaid(cost)}
                  disabled={busyId === cost.id}
                  aria-label={`${COST_TYPE_LABEL[cost.type]}: ${cost.paid ? "paid" : "unpaid"}. Mark as ${cost.paid ? "unpaid" : "paid"}`}
                  className="rounded-full disabled:opacity-60"
                >
                  <Badge tone={cost.paid ? "success" : "danger"}>{cost.paid ? "Paid" : "Unpaid"}</Badge>
                </button>
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setEditing(cost)}
                    aria-label={`Edit ${COST_TYPE_LABEL[cost.type]} cost`}
                    className="grid size-9 place-items-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoving(cost)}
                    aria-label={`Remove ${COST_TYPE_LABEL[cost.type]} cost`}
                    className="grid size-9 place-items-center rounded-lg text-ink-3 hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-line bg-surface-2/60 px-5 py-3 text-sm">
            <span className="font-medium">Total</span>
            <span className="tabular">
              <span className="font-semibold">{formatRupiah(total)}</span>
              {unpaid > 0 && <span className="text-danger"> · {formatRupiah(unpaid)} unpaid</span>}
            </span>
          </div>
        </>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add cost" : "Edit cost"}
        description="Record the amount you were charged. Tax isn't calculated automatically."
      >
        {editing !== null && (
          <CostForm
            key={editing === "new" ? "new" : editing.id}
            purchaseId={purchaseId}
            cost={editing === "new" ? null : editing}
            onDone={(message) => {
              toast.success(message);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Dialog>

      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove this cost?"
        description={
          removing
            ? `${COST_TYPE_LABEL[removing.type]} · ${formatRupiah(removing.amount)} will be removed from this purchase and your finance totals.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Keep cost
            </Button>
            <Button variant="danger" onClick={confirmRemove} disabled={busyId === removing?.id}>
              {busyId === removing?.id ? "Removing…" : "Remove cost"}
            </Button>
          </>
        }
      >
        <span className="sr-only">Confirm removal</span>
      </Dialog>
    </Card>
  );
}

function CostForm({
  purchaseId,
  cost,
  onDone,
  onCancel,
}: {
  purchaseId: string;
  cost: CostRow | null;
  onDone: (message: string) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<CostType | "">(cost?.type ?? "");
  const [amount, setAmount] = useState(cost ? formatMoneyInput(String(cost.amount)) : "");
  const [paid, setPaid] = useState(cost?.paid ?? false);
  const [notes, setNotes] = useState(cost?.notes ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    setSaving(true);
    setFormError("");
    const input = { type, amount: parseMoneyInput(amount), paid, notes };
    const result = cost ? await updateCost(cost.id, input) : await addCost(purchaseId, input);
    setSaving(false);
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      if (!result.fieldErrors) setFormError(result.error);
      return;
    }
    onDone(cost ? "Cost updated" : "Cost added");
  }

  return (
    <div className="flex flex-col gap-4">
      {formError && <FormAlert>{formError}</FormAlert>}
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">
          Type<span className="text-accent-ink" aria-hidden="true"> *</span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {COST_TYPES.map((option) => (
            <label
              key={option}
              className={cn(
                "flex h-11 cursor-pointer items-center justify-center rounded-[var(--radius-control)] border px-2 text-center text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                type === option
                  ? "border-ink bg-ink text-white"
                  : "border-line text-ink-2 hover:border-line-strong",
              )}
            >
              <input
                type="radio"
                name="cost-type"
                checked={type === option}
                onChange={() => setType(option)}
                className="sr-only"
              />
              {COST_TYPE_LABEL[option]}
            </label>
          ))}
        </div>
        {errors.type && <p className="mt-1.5 text-sm text-danger">{errors.type}</p>}
      </fieldset>

      <Field id="cost-amount" label="Amount" required error={errors.amount}>
        <MoneyInput
          id="cost-amount"
          value={amount}
          onValueChange={setAmount}
          placeholder="0"
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={describedBy("cost-amount", errors.amount)}
        />
      </Field>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border border-line px-3.5">
        <input
          type="checkbox"
          checked={paid}
          onChange={(event) => setPaid(event.target.checked)}
          className="size-4 accent-[var(--color-accent)]"
        />
        <span className="text-[15px]">I&apos;ve paid this cost</span>
      </label>

      <Field id="cost-notes" label="Notes" optional error={errors.notes}>
        <Textarea
          id="cost-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          placeholder="e.g. Billed after arrival"
        />
      </Field>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : cost ? "Save cost" : "Add cost"}
        </Button>
      </div>
    </div>
  );
}
