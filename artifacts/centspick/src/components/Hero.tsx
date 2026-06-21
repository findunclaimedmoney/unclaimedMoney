import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Trophy, ShieldCheck } from "lucide-react";
import { AuctionCard } from "./LiveAuctions";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-10 pb-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -left-64 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-medium text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              14 Auctions Live Right Now
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Premium tech for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-300">pennies.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg">
              The thrill of the win meets unbeatable bargains. Bid on brand new electronics, appliances, and gear. Pay only the final auction price.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white rounded-full px-8 h-14 text-lg font-bold shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] group">
                View Live Auctions <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg font-bold border-border hover:bg-card">
                How It Works
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50">
              <div className="flex flex-col gap-2">
                <Clock className="text-primary h-6 w-6" />
                <span className="font-semibold text-sm">Live Countdowns</span>
              </div>
              <div className="flex flex-col gap-2">
                <Trophy className="text-primary h-6 w-6" />
                <span className="font-semibold text-sm">Brand New Items</span>
              </div>
              <div className="flex flex-col gap-2">
                <ShieldCheck className="text-primary h-6 w-6" />
                <span className="font-semibold text-sm">Buy It Now Safety</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-2xl transform rotate-3" />
            <div className="relative transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <AuctionCard 
                id="hero-1"
                title="Sony WH-1000XM5 Wireless Headphones"
                retailPrice={549}
                image="/images/headphones.png"
                initialTime={15}
                initialPrice={3.42}
                initialBidder="Sarah_M"
                isHero
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
