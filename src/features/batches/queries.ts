import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { daysSince, isStale, type Country, type TrackingStatus } from "@/lib/domain";
import type { Database } from "@/lib/supabase/database.types";
import {
  PURCHASE_SELECT,
  toPurchaseView,
  withImageUrls,
  type PurchaseView,
  type SourceSummary,
} from "@/features/purchases/queries";

type Client = SupabaseClient<Database>;

const BATCH_SELECT = `
  id, batch_number, batch_date, country, status, last_updated_at, notes, source_id, created_at,
  source:sources!batches_source_id_user_id_fkey(id, name, type, platform),
  purchases:purchases!purchases_batch_id_source_id_user_id_fkey(price, paid_amount, archived_at)
` as const;

type BatchRow = {
  id: string;
  batch_number: string;
  batch_date: string | null;
  country: Country;
  status: TrackingStatus;
  last_updated_at: string;
  notes: string | null;
  source_id: string;
  created_at: string;
  source: SourceSummary | null;
  purchases: { price: number; paid_amount: number; archived_at: string | null }[];
};

export type BatchView = Omit<BatchRow, "purchases" | "source"> & {
  source: SourceSummary;
  purchaseCount: number;
  totalValue: number;
  daysSinceUpdate: number;
  stale: boolean;
};

function toBatchView(row: BatchRow, now: Date): BatchView {
  const { purchases, source, ...batch } = row;
  if (!source) throw new Error(`Batch ${row.id} is missing its source`);
  const active = purchases.filter((p) => !p.archived_at);
  return {
    ...batch,
    source,
    purchaseCount: active.length,
    totalValue: active.reduce((sum, p) => sum + Number(p.price), 0),
    daysSinceUpdate: daysSince(row.last_updated_at, now),
    stale: isStale(row.status, row.last_updated_at, now),
  };
}

export async function listBatches(supabase: Client): Promise<BatchView[]> {
  const { data, error } = await supabase
    .from("batches")
    .select(BATCH_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const now = new Date();
  return (data as unknown as BatchRow[])
    .map((row) => toBatchView(row, now))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getBatchWithPurchases(supabase: Client, id: string) {
  const [batchResult, purchasesResult] = await Promise.all([
    supabase.from("batches").select(BATCH_SELECT).eq("id", id).maybeSingle(),
    supabase
      .from("purchases")
      .select(PURCHASE_SELECT)
      .eq("batch_id", id)
      .is("archived_at", null)
      .order("purchase_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  if (batchResult.error) throw batchResult.error;
  if (purchasesResult.error) throw purchasesResult.error;
  if (!batchResult.data) return null;

  const now = new Date();
  const purchases: PurchaseView[] = await withImageUrls(
    supabase,
    (purchasesResult.data as unknown as Parameters<typeof toPurchaseView>[0][]).map((row) =>
      toPurchaseView(row, now),
    ),
  );

  return {
    batch: toBatchView(batchResult.data as unknown as BatchRow, now),
    purchases,
  };
}
