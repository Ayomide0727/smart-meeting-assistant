# Smart Meeting Assistant — Frontend

This is a minimal, responsive frontend for the Smart Meeting Assistant. It follows the design pattern, layout, spacing, and color scheme demonstrated in `index.html` and adds dedicated pages for the flow.

## Pages
- `index.html` — Landing page with intro and CTA to start.
- `input.html` — Paste transcript, POSTs to backend for AI processing.
- `results.html` — Renders summary, action items, follow-ups, and Q&A chat.
- `demo.html` — Optional static visualization of agent orchestration.

## Structure
- `assets/css/base.css` — Shared variables, glassy surfaces, buttons, grid, responsive layouts.
- `assets/css/styles.css` — Landing page specific styles.
- `assets/js/api.js` — API calls to backend endpoints.
- `assets/js/input.js` — Handles transcript submission, error/loading states, redirects to results.
- `assets/js/results.js` — Renders dynamic JSON, Q&A chat with loading/errors.

## Running locally

The frontend is served automatically by the backend server:

```bash
# From project root
npm start

# Then open
# http://localhost:5000
```

Or use any static server:

```bash
npx serve -l 3000 .
```

## API Endpoints

The frontend connects to the backend API at `http://localhost:5000/api`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/meeting/process` | POST | Process complete transcript with all agents |
| `/api/meeting/summary` | POST | Get meeting summary only |
| `/api/meeting/actions` | POST | Get action items only |
| `/api/meeting/followups` | POST | Get follow-up suggestions |
| `/api/meeting/qa` | POST | Ask questions about the meeting |
| `/health` | GET | Check backend health status |

### Response Format

```json
{
  "success": true,
  "sessionId": "session_123",
  "processingTime": "1234ms",
  "data": {
    "summary": { ... },
    "actionItems": { ... },
    "followUps": { ... }
  },
  "metadata": {
    "participantCount": 4,
    "actionItemCount": 5,
    "followUpCount": 3
  }
}
```

If backend is unavailable, the UI will show error states gracefully.

## Notes
- Styling is consistent with `index.html` (Plus Jakarta Sans, glass panels, dark background, accent colors).
- All pages are responsive for desktop and mobile.
- Q&A maintains a session-scoped chat log using `sessionStorage`.
- Backend connection status is shown on the input page.
