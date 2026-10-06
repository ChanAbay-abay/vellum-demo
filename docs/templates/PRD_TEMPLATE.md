# [Client Name] — Demo PRD

> Copy this file into each new demo repo. Fill in every section before starting.
> Claude reads this as the project context file for the session.

---

## Client

| Field    | Value                  |
| -------- | ---------------------- |
| Name     | [Client Name]          |
| Slug     | [client-slug]          |
| Industry | [e.g. Healthcare SaaS] |
| Website  | [url or n/a]           |

---

## Brand

| Field                                     | Value                                         |
| ----------------------------------------- | --------------------------------------------- |
| Primary (hex as given; designer converts) | [color name or hex]                           |
| Tone                                      | [formal / professional / friendly]            |
| Display font                              | [fontsource family name, or 'designer picks'] |
| Body font                                 | [fontsource family name, or 'designer picks'] |
| Notes                                     | [any brand constraints]                       |

---

## Context

**What they do:**
[1–2 sentences. Who their customers are, what problem they solve.]

**Why this demo:**
[What decision this demo is supporting — e.g. sales pitch, investor meeting, onboarding.]

**Audience:**
[Who will see this demo — e.g. VP of Sales at mid-market SaaS companies.]

---

## Story

**The one thing this demo must communicate:**
[Single outcome sentence — e.g. "Their platform cuts manual reporting work by 80% for hospital data teams."]

**Section flow:**
[List the sections in order, or write "default" = the template's home page: Hero → Studio → Collection → Gallery → Journal → Footer (see `.agents/ui.md` Page structure).]

---

## Content

> This feeds `apps/web/src/pages/home/config/home.content.ts`. Mark placeholder values with `*`; they must be replaced before delivery.

### Per-section content

One block per section in the flow above.

### [Section name]

**Heading:** [text]
**Body:** [text]
**CTA label:** [label or n/a]
**Image:** [filename or description]

---

## Assets

Source images in `apps/web/src/shared/assets/images/` (flat, named for the final job, at least 2400px wide for full-bleed). OG image, favicons and logos go in `apps/web/public/`.

| Filename | Used in | Status                      |
| -------- | ------- | --------------------------- |
| [file]   | Hero    | [ ] ready / [ ] placeholder |
| [file]   | [where] | [ ] ready / [ ] placeholder |

---

## Delivery

| Field  | Value                                                                           |
| ------ | ------------------------------------------------------------------------------- |
| Format | [e.g. Vercel preview URL (Root Directory `apps/web`) or Cloudflare Workers URL] |
| Notes  | [anything else]                                                                 |
