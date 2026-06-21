import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/Hero";
import { LiveAuctions } from "@/components/LiveAuctions";
import { HowItWorks } from "@/components/HowItWorks";
import { RecentWinners } from "@/components/RecentWinners";
import { Trust } from "@/components/Trust";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col w-full selection:bg-primary/30">
      <Navbar />
      <main className="flex-1 w-full pt-20 overflow-hidden">
        <Hero />
        <LiveAuctions />
        <HowItWorks />
        <RecentWinners />
        <Trust />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
