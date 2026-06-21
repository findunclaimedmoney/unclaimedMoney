import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gavel, Clock, User, ChevronRight } from "lucide-react";

export function LiveAuctions() {
  const auctions = [
    {
      id: "auc-1",
      title: "Premium 4K OLED Smart TV 65\"",
      retailPrice: 2499,
      image: "/images/tv.png",
      initialTime: 24,
      initialPrice: 12.87,
      initialBidder: "Tommo99",
    },
    {
      id: "auc-2",
      title: "Pro Barista Espresso Machine",
      retailPrice: 899,
      image: "/images/espresso-machine.png",
      initialTime: 8,
      initialPrice: 4.12,
      initialBidder: "CoffeeLover",
    },
    {
      id: "auc-3",
      title: "Latest Flagship Smartphone Pro",
      retailPrice: 1849,
      image: "/images/smartphone.png",
      initialTime: 45,
      initialPrice: 45.33,
      initialBidder: "TechGeekAus",
    },
    {
      id: "auc-4",
      title: "Ultra-Thin Gaming Laptop",
      retailPrice: 3199,
      image: "/images/laptop.png",
      initialTime: 12,
      initialPrice: 88.01,
      initialBidder: "GamerXYZ",
    },
  ];

  return (
    <section id="live-auctions" className="py-24 bg-background relative z-10 border-t border-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Live Auctions</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl">Going, going... almost gone. Jump in and place a bid.</p>
          </div>
          <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 rounded-full">
            View All <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {auctions.map((auc) => (
            <AuctionCard key={auc.id} {...auc} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface AuctionCardProps {
  id: string;
  title: string;
  retailPrice: number;
  image: string;
  initialTime: number;
  initialPrice: number;
  initialBidder: string;
  isHero?: boolean;
}

export function AuctionCard({ id, title, retailPrice, image, initialTime, initialPrice, initialBidder, isHero = false }: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [price, setPrice] = useState(initialPrice);
  const [topBidder, setTopBidder] = useState(initialBidder);
  const [justBid, setJustBid] = useState(false);
  const [isGoingOnce, setIsGoingOnce] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-reset or fake another bidder to keep the demo alive indefinitely
          const fakeBidders = ["AussieDave", "MelbShopper", "SydSniper", "BrisbaneBargain"];
          setTopBidder(fakeBidders[Math.floor(Math.random() * fakeBidders.length)]);
          setPrice((p) => parseFloat((p + 0.01).toFixed(2)));
          return Math.floor(Math.random() * 10) + 5; // 5-15 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    setIsGoingOnce(timeLeft <= 5);
  }, [timeLeft]);

  const handleBid = () => {
    setPrice((prev) => parseFloat((prev + 0.01).toFixed(2)));
    setTimeLeft((prev) => Math.min(prev + 10, 30)); // Add 10s, cap at 30s
    setTopBidder("You!");
    setJustBid(true);
    setTimeout(() => setJustBid(false), 500);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-card rounded-2xl border ${isGoingOnce && !isHero ? 'border-primary shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'border-border'} overflow-hidden flex flex-col relative transition-all duration-300 ${isHero ? 'shadow-2xl' : 'hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'}`}>
      {/* Timer Bar */}
      <div className={`h-1.5 w-full ${isGoingOnce ? 'bg-destructive' : 'bg-primary'} transition-colors duration-300`} />
      
      {/* Content */}
      <div className={`p-6 flex flex-col flex-1 ${isHero ? 'p-8 md:p-10' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Retail: ${retailPrice.toLocaleString()}
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-sm font-bold transition-colors ${isGoingOnce ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="h-48 w-full relative mb-6 flex items-center justify-center">
          <img src={image} alt={title} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
        </div>

        <h3 className={`font-bold leading-tight mb-6 flex-1 ${isHero ? 'text-2xl' : 'text-lg'}`}>
          {title}
        </h3>

        <div className="space-y-4 mt-auto">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Current Price</p>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={price}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`font-bold font-mono tracking-tight text-primary ${isHero ? 'text-5xl' : 'text-3xl'}`}
                >
                  ${price.toFixed(2)}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Top Bidder</p>
              <div className={`flex items-center justify-end gap-1.5 font-medium ${topBidder === 'You!' ? 'text-primary' : 'text-foreground'}`}>
                <User className="w-3.5 h-3.5" />
                {topBidder}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleBid}
            className={`w-full font-bold uppercase tracking-wide h-12 rounded-xl transition-all duration-200 ${
              justBid 
                ? 'bg-white text-primary scale-95' 
                : 'bg-primary hover:bg-primary-hover text-white shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]'
            }`}
          >
            <Gavel className="w-5 h-5 mr-2" />
            Bid Now (1 ¢ent)
          </Button>
        </div>
      </div>
    </div>
  );
}
