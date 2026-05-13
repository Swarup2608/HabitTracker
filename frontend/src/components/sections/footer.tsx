import { Mail, Globe, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative py-16 px-6 bg-muted/40 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="text-2xl font-black tracking-tighter mb-2 fredericka-the-great">TA LLY</div>
          <p className="text-sm text-muted-foreground">Small habits. Compounding wins.</p>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Features</a>
          <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Support</a>
        </nav>
        <div className="flex gap-4">
          <a href="#" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors"><Mail className="w-5 h-5" /></a>
          <a href="#" aria-label="Community" className="text-muted-foreground hover:text-foreground transition-colors"><MessageCircle className="w-5 h-5" /></a>
          <a href="#" aria-label="Website" className="text-muted-foreground hover:text-foreground transition-colors"><Globe className="w-5 h-5" /></a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-border text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tally. All rights reserved.
      </div>
    </footer>
  );
}
