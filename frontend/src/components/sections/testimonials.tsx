import Image from "next/image";

const quotes = [
  {
    quote: "I've started and abandoned five habit apps. Loop Atom is the first one that I've kept open for over a year.",
    name: "Maya Chen",
    role: "Product Designer",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    quote: "The streak ring is dangerous in the best way. I've gone running on days I would have absolutely talked myself out of.",
    name: "David Okafor",
    role: "Founder, Forge",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  },
  {
    quote: "Finally, a habit app that doesn't feel like a chore. Loop Atom makes tiny daily actions feel rewarding and unstoppable.",
    name: "Lila Marquez",
    role: "Writer",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
];

export function Testimonials() {
  return (
    <section id="reviews" className="relative py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-4">Loved by 200,000+ habit-builders</p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Quiet wins, every day.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <figure key={q.name} className="p-8 rounded-3xl border border-border bg-muted/30 flex flex-col">
              <blockquote className="text-lg leading-relaxed mb-8 flex-1">&ldquo;{q.quote}&rdquo;</blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden">
                  <Image src={q.img} alt={q.name} fill className="object-cover" sizes="44px" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{q.name}</div>
                  <div className="text-xs text-muted-foreground">{q.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
