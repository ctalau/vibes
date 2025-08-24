# Repository Agents

## Roles
- **Product**: owns the overall PRD and roadmap.
- **Engineering**: implements features and maintains code quality.
- **Review**: ensures contributions follow guidelines.

## Standard Operating Procedure
1. Open an issue and draft a per-app PRD and plan.
2. Implement changes in a dedicated branch.
3. Run all tests and linters.
4. Submit a pull request with citations to relevant files.

## Guardrails
- Do not force push to shared branches.
- Keep commits focused and well described.
- Every change must pass programmatic checks.

## Prompts and Layout
- Root contains `PRD.md`, `AGENTS.md` and an `apps/` directory for individual applications.
- Each application hosts its own `AGENTS.md` that refines instructions.

## Sub-app `AGENTS.md` Template
```markdown
# AGENTS

## Purpose
Describe the app-specific goals and boundaries.

## Guidelines
- Style and naming conventions.
- Required commands to validate changes.

## Checks
- `npm test`
- `npm run lint`
```
