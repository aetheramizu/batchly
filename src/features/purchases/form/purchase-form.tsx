"use client";

import { ArrowLeftRight, CircleCheck, Info, LoaderCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { describedBy, Field, FormAlert, Input, Select, Textarea } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Card, CardHeader } from "@/components/ui/surface";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import {
  COUNTRIES,
  COUNTRY_CODE,
  COUNTRY_LABEL,
  SOURCE_TYPE_LABEL,
  TRACKING_STATUSES,
  TRACKING_STATUS_LABEL,
  type Country,
  type PurchaseOrigin,
} from "@/lib/domain";
import { formatMoneyInput, parseMoneyInput, todayISODate } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import {
  hasErrors,
  validatePurchaseDraft,
  type FieldErrors,
  type PurchaseDraft,
} from "@/lib/validation";
import { createPurchase, setPurchaseImage, updatePurchase } from "../actions";
import type { BatchOption, SourceSummary } from "../queries";
import { PaymentSummary } from "../payment-summary";
import { BatchPicker } from "./batch-picker";
import { ImageField, type ImageChange } from "./image-field";
import { SourcePicker } from "./source-picker";

export type PurchaseFormInitial = {
  id: string;
  origin: PurchaseOrigin;
  sourceId: string;
  country: Country;
  batchId: string;
  trackingStatus: string;
  itemName: string;
  artistGroup: string;
  price: number;
  paidAmount: number;
  purchaseDate: string;
  notes: string;
  imageSrc: string | null;
};

type Props = {
  userId: string;
  sources: SourceSummary[];
  batches: BatchOption[];
} & (
  | {
      mode: "create";
      prefill: { origin: PurchaseOrigin; sourceId?: string; country?: Country; batchId?: string };
    }
  | { mode: "edit"; initial: PurchaseFormInitial }
);

// Field key → element id to focus when validation fails.
const FOCUS_TARGET: Record<string, string> = {
  sourceId: "source",
  country: "country-group",
  batchId: "batch-group",
  trackingStatus: "tracking-status",
  itemName: "item-name",
  artistGroup: "artist-group",
  price: "price",
  paidAmount: "paid-amount",
  purchaseDate: "purchase-date",
  notes: "notes",
};

