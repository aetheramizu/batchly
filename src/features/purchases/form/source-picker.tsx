"use client";

import { Check, ChevronDown, Plus, Search, Store, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { describedBy, Field, FormAlert, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { PLATFORMS, SOURCE_TYPE_LABEL, SOURCE_TYPES, type SourceType } from "@/lib/domain";
import type { FieldErrors } from "@/lib/validation";
import { createSource } from "@/features/sources/actions";
import type { SourceSummary } from "../queries";

export function sourceMeta(source: Pick<SourceSummary, "type" | "platform">) {
  return `${SOURCE_TYPE_LABEL[source.type]} · ${source.platform}`;
}

export function SourceIcon({ type, className }: { type: SourceType; className?: string }) {
  const Icon = type === "GROUP_ORDER" ? Users : Store;
  return <Icon className={className} aria-hidden="true" />;
}

export function SourcePicker({
  id,
  sources,
  value,
  onChange,
  onCreated,
  error,
}: {
  id: string;
  sources: SourceSummary[];
  value: string;
  onChange: (source: SourceSummary) => void;
  onCreated: (source: SourceSummary) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const selected = sources.find((source) => source.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? sources.filter((s) => `${s.name} ${s.platform}`.toLowerCase().includes(q))
      : sources;
  }, [query, sources]);

  function close() {
    setOpen(false);
    setCreating(false);
    setQuery("");
  }

  return (
    <>
      <button
        id={id}
        type="button"
        onClick={() => {
          setCreating(sources.length === 0);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-describedby={describedBy(id, error)}
        className={cn(
          "flex min-h-14 w-full items-center gap-3 rounded-[var(--radius-control)] border bg-surface px-3 py-2 text-left transition-colors hover:border-line-strong",
          error ? "border-danger" : "border-line",
        )}
      >
        {selected ? (
          <>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-2">
              <SourceIcon type={selected.type} className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-ink">{selected.name}</span>
              <span className="block truncate text-sm text-ink-3">{sourceMeta(selected)}</span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-[15px] text-ink-3">Choose where you bought it</span>
        )}
        <ChevronDown className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
      </button>

      <Dialog
        open={open}
        onClose={close}
        title={creating ? "Create source" : "Choose source"}
        description={
          creating
            ? "A source is the GO or seller you buy from. You can reuse it for future purchases."
            : undefined
        }
      >
        {creating ? (
          <CreateSourceForm
            onCancel={sources.length ? () => setCreating(false) : close}
            onCreated={(source) => {
              onCreated(source);
              close();
            }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {sources.length > 6 && (
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  aria-label="Search sources"
                  placeholder="Search sources"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            <ul className="-mx-2 flex flex-col" role="listbox" aria-label="Sources">
              {filtered.map((source) => {
                const isSelected = source.id === value;
                return (
                  <li key={source.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(source);
                        close();
                      }}
                      className={cn(
                        "flex min-h-14 w-full items-center gap-3 rounded-[var(--radius-control)] px-2 py-2 text-left hover:bg-surface-2",
                        isSelected && "bg-surface-2",
                      )}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-2">
                        <SourceIcon type={source.type} className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{source.name}</span>
                        <span className="block truncate text-sm text-ink-3">
                          {sourceMeta(source)}
                        </span>
                      </span>
                      {isSelected && <Check className="size-4 text-accent" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-2 py-6 text-center text-sm text-ink-3">
                  No sources match “{query}”.
                </li>
              )}
            </ul>

            <Button variant="secondary" onClick={() => setCreating(true)} className="w-full">
              <Plus aria-hidden="true" />
              Create source
            </Button>
          </div>
        )}
      </Dialog>
    </>
  );
}

function CreateSourceForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (source: SourceSummary) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<SourceType | "">("");
  const [platform, setPlatform] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (saving) return;
    setSaving(true);
    setFormError("");
    const result = await createSource({ name, type, platform });
    setSaving(false);
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      if (!result.fieldErrors) setFormError(result.error);
      return;
    }
    onCreated(result.data);
  }

  return (
    <div className="flex flex-col gap-4">
      {formError && <FormAlert>{formError}</FormAlert>}

      <Field id="source-name" label="Name" required error={errors.name}>
        <Input
          id="source-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. GO Seoulmate"
          autoFocus
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy("source-name", errors.name)}
        />
      </Field>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">
          Type<span className="text-accent-ink" aria-hidden="true"> *</span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {SOURCE_TYPES.map((option) => (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-[var(--radius-control)] border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                type === option
                  ? "border-accent bg-accent-soft"
                  : "border-line hover:border-line-strong",
              )}
            >
              <input
                type="radio"
                name="source-type"
                value={option}
                checked={type === option}
                onChange={() => setType(option)}
                className="sr-only"
              />
              <SourceIcon type={option} className="size-4 text-ink-2" />
              <span className="text-sm font-medium">{SOURCE_TYPE_LABEL[option]}</span>
              <span className="text-xs text-ink-3">
                {option === "GROUP_ORDER" ? "Uses batches" : "No batches"}
              </span>
            </label>
          ))}
        </div>
        {errors.type && <p className="text-sm text-danger">{errors.type}</p>}
      </fieldset>

      <Field id="source-platform" label="Platform" required error={errors.platform}>
        <Select
          id="source-platform"
          value={platform}
          onChange={(event) => setPlatform(event.target.value)}
          aria-invalid={Boolean(errors.platform)}
        >
          <option value="" disabled>
            Choose platform
          </option>
          {PLATFORMS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Back
        </Button>
        <Button onClick={submit} disabled={saving}>
          {saving ? "Creating…" : "Create source"}
        </Button>
      </div>
    </div>
  );
}
