import { Link } from "wouter";
import { Mail, Phone } from "lucide-react";

const footerLinks = [
  { href: "/find-my-money", label: "Find My Money" },
  { href: "/guides", label: "Guides" },
  { href: "/crypto", label: "Crypto Recovery" },
  { href: "/deceased-estate", label: "Deceased Estate" },
  { href: "/finance", label: "Finance" },
  { href: "/map", label: "Australia Map" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-3">
              <span className="text-2xl font-heading font-bold text-primary">
                Missing<span className="text-foreground">Cash</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Australia's trusted guide to finding and claiming unclaimed money from the ATO, ASIC, banks, and state registers.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              ABN: 52 347 989 391
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">Pages</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">Contact</h3>
            <div className="space-y-3">
              <a
                href="mailto:admin@missingcash.com.au"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                admin@missingcash.com.au
              </a>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1">Free Search Available</p>
              <p className="text-xs text-muted-foreground">Search all major Australian unclaimed money databases at no cost.</p>
              <Link href="/find-my-money">
                <button className="mt-3 text-xs font-bold text-primary hover:underline">
                  Start free search →
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} MissingCash. All rights reserved. This site provides guidance only — not financial or legal advice.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
