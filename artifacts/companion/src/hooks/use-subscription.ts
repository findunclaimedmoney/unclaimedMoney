import { useState, useEffect, useCallback } from "react";

export interface SubscriptionStatus {
  tier: "free" | "spark" | "flame";
  active: boolean;
  voiceRemaining: number | null;
  voiceLimit: number | null;
  email: string | null;
}

const DEFAULT: SubscriptionStatus = { tier: "free", active: false, voiceRemaining: 0, voiceLimit: 0, email: null };

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const apiBase = base.replace("/companion", "");

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>(DEFAULT);
  const [loading, setLoading] = useState(false);

  const getStoredEmail = () => localStorage.getItem("companion_email");

  const refresh = useCallback(async (email?: string) => {
    const e = email ?? getStoredEmail();
    if (!e) { setStatus(DEFAULT); return; }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/companion/subscribe/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      });
      if (res.ok) {
        const data = await res.json() as Omit<SubscriptionStatus, "email">;
        setStatus({ ...data, email: e });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const activate = useCallback(async (email: string) => {
    localStorage.setItem("companion_email", email);
    await refresh(email);
  }, [refresh]);

  const checkout = useCallback(async (tier: "spark" | "flame") => {
    const email = getStoredEmail() ?? undefined;
    const res = await fetch(`${apiBase}/api/companion/subscribe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, email }),
    });
    if (!res.ok) throw new Error("Checkout failed");
    const data = await res.json() as { checkoutUrl: string };
    window.location.href = data.checkoutUrl;
  }, []);

  const openPortal = useCallback(async () => {
    const email = getStoredEmail();
    if (!email) return;
    const res = await fetch(`${apiBase}/api/companion/subscribe/portal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return;
    const data = await res.json() as { portalUrl: string };
    window.location.href = data.portalUrl;
  }, []);

  const verifySession = useCallback(async (sessionId: string) => {
    const res = await fetch(`${apiBase}/api/companion/subscribe/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) return;
    const data = await res.json() as { email: string; tier: string };
    localStorage.setItem("companion_email", data.email);
    await refresh(data.email);
  }, [refresh]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (sid) {
      window.history.replaceState({}, "", window.location.pathname);
      verifySession(sid);
    } else {
      refresh();
    }
  }, []);

  const canUseVoice = status.active && (status.voiceRemaining === null || status.voiceRemaining > 0);
  const canUseCustomPersona = status.active;
  const canUseVideoCall = status.active && status.tier === "flame";

  return { status, loading, canUseVoice, canUseCustomPersona, canUseVideoCall, refresh, activate, checkout, openPortal };
}
