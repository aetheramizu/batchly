import { ArrowLeftRight, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  PAYMENT_STATUS_LABEL,
  TRACKING_STATUS_LABEL,
  type PaymentStatus,
  type TrackingStatus,
} from "@/lib/domain";
import { formatRupiah } from "@/lib/format";

type Tone = "neutral" | "slate" | "info" | "teal" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  slate: "bg-slate-100 text-slate-700",
  info: "bg-info-soft text-info",
  teal: "bg-teal-soft text-teal",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

const dots: Record<Tone, string> = {
  neutral: "bg-ink-3",
  slate: "bg-slate-500",
  info: "bg-info",
  teal: "bg-teal",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function Badge({
  tone = "neutral",
  dot,
  icon,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span aria-hidden="true" className={cn("size-1.5 rounded-full", dots[tone])} />
      )}
      {icon}
      {children}
    </span>
  );
}

export const TRACKING_TONE: Record<TrackingStatus, Tone> = {
  PURCHASED: "neutral",
  WAREHOUSE: "slate",
  IN_TRANSIT: "info",
  INDONESIA: "info",
  ADMIN_RECEIVED: "teal",
  DELIVERED: "success",
};

export function StatusBadge({
  status,
  className,
}: {
  status: TrackingStatus;
  className?: string;
}) {
  return (
    <Badge tone={TRACKING_TONE[status]} dot className={className}>
      {TRACKING_STATUS_LABEL[status]}
    </Badge>
  );
}

const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  PAID: "success",
  PARTIAL: "warning",
  UNPAID: "danger",
};

/** Payment status with the remaining amount where relevant (DESIGN_SYSTEM §23). */
export function PaymentBadge({
  status,
  remaining,
  className,
}: {
  status: PaymentStatus;
  remaining?: number;
  className?: string;
}) {
  const showRemaining = remaining !== undefined && status !== "PAID";
  return (
    <Badge tone={PAYMENT_TONE[status]} className={className}>
      {PAYMENT_STATUS_LABEL[status]}
      {showRemaining && (
        <span className="tabular font-normal">· {formatRupiah(remaining)} left</span>
      )}
    </Badge>
  );
}

export function OsBadge({
  kind,
  className,
}: {
  kind: "GIVEN" | "TAKEN";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border border-line-strong px-2 text-xs font-medium whitespace-nowrap text-ink-2 [&_svg]:size-3",
        className,
      )}
    >
      <ArrowLeftRight aria-hidden="true" />
      {kind === "GIVEN" ? "Given OS" : "Taken OS"}
    </span>
  );
}

/** "No update for N days" — never implies delay or loss (CLAUDE.md §18). */
export function StaleBadge({ days, className }: { days: number; className?: string }) {
  return (
    <Badge tone="warning" icon={<Clock aria-hidden="true" />} className={className}>
      No update for {days} days
    </Badge>
  );
}
