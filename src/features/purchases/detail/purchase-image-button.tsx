"use client";

import { Camera, ImagePlus, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PurchaseThumb } from "@/components/ui/purchase-thumb";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { setPurchaseImage } from "../actions";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../form/image-field";

export function PurchaseImageButton({
  userId,
  purchaseId,
  itemName,
  src,
  disabled = false,
  className,
}: {
  userId: string;
  purchaseId: string;
  itemName: string;
  src: string | null;
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [optimisticUrl, setOptimisticUrl] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    return () => {
      if (optimisticUrl) URL.revokeObjectURL(optimisticUrl);
    };
  }, [optimisticUrl]);

  if (disabled) {
    return (
      <PurchaseThumb
        src={src}
        alt={`Image of ${itemName}`}
        size="lg"
        className={cn("w-24 sm:w-32", className)}
      />
    );
  }

  const displaySrc = optimisticUrl ?? src;

  async function handleFileChange(file: File | undefined) {
    if (!file || uploading) return;
    if (inputRef.current) inputRef.current.value = "";

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Use a JPG, PNG, WebP, GIF or HEIC image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Images must be 5 MB or smaller.");
      return;
    }

    const preview = URL.createObjectURL(file);
    setOptimisticUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });
    setUploading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("purchase-images")
        .upload(`${userId}/${purchaseId}/image`, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "60",
        });

      const result = error ? null : await setPurchaseImage(purchaseId, true);
      if (error || !result || !result.ok) {
        if (error) console.error("[batchly] upload image:", error);
        setOptimisticUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        toast.error(
          result && !result.ok ? result.error : "Couldn't upload the image. Please try again.",
        );
        return;
      }

      toast.success(src ? "Image updated" : "Image added");
      router.refresh();
    } catch {
      setOptimisticUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      toast.error("Couldn't upload the image. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn(" shrink-0", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        aria-label={displaySrc ? `Change image for ${itemName}` : `Add image for ${itemName}`}
        className={cn(
          "group relative block aspect-square w-24 overflow-hidden rounded-[var(--radius-card)] select-none touch-manipulation transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-32",
          displaySrc
            ? "bg-surface-2"
            : "border border-dashed border-line-strong bg-surface-2 text-ink-3 hover:border-accent hover:bg-accent-soft/40 hover:text-accent-ink",
        )}
      >
        {displaySrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displaySrc}
              alt={`Image of ${itemName}`}
              className="size-full object-cover transition-transform duration-150 group-hover:scale-[1.02]"
            />
            <span
              aria-hidden="true"
              className="absolute right-1.5 bottom-1.5 grid size-7 place-items-center rounded-full bg-ink/75 text-white shadow-sm backdrop-blur-xs transition-colors group-hover:bg-ink"
            >
              <Camera className="size-3.5" />
            </span>
          </>
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1 px-2 text-center">
            <ImagePlus className="size-6 stroke-[1.5]" aria-hidden="true" />
            <span className="text-[11px] leading-tight font-medium">Add image</span>
          </span>
        )}

        {uploading && (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center bg-ink/45 text-white backdrop-blur-[1px]"
          >
            <LoaderCircle className="size-6 animate-spin" />
          </span>
        )}
      </button>
    </div>
  );
}
