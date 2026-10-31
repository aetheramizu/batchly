"use client";

import { Pencil, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { describedBy, Field, FormAlert, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import type { TrackingStatus } from "@/lib/domain";
import { pluralize } from "@/lib/format";
import type { FieldErrors } from "@/lib/validation";
import { StatusDialog } from "@/features/tracking/status-dialog";
import { updateBatchDetails, updateBatchStatus } from "./actions";

export function UpdateBatchStatusButton({
  batchId,
  batchNumber,
  status,
  purchaseCount,
  variant = "primary",
  className,
}: {
  batchId: string;
  batchNumber: string;
  status: TrackingStatus;
  purchaseCount: number;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} className={className}>
        <RefreshCw aria-hidden="true" />
        Update status
      </Button>
      <StatusDialog
        key={status}
        open={open}
        onClose={() => setOpen(false)}
        current={status}
        title={`Update Batch ${batchNumber}`}
        description={
          purchaseCount > 0
            ? `All ${pluralize(purchaseCount, "purchase")} in this batch will show the new status.`
            : "Purchases you add to this batch will show this status."
        }
        successMessage="Batch updated"
        onSave={(next) => updateBatchStatus(batchId, next)}
      />
    </>
  );
}

export function EditBatchButton({
  batchId,
  batchNumber,
  batchDate,
  notes,
  className,
}: {
  batchId: string;
  batchNumber: string;
  batchDate: string;
  notes: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} className={className}>
        <Pencil aria-hidden="true" />
        Edit batch
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Edit batch"
        description="Source and country can't change here. Tracking status is updated separately."
      >
        <EditBatchForm
          key={`${batchNumber}|${batchDate}|${notes}`}
          batchId={batchId}
          initial={{ batchNumber, batchDate, notes: notes ?? "" }}
          onDone={() => setOpen(false)}
        />
      </Dialog>
    </>
  );
}

function EditBatchForm({
  batchId,
  initial,
  onDone,
}: {
  batchId: string;
  initial: { batchNumber: string; batchDate: string; notes: string };
  onDone: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function save() {
    if (saving) return;
    setSaving(true);
    setFormError("");
    const result = await updateBatchDetails(batchId, values);
    setSaving(false);
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      if (!result.fieldErrors) setFormError(result.error);
      return;
    }
    toast.success("Batch saved");
    onDone();
  }

  return (
    <div className="flex flex-col gap-4">
      {formError && <FormAlert>{formError}</FormAlert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="edit-batch-number" label="Batch number" required error={errors.batchNumber}>
          <Input
            id="edit-batch-number"
            value={values.batchNumber}
            onChange={(e) => setValues({ ...values, batchNumber: e.target.value })}
            className="tabular"
            aria-invalid={Boolean(errors.batchNumber)}
            aria-describedby={describedBy("edit-batch-number", errors.batchNumber)}
          />
        </Field>
        <Field id="edit-batch-date" label="Batch date" required error={errors.batchDate}>
          <Input
            id="edit-batch-date"
            type="date"
            value={values.batchDate}
            onChange={(e) => setValues({ ...values, batchDate: e.target.value })}
          />
        </Field>
      </div>
      <Field id="edit-batch-notes" label="Notes" optional error={errors.notes}>
        <Textarea
          id="edit-batch-notes"
          rows={3}
          value={values.notes}
          onChange={(e) => setValues({ ...values, notes: e.target.value })}
          placeholder="e.g. Second payment announced on arrival"
        />
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save batch"}
        </Button>
      </div>
    </div>
  );
}
