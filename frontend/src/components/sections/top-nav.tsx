"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#reviews", label: "Reviews" },
];

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed top-0 inset-x-0 z-[60] pointer-events-auto transition-all duration-300",
        scrolled
          ? "py-2 backdrop-blur-xl bg-background/60 border-b border-white/10"
          : "py-4 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 group "
          aria-label="Loop Atom home"
        >
          <span
            className="inline-block w-7 h-7 rounded-lg bg-gradient-to-br from-primary via-primary to-secondary shadow-[0_0_20px_hsl(var(--primary)/0.5)] group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.8)] transition-shadow"
            aria-hidden="true"
          />
          <span className="fredericka-the-great font-semibold text-3xl  tracking-tight">
            Loop Atom
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-1 py-3 px-2 rounded-full bg-foreground/10">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-4 py-2 rounded-full text-md text-muted-foreground hover:text-foreground  hover:bg-muted-foreground/50   transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            aria-label="Sign in to Loop Atom"
            className="cta-neon group relative inline-flex items-center gap-2 rounded-full pl-1 pr-4 py-1 font-semibold text-sm text-foreground hover:scale-[1.03] active:scale-[0.98] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span>Sign In</span>
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/5 text-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden mt-2 mx-4 rounded-2xl border border-white/10 bg-background/85 backdrop-blur-xl p-2">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
