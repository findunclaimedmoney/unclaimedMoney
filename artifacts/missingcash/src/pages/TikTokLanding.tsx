import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VideoSplash from "@/components/VideoSplash";
import { getLeadSource } from "@/lib/lead-source";

export default function TikTokLanding() {
  const [, navigate] = useLocation();
  const [splashDone, setSplashDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const src = getLeadSource();
    try {
      const res = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: fd.get("firstName") as string,
          lastName: fd.get("lastName") as string,
          dob: fd.get("dob") as string,
          email: (fd.get("email") as string) || undefined,
          ...(src ? { source: src } : {}),
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setSubmitted(true);
      setTimeout(() => navigate("/"), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#061826] text-white flex flex-col items-center justify-center px-5">
      {!splashDone && <VideoSplash onDone={() => setSplashDone(true)} />}

      <AnimatePresence>
        {splashDone && (
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {submitted ? (
              <div className="text-center">
                <CheckCircle2 className="w-14 h-14 text-[#f5b942] mx-auto mb-5" />
                <h2 className="text-2xl font-bold text-white mb-2">Thanks!</h2>
                <p className="text-white/60 mb-6">Taking you to MissingCash now…</p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-[#f5b942] text-[#061826] font-bold hover:bg-[#f5b942]/90 rounded-xl px-6"
                >
                  Go to the site <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-7">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Check if you have <span className="text-[#f5b942]">missing money</span>
                  </h1>
                  <p className="text-white/55 text-sm">Enter your details and we'll search for you — free.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName" className="text-white/60 text-sm mb-1.5 block">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        placeholder="Jane"
                        className="bg-white/6 border-white/15 text-white placeholder:text-white/25 h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-white/60 text-sm mb-1.5 block">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        placeholder="Smith"
                        className="bg-white/6 border-white/15 text-white placeholder:text-white/25 h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dob" className="text-white/60 text-sm mb-1.5 block">Date of Birth *</Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      required
                      className="bg-white/6 border-white/15 text-white h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white/60 text-sm mb-1.5 block">Email <span className="text-white/30">(optional)</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      className="bg-white/6 border-white/15 text-white placeholder:text-white/25 h-11"
                    />
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
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching…</>
                    ) : (
                      <>Search for My Money <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>

                  <p className="text-xs text-white/25 text-center leading-relaxed">
                    Free to check. No upfront cost. We only charge a small percentage if we find money in your name.
                  </p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
