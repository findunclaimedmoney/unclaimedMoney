import React from "react";
import { motion } from "framer-motion";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="font-sans font-[800] tracking-tighter text-3xl">
        <span className="text-primary">¢</span>
        <span className="text-foreground">ents</span>
        <span className="text-primary">Pick</span>
      </span>
      <motion.svg
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="absolute -bottom-1 left-0 w-full"
        viewBox="0 0 100 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 5C30 -2 70 12 98 4"
          stroke="#ec4899"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
}
