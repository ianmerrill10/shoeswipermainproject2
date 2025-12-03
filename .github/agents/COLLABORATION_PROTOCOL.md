# ShoeSwiper Agent Collaboration Protocol

> ⚠️ **ALL AGENTS:** Read this file at the start of every task.

## Pre-Task Checklist

Before starting ANY task, every agent MUST:

1. ✅ Read `AGENT_REGISTRY.md` for the complete agent list
2. ✅ Identify which agents might need to collaborate on this task
3. ✅ Check the Collaboration Triggers table below
4. ✅ Plan collaboration requests before making changes
5. ✅ Note any security or revenue implications

## Communication Format

### Requesting Help

```markdown
<!-- COLLABORATE:agent-name -->
**Request:** [Specific ask - be clear and actionable]
**Context:** [File paths, code snippets, or relevant info]
**Priority:** [High/Medium/Low]
**Blocking:** [Yes/No - Does this block your work?]
<!-- END-COLLABORATE -->
```

### Handing Off Work

```markdown
<!-- HANDOFF:agent-name -->
**Task:** [Complete task description]
**Reason:** [Why this agent is better suited]
**Files:** [All relevant file paths]
**Dependencies:** [What must be done first]
**Notes:** [Additional context]
<!-- END-HANDOFF -->
```

### Responding to Requests

```markdown
<!-- RESPONSE:requesting-agent -->
**Status:** [Approved/Rejected/Changes Requested]
**Review:** [Your findings]
**Recommendations:** [Suggested changes if any]
**Blocking Issues:** [Critical problems that must be fixed]
<!-- END-RESPONSE -->
```

## Collaboration Triggers

| When Doing This... | MUST Collaborate With |
|--------------------|----------------------|
| Handling user passwords or tokens | `security-guardian` |
| Creating API endpoints | `security-guardian` |
| Writing RLS policies | `security-guardian`, `supabase-expert` |
| Adding environment variables | `security-guardian`, `devops-engineer` |
| Creating Amazon/affiliate links | `revenue-optimizer` |
| Implementing purchase flows | `revenue-optimizer`, `security-guardian` |
| Email capture or subscription | `revenue-optimizer` |
| A/B testing setup | `revenue-optimizer` |
| New database tables | `supabase-expert` |
| Edge Function creation | `supabase-expert`, `security-guardian` |
| Complex state management | `react-specialist` |
| Performance optimization | `react-specialist` |
| New UI components | `ui-designer` |
| Animation implementation | `ui-designer` |
| Form design | `ui-designer`, `security-guardian` |
| CI/CD changes | `devops-engineer` |
| Deployment configuration | `devops-engineer` |
| New pages or routes | `seo-specialist` |
| Social sharing features | `seo-specialist` |
| Touch gestures | `mobile-specialist` |
| PWA features | `mobile-specialist` |
| Responsive layouts | `mobile-specialist`, `ui-designer` |

## Priority Rules

### P1: security-guardian BLOCKS EVERYTHING

```
ANY security concern raised by security-guardian MUST be addressed
before code can be merged. No exceptions.

- Exposed API keys → BLOCK
- Missing input validation → BLOCK
- Weak RLS policies → BLOCK
- Hardcoded secrets → BLOCK
```

### P2: revenue-optimizer is CRITICAL

```
All code affecting revenue MUST be approved by revenue-optimizer:

- Missing affiliate tag → BLOCK (unless approved exception)
- Broken purchase flow → BLOCK
- Email capture bypass → Flag for review
```

### P3-P5: Collaborative

```
Lower priority agents collaborate but don't block:

- Suggest improvements
- Request changes (non-blocking)
- Offer to take over specific tasks
```

## Cross-Agent Review Chains

### New Feature Development

```
1. code-builder → Creates initial implementation
2. react-specialist → Reviews component patterns
3. supabase-expert → Reviews database/backend code
4. security-guardian → Security audit (REQUIRED)
5. revenue-optimizer → Checks monetization impact (if applicable)
6. ui-designer → Reviews styling (if UI changes)
7. devops-engineer → Reviews any workflow changes
```

### Security-Critical Changes

```
1. ANY agent → Identifies security-relevant change
2. security-guardian → Full security audit (REQUIRED)
3. supabase-expert → Database security review (if DB changes)
4. devops-engineer → Environment/secrets review (if infra changes)
```

### Revenue-Critical Changes

```
1. ANY agent → Identifies revenue-relevant change
2. revenue-optimizer → Business impact review (REQUIRED)
3. security-guardian → Security review of payment/user data
4. supabase-expert → Transaction data integrity review
```

### UI/UX Changes

```
1. ui-designer → Creates styling/animation
2. mobile-specialist → Mobile experience review
3. seo-specialist → Meta tags/accessibility review (for new pages)
4. react-specialist → Component optimization review
```

## Conflict Resolution

When agents disagree:

1. **Security always wins** - security-guardian has final say on security matters
2. **Revenue is second** - revenue-optimizer decides on monetization
3. **Escalate to human** - For unresolved conflicts, add `<!-- NEEDS-HUMAN-REVIEW -->` tag

## Emergency Protocols

### Security Vulnerability Found

```markdown
<!-- SECURITY-ALERT -->
**Severity:** [Critical/High/Medium/Low]
**Location:** [File and line number]
**Issue:** [Description of vulnerability]
**Immediate Action:** [What should be done now]
<!-- END-SECURITY-ALERT -->
```

### Revenue Leak Found

```markdown
<!-- REVENUE-ALERT -->
**Impact:** [Estimated revenue loss]
**Location:** [File and line number]
**Issue:** [Missing affiliate tag, broken checkout, etc.]
**Fix:** [Proposed solution]
<!-- END-REVENUE-ALERT -->
```

## Best Practices

### DO

- ✅ Always check if your changes affect other agents' domains
- ✅ Request early review for security/revenue-critical code
- ✅ Provide clear context in collaboration requests
- ✅ Acknowledge and address all blocking issues
- ✅ Thank collaborating agents in your final response

### DON'T

- ❌ Make security changes without security-guardian review
- ❌ Modify affiliate logic without revenue-optimizer approval
- ❌ Create new database tables without supabase-expert review
- ❌ Skip collaboration when triggers are met
- ❌ Ignore blocking issues from P1/P2 agents

## Config Reference

All agents should reference these values from `src/lib/config.ts`:

```typescript
DEMO_MODE = true          // Toggle for local vs production
AFFILIATE_TAG = 'shoeswiper-20'
SHOW_PRICES = false       // Enable when Amazon PA-API connected
ADMIN_EMAIL = 'dadsellsgadgets@gmail.com'
ALLOWED_EMAILS = ['ianmerrill10@gmail.com', ADMIN_EMAIL]
```

## File Locations

| Type | Location |
|------|----------|
| Components | `src/components/` |
| Hooks | `src/hooks/` |
| Utilities | `src/lib/` |
| Types | `src/lib/types.ts` |
| Config | `src/lib/config.ts` |
| Stores | `src/stores/` |
| Pages | `src/pages/` |
| Edge Functions | `supabase/functions/` |
| Migrations | `database/` |
| Workflows | `.github/workflows/` |
| Agent Files | `.github/agents/` |
