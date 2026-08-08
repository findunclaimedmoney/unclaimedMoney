// Captures marketing attribution from the landing-page URL so every lead shows
// which TikTok video / campaign drove it. Point all ads at the SAME page and
// just change the tag per video, e.g. /start?v=cars1
export function getLeadSource(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const v = params.get("v");
  const utmSource = params.get("utm_source");
  const utmCampaign = params.get("utm_campaign");
  const utmContent = params.get("utm_content");
  const parts = [
    v,
    utmCampaign && `utm_campaign=${utmCampaign}`,
    utmContent && `utm_content=${utmContent}`,
    utmSource && `utm_source=${utmSource}`,
  ].filter(Boolean) as string[];
  if (parts.length === 0) return null;
  return parts.join(" · ").slice(0, 120);
}

// Captures a referral code from the URL, e.g. missingcash.com.au?ref=JOHN123
// Used to credit an existing customer when someone they referred submits a
// finance enquiry. Persisted to localStorage so the code survives if the
// visitor lands on ?ref=... then navigates to a different page before
// submitting the form.
const REFERRAL_STORAGE_KEY = "missingcash_ref";

export function getReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("ref");
  if (fromUrl) {
    const cleaned = fromUrl.trim().slice(0, 40);
    try {
      window.localStorage.setItem(REFERRAL_STORAGE_KEY, cleaned);
    } catch {
      // localStorage unavailable — fall through, still return the URL value
    }
    return cleaned;
  }
  try {
    return window.localStorage.getItem(REFERRAL_STORAGE_KEY);
  } catch {
    return null;
  }
}
