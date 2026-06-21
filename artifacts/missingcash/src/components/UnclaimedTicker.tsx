import { useEffect, useState } from "react";

const BASE_AMOUNT = 24_100_000_000;
const TICK_MS = 3200;
const TICK_AMOUNT = 1847;

export default function UnclaimedTicker() {
  const [amount, setAmount] = useState(BASE_AMOUNT);

  useEffect(() => {
    const interval = setInterval(() => {
      setAmount((prev) => prev + TICK_AMOUNT);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const formatted = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <span className="text-3xl md:text-4xl font-heading font-bold text-primary tracking-tight gold-glow tabular-nums">
      {formatted}
    </span>
  );
}
