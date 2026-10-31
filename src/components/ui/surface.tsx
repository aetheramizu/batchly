import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-card)] border border-line bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
  as: Heading = "h2",
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <Heading className="font-display text-base font-semibold text-ink break-words">
          {title}
        </Heading>
        {description && <p className="mt-0.5 text-sm text-ink-3 break-words">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:mb-6 sm:gap-4 lg:mb-8">
      {back}
      <div className="flex flex-wrap items-start justify-between gap-3 sm:items-end sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl leading-tight font-bold tracking-[-0.02em] text-ink text-balance sm:text-[28px] lg:text-[32px] break-words">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-prose text-[15px] text-ink-2 break-words">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 max-sm:has-[>.hidden:only-child]:hidden">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-4 py-10 sm:px-6 sm:py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 grid size-12 place-items-center rounded-full bg-surface-2 text-ink-2 [&_svg]:size-5">
          {icon}
        </div>
      )}
      <p className="font-display text-base font-semibold text-ink break-words">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink-2 break-words">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-surface-3/70", className)}
    />
  );
}

/** Label/value row used in detail summaries. */
export function DetailRow({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 py-2.5 text-sm",
        className,
      )}
    >
      <dt className="shrink-0 text-ink-2">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-ink break-words [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}
