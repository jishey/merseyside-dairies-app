# Merseyside Dairies Clipboard App — Build Prompts

This directory contains 14 individual build prompts extracted from the main BUILD-PROMPTS.md file.

## Prompt Order

Each prompt is designed to be completed in sequence. Luke will paste each prompt into Claude Code one at a time and wait for completion before moving to the next.

### Prompts 1-4: Foundation
- **Prompt 1:** Project Scaffolding — Next.js setup, Tailwind, global styles, folder structure
- **Prompt 2:** Supabase Schema + Seed Data — Database schema, migrations, seed script
- **Prompt 3:** Data Layer + Helper Functions — Supabase clients, date helpers, anomaly detection logic
- **Prompt 4:** Shared UI Components — Phone, Page, Btn, BackBtn, Stepper, NumPad, PinDots, StatusBadge, BottomNav, ClipboardWrapper

### Prompts 5-9: Milkman Flows
- **Prompt 5:** Welcome Screen + PIN Entry + Setup — Milkman authentication and new milkman setup
- **Prompt 6:** Clipboard Screen — Morning Mode — Taking Out entry with product cards
- **Prompt 7:** Anomaly Detection + Confirm Flow — Unusual value warnings and confirmation screen
- **Prompt 8:** Afternoon Mode + Summary + Submit — Afternoon switch, took Back entry, summary, submission
- **Prompt 9:** Historical Clipboard — View past clipboard entries with navigation

### Prompts 10-14: Admin Flows
- **Prompt 10:** Admin Login + Dashboard — Admin authentication and dashboard with counts
- **Prompt 11:** Fridge Count + All Clipboards View — Today's fridge count and view all milkmen's clipboards
- **Prompt 12:** Order Calculator + Email + Order History — Calculate orders for tomorrow, generate email, view past orders
- **Prompt 13:** Stock Targets + Product Management + History & Reporting — Configure stock targets, manage products, view sales history charts
- **Prompt 14:** Settings + Milkman Management + Absences + Final Polish — Settings page, add/remove milkmen, manage absences, offline detection, final verification

## File Naming

Each file is named `prompt-NN.md` where NN is the zero-padded prompt number (01, 02, etc.).

## Usage

1. Copy the content of the current prompt file
2. Paste it into Claude Code in the merseyside-dairies folder
3. Wait for Claude to complete the implementation
4. Verify with the checklist (usually `npm run build` and `npx tsc --noEmit`)
5. Move to the next prompt file

## Notes

- The prototype file `merseyside-dairies-app.jsx` is the source of truth for all UI, spacing, colours, and interactions
- Read `CLAUDE.md` and all files in `.claude/rules/` before starting
- Each prompt contains a **Verification** section with required checks before moving on
- The HANDOFF.md file contains the full specification if you need context outside of individual prompts
