import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import TrustTicker from "@/components/TrustTicker";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/find-my-money", label: "Find My Money" },
  { href: "/guides", label: "Guides" },
  { href: "/crypto", label: "Crypto" },
  { href: "/finance", label: "Finance" },
  { href: "/contact", label: "Contact" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(245,185,66,0.4)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 7v5c0 5.25 3.9 10.74 9 12 5.1-1.26 9-6.75 9-12V7L12 2z" fill="currentColor" className="text-primary-foreground" fillOpacity="0.9" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#061826" fontFamily="serif">$</text>
        </svg>
      </div>
      <span className="text-lg font-heading font-bold tracking-wide">
        <span className="text-white">Missing</span><span className="text-primary">Cash</span>
      </span>
    </Link>
  );
}

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Logo />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTAs */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("mia:open", { detail: { message: "I'd like to sign up for unclaimed money alerts" } }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                Sign Up
              </button>
              <Link href="/finance">
                <button className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-[0_0_12px_rgba(245,185,66,0.25)]">
                  Get Finance
                </button>
              </Link>
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Trust ticker — below nav bar */}
      <TrustTicker />

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("mia:open", { detail: { message: "I'd like to sign up for alerts" } })); }}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-4 h-4" /> Sign Up
              </button>
              <Link href="/finance" onClick={() => setOpen(false)} className="flex-1">
                <button className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90">
                  Get Finance
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
