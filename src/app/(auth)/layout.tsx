import { Logo } from "@/components/brand/logo";
import { InstallButton } from "@/components/pwa/pwa-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center px-4 py-10 sm:justify-center sm:py-16">
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <InstallButton />
        <ThemeToggle />
      </div>
      <Logo className="mb-8 text-2xl" />
      <div className="w-full max-w-[420px] rounded-[var(--radius-sheet)] border border-line bg-surface p-6 sm:p-8">
        {children}
      </div>
      <p className="mt-6 max-w-[420px] text-center text-sm text-ink-3">
        One place for what you bought, where it is, and what you still owe.
      </p>
    </main>
  );
}
