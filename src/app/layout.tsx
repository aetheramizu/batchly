import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const description =
  "A personal purchase tracker for collectors. Keep track of group orders, direct seller purchases, payments, tracking, additional costs and OS.";

const shareImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Batchly — personal purchase tracker for collectors",
};

export const metadata: Metadata = {
  // Absolute base for share image URLs. Without SITE_URL, Next.js falls back
  // to the Vercel deployment URL (or localhost in development).
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: {
    default: "Batchly",
    template: "%s · Batchly",
  },
  description,
  applicationName: "Batchly",
  appleWebApp: {
    capable: true,
    title: "Batchly",
    statusBarStyle: "default",
  },
  // Safari still reads the Apple-specific flag for home-screen launches.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  openGraph: {
    type: "website",
    siteName: "Batchly",
    title: "Batchly",
    description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Batchly",
    description,
    images: [shareImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f3",
  colorScheme: "light dark",
};

/**
 * Applies the stored theme before the first paint so a dark-mode user never
 * sees a light flash. Mirrors ThemeProvider's storage key and DOM contract.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("batchly-theme");if(t==="dark"){var r=document.documentElement;r.classList.add("dark");r.dataset.theme="dark";r.style.colorScheme="dark";}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <PwaProvider>{children}</PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
