import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Jenkins",
    location: "Brisbane, QLD",
    quote: "I genuinely thought this was a gimmick until I found $1,200 from an old savings account I had when I was a teenager. Claimed it and had it in my current account 3 weeks later.",
    amount: "$1,245.50"
  },
  {
    name: "David Chen",
    location: "Melbourne, VIC",
    quote: "Found my lost super from my first part-time job. I'd forgotten the fund entirely. CentsPick made it so easy to see it was sitting there waiting for me.",
    amount: "$4,320.00"
  },
  {
    name: "Emma Robertson",
    location: "Sydney, NSW",
    quote: "Turns out I had unpaid dividends from some shares my grandad bought me years ago. The interface is beautiful and not clunky like the government sites.",
    amount: "$850.00"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-card border-y border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Everyday Aussies finding their cash</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Thousands of people have discovered money they didn't know they had.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-background rounded-3xl p-8 border border-border flex flex-col h-full"
            >
              <div className="flex gap-1 text-primary mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} fill="currentColor" />
                ))}
              </div>
              <p className="text-lg leading-relaxed flex-grow mb-8 italic">
                "{t.quote}"
              </p>
              <div className="mt-auto border-t border-border pt-6 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{t.name}</h4>
                  <p className="text-sm text-muted-foreground">{t.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">FOUND</p>
                  <p className="font-bold text-primary">{t.amount}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
