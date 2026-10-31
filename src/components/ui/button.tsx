import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-medium whitespace-nowrap transition-colors duration-150 select-none touch-manipulation disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover active:bg-accent-hover",
  secondary:
    "border border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-2 active:bg-surface-3",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink active:bg-surface-3",
  danger: "border border-line bg-surface text-danger hover:bg-danger-soft active:bg-danger-soft/80",
};

const sizes: Record<Size, string> = {
  sm: "min-h-[40px] sm:min-h-9 h-10 sm:h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
