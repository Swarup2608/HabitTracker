import Image from "next/image";

const steps = [
  {
    n: "01",
    title: "Pick a habit that matters.",
    desc: "Read 20 minutes. Walk 10k steps. Call mom on Sunday. Start small — Tally is built to make small things stick.",
    img: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80",
  },
  {
    n: "02",
    title: "Tap once a day.",
    desc: "A single tap to log your day. The streak counter and progress ring do the rest. No essays, no friction.",
    img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80",
  },
  {
    n: "03",
    title: "Watch it compound.",
    desc: "Streaks turn into months. Months turn into a quietly different life. Look back and see the proof in the timeline.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-32 px-6 bg-muted/40">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-4">How it works</p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Three steps. Then forget the app.</h2>
        </div>

        <div className="space-y-32">
          {steps.map((step, i) => (
            <div key={step.n} className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}>
              <div>
                <div className="text-7xl font-black text-foreground/10 mb-4 tracking-tighter">{step.n}</div>
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{step.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md">{step.desc}</p>
              </div>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-border shadow-2xl">
                <Image src={step.img} alt={step.title} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
