import { cn } from "@/lib/cn";
import {
  TRACKING_STATUSES,
  TRACKING_STATUS_LABEL,
  type TrackingStatus,
} from "@/lib/domain";

/**
 * Six-step status rail showing where the current status sits. Statuses may be
 * skipped and no history is stored, so earlier steps are not marked as done.
 */
export function TrackingRail({
  status,
  className,
}: {
  status: TrackingStatus;
  className?: string;
}) {
  const currentIndex = TRACKING_STATUSES.indexOf(status);
  const delivered = status === "DELIVERED";

  return (
    <ol
      className={cn("grid grid-cols-6 gap-1.5", className)}
      aria-label={`Tracking status: ${TRACKING_STATUS_LABEL[status]}`}
    >
      {TRACKING_STATUSES.map((step, index) => {
        const reached = index <= currentIndex;
        const current = index === currentIndex;
        return (
          <li
            key={step}
            className="flex min-w-0 flex-col gap-2"
            aria-current={current ? "step" : undefined}
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-1.5 rounded-full",
                reached
                  ? delivered
                    ? "bg-success"
                    : current
                      ? "bg-accent"
                      : "bg-ink/20"
                  : "bg-surface-3",
              )}
            />
            <span
              className={cn(
                "hidden items-center gap-1 text-xs leading-tight sm:flex",
                current ? "font-semibold text-ink" : "text-ink-3",
              )}
            >
              <span className="truncate">{TRACKING_STATUS_LABEL[step]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
