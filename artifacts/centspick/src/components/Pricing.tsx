import React from "react";
import { Button } from "@/components/ui/button";

const packs = [
  {
    name: "Starter Pack",
    bids: 50,
    price: 25,
    popular: false,
    costPerBid: "50¢",
  },
  {
    name: "Pro Pack",
    bids: 200,
    price: 80,
    popular: true,
    costPerBid: "40¢",
  },
  {
    name: "Elite Pack",
    bids: 500,
    price: 150,
    popular: false,
    costPerBid: "30¢",
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Stock up on bids</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Buy bids upfront, then use them to win auctions. The bigger the pack, the cheaper the bid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {packs.map((pack, i) => (
            <div 
              key={i} 
              className={`bg-card rounded-3xl p-8 border ${pack.popular ? 'border-primary shadow-[0_0_30px_rgba(236,72,153,0.15)] relative transform md:-translate-y-4' : 'border-border'}`}
            >
              {pack.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-center mb-2">{pack.name}</h3>
              <div className="text-center mb-6">
                <span className="text-5xl font-extrabold text-primary">{pack.bids}</span>
                <span className="text-muted-foreground ml-2 font-medium">bids</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold text-xl">${pack.price}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-muted-foreground">Cost per bid</span>
                  <span className="font-medium">{pack.costPerBid}</span>
                </div>
              </div>

              <Button 
                className={`w-full h-12 rounded-xl font-bold text-base ${pack.popular ? 'bg-primary hover:bg-primary-hover text-white shadow-lg' : 'bg-background hover:bg-muted text-foreground border border-border'}`}
              >
                Buy {pack.bids} Bids
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
