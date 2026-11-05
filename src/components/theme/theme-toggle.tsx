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
        "grid size-11 shrink-0 place-items-center rounded-full text-ink-3 select-none touch-manipulation transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-3",
        className,
      )}
    >
      <ThemeIcon className="size-[18px]" />
    </button>
  );
}
