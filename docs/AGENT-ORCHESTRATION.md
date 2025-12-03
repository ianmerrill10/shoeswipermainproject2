# ShoeSwiper Agent Orchestration System

> A comprehensive multi-agent system for automated project improvement using GitHub Copilot agents.

## Quick Start

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Agent Orchestration** workflow
3. Click **Run workflow**
4. Select a mode (see below)
5. Click **Run workflow** button

### Scheduled Runs

The orchestration runs automatically every **Monday at 6 AM UTC**.

## Launch Modes

| Mode | Description | Agents Activated |
|------|-------------|------------------|
| `full` | Complete project audit | All 9 agents |
| `security` | Security-focused audit | security-guardian, supabase-expert, devops-engineer |
| `revenue` | Revenue optimization | revenue-optimizer, security-guardian |
| `features` | Feature development | code-builder, react-specialist, supabase-expert, ui-designer |
| `quick` | Fast essential check | security-guardian, revenue-optimizer |

## What Happens When You Run It

1. **Analysis Phase**
   - Counts TODOs in codebase
   - Finds `any` types in TypeScript
   - Detects unguarded `console.log` statements
   - Checks for missing affiliate tags on Amazon links

2. **Issue Creation Phase**
   - Creates GitHub Issues for each active agent
   - Issues include detailed task checklists
   - Analysis results are included in each issue
   - Issues are labeled by priority and category

3. **Assignment Phase**
   - Copilot is auto-assigned to each issue
   - Agents begin working on their tasks

4. **Summary Phase**
   - Generates workflow summary
   - Reports total issues created

## Agent Network

```
                    ┌─────────────────────┐
                    │   🔐 SECURITY       │
                    │   GUARDIAN (P1)     │
                    │   Blocks Everything │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
    │  💰 REVENUE     │ │ 🗄️ SUPABASE │ │  🚀 DEVOPS      │
    │  OPTIMIZER (P2) │ │ EXPERT (P3) │ │  ENGINEER (P4)  │
    │  Critical Biz   │ │ Database    │ │  Infrastructure │
    └────────┬────────┘ └──────┬──────┘ └─────────────────┘
             │                 │
             │    ┌────────────┴────────────┐
             │    │                         │
             ▼    ▼                         ▼
    ┌─────────────────┐           ┌─────────────────┐
    │  🏗️ CODE        │           │  ⚛️ REACT       │
    │  BUILDER (P3)   │◄─────────►│  SPECIALIST (P3)│
    │  Features       │           │  Patterns       │
    └────────┬────────┘           └────────┬────────┘
             │                             │
             └──────────────┬──────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐
    │  🎨 UI          │◄───────►│  📱 MOBILE      │
    │  DESIGNER (P4)  │         │  SPECIALIST (P5)│
    │  Styling        │         │  PWA/Touch      │
    └─────────────────┘         └─────────────────┘
              │
              ▼
    ┌─────────────────┐
    │  🔍 SEO         │
    │  SPECIALIST (P5)│
    │  Discoverability│
    └─────────────────┘
```

## Priority Levels

| Priority | Agent | Authority |
|----------|-------|-----------|
| P1 | security-guardian | **Blocks all deployments** - Security issues must be fixed |
| P2 | revenue-optimizer | **Critical** - Revenue issues are high priority |
| P3 | code-builder, react-specialist, supabase-expert | Core development agents |
| P4 | ui-designer, devops-engineer | Support and infrastructure |
| P5 | seo-specialist, mobile-specialist | Enhancement and optimization |

## Files Created

| File | Purpose |
|------|---------|
| `.github/agents/AGENT_REGISTRY.md` | Master list of all agents |
| `.github/agents/COLLABORATION_PROTOCOL.md` | Agent communication rules |
| `.github/workflows/orchestrate-agents.yml` | GitHub Actions workflow |
| `.github/scripts/agent-tasks.json` | Agent configuration |
| `docs/AGENT-ORCHESTRATION.md` | This documentation |

## Critical Rules

All agents follow these non-negotiable rules:

| Rule | Requirement |
|------|-------------|
| 🔗 Affiliate Tag | ALL Amazon links must include `?tag=shoeswiper-20` |
| 🚫 No `any` Types | Always use proper TypeScript interfaces |
| 🔐 No VITE_ Secrets | Never prefix secrets with `VITE_` |
| 🖥️ Guard Console | Wrap `console.log` with `import.meta.env.DEV` |
| 👤 Admin Email | `dadsellsgadgets@gmail.com` |

## Customization

### Adding New Agents

1. Create agent file in `.github/agents/[name].agent.md`
2. Add to `AGENT_REGISTRY.md`
3. Add to `.github/scripts/agent-tasks.json`
4. Add job to `orchestrate-agents.yml`

### Modifying Launch Modes

Edit `.github/scripts/agent-tasks.json` under `launchModes`:

```json
{
  "launchModes": {
    "custom": {
      "description": "My custom mode",
      "agents": ["agent1", "agent2"]
    }
  }
}
```

### Changing Schedule

Edit `.github/workflows/orchestrate-agents.yml`:

```yaml
schedule:
  # Current: Every Monday at 6 AM UTC
  - cron: '0 6 * * 1'
  
  # Daily at midnight
  # - cron: '0 0 * * *'
  
  # Twice a week (Mon, Thu)
  # - cron: '0 6 * * 1,4'
```

## Monitoring

### Check Workflow Status

1. Go to **Actions** tab
2. Find **Agent Orchestration** workflow
3. View run details and logs

### Review Created Issues

1. Go to **Issues** tab
2. Filter by label: `agent-task`
3. Review individual agent issues

### Track Agent Progress

Each issue shows:
- Assigned agent
- Task checklist
- Analysis results
- Relevant files

## Troubleshooting

### Issues Not Created

- Check workflow permissions (needs `issues: write`)
- Verify Copilot access to repository
- Check for workflow errors in Actions tab

### Agents Not Responding

- Ensure Copilot is properly configured
- Check issue assignment
- Review agent file configuration

### Wrong Mode Activated

- Verify mode selection before running
- Check `launchModes` in config file
- Use manual trigger for specific mode

## Related Documentation

- [Agent Registry](.github/agents/AGENT_REGISTRY.md)
- [Collaboration Protocol](.github/agents/COLLABORATION_PROTOCOL.md)
- [Agent Configuration](.github/scripts/agent-tasks.json)
- [CI/CD Workflows](.github/workflows/)
