import { Flame, LineChart, BellRing, Trophy, Users, ShieldCheck } from "lucide-react";

const features = [
  { icon: Flame, title: "Streak Tracking", desc: "Visualize unbroken streaks and feel the pull to keep them alive every single day." },
  { icon: LineChart, title: "Progress Analytics", desc: "Beautiful charts surface patterns you'd otherwise miss — weekly, monthly, lifetime." },
  { icon: BellRing, title: "Smart Reminders", desc: "Gentle, context-aware nudges that respect your schedule and your focus." },
  { icon: Trophy, title: "Milestones", desc: "Celebrate the 7, 30, 100, and 365 day marks with rewarding visual moments." },
  { icon: Users, title: "Accountability", desc: "Share streaks with a friend or sponsor for a quiet, supportive layer of pressure." },
  { icon: ShieldCheck, title: "Private by Default", desc: "Your habits live on your device first. End-to-end encrypted sync when you want it." },
];

export function Features() {
  return (
    <section id="features" className="relative py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-4">Why Loop Atom</p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Built for the <span className="italic font-light">long</span> game.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Habits aren't sprints. Loop Atom gives you the calm, durable tools to compound small actions into a life you're proud of.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group relative p-8 rounded-3xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2 tracking-tight">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
