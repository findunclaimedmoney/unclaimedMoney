import { useState } from "react";
import { Link, useLocation } from "wouter";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

type Mode = "login" | "register" | "forgot";

const TOKEN_KEY = "mc:token";
const USER_KEY = "mc:user";

export type StoredUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  referralCode?: string | null;
};

export function getStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function signOut(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary";
const labelClass = "block text-xs text-muted-foreground mb-1";

export default function SignIn() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
  });

  usePageSEO({
    title: mode === "register" ? "Create Your Account — MissingCash" : "Sign In — MissingCash",
    description:
      "Sign in to your MissingCash account to track your searches, manage weekly money alerts and get your referral link.",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const post = async (path: string, body: Record<string, string>) => {
    const res = await fetch(BASE + "api/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, data };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { ok, data } = await post("auth/forgot-password", { email: form.email });
        if (!ok) {
          setError((data["error"] as string) ?? "Something went wrong. Please try again.");
          return;
        }
        setNotice("If that email is registered, a password reset link is on its way. Check your inbox.");
        return;
      }

      if (mode === "register") {
        const { ok, data } = await post("auth/register", {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
        });
        if (!ok || typeof data["token"] !== "string") {
          setError((data["error"] as string) ?? "Could not create your account. Please try again.");
          return;
        }
        window.localStorage.setItem(TOKEN_KEY, data["token"] as string);
        window.localStorage.setItem(
          USER_KEY,
          JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            referralCode: (data["referralCode"] as string) ?? null,
          }),
        );
        navigate("/refer");
        return;
      }

      const { ok, data } = await post("auth/login", {
        email: form.email,
        password: form.password,
      });
      if (!ok || typeof data["token"] !== "string") {
        setError((data["error"] as string) ?? "Incorrect email or password.");
        return;
      }
      window.localStorage.setItem(TOKEN_KEY, data["token"] as string);
      window.localStorage.setItem(USER_KEY, JSON.stringify(data["user"] ?? {}));
      navigate("/refer");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const heading =
    mode === "register" ? "Create your free account" : mode === "forgot" ? "Reset your password" : "Welcome back";
  const sub =
    mode === "register"
      ? "Free to join. No account fees. Get your referral link straight away."
      : mode === "forgot"
        ? "Enter your email and we will send you a reset link."
        : "Sign in to see your searches, alerts and referral earnings.";
  const cta =
    mode === "register" ? "Create My Account" : mode === "forgot" ? "Send Reset Link" : "Sign In";

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center py-16">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="bg-primary text-primary-foreground p-2 rounded-md">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-heading text-2xl mt-1 tracking-wider text-white">MISSINGCASH</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{heading}</h1>
          <p className="text-sm text-muted-foreground">{sub}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          {mode !== "forgot" && (
            <div className="grid grid-cols-2 gap-2 mb-5 rounded-xl bg-background p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={
                  "h-9 rounded-lg text-sm font-semibold transition-colors " +
                  (mode === "login"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-white")
                }
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={
                  "h-9 rounded-lg text-sm font-semibold transition-colors " +
                  (mode === "register"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-white")
                }
              >
                Create Account
              </button>
            </div>
          )}

          {notice ? (
            <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-3 mb-4">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-white">{notice}</p>
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>First name</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={set("firstName")}
                    className={inputClass}
                    placeholder="Jane"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Last name</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={set("lastName")}
                    className={inputClass}
                    placeholder="Citizen"
                    autoComplete="family-name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                className={inputClass}
                placeholder="jane@example.com"
                autoComplete="email"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className={labelClass}>Mobile</label>
                <input
                  type="tel"
                  required
                  value={form.mobile}
                  onChange={set("mobile")}
                  className={inputClass}
                  placeholder="04XX XXX XXX"
                  autoComplete="tel"
                />
              </div>
            )}

            {mode !== "forgot" && (
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={set("password")}
                  className={inputClass}
                  placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                />
              </div>
            )}

            {error ? (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : cta}
            </Button>
          </form>

          <div className="mt-4 text-center">
            {mode === "forgot" ? (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-xs text-primary hover:underline"
              >
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Forgot your password?
              </button>
            )}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/50 text-center mt-4">
          By creating an account you agree to our{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          . We never sell your data.
        </p>
      </div>
    </div>
  );
}
