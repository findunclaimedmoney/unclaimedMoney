import { Shield } from "lucide-react";
import { Link } from "wouter";
import { usePageSEO } from "@/hooks/use-page-seo";

export default function Privacy() {
  usePageSEO({
    title: "Privacy Policy | MissingCash",
    description:
      "How MissingCash collects, uses and protects your information. We do not store your search queries or personal data. Read our full privacy policy.",
    keywords: "MissingCash privacy policy, data protection, privacy Australia",
    canonical: "https://www.missingcash.com.au/privacy",
  });

  const lastUpdated = "11 June 2026";

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 mb-6">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-heading tracking-wider mb-4 text-white">
            PRIVACY <span className="text-primary">POLICY</span>
          </h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 space-y-8 prose-invert">
            <p className="text-muted-foreground leading-relaxed">
              MissingCash Australia ("we", "our", "us") is committed to protecting the privacy of our users ("you") in accordance with the <strong className="text-white">Privacy Act 1988 (Cth)</strong> and the Australian Privacy Principles (APPs). This Privacy Policy explains how we collect, use, store, and protect your personal information.
            </p>

            {[
              {
                title: "1. Information We Collect",
                body: `We collect information you voluntarily provide, including:
                
• Name (first and last) when using the search tool
• Contact details (email, phone) when submitting a contact form or finance enquiry
• Birth year and state (optional, for refining search results)
• Finance enquiry details when requesting a Stratton Finance quote

We do not collect or store search queries made using our free search tool beyond the current browser session.`
              },
              {
                title: "2. How We Use Your Information",
                body: `We use your information to:

• Provide and improve our search service
• Respond to your enquiries and support requests
• Forward finance enquiries to Stratton Finance (ACL 364340) for the purpose of providing a finance quote, only where you have explicitly requested this
• Comply with legal obligations

We will never sell, trade, or share your personal information with third parties for marketing purposes.`
              },
              {
                title: "3. Data Storage & Security",
                body: `Your search queries are processed in real-time and are not stored on our servers. Contact and finance form submissions are stored securely for the purposes of responding to your enquiry.

We implement industry-standard security measures including SSL/TLS encryption on all data transmissions. Despite our best efforts, no online service is completely secure — we encourage you to be mindful of the information you share.`
              },
              {
                title: "4. Sharing Your Information",
                body: `We only share your information with:

• Stratton Finance (ACL 364340) — when you submit a finance enquiry. Stratton Finance has its own Privacy Policy which governs how they handle your data.
• Our service providers — who assist in operating our website and services, bound by confidentiality agreements.
• Law enforcement or regulators — where required by law.

We do not share your information with data brokers, advertisers, or other third parties.`
              },
              {
                title: "5. Cookies & Analytics",
                body: `Our website uses essential cookies to ensure the site functions correctly. We may use anonymised analytics tools (such as Google Analytics) to understand how users interact with our site. These analytics do not identify you personally.

You can disable cookies in your browser settings, though some features of the site may not function correctly as a result.`
              },
              {
                title: "6. Your Rights",
                body: `Under the Privacy Act 1988, you have the right to:

• Access the personal information we hold about you
• Request correction of inaccurate or outdated information
• Request deletion of your information (where legally permissible)
• Opt out of any direct marketing communications

To exercise these rights, please contact us at support@missingcash.com.au.`
              },
              {
                title: "7. Third-Party Links",
                body: `Our website contains links to external websites including government databases (ATO, ASIC, myGov) and partner websites (Stratton Finance). We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review the privacy policies of any external sites you visit.`
              },
              {
                title: "8. Changes to This Policy",
                body: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of our service after changes constitutes acceptance of the revised policy.`
              },
              {
                title: "9. Contact Us",
                body: `If you have any questions, concerns, or complaints about how we handle your personal information, please contact our Privacy Officer at:

Email: support@missingcash.com.au
ABN: 52 347 989 391
Based in: Perth, Western Australia`
              },
            ].map((section, i) => (
              <div key={i} className="space-y-3">
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                  {section.body}
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                © {new Date().getFullYear()} MissingCash Australia · ABN 52 347 989 391 · 
                <Link href="/contact" className="text-primary hover:underline ml-1">Contact Us</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
