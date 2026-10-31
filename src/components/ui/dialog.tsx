"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  // Portaled to <body> so inputs inside never submit a surrounding <form>.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open, mounted]);

  if (!mounted) return null;

  return createPortal(
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
        "m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden overscroll-contain rounded-t-[var(--radius-sheet)] bg-surface p-0 text-ink shadow-[var(--shadow-modal)] open:flex open:flex-col",
        "sm:m-auto sm:max-w-md sm:rounded-[var(--radius-sheet)]",
        className,
      )}
    >
      <div className="mx-auto mt-2.5 -mb-1 h-1 w-10 shrink-0 rounded-full bg-surface-3 sm:hidden" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4 px-5 pt-3.5 pb-3 sm:px-6 sm:pt-5">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-display text-lg font-semibold break-words">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-ink-2 break-words">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-2 -mt-1 grid size-11 sm:size-10 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink active:bg-surface-3 touch-manipulation"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div
        className={cn(
          "overflow-y-auto overscroll-contain px-5 sm:px-6",
          footer
            ? "pb-5 sm:pb-6"
            : "pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))] sm:pb-6",
        )}
      >
        {open && children}
      </div>
      {footer && (
        <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface px-5 py-3.5 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))] sm:flex-row sm:justify-end sm:px-6 sm:py-4">
          {footer}
        </div>
      )}
    </dialog>,
    document.body,
  );
}
