"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { describedBy, Field, FormAlert, Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { COUNTRY_LABEL, type Country } from "@/lib/domain";
import { pluralize, todayISODate } from "@/lib/format";
import type { FieldErrors } from "@/lib/validation";
import { createBatch } from "@/features/batches/actions";
import type { BatchOption, SourceSummary } from "../queries";

export function BatchPicker({
  batches,
  source,
  country,
  value,
  onChange,
  onCreated,
  error,
}: {
  batches: BatchOption[];
  source: SourceSummary;
  country: Country;
  value: string;
  onChange: (batchId: string) => void;
  onCreated: (batch: BatchOption) => void;
  error?: string;
}) {
  const [creating, setCreating] = useState(false);

  return (
    <fieldset aria-describedby={error ? "batch-error" : undefined}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <legend className="text-sm font-medium">
          Batch<span className="text-accent-ink" aria-hidden="true"> *</span>
        </legend>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex h-8 items-center gap-1 rounded-md px-1 text-sm font-medium text-accent-ink hover:underline"
        >
          <Plus className="size-4" aria-hidden="true" />
          New batch
        </button>
      </div>

      {batches.length === 0 ? (
        <div
          className={cn(
            "rounded-[var(--radius-control)] border border-dashed px-4 py-5 text-center",
            error ? "border-danger" : "border-line-strong",
          )}
        >
          <p className="text-sm text-ink-2">
            No batches yet for {source.name} in {COUNTRY_LABEL[country]}.
          </p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => setCreating(true)}>
            <Plus aria-hidden="true" />
            Create batch
          </Button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {batches.map((batch) => {
            const selected = batch.id === value;
            return (
              <label
                key={batch.id}
                className={cn(
                  "flex min-h-16 cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border px-3 py-2.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                  selected
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name="batch"
                  value={batch.id}
                  checked={selected}
                  onChange={() => onChange(batch.id)}
                  className="sr-only"
                />
                <span className="min-w-0 flex-1">
                  <span className="tabular block font-medium">Batch {batch.batch_number}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-3">
                    {pluralize(batch.purchaseCount, "purchase")}
                    <StatusBadge status={batch.status} />
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border",
                    selected ? "border-accent bg-accent text-white" : "border-line-strong",
                  )}
                >
                  {selected && <Check className="size-3" strokeWidth={3} />}
                </span>
              </label>
            );
          })}
        </div>
      )}
      {error && (
        <p id="batch-error" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="Create batch"
        description={`${source.name} · ${COUNTRY_LABEL[country]}`}
      >
        <CreateBatchForm
          source={source}
          country={country}
          onCancel={() => setCreating(false)}
          onCreated={(batch) => {
            onCreated(batch);
            setCreating(false);
          }}
        />
      </Dialog>
    </fieldset>
  );
}

function CreateBatchForm({
  source,
  country,
  onCancel,
  onCreated,
}: {
  source: SourceSummary;
  country: Country;
  onCancel: () => void;
  onCreated: (batch: BatchOption) => void;
}) {
  const [batchNumber, setBatchNumber] = useState("");
  const [batchDate, setBatchDate] = useState(todayISODate());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (saving) return;
    setSaving(true);
    setFormError("");
    const result = await createBatch({ sourceId: source.id, country, batchNumber, batchDate });
    setSaving(false);
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      if (!result.fieldErrors) setFormError(result.error);
      return;
    }
    onCreated(result.data);
  }

  return (
    <div className="flex flex-col gap-4">
      {formError && <FormAlert>{formError}</FormAlert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="batch-number" label="Batch number" required error={errors.batchNumber}>
          <Input
            id="batch-number"
            value={batchNumber}
            onChange={(event) => setBatchNumber(event.target.value)}
            placeholder="e.g. 42"
            autoFocus
            className="tabular"
            aria-invalid={Boolean(errors.batchNumber)}
            aria-describedby={describedBy("batch-number", errors.batchNumber)}
          />
        </Field>
        <Field id="batch-date" label="Batch date" required error={errors.batchDate}>
          <Input
            id="batch-date"
            type="date"
            value={batchDate}
            onChange={(event) => setBatchDate(event.target.value)}
            aria-invalid={Boolean(errors.batchDate)}
          />
        </Field>
      </div>
      <p className="text-sm text-ink-3">New batches start as Purchased. Update the status any time.</p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={saving}>
          {saving ? "Creating…" : "Create batch"}
        </Button>
      </div>
    </div>
  );
}
