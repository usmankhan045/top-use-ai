# Publish All Pending Posts

Write, create printables for, and publish all 10 SpendWiseCents content priority posts.

## How to use

```
/publish-all-posts
/publish-all-posts 02        # publish specific post number
/publish-all-posts 02 03 05  # publish specific posts
```

## Current Status (update as posts are published)

| # | Post | Printable | Status |
|---|---|---|---|
| 01 | free-biweekly-budget-template | biweekly-budget-template.pdf | ✅ Published |
| 02 | free-monthly-budget-template-printable | monthly-budget-template.pdf | pending |
| 03 | 100-envelope-challenge-printable | 100-envelope-challenge-printable.pdf | pending |
| 04 | free-budget-binder-printables | budget-binder-starter-pack.pdf | pending |
| 05 | sinking-funds-explained | sinking-fund-tracker.pdf | pending |
| 06 | cash-envelope-system-beginners | cash-envelope-printable.pdf | pending |
| 07 | how-to-budget-on-low-income | low-income-budget-worksheet.pdf | pending |
| 08 | 52-week-savings-challenge | 52-week-savings-challenge.pdf | pending |
| 09 | grocery-budget-family-of-4 | grocery-budget-planner.pdf | pending |
| 10 | free-debt-payoff-tracker-printable | debt-snowball-tracker.pdf | pending |

## Process for each post

For each pending post number, run `/write-post <number>` which handles:
1. Writing the full blog post content
2. Creating the printable HTML + converting to PDF
3. Publishing both to Supabase

## Internal link targets (for cross-linking)
Once posts are published, link between them using these slugs:
- `/blog/free-biweekly-budget-template` ✅
- `/blog/free-monthly-budget-template-printable`
- `/blog/sinking-funds-explained`
- `/blog/100-envelope-challenge-printable`
- `/blog/free-budget-binder-printables`
- `/blog/how-to-budget-on-low-income`
- `/blog/free-debt-payoff-tracker-printable`

## All printable specs
Full specs for each printable are documented in `SpendWiseCents_Content_Strategy.docx`.
The canonical printable reference implementation is `public/printables/biweekly-budget-template.html`.
