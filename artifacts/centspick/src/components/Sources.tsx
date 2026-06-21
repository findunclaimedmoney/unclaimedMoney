import React from "react";
import { Building2, Briefcase, PiggyBank, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const sources = [
  {
    icon: <PiggyBank size={24} />,
    title: "Lost Superannuation",
    description: "Millions in super is sitting in holding accounts because people changed jobs or moved houses."
  },
  {
    icon: <Building2 size={24} />,
    title: "Dormant Bank Accounts",
    description: "Accounts untouched for 7+ years are transferred to the government. We check the registry."
  },
  {
    icon: <Briefcase size={24} />,
    title: "Shares & Dividends",
    description: "Uncashed dividend cheques and forgotten share parcels held by ASIC."
  },
  {
    icon: <GraduationCap size={24} />,
    title: "State Registers",
    description: "Overpaid utility bills, rental bonds, and deceased estates held by state revenue offices."
  }
];

export function Sources() {
  return (
    <section id="sources" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl overflow-hidden border border-border shadow-2xl"
            >
              <img src={`${import.meta.env.BASE_URL}images/hands-coins.png`} alt="Finding lost money" className="w-full h-auto object-cover" />
            </motion.div>
          </div>
          
          <div className="lg:w-1/2">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-6"
            >
              Money gets lost easily. <br />
              <span className="text-primary">We know where to look.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground mb-10"
            >
              The government holds billions of dollars waiting to be claimed. It's not a scam — it's the law. If a company can't find you, they have to hand your money over to public trust.
            </motion.p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {sources.map((source, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex flex-col gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-primary">
                    {source.icon}
                  </div>
                  <h4 className="font-bold text-lg">{source.title}</h4>
                  <p className="text-sm text-muted-foreground">{source.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
