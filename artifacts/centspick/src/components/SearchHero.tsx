import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Sparkles, MapPin, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchHero() {
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setShowResult(false);
    
    // Simulate network request
    setTimeout(() => {
      setIsSearching(false);
      setShowResult(true);
    }, 2500);
  };

  return (
    <section className="relative pt-24 pb-32 px-4 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-20 right-10 opacity-30 animate-pulse">
        <Sparkles size={48} className="text-primary" />
      </div>
      <div className="absolute bottom-20 left-10 opacity-20">
        <Sparkles size={32} className="text-primary" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium mb-6 text-primary"
          >
            <Sparkles size={16} />
            <span>Over $1.5 billion waiting to be claimed in Australia</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
          >
            Is some of it <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff71b5]">yours?</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12"
          >
            We search government registers, lost super funds, and dormant bank accounts to find money with your name on it. Fast, free, and secure.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          className="max-w-4xl mx-auto relative"
        >
          {/* Main Search Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            
            {/* The animated pink line on top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <form onSubmit={handleSearch} className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="col-span-1 md:col-span-4 relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    type="text" 
                    required
                    placeholder="First Name" 
                    className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-4 relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    type="text" 
                    required
                    placeholder="Last Name" 
                    className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                  />
                </div>

                <div className="col-span-1 md:col-span-3 relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <MapPin size={20} />
                  </div>
                  <select 
                    required
                    className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg appearance-none cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled hidden>State</option>
                    <option value="NSW">QLD</option>
                    <option value="NSW">NSW</option>
                    <option value="VIC">VIC</option>
                    <option value="WA">WA</option>
                    <option value="SA">SA</option>
                    <option value="TAS">TAS</option>
                    <option value="ACT">ACT</option>
                    <option value="NT">NT</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-1 flex justify-center">
                  <Button 
                    type="submit" 
                    disabled={isSearching}
                    className="w-full md:w-14 h-14 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]"
                  >
                    {isSearching ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <Search size={24} />
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <AnimatePresence>
              {showResult && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-8 border-t border-border flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <Sparkles className="text-primary" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Great news! We found potential matches.</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      There are 3 records matching your details across NSW registers and lost super funds.
                    </p>
                    <Button className="bg-white text-background hover:bg-gray-200 rounded-full px-8 h-12 font-bold group">
                      View Matches <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-6 text-center flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live searching 14+ government and financial databases
          </div>
        </motion.div>

        {/* Floating image decoration */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute -left-32 top-1/4 hidden lg:block w-64 rounded-3xl overflow-hidden shadow-2xl border border-border/50 rotate-[-6deg] hover:rotate-0 transition-transform duration-500"
        >
          <img src={`${import.meta.env.BASE_URL}images/happy-person.png`} alt="Happy person finding money" className="w-full h-auto" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute -right-32 top-1/3 hidden lg:block w-72 rounded-3xl overflow-hidden shadow-2xl border border-border/50 rotate-[4deg] hover:rotate-0 transition-transform duration-500"
        >
          <img src={`${import.meta.env.BASE_URL}images/abstract-money.png`} alt="Abstract money" className="w-full h-auto" />
        </motion.div>

      </div>
    </section>
  );
}
