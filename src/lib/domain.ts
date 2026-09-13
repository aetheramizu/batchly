// Product vocabulary and derived values.
// Source of truth: docs/DATA_MODEL.md §12–§21, CLAUDE.md §10–§18.
// Keep this file free of runtime imports so it can run under `node --test`.

import type { Database } from "@/lib/supabase/database.types";

type Enums = Database["public"]["Enums"];

export type SourceType = Enums["source_type"];
export type Country = Enums["country"];
export type TrackingStatus = Enums["tracking_status"];
export type PurchaseOrigin = Enums["purchase_origin"];
export type OwnershipStatus = Enums["ownership_status"];
export type CostType = Enums["additional_cost_type"];
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export const SOURCE_TYPES: SourceType[] = ["GROUP_ORDER", "DIRECT_SELLER"];

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  GROUP_ORDER: "Group Order",
  DIRECT_SELLER: "Direct Seller",
};

export const PLATFORMS = ["WhatsApp", "LINE", "X", "Other"] as const;

export const COUNTRIES: Country[] = [
  "CHINA",
  "KOREA",
  "JAPAN",
  "THAILAND",
  "SINGAPORE",
  "INDONESIA",
];

export const COUNTRY_LABEL: Record<Country, string> = {
  CHINA: "China",
  KOREA: "Korea",
  JAPAN: "Japan",
  THAILAND: "Thailand",
  SINGAPORE: "Singapore",
  INDONESIA: "Indonesia",
};

export const COUNTRY_CODE: Record<Country, string> = {
  CHINA: "CN",
  KOREA: "KR",
  JAPAN: "JP",
  THAILAND: "TH",
  SINGAPORE: "SG",
  INDONESIA: "ID",
};

export const TRACKING_STATUSES: TrackingStatus[] = [
  "PURCHASED",
  "WAREHOUSE",
  "IN_TRANSIT",
  "INDONESIA",
  "ADMIN_RECEIVED",
  "DELIVERED",
];

export const TRACKING_STATUS_LABEL: Record<TrackingStatus, string> = {
  PURCHASED: "Purchased",
  WAREHOUSE: "Warehouse",
  IN_TRANSIT: "In Transit",
  INDONESIA: "Indonesia",
  ADMIN_RECEIVED: "Admin Received",
  DELIVERED: "Delivered",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PARTIAL: "Partial",
  PAID: "Paid",
};

export const COST_TYPES: CostType[] = [
  "TAX",
  "PACKING",
  "DOMESTIC_SHIPPING",
  "OTHER",
];

export const COST_TYPE_LABEL: Record<CostType, string> = {
  TAX: "Tax",
  PACKING: "Packing",
  DOMESTIC_SHIPPING: "Domestic Shipping",
  OTHER: "Other",
};

/** Tracking with no update for this many days is flagged (CLAUDE.md §18). */
export const STALE_THRESHOLD_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

export function isTrackingStatus(value: unknown): value is TrackingStatus {
  return TRACKING_STATUSES.includes(value as TrackingStatus);
}

export function isCountry(value: unknown): value is Country {
  return COUNTRIES.includes(value as Country);
}

export function isCostType(value: unknown): value is CostType {
  return COST_TYPES.includes(value as CostType);
}

/** Derived payment status (DATA_MODEL §15, §20). Never stored. */
export function paymentStatus(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return "UNPAID";
  if (paid < total) return "PARTIAL";
  return "PAID";
}

export function remainingAmount(total: number, paid: number): number {
  return Math.max(total - paid, 0);
}

/** OS Difference = OS price − original purchase price (DATA_MODEL §21). */
export function osDifference(osPrice: number, originalPrice: number): number {
  return osPrice - originalPrice;
}

/** Whole days elapsed since `iso`, never negative. */
export function daysSince(iso: string, now: Date = new Date()): number {
  const elapsed = now.getTime() - new Date(iso).getTime();
  return Math.max(Math.floor(elapsed / DAY_MS), 0);
}

/**
 * Stale means "no tracking update recorded recently" — nothing more.
 * Delivered items are never stale (CLAUDE.md §18).
 */
export function isStale(
  status: TrackingStatus,
  lastUpdatedAt: string,
  now: Date = new Date(),
): boolean {
  if (status === "DELIVERED") return false;
  return daysSince(lastUpdatedAt, now) >= STALE_THRESHOLD_DAYS;
}
