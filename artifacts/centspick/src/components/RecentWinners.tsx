import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const winners = [
  {
    name: "James D.",
    location: "Sydney, NSW",
    product: "Pro Barista Espresso Machine",
    retail: 899,
    paid: 12.45,
    image: "/images/espresso-machine.png",
    savings: "98%"
  },
  {
    name: "Chloe T.",
    location: "Melbourne, VIC",
    product: "Sony WH-1000XM5 Headphones",
    retail: 549,
    paid: 4.12,
    image: "/images/headphones.png",
    savings: "99%"
  },
  {
    name: "Marcus P.",
    location: "Brisbane, QLD",
    product: "Ultra-Thin Gaming Laptop",
    retail: 3199,
    paid: 104.56,
    image: "/images/laptop.png",
    savings: "96%"
  }
];

export function RecentWinners() {
  return (
    <section id="winners" className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Recent Winners</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real people grabbing unbelievable deals every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {winners.map((winner, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-3xl p-1 border border-border"
            >
              <div className="bg-background rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
                {/* Savings Badge */}
                <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                  Save {winner.savings}
                </div>

                <div className="h-40 mb-6 relative flex items-center justify-center p-4">
                  <img src={winner.image} alt={winner.product} className="max-h-full max-w-full object-contain drop-shadow-xl" />
                </div>
                
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{winner.product}</h3>
                
                <div className="flex justify-between items-center mb-6 text-sm">
                  <span className="text-muted-foreground line-through">Retail: ${winner.retail}</span>
                  <span className="font-bold text-primary text-lg">Won for: ${winner.paid.toFixed(2)}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {winner.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{winner.name}</p>
                    <p className="text-xs text-muted-foreground">{winner.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
