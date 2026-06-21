import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Are the products brand new?",
    answer: "Yes, 100%. Every item auctioned on CentsPick is brand new, factory-sealed, and comes with a standard manufacturer's warranty. We source directly from authorized Australian distributors."
  },
  {
    question: "Do I have to pay shipping?",
    answer: "Usually, yes. Shipping costs are flat-rate and displayed clearly on every auction page before you bid. For some special promotional auctions, shipping is free."
  },
  {
    question: "What happens if the timer hits zero?",
    answer: "If the countdown timer reaches zero and you are the last person to have placed a bid, you win the auction! You will be prompted to check out and pay the final closing price."
  },
  {
    question: "How does the 'Buy It Now' guarantee work?",
    answer: "If you don't win an auction, you have 7 days to use the 'Buy It Now' option. You pay the stated retail price for the item, and we instantly refund all the bids you used in that specific auction back to your account."
  },
  {
    question: "Can anyone use bots to bid?",
    answer: "No. We have strict anti-bot measures in place. We do offer a built-in 'AutoBidder' tool that allows you to set a limit of bids to place while you are away from the computer, but this is a fair tool available to all users, not a malicious bot."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-card border-t border-border">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Got questions?</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about bidding, winning, and buying.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
