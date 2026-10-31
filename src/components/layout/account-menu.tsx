"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/cn";

export function AccountMenu({
  email,
  placement = "up",
  compact,
}: {
  email: string;
  placement?: "up" | "down";
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initial = email.charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setOpen(false);
        return;
      }
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={compact ? "Account" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-[var(--radius-control)] text-left select-none touch-manipulation transition-colors hover:bg-surface-2 active:bg-surface-3",
          compact ? "size-11 justify-center" : "w-full p-2",
        )}
      >
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white"
        >
          {initial}
        </span>
        {!compact && (
          <>
            <span className="min-w-0 flex-1 truncate text-sm text-ink-2">{email}</span>
            <ChevronsUpDown className="size-4 text-ink-3" aria-hidden="true" />
          </>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 w-64 max-w-[calc(100vw-2rem)] rounded-[var(--radius-card)] border border-line bg-surface p-1.5 shadow-[var(--shadow-float)]",
            placement === "up" ? "bottom-full left-0 mb-2" : "top-full right-0 mt-2",
          )}
        >
          <p className="truncate px-3 pt-2 pb-2.5 text-sm text-ink-3">
            Signed in as <span className="text-ink">{email}</span>
          </p>
          <form action={signOut} onSubmit={() => setSigningOut(true)}>
            <button
              type="submit"
              disabled={signingOut}
              className="flex min-h-[44px] h-11 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-ink hover:bg-surface-2 active:bg-surface-3 select-none touch-manipulation disabled:opacity-60"
            >
              <LogOut className="size-4 text-ink-3" aria-hidden="true" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
