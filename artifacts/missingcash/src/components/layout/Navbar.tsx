import { Link, useLocation } from "wouter";
import { Shield, Menu, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/find-my-money", label: "Find My Money" },
  { href: "/guides", label: "Guides" },
  { href: "/crypto", label: "Crypto" },
  { href: "/finance", label: "Finance" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:bg-primary/90 transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-heading text-2xl mt-1 tracking-wider text-white">MISSINGCASH</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="/#alerts" className="hidden md:block">
            <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 font-bold tracking-wider rounded-full px-5 gap-2">
              <Bell className="w-4 h-4" /> Sign Up
            </Button>
          </a>
          <Link href="/finance" className="hidden md:block">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-wider rounded-full px-6">
              Get Finance
            </Button>
          </Link>
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-white transition-colors"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top-2 duration-200">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors hover:bg-secondary hover:text-primary ${
                  location === href ? "text-primary bg-secondary" : "text-muted-foreground"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link href="/finance" onClick={() => setMobileOpen(false)}>
              <Button className="w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-wider rounded-full">
                Get Finance Quote
              </Button>
            </Link>
          </nav>
        </div>
      )}

      <div className="bg-[#04101A] border-b border-border py-2 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 md:gap-8 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap overflow-x-auto py-0.5">
            <span className="flex items-center gap-1.5">🛡️ Official Government Sources</span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-1.5">🇦🇺 100% Australian Owned</span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-1.5">⚡ Instant Name Search</span>
            <span className="hidden lg:inline text-border">•</span>
            <span className="hidden lg:flex items-center gap-1.5">✅ ATO · ASIC · myGov</span>
          </div>
        </div>
      </div>
    </header>
  );
}
