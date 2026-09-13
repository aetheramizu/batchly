"use client";

import { ImagePlus } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

/** What the form should do with the purchase image on save. */
export type ImageChange =
  | { kind: "keep" }
  | { kind: "remove" }
  | { kind: "replace"; file: File };

export function ImageField({
  existingSrc,
  change,
  onChange,
  itemName,
}: {
  existingSrc: string | null;
  change: ImageChange;
  onChange: (change: ImageChange) => void;
  itemName: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const previewUrl = useMemo(
    () => (change.kind === "replace" ? URL.createObjectURL(change.file) : null),
    [change],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Clear the native input when the form resets the image.
  useEffect(() => {
    if (change.kind === "keep" && !existingSrc && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [change, existingSrc]);

  const shownSrc = change.kind === "replace" ? previewUrl : change.kind === "keep" ? existingSrc : null;

  function pick(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Use a JPG, PNG, WebP, GIF or HEIC image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Images must be 5 MB or smaller.");
      return;
    }
    onChange({ kind: "replace", file });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium">
        Image <span className="font-normal text-ink-3">(optional)</span>
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(event) => pick(event.target.files?.[0])}
      />

      {shownSrc ? (
        <div className="flex items-center gap-3 rounded-[var(--radius-control)] border border-line p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shownSrc}
            alt={itemName ? `Image of ${itemName}` : "Purchase image"}
            className="size-16 rounded-lg bg-surface-2 object-cover"
          />
          <p className="min-w-0 flex-1 truncate text-sm text-ink-2">
            {change.kind === "replace" ? change.file.name : "Current image"}
          </p>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (inputRef.current) inputRef.current.value = "";
                onChange(existingSrc ? { kind: "remove" } : { kind: "keep" });
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed border-line-strong text-sm font-medium text-ink-2 transition-colors hover:border-ink-3 hover:bg-surface-2"
        >
          <ImagePlus className="size-5 text-ink-3" aria-hidden="true" />
          Add image
        </button>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
