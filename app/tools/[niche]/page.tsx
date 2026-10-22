import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NicheFinder } from "@/components/tools/NicheFinder";
import { NICHE_BY_SLUG, NICHES } from "@/lib/tool-finder/niches";

export function generateStaticParams() {
  return NICHES.map((niche) => ({ niche: niche.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ niche: string }> }): Promise<Metadata> {
  const { niche: slug } = await params;
  const niche = NICHE_BY_SLUG.get(slug);
  if (!niche) return {};
  return { title: `${niche.label} Finder`, description: `Compare free and paid ${niche.shortLabel.toLowerCase()} tools by features, workflow, price, access, and privacy.` };
}

export default async function NichePage({ params }: { params: Promise<{ niche: string }> }) {
  const { niche: slug } = await params;
  const niche = NICHE_BY_SLUG.get(slug);
  if (!niche) notFound();
  return <NicheFinder niche={niche} />;
}
