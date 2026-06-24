import { useState } from "react";
import { useLocation } from "wouter";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Zap, ShieldCheck, Search } from "lucide-react";

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  currentAddress: string;
  previousAddresses: string;
  previousSurnames: string;
};

const empty: FormData = {
  email: "", firstName: "", lastName: "", dob: "",
  currentAddress: "", previousAddresses: "", previousSurnames: "",
};

export default function MiaSearch() {
  usePageSEO({
    title: "Free Unclaimed Money Search — Let Mia Find Your Money | MissingCash",
    description: "Submit your details and Mia will search every Australian unclaimed money database for free. We only charge a small percentage if we find money in your name.",
  });

  const [, navigate] = useLocation();
  const [form, setForm] = useState<FormData>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const isValid = form.email && form.firstName && form.lastName && form.dob && form.currentAddress;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/mia/search/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { searchId?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to start search");
      navigate(`/mia-search/results?id=${data.searchId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full py-16">
      <div className="container mx-auto px-4 max-w-2xl">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#00C1D5]/10 border border-[#00C1D5]/30 rounded-full px-4 py-1.5 text-sm text-[#00C1D5] font-medium mb-6">
            <Zap className="w-4 h-4" /> No find, no fee — Mia searches for free
          </div>
          <h1 className="text-4xl font-heading tracking-wider text-white mb-3">
            LET MIA <span className="text-[#00C1D5]">FIND YOUR MONEY</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Mia will search <strong className="text-white">every Australian unclaimed money database</strong> using your details. If she finds money, you pay a small percentage. If she finds nothing, you pay nothing.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Search, label: "Free search", sub: "No upfront cost" },
            { icon: Zap, label: "10+ databases", sub: "ATO, ASIC & more" },
            { icon: ShieldCheck, label: "No find, no fee", sub: "Only pay on results" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
              <Icon className="w-5 h-5 text-[#00C1D5] mx-auto mb-1.5" />
              <p className="text-white text-xs font-bold">{label}</p>
              <p className="text-muted-foreground text-[10px]">{sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="jane.smith@email.com"
                required
              />
              <p className="text-[10px] text-muted-foreground">We'll email your results report to this address.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm text-muted-foreground">First Name *</Label>
                <Input id="firstName" value={form.firstName} onChange={set("firstName")} placeholder="Jane" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm text-muted-foreground">Last Name *</Label>
                <Input id="lastName" value={form.lastName} onChange={set("lastName")} placeholder="Smith" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dob" className="text-sm text-muted-foreground">Date of Birth *</Label>
              <Input id="dob" type="date" value={form.dob} onChange={set("dob")} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currentAddress" className="text-sm text-muted-foreground">Current Address *</Label>
              <Input
                id="currentAddress"
                value={form.currentAddress}
                onChange={set("currentAddress")}
                placeholder="123 Example St, Wanneroo WA 6065"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="previousAddresses" className="text-sm text-muted-foreground">
                Previous Addresses <span className="text-xs text-muted-foreground/60">(optional — helps find more)</span>
              </Label>
              <Textarea
                id="previousAddresses"
                value={form.previousAddresses}
                onChange={set("previousAddresses")}
                placeholder="e.g. 45 Old Road, Parramatta NSW 2150 (2018–2022)"
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="previousSurnames" className="text-sm text-muted-foreground">
                Previous Surnames / Maiden Name <span className="text-xs text-muted-foreground/60">(optional)</span>
              </Label>
              <Input
                id="previousSurnames"
                value={form.previousSurnames}
                onChange={set("previousSurnames")}
                placeholder="e.g. Johnson (maiden name)"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
            )}

            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full h-14 text-lg font-bold tracking-wider rounded-xl bg-[#00C1D5] hover:bg-[#00C1D5]/90 text-white shadow-[0_4px_20px_rgba(0,193,213,0.35)] mt-2"
            >
              {submitting ? (
                <>
                  <Zap className="w-5 h-5 mr-2 animate-pulse" /> Starting search…
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" /> Search My Name — Free
                </>
              )}
            </Button>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-primary">Fee structure (only if money found):</strong>{" "}
                5% on $250–$1k · 10% on $1k–$5k · 15% on $5k–$30k · 20% on $30k–$100k · 33% on $100k+
              </p>
            </div>

            <p className="text-xs text-center text-muted-foreground pt-1">
              🔒 Your details are used only to search unclaimed money databases. See our{" "}
              <a href="/privacy" className="underline hover:text-white">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
