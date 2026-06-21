import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";

interface EmailAlertSignupProps {
  className?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
}

export default function EmailAlertSignup({
  className = "",
  placeholder = "Enter your email address",
  buttonText = "Get Free Alerts",
  successMessage = "You're signed up! We'll alert you when new money is found.",
}: EmailAlertSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Connection error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className={`flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 ${className}`}>
        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        <p className="text-sm text-green-400">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <div className="relative flex-1">
        <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
          disabled={status === "loading"}
        />
      </div>
      <Button
        type="submit"
        disabled={status === "loading"}
        className="h-11 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shrink-0"
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Signing up…</>
        ) : (
          buttonText
        )}
      </Button>
      {errorMsg && <p className="text-xs text-red-400 sm:col-span-2 mt-1">{errorMsg}</p>}
    </form>
  );
}
