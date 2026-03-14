# GS AI Outlook

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-stack email & productivity app with authorization
- Inbox module: email list with priority categories (Action Required, Waiting, Newsletters, Other), unread counts, sender/subject/preview/timestamp
- Email detail view: thread reading, AI one-click summarization (simulated), reply/forward actions
- Compose modal: recipient, subject, body, AI tone adjustment options (Professional, Casual, Concise) that rewrite body text (simulated)
- Calendar module: monthly/weekly view, events list, create event
- Tasks module: task list with due dates, priorities, completion toggle
- AI Copilot sidebar: smart suggestions panel showing contextual tips (simulated)
- Sidebar navigation: Mail, Calendar, Tasks, Notes
- Dark/Light theme toggle
- User authentication via authorization component
- Sample seed data for demo purposes

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: User-scoped data for emails, calendar events, tasks. CRUD operations for each. AI simulation endpoints (return pre-written summaries/rewrites). Seed demo data on first load.
2. Frontend: Three-pane layout (sidebar nav, list panel, detail panel). Inbox with category tabs. Email detail with AI summary button. Compose modal with tone selector. Calendar with event grid. Tasks checklist. Theme toggle in header. Authorization gating.
