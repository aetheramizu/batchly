import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { BottomNav, SidebarNav } from "@/components/layout/app-nav";
import { InstallButton } from "@/components/pwa/pwa-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ToastProvider } from "@/components/ui/toast";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { email } = await requireUser();

  return (
    <ToastProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-ink px-3 py-2 text-canvas focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center justify-between px-2">
          <Link href="/dashboard" aria-label="Batchly dashboard">
            <Logo />
          </Link>
          <div className="flex items-center gap-1.5">
            <InstallButton />
            <ThemeToggle />
          </div>
        </div>
        <SidebarNav />
        <div className="mt-auto border-t border-line pt-3">
          <AccountMenu email={email} />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur lg:hidden">
        <Link href="/dashboard" aria-label="Batchly dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-1.5">
          <InstallButton />
          <ThemeToggle />
          <AccountMenu email={email} placement="down" compact />
        </div>
      </header>

      <div className="lg:pl-64">
        <main
          id="main"
          className="mx-auto w-full max-w-6xl px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:pt-10 lg:pb-16"
        >
          {children}
        </main>
      </div>

      <BottomNav />
    </ToastProvider>
  );
}
