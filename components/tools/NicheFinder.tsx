"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { recommendCatalogTools, type CatalogAnswers } from "@/lib/tool-finder/catalog-recommend";
import type { NicheConfig } from "@/lib/tool-finder/niches";
import { categorySlug } from "@/lib/tool-finder/niches";
import type { WritingTool } from "@/lib/tool-finder/types";

function SearchIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}

export function NicheFinder({ niche }: { niche: NicheConfig }) {
  const [answers, setAnswers] = useState<CatalogAnswers>({ goal: niche.goals[0].value, workflow: niche.workflows[0].value, budget: "free-only", access: "any", priority: "fit" });
  const [tools, setTools] = useState<WritingTool[]>([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [nicheTotal, setNicheTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/tools?category=${encodeURIComponent(categorySlug(niche.category))}&limit=250`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Catalog request failed")))
      .then((payload: { tools?: WritingTool[]; catalog?: { total?: number; nicheTotal?: number } }) => {
        const nextTools = payload.tools ?? [];
        setTools(nextTools);
        setCatalogTotal(payload.catalog?.total ?? nextTools.length);
        setNicheTotal(payload.catalog?.nicheTotal ?? nextTools.length);
      })
      .catch((error) => { if (error.name !== "AbortError") console.error("[Niche finder]", error); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [niche.category]);

  const recommendations = useMemo(() => {
    const ranked = recommendCatalogTools(niche, answers, tools);
    const needle = query.trim().toLowerCase();
    if (!needle) return ranked;
    return ranked.filter(({ tool }) => [tool.name, tool.summary, tool.subcategory, ...(tool.tags ?? []), ...(tool.useCases ?? [])].filter(Boolean).join(" ").toLowerCase().includes(needle));
  }, [niche, answers, tools, query]);
  const compared = selected.map((slug) => tools.find((tool) => tool.slug === slug)).filter(Boolean) as WritingTool[];
  const chosenGoal = niche.goals.find((goal) => goal.value === answers.goal);

  function set<K extends keyof CatalogAnswers>(key: K, value: CatalogAnswers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setVisibleCount(12);
  }
  function toggle(slug: string) {
    setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length < 3 ? [...current, slug] : current);
  }

  return (
    <main className="tool-lab min-h-screen pb-24">
      <section className="tool-hero relative overflow-hidden border-b border-white/10 bg-[#17151f] text-white">
        <div className="tool-orb tool-orb-one"/><div className="tool-orb tool-orb-two"/>
        <div className="relative mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/tools" className="group inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"><span className="transition group-hover:-translate-x-1">←</span> Explore all niches</Link>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/70"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60"/><span className="relative inline-flex h-2 w-2 rounded-full bg-accent"/></span>Live matching</div>
          </div>
          <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-4xl"><p className="stamp text-accent">{niche.label} · free-first finder</p><h1 className="mt-4 font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-7xl">Less browsing.<br/><span className="text-accent">Better tools.</span></h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/65">{niche.description} Pick what you need and watch the shortlist update instantly - no signup, no five-page quiz.</p></div>
            <div className="grid grid-cols-3 gap-2 lg:w-[390px]"><HeroStat value={loading ? "…" : nicheTotal.toLocaleString()} label="In this niche"/><HeroStat value={loading ? "…" : catalogTotal.toLocaleString()} label="Total catalog"/><HeroStat value="5" label="Tailored questions"/></div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] items-start gap-8 px-4 py-6 sm:px-8 lg:px-12 lg:py-10 xl:grid xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="tool-console overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm xl:sticky xl:top-20 xl:z-20">
          <div className="border-b border-black/[0.07] px-4 py-4">
            <p className="stamp text-primary">Quick match</p><h2 className="mt-1 font-display text-lg font-extrabold text-text">Refine results</h2>
            <p className="mt-1 text-xs text-muted">Choose the options that fit your needs.</p>
          </div>

          <div className="divide-y divide-black/[0.07]">
            <FilterStep number="01" question={niche.goalQuestion}>
              {niche.goals.map((goal) => <ChoicePill key={goal.value} active={answers.goal === goal.value} onClick={() => set("goal", goal.value)}>{goal.label}</ChoicePill>)}
            </FilterStep>
            <FilterStep number="02" question={niche.workflowQuestion}>
              {niche.workflows.map((flow) => <ChoicePill key={flow.value} active={answers.workflow === flow.value} onClick={() => set("workflow", flow.value)}>{flow.label}</ChoicePill>)}
            </FilterStep>
            <FilterStep number="03" question={niche.filters.budget.question}>
              {niche.filters.budget.options.map(({ value, label }) => <ChoicePill key={value} active={answers.budget === value} onClick={() => set("budget", value)}>{label}</ChoicePill>)}
            </FilterStep>
            <FilterStep number="04" question={niche.filters.access.question}>
              {niche.filters.access.options.map(({ value, label }) => <ChoicePill key={value} active={answers.access === value} onClick={() => set("access", value)}>{label}</ChoicePill>)}
            </FilterStep>
            <FilterStep number="05" question={niche.filters.priority.question}>
              {niche.filters.priority.options.map(({ value, label }) => <ChoicePill key={value} active={answers.priority === value} onClick={() => set("priority", value)}>{label}</ChoicePill>)}
            </FilterStep>
          </div>
        </section>

        <div className="min-w-0">
        <section className="mt-8 xl:mt-0" aria-live="polite">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="stamp text-primary">Live shortlist</p><h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{loading ? "Reading the catalog…" : `${recommendations.length} ${recommendations.length === 1 ? "match" : "matches"} for ${chosenGoal?.label.toLowerCase()}`}</h2><p className="mt-1 text-xs text-muted">Ranked from your five active filters</p></div>
            <label className="flex h-11 w-full items-center gap-3 rounded-xl border border-black/10 bg-white px-4 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 sm:w-72"><SearchIcon/><span className="sr-only">Search results</span><input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(12); }} className="w-full bg-transparent text-sm outline-none placeholder:text-muted/70" placeholder="Search shortlist…"/></label>
          </div>

          {loading ? <LoadingGrid/> : recommendations.length === 0 ? <EmptyState onReset={() => { setAnswers((current) => ({ ...current, budget: "any", access: "any" })); setQuery(""); }}/>: (
            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              {recommendations.slice(0, visibleCount).map((recommendation, index) => <ToolCard key={recommendation.tool.slug} {...recommendation} rank={index} selected={selected.includes(recommendation.tool.slug)} onToggle={() => toggle(recommendation.tool.slug)}/>) }
            </div>
          )}
          {!loading && visibleCount < recommendations.length && <div className="mt-7 text-center"><Button variant="outline" onClick={() => setVisibleCount((count) => count + 12)}>Show 12 more <span className="text-xs opacity-60">({recommendations.length-visibleCount} left)</span></Button></div>}
        </section>

        {compared.length > 0 && <Comparison tools={compared} onClear={() => setSelected([])}/>} 
        </div>
      </div>

      {selected.length > 0 && <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#17151f]/95 p-3 text-white shadow-2xl backdrop-blur sm:bottom-5 sm:p-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent font-bold text-text">{selected.length}</span><div className="min-w-0"><p className="truncate text-sm font-bold">{compared.map((tool) => tool.name).join(" vs ")}</p><p className="text-xs text-white/50">Select up to three</p></div></div><a href="#comparison" className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-bold text-text transition hover:bg-accent">Compare ↓</a></div>}
    </main>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-center backdrop-blur"><p className="font-display text-2xl font-extrabold text-accent">{value}</p><p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/45">{label}</p></div>; }
function FilterStep({ number, question, children }: { number:string; question:string; children:React.ReactNode }) { return <fieldset className="min-w-0 px-4 py-3"><legend className="sr-only">{question}</legend><div className="flex items-start gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background font-mono text-[9px] font-black text-muted">{number}</span><h3 className="pt-0.5 text-[11px] font-bold leading-snug text-text">{question}</h3></div><div className="mt-2 flex flex-wrap gap-1.5 pl-9">{children}</div></fieldset>; }
function ChoicePill({ active, onClick, children }: { active:boolean; onClick:()=>void; children:React.ReactNode }) { return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold leading-tight transition ${active ? "border-text bg-text text-white" : "border-black/10 bg-background text-muted hover:border-primary hover:text-primary"}`}>{children}</button>; }

function ToolCard({ tool, reasons, labels, rank, selected, onToggle }: { tool:WritingTool; reasons:string[]; labels:string[]; rank:number; selected:boolean; onToggle:()=>void }) {
  return <article className="tool-card group flex min-h-56 flex-col rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md">
    <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background font-mono text-xs font-black text-primary">{String(rank+1).padStart(2,"0")}</span><div className="min-w-0"><p className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-muted">{tool.subcategory}</p><h3 className="mt-1 line-clamp-1 font-display text-xl font-extrabold tracking-tight text-text">{tool.name}</h3></div></div><button onClick={onToggle} aria-label={`${selected ? "Remove" : "Add"} ${tool.name} ${selected ? "from" : "to"} comparison`} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base font-bold transition ${selected ? "border-text bg-text text-white" : "border-black/10 text-muted hover:border-primary hover:text-primary"}`}>{selected ? "✓" : "+"}</button></div>
    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{tool.summary}</p>
    <div className="mt-3 flex flex-wrap gap-1.5">{labels.map((label,index) => <span key={label} className={`rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ${index===0 && ["free","freemium","open source"].includes(label) ? "bg-emerald-100 text-emerald-800" : "bg-background text-muted"}`}>{label}</span>)}</div>
    {reasons[0] && <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-text/65"><span className="mt-0.5 text-primary">•</span><span className="line-clamp-1">{reasons[0]}</span></p>}
    <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/[0.06] pt-3"><span className="truncate text-[10px] text-muted">{tool.accessMethods?.slice(0,2).join(" · ") || "Access details on site"}</span>{tool.websiteUrl && <a href={tool.websiteUrl} target="_blank" rel="noreferrer" className="shrink-0 text-[11px] font-black text-primary hover:underline">Open ↗</a>}</div>
  </article>;
}

function EmptyState({ onReset }: { onReset:()=>void }) { return <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-dashed border-primary/30 bg-white p-8 text-center sm:p-14"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-3xl">↻</div><h3 className="mt-5 font-display text-2xl font-extrabold">Too specific - but easy to fix.</h3><p className="mx-auto mt-2 max-w-md text-sm text-muted">Clear the platform requirement and include all pricing to reopen the catalog.</p><Button className="mt-5" onClick={onReset}>Show more options</Button></div>; }
function LoadingGrid() { return <div className="mt-7 grid gap-5 lg:grid-cols-2" aria-label="Loading tools">{Array.from({length:6},(_,index)=><div key={index} className="tool-skeleton h-64 rounded-[1.4rem] border border-black/[0.06] bg-white"/>)}</div>; }

function Comparison({ tools, onClear }: { tools:WritingTool[]; onClear:()=>void }) { return <section id="comparison" className="mt-14 scroll-mt-24 rounded-[2rem] bg-[#17151f] p-5 text-white sm:p-8"><div className="flex items-end justify-between gap-4"><div><p className="stamp text-accent">Decision mode</p><h2 className="mt-2 font-display text-3xl font-extrabold">Side by side, minus the noise.</h2></div><button onClick={onClear} className="text-sm font-bold text-white/50 hover:text-white">Clear</button></div><div className="mt-6 grid gap-3 md:grid-cols-3">{tools.map((tool)=><div key={tool.slug} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"><h3 className="font-display text-xl font-extrabold">{tool.name}</h3><p className="mt-1 text-xs font-semibold text-accent">{tool.subcategory}</p><div className="mt-5 space-y-4"><Compare label="Pricing" value={tool.pricingModel?.replaceAll("-"," ") ?? (tool.freePlan==="yes"?"freemium":"unknown")}/><Compare label="Free access" value={tool.freePlan==="yes"?"Reported":"No"}/><Compare label="Access" value={tool.accessMethods?.join(", ")||"Not recorded"}/><Compare label="Best for" value={tool.bestFor}/></div></div>)}</div></section>; }
function Compare({ label, value }: {label:string; value:string}) { return <div><p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p><p className="mt-0.5 text-sm font-semibold capitalize text-white/85">{value}</p></div>; }
