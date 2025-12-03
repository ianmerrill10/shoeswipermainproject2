# ShoeSwiper Agent Registry

> ⚠️ **ALL AGENTS:** Read this file at the start of every task.

## Quick Reference

| Agent | Priority | Specialty | When to Collaborate |
|-------|----------|-----------|---------------------|
| security-guardian | P1 | Security, vulnerabilities, RLS, auth | Any code handling user data, API keys, or auth |
| revenue-optimizer | P2 | Affiliate links, conversion, growth | Amazon links, monetization, A/B tests |
| code-builder | P3 | New features, components, hooks | Building new functionality end-to-end |
| react-specialist | P3 | TypeScript, React patterns, performance | Component architecture, hooks, state |
| supabase-expert | P3 | Database, RLS, Edge Functions | Database schemas, queries, backend |
| ui-designer | P4 | Tailwind, animations, accessibility | Styling, animations, responsive design |
| devops-engineer | P4 | CI/CD, deployment, monitoring | Workflows, deployments, infrastructure |
| seo-specialist | P5 | Meta tags, structured data | SEO, social sharing, discoverability |
| mobile-specialist | P5 | PWA, touch, responsive | Mobile UX, gestures, app-like features |

## Requesting Collaboration

When you need help from another agent, use this format in your response:

```markdown
<!-- COLLABORATE:agent-name -->
**Request:** [What you need help with]
**Context:** [Relevant code/files]
**Priority:** [High/Medium/Low]
<!-- END-COLLABORATE -->
```

### Examples

```markdown
<!-- COLLABORATE:security-guardian -->
**Request:** Review this authentication flow for vulnerabilities
**Context:** src/hooks/useAuth.ts
**Priority:** High
<!-- END-COLLABORATE -->
```

```markdown
<!-- COLLABORATE:revenue-optimizer -->
**Request:** Verify affiliate tag is correctly applied
**Context:** src/components/BuyButton.tsx
**Priority:** High
<!-- END-COLLABORATE -->
```

## Handing Off Work

When a task is better suited for another agent, use this format:

```markdown
<!-- HANDOFF:agent-name -->
**Task:** [What needs to be done]
**Reason:** [Why this agent is better suited]
**Files:** [Relevant files]
**Notes:** [Any context the receiving agent needs]
<!-- END-HANDOFF -->
```

### Example

```markdown
<!-- HANDOFF:ui-designer -->
**Task:** Style the new price comparison component
**Reason:** Needs Framer Motion animations and Tailwind styling
**Files:** src/components/PriceComparison.tsx
**Notes:** Should match existing card style with gradient border
<!-- END-HANDOFF -->
```

## Agent Capabilities

### security-guardian (P1 - BLOCKS ALL)
- ✅ Security vulnerability review
- ✅ RLS policy verification
- ✅ API key exposure prevention
- ✅ Input validation checks
- ✅ Auth/authz review
- ✅ Third-party dependency audit

### revenue-optimizer (P2 - CRITICAL)
- ✅ Affiliate tag verification (`?tag=shoeswiper-20`)
- ✅ Conversion funnel optimization
- ✅ Email capture mechanisms
- ✅ Referral program improvements
- ✅ Premium feature suggestions
- ✅ A/B testing opportunities

### code-builder (P3)
- ✅ New feature implementation
- ✅ Component creation
- ✅ Custom hook development
- ✅ API integrations
- ✅ Edge Function development
- ✅ Database migrations

### react-specialist (P3)
- ✅ Component architecture
- ✅ TypeScript optimization
- ✅ Custom hooks
- ✅ State management (Zustand)
- ✅ React Query patterns
- ✅ Performance optimization

### supabase-expert (P3)
- ✅ Database schema design
- ✅ RLS policy creation
- ✅ Edge Function development
- ✅ Query optimization
- ✅ Real-time subscriptions
- ✅ Migration scripts

### ui-designer (P4)
- ✅ Tailwind CSS styling
- ✅ Framer Motion animations
- ✅ Mobile-first responsive design
- ✅ Dark theme consistency
- ✅ Accessibility (a11y)
- ✅ Design system maintenance

### devops-engineer (P4)
- ✅ GitHub Actions workflows
- ✅ Deployment automation
- ✅ Environment management
- ✅ Build optimization
- ✅ Monitoring setup
- ✅ Infrastructure configuration

### seo-specialist (P5)
- ✅ Meta tag optimization
- ✅ Structured data (JSON-LD)
- ✅ Open Graph tags
- ✅ Sitemap management
- ✅ URL structure
- ✅ Core Web Vitals

### mobile-specialist (P5)
- ✅ PWA features
- ✅ Touch gesture optimization
- ✅ Safe area handling
- ✅ Mobile responsiveness
- ✅ App-like experience
- ✅ Cross-device testing

## Critical Project Rules

Every agent MUST follow these rules:

| Rule | Description |
|------|-------------|
| 🔗 Affiliate Tag | ALL Amazon links MUST include `?tag=shoeswiper-20` |
| 🚫 No `any` Types | Always use proper TypeScript interfaces |
| 🔐 No VITE_ Secrets | Never prefix secrets with `VITE_` |
| 🖥️ Guard Console | Wrap console.log with `import.meta.env.DEV` |
| 👤 Admin Email | `dadsellsgadgets@gmail.com` |

## Priority Hierarchy

```
P1: security-guardian     ← Blocks everything. Security first.
P2: revenue-optimizer     ← Critical for business. Must approve affiliate/money code.
P3: code-builder, react-specialist, supabase-expert  ← Core development
P4: ui-designer, devops-engineer  ← Support & polish
P5: seo-specialist, mobile-specialist  ← Enhancement & optimization
```

## Cross-Agent Review Requirements

| When Making Changes To... | Must Be Reviewed By |
|---------------------------|---------------------|
| Authentication, user data, API keys | security-guardian |
| Amazon links, purchase flows | revenue-optimizer |
| Database schemas, RLS policies | supabase-expert + security-guardian |
| New Edge Functions | supabase-expert + security-guardian |
| UI components with user input | ui-designer + security-guardian |
| CI/CD pipelines | devops-engineer |
| Meta tags, structured data | seo-specialist |
| Mobile-specific features | mobile-specialist |
