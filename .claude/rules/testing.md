# Testing Rules

## Strategy
This is a simpler app than Fluxr Legal. Testing focuses on critical business logic that, if wrong, would cause real problems for John and the milkmen.

## What MUST Be Tested (Unit Tests)

### Anomaly Detection (`lib/anomaly.ts`)
- Returns false when fewer than 4 weeks of history
- Returns false when average is 0
- Returns true when value differs >25% from average
- Returns false when value is within 25% of average
- Returns true for zero value when milkman has started (other products > 0)
- Returns false for zero value when milkman has NOT started (all products 0)

### Order Calculator Logic
- Correctly uses tomorrow's day of week (not today)
- suggested = max(0, target - onHand)
- onHand = fridge count + total returned
- Defaults to suggested when no manual override

### Brought-Back Clamping
- When taking-out decreases, brought-back is clamped: min(currentBack, newOut)
- Waste clamped to out - back

### Date Helpers (`lib/helpers.ts`)
- dateStr produces YYYY-MM-DD
- formatDate produces "Thursday 9th April" with correct ordinal
- greeting returns correct string for morning/afternoon/evening

### milkmanStatus Helper
- Returns "submitted" when submitted is true
- Returns "anomaly" when any product has unconfirmed anomaly
- Returns "progress" when any product has out > 0
- Returns "not_started" when all products are 0

## What Does NOT Need Unit Tests
- UI component rendering (test manually)
- Supabase queries (test via integration/manual)
- Stepper component behaviour (well-established pattern, test manually)
- Navigation/routing (test manually)

## Test Setup
- Framework: Vitest (included with Next.js)
- Test files: alongside source files as `*.test.ts` or in `__tests__/` directories
- No mocking of Supabase in unit tests -- test pure functions only
- Integration tests can be added later if needed

## Running Tests
```bash
npm run test           # Run all tests once
npm run test:watch     # Watch mode during development
```

## Rules
1. Write tests for business logic functions, not UI components
2. Every function in `lib/anomaly.ts` and `lib/helpers.ts` gets tests
3. Tests must pass before committing: `npm run test`
4. Keep tests simple and readable -- if a test needs a comment to explain what it does, the test name is wrong
5. No snapshot tests -- they break too easily and add no value for this app
