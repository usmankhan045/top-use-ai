-- Sample posts for rendering pipeline verification.
-- Requires 001_initial.sql to have run first (sites + categories seeded).
-- Uses named dollar-quoting to avoid escaping markdown content.

DO $$
DECLARE
  v_site_id    uuid;
  v_cat_basics uuid;
  v_cat_single uuid;
  v_cat_first  uuid;
BEGIN
  SELECT id INTO v_site_id FROM sites WHERE slug = 'spendwisecents';

  IF v_site_id IS NULL THEN
    RAISE EXCEPTION 'Site spendwisecents not found — run 001_initial.sql first';
  END IF;

  SELECT id INTO v_cat_basics FROM categories
    WHERE site_id = v_site_id AND slug = 'budgeting-basics';
  SELECT id INTO v_cat_single FROM categories
    WHERE site_id = v_site_id AND slug = 'single-mom-money';
  SELECT id INTO v_cat_first  FROM categories
    WHERE site_id = v_site_id AND slug = 'first-job-finance';

  -- ── Post 1: Zero-based budgeting ──────────────────────────────────────────
  -- Tests: quick_answer box, table (remark-gfm), {{printable:}} shortcode,
  --        blockquote, nested lists, FAQ section.

  INSERT INTO posts (
    site_id, slug, title, excerpt, content, quick_answer,
    category_id, audience_tags, status, faq_items, published_at
  ) VALUES (
    v_site_id,
    'how-to-create-a-zero-based-budget',
    'How to Create a Zero-Based Budget (Step by Step)',
    'Zero-based budgeting gives every dollar a job before the month starts. Here''s how to build one from scratch — even if previous attempts haven''t stuck.',
    $BODY1$
## What Is Zero-Based Budgeting?

A zero-based budget means your **income minus all planned spending equals zero** — not because you spend everything, but because every dollar has an assignment before the month begins.

The formula: **Income − (Expenses + Savings + Debt Payments) = $0**

This is different from tracking your spending after the fact. You're directing the money before it arrives.

## Step 1: Write Down Your Take-Home Income

Start with net pay — after taxes, not gross. If income varies, use your lowest typical month.

| Income Source | Monthly Amount |
|---|---|
| Primary paycheck (take-home) | $2,800 |
| Side income (average) | $200 |
| **Total** | **$3,000** |

## Step 2: List Every Spending Category

Most budgets fail because people forget categories. Work through this list before assigning any numbers:

**Fixed necessities (same every month):**
- Rent or mortgage payment
- Car payment or transit pass
- Insurance (health, car, renters)
- Phone bill and internet

**Variable necessities:**
- Groceries
- Gas or transportation
- Utilities (electric, gas, water)
- Medical co-pays and prescriptions

**Debt payments:**
- Credit card minimums (plus any extra you can add)
- Student loan payments

**Savings:**
- Emergency fund
- Sinking funds (car repairs, back-to-school, holiday gifts)

{{printable:zero-based-budget}}

## Step 3: Assign Every Dollar

Add up planned expenses. If the total is below income, assign the difference to savings or extra debt payoff. If it's above income, start cutting from the bottom of the list — not from the top.

> The goal isn't a perfect budget. It's a budget you actually use every month.

## What to Do When a Category Goes Over

A budget adjustment: pull the overage from a lower-priority category. This keeps you honest without blowing up the whole month. Most people need 2–3 months before this feels natural.
$BODY1$,
    'Zero-based budgeting means assigning every dollar of income to a specific purpose — expenses, savings, or debt payments — before the month begins. Income minus all assignments equals zero. You''re not spending every dollar; you''re planning every dollar.',
    v_cat_basics,
    ARRAY['families', 'first-job', 'low-income'],
    'published',
    '[
      {
        "question": "What if my income changes every month?",
        "answer": "Use your lowest expected monthly income as your base budget. When you earn more than expected, assign the extra to savings or debt payoff when it arrives — don''t wait until next month''s budget to decide."
      },
      {
        "question": "How do I handle irregular expenses like car registration or holiday gifts?",
        "answer": "Divide the annual cost by 12 and budget that amount each month into a dedicated sinking fund. When the bill arrives, the money is already there waiting."
      },
      {
        "question": "What''s the difference between zero-based budgeting and the 50/30/20 rule?",
        "answer": "The 50/30/20 rule groups spending into three broad buckets. Zero-based budgeting is more specific — every individual category gets its own dollar amount. It takes more effort upfront but gives you significantly more visibility and control."
      }
    ]'::jsonb,
    '2026-06-01 10:00:00+00'
  ) ON CONFLICT (site_id, slug) DO NOTHING;

  -- ── Post 2: Single mom emergency fund ─────────────────────────────────────
  -- Tests: headings, lists, bold, no quick_answer, empty faq_items.

  INSERT INTO posts (
    site_id, slug, title, excerpt, content, quick_answer,
    category_id, audience_tags, status, faq_items, published_at
  ) VALUES (
    v_site_id,
    'single-mom-emergency-fund',
    'Building an Emergency Fund as a Single Mom: Start Small, Start Now',
    'An emergency fund isn''t a luxury — it''s what stops one bad month from becoming six bad months. Here''s how to start building one even when there''s almost nothing left over.',
    $BODY2$
## Why an Emergency Fund Matters More When You''re Parenting Solo

When you're the only income, there's no backup when something breaks. A car repair isn't a stressful week — it's a potential crisis that threatens your ability to get to work and get the kids to school.

An emergency fund turns a crisis back into a problem. That's the entire value of it.

## How Much Do You Actually Need?

The standard advice is 3–6 months of expenses. That's the goal — not the starting point.

**Start with $500.**

Why $500? Because that covers most common emergencies: a car repair, a medical copay, a broken appliance. Getting to $500 first creates a real buffer without taking years to build.

After $500: aim for $1,000. Then one month of essential expenses. Work up from there at whatever pace you can manage.

## Where to Keep It

Your emergency fund should be:

- **Accessible** — not locked in a CD or retirement account
- **Separate** — not in your regular checking account where it gets spent by accident
- **Boring** — a high-yield savings account at a different bank than your checking works well

The slight inconvenience of needing to transfer money before spending it is a feature. It prevents impulse use.

## How to Build It When There''s Almost Nothing Left Over

- **Tax refund** — if you receive one, put at least half in the fund before anything else
- **Child support** — if the amount varies, put anything above your expected minimum directly into savings
- **Side income** — any extra earnings go to the fund until you hit your first milestone
- **Subscription audit** — cancel unused subscriptions for 3 months and redirect the money

Even $10 a week is $520 a year. Slow works.

## What Actually Counts as an Emergency

Decide this in advance, when you're calm — not in the moment when everything feels urgent.

**Real emergencies:**
- Car repair needed to keep your job
- Medical bill or unexpected copay
- Income gap from job loss
- Essential appliance failure (heat, refrigerator)

**Not emergencies (build separate sinking funds for these):**
- Back-to-school supplies
- Holiday gifts
- Something that feels important but has a workaround
$BODY2$,
    NULL,
    v_cat_single,
    ARRAY['single-mom', 'low-income'],
    'published',
    '[]'::jsonb,
    '2026-06-05 10:00:00+00'
  ) ON CONFLICT (site_id, slug) DO NOTHING;

  -- ── Post 3: First paycheck action plan ────────────────────────────────────
  -- Tests: quick_answer box, {{printable:}} shortcode, ordered lists.

  INSERT INTO posts (
    site_id, slug, title, excerpt, content, quick_answer,
    category_id, audience_tags, status, faq_items, published_at
  ) VALUES (
    v_site_id,
    'first-paycheck-action-plan',
    'Your First Paycheck: A 30-Day Action Plan',
    'The decisions you make with your first paycheck set the tone for everything that follows. Here''s a simple, practical plan for the first 30 days.',
    $BODY3$
## Day 1–3: Understand What You Actually Took Home

Before making any plans, understand the numbers on your pay stub:

- **Gross pay** — what your salary works out to before anything is withheld
- **Net pay** — what actually landed in your account (this is your real budget number)
- **Deductions** — taxes, health insurance, retirement contributions

The gap between gross and net surprises almost everyone. Your budget is built on net pay, not gross.

## Week 1: Cover the Basics First

Your first month, in priority order:

1. Rent or housing — pay in full, on time
2. Utilities — electric, gas, internet
3. Groceries — real food, cooked at home
4. Transportation — gas or transit to get you to work
5. Minimum debt payments — anything with a due date

Everything else waits until these are covered.

## Week 2: Build a Simple Budget

Now that you've seen one paycheck, you have real numbers. Write down:

- Take-home pay (monthly)
- Fixed monthly expenses (rent, phone, subscriptions)
- Variable necessities (groceries, gas)
- Minimum debt payments
- What's left

That "what's left" number is your margin for savings and discretionary spending.

{{printable:zero-based-budget}}

## Week 3: Open a Savings Account

Open a separate savings account — different from your checking. Transfer something to it this week.

Starting amount: **whatever you can afford without stress.** Even $25 counts. The habit matters more than the amount right now.

## Week 4: Automate One Small Transfer

Before your second paycheck arrives, set up one automatic savings transfer — even $25 or $50 per paycheck.

Automation removes the decision. You stop "saving what's left" and start spending what's left after saving. This is the most effective financial habit you can build right now.

## If You''re Already Overwhelmed

Pick one thing from this list and do just that. The goal for month one isn't perfection — it's to avoid the three most common mistakes: spending before bills are covered, saving nothing, and ignoring minimum debt payments. Avoid those three and you're ahead of where most people start.
$BODY3$,
    'In your first 30 days with a paycheck: cover essential bills first (rent, utilities, groceries, minimum debt payments), build a simple budget once you''ve seen your real net pay, open a separate savings account, and set up one automatic transfer — even $25. Don''t try to do everything at once.',
    v_cat_first,
    ARRAY['first-job', 'college-student'],
    'published',
    '[]'::jsonb,
    '2026-06-10 10:00:00+00'
  ) ON CONFLICT (site_id, slug) DO NOTHING;

END $$;
