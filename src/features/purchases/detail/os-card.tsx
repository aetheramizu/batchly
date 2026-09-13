"use client";

import { ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { Badge, PaymentBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { describedBy, Field, FormAlert, Input, Textarea } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Card, CardHeader, DetailRow } from "@/components/ui/surface";
import { useToast } from "@/components/ui/toast";
import { osDifference, paymentStatus, remainingAmount } from "@/lib/domain";
import {
  formatDate,
  formatMoneyInput,
  formatRupiah,
  formatSignedRupiah,
  parseMoneyInput,
  todayISODate,
} from "@/lib/format";
import { hasErrors, validateOsDraft, type FieldErrors } from "@/lib/validation";
import { giveOs } from "@/features/os/actions";

type OsData = {
  price: number | null;
  paid: number | null;
  date: string | null;
  notes: string | null;
};

export function OsCard({
  purchaseId,
  itemName,
  originalPrice,
  givenOs,
  takenOs,
  os,
}: {
  purchaseId: string;
  itemName: string;
  originalPrice: number;
  givenOs: boolean;
  takenOs: boolean;
  os: OsData;
}) {
  const [open, setOpen] = useState(false);
  // Remount the dialog with fresh values after OS details change.
  const osKey = [os.price, os.paid, os.date, os.notes, givenOs].join("|");

  if (!givenOs) {
    return (
      <Card>
        <CardHeader
          title="OS"
          description={
            takenOs
              ? "You took over this slot through OS. You can still give it through OS later."
              : "Giving this slot to someone else? Record it as OS. The purchase stays in your history."
          }
        />
        <div className="px-5 pb-5">
          {takenOs && (
            <Badge tone="neutral" icon={<ArrowLeftRight aria-hidden="true" />} className="mb-4">
              Taken OS
            </Badge>
          )}
          <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
            <ArrowLeftRight aria-hidden="true" />
            Give OS
          </Button>
        </div>
        <GiveOsDialog
          key={osKey}
          open={open}
          onClose={() => setOpen(false)}
          purchaseId={purchaseId}
          itemName={itemName}
          originalPrice={originalPrice}
          os={os}
          editing={false}
        />
      </Card>
    );
  }

  const osPrice = os.price ?? 0;
  const osPaid = os.paid ?? 0;
  const difference = osDifference(osPrice, originalPrice);

  return (
    <Card>
      <CardHeader
        title="OS"
        description={os.date ? `Given on ${formatDate(os.date)}` : undefined}
        action={
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            Edit OS
          </Button>
        }
      />
      <div className="px-5 pb-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge tone="neutral" icon={<ArrowLeftRight aria-hidden="true" />}>
            Given OS
          </Badge>
          <PaymentBadge status={paymentStatus(osPrice, osPaid)} />
        </div>
        <dl className="divide-y divide-line">
          <DetailRow label="Original price">
            <span className="tabular">{formatRupiah(originalPrice)}</span>
          </DetailRow>
          <DetailRow label="OS price">
            <span className="tabular">{formatRupiah(osPrice)}</span>
          </DetailRow>
          <DetailRow label="Received">
            <span className="tabular">{formatRupiah(osPaid)}</span>
          </DetailRow>
          <DetailRow label="Still to receive">
            <span className="tabular">{formatRupiah(remainingAmount(osPrice, osPaid))}</span>
          </DetailRow>
          <DetailRow label="OS Difference">
            <span className={`tabular ${difference < 0 ? "text-danger" : difference > 0 ? "text-success" : ""}`}>
              {formatSignedRupiah(difference)}
            </span>
          </DetailRow>
        </dl>
        <p className="mt-2 text-xs text-ink-3">
          OS Difference is OS price minus original price. Additional costs aren&apos;t included.
        </p>
        {os.notes && (
          <p className="mt-3 rounded-[var(--radius-control)] bg-surface-2 px-3 py-2.5 text-sm whitespace-pre-line text-ink-2">
            {os.notes}
          </p>
        )}
      </div>
      <GiveOsDialog
        key={osKey}
        open={open}
        onClose={() => setOpen(false)}
        purchaseId={purchaseId}
        itemName={itemName}
        originalPrice={originalPrice}
        os={os}
        editing
      />
    </Card>
  );
}

function GiveOsDialog({
  open,
  onClose,
  purchaseId,
  itemName,
  originalPrice,
  os,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  purchaseId: string;
  itemName: string;
  originalPrice: number;
  os: OsData;
  editing: boolean;
}) {
  const toast = useToast();
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [osPrice, setOsPrice] = useState(os.price === null ? "" : formatMoneyInput(String(os.price)));
  const [osPaid, setOsPaid] = useState(os.paid === null ? "0" : formatMoneyInput(String(os.paid)));
  const [osDate, setOsDate] = useState(os.date ?? todayISODate());
  const [osNotes, setOsNotes] = useState(os.notes ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const draft = {
    osPrice: parseMoneyInput(osPrice),
    osPaidAmount: parseMoneyInput(osPaid),
    osDate,
    osNotes,
  };
  const priceValue = draft.osPrice ?? 0;
  const paidValue = draft.osPaidAmount ?? 0;
  const difference = draft.osPrice === null ? null : osDifference(priceValue, originalPrice);

  function close() {
    setStep("form");
    setFormError("");
    onClose();
  }

  function review() {
    const fieldErrors = validateOsDraft(draft);
    setErrors(fieldErrors);
    if (hasErrors(fieldErrors)) return;
    if (editing) return save();
    setStep("confirm");
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    setFormError("");
    const result = await giveOs(purchaseId, draft);
    setSaving(false);
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error);
      setStep("form");
      return;
    }
    toast.success(editing ? "OS details updated" : "OS recorded");
    close();
  }

  const summary = (
    <dl className="divide-y divide-line rounded-[var(--radius-control)] bg-surface-2 px-4">
      <DetailRow label="Original price">
        <span className="tabular">{formatRupiah(originalPrice)}</span>
      </DetailRow>
      <DetailRow label="OS price">
        <span className="tabular">{draft.osPrice === null ? "—" : formatRupiah(priceValue)}</span>
      </DetailRow>
      <DetailRow label="Received">
        <span className="tabular">{formatRupiah(paidValue)}</span>
      </DetailRow>
      <DetailRow label="OS remaining">
        <span className="tabular">
          {draft.osPrice === null ? "—" : formatRupiah(remainingAmount(priceValue, paidValue))}
        </span>
      </DetailRow>
      <DetailRow label="OS Difference">
        <span className="tabular">{difference === null ? "—" : formatSignedRupiah(difference)}</span>
      </DetailRow>
    </dl>
  );

  return (
    <Dialog
      open={open}
      onClose={close}
      title={step === "confirm" ? "Give this purchase through OS?" : editing ? "Edit OS details" : "Give OS"}
      description={
        step === "confirm"
          ? `${itemName} stays in your history, marked as Given OS. Its price, batch and costs don't change.`
          : itemName
      }
      footer={
        step === "confirm" ? (
          <>
            <Button variant="secondary" onClick={() => setStep("form")}>
              Back
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Confirm OS"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={review} disabled={saving}>
              {editing ? (saving ? "Saving…" : "Save OS details") : "Review"}
            </Button>
          </>
        )
      }
    >
      {step === "confirm" ? (
        summary
      ) : (
        <div className="flex flex-col gap-4">
          {formError && <FormAlert>{formError}</FormAlert>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="os-price" label="OS price" required error={errors.osPrice}>
              <MoneyInput
                id="os-price"
                value={osPrice}
                onValueChange={setOsPrice}
                placeholder="0"
                aria-invalid={Boolean(errors.osPrice)}
                aria-describedby={describedBy("os-price", errors.osPrice)}
              />
            </Field>
            <Field id="os-paid" label="Amount received" required error={errors.osPaidAmount}>
              <MoneyInput
                id="os-paid"
                value={osPaid}
                onValueChange={setOsPaid}
                placeholder="0"
                aria-invalid={Boolean(errors.osPaidAmount)}
                aria-describedby={describedBy("os-paid", errors.osPaidAmount)}
              />
            </Field>
          </div>
          <Field id="os-date" label="OS date" required error={errors.osDate}>
            <Input
              id="os-date"
              type="date"
              value={osDate}
              onChange={(event) => setOsDate(event.target.value)}
              aria-invalid={Boolean(errors.osDate)}
            />
          </Field>
          <Field id="os-notes" label="OS notes" optional error={errors.osNotes}>
            <Textarea
              id="os-notes"
              value={osNotes}
              onChange={(event) => setOsNotes(event.target.value)}
              rows={2}
              placeholder="e.g. OS to @minji, rest paid on arrival"
            />
          </Field>
          {summary}
        </div>
      )}
    </Dialog>
  );
}
