// Long-form intro copy for each audience hub page.
// Keyed by segment.slug from siteConfig.audienceSegments.
// Tone guidance lives in siteConfig — this file just holds the copy.

export interface SegmentIntro {
  metaDescription: string;
  paragraphs: readonly string[];
  quickLinks: readonly {
    label: string;
    href: string;
    description: string;
  }[];
  emailCtaTitle: string;
  emailCtaDescription: string;
}

export const segmentIntros: Record<string, SegmentIntro> = {

  "budgeting-for-moms": {
    metaDescription:
      "Practical budgeting guides for moms managing family finances — groceries, kids' expenses, activities, and everything in between. Real systems for real family life.",
    paragraphs: [
      "Managing money as a mom means you're rarely just managing your own finances. You're tracking grocery runs and school fees, deciding which activities are actually worth the cost, saving for big things while making sure everyday things are covered. It's a lot to hold in your head — and a lot to get right every single month.",
      "A good family budget isn't about cutting everything back to the bone. It's about knowing where your money is going, and making sure it lines up with what actually matters to your family. That looks different in every household, which is why the guides here are built around flexible systems, not rigid formulas.",
      "Whether you're budgeting on one income, managing finances with a partner, or just trying to stop the month from ending before the money does — this is the right section for you. No judgment, no perfect-family-finance advice. Just practical tools built for real family life.",
    ],
    quickLinks: [
      {
        label: "Zero-based budgeting for families",
        href: "/blog",
        description: "How to give every dollar a job when multiple people depend on that dollar.",
      },
      {
        label: "Monthly grocery budget tips",
        href: "/blog",
        description: "Real strategies for feeding a family without blowing the food budget every week.",
      },
      {
        label: "Budgeting for kids' activities",
        href: "/blog",
        description: "How to say yes to the things that matter and no to the things that don't.",
      },
    ],
    emailCtaTitle: "Free family budget template",
    emailCtaDescription:
      "A zero-based budget template built for families — with categories for groceries, kids' expenses, activities, savings, and more. Print it, fill it in, start this month.",
  },

  "single-mom-budget": {
    metaDescription:
      "Budgeting guides for single moms managing family finances on one income. Practical, dignified, no sugarcoating — real strategies for a genuinely hard situation.",
    paragraphs: [
      "Budgeting as a single mom is harder than most personal finance advice acknowledges. You're managing rent, groceries, childcare, school expenses, and emergencies — often on one income, without a safety net, and while doing literally everything else on your own. That's not a personal failure. That's just a genuinely difficult set of circumstances.",
      "The guides in this section don't sugarcoat that reality, and they don't offer solutions that require money you don't have. What they do offer: practical systems for making the most of what's there, strategies for building even a small financial buffer, and honest talk about priorities when you can't do everything at once.",
      "You're doing more than most people will ever fully understand. The resources here are written for exactly where you are — not where you're supposed to be by now, but where you actually are. That's the only starting point that matters.",
    ],
    quickLinks: [
      {
        label: "Single mom budget template",
        href: "/blog",
        description: "A budget built for one income and the full weight of a household.",
      },
      {
        label: "Cutting expenses without cutting corners",
        href: "/blog",
        description: "Finding the places to trim that won't hurt you or your kids.",
      },
      {
        label: "Building an emergency fund slowly",
        href: "/blog",
        description: "Even $5 a week adds up. Here's how to start when there's almost nothing extra.",
      },
    ],
    emailCtaTitle: "Free single mom budget starter kit",
    emailCtaDescription:
      "A budget template designed for one income and two (or more) people — includes a priority worksheet for tight months and a simple savings tracker. Free to download.",
  },

  "college-student-budget": {
    metaDescription:
      "Budgeting guides for college students — make your money last the semester, avoid debt traps, and build habits that actually stick. Practical, not preachy.",
    paragraphs: [
      "Between tuition, rent, food, and the occasional social life, college money math doesn't always add up. You might be on a meal plan that runs out in week three, splitting utilities four ways, or trying to stretch a student loan refund further than physics allows. You're not alone in this — and it's not because you're bad with money.",
      "Here's the thing most people don't mention: the habits you build now genuinely matter. Not in a scary, high-stakes way — more like, the basics you figure out during college pay off for years afterward. Learning to track your spending, avoid high-interest debt, and save even a little bit is worth more than most of your elective credits.",
      "This section is practical, not preachy. You'll find budgeting guides written for student life (not adult life with a salary), tips for stretching every dollar without giving up everything that makes college enjoyable, and real strategies that actually fit a student's schedule and income. Let's figure this out together.",
    ],
    quickLinks: [
      {
        label: "Your first real budget in college",
        href: "/blog",
        description: "A simple system for knowing what you have, what you owe, and what's left.",
      },
      {
        label: "How to make a student loan refund last",
        href: "/blog",
        description: "The check hits your account. Here's how to make it survive the semester.",
      },
      {
        label: "Spending trackers for students",
        href: "/blog",
        description: "Free and low-effort ways to see where the money actually goes.",
      },
    ],
    emailCtaTitle: "Free student budget template",
    emailCtaDescription:
      "A simple, no-fuss budget built for student life — fits on one page, takes about 20 minutes to fill in, and actually makes sense for an irregular student income.",
  },

  "budget-on-low-income": {
    metaDescription:
      "Practical budgeting guides for people on a low or limited income. No hustle culture, no judgment — real strategies for when the numbers barely add up.",
    paragraphs: [
      "Budgeting on a low income is not a mindset problem. When income barely covers expenses — or doesn't cover them at all — no amount of optimism changes the math. What you'll find here isn't 'just cut your coffee' or 'pick up a side hustle.' It's practical guidance for working with what you actually have.",
      "The guides in this section focus on real strategies: making rent, utilities, and food the non-negotiable priorities; finding every dollar of assistance you're eligible for; reducing expenses where it's genuinely possible; and building toward a slightly more stable position — one step at a time, without judgment about where you're starting from.",
      "If you're in a difficult financial position right now, the Resources section below lists programs and services that may be able to help immediately. There's no shame in needing help. There's no shame in asking.",
    ],
    quickLinks: [
      {
        label: "Prioritizing when there isn't enough",
        href: "/blog",
        description: "How to decide what gets paid first when you can't cover everything.",
      },
      {
        label: "Finding assistance programs near you",
        href: "/blog",
        description: "A guide to the programs you may be eligible for — and how to apply.",
      },
      {
        label: "Small financial wins that add up",
        href: "/blog",
        description: "Tiny steps that move the needle when big leaps aren't possible.",
      },
    ],
    emailCtaTitle: "Free budget worksheet",
    emailCtaDescription:
      "A simple, honest worksheet for building a budget when income is limited. No extras, no filler — just a clear look at income, essential expenses, and what's left to work with.",
  },

  "first-job-budget": {
    metaDescription:
      "Budgeting guides for first-job earners — what to do with your first paycheck, how to set up a budget on an entry-level salary, and how to start building real financial stability.",
    paragraphs: [
      "Getting your first real paycheck is a milestone. After years of school, internships, or getting by on whatever you could piece together, you've got a regular income — and that changes things. It also comes with decisions you may never have had to make before: taxes, benefits, retirement accounts, rent, savings. Where do you even start?",
      "Here's the good news: you're starting earlier than most. The financial habits you build right now — even small ones — have an outsized effect on your financial life later. The compounding effect that everyone talks about with investments applies just as much to money habits. You're in a better position than you probably feel.",
      "This section covers the fundamentals for first-job finances: what to do in the first month, how to build a budget that works on an entry-level salary, how to think about benefits and retirement from day one, and how to start building actual financial security — without waiting until you feel 'ready enough' to begin.",
    ],
    quickLinks: [
      {
        label: "What to do with your first paycheck",
        href: "/blog",
        description: "A step-by-step plan for the first 24 hours after your paycheck lands.",
      },
      {
        label: "Budgeting on an entry-level salary",
        href: "/blog",
        description: "How to cover your needs, start saving, and not feel broke all the time.",
      },
      {
        label: "Benefits 101: what to actually enroll in",
        href: "/blog",
        description: "Health insurance, 401(k), FSA — what it all means and what you should pick.",
      },
    ],
    emailCtaTitle: "Free first-paycheck planning guide",
    emailCtaDescription:
      "A step-by-step guide to allocating your first paycheck: taxes, expenses, savings, and everything you need to set up in month one. No finance degree required.",
  },

  "couples-budget": {
    metaDescription:
      "Budgeting guides for couples — shared budgeting systems that actually work, how to talk about money without fighting, and how to get on the same financial page together.",
    paragraphs: [
      "Money is one of the most common things couples argue about — not because they're bad at managing it, but because two people almost always come to a relationship with different money histories, different spending instincts, and different ideas about what's worth spending on. That's normal. It's also completely workable.",
      "The solution isn't to agree on everything. The solution is a shared system — one that both people understand, that accounts for both people's priorities, and that gives both of you visibility into the household finances without requiring constant check-ins or one person managing everything alone.",
      "Whether you're just moving in together, getting married, trying to pay off debt as a team, or just trying to stop having the same money conversation every month — this section has practical guides for making it work. No blame, no 'my money vs. your money' friction. Just tools for two people building something together.",
    ],
    quickLinks: [
      {
        label: "How to talk about money without fighting",
        href: "/blog",
        description: "The conversation framework that keeps money talks productive, not personal.",
      },
      {
        label: "Joint budget systems that actually work",
        href: "/blog",
        description: "Three different approaches — find the one that fits how your household works.",
      },
      {
        label: "Paying off debt as a couple",
        href: "/blog",
        description: "Strategies for tackling shared and individual debt without resentment.",
      },
    ],
    emailCtaTitle: "Free couples budget template",
    emailCtaDescription:
      "A shared budget template for two incomes (or one) — includes a money conversation starter guide and a joint savings goal tracker. Simple enough that both people will actually use it.",
  },

} satisfies Record<string, SegmentIntro>;
