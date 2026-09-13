"use client";

import { LoaderCircle, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { controlClasses } from "./field";

/** Returns a function that merges params into the current URL (replace, no scroll). */
export function useUpdateParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return { update, pending };
}

/** Search box synced to the `q` URL param, debounced (UX_SPEC §8). */
export function SearchInput({
  placeholder,
  label,
  className,
}: {
  placeholder: string;
  label: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const urlValue = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlValue);
  const { update, pending } = useUpdateParams();
  const timer = useRef<number | undefined>(undefined);
  const [prevUrlValue, setPrevUrlValue] = useState(urlValue);

  // Reset the box when the URL search is cleared elsewhere (e.g. "Clear filters").
  if (urlValue !== prevUrlValue) {
    setPrevUrlValue(urlValue);
    if (!urlValue) setValue("");
  }

  function onChange(next: string) {
    setValue(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      update({ q: next.trim() || null });
    }, 250);
  }

  return (
    <div className={cn("relative", className)}>
      {pending ? (
        <LoaderCircle
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-ink-3"
          aria-hidden="true"
        />
      ) : (
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
          aria-hidden="true"
        />
      )}
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(controlClasses, "h-11 bg-surface-2 pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden")}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 grid w-10 place-items-center text-ink-3 hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
