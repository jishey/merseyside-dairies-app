# Lessons Learned

Running log of hard-won lessons. Read this at the start of every session. Never repeat these mistakes.

## From the Prototype (Bugs Already Fixed -- Do Not Regress)

1. **Stepper components cause flicker if defined inside page components.** Phone, Page, Btn, BackBtn, and all shared components must be separate files. Never define them inside a page component's function body. This caused full React remount on every state change in the prototype.

2. **Stepper inputs lose keystrokes with controlled value.** Use the local draft pattern: onFocus clears display and sets typing mode, onChange updates draft only (no state commit), onBlur commits clamped value. See ui.md for full pattern.

3. **EDITED badge must not be permanent.** Compare current value to morning snapshot on every render. If value returns to the snapshot value, the badge must disappear. Don't use a boolean flag.

4. **Brought-back must be clamped when taking-out decreases.** `Math.min(currentBack, newOut)` -- always. Otherwise you get brought-back > taking-out which is nonsensical.

5. **Zero values ARE anomalies -- but only if the milkman has started.** A milkman normally takes 40 of something and enters 0 = anomaly. But a milkman who hasn't touched their clipboard yet (all zeros) = not an anomaly. Check `hasStarted` (any product has out > 0).

6. **Dashboard clipboard count must include headed-out milkmen.** Count `headedOut || submitted`, not just `submitted`. Otherwise it shows 0/7 even after milkmen have confirmed and left.

7. **headedOut must be per-milkman, not a global boolean.** Each milkman has their own headed_out status via the clipboard_status table.

8. **Order calculator must default to suggested amount, not 0.** Use `orderData[p.id] ?? suggested` so the stepper shows the calculated suggestion until John manually overrides it.

9. **Order calculator uses TOMORROW's stock target.** The order is for tomorrow morning's delivery. Don't use today's day of week.

10. **milkmen state must be declared before any useMemo/useCallback that references it.** React hooks must be in consistent order with no conditional declarations before them.

## Communication

11. **Luke is not a developer.** Explain everything in plain English. No jargon without a one-sentence explanation.

12. **Never rate effort as "Low".** Minimum effort rating is Medium. Luke's explicit instruction.

13. **Give Luke what he asks for directly.** Don't redirect or tell him where to find things. Deliver content in the response.

14. **Don't guess at external service details.** If unsure about API fields, email addresses, or costs, say so and ask.
