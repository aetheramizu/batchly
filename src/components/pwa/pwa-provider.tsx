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

let state: PwaState = INITIAL_STATE;
let deferredPrompt: InstallPromptEvent | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function update(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // iPadOS reports a desktop Safari UA, so check for touch on Mac as well.
  const isIpad = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  if (/iphone|ipad|ipod/i.test(ua) || isIpad) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function isStandalone() {
  return (
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
  });

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
    update({
      promptAvailable: false,
      installed: choice.outcome === "accepted" ? true : state.installed,
    });
    return "prompted";
  } catch {
    // The event can only be used once; fall back to manual instructions.
    deferredPrompt = null;
    update({ promptAvailable: false });
    return "instructions";
  }
}

type PwaContextValue = PwaState & {
  /** Worth showing an install control at all. */
  available: boolean;
  install: () => Promise<void>;
};

const PwaContext = createContext<PwaContextValue | null>(null);

export function PwaProvider({ children }: { children: ReactNode }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dialogOpen, setDialogOpen] = useState(false);

  const install = useCallback(async () => {
    if ((await requestInstall()) === "instructions") setDialogOpen(true);
  }, []);

  const available =
    !current.installed && (current.promptAvailable || current.platform !== "desktop");

  const value = useMemo(
    () => ({ ...current, available, install }),
    [current, available, install],
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
          <IosSteps />
        ) : (
          <BrowserSteps canPrompt={current.promptAvailable} />
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

function IosSteps() {
  return (
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
        Tap <span className="font-medium text-ink">Add</span> to finish. Batchly then opens from
        your home screen.
      </Step>
      <p className="pt-1 text-xs text-ink-3">
        Only Safari on iOS 16.4 or later can add the app. If you do not see the option, update iOS
        first.
      </p>
    </ol>
  );
}

function BrowserSteps({ canPrompt }: { canPrompt: boolean }) {
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
  );
}
