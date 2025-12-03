#!/bin/bash
# ShoeSwiper Agent Activation Script
# Run this to get all agent kickoff prompts ready for parallel development

echo "=============================================="
echo "   SHOESWIPER AGENT ACTIVATION SCRIPT"
echo "=============================================="
echo ""
echo "Copy each prompt below into a separate Copilot Chat session."
echo "Select the matching agent from the dropdown before sending."
echo "Agents will communicate via @mentions in their outputs."
echo ""
echo "=============================================="
echo "   ORCHESTRATOR (Run First - Assigns Work)"
echo "=============================================="
echo ""
cat << 'EOF'
/agent orchestrator You are now managing ShoeSwiper development. Analyze the current repo state, identify the top 10 tasks needed for launch, and assign them to the appropriate agents (frontend-architect, backend-engineer, test-automation, bug-hunter). Output a task board with agent assignments and kick off parallel development by dispatching the first task to each agent.
EOF
echo ""
echo "=============================================="
echo "   FRONTEND ARCHITECT"
echo "=============================================="
echo ""
cat << 'EOF'
/agent frontend-architect You are now active on ShoeSwiper. Check for any @frontend-architect requests from other agents. If none, review src/pages and src/components for incomplete features or missing UI. Build the highest-priority component and coordinate with backend-engineer for any data needs.
EOF
echo ""
echo "=============================================="
echo "   BACKEND ENGINEER"
echo "=============================================="
echo ""
cat << 'EOF'
/agent backend-engineer You are now active on ShoeSwiper. Check for any @backend-engineer requests from other agents. If none, review supabase/functions and aws-infrastructure for incomplete APIs or missing integrations. Build the highest-priority endpoint and notify frontend-architect when ready.
EOF
echo ""
echo "=============================================="
echo "   TEST AUTOMATION"
echo "=============================================="
echo ""
cat << 'EOF'
/agent test-automation You are now active on ShoeSwiper. Check for any @test-automation requests from other agents. If none, review src/hooks and src/components for code lacking test coverage. Write tests for the most critical untested code and report coverage to qa-deploy-commander.
EOF
echo ""
echo "=============================================="
echo "   ACTIVATION COMPLETE"
echo "=============================================="
echo ""
echo "All 4 code-generating agents are ready."
echo "They will communicate via @agent-name mentions."
echo "Check each agent's output for requests to other agents."
echo "Pass those requests to the appropriate agent session."
echo ""
echo "Full Agent Roster (10 total):"
echo "  1. orchestrator        - Coordinates all agents"
echo "  2. frontend-architect  - React/UI development"
echo "  3. backend-engineer    - APIs/Supabase/AWS"
echo "  4. test-automation     - Test coverage"
echo "  5. security-sentinel   - Security audits"
echo "  6. data-integration-marshal - Mock→live data"
echo "  7. qa-deploy-commander - CI/CD & deploys"
echo "  8. content-sprinter    - Blog content"
echo "  9. feature-builder     - Rapid features"
echo " 10. bug-hunter          - Debugging"
echo ""
