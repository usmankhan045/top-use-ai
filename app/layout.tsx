import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site.config";
import { getSiteFonts } from "@/lib/fonts";
import { generateThemeCSS } from "@/lib/theme";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { websiteSchema, organizationSchema } from "@/lib/schema";
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
  // Drives the navbar "Categories" dropdown. Falls back to [] if DB is unconfigured.
  let categories: { slug: string; name: string }[] = [];
  try {
    categories = (await getCategoriesWithPostCounts()).map(({ slug, name }) => ({
      slug,
      name,
    }));
  } catch {
    // DB not yet configured — render nav without the Categories dropdown
  }

  return (
    <html lang="en" className={`${fonts.variables} h-full`}>
      <head>
        {/* Inject theme CSS vars — change siteConfig.theme.colors to restyle the whole site */}
        <style dangerouslySetInnerHTML={{ __html: `:root { ${generateThemeCSS()} }` }} />
        <JsonLd data={[websiteSchema(), organizationSchema()]} />
      </head>
      <body className="flex flex-col min-h-full antialiased bg-background text-text">
        <Header categories={categories} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
