import React from "react";
import { Logo } from "../Logo";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Logo className="mb-4" />
            <p className="text-muted-foreground max-w-sm">
              Australia's fairest penny auction site. Win brand new, factory-sealed products for a fraction of their retail price. Backed by our Buy It Now guarantee.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Auctions</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#live-auctions" className="hover:text-primary transition-colors">Live Now</a></li>
              <li><a href="#winners" className="hover:text-primary transition-colors">Recent Winners</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Bid Packs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CentsPick. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Operated in Australia</p>
        </div>
      </div>
    </footer>
  );
}
