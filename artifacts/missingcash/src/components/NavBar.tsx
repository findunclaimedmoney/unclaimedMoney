import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/find-my-money", label: "Find My Money" },
  { href: "/guides", label: "Guides" },
  { href: "/crypto", label: "Crypto" },
  { href: "/deceased-estate", label: "Deceased Estate" },
  { href: "/finance", label: "Finance" },
  { href: "/contact", label: "Contact" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-heading font-bold text-primary tracking-wide">
              Missing<span className="text-foreground">Cash</span>
            </span>
            <span className="hidden sm:inline text-[10px] font-semibold tracking-widest text-muted-foreground uppercase border border-border rounded px-1.5 py-0.5">
              .com.au
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-2">
            <Link href="/find-my-money" className="hidden sm:block">
              <Button size="sm" className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Free Search
              </Button>
            </Link>
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/find-my-money" onClick={() => setOpen(false)}>
              <Button className="w-full mt-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                <Search className="w-4 h-4 mr-2" />
                Free Search
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
