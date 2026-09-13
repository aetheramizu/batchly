"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { formatMoneyInput } from "@/lib/format";
import { controlClasses } from "./field";

/** Rupiah amount input: digits only, grouped with dots while typing. */
export function MoneyInput({
  value,
  onValueChange,
  className,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[15px] text-ink-3"
      >
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(event) => onValueChange(formatMoneyInput(event.target.value))}
        className={cn(controlClasses, "tabular h-11 pl-10", className)}
        {...props}
      />
    </div>
  );
}
