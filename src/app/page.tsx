import type { Metadata } from "next";
import { LandingBackdrop } from "@/features/landing/landing-backdrop";
import { LandingCta } from "@/features/landing/landing-cta";
import { LandingFeatures } from "@/features/landing/landing-features";
import { LandingFooter } from "@/features/landing/landing-footer";
import { LandingHeader } from "@/features/landing/landing-header";
import { LandingHero } from "@/features/landing/landing-hero";
import { LandingHowItWorks } from "@/features/landing/landing-how-it-works";

export const metadata: Metadata = {
  title: "Batchly — Your collection, organized",
  description:
    "Keep track of your Group Orders, Direct Seller purchases, payments, and deliveries—all in one place.",
};

export default function LandingPage() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-clip bg-canvas">
      <LandingBackdrop />
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
