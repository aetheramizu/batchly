"use client";

import { Archive, ArchiveRestore } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { setPurchaseArchived } from "../actions";

export function ArchiveButton({
  purchaseId,
  itemName,
  archived,
}: {
  purchaseId: string;
  itemName: string;
  archived: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function run(nextArchived: boolean) {
    if (saving) return;
    setSaving(true);
    const result = await setPurchaseArchived(purchaseId, nextArchived);
    setSaving(false);
    if (!result.ok) return toast.error(result.error);
    setOpen(false);
    if (nextArchived) {
      toast.success("Purchase archived");
      router.push("/purchases");
    } else {
      toast.success("Purchase restored");
    }
  }

  if (archived) {
    return (
      <Button onClick={() => run(false)} disabled={saving}>
        <ArchiveRestore aria-hidden="true" />
        {saving ? "Restoring…" : "Restore purchase"}
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <Archive aria-hidden="true" />
        Archive
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Archive this purchase?"
        description={`${itemName} will be hidden from your lists and counts. Its payments, costs and OS details stay in your records, and you can restore it from Archived purchases.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Keep purchase
            </Button>
            <Button variant="danger" onClick={() => run(true)} disabled={saving}>
              {saving ? "Archiving…" : "Archive purchase"}
            </Button>
          </>
        }
      >
        <span className="sr-only">Confirm archive</span>
      </Dialog>
    </>
  );
}
