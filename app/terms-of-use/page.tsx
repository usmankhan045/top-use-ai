import type { Metadata } from "next";
import Link from "next/link";
import { Container, Tag } from "@/components/ui";
import { siteConfig } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms and conditions governing your use of ${siteConfig.name}.`,
  alternates: { canonical: "/terms-of-use" },
  openGraph: { url: "/terms-of-use", type: "website" },
  robots: { index: false },
};

export default function TermsOfUsePage() {
  return (
    <main className="flex-1 py-10 sm:py-12">
      <Container width="narrow">
        <div className="mb-12">
          <Tag variant="default" className="mb-5">Legal</Tag>
          <h1 className="font-display text-4xl font-bold text-text mb-3">
            Terms of Use
          </h1>
          <p className="text-sm text-muted">Last updated: {siteConfig.legal.lastUpdated}</p>
        </div>

        <div className="space-y-10 text-text/85 leading-relaxed">

          <section>
            <p className="text-sm">
              By accessing or using {siteConfig.name} at {siteConfig.domain}
              (&ldquo;the Site&rdquo;), you agree to be bound by these Terms of Use.
              If you do not agree to these terms, please do not use the Site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              1. Use of the Site
            </h2>
            <p className="mb-4 text-sm">
              You may use {siteConfig.name} for personal, non-commercial purposes only.
              By using the Site, you agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Copy, reproduce, distribute, or republish site content without our express written permission</li>
              <li>Use automated tools, bots, or scrapers to extract content from the Site</li>
              <li>Use the Site in any way that violates applicable local, national, or international laws or regulations</li>
              <li>Attempt to gain unauthorized access to any part of the Site or its underlying systems</li>
              <li>Engage in conduct that disrupts, interferes with, or degrades the Site&rsquo;s operation</li>
              <li>Use the Site to transmit unsolicited commercial communications (spam)</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              2. Intellectual Property
            </h2>
            <p className="mb-4 text-sm">
              All content on the Site, including but not limited to articles, guides,
              printable worksheets, images, graphics, logos, and the overall site
              design, is owned by {siteConfig.name} or used under license. All rights
              are reserved.
            </p>
            <p className="mb-4 text-sm">
              You may not reproduce, modify, distribute, sell, or create derivative
              works from any content on this Site without our express prior written
              permission.
            </p>
            <p className="text-sm">
              Free printable worksheets and templates downloaded from the Site are
              licensed for your personal, non-commercial use only. You may not resell,
              redistribute, or repackage them in any form without written permission.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              3. Disclaimer of Warranties
            </h2>
            <p className="text-sm">
              The Site and its content are provided &ldquo;as is&rdquo; and
              &ldquo;as available&rdquo; without warranties of any kind, either express
              or implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, or non-infringement.
              We do not warrant that the Site will be uninterrupted, error-free, secure,
              or free of viruses or other harmful components. We reserve the right to
              modify, suspend, or discontinue the Site at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              4. Limitation of Liability
            </h2>
            <p className="text-sm">
              To the fullest extent permitted by applicable law, {siteConfig.name} and its
              owner shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including loss of profits, data, or
              goodwill, arising from your access to or use of (or inability to use)
              the Site, reliance on its content, or any errors or omissions in the
              content. This limitation applies regardless of the legal theory on which
              the claim is based, even if we have been advised of the possibility of
              such damages.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              5. Third-Party Links and Services
            </h2>
            <p className="text-sm">
              The Site may contain links to third-party websites, products, or services.
              These links are provided for informational purposes only. We have no
              control over and accept no responsibility for the content, privacy
              practices, or reliability of any third-party site or service. A link
              to an external site does not constitute an endorsement of that site or
              its content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              6. User Submissions
            </h2>
            <p className="text-sm">
              If you submit content to us, such as a contact form message, you grant
              {siteConfig.name} a non-exclusive, royalty-free license to use, store, and
              reproduce that content for the sole purpose of operating the Site and
              responding to your inquiry. You represent that you own or have the right
              to share any content you submit, and that it does not violate the rights
              of any third party.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              7. Privacy
            </h2>
            <p className="text-sm">
              Your use of the Site is also governed by our{" "}
              <Link
                href="/privacy-policy"
                className="text-primary underline underline-offset-3 hover:opacity-80"
              >
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. By using the Site,
              you consent to the data practices described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              8. Governing Law
            </h2>
            <p className="text-sm">
              These Terms of Use are governed by and construed in accordance with the
              laws of the United States, without regard to conflict-of-law principles.
              Any dispute arising from these Terms or your use of the Site shall be
              resolved in a court of competent jurisdiction in the United States.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              9. Changes to These Terms
            </h2>
            <p className="text-sm">
              We reserve the right to update or modify these Terms at any time. When
              we make changes, we will update the &ldquo;Last updated&rdquo; date at
              the top of this page. Your continued use of the Site after any changes
              constitutes your acceptance of the updated Terms. We encourage you to
              review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text mb-5">
              10. Contact
            </h2>
            <p className="text-sm">
              For questions about these Terms of Use, please email us at{" "}
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
