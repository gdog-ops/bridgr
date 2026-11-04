# Bridgr

Static website for Bridgr, a UK bridging-finance service from Maplehill Capital Partners Ltd. Plain HTML, CSS and JavaScript: no framework, no build step.

## Pages
- `index.html` — homepage
- `apply.html` — application journey (demonstration, nothing is submitted)
- `calculator.html` — bridging loan cost calculator
- `brokers.html` — broker registration (demonstration)
- `contact.html` — enquiry forms (demonstration)
- `residential-bridging.html`, `commercial-bridging.html`, `auction-finance.html`, `development-finance.html`, `refurbishment-loans.html`, `mezzanine-finance.html` — finance type pages
- `holding.html`, `coming-soon.html` — holding page variants
- `demo-notice.css` — shared style for demonstration notices

## Local preview
Open any `.html` file in a browser, or run `python3 -m http.server` in this folder.

## Deployment
The repository is connected to Vercel through Git. Pushes create deployments, so do not push without approval. See `AGENTS.md` for working rules.

## Status
All forms are demonstrations: there is no backend and nothing is sent or stored.
