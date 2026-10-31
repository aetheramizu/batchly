// Form validation shared by client forms (UX) and server actions (integrity).
// The database constraints remain the final guard (CLAUDE.md §37).
// Keep free of runtime imports (tested with `node --test`).

import type {
  Country,
  PurchaseOrigin,
  SourceType,
  TrackingStatus,
} from "@/lib/domain";

export type FieldErrors = Partial<Record<string, string>>;

const COUNTRY_VALUES = [
  "CHINA",
  "KOREA",
  "JAPAN",
  "THAILAND",
  "SINGAPORE",
  "INDONESIA",
];
const STATUS_VALUES = [
  "PURCHASED",
  "WAREHOUSE",
  "IN_TRANSIT",
  "INDONESIA",
  "ADMIN_RECEIVED",
  "DELIVERED",
];
const COST_VALUES = ["TAX", "PACKING", "DOMESTIC_SHIPPING", "OTHER"];

export const MAX_TEXT = 200;
export const MAX_NOTES = 2000;

export function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** Validates an amount pair such as price/paid or OS price/OS paid. */
export function validatePayment(
  total: number | null,
  paid: number | null,
  labels: { total: string; paid: string },
  keys: { total: string; paid: string },
): FieldErrors {
  const errors: FieldErrors = {};

  if (total === null) {
    errors[keys.total] = `${labels.total} is required.`;
  } else if (total < 0) {
    errors[keys.total] = `${labels.total} cannot be negative.`;
  }

  if (paid === null) {
    errors[keys.paid] = `${labels.paid} is required.`;
  } else if (paid < 0) {
    errors[keys.paid] = `${labels.paid} cannot be negative.`;
  } else if (total !== null && paid > total) {
    errors[keys.paid] = `${labels.paid} cannot exceed ${labels.total.toLowerCase()}.`;
  }

  return errors;
}

export interface PurchaseDraft {
  origin: PurchaseOrigin;
  sourceId: string;
  sourceType: SourceType | null;
  country: string;
  batchId: string;
  itemName: string;
  artistGroup: string;
  price: number | null;
  paidAmount: number | null;
  purchaseDate: string;
  trackingStatus: string;
  notes: string;
}

export function validatePurchaseDraft(draft: PurchaseDraft): FieldErrors {
  const errors: FieldErrors = {};
  const priceLabel = draft.origin === "TAKEN_OS" ? "OS price" : "Price";

  if (!draft.sourceId || !draft.sourceType) {
    errors.sourceId = "Choose a source.";
  }

  if (!COUNTRY_VALUES.includes(draft.country)) {
    errors.country = "Country is required.";
  }

  if (draft.sourceType === "GROUP_ORDER" && !draft.batchId) {
    errors.batchId = "Batch is required.";
  }

  if (draft.sourceType === "DIRECT_SELLER") {
    if (draft.batchId) errors.batchId = "Batch must not be selected.";
    if (!STATUS_VALUES.includes(draft.trackingStatus)) {
      errors.trackingStatus = "Choose a tracking status.";
    }
  }

  const itemName = draft.itemName.trim();
  if (!itemName) {
    errors.itemName = "Item name is required.";
  } else if (itemName.length > MAX_TEXT) {
    errors.itemName = `Keep the item name under ${MAX_TEXT} characters.`;
  }

  if (draft.artistGroup.trim().length > MAX_TEXT) {
    errors.artistGroup = `Keep the artist/group under ${MAX_TEXT} characters.`;
  }

  Object.assign(
    errors,
    validatePayment(
      draft.price,
      draft.paidAmount,
      { total: priceLabel, paid: "Paid amount" },
      { total: "price", paid: "paidAmount" },
    ),
  );

  if (!draft.purchaseDate) {
    errors.purchaseDate = "Purchase date is required.";
  } else if (!isISODate(draft.purchaseDate)) {
    errors.purchaseDate = "Enter a valid date.";
  }

  if (draft.notes.length > MAX_NOTES) {
    errors.notes = `Keep notes under ${MAX_NOTES} characters.`;
  }

  return errors;
}

export interface SourceDraft {
  name: string;
  type: string;
  platform: string;
}

export function validateSourceDraft(draft: SourceDraft): FieldErrors {
  const errors: FieldErrors = {};
  const name = draft.name.trim();
  if (!name) errors.name = "Source name is required.";
  else if (name.length > MAX_TEXT)
    errors.name = `Keep the name under ${MAX_TEXT} characters.`;
  if (draft.type !== "GROUP_ORDER" && draft.type !== "DIRECT_SELLER") {
    errors.type = "Choose a source type.";
  }
  if (!draft.platform.trim()) errors.platform = "Platform is required.";
  return errors;
}

export interface BatchDraft {
  batchNumber: string;
  batchDate?: string | null;
  country?: Country | string;
}

export function validateBatchDraft(draft: BatchDraft): FieldErrors {
  const errors: FieldErrors = {};
  const batchNumber = draft.batchNumber.trim();
  if (!batchNumber) errors.batchNumber = "Batch number is required.";
  else if (batchNumber.length > MAX_TEXT)
    errors.batchNumber = `Keep the batch name under ${MAX_TEXT} characters.`;
  const batchDate = draft.batchDate?.trim() ?? "";
  if (batchDate && !isISODate(batchDate)) {
    errors.batchDate = "Enter a valid date.";
  }
  if (draft.country !== undefined && !COUNTRY_VALUES.includes(draft.country)) {
    errors.country = "Country is required.";
  }
  return errors;
}

export interface OsDraft {
  osPrice: number | null;
  osPaidAmount: number | null;
  osDate: string;
  osNotes: string;
}

export function validateOsDraft(draft: OsDraft): FieldErrors {
  const errors = validatePayment(
    draft.osPrice,
    draft.osPaidAmount,
    { total: "OS price", paid: "Amount received" },
    { total: "osPrice", paid: "osPaidAmount" },
  );
  if (!draft.osDate) errors.osDate = "OS date is required.";
  else if (!isISODate(draft.osDate)) errors.osDate = "Enter a valid date.";
  if (draft.osNotes.length > MAX_NOTES)
    errors.osNotes = `Keep notes under ${MAX_NOTES} characters.`;
  return errors;
}

export interface CostDraft {
  type: string;
  amount: number | null;
  notes: string;
}

export function validateCostDraft(draft: CostDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (!COST_VALUES.includes(draft.type)) errors.type = "Choose a cost type.";
  if (draft.amount === null) errors.amount = "Amount is required.";
  else if (draft.amount < 0) errors.amount = "Amount cannot be negative.";
  if (draft.notes.length > MAX_NOTES)
    errors.notes = `Keep notes under ${MAX_NOTES} characters.`;
  return errors;
}

export function isTrackingStatusValue(value: string): value is TrackingStatus {
  return STATUS_VALUES.includes(value);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
