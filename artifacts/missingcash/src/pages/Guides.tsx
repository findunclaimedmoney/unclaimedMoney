import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import { Shield, Search, HandCoins, ArrowRight, CheckCircle2 } from "lucide-react";

const STRIPE = {
  missingcash: "https://buy.stripe.com/6oUbJ0eCE4FDbAFaYo4c800",
  miaRecovery: "https://buy.stripe.com/5kQdR82TWdc9eMR2rS4c80i",
};

const guide = {
  title: "MissingCash Premium Guide",
  subtitle: "The DIY route",
  price: 24.99,
  stripeUrl: STRIPE.missingcash,
  features: [
    "Complete ATO, ASIC & bank claim instructions",
    "Exact forms and supporting documents required",
    "Step-by-step lodgement for each agency",
    "How to speed up slow claims",
    "Common rejection reasons — and how to avoid them",
  ],
};

export default function Guides() {
  usePageSEO({
    title: "How It Works | MissingCash — Find & Claim Unclaimed Money",
    description:
      "Get a free finance quote and receive a free search, or pay $24.99 and Mia searches for your money right now. Step-by-step guides available too.",
    keywords: "unclaimed money guide Australia, MissingCash how it works, claim unclaimed money",
    canonical: "https://www.missingcash.com.au/guides",
  });

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-primary text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" /> Two ways in, one goal
          </div>
          <h1 className="text-5xl md:text-6xl font-heading tracking-wider text-white mb-6">
            HOW IT <span className="text-primary">WORKS</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Get a free finance quote and receive a free search — or skip
            straight to a $24.99 search and Mia looks for your money right
            now.
          </p>
        </div>
      </section>

      {/* The fork: two paths, side by side */}
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Path A — free via quote */}
            <div className="rounded-2xl border border-primary/30 bg-card p-7 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                <HandCoins className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Get a quote, search free
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                Answer a few quick questions for a no-obligation Stratton
                Finance quote — you're never signed up for anything just by
                asking. As a thank-you, Mia runs your unclaimed-money search
                at no cost.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                {["No obligation to take the quote", "Search included, free", "Takes about 2 minutes"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/finance">
                <Button className="w-full h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                  Get My Quote <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>

            {/* Path B — flat $24.99 */}
            <div className="rounded-2xl border border-border bg-card p-7 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center mb-5">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Skip it, search now
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                Not interested in a finance quote? No problem. Pay a flat
                $24.99 and Mia starts searching immediately — results emailed
                to you within minutes, found or not.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                {["No forms, no finance questions", "Flat $24.99, one time", "Results emailed within minutes"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/search">
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-white/20 text-white hover:bg-white/5">
                  Search for $24.99 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      from PIL import Image, ImageDraw, ImageFont

# ── Canvas setup ──────────────────────────────────────────────
W, H = 1080, 1350  # Instagram portrait ratio
img = Image.new("RGB", (W, H), (10, 22, 40))  # navy background
draw = ImageDraw.Draw(img)

GOLD = (245, 185, 66)
GOLD_LIGHT = (255, 214, 130)
NAVY = (10, 22, 40)
NAVY_CARD = (17, 33, 56)
WHITE = (255, 255, 255)
MUTED = (150, 170, 190)

SERIF_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SANS_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def font(path, size):
    return ImageFont.truetype(path, size)

def center_text(draw, cx, y, text, fnt, fill):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    w = bbox[2] - bbox[0]
    draw.text((cx - w / 2, y), text, font=fnt, fill=fill)
    return bbox[3] - bbox[1]

# ── Subtle radial-style glow (approximated with layered ellipses) ──
glow = Image.new("RGB", (W, H), NAVY)
glow_draw = ImageDraw.Draw(glow)
for r, alpha_step in [(700, 6), (550, 8), (400, 10), (250, 14)]:
    shade = tuple(min(255, c + alpha_step) for c in NAVY)
    glow_draw.ellipse(
        [W / 2 - r, 120 - r * 0.6, W / 2 + r, 120 + r * 0.6],
        fill=shade,
    )
img = Image.blend(img, glow, 0.9)
draw = ImageDraw.Draw(img)

# ── Top eyebrow badge ──
badge_text = "MISSINGCASH  ·  REFER & EARN"
f_eyebrow = font(SANS_BOLD, 26)
bbox = draw.textbbox((0, 0), badge_text, font=f_eyebrow)
bw = (bbox[2] - bbox[0]) + 70
bh = 58
bx = W / 2 - bw / 2
by = 90
draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=bh / 2, outline=GOLD, width=2)
center_text(draw, W / 2, by + 15, badge_text, f_eyebrow, GOLD)

# ── Headline ──
f_h1 = font(SERIF_BOLD, 92)
f_h1b = font(SERIF_BOLD, 92)
y = 210
center_text(draw, W / 2, y, "Refer a friend.", f_h1, WHITE)
y += 108
center_text(draw, W / 2, y, "Earn 2%.", f_h1b, GOLD)

# ── Subhead ──
f_sub = font(SANS, 32)
y += 130
sub_lines = ["No cap. The bigger the loan,", "the bigger the reward."]
for line in sub_lines:
    center_text(draw, W / 2, y, line, f_sub, MUTED)
    y += 44

# ── Example card ──
card_y = y + 60
card_h = 560
card_margin = 90
draw.rounded_rectangle(
    [card_margin, card_y, W - card_margin, card_y + card_h],
    radius=28,
    fill=NAVY_CARD,
    outline=GOLD,
    width=3,
)

f_label = font(SANS_BOLD, 26)
f_amount = font(SERIF_BOLD, 64)
f_arrow = font(SANS_BOLD, 44)
f_reward_label = font(SANS_BOLD, 26)
f_reward = font(SERIF_BOLD, 96)

inner_y = card_y + 55
center_text(draw, W / 2, inner_y, "FRIEND'S LOAN APPROVED FOR", f_label, MUTED)
inner_y += 60
center_text(draw, W / 2, inner_y, "$5,000", f_amount, WHITE)
inner_y += 105

center_text(draw, W / 2, inner_y, "↓", f_arrow, GOLD)
inner_y += 75

center_text(draw, W / 2, inner_y, "YOU EARN", f_reward_label, MUTED)
inner_y += 55
center_text(draw, W / 2, inner_y, "$100", f_reward, GOLD)
inner_y += 130

f_cta_label = font(SANS_BOLD, 30)
center_text(draw, W / 2, inner_y, "Cash or a Visa card", f_cta_label, WHITE)

# ── Bottom CTA ──
cta_y = card_y + card_h + 55
f_cta_sub = font(SANS, 28)
center_text(draw, W / 2, cta_y, "missingcash.com.au/refer", f_cta_sub, GOLD)

# ── Footer ──
footer_y = H - 90
f_footer = font(SANS, 20)
center_text(draw, W / 2, footer_y, "ABN 52 347 989 391 · Terms apply", f_footer, MUTED)

img.save("/home/claude/referral_poster.png")
print("Saved")

            <div className="flex flex-col md:flex-row items-center gap-8 mt-2">
              <div className="text-7xl shrink-0">🤖</div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-heading tracking-wider text-white mb-1">MIA SPEED RECOVERY</h2>
                <p className="text-lg font-semibold text-[#00C1D5] mb-3">
                  What takes months on your own — Mia does in minutes.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Searching 8 Australian databases yourself takes weeks — ATO
                  portals, ASIC registers, state offices, share registries.
                  Mia does it all for you and emails a full personalised
                  report, with claim instructions for every dollar found.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div>
                    <span className="text-4xl font-bold text-primary">$99</span>
                    <span className="text-sm text-muted-foreground ml-2">one-time · report in minutes</span>
                  </div>
                  <a href={STRIPE.miaRecovery} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="w-full h-14 px-8 text-lg font-bold tracking-wider rounded-xl bg-[#00C1D5] hover:bg-[#00C1D5]/90 text-white shadow-[0_4px_20px_rgba(0,193,213,0.4)]">
                      Get Mia Speed Recovery — $99
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIY guide */}
      <section className="py-4 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-white mb-1">{guide.title}</h2>
            <p className="text-sm text-muted-foreground mb-5">{guide.subtitle} — prefer to claim it yourself?</p>
            <ul className="space-y-2 mb-6">
              {guide.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-primary">${guide.price.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">one-time · instant PDF</span>
            </div>
            <a href={guide.stripeUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full font-bold tracking-wider rounded-xl h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                Get Instant Access — ${guide.price.toFixed(2)}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: "🔒", label: "Secure via Stripe" },
              { icon: "⚡", label: "Results in minutes" },
              { icon: "🇦🇺", label: "100% Australian" },
              { icon: "🤝", label: "No obligation quote" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="text-3xl">{item.icon}</div>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
