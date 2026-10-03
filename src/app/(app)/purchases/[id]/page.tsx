import { Archive, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OsBadge, PaymentBadge, StatusBadge } from "@/components/ui/badge";
import { BackLink } from "@/components/ui/back-link";
import { ButtonLink } from "@/components/ui/button";
import { PurchaseThumb } from "@/components/ui/purchase-thumb";
import { Card, CardHeader, DetailRow } from "@/components/ui/surface";
import { ArchiveButton } from "@/features/purchases/detail/archive-button";
import { CostsCard } from "@/features/purchases/detail/costs-card";
import { OsCard } from "@/features/purchases/detail/os-card";
import { PaymentCard } from "@/features/purchases/detail/payment-card";
import { TrackingCard } from "@/features/purchases/detail/tracking-card";
import { getPurchase, listCosts } from "@/features/purchases/queries";
import { requireUser } from "@/lib/auth";
import { COUNTRY_LABEL, SOURCE_TYPE_LABEL } from "@/lib/domain";
import { formatDate, formatRupiah } from "@/lib/format";
import { isUuid } from "@/lib/validation";

export const metadata: Metadata = { title: "Purchase" };

/** Where "Back" goes, preserving navigation context (UX_SPEC §54). */
function backTarget(from: string | undefined) {
  if (from?.startsWith("batch:") && isUuid(from.slice(6))) {
    return { href: `/batches/${from.slice(6)}`, label: "Back to batch" };
  }
  if (from === "dashboard") return { href: "/dashboard", label: "Dashboard" };
  if (from === "finance") return { href: "/finance", label: "Finance" };
  return { href: "/purchases", label: "Purchases" };
}

export default async function PurchaseDetailPage({
  params,
  searchParams,
}: PageProps<"/purchases/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!isUuid(id)) notFound();

  const { supabase } = await requireUser();
  const purchase = await getPurchase(supabase, id);
  if (!purchase) notFound();

  const [costs, batchCount] = await Promise.all([
    listCosts(supabase, [purchase.id]),
    purchase.batch_id
      ? supabase
          .from("purchases")
          .select("id", { count: "exact", head: true })
          .eq("batch_id", purchase.batch_id)
          .is("archived_at", null)
          .then(({ count }) => count ?? 0)
      : Promise.resolve(0),
  ]);

  const back = backTarget(typeof query.from === "string" ? query.from : undefined);
  const givenOs = purchase.ownership_status === "GIVEN_OS";
  const takenOs = purchase.purchase_origin === "TAKEN_OS";
  const archivedAt = purchase.archived_at;

  return (
    <div className="flex flex-col gap-5">
      <BackLink href={back.href}>{back.label}</BackLink>

      {archivedAt && (
        <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface-2 px-4 py-3 text-sm">
          <Archive className="size-4 text-ink-3" aria-hidden="true" />
          <p className="flex-1 text-ink-2">
            Archived on {formatDate(archivedAt)}. It&apos;s hidden from your lists and counts.
          </p>
          <ArchiveButton purchaseId={purchase.id} itemName={purchase.item_name} archived />
        </div>
      )}

      {/* Summary */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <PurchaseThumb
            src={purchase.imageSrc}
            alt={`Image of ${purchase.item_name}`}
            size="lg"
            className="w-24 sm:w-32"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={purchase.status} />
              {givenOs && <OsBadge kind="GIVEN" />}
              {takenOs && <OsBadge kind="TAKEN" />}
            </div>
            <h1 className="mt-2.5 font-display text-2xl leading-tight font-bold tracking-[-0.02em] text-balance sm:text-[28px]">
              {purchase.item_name}
            </h1>
            {purchase.artist_group && (
              <p className="mt-1 text-[15px] text-ink-2">{purchase.artist_group}</p>
            )}
            <p className="mt-3 text-sm text-ink-2">
              {purchase.source.name}
              <span className="text-ink-3">
                {" "}
                · {SOURCE_TYPE_LABEL[purchase.source.type]} ·{" "}
                {COUNTRY_LABEL[purchase.effectiveCountry]}
              </span>
              {purchase.batch && (
                <>
                  {" · "}
                  <Link
                    href={`/batches/${purchase.batch.id}`}
                    className="font-medium text-accent-ink hover:underline"
                  >
                    Batch {purchase.batch.batch_number}
                  </Link>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-row items-end justify-between gap-3 border-t border-line pt-4 sm:flex-col sm:border-0 sm:pt-0">
            <div className="sm:text-right">
              <p className="text-sm text-ink-3">{takenOs ? "OS price" : "Price"}</p>
              <p className="tabular font-display text-2xl font-bold">
                {formatRupiah(purchase.price)}
              </p>
            </div>
            <PaymentBadge status={purchase.payment} remaining={purchase.remaining} />
          </div>
        </div>
        {!archivedAt && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <ButtonLink href={`/purchases/${purchase.id}/edit`} variant="secondary" size="sm">
              <Pencil aria-hidden="true" />
              Edit purchase
            </ButtonLink>
            <div className="ml-auto">
              <ArchiveButton
                purchaseId={purchase.id}
                itemName={purchase.item_name}
                archived={false}
              />
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <TrackingCard
            purchaseId={purchase.id}
            status={purchase.status}
            lastUpdatedAt={purchase.lastUpdatedAt}
            daysSinceUpdate={purchase.daysSinceUpdate}
            stale={purchase.stale}
            batch={
              purchase.batch
                ? {
                    id: purchase.batch.id,
                    number: purchase.batch.batch_number,
                    purchaseCount: batchCount,
                  }
                : null
            }
          />
          <PaymentCard
            purchaseId={purchase.id}
            price={purchase.price}
            paid={purchase.paid_amount}
            takenOs={takenOs}
          />
          <CostsCard purchaseId={purchase.id} costs={costs} givenOs={givenOs} />
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <OsCard
            purchaseId={purchase.id}
            itemName={purchase.item_name}
            originalPrice={purchase.price}
            givenOs={givenOs}
            takenOs={takenOs}
            os={{
              price: purchase.os_price,
              paid: purchase.os_paid_amount,
              date: purchase.os_date,
              notes: purchase.os_notes,
            }}
          />

          <Card>
            <CardHeader title="Details" />
            <dl className="divide-y divide-line px-5 pb-3">
              <DetailRow label="Purchase date">{formatDate(purchase.purchase_date)}</DetailRow>
              <DetailRow label="Source">{purchase.source.name}</DetailRow>
              <DetailRow label="Source type">{SOURCE_TYPE_LABEL[purchase.source.type]}</DetailRow>
              <DetailRow label="Platform">{purchase.source.platform}</DetailRow>
              <DetailRow label="Country">{COUNTRY_LABEL[purchase.effectiveCountry]}</DetailRow>
              {purchase.batch && (
                <DetailRow label="Batch">
                  <Link
                    href={`/batches/${purchase.batch.id}`}
                    className="text-accent-ink hover:underline"
                  >
                    Batch {purchase.batch.batch_number}
                  </Link>
                </DetailRow>
              )}
              <DetailRow label="Acquired as">{takenOs ? "Taken OS" : "New purchase"}</DetailRow>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Notes" />
            <div className="px-5 pb-5">
              {purchase.notes ? (
                <p className="text-sm leading-relaxed whitespace-pre-line text-ink-2">
                  {purchase.notes}
                </p>
              ) : (
                <p className="text-sm text-ink-3">
                  No notes.{" "}
                  {!archivedAt && (
                    <Link
                      href={`/purchases/${purchase.id}/edit`}
                      className="text-accent-ink hover:underline"
                    >
                      Add a note
                    </Link>
                  )}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
