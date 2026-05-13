"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleDot, Sparkles, Settings, MessageCircle, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Tally", icon: CircleDot },
  { href: "/#features", label: "Features", icon: Sparkles },
  { href: "/#how", label: "How it works", icon: Settings },
  { href: "/#reviews", label: "Reviews", icon: MessageCircle },
  { href: "/login", label: "Sign In", icon: LogIn },
];

const excludedPaths = [
  "/dashboard",
  "/habits",
  "/todos",
  "/settings",
  "/about",
];

export function PublicMobileNav() {
  const pathname = usePathname();

  if (!pathname) {
    return null;
  }

  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav
      aria-label="Public mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border/60 bg-card/95 backdrop-blur-2xl shadow-[0_-12px_30px_rgba(15,23,42,0.12)] md:hidden"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-3 text-[10px] text-muted-foreground transition-colors hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
