"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { PaymentBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { describedBy, Field, FormAlert } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Card, CardHeader } from "@/components/ui/surface";
import { useToast } from "@/components/ui/toast";
import { remainingAmount } from "@/lib/domain";
import { formatMoneyInput, formatRupiah, parseMoneyInput } from "@/lib/format";
import { updatePurchasePayment } from "../actions";
import { PaymentSummary } from "../payment-summary";

export function PaymentCard({
  purchaseId,
  price,
  paid,
  takenOs,
}: {
  purchaseId: string;
  price: number;
  paid: number;
  takenOs: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(formatMoneyInput(String(paid)));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const priceLabel = takenOs ? "OS price" : "Price";
  const fieldError = error.startsWith("Paid amount") ? error : undefined;
  const remaining = remainingAmount(price, paid);
  const isPaid = remaining === 0;

  function openDialog() {
    setValue(formatMoneyInput(String(paid)));
    setError("");
    setOpen(true);
  }

  async function saveAmount(amount: number) {
    if (saving) return;
    setSaving(true);
    const result = await updatePurchasePayment(purchaseId, amount);
    setSaving(false);
    if (!result.ok) {
      const msg = result.fieldErrors?.paidAmount ?? result.error;
      if (open) setError(msg);
      else toast.error(msg);
      return;
    }
    toast.success(amount >= price ? "Marked paid in full" : "Payment updated");
    setOpen(false);
  }

  async function save() {
    const amount = parseMoneyInput(value);
    if (amount === null) return setError("Paid amount is required.");
    if (amount > price) {
      return setError(`Paid amount cannot exceed the ${takenOs ? "OS price" : "price"}.`);
    }
    await saveAmount(amount);
  }

  return (
    <Card>
      <CardHeader
        title="Payment"
        description={takenOs ? "What you pay to take over this slot." : undefined}
        action={
          isPaid ? (
            <PaymentBadge status="PAID" />
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => saveAmount(price)}
                disabled={saving}
              >
                Mark paid in full
              </Button>
              <Button variant="primary" size="sm" onClick={openDialog} disabled={saving}>
                Update payment
              </Button>
            </div>
          )
        }
      />
      <div className="px-5 pb-5">
        {isPaid ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] bg-surface-2 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <CircleCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
              <p className="text-sm text-ink-2">
                Paid in full ·{" "}
                <span className="tabular font-semibold text-ink">{formatRupiah(paid)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={openDialog}
              className="text-xs font-medium text-ink-3 hover:text-ink hover:underline select-none touch-manipulation"
            >
              Adjust
            </button>
          </div>
        ) : (
          <PaymentSummary total={price} paid={paid} totalLabel={priceLabel} />
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Update payment"
        description="Enter the total you've paid so far."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save payment"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && !fieldError && <FormAlert>{error}</FormAlert>}
          <Field
            id="payment-paid"
            label="Paid amount"
            error={fieldError}
            action={
              <button
                type="button"
                onClick={() => {
                  setValue(formatMoneyInput(String(price)));
                  setError("");
                }}
                className="h-7 text-sm font-medium text-accent-ink hover:underline"
              >
                Paid in full
              </button>
            }
          >
            <MoneyInput
              id="payment-paid"
              value={value}
              autoFocus
              onValueChange={(next) => {
                setValue(next);
                setError("");
              }}
              aria-invalid={Boolean(fieldError)}
              aria-describedby={describedBy("payment-paid", fieldError)}
            />
          </Field>
          <PaymentSummary total={price} paid={parseMoneyInput(value)} totalLabel={priceLabel} />
        </div>
      </Dialog>
    </Card>
  );
}
