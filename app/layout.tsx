import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site.config";
import { getSiteFonts } from "@/lib/fonts";
import { generateThemeCSS } from "@/lib/theme";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { websiteSchema, organizationSchema, personSchema } from "@/lib/schema";
import { getCategoriesWithPostCounts } from "@/lib/queries";

const fonts = getSiteFonts();
const BASE_URL = `https://${siteConfig.domain}`;

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name}: ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Drives the navbar "Categories" dropdown. Only categories with at least one
  // published post, so the nav never links to an empty archive page. Falls back
  // to [] if the DB is unconfigured.
  let categories: { slug: string; name: string }[] = [];
  try {
    categories = (await getCategoriesWithPostCounts()).map(({ slug, name }) => ({
      slug,
      name,
    }));
  } catch {
    // DB not yet configured, render nav without the Categories dropdown
  }

  return (
    <html lang="en" className={`${fonts.variables} h-full`}>
      <head>
        {/* impact.com media-partner site verification. Their snippet uses value=
            rather than the standard content=, which Metadata.other cannot emit
            and React's JSX types reject, hence the spread. */}
        <meta {...{ name: "impact-site-verification", value: "f43d7613-6c3a-454a-91e8-d21e0242fde5" }} />
        {/* Inject theme CSS vars, change siteConfig.theme.colors to restyle the whole site */}
        <style dangerouslySetInnerHTML={{ __html: `:root { ${generateThemeCSS()} }` }} />
        {/* Site-wide entity graph. Emitted on every page so that per-page schema
            (BlogPosting author/publisher/isPartOf) can reference these by @id
            instead of duplicating them. */}
        <JsonLd data={[websiteSchema(), organizationSchema(), personSchema()]} />
      </head>
      <body className="flex flex-col min-h-full antialiased bg-background text-text">
        <Header categories={categories} />
        {children}
        <Footer categories={categories} />
      </body>
    </html>
  );
}
