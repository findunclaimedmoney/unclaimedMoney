import React from "react";
import { ShieldCheck, Lock, Package, ThumbsUp } from "lucide-react";

export function Trust() {
  return (
    <section id="trust" className="py-24 bg-card border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-8">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              The "Buy It Now" Guarantee. Zero risk to your wallet.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Penny auctions are thrilling, but we don't want anyone walking away empty-handed. That's why we built the fairest safety net in the industry.
            </p>
            <p className="text-lg text-foreground mb-8">
              If you don't win the auction, you can choose to buy the item at its regular retail price. If you do, <strong>we refund 100% of the bids you placed</strong> on that item right back into your account.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-medium">
                <Lock className="text-primary w-5 h-5" /> Secure payments & SSL encryption
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <Package className="text-primary w-5 h-5" /> All items are brand new, factory sealed
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <ThumbsUp className="text-primary w-5 h-5" /> 100% Australian owned and operated
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="bg-background border border-border rounded-3xl p-8 relative shadow-2xl">
              <h3 className="font-bold text-xl mb-4">Example Scenario:</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground text-sm">Item Retail Price:</span>
                    <span className="font-bold">$400</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground text-sm">Bids you placed (100 x 50¢):</span>
                    <span className="text-destructive font-bold">-$50</span>
                  </div>
                </div>
                <div className="text-center font-bold text-muted-foreground">You didn't win the auction.</div>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-sm">You use "Buy It Now":</span>
                    <span className="font-bold">Pay $400</span>
                  </div>
                  <div className="flex justify-between border-t border-primary/20 pt-2 mt-2 text-primary">
                    <span className="font-bold text-sm">Bids Refunded:</span>
                    <span className="font-bold">+$50 in bids back!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
