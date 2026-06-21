import React from "react";
import { Button } from "@/components/ui/button";
import { Gavel } from "lucide-react";

export function CTA() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="py-32 px-4 relative overflow-hidden bg-background border-t border-border">
      <div className="absolute inset-0 bg-primary/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto max-w-4xl relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
          Ready to experience the thrill?
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Sign up today, grab a starter bid pack, and place your first bid. Your next big win is waiting.
        </p>
        
        <Button 
          onClick={scrollToTop}
          size="lg"
          className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white rounded-full px-12 h-16 text-lg font-bold shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(236,72,153,0.6)]"
        >
          <Gavel className="mr-2" size={24} /> Get Started Now
        </Button>
        <p className="mt-6 text-sm text-muted-foreground">Free to join. No hidden fees.</p>
      </div>
    </section>
  );
}
