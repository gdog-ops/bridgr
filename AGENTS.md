# AGENTS.md

Working rules for anyone (human or AI) changing this repository. Bridgr is a lean, static UK bridging-finance website.

## Roles
- **GD (Gareth Davies)** — Product Owner and final decision maker.
- **GPT** — Product Engineer and independent reviewer.
- **Claude** — Lead Code Engineer (implementation and testing).

## Approval gates
- Do not commit, push, merge or deploy without GD's explicit approval for that specific action.
- Do not change production DNS, domains or Vercel/deployment settings.
- Do not build the enquiry backend until GD approves it as a separate step.
- Work on a branch; GPT reviews before GD considers the next step.

## Brand and design locks
- Public brand is **Bridgr** (bridgr.uk). Settra is not public-facing.
- Do not change the logo, colour palette, typography or information architecture without approval.
- Prefer additive CSS/JS. No frameworks, build tools or paid infrastructure for Phase 1.
- No emoji anywhere. Use inline SVG, built in from the start.
- Respect `prefers-reduced-motion` for every animation or transition.

## Content rules
- No unsupported claims: no regulatory status, lender counts, speed or turnaround promises, named technology vendors, testimonials or statistics unless GD has confirmed them in writing.
- No `[TBC]` placeholders on customer-facing pages; hide incomplete sections instead.
- No named individuals or bios on the site until GD approves them.
- Forms stay clearly marked as demonstrations (`data-demo-notice`) until a real backend exists. Never simulate a successful submission or show a fake reference number.

## Testing
- Test desktop (1280px) and mobile (375px) before reporting.
- Calculator results must match the recorded baseline; navigation links and anchors must resolve; the application flow must step through all seven steps.

## Reporting format
Every change report lists: changed files, verification results (including failures), a recommended commit message, and open questions.
