import { useState } from "react";
import { usePageSEO } from "@/hooks/use-page-seo";

const STATES = ["ACT","NSW","NT","QLD","SA","TAS","VIC","WA"];

const BASE = import.meta.env.BASE_URL;

export default function SearchPage() {
  usePageSEO({
    title: "Search Your Name — $9.99 | MissingCash",
    description: "Pay $9.99 and Mia searches every major Australian unclaimed money register for your name. Results emailed within minutes — guaranteed.",
  });

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", state: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const done = new URLSearchParams(window.location.search).get("done") === "1";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}api/paid-search/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { checkoutUrl?: string; error?: string };
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Payment confirmed</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Mia is searching now. Your results will be emailed to you within a few minutes — check your inbox (and spam folder just in case).
          </p>
          <p className="text-xs text-muted-foreground">
            Questions? Email <a href="mailto:support@missingcash.com.au" className="text-primary hover:underline">support@missingcash.com.au</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <a href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold">
                <span className="text-white">Missing</span><span className="text-primary">Cash</span>
              </span>
            </a>
            <h1 className="text-2xl font-bold text-white mb-2">Search Your Name</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mia searches every major Australian unclaimed money register and emails you the results — found or not.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-white">Mia Name Search</p>
                <p className="text-xs text-muted-foreground">Results emailed within minutes</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">$9.99</p>
                <p className="text-xs text-muted-foreground">one-time · AUD</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">First name</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Last name</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  placeholder="jane@example.com"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">State <span className="text-muted-foreground/50">(optional — improves accuracy)</span></label>
                <select
                  value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                >
                  <option value="">All states</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-[0_0_20px_rgba(245,185,66,0.25)]"
              >
                {loading ? "Setting up payment…" : "Search My Name — $9.99"}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-border space-y-2">
              {[
                "ATO Lost Member Register",
                "ASIC MoneySmart",
                "WA / QLD / NSW / VIC / SA registers",
                "Results emailed — hit or miss",
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-primary text-xs">✓</span>
                  <span className="text-xs text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground/50 text-center mt-4">
              🔒 Secure payment via Stripe · ABN 52 347 989 391 · Not financial advice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
