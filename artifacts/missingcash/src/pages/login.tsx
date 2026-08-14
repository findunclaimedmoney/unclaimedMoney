import { useState } from "react";
import { useLocation } from "wouter";
import { usePageSEO } from "@/hooks/use-page-seo";

const BASE = import.meta.env.BASE_URL;

export default function Login() {
  usePageSEO({ title: "Sign In | MissingCash" });
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    email: "", password: "", firstName: "", lastName: "", mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "auth/login" : "auth/register";
      const res = await fetch(`${BASE}api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      localStorage.setItem("mc_token", data.token);
      navigate("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold">
            <span className="text-white">Missing</span><span className="text-primary">Cash</span>
          </a>
          <h1 className="text-2xl font-bold text-white mt-4">
            {mode === "login" ? "Sign In" : "Create Your Account"}
          </h1>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="First name" value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white" />
                <input required placeholder="Last name" value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white" />
              </div>
            )}
            {mode === "register" && (
              <input required placeholder="Mobile" value={form.mobile}
                onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white" />
            )}
            <input required type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white" />
            <input required type="password" placeholder="Password (min 8 characters)" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white" />

            {error && <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-60">
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="w-full text-center text-xs text-muted-foreground mt-4 hover:text-white"
          >
            {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
