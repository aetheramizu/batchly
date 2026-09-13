"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { TRACKING_TONE } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormAlert } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import {
  TRACKING_STATUSES,
  TRACKING_STATUS_LABEL,
  type TrackingStatus,
} from "@/lib/domain";
import type { ActionResult } from "@/lib/errors";

const DOT: Record<string, string> = {
  neutral: "bg-ink-3",
  slate: "bg-slate-500",
  info: "bg-info",
  teal: "bg-teal",
  success: "bg-success",
};

/**
 * Pick a tracking status. No strict order — any status can be chosen
 * (CLAUDE.md §16) — and no confirmation is needed (UX_SPEC §52).
 */
export function StatusDialog({
  open,
  onClose,
  current,
  title,
  description,
  onSave,
  successMessage,
}: {
  open: boolean;
  onClose: () => void;
  current: TrackingStatus;
  title: string;
  description?: string;
  onSave: (status: TrackingStatus) => Promise<ActionResult<unknown>>;
  successMessage: string;
}) {
  const [selected, setSelected] = useState<TrackingStatus>(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  async function save() {
    if (saving) return;
    if (selected === current) {
      onClose();
      return;
    }
    setSaving(true);
    setError("");
    const result = await onSave(selected);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(successMessage);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        setSelected(current);
        setError("");
        onClose();
      }}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Updating…" : "Update status"}
          </Button>
        </>
      }
    >
      {error && <FormAlert>{error}</FormAlert>}
      <fieldset className="mt-1">
        <legend className="sr-only">Tracking status</legend>
        <div className="flex flex-col gap-1.5">
          {TRACKING_STATUSES.map((status) => {
            const isSelected = selected === status;
            return (
              <label
                key={status}
                className={cn(
                  "flex h-12 cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border px-3.5 text-[15px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                  isSelected ? "border-accent bg-accent-soft font-medium" : "border-line hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name="tracking-status"
                  value={status}
                  checked={isSelected}
                  onChange={() => setSelected(status)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn("size-2 rounded-full", DOT[TRACKING_TONE[status]])}
                />
                <span className="flex-1">{TRACKING_STATUS_LABEL[status]}</span>
                {status === current && <span className="text-xs text-ink-3">Current</span>}
                {isSelected && <Check className="size-4 text-accent" aria-hidden="true" />}
              </label>
            );
          })}
        </div>
      </fieldset>
    </Dialog>
  );
}
