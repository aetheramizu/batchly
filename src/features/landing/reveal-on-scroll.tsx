"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";

/**
 * Whether a one-shot scroll reveal can safely run: the observer API exists and
 * the user has not asked for reduced motion.
 */
function canAnimate() {
  return (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Flags wrapped content as "in" the first time it scrolls into view so CSS can
 * play a one-shot landing animation (see the .step-link / .step-num rules in
 * globals.css).
 *
 * The hidden "out" state is applied in a ref callback (before paint, so there is
 * no flash) and only when motion is allowed. With JavaScript disabled, when the
 * observer is unavailable, or when the user prefers reduced motion, no attribute
 * is ever set and the content simply stays visible — the animation is a pure
 * enhancement and can never hide content permanently.
 */
export function RevealOnScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);

  const attach = useCallback((node: HTMLDivElement | null) => {
    elRef.current = node;
    if (!node || !canAnimate()) return;
    // Guard so a re-invoked ref callback can never re-hide revealed content.
    if (node.dataset.reveal !== "in") node.dataset.reveal = "out";
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el || !canAnimate()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        el.dataset.reveal = "in";
        observer.disconnect();
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={attach} className={className}>
      {children}
    </div>
  );
}
