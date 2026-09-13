import { cn } from "@/lib/cn";
import { LogoMark } from "./logo-mark";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display text-xl font-bold tracking-[-0.03em] text-ink",
        className,
      )}
    >
      <LogoMark className="size-[1.2em] text-accent" />
      <span>Batchly</span>
    </span>
  );
}
