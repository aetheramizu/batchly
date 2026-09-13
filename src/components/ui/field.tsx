import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export const controlClasses =
  "w-full rounded-[var(--radius-control)] border border-line bg-surface px-3 text-[15px] text-ink placeholder:text-ink-3 transition-colors hover:border-line-strong focus:border-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent/30 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3 aria-invalid:border-danger";

export function Field({
  id,
  label,
  required,
  optional,
  hint,
  error,
  action,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  required?: boolean;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex min-h-5 items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required && (
            <span className="text-accent-ink" aria-hidden="true">
              {" "}
              *
            </span>
          )}
          {optional && <span className="font-normal text-ink-3"> (optional)</span>}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClasses, "h-11", className)} {...props} />;
}

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b6b73' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export function Select({ className, style, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(controlClasses, "h-11 appearance-none bg-no-repeat pr-9", className)}
      style={{
        backgroundImage: chevron,
        backgroundPosition: "right 0.75rem center",
        ...style,
      }}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(controlClasses, "min-h-24 py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-[var(--radius-control)] border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm text-danger"
    >
      {children}
    </div>
  );
}
