import type { Metadata } from "next";
import { BackLink } from "@/components/ui/back-link";
import { PageHeader } from "@/components/ui/surface";
import { PurchaseForm } from "@/features/purchases/form/purchase-form";
import { getPurchaseFormOptions } from "@/features/purchases/queries";
import { requireUser } from "@/lib/auth";
import { isCountry } from "@/lib/domain";

export const metadata: Metadata = { title: "Add purchase" };

export default async function NewPurchasePage({ searchParams }: PageProps<"/purchases/new">) {
  const params = await searchParams;
  const { supabase, userId } = await requireUser();
  const { sources, batches } = await getPurchaseFormOptions(supabase);

  // Optional context, e.g. "Add purchase" from a batch page (UX_SPEC §53).
  const batch = batches.find((b) => b.id === params.batch);
  const source = sources.find((s) => s.id === (batch?.source_id ?? params.source));
  const country = batch?.country ?? (isCountry(params.country) ? params.country : undefined);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        back={<BackLink href={batch ? `/batches/${batch.id}` : "/purchases"}>Back</BackLink>}
        title="Add purchase"
        description="Record what you bought. Payment status and remaining amount are worked out for you."
      />
      <PurchaseForm
        mode="create"
        userId={userId}
        sources={sources}
        batches={batches}
        prefill={{
          origin: params.mode === "os" ? "TAKEN_OS" : "NEW",
          sourceId: source?.id,
          country,
          batchId: batch?.id,
        }}
      />
    </div>
  );
}
