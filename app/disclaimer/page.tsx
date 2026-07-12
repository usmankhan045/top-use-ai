import type { Metadata } from "next";
import { Container, Tag } from "@/components/ui";
import { siteConfig } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `Financial disclaimer, affiliate disclosure, and earnings disclaimer for ${siteConfig.name}.`,
  alternates: { canonical: "/disclaimer" },
  openGraph: { url: "/disclaimer", type: "website" },
  robots: { index: false },
};

export default function DisclaimerPage() {
  return (
    <main className="flex-1 py-10 sm:py-12">
      <Container width="narrow">
        <div className="mb-12">
          <Tag variant="default" className="mb-5">Legal</Tag>
          <h1 className="font-display text-4xl font-bold text-text mb-3">
            Disclaimer
          </h1>
          <p className="text-sm text-muted">Last updated: {siteConfig.legal.lastUpdated}</p>
        </div>

        <div className="space-y-10 text-text/85 leading-relaxed">

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Financial Disclaimer
            </h2>
            <p className="mb-4 text-sm">
              The content published on {siteConfig.name} ({siteConfig.domain}) is intended
              for educational and informational purposes only. Nothing on this site
              constitutes financial, investment, legal, or tax advice, and nothing should
              be interpreted as a recommendation to buy, sell, or hold any financial
              product or security.
            </p>
            <p className="mb-4 text-sm">
              The owner of {siteConfig.name} is not a licensed financial advisor, broker,
              investment advisor, or tax professional. Content on this site reflects
              personal experience, general research, and publicly available information.
              It is not tailored to your individual financial situation, goals, risk
              tolerance, or tax circumstances.
            </p>
            <p className="text-sm">
              Your financial situation is unique. Before making any significant financial
              decision, including changes to your budget, savings strategy, investment
              approach, debt repayment plan, or tax filings, please consult a qualified,
              licensed professional who can evaluate your specific circumstances.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Affiliate Disclosure
            </h2>
            <p className="mb-4 text-sm">
              {siteConfig.name} participates in affiliate marketing programs. Some links on
              this site are affiliate links, meaning we may earn a small commission if
              you click a link and make a purchase, at no additional cost to you.
            </p>
            <p className="mb-4 text-sm">
              We only recommend products, services, and resources that we genuinely
              believe may be useful to our readers. Affiliate relationships do not
              influence our editorial content, opinions, or recommendations. We aim to
              disclose affiliate relationships transparently throughout the site.
            </p>
            <p className="text-sm">
              This disclosure is made in compliance with the Federal Trade Commission
              (FTC) guidelines on endorsements and testimonials (16 CFR Part 255).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Earnings Disclaimer
            </h2>
            <p className="mb-4 text-sm">
              Any examples of financial results, debt payoff amounts, or savings figures
              mentioned on {siteConfig.name} represent individual experiences or illustrative
              scenarios. They should not be interpreted as typical, average, or guaranteed
              results.
            </p>
            <p className="text-sm">
              Personal finance outcomes vary significantly based on individual income,
              expenses, debt levels, life circumstances, consistency of effort, and many
              other factors outside our control. {siteConfig.name} makes no guarantee,
              express or implied, that you will achieve any specific financial outcome
              by following the information or strategies described on this site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              Advertising
            </h2>
            <p className="text-sm">
              {siteConfig.name} displays third-party advertisements, including those served
              by Google AdSense. The presence of an advertisement on this site does not
              constitute an endorsement of any advertised product, service, or company.
              Advertisers are solely responsible for the accuracy of their ad content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              External Links
            </h2>
            <p className="text-sm">
              This site may contain links to external websites. These links are provided
              for convenience and informational purposes only. {siteConfig.name} does not
              control the content of linked sites and is not responsible for their
              accuracy, completeness, or reliability. Linking to an external site does
              not constitute an endorsement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              No Warranties
            </h2>
            <p className="text-sm">
              All content on {siteConfig.name} is provided &ldquo;as is&rdquo; without
              warranties of any kind. We make reasonable efforts to ensure that
              information is accurate and up to date, but we make no representations
              or warranties regarding completeness, accuracy, reliability, or suitability
              for any particular purpose. Financial laws, regulations, and best practices
              change over time. Content may become outdated. Always verify information
              through current, authoritative sources before relying on it.
            </p>
          </section>

        </div>
      </Container>
    </main>
  );
}
