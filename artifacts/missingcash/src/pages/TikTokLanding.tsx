import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLeadSource, getReferralCode } from "@/lib/lead-source";

export default function TikTokLanding() {
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const src = getLeadSource();
    const ref = getReferralCode();
    try {
      const res = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: fd.get("firstName") as string,
          lastName: fd.get("lastName") as string,
          email: fd.get("email") as string,
          phone: fd.get("phone") as string,
          postcode: fd.get("postcode") as string,
          consent: true,
          intent: "finance",
          ...(src ? { source: src } : {}),
          ...(ref ? { referralCode: ref } : {}),
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function skipToPaidSearch() {
    const src = getLeadSource();
    navigate(src ? `/search?v=${encodeURIComponent(src)}` : "/search");
  }

  return (
    <div className="min-h-[100dvh] bg-[#061826] text-white flex flex-col items-center justify-center px-5 py-10">
      <AnimatePresence>
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {submitted ? (
            <div className="text-center">
              <CheckCircle2 className="w-14 h-14 text-[#f5b942] mx-auto mb-5" />
              <h2 className="text-2xl font-bold text-white mb-2">You're all set!</h2>
              <p className="text-white/60 mb-2">
                A Stratton Finance broker will be in touch shortly.
              </p>
              <p className="text-white/60 mb-6">
                As a bonus, Mia is now searching for your money — free.
                We'll email you the results.
              </p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-[#f5b942] text-[#061826] font-bold hover:bg-[#f5b942]/90 rounded-xl px-6"
              >
                Go to MissingCash <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <p className="text-[#f5b942] text-xs font-semibold tracking-widest uppercase mb-3">
                  🇦🇺 Two ways to check for missing money
                </p>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Check if you have <span className="text-[#f5b942]">missing money</span>
                </h1>
                <p className="text-white/55 text-sm">
                  Get a quote and receive a free search — or pay $24.99 and
                  Mia searches for your money right now.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" className="text-white/60 text-sm mb-1.5 block">First Name *</Label>
                    <Input id="firstName" name="firstName" required placeholder="Jane" className="bg-white/6 border-white/15 text-white placeholder:text-white/25 h-11" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white/60 text-sm mb-1.5 block">Last Name *</Label>
                    <Input id="lastName" name="lastName" required placeholder="Smith" className="bg-white/6 border-white/15 text-white placeholder:text-white/25 h-11" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white/60 text-sm mb-1.5 block">Phone *</Label>
                  <Input id="phone" name="phone" type="tel" required placeholder="04XX XXX XXX" className="bg-white/6 border-white/15 text-white placeholder:text-white/25 h-11" />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white/60 text-sm mb-1.5 block">Email *</Label>
                  <Input id="email" name="email" type="email" required placeholder="jane@example.com" className="bg-white/6 border-white/15 text-white placeholder:text-white/25 h-11" />
                </div>

                <div>
                  <Label htmlFor="postcode" className="text-white/60 text-sm mb-1.5 block">Postcode *</Label>
                  <Input id="postcode" name="postcode" required placeholder="2000" className="bg-white/6 border-white/15 text-white placeholder:text-white/25 h-11" />
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-xl bg-[#f5b942] text-[#061826] font-bold text-base hover:bg-[#f5b942]/90 shadow-[0_0_20px_rgba(245,185,66,0.3)] disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
                  ) : (
                    <>Get My Quote — Free Search Included
 <ArrowRight className="w-4 h-4 ml-2" /></>
                                  )}
                </Button>
              </form>
            </>
                  )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
