"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Native <dialog> modal. Centered on desktop, bottom sheet on mobile
 * (DESIGN_SYSTEM §34–35). Focus trapping and Esc come from the browser.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) dismisses.
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-[var(--radius-sheet)] bg-surface p-0 text-ink shadow-[var(--shadow-modal)] open:flex open:flex-col",
        "sm:m-auto sm:max-w-md sm:rounded-[var(--radius-sheet)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-6">
        <div className="min-w-0">
          <h2 id={titleId} className="font-display text-lg font-semibold">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-2 -mt-1 grid size-10 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="overflow-y-auto px-5 pb-5 sm:px-6">{open && children}</div>
      {footer && (
        <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6">
          {footer}
        </div>
      )}
    </dialog>
  );
}
