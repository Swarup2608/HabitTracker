"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Palette, X } from "lucide-react";
import { CinematicHero } from "@/components/ui/cinematic-landing-hero";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Testimonials } from "@/components/sections/testimonials";
import { Footer } from "@/components/sections/footer";
import { TopNav } from "@/components/sections/top-nav";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ThemeModePicker } from "@/components/ui/ThemeModePicker";
import { useAuth } from "@/stores/auth";

function ThemeDrawer() {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Open theme picker"
          className="pointer-events-auto fixed bottom-24 right-6 z-[60] flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-4 py-3 text-sm font-semibold text-foreground shadow-2xl shadow-black/30 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card hover:shadow-[0_20px_50px_-12px_rgba(109,40,217,0.55)] focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Theme</span>
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl rounded-t-3xl border-x border-t border-border/60 bg-card/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom-1/2 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=open]:duration-300"
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border/70" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Theme modes</DialogPrimitive.Title>
              <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Pick your home page world</h2>
              <DialogPrimitive.Description className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Switch instantly between Dark, Light, Gaming, and Fantasy modes and see how Loop Atom adapts before you sign in.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="mt-6">
            <ThemeModePicker />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const loading = useAuth((s) => s.loading);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <>
        {!loading && <TopNav />}
        <LoadingScreen onComplete={handleLoadingComplete} />
      </>
    );
  }

  return (
    <>
      <div className="md:block hidden">{!loading && <TopNav />}</div>
      <div className="overflow-x-hidden w-full min-h-screen relative pointer-events-none atomic-age">
        <CinematicHero
          brandName="Loop Atom"
          tagline1="Count what counts,"
          tagline2="every single day."
          cardHeading="Small habits, serious momentum."
          cardDescription={
            <>
              <span className="text-white font-semibold">Loop Atom</span> turns daily habits into visible streaks, so showing up tomorrow feels easier than skipping it.
            </>
          }
          metricValue={147}
          metricLabel="Day Streak"
          ctaHeading="Build the next 100 days."
          ctaDescription="Join 200,000+ people quietly stacking wins with Loop Atom. One tap a day is all it takes."
        />
        <div className="relative pointer-events-auto">
          <Features />
          <HowItWorks />
          <Testimonials />
          <Footer />
        </div>
      </div>
      <ThemeDrawer />
    </>
  );
}
