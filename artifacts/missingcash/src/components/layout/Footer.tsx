import { Link } from "wouter";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-heading text-2xl mt-1 tracking-wider text-white">MISSINGCASH</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              MissingCash helps Australians find money held by government agencies and financial institutions. Fast, secure, and backed by official sources.
            </p>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/80">ABN: 52 347 989 391</p>
              <p className="text-sm text-muted-foreground">Australian Owned & Operated</p>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-lg tracking-wider text-white mb-4">Services</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Unclaimed Money</Link></li>
              <li><Link href="/crypto" className="text-sm text-muted-foreground hover:text-primary transition-colors">Lost Crypto</Link></li>
              <li><Link href="/finance" className="text-sm text-muted-foreground hover:text-primary transition-colors">Finance Options</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg tracking-wider text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MissingCash Australia. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center md:text-right max-w-xl">
            Disclaimer: MissingCash provides search capabilities for public databases. We are not a government agency.
            The results provided are for informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