export function PurchaseForm(props: Props) {
  const router = useRouter();
  const toast = useToast();
  const initial = props.mode === "edit" ? props.initial : null;
  const prefill = props.mode === "create" ? props.prefill : null;

  const [sources, setSources] = useState(props.sources);
  const [batches, setBatches] = useState(props.batches);

  const [origin, setOrigin] = useState<PurchaseOrigin>(initial?.origin ?? prefill?.origin ?? "NEW");
  const [sourceId, setSourceId] = useState(initial?.sourceId ?? prefill?.sourceId ?? "");
  const [country, setCountry] = useState<Country | "">(initial?.country ?? prefill?.country ?? "");
  const [batchId, setBatchId] = useState(initial?.batchId ?? prefill?.batchId ?? "");
  const [trackingStatus, setTrackingStatus] = useState(initial?.trackingStatus || "PURCHASED");
  const [itemName, setItemName] = useState(initial?.itemName ?? "");
  const [artistGroup, setArtistGroup] = useState(initial?.artistGroup ?? "");
  const [price, setPrice] = useState(initial ? formatMoneyInput(String(initial.price)) : "");
  const [paid, setPaid] = useState(initial ? formatMoneyInput(String(initial.paidAmount)) : "0");
  const [purchaseDate, setPurchaseDate] = useState(initial?.purchaseDate ?? todayISODate());
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [image, setImage] = useState<ImageChange>({ kind: "keep" });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState<"save" | "another" | null>(null);
  const [saved, setSaved] = useState<{ id: string; name: string } | null>(null);
  const [confirmMove, setConfirmMove] = useState(false);
  const savingRef = useRef(false);

  const source = sources.find((s) => s.id === sourceId) ?? null;
  const isGroupOrder = source?.type === "GROUP_ORDER";
  const priceLabel = origin === "TAKEN_OS" ? "OS price" : "Price";

  const batchOptions = useMemo(
    () =>
      source && country && isGroupOrder
        ? batches.filter((b) => b.source_id === source.id && b.country === country)
        : [],
    [batches, country, isGroupOrder, source],
  );
  const selectedBatch = batchOptions.find((b) => b.id === batchId) ?? null;

  function clearError(key: string) {
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function buildDraft(): PurchaseDraft {
    return {
      origin,
      sourceId,
      sourceType: source?.type ?? null,
      country,
      batchId: isGroupOrder ? batchId : "",
      itemName,
      artistGroup,
      price: parseMoneyInput(price),
      paidAmount: parseMoneyInput(paid),
      purchaseDate,
      trackingStatus: isGroupOrder ? "" : trackingStatus,
      notes,
    };
  }

  function focusFirstError(fieldErrors: FieldErrors) {
    const firstKey = Object.keys(FOCUS_TARGET).find((key) => fieldErrors[key]);
    const element = firstKey ? document.getElementById(FOCUS_TARGET[firstKey]) : null;
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.focus({ preventScroll: true });
  }

  /** Editing that changes where tracking comes from needs a confirmation (UX_SPEC §39). */
  function movesTrackingContext() {
    if (!initial) return false;
    const wasGroupOrder = Boolean(initial.batchId);
    if (wasGroupOrder !== isGroupOrder) return true;
    return isGroupOrder && initial.batchId !== batchId;
  }

  async function handleSave(addAnother: boolean, confirmed = false) {
    if (savingRef.current) return;

    const draft = buildDraft();
    const fieldErrors = validatePurchaseDraft(draft);
    setErrors(fieldErrors);
    setFormError("");
    if (hasErrors(fieldErrors)) {
      focusFirstError(fieldErrors);
      return;
    }

    if (!confirmed && movesTrackingContext()) {
      setConfirmMove(true);
      return;
    }

    savingRef.current = true;
    setSaving(addAnother ? "another" : "save");

    try {
      const result = initial
        ? await updatePurchase(initial.id, draft)
        : await createPurchase(draft);

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error);
        if (result.fieldErrors) focusFirstError(result.fieldErrors);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const purchaseId = result.data.id;
      const imageOk = await applyImageChange(purchaseId);

      if (addAnother) {
        setSaved({ id: purchaseId, name: draft.itemName.trim() });
        toast.success("Purchase added");
        setItemName("");
        setArtistGroup("");
        setPrice("");
        setPaid("0");
        setNotes("");
        setImage({ kind: "keep" });
        router.refresh();
        document.getElementById("item-name")?.focus();
        return;
      }

      if (imageOk) toast.success(initial ? "Purchase updated" : "Purchase added");
      router.push(`/purchases/${purchaseId}`);
    } catch {
      setFormError("Couldn't save this purchase. Check your connection and try again.");
    } finally {
      savingRef.current = false;
      setSaving(null);
    }
  }

  async function applyImageChange(purchaseId: string) {
    if (image.kind === "keep") return true;

    if (image.kind === "remove") {
      const result = await setPurchaseImage(purchaseId, false);
      if (!result.ok) toast.error("Purchase saved, but the image couldn't be removed.");
      return result.ok;
    }

    const supabase = createClient();
    const { error } = await supabase.storage
      .from("purchase-images")
      .upload(`${props.userId}/${purchaseId}/image`, image.file, {
        upsert: true,
        contentType: image.file.type,
        cacheControl: "60",
      });
    const result = error ? null : await setPurchaseImage(purchaseId, true);
    if (error || !result?.ok) {
      if (error) console.error("[batchly] upload image:", error);
      toast.error("Purchase saved, but the image didn't upload. Try again from Edit.");
      return false;
    }
    return true;
  }

  const backHref = initial ? `/purchases/${initial.id}` : "/purchases";

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        handleSave(false);
      }}
      className="flex flex-col gap-5"
    >
      {saved && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius-card)] border border-success/20 bg-success-soft px-4 py-3 text-sm text-success"
        >
          <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-ink">
            <strong className="font-semibold">{saved.name}</strong> saved. Source
            {isGroupOrder ? ", country and batch are" : " and country are"} kept for the next item.
          </span>
          <Link href={`/purchases/${saved.id}`} className="font-medium text-success underline">
            View purchase
          </Link>
        </div>
      )}

      {formError && <FormAlert>{formError}</FormAlert>}

      {/* Acquisition type */}
      {initial ? (
        origin === "TAKEN_OS" && (
          <p className="flex items-center gap-2 text-sm text-ink-2">
            <ArrowLeftRight className="size-4" aria-hidden="true" />
            This purchase was taken over through OS.
          </p>
        )
      ) : (
        <fieldset>
          <legend className="sr-only">What are you adding?</legend>
          <div className="grid grid-cols-2 gap-3">
            <OriginOption
              checked={origin === "NEW"}
              onSelect={() => setOrigin("NEW")}
              icon={<ShoppingBag />}
              title="New purchase"
              description="You bought it from a GO or seller."
            />
            <OriginOption
              checked={origin === "TAKEN_OS"}
              onSelect={() => setOrigin("TAKEN_OS")}
              icon={<ArrowLeftRight />}
              title="Take OS"
              description="You took over someone else's slot."
            />
          </div>
        </fieldset>
      )}

      {/* Source, country, batch */}
      <Card>
        <CardHeader
          title="Where it's from"
          description={
            source
              ? isGroupOrder
                ? "Group Order purchases belong to a batch. Tracking follows the batch."
                : "Direct Seller purchases have no batch. Tracking is set per purchase."
              : "Pick the GO or seller, then the country."
          }
        />
        <div className="flex flex-col gap-5 px-5 pb-5">
          <Field id="source" label="Source" required error={errors.sourceId}>
            <SourcePicker
              id="source"
              sources={sources}
              value={sourceId}
              error={errors.sourceId}
              onChange={(next) => {
                if (next.id !== sourceId) setBatchId("");
                setSourceId(next.id);
                clearError("sourceId");
              }}
              onCreated={(created) => {
                setSources((current) =>
                  [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
                );
                setSourceId(created.id);
                setBatchId("");
                clearError("sourceId");
                toast.success("Source created");
              }}
            />
          </Field>

          <fieldset
            id="country-group"
            tabIndex={-1}
            aria-describedby={errors.country ? "country-error" : undefined}
            className="focus:outline-none"
          >
            <legend className="mb-1.5 text-sm font-medium">
              Country<span className="text-accent-ink" aria-hidden="true"> *</span>
            </legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {COUNTRIES.map((option) => (
                <label
                  key={option}
                  className={cn(
                    "flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-control)] border text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                    country === option
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-surface text-ink-2 hover:border-line-strong",
                  )}
                >
                  <input
                    type="radio"
                    name="country"
                    value={option}
                    checked={country === option}
                    onChange={() => {
                      if (option !== country) setBatchId("");
                      setCountry(option);
                      clearError("country");
                    }}
                    className="sr-only"
                  />
                  <span className="tabular text-xs opacity-60">{COUNTRY_CODE[option]}</span>
                  {COUNTRY_LABEL[option]}
                </label>
              ))}
            </div>
            {errors.country && (
              <p id="country-error" className="mt-1.5 text-sm text-danger">
                {errors.country}
              </p>
            )}
          </fieldset>

          {source && country && isGroupOrder && (
            <div id="batch-group" tabIndex={-1} className="focus:outline-none">
              <BatchPicker
                batches={batchOptions}
                source={source}
                country={country}
                value={batchId}
                error={errors.batchId}
                onChange={(id) => {
                  setBatchId(id);
                  clearError("batchId");
                }}
                onCreated={(created) => {
                  setBatches((current) => [created, ...current]);
                  setBatchId(created.id);
                  clearError("batchId");
                  toast.success(`Batch ${created.batch_number} created`);
                }}
              />
            </div>
          )}

          {source && !isGroupOrder && (
            <Field
              id="tracking-status"
              label="Tracking status"
              required
              error={errors.trackingStatus}
              hint={initial ? undefined : "Most new purchases start as Purchased."}
            >
              <Select
                id="tracking-status"
                value={trackingStatus}
                onChange={(event) => {
                  setTrackingStatus(event.target.value);
                  clearError("trackingStatus");
                }}
                aria-describedby={describedBy("tracking-status", errors.trackingStatus, !initial)}
              >
                {TRACKING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {TRACKING_STATUS_LABEL[status]}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          {selectedBatch && (
            <p className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
              <Info className="size-4 text-ink-3" aria-hidden="true" />
              Tracking follows Batch {selectedBatch.batch_number}
              <StatusBadge status={selectedBatch.status} />
            </p>
          )}
        </div>
      </Card>

      {/* Item details */}
      <Card>
        <CardHeader title="Item details" />
        <div className="grid gap-5 px-5 pb-5 sm:grid-cols-2">
          <Field
            id="item-name"
            label="Item / member name"
            required
            error={errors.itemName}
            className="sm:col-span-2"
          >
            <Input
              id="item-name"
              value={itemName}
              onChange={(event) => {
                setItemName(event.target.value);
                clearError("itemName");
              }}
              placeholder="e.g. Juun PC"
              autoComplete="off"
              aria-invalid={Boolean(errors.itemName)}
              aria-describedby={describedBy("item-name", errors.itemName)}
            />
          </Field>

          <Field id="artist-group" label="Artist / group" optional error={errors.artistGroup}>
            <Input
              id="artist-group"
              value={artistGroup}
              onChange={(event) => setArtistGroup(event.target.value)}
              placeholder="e.g. SEVENTEEN"
              autoComplete="off"
            />
          </Field>

          <Field id="purchase-date" label="Purchase date" required error={errors.purchaseDate}>
            <Input
              id="purchase-date"
              type="date"
              value={purchaseDate}
              onChange={(event) => {
                setPurchaseDate(event.target.value);
                clearError("purchaseDate");
              }}
              aria-invalid={Boolean(errors.purchaseDate)}
              aria-describedby={describedBy("purchase-date", errors.purchaseDate)}
            />
          </Field>

          <Field
            id="price"
            label={priceLabel}
            required
            error={errors.price}
            hint={origin === "TAKEN_OS" ? "What you pay to take over this slot." : undefined}
          >
            <MoneyInput
              id="price"
              value={price}
              onValueChange={(value) => {
                setPrice(value);
                clearError("price");
                clearError("paidAmount");
              }}
              placeholder="0"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={describedBy("price", errors.price, origin === "TAKEN_OS")}
            />
          </Field>

          <Field
            id="paid-amount"
            label="Paid amount"
            required
            error={errors.paidAmount}
            action={
              price ? (
                <button
                  type="button"
                  onClick={() => {
                    setPaid(price);
                    clearError("paidAmount");
                  }}
                  className="h-7 text-sm font-medium text-accent-ink hover:underline"
                >
                  Paid in full
                </button>
              ) : undefined
            }
          >
            <MoneyInput
              id="paid-amount"
              value={paid}
              onValueChange={(value) => {
                setPaid(value);
                clearError("paidAmount");
              }}
              placeholder="0"
              aria-invalid={Boolean(errors.paidAmount)}
              aria-describedby={describedBy("paid-amount", errors.paidAmount)}
            />
          </Field>

          <PaymentSummary
            total={parseMoneyInput(price)}
            paid={parseMoneyInput(paid)}
            totalLabel={priceLabel}
            className="sm:col-span-2"
          />

          <div className="sm:col-span-2">
            <ImageField
              existingSrc={initial?.imageSrc ?? null}
              change={image}
              onChange={setImage}
              itemName={itemName}
            />
          </div>

          <Field
            id="notes"
            label="Notes"
            optional
            error={errors.notes}
            className="sm:col-span-2"
            hint={origin === "TAKEN_OS" ? "You can note who you took the OS from." : undefined}
          >
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={origin === "TAKEN_OS" ? "e.g. Taken OS from Sarah" : "e.g. Blue back PC"}
              rows={3}
            />
          </Field>
        </div>
      </Card>

      {/* Actions */}
      <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 -mx-1 rounded-[var(--radius-card)] border border-line bg-surface/95 p-3 shadow-[var(--shadow-float)] backdrop-blur lg:bottom-4">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href={backHref}
            className="hidden h-11 items-center px-3 text-sm font-medium text-ink-2 hover:text-ink sm:mr-auto sm:inline-flex"
          >
            Cancel
          </Link>
          {!initial && (
            <Button
              variant="secondary"
              disabled={saving !== null}
              onClick={() => handleSave(true)}
            >
              {saving === "another" && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {saving === "another" ? "Saving…" : "Save & add another"}
            </Button>
          )}
          <Button type="submit" disabled={saving !== null}>
            {saving === "save" && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            {saving === "save" ? "Saving…" : initial ? "Save changes" : "Save purchase"}
          </Button>
        </div>
      </div>

      <Dialog
        open={confirmMove}
        onClose={() => setConfirmMove(false)}
        title="Move this purchase?"
        description={
          isGroupOrder
            ? `Its tracking status will come from ${
                selectedBatch ? `Batch ${selectedBatch.batch_number}` : "the selected batch"
              } instead.`
            : `It will no longer belong to a batch. Tracking will be set on this purchase (${TRACKING_STATUS_LABEL[trackingStatus as keyof typeof TRACKING_STATUS_LABEL] ?? "Purchased"}).`
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmMove(false)}>
              Keep editing
            </Button>
            <Button
              onClick={() => {
                setConfirmMove(false);
                handleSave(false, true);
              }}
            >
              Move purchase
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-2">
          Source: {source?.name} ({source ? SOURCE_TYPE_LABEL[source.type] : ""})
        </p>
      </Dialog>
    </form>
  );
}

function OriginOption({
  checked,
  onSelect,
  icon,
  title,
  description,
}: {
  checked: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-2 rounded-[var(--radius-card)] border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent sm:flex-row sm:items-start sm:gap-3",
        checked ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong",
      )}
    >
      <input
        type="radio"
        name="origin"
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg [&_svg]:size-[18px]",
          checked ? "bg-accent text-white" : "bg-surface-2 text-ink-2",
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span>
        <span className="block font-display font-semibold">{title}</span>
        <span className="mt-0.5 block text-sm text-ink-2">{description}</span>
      </span>
    </label>
  );
}
