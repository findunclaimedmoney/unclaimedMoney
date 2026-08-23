import { useState } from "react";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Gift } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

function makeCode(firstName: string, lastName: string): string {
  const raw = `${firstName}${lastName}${Date.now()}`.toUpperCase();
  return raw.replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export default function ReferPage() {
  usePageSEO({
        title: "Refer a Friend — Earn 2% of Their Loan | MissingCash",
    description:
          "Refer a friend to Stratton Finance through MissingCash. Earn 2% of their approved loan amount — from $100 up to $1,000+, cash or a Visa card. No cap.",
  });

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const code = makeCode(form.firstName, form.lastName);
      const res = await fetch(`${BASE}api/referrals/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralCode: code,
          referrerName: `${form.firstName} ${form.lastName}`.trim(),
          referrerEmail: form.email,
          referrerPhone: form.phone,
        }),
      });
      const data = (await res.json()) as { referralCode?: string; error?: string };
      if (!res.ok || !data.referralCode) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setLink(`${window.location.origin}/?ref=${data.referralCode}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <a href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold">
                <span className="text-white">Missing</span>
                <span className="text-primary">Cash</span>
              </span>
            </a>
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Refer a Friend</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
                        If a friend you refer gets approved for a Stratton Finance loan of $5,000 or more, you earn 2% of the loan amount — from $100, up to $1,000+ on larger loans. Cash or a Visa card. No cap.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            {link ? (
              <div className="text-center">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="text-sm text-white font-semibold mb-1">Your referral link is ready</p>
                <p className="text-xs text-muted-foreground mb-4">Share it — you're credited when they enquire.</p>
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2.5 mb-3">
                  <span className="text-xs text-primary flex-1 truncate text-left">{link}</span>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="shrink-0 text-muted-foreground hover:text-white transition-colors"
                    aria-label="Copy link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={copyLink}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">First name</label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
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
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    placeholder="04XX XXX XXX"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {loading ? "Creating your link…" : "Get My Referral Link"}
                </button>
              </form>
            )}
            <p className="text-[10px] text-muted-foreground/50 text-center mt-4">
              ABN 52 347 989 391 · Reward paid once loan approval and amount are confirmed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
