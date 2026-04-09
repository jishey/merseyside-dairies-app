# Workflow Rules

## Plan-First Protocol (Mandatory)
For ANY non-trivial task (3+ steps or architectural decisions):
1. Read the ENTIRE request
2. List every file to create or change
3. List every dependency that needs installing
4. Identify risks or conflicts with existing code
5. Show the complete plan and WAIT for user approval
6. Only start coding after the user says "go"

If something goes sideways during implementation, STOP and re-plan. Don't keep pushing.

## Verification Checklist (Run Before Marking Complete)
1. `npx tsc --noEmit` -- zero TypeScript errors
2. Check for broken imports across src/
3. `npm run build` -- clean build with no errors
4. If ANY errors found, fix them BEFORE telling the user to test

## Prototype Check
Before building any screen, re-read the relevant section of `merseyside-dairies-app.jsx`. Don't work from memory. The prototype has exact colours, spacing, font weights, and interactions that must be matched.

## Git Safety
- Commit after each completed prompt/task
- Never force push
- Meaningful commit messages describing what was built

## Self-Improvement
- After ANY correction from the user, update `.claude/rules/lessons.md` with the pattern
- Write rules that prevent the same mistake twice
- Review lessons at session start

## Communication
- Luke is NOT a developer
- Explain everything in plain English
- No jargon without explanation
- When presenting options, explain the tradeoff simply
- If something will take a while, say so upfront
- Never rate effort as "Low" -- minimum is Medium

## Task Sizing
- ONE focused task per prompt for best quality
- Each prompt in BUILD-PROMPTS.md is designed to be self-contained
- Complete the current prompt fully before moving to the next
- Run verification after every prompt
