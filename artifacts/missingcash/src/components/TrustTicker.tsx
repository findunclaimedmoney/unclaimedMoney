const ITEMS = [
  { emoji: "🛡️", text: "Official Government Sources" },
  { emoji: "🇦🇺", text: "100% Australian Owned" },
  { emoji: "⚡", text: "Instant Name Search" },
  { emoji: "✅", text: "ATO · ASIC · myGov" },
  { emoji: "🔒", text: "Secure & Private" },
  { emoji: "💰", text: "Free to Search" },
];

export default function TrustTicker() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="overflow-hidden bg-primary/8 border-b border-primary/15 py-2">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{
          animation: "marquee 28s linear infinite",
          width: "max-content",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0"
          >
            <span>{item.emoji}</span>
            <span>{item.text}</span>
            <span className="text-primary/30 ml-2">·</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
