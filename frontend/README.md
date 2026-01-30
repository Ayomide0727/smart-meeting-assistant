# Smart Meeting Assistant — Frontend

This is a minimal, responsive frontend for the Smart Meeting Assistant. It follows the design pattern, layout, spacing, and color scheme demonstrated in `index.html` and adds dedicated pages for the flow.

## Pages
- `landing.html` — Landing page with intro and CTA to start.
- `input.html` — Paste transcript (and optional audio placeholder), POSTs to backend.
- `results.html` — Renders summary, action items, follow-ups, and Q&A chat.
- `demo.html` — Optional static visualization of agent orchestration.
- `index.html` — Existing dashboard demo, kept as-is and used as style reference.

## Structure
- `assets/css/base.css` — Shared variables, glassy surfaces, buttons, grid, responsive layouts.
- `assets/js/api.js` — API calls to `/process-transcript` and `/ask-question`.
- `assets/js/input.js` — Handles transcript submission, error/loading states, redirects to results.
- `assets/js/results.js` — Renders dynamic JSON, Q&A chat with loading/errors.

## Running locally
Use any static server and open `landing.html`:

```bash
# Option 1: Node.js
npx serve -l 5173 .
# or
npx http-server -p 5173 .

# Then open
# http://localhost:5173/landing.html
```

On submit, the app expects a backend providing:
- POST `/process-transcript` → returns JSON: `{ summary: string[]|string, action_items: array, followups: string[] }` (flexible keys supported)
- POST `/ask-question` → returns JSON: `{ answer: string }`

If backend is unavailable, the UI will show error states gracefully.

## Notes
- Styling is consistent with `index.html` (Plus Jakarta Sans, glass panels, dark background, accent colors).
- All pages are responsive for desktop and mobile.
- Q&A maintains a session-scoped chat log using `sessionStorage`.
