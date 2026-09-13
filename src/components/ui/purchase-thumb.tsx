import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Purchase image or a neutral placeholder (DESIGN_SYSTEM §18).
 * Images come from short-lived signed URLs, so a plain <img> is used instead
 * of next/image to avoid proxying private storage through the optimizer.
 */
export function PurchaseThumb({
  src,
  alt,
  size = "md",
  className,
}: {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "size-10 rounded-lg",
    md: "size-14 rounded-xl",
    // Width comes from the caller; `cn` does not merge conflicting classes.
    lg: "aspect-square rounded-[var(--radius-card)]",
  };

  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center bg-surface-2 text-ink-3",
          sizes[size],
          className,
        )}
      >
        <ImageIcon className={size === "lg" ? "size-8" : "size-5"} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("shrink-0 bg-surface-2 object-cover", sizes[size], className)}
    />
  );
}
