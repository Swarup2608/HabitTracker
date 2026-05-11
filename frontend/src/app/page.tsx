import { CinematicHero } from "@/components/ui/cinematic-landing-hero";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Testimonials } from "@/components/sections/testimonials";
import { Footer } from "@/components/sections/footer";
import { TopNav } from "@/components/sections/top-nav";

export default function Home() {
  return (
    <>
    <TopNav />
    <div className="overflow-x-hidden w-full min-h-screen relative pointer-events-none">
      <CinematicHero
        brandName="Tally"
        tagline1="Count what counts,"
        tagline2="every single day."
        cardHeading="Small habits, serious momentum."
        cardDescription={
          <>
            <span className="text-white font-semibold">Tally</span> turns daily habits into visible streaks, so showing up tomorrow feels easier than skipping it.
          </>
        }
        metricValue={147}
        metricLabel="Day Streak"
        ctaHeading="Build the next 100 days."
        ctaDescription="Join 200,000+ people quietly stacking wins with Tally. One tap a day is all it takes."
      />
      <div className="relative pointer-events-auto">
        <Features />
        <HowItWorks />
        <Testimonials />
        <Footer />
      </div>
    </div>
    </>
  );
}
