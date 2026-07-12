import type { Metadata } from "next";
import Link from "next/link";
import { Container, Tag } from "@/components/ui";
import { siteConfig } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: `How ${siteConfig.name} uses affiliate links, and our commitment to keeping reviews independent.`,
  alternates: { canonical: "/affiliate-disclosure" },
  openGraph: { url: "/affiliate-disclosure", type: "website" },
  robots: { index: false },
};

export default function AffiliateDisclosurePage() {
  return (
    <main className="flex-1 py-10 sm:py-12">
      <Container width="narrow">
        <div className="mb-12">
          <Tag variant="default" className="mb-5">Legal</Tag>
          <h1 className="font-display text-4xl font-bold text-text mb-3">
            Affiliate Disclosure
          </h1>
          <p className="text-sm text-muted">Last updated: {siteConfig.legal.lastUpdated}</p>
        </div>

        <div className="space-y-10 text-text/85 leading-relaxed">

          <section>
            <div className="border border-black/[0.08] rounded-xl bg-white p-5 mb-2">
              <p className="text-sm">
                <span className="font-medium text-text">In short: </span>
                {siteConfig.name} is reader-supported. Some links on this site are affiliate
                links, and we may earn a commission when you sign up or buy through them, at
                no extra cost to you. This never changes our reviews, scores, or picks.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              How Affiliate Links Work
            </h2>
            <p className="mb-4 text-sm">
              An affiliate link is a special URL that tells a company you came from
              {" "}{siteConfig.name}. If you click one of our affiliate links and then sign
              up for or buy a product, the company may pay us a small commission or referral
              fee. The price you pay is exactly the same as it would be otherwise, and in
              some cases you may even get a discount.
            </p>
            <p className="text-sm">
              Commissions help us cover the cost of testing tools (many of which we pay for
              out of pocket), hosting the site, and creating new reviews and guides. It&rsquo;s
              what lets us keep the site free to read.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Programs We Participate In
            </h2>
            <p className="mb-4 text-sm">
              {siteConfig.name} participates in a number of affiliate programs, both directly
              and through affiliate networks. These include, but are not limited to, the
              Amazon Associates Program and affiliate networks such as Impact, PartnerStack,
              and Rewardful, as well as the individual affiliate programs of the AI tools we
              review.
            </p>
            <p className="text-sm">
              As an Amazon Associate, we earn from qualifying purchases. All product names,
              logos, and brands mentioned on this site are the property of their respective
              owners and are used for identification and commentary only.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Our Editorial Independence
            </h2>
            <p className="mb-4 text-sm">
              Affiliate relationships do not influence our opinions, ratings, or
              recommendations. We test tools hands-on and score them on the same criteria
              regardless of whether a company has an affiliate program or what it pays.
              When a free or cheaper alternative is the better choice, we say so, even if it
              earns us less or nothing at all.
            </p>
            <p className="text-sm">
              We only recommend tools we believe are genuinely useful to our readers. If we
              think a product isn&rsquo;t worth it, we&rsquo;ll tell you, affiliate program
              or not.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              FTC Compliance
            </h2>
            <p className="text-sm">
              This disclosure is provided in accordance with the U.S. Federal Trade
              Commission&rsquo;s guidelines on the use of endorsements and testimonials in
              advertising (16 CFR Part 255). We aim to disclose affiliate relationships
              clearly and conspicuously wherever they appear, including on individual review
              and comparison pages.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Advertising
            </h2>
            <p className="text-sm">
              In addition to affiliate links, {siteConfig.name} may display third-party
              advertisements, including ads served by Google AdSense. The presence of an ad
              is not an endorsement. For more detail, see our{" "}
              <Link
                href="/disclaimer"
                className="text-primary underline underline-offset-3 hover:opacity-80"
              >
                Disclaimer
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-primary underline underline-offset-3 hover:opacity-80"
              >
                Privacy Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Questions?
            </h2>
            <p className="text-sm">
              If you have any questions about our affiliate relationships, email us at{" "}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-primary underline underline-offset-3 hover:opacity-80"
              >
                {siteConfig.contact.email}
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
