import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { PageHeader } from "@/components/ui/surface";
import { PurchaseForm } from "@/features/purchases/form/purchase-form";
import { getPurchase, getPurchaseFormOptions } from "@/features/purchases/queries";
import { requireUser } from "@/lib/auth";
import { isUuid } from "@/lib/validation";

export const metadata: Metadata = { title: "Edit purchase" };

export default async function EditPurchasePage({ params }: PageProps<"/purchases/[id]/edit">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const { supabase, userId } = await requireUser();
  const [purchase, options] = await Promise.all([
    getPurchase(supabase, id),
    getPurchaseFormOptions(supabase),
  ]);
  if (!purchase) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        back={<BackLink href={`/purchases/${purchase.id}`}>Back to purchase</BackLink>}
        title="Edit purchase"
        description={purchase.item_name}
      />
      <PurchaseForm
        mode="edit"
        userId={userId}
        sources={options.sources}
        batches={options.batches}
        initial={{
          id: purchase.id,
          origin: purchase.purchase_origin,
          sourceId: purchase.source.id,
          country: purchase.effectiveCountry,
          batchId: purchase.batch_id ?? "",
          trackingStatus: purchase.tracking_status ?? "",
          itemName: purchase.item_name,
          artistGroup: purchase.artist_group ?? "",
          price: purchase.price,
          paidAmount: purchase.paid_amount,
          purchaseDate: purchase.purchase_date,
          notes: purchase.notes ?? "",
          imageSrc: purchase.imageSrc,
        }}
      />
    </div>
  );
}
