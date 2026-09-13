"use client";

import { cn } from "@/lib/cn";
import { useUpdateParams } from "./url-state";

/** Single-choice filter chips synced to one URL param. */
export function ChipFilter({
  param,
  value,
  options,
  label,
}: {
  param: string;
  value: string;
  options: { value: string; label: string; count?: number }[];
  label: string;
}) {
  const { update } = useUpdateParams();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value || "all"}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => update({ [param]: option.value || null })}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
              selected
                ? "border-ink bg-ink text-white"
                : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cn("tabular text-xs", selected ? "text-white/70" : "text-ink-3")}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
