// Purchase list filtering (PRD §21, UX_SPEC §7–9). Pure — tested with node --test.

import type { Country, PaymentStatus, TrackingStatus } from "@/lib/domain";
import type { PurchaseView } from "./queries";

export type PurchaseTab = "all" | "active" | "delivered" | "os";
export type PaymentFilter = PaymentStatus | "OUTSTANDING";
export type PurchaseSort = "newest" | "oldest" | "price-desc" | "price-asc" | "updated";

export type PurchaseFilters = {
  q: string;
  tab: PurchaseTab;
  country: Country | "";
  source: string;
  status: TrackingStatus | "";
  payment: PaymentFilter | "";
  sort: PurchaseSort;
};

export const TABS: { value: PurchaseTab; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "all", label: "All" },
  { value: "delivered", label: "Delivered" },
  { value: "os", label: "OS" },
];

export const SORTS: { value: PurchaseSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "updated", label: "Recently updated" },
];

export const PAYMENT_FILTERS: { value: PaymentFilter; label: string }[] = [
  { value: "OUTSTANDING", label: "Not fully paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PAID", label: "Paid" },
];

const TRACKING = ["PURCHASED", "WAREHOUSE", "IN_TRANSIT", "INDONESIA", "ADMIN_RECEIVED", "DELIVERED"];
const COUNTRY = ["CHINA", "KOREA", "JAPAN", "THAILAND", "SINGAPORE", "INDONESIA"];

type Params = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function parsePurchaseFilters(params: Params): PurchaseFilters {
  const tab = one(params.tab);
  const status = one(params.status);
  const country = one(params.country);
  const payment = one(params.payment);
  const sort = one(params.sort);
  return {
    q: one(params.q).trim().slice(0, 100),
    tab: TABS.some((t) => t.value === tab) ? (tab as PurchaseTab) : "active",
    country: COUNTRY.includes(country) ? (country as Country) : "",
    source: one(params.source),
    status: TRACKING.includes(status) ? (status as TrackingStatus) : "",
    payment: PAYMENT_FILTERS.some((p) => p.value === payment) ? (payment as PaymentFilter) : "",
    sort: SORTS.some((s) => s.value === sort) ? (sort as PurchaseSort) : "newest",
  };
}

export function isOsPurchase(p: Pick<PurchaseView, "ownership_status" | "purchase_origin">) {
  return p.ownership_status === "GIVEN_OS" || p.purchase_origin === "TAKEN_OS";
}

export function matchesTab(p: PurchaseView, tab: PurchaseTab) {
  switch (tab) {
    case "active":
      return p.ownership_status === "ACTIVE" && p.status !== "DELIVERED";
    case "delivered":
      return p.status === "DELIVERED";
    case "os":
      return isOsPurchase(p);
    default:
      return true;
  }
}

function matchesSearch(p: PurchaseView, q: string) {
  if (!q) return true;
  const needle = q.toLowerCase();
  const haystack = [
    p.item_name,
    p.artist_group ?? "",
    p.source.name,
    p.batch ? `${p.batch.batch_number} batch ${p.batch.batch_number}` : "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

/** Everything except the tab, so tab counts reflect the other filters. */
export function applySecondaryFilters(purchases: PurchaseView[], f: PurchaseFilters) {
  return purchases.filter((p) => {
    if (!matchesSearch(p, f.q)) return false;
    if (f.country && p.effectiveCountry !== f.country) return false;
    if (f.source && p.source.id !== f.source) return false;
    if (f.status && p.status !== f.status) return false;
    if (f.payment === "OUTSTANDING" && p.payment === "PAID") return false;
    if (f.payment && f.payment !== "OUTSTANDING" && p.payment !== f.payment) return false;
    return true;
  });
}

export function sortPurchases(purchases: PurchaseView[], sort: PurchaseSort) {
  const sorted = [...purchases];
  const byDate = (a: PurchaseView, b: PurchaseView) =>
    a.purchase_date.localeCompare(b.purchase_date) || a.created_at.localeCompare(b.created_at);
  switch (sort) {
    case "oldest":
      return sorted.sort(byDate);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "updated":
      return sorted.sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt));
    default:
      return sorted.sort((a, b) => byDate(b, a));
  }
}

export function activeFilterCount(f: PurchaseFilters) {
  return [f.country, f.source, f.status, f.payment].filter(Boolean).length;
}
