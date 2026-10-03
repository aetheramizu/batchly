import Image from "next/image";
import { AudioLines, Package, ReceiptText, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Framed preview of the real Batchly dashboard, with small floating tiles that
 * echo the product's iconography.
 *
 * The screenshot is a static asset (public/batchly-dashboard.png) so the
 * authenticated dashboard implementation stays untouched.
 */
const FLOATS: { icon: LucideIcon; position: string; rotation: string }[] = [
  {
    icon: AudioLines,
    position: "-left-[75px] top-[90px]",
    rotation: "-rotate-[9deg]",
  },
  {
    icon: ReceiptText,
    position: "-top-[38px] right-5",
    rotation: "rotate-[9deg]",
  },
  {
    icon: Package,
    position: "-right-[66px] bottom-[90px]",
    rotation: "rotate-[8deg]",
  },
];

export function ProductPreview({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[820px]", className)}>
      {/* Soft coral glow pooled behind the frame. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 rounded-[30px] blur-[20px]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 55%, var(--color-accent-glow), transparent 67%)",
          opacity: 0.45,
        }}
      />

      {FLOATS.map(({ icon: Icon, position, rotation }) => (
        <span
          key={position}
          aria-hidden="true"
          className={cn(
            "absolute z-10 hidden size-[54px] place-items-center rounded-[15px] border border-white bg-surface/85 text-accent shadow-[var(--shadow-float)] lg:grid",
            position,
            rotation,
          )}
        >
          <Icon className="size-6" strokeWidth={1.8} />
        </span>
      ))}

      <div className="overflow-hidden rounded-[20px] border border-white bg-surface/70 p-[7px] shadow-[var(--shadow-preview)]">
        <Image
          src="/batchly-dashboard.png"
          alt="The Batchly dashboard showing spending totals, where purchases are, and which ones need attention."
          width={1264}
          height={719}
          priority
          sizes="(min-width: 1024px) 820px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
          className="block h-auto w-full rounded-[14px]"
        />
      </div>
    </div>
  );
}
