import { useEffect, useRef, useState } from "react";

const BASE = 2_600_000_000;
const PER_SECOND = 847;

export default function UnclaimedTicker() {
  const [amount, setAmount] = useState(BASE);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setAmount(Math.floor(BASE + elapsed * PER_SECOND));
    }, 100);
    return () => clearInterval(id);
  }, []);

  const formatted = amount.toLocaleString("en-AU");

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl md:text-3xl font-bold text-primary tabular-nums tracking-tight">
          ${formatted}
        </span>
      </div>
      <span className="text-xs text-muted-foreground tracking-widest uppercase">
        Total unclaimed in Australia — ticking up every second
      </span>
    </div>
  );
}
