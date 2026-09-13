"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { describedBy, Field, FormAlert } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Card, CardHeader } from "@/components/ui/surface";
import { useToast } from "@/components/ui/toast";
import { formatMoneyInput, parseMoneyInput } from "@/lib/format";
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

  function openDialog() {
    setValue(formatMoneyInput(String(paid)));
    setError("");
    setOpen(true);
  }

  async function save() {
    if (saving) return;
    const amount = parseMoneyInput(value);
    if (amount === null) return setError("Paid amount is required.");
    if (amount > price) return setError(`Paid amount cannot exceed the ${takenOs ? "OS price" : "price"}.`);
    setSaving(true);
    const result = await updatePurchasePayment(purchaseId, amount);
    setSaving(false);
    if (!result.ok) return setError(result.fieldErrors?.paidAmount ?? result.error);
    toast.success("Payment updated");
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader
        title="Payment"
        description={takenOs ? "What you pay to take over this slot." : undefined}
        action={
          <Button variant="secondary" size="sm" onClick={openDialog}>
            Update payment
          </Button>
        }
      />
      <div className="px-5 pb-5">
        <PaymentSummary total={price} paid={paid} totalLabel={priceLabel} />
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
