import type { Metadata } from "next";
import Link from "next/link";
import { Container, Tag } from "@/components/ui";
import { siteConfig } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${siteConfig.name} uses cookies and similar technologies, and how you can control them.`,
  alternates: { canonical: "/cookie-policy" },
  openGraph: { url: "/cookie-policy", type: "website" },
  robots: { index: false },
};

export default function CookiePolicyPage() {
  return (
    <main className="flex-1 py-10 sm:py-12">
      <Container width="narrow">
        <div className="mb-12">
          <Tag variant="default" className="mb-5">Legal</Tag>
          <h1 className="font-display text-4xl font-bold text-text mb-3">
            Cookie Policy
          </h1>
          <p className="text-sm text-muted">Last updated: {siteConfig.legal.lastUpdated}</p>
        </div>

        <div className="space-y-10 text-text/85 leading-relaxed">

          <section>
            <p className="text-sm">
              This Cookie Policy explains how {siteConfig.name} ({siteConfig.domain}) uses
              cookies and similar technologies when you visit our site. It should be read
              alongside our{" "}
              <Link
                href="/privacy-policy"
                className="text-primary underline underline-offset-3 hover:opacity-80"
              >
                Privacy Policy
              </Link>
              , which explains how we handle your personal data more broadly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              What Are Cookies?
            </h2>
            <p className="text-sm">
              Cookies are small text files that a website places on your device when you
              visit. They are widely used to make websites work, to remember your
              preferences, and to provide information to the site owner. Similar
              technologies, such as pixels, local storage, and software development kits,
              perform comparable functions, and we refer to all of them as
              &ldquo;cookies&rdquo; in this policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Types of Cookies We Use
            </h2>

            <h3 className="font-semibold text-text text-sm mb-2">Essential cookies</h3>
            <p className="mb-6 text-sm">
              These are necessary for the site to function correctly, for example to
              remember your cookie preferences or to keep the site secure. The site cannot
              work properly without them, so they cannot be switched off in our systems.
            </p>

            <h3 className="font-semibold text-text text-sm mb-2">Analytics cookies</h3>
            <p className="mb-6 text-sm">
              These help us understand how visitors use the site, such as which pages are
              most popular and how people move through our content, so we can improve it.
              The information is collected in an aggregated, anonymized form.
            </p>

            <h3 className="font-semibold text-text text-sm mb-2">Advertising cookies</h3>
            <p className="text-sm">
              These are set by our advertising partners to show relevant ads and to measure
              ad performance. They may be used to build a profile of your interests and show
              you relevant ads on other sites.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Third-Party Cookies
            </h2>
            <p className="mb-5 text-sm">
              Some cookies are set by third-party services we use. Each has its own privacy
              and cookie policy governing how it handles your data.
            </p>
            <div className="space-y-5">
              {([
                {
                  name: "Google Analytics",
                  body: "Sets cookies to measure how visitors use the site (pages viewed, session length, approximate location). You can opt out with the Google Analytics Opt-out Browser Add-on at tools.google.com/dlpage/gaoptout.",
                },
                {
                  name: "Google AdSense",
                  body: "Serves advertisements and may set cookies to show ads based on your prior visits to this and other sites. You can manage ad personalization at adssettings.google.com.",
                },
                {
                  name: "Affiliate networks",
                  body: "When you click an affiliate link, the partner network (such as Amazon Associates, Impact, or PartnerStack) may set a cookie so any resulting purchase is credited to us. These cookies do not give us access to your payment details.",
                },
              ] as const).map((service) => (
                <div key={service.name} className="border-l-2 border-primary/25 pl-5">
                  <p className="font-medium text-text mb-1">{service.name}</p>
                  <p className="text-sm text-muted">{service.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              How to Manage Cookies
            </h2>
            <p className="mb-4 text-sm">
              You can control and delete cookies through your browser settings. Most
              browsers let you refuse or delete cookies, and you can set most browsers to
              notify you when a cookie is being set. Because each browser is different,
              check your browser&rsquo;s help menu for how to manage your preferences.
            </p>
            <p className="text-sm">
              Please note that if you disable cookies, some parts of the site may not work
              as intended. You can also opt out of personalized advertising by visiting{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-3 hover:opacity-80"
              >
                adssettings.google.com
              </a>{" "}
              or the Digital Advertising Alliance opt-out page at{" "}
              <a
                href="https://optout.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-3 hover:opacity-80"
              >
                optout.aboutads.info
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Consent
            </h2>
            <p className="text-sm">
              Where required by law, we ask for your consent before setting non-essential
              cookies. By continuing to use the site after being presented with our cookie
              notice, or by adjusting your preferences, you agree to our use of cookies as
              described in this policy. You can change or withdraw your consent at any time
              through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Changes to This Policy
            </h2>
            <p className="text-sm">
              We may update this Cookie Policy from time to time. When we do, we will update
              the &ldquo;Last updated&rdquo; date at the top of this page. We encourage you
              to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Contact Us
            </h2>
            <p className="text-sm">
              If you have questions about our use of cookies, please email{" "}
              <a
                href={`mailto:${siteConfig.contact.privacyEmail}`}
                className="text-primary underline underline-offset-3 hover:opacity-80"
              >
                {siteConfig.contact.privacyEmail}
              </a>{" "}
              or use our{" "}
              <Link
                href="/contact"
                className="text-primary underline underline-offset-3 hover:opacity-80"
              >
                contact form
              </Link>.
            </p>
          </section>

        </div>
      </Container>
    </main>
  );
}
