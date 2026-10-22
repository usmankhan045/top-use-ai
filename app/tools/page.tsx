import { Container, Tag } from "@/components/ui";
import { NicheDirectory } from "@/components/tools/NicheDirectory";
import { NICHES } from "@/lib/tool-finder/niches";

export const metadata = {
  title: "AI Tool Finders by Niche",
  description: "Compare free and paid AI tools across 25 niches using feature, workflow, pricing, access, and privacy filters.",
};

export default function ToolsPage() {
  return (
    <main className="tool-lab min-h-screen overflow-hidden">
      <section className="relative border-b border-black/[0.07] bg-[radial-gradient(circle_at_82%_10%,rgba(255,107,87,0.16),transparent_22%),radial-gradient(circle_at_72%_34%,rgba(211,255,74,0.22),transparent_20%)]">
      <Container width="wide" className="py-10 sm:py-14">
        <div className="max-w-4xl"><div className="flex flex-wrap gap-2"><Tag variant="accent">Free-first</Tag><Tag>1,196 published tools</Tag><Tag>25 specialist finders</Tag></div><p className="stamp mt-6 text-primary">Find by job, not by hype</p><h1 className="mt-3 font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.045em] text-text sm:text-6xl">What do you want<br/><span className="accent-mark">AI to help you do?</span></h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">Search a task or browse six clear families. Each niche opens a tailored finder with free and paid options ranked for that workflow.</p></div>
        <NicheDirectory niches={NICHES}/>
      </Container>
      </section>
      <Container width="wide" className="py-10"><div className="grid gap-4 rounded-[1.75rem] bg-text p-6 text-white sm:grid-cols-3 sm:p-8"><Trust number="01" title="Useful before exhaustive">Focused choices first. Advanced controls appear only when you ask.</Trust><Trust number="02" title="Free means free">Permanent free access stays separate from trials and paid plans.</Trust><Trust number="03" title="Receipts included">Source and verification labels stay visible before you leave.</Trust></div></Container>
    </main>
  );
}

function Trust({number,title,children}:{number:string;title:string;children:React.ReactNode}) { return <div className="border-l border-white/15 pl-4"><p className="font-mono text-xs text-accent">{number}</p><h2 className="mt-2 font-display text-lg font-bold">{title}</h2><p className="mt-1 text-sm leading-relaxed text-white/55">{children}</p></div>; }
