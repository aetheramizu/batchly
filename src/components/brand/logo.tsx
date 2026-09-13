import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display text-xl font-bold tracking-[-0.03em] text-ink",
        className,
      )}
    >
      Batchly
      <span aria-hidden="true" className="ml-0.5 size-[0.3em] rounded-full bg-accent" />
    </span>
  );
}
