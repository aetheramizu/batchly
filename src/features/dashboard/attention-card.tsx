import { ArrowLeftRight, CircleCheck, Clock, Receipt, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { STALE_THRESHOLD_DAYS } from "@/lib/domain";
import { formatRupiah, pluralize } from "@/lib/format";
import type { PurchaseView } from "../purchases/queries";

export type AttentionData = {
  staleBatches: number;
  staleDirect: PurchaseView[];
  outstanding: { count: number; amount: number };
  unpaidCosts: { count: number; amount: number };
  osToReceive: number;
};

/**
 * "What needs attention?" (PRD §20). Stale only means no recent tracking
 * update was recorded — never that something is late or lost.
 */
export function AttentionCard({ data }: { data: AttentionData }) {
  const items: { key: string; icon: LucideIcon; title: string; detail?: string; href: string }[] = [];

  if (data.staleBatches > 0) {
    items.push({
      key: "stale-batches",
      icon: Clock,
      title: `${pluralize(data.staleBatches, "batch", "batches")} not updated recently`,
      detail: `No tracking update in ${STALE_THRESHOLD_DAYS}+ days`,
      href: "/batches?status=needs-update",
    });
  }
  if (data.staleDirect.length > 0) {
    const [first] = data.staleDirect;
    items.push({
      key: "stale-direct",
      icon: Clock,
      title: `${pluralize(data.staleDirect.length, "Direct Seller purchase")} not updated recently`,
      detail:
        data.staleDirect.length === 1
          ? first.item_name
          : `${first.item_name} and ${data.staleDirect.length - 1} more`,
      href:
        data.staleDirect.length === 1
          ? `/purchases/${first.id}?from=dashboard`
          : "/purchases?sort=updated",
    });
  }
  if (data.outstanding.count > 0) {
    items.push({
      key: "outstanding",
      icon: Wallet,
      title: `${pluralize(data.outstanding.count, "purchase")} not fully paid`,
      detail: `${formatRupiah(data.outstanding.amount)} left to pay`,
      href: "/purchases?payment=OUTSTANDING",
    });
  }
  if (data.unpaidCosts.count > 0) {
    items.push({
      key: "costs",
      icon: Receipt,
      title: `${pluralize(data.unpaidCosts.count, "additional cost")} unpaid`,
      detail: formatRupiah(data.unpaidCosts.amount),
      href: "/finance#costs",
    });
  }
  if (data.osToReceive > 0) {
    items.push({
      key: "os",
      icon: ArrowLeftRight,
      title: "OS payment still to receive",
      detail: formatRupiah(data.osToReceive),
      href: "/finance#os",
    });
  }

  return (
    <Card>
      <CardHeader title="Needs attention" />
      {items.length === 0 ? (
        <div className="flex items-center gap-3 px-5 pb-5 text-sm text-ink-2">
          <CircleCheck className="size-5 text-success" aria-hidden="true" />
          All caught up. Nothing needs your attention right now.
        </div>
      ) : (
        <ul className="flex flex-col px-2 pb-3">
          {items.map(({ key, icon: Icon, title, detail, href }) => (
            <li key={key}>
              <Link
                href={href}
                className="flex items-start gap-3 rounded-[var(--radius-control)] px-3 py-2.5 transition-colors hover:bg-surface-2/60"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full [&_svg]:size-4",
                    key.startsWith("stale")
                      ? "bg-warning-soft text-warning"
                      : "bg-surface-2 text-ink-2",
                  )}
                >
                  <Icon />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{title}</span>
                  {detail && (
                    <span className="tabular block truncate text-sm text-ink-3">{detail}</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
