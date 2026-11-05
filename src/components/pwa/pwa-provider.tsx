"use client";

import { Download, MoreVertical, Plus, Share } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

type Platform = "ios" | "android" | "desktop";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PwaState = {
  /** Running standalone or the install already completed. */
  installed: boolean;
  /** Chromium exposed its native install prompt. */
  promptAvailable: boolean;
  platform: Platform;
};

const INITIAL_STATE: PwaState = {
  installed: false,
  promptAvailable: false,
  platform: "desktop",
};

export const PWA_INSTALLED_KEY = "batchly-pwa-installed";

let state: PwaState = INITIAL_STATE;
let deferredPrompt: InstallPromptEvent | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function update(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  // iPadOS reports a desktop Safari UA, so check for touch on Mac as well.
  const isIpad = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  if (/iphone|ipad|ipod/i.test(ua) || isIpad) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const inStorage = (() => {
    try {
      return localStorage.getItem(PWA_INSTALLED_KEY) === "true";
    } catch {
      return false;
    }
  })();
  return (
    inStorage ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  update({ installed: isStandalone(), platform: detectPlatform() });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    update({ promptAvailable: true });
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    update({ installed: true, promptAvailable: false });
    try {
      localStorage.setItem(PWA_INSTALLED_KEY, "true");
    } catch {}
  });

  // Check if Chrome already has this app installed
  if ("getInstalledRelatedApps" in navigator) {
    (navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> })
      .getInstalledRelatedApps?.()
      .then((apps) => {
        if (apps && apps.length > 0) {
          update({ installed: true, promptAvailable: false });
          try {
            localStorage.setItem(PWA_INSTALLED_KEY, "true");
          } catch {}
        }
      })
      .catch(() => {});
  }

  // Pass-through worker: its fetch handler satisfies Chromium's install
  // heuristics without caching, so auth and Supabase data stay untouched.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

function subscribe(listener: () => void) {
  init();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return INITIAL_STATE;
}

/** Native prompt when available, otherwise ask the UI for manual steps. */
async function requestInstall(): Promise<"prompted" | "instructions"> {
  if (!deferredPrompt) return "instructions";

  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    const accepted = choice.outcome === "accepted";
    update({
      promptAvailable: false,
      installed: accepted ? true : state.installed,
    });
    if (accepted) {
      try {
        localStorage.setItem(PWA_INSTALLED_KEY, "true");
      } catch {}
    }
    return "prompted";
  } catch {
    deferredPrompt = null;
    update({ promptAvailable: false });
    return "instructions";
  }
}

type PwaContextValue = PwaState & {
  /** Worth showing an install control at all. */
  available: boolean;
  install: () => Promise<void>;
  markInstalled: () => void;
};

const PwaContext = createContext<PwaContextValue | null>(null);

export function PwaProvider({ children }: { children: ReactNode }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dialogOpen, setDialogOpen] = useState(false);

  const install = useCallback(async () => {
    if ((await requestInstall()) === "instructions") setDialogOpen(true);
  }, []);

  const markInstalled = useCallback(() => {
    update({ installed: true, promptAvailable: false });
    try {
      localStorage.setItem(PWA_INSTALLED_KEY, "true");
    } catch {}
    setDialogOpen(false);
  }, []);

  const available =
    !current.installed && (current.promptAvailable || current.platform !== "desktop");

  const value = useMemo(
    () => ({ ...current, available, install, markInstalled }),
    [current, available, install, markInstalled],
  );

  return (
    <PwaContext.Provider value={value}>
      {children}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Install Batchly"
        description="Add Batchly to your home screen and open it like a regular app."
      >
        {current.platform === "ios" ? (
          <IosSteps onDone={markInstalled} />
        ) : (
          <BrowserSteps canPrompt={current.promptAvailable} onDone={markInstalled} />
        )}
      </Dialog>
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) throw new Error("usePwa must be used inside PwaProvider");
  return context;
}

/**
 * Compact Install icon button for headers. Automatically hides when the app
 * is installed or running in standalone mode.
 */
export function InstallButton({ className }: { className?: string }) {
  const { available, install } = usePwa();
  if (!available) return null;

  return (
    <button
      type="button"
      onClick={() => void install()}
      aria-label="Install app"
      title="Install app"
      className={cn(
        "grid size-10 sm:size-9 shrink-0 cursor-pointer place-items-center rounded-[var(--radius-control)] border border-line bg-surface text-ink-2 shadow-2xs select-none touch-manipulation transition-all hover:border-line-strong hover:bg-surface-2 hover:text-ink active:scale-95 active:bg-surface-3",
        className,
      )}
    >
      <Download className="size-[18px]" aria-hidden="true" />
    </button>
  );
}

function Step({ index, children }: { index: number; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="tabular grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-ink-2">
        {index}
      </span>
      <span className="text-sm text-ink-2">{children}</span>
    </li>
  );
}

function IosSteps({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-3">
        <Step index={1}>
          <span className="inline-flex items-center gap-1.5 text-ink">
            Tap the Share button
            <Share className="size-4 text-info" aria-hidden="true" />
          </span>{" "}
          in Safari&apos;s toolbar.
        </Step>
        <Step index={2}>
          Scroll the menu and choose{" "}
          <span className="font-medium text-ink">
            Add to Home Screen{" "}
            <Plus className="inline size-3.5 align-[-2px] text-ink-3" aria-hidden="true" />
          </span>
          .
        </Step>
        <Step index={3}>
          Tap <span className="font-medium text-ink">Add</span> to finish. Batchly will then open from
          your home screen.
        </Step>
      </ol>
      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <p className="text-xs text-ink-3">Requires iOS 16.4+ in Safari.</p>
        <button
          type="button"
          onClick={onDone}
          className="rounded-[var(--radius-control)] bg-surface-2 px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-3 active:scale-95"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function BrowserSteps({ canPrompt, onDone }: { canPrompt: boolean; onDone: () => void }) {
  if (canPrompt) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink-2">
          Your browser supports one-tap installation. Open the install prompt to continue.
        </p>
        <button
          type="button"
          onClick={() => void requestInstall()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Download className="size-4" aria-hidden="true" />
          Install app
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink-2">
          This browser has no automatic install prompt. Use the browser menu instead:
        </p>
        <ol className="flex flex-col gap-3">
          <Step index={1}>
            Open the browser menu
            <MoreVertical className="ml-1 inline size-4 align-[-3px] text-ink-3" aria-hidden="true" />
          </Step>
          <Step index={2}>
            Choose <span className="font-medium text-ink">Install app</span> or{" "}
            <span className="font-medium text-ink">Add to Home screen</span>.
          </Step>
          <Step index={3}>
            Confirm the prompt. Batchly then opens from your home screen.
          </Step>
        </ol>
      </div>
      <div className="flex justify-end border-t border-line pt-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-[var(--radius-control)] bg-surface-2 px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-3 active:scale-95"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
