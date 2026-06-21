import React from "react";
import { Link } from "wouter";
import { Logo } from "../Logo";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/">
          <Logo className="text-2xl cursor-pointer" />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#live-auctions" className="hover:text-foreground transition-colors">Live Auctions</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#winners" className="hover:text-foreground transition-colors">Recent Winners</a>
          <a href="#trust" className="hover:text-foreground transition-colors">Fairness Guarantee</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">Buy Bids</a>
          <Button className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white rounded-full px-6 font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]">
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
}
