import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  TRACKING_STATUSES,
  TRACKING_STATUS_LABEL,
  type TrackingStatus,
} from "@/lib/domain";

/**
 * Six-step status rail. Statuses may be skipped, so the rail only shows the
 * current position — it does not claim earlier steps actually happened.
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
                      : "bg-ink/70"
                  : "bg-surface-3",
              )}
            />
            <span
              className={cn(
                "hidden items-center gap-1 text-xs leading-tight sm:flex",
                current ? "font-semibold text-ink" : reached ? "text-ink-2" : "text-ink-3",
              )}
            >
              {reached && !current && <Check className="size-3 shrink-0" aria-hidden="true" />}
              <span className="truncate">{TRACKING_STATUS_LABEL[step]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
