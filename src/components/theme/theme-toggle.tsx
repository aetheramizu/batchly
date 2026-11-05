"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "./theme-provider";

/**
 * Both icons render always; CSS picks the right one from the `dark` class so
 * the correct glyph is visible before hydration.
 */
function ThemeIcon({ className }: { className?: string }) {
  return (
    <>
      <Moon className={cn("dark:hidden", className)} aria-hidden="true" />
      <Sun className={cn("hidden dark:block", className)} aria-hidden="true" />
    </>
  );
}

/** Compact icon button for headers and toolbars. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "grid size-10 sm:size-9 shrink-0 cursor-pointer place-items-center rounded-[var(--radius-control)] border border-line bg-surface text-ink-2 shadow-2xs select-none touch-manipulation transition-all hover:border-line-strong hover:bg-surface-2 hover:text-ink active:scale-95 active:bg-surface-3",
        className,
      )}
    >
      <ThemeIcon className="size-[18px]" />
    </button>
  );
}
