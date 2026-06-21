import { Mail, MessageSquare, CheckCircle2, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { usePageSEO } from "@/hooks/use-page-seo";

export default function Contact() {
  usePageSEO({
    title: "Contact MissingCash | Unclaimed Money Support Australia",
    description:
      "Get in touch with the MissingCash team for help finding or claiming unclaimed money in Australia. Email support@missingcash.com.au — we typically reply within one business day.",
    keywords:
      "contact MissingCash, unclaimed money help, MissingCash support, unclaimed money enquiry Australia",
    canonical: "https://www.missingcash.com.au/contact",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-border bg-secondary/50 px-4 py-1.5 mb-8">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-primary" /> GET IN TOUCH
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider mb-6 text-white">
            CONTACT <span className="text-primary">US</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Have a question about your search results, our service, or the claims process? We're here to help.
          </p>
        </div>
      </section>

      {/* Form + info */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Info column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-heading tracking-wider text-white mb-5">GET IN TOUCH</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-primary/20 rounded-lg shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">Email Us</p>
                      <a href="mailto:support@missingcash.com.au" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        support@missingcash.com.au
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-primary/20 rounded-lg shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">Response Time</p>
                      <p className="text-sm text-muted-foreground">Within 1–2 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-primary/20 rounded-lg shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">Based In</p>
                      <p className="text-sm text-muted-foreground">Perth, Western Australia</p>
                      <p className="text-xs text-muted-foreground">Serving all of Australia</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-heading text-xl tracking-wider text-white mb-4">COMMON QUERIES</h3>
                <ul className="space-y-3">
                  {[
                    "How do I claim my unclaimed super?",
                    "How do I get the claims guide?",
                    "What if my name is common?",
                    "Finance enquiries (Stratton)",
                    "Privacy or data removal requests",
                  ].map((q, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Form column */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-card border border-green-500/30 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-heading tracking-wider text-white mb-3">MESSAGE SENT!</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Thanks for reaching out. We'll get back to you within 1–2 business days.
                  </p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                  <h2 className="text-2xl font-heading tracking-wider text-white mb-6">SEND US A MESSAGE</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="con-first" className="text-muted-foreground">First Name *</Label>
                        <Input id="con-first" name="firstName" placeholder="John" required className="bg-background h-12" data-testid="input-contact-first-name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="con-last" className="text-muted-foreground">Last Name *</Label>
                        <Input id="con-last" name="lastName" placeholder="Smith" required className="bg-background h-12" data-testid="input-contact-last-name" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="con-email" className="text-muted-foreground">Email Address *</Label>
                      <Input id="con-email" name="email" type="email" placeholder="john@example.com" required className="bg-background h-12" data-testid="input-contact-email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="con-subject" className="text-muted-foreground">Subject *</Label>
                      <Select name="subject" required>
                        <SelectTrigger id="con-subject" className="bg-background h-12">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claim">Help with my claim</SelectItem>
                          <SelectItem value="guide">Claims guide purchase</SelectItem>
                          <SelectItem value="finance">Finance enquiry</SelectItem>
                          <SelectItem value="technical">Technical issue</SelectItem>
                          <SelectItem value="privacy">Privacy / data request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="con-message" className="text-muted-foreground">Message *</Label>
                      <Textarea
                        id="con-message"
                        name="message"
                        placeholder="Please describe your question or issue in detail..."
                        required
                        rows={5}
                        className="bg-background resize-none"
                        data-testid="input-contact-message"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_rgba(245,185,66,0.25)] transition-all hover:-translate-y-0.5" data-testid="button-contact-submit">
                      SEND MESSAGE
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      We respect your privacy. Your details are never shared without consent.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
