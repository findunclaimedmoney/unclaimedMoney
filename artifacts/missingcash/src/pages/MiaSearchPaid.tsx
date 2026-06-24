import { usePageSEO } from "@/hooks/use-page-seo";
import { Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MiaSearchPaid() {
  usePageSEO({
    title: "Payment Successful — Your Report Is On Its Way | MissingCash",
    description: "Mia is generating your personalised unclaimed money claim report. It will be emailed to you shortly.",
  });

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center py-16">
      <div className="container mx-auto px-4 max-w-xl text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#00C1D5]/10 border-2 border-[#00C1D5]/60 mx-auto mb-8"
        >
          <Zap className="w-12 h-12 text-[#00C1D5]" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-3xl font-heading tracking-wider text-white mb-3">MIA IS ON IT!</h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Payment confirmed. Mia is now generating your personalised full claim report. It will be emailed to you within the next few minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 text-left space-y-3 mb-6"
        >
          <h3 className="font-bold text-white mb-3">Your full report includes:</h3>
          {[
            "Exact institution name & account reference for every match",
            "Direct links to claim forms — no searching required",
            "Step-by-step claim instructions personalised for your details",
            "ATO lost super & tax refund check steps",
            "All 8 state & territory revenue office registers",
            "Computershare & Link Market Services share registries",
            "Fair Work unpaid wages",
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#00C1D5] flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{s}</p>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-muted-foreground"
        >
          Check your spam folder if it doesn't arrive. Questions? Open{" "}
          <span className="text-[#00C1D5] font-semibold">Mia</span> using the chat button below.
        </motion.p>
      </div>
    </div>
  );
}
