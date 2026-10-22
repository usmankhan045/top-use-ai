"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { NicheConfig } from "@/lib/tool-finder/niches";

const FAMILIES = [
  { id: "create", label: "Create", description: "Words, visuals, audio, and media", slugs: ["content-creation", "design", "image-generation", "video", "audio-and-music", "social-media", "translation-and-language"] },
  { id: "build", label: "Build", description: "Code, automate, analyze, and secure", slugs: ["coding", "agentic-and-automation", "data-and-analytics", "security"] },
  { id: "work", label: "Work", description: "Organize work and serve customers", slugs: ["ai-assistants", "productivity", "project-management", "customer-support"] },
  { id: "grow", label: "Grow", description: "Find customers and run a business", slugs: ["marketing", "sales-and-crm", "e-commerce", "hr-and-recruitment", "real-estate"] },
  { id: "learn", label: "Learn & decide", description: "Research, learn, and make decisions", slugs: ["research", "education", "finance"] },
  { id: "specialist", label: "Specialist", description: "Regulated and professional workflows", slugs: ["healthcare", "legal"] },
] as const;

const BADGES: Record<string, string> = {
  "ai-assistants":"AI", "agentic-and-automation":"AU", "audio-and-music":"AM", coding:"{ }",
  "content-creation":"WR", "customer-support":"CS", "data-and-analytics":"DA", design:"DS",
  "e-commerce":"EC", education:"ED", finance:"FN", "hr-and-recruitment":"HR", healthcare:"HC",
  "image-generation":"IM", legal:"LG", marketing:"MK", productivity:"PR", "project-management":"PM",
  "real-estate":"RE", research:"RS", "sales-and-crm":"SL", security:"SC", "social-media":"SM",
  "translation-and-language":"TR", video:"VD",
};

function SearchIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}

export function NicheDirectory({ niches }: { niches: NicheConfig[] }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const needle = query.trim().toLowerCase();

  const matching = useMemo(() => niches.filter((niche) => {
    const inFamily = family === "all" || FAMILIES.find((item) => item.id === family)?.slugs.includes(niche.slug as never);
    const searchable = [niche.label, niche.shortLabel, niche.description, ...niche.goals.map((goal) => goal.label)].join(" ").toLowerCase();
    return inFamily && (!needle || searchable.includes(needle));
  }), [family, needle, niches]);

  const sections = family === "all" && !needle
    ? FAMILIES.map((item) => ({ ...item, niches: niches.filter((niche) => item.slugs.includes(niche.slug as never)) }))
    : [{ id: "results", label: needle ? `Results for “${query.trim()}”` : FAMILIES.find((item) => item.id === family)?.label ?? "All niches", description: `${matching.length} ${matching.length === 1 ? "niche" : "niches"}`, niches: matching }];

  function chooseFamily(id: string) {
    setFamily(id);
    setQuery("");
  }

  return <div className="mt-9">
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-3 shadow-[0_12px_35px_rgba(34,32,46,0.07)] sm:p-4">
      <label className="flex h-14 items-center gap-3 rounded-xl bg-background px-4 ring-1 ring-black/[0.07] transition focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/40">
        <span className="text-primary"><SearchIcon/></span>
        <span className="sr-only">Search AI tool niches or use cases</span>
        <input aria-label="Search AI tool niches or use cases" autoComplete="off" value={query} onChange={(event) => { setQuery(event.target.value); setFamily("all"); }} placeholder="Try “make videos”, “review contracts”, or “write code”…" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-text outline-none placeholder:font-normal placeholder:text-muted sm:text-base"/>
        <span className="hidden rounded-full bg-white px-2.5 py-1 font-mono text-[10px] text-muted ring-1 ring-black/[0.06] sm:block">{matching.length} found</span>
        {query && <button onClick={() => setQuery("")} className="rounded-lg px-2 py-1 text-xs font-bold text-muted hover:bg-white hover:text-text">Clear</button>}
      </label>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 tool-scrollbar" role="group" aria-label="Filter niches by family">
        <FamilyButton active={family === "all"} onClick={() => chooseFamily("all")} label="All" count={niches.length}/>
        {FAMILIES.map((item) => <FamilyButton key={item.id} active={family === item.id} onClick={() => chooseFamily(item.id)} label={item.label} count={item.slugs.length}/>) }
      </div>
    </div>

    {matching.length ? <div className="mt-8 space-y-10">
      {sections.map((section) => <section key={section.id} aria-labelledby={`family-${section.id}`}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-black/[0.08] pb-3">
          <div><h2 id={`family-${section.id}`} className="font-display text-2xl font-extrabold text-text">{section.label}</h2><p className="mt-0.5 text-sm text-muted">{section.description}</p></div>
          {section.id !== "results" && <button onClick={() => chooseFamily(section.id)} className="text-xs font-bold text-primary hover:underline">View {section.niches.length} niches →</button>}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {section.niches.map((niche) => <NicheRow key={niche.slug} niche={niche}/>) }
        </div>
      </section>)}
    </div> : <div className="mt-8 rounded-[1.5rem] border border-dashed border-primary/30 bg-white px-6 py-12 text-center"><p className="font-display text-2xl font-extrabold text-text">No matching niche yet</p><p className="mt-2 text-sm text-muted">Try the task itself: writing, invoices, presentations, recruiting, or research.</p><button onClick={() => { setQuery(""); setFamily("all"); }} className="mt-4 rounded-full bg-text px-5 py-2 text-sm font-bold text-white">Show all niches</button></div>}
  </div>;
}

function FamilyButton({ active, onClick, label, count }: { active:boolean; onClick:()=>void; label:string; count:number }) {
  return <button onClick={onClick} aria-pressed={active} className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition ${active ? "border-text bg-text text-white" : "border-black/10 bg-white text-muted hover:border-primary hover:text-primary"}`}><span>{label}</span><span className={`font-mono text-[9px] ${active ? "text-accent" : "opacity-55"}`}>{count}</span></button>;
}

function NicheRow({ niche }: { niche:NicheConfig }) {
  return <Link href={`/tools/${niche.slug}`} className="tool-niche-card group grid min-h-44 grid-cols-[auto_1fr_auto] gap-x-3 rounded-[1.25rem] border border-black/10 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-text hover:shadow-[4px_4px_0_var(--color-accent)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-text font-mono text-[11px] font-black text-accent transition group-hover:bg-primary group-hover:text-white">{BADGES[niche.slug] ?? "AI"}</span>
    <div className="min-w-0"><h3 className="font-display text-lg font-extrabold leading-tight text-text">{niche.label}</h3><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{niche.description}</p></div>
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-text transition group-hover:translate-x-0.5 group-hover:border-text">→</span>
    <div className="col-span-3 mt-4 flex flex-wrap items-center gap-1.5 border-t border-black/[0.06] pt-3">
      {niche.goals.slice(0, 2).map((goal) => <span key={goal.value} className="rounded-full bg-background px-2.5 py-1 text-[10px] font-bold text-muted">{goal.label}</span>)}
      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-primary">+{Math.max(0, niche.goals.length - 2)} more</span>
    </div>
  </Link>;
}
