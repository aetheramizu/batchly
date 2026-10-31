import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  daysSince,
  isStale,
  paymentStatus,
  remainingAmount,
  type Country,
  type PaymentStatus,
  type TrackingStatus,
} from "@/lib/domain";
import type { Database, Tables } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export const PURCHASE_SELECT = `
  *,
  source:sources!purchases_source_id_user_id_fkey(id, name, type, platform),
  batch:batches!purchases_batch_id_source_id_user_id_fkey(id, batch_number, country, status, last_updated_at, batch_date)
` as const;

export type SourceSummary = Pick<Tables<"sources">, "id" | "name" | "type" | "platform">;
export type BatchSummary = Pick<
  Tables<"batches">,
  "id" | "batch_number" | "country" | "status" | "last_updated_at" | "batch_date"
>;

type PurchaseRow = Tables<"purchases"> & {
  source: SourceSummary | null;
  batch: BatchSummary | null;
};

/**
 * A purchase with its tracking context resolved.
 * Group Order: status/last update/country come from the batch.
 * Direct Seller: they live on the purchase (DATA_MODEL §11).
 */
export type PurchaseView = Tables<"purchases"> & {
  source: SourceSummary;
  batch: BatchSummary | null;
  effectiveCountry: Country;
  status: TrackingStatus;
  lastUpdatedAt: string;
  daysSinceUpdate: number;
  stale: boolean;
  payment: PaymentStatus;
  remaining: number;
  imageSrc: string | null;
};

export function toPurchaseView(row: PurchaseRow, now = new Date()): PurchaseView {
  if (!row.source) throw new Error(`Purchase ${row.id} is missing its source`);
  const status = (row.batch?.status ?? row.tracking_status ?? "PURCHASED") as TrackingStatus;
  const lastUpdatedAt = row.batch?.last_updated_at ?? row.last_updated_at ?? row.created_at;
  const price = Number(row.price);
  const paid = Number(row.paid_amount);

  return {
    ...row,
    price,
    paid_amount: paid,
    os_price: row.os_price === null ? null : Number(row.os_price),
    os_paid_amount: row.os_paid_amount === null ? null : Number(row.os_paid_amount),
    source: row.source,
    batch: row.batch,
    effectiveCountry: (row.batch?.country ?? row.country ?? "INDONESIA") as Country,
    status,
    lastUpdatedAt,
    daysSinceUpdate: daysSince(lastUpdatedAt, now),
    stale: isStale(status, lastUpdatedAt, now),
    payment: paymentStatus(price, paid),
    remaining: remainingAmount(price, paid),
    imageSrc: null,
  };
}

const IMAGE_BUCKET = "purchase-images";
const SIGNED_URL_SECONDS = 60 * 60;

export function purchaseImagePath(userId: string, purchaseId: string) {
  return `${userId}/${purchaseId}/image`;
}

/** Adds short-lived signed URLs for purchase images (private bucket). */
export async function withImageUrls(
  supabase: Client,
  purchases: PurchaseView[],
): Promise<PurchaseView[]> {
  const paths = purchases.map((p) => p.image_url).filter((p): p is string => Boolean(p));
  if (paths.length === 0) return purchases;

  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (error) {
    console.error("[batchly] sign image urls:", error);
    return purchases;
  }

  const urls = new Map(
    (data ?? []).filter((d) => d.signedUrl && d.path).map((d) => [d.path!, d.signedUrl]),
  );
  return purchases.map((p) => ({
    ...p,
    imageSrc: p.image_url ? (urls.get(p.image_url) ?? null) : null,
  }));
}

export type PurchaseScope = "active" | "archived" | "all";

export async function listPurchases(
  supabase: Client,
  { scope = "active", withImages = false }: { scope?: PurchaseScope; withImages?: boolean } = {},
) {
  let query = supabase
    .from("purchases")
    .select(PURCHASE_SELECT)
    .order("purchase_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (scope === "active") query = query.is("archived_at", null);
  if (scope === "archived") query = query.not("archived_at", "is", null);

  const { data, error } = await query;
  if (error) throw error;

  const now = new Date();
  const views = (data as unknown as PurchaseRow[]).map((row) => toPurchaseView(row, now));
  return withImages ? withImageUrls(supabase, views) : views;
}

export async function getPurchase(supabase: Client, id: string) {
  const { data, error } = await supabase
    .from("purchases")
    .select(PURCHASE_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [view] = await withImageUrls(supabase, [
    toPurchaseView(data as unknown as PurchaseRow),
  ]);
  return view;
}

export type BatchOption = BatchSummary & {
  source_id: string;
  purchaseCount: number;
};

/** Sources and batches for the purchase form pickers. */
export async function getPurchaseFormOptions(supabase: Client) {
  const [sourcesResult, batchesResult] = await Promise.all([
    supabase.from("sources").select("id, name, type, platform").order("name"),
    supabase
      .from("batches")
      .select(
        "id, source_id, batch_number, country, status, last_updated_at, batch_date, purchases(archived_at)",
      )
      .order("created_at", { ascending: false }),
  ]);
  if (sourcesResult.error) throw sourcesResult.error;
  if (batchesResult.error) throw batchesResult.error;

  const batches: BatchOption[] = batchesResult.data.map(({ purchases, ...batch }) => ({
    ...batch,
    purchaseCount: purchases.filter((p) => !p.archived_at).length,
  }));

  return { sources: sourcesResult.data as SourceSummary[], batches };
}

export type CostRow = Pick<
  Tables<"additional_costs">,
  "id" | "purchase_id" | "type" | "amount" | "paid" | "notes" | "created_at"
>;

export async function listCosts(supabase: Client, purchaseIds?: string[]) {
  let query = supabase
    .from("additional_costs")
    .select("id, purchase_id, type, amount, paid, notes, created_at")
    .order("created_at");
  if (purchaseIds) query = query.in("purchase_id", purchaseIds);
  const { data, error } = await query;
  if (error) throw error;
  return data.map((cost) => ({ ...cost, amount: Number(cost.amount) })) as CostRow[];
}
