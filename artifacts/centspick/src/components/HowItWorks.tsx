import React from "react";
import { Coins, HandIcon, Trophy, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: <Coins size={32} className="text-primary" />,
    title: "1. Buy a Bid Pack",
    description: "Start by purchasing a pack of bids. Bids cost around 20¢ to 50¢ each, depending on the pack size you choose."
  },
  {
    icon: <HandIcon size={32} className="text-primary" />,
    title: "2. Place a Bid",
    description: "Find an item you want and click 'Bid Now'. The price goes up by just 1¢, and the timer resets by 10 seconds to give others a chance."
  },
  {
    icon: <Trophy size={32} className="text-primary" />,
    title: "3. Win the Auction",
    description: "If the timer hits zero and you are the last bidder, you win! You only pay the final closing price (usually 90% off retail) plus shipping."
  },
  {
    icon: <RotateCcw size={32} className="text-primary" />,
    title: "4. Buy It Now (Safety Net)",
    description: "Didn't win? No problem. Use the 'Buy It Now' feature to buy the item at retail price, and get all the bids you placed refunded for free."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-card relative z-10 border-t border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">How CentsPick works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            It's fast, fun, and completely fair. Learn the ropes in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-background rounded-3xl p-8 border border-border relative overflow-hidden group hover:border-primary/30 transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
