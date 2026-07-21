# Feature Scope — Project Management Tool

Reference platforms: Linear, Plane.so, Notion, Asana, ClickUp, Jira/Trello.
Compiled from platform knowledge + direct screenshots of Plane.so (app.plane.so) + verified research on Linear's AI triage system.

Legend: 🟢 build now (static data) · 🟡 build after core is solid · 🔵 stretch / backend-dependent

---

## 1. Core (MVP — must have)

| Feature | UX pattern to follow | Status |
|---|---|---|
| Workspace → Team/Project → Issue hierarchy | Linear/Plane sidebar nesting | done (backend) |
| Kanban board, drag-and-drop | dnd-kit, cross-column drag, optimistic move | done (frontend, static) |
| Collapsible sidebar | Plane's `⇥` collapse icon top-right of sidebar; persists via localStorage | 🟢 next |
| Issue creation (quick + full) | Plane's "Create new work item" modal: title, rich description (`/` slash commands), State/Priority/Assignees/Labels/Start‑Due date/Estimate/Parent, "Create more" toggle to keep modal open | 🟢 next |
| Issue detail panel | Side panel (not full page) with title, description, properties column, tabs: All / Activity / Comments / History | 🟢 next |
| Comments on issues | Threaded, @mention highlighting, rich text toolbar (bold/italic/underline/strike/align/lists/code/image/attachment) — this is what the user is calling "chat" | 🟢 next |
| Activity/audit log | Auto-generated entries: "X changed status from Y to Z", "X assigned to Y" — separate tab from comments | 🟢 next |
| Assignee + multi-assignee avatars | Stacked avatar circles on card + detail panel | 🟢 next |
| Labels | Colored pill tags, multi-select | 🟢 next |
| Priority (No priority/Low/Med/High/Urgent) | Icon + color, Urgent is the only colored one (red/orange) — rest monochrome | done |
| Sub-issues / parent-child | "Add sub-work item" button on detail panel, nested checklist-style rollup | 🟡 |
| View switcher: Board / List / Calendar / Gantt / Spreadsheet | Icon row in topbar (Plane has 5 icons) — Board done, List next, others stretch | 🟡 |
| Command palette (⌘K) | Global search + quick actions, fuzzy match | 🟡 |

## 2. Standard (expected in a "complete" tool)

| Feature | UX pattern | Status |
|---|---|---|
| Project-level chat/discussion (not just per-issue comments) | A dedicated "Discussions" or "Chat" tab per project, separate from issue comments — ClickUp/Notion pattern | 🟡 |
| Notifications | Bell icon, dropdown list, real-time-styled unread dot | 🟡 |
| Workspace/project settings | Members, roles/permissions, custom statuses, custom fields | 🟡 |
| Custom fields | Plane screenshot shows a "Document Type" dropdown custom field on an issue — implies per-project custom property definitions | 🟡 |
| Templates | Project templates, issue templates, recurring tasks | 🟡 |
| Analytics dashboard | Plane's Analytics: Total Admins/Members/Guests/Work Items/Cycles/Intake tiles + radar chart (Work Items/Views/Cycles/Modules/Pages) + "Summary of Projects" trend table | 🟡 |
| Personal "Your Work" profile page | Work items by Priority (bar chart), Work items by State (donut), Recent activity feed — seen directly in screenshots | 🟡 |
| Cycles / Sprints | Time-boxed iteration grouping (Linear "Cycles", Plane "Cycles") | 🟡 |
| Modules / Epics | Grouping above projects, cross-cutting initiatives | 🟡 |
| Filters + saved views | Filter bar (e.g. "Assignees is X") pinned above board, seen in Plane screenshot | 🟡 |
| Attachments | File upload on issues, shown as chip with size, seen in screenshots | 🟡 |
| Issue relations | Blocks/blocked-by/duplicate, link icon in detail panel toolbar | 🟡 |

## 3. Advanced / Differentiating

| Feature | UX pattern | Status |
|---|---|---|
| Workload / capacity view | Asana Workload: color-coded capacity bars per person, red when over-capacity, drag-and-drop rebalancing on a timeline | 🔵 |
| Timeline / roadmap | Linear Timeline: project-level Gantt-style view groupable by Initiative, shows milestones/dependencies/health | 🔵 |
| Time tracking | ClickUp-style start/stop timer per task, logged hours on card | 🔵 |
| Goals / OKRs | Linear/Asana goals tied to projects, progress rollup | 🔵 |
| Automation rules | "When X then Y" rule builder (Asana Rules gallery pattern: trigger → condition → action, with presets) | 🔵 |
| Integrations | GitHub/GitLab PR linking (auto-close on merge), Slack notifications, calendar sync | 🔵 (needs real OAuth/backend) |

## 4. AI / Emerging (what's real vs. marketing — verified where noted)

| Feature | Reality check | Status |
|---|---|---|
| AI-assisted triage (verified) | Linear's real, shipped "Triage Intelligence": LLM reads incoming issues, suggests team/project/assignee/labels based on historical patterns, flags likely duplicates via semantic similarity, shows *reasoning* for each suggestion, user can accept/dismiss. Source: linear.app/docs/triage-intelligence | 🔵 UI-mockable now with static "AI suggested" chips + reasoning tooltip |
| AI issue summarization | Auto-summarize long comment threads into a TL;DR — plausible pattern across ClickUp/Notion AI, not independently re-verified this session | 🔵 mockable |
| AI-drafted issue from a one-line prompt | "Describe what you want, AI fills title/description/labels" — matches ClickUp AI / Notion AI patterns | 🔵 mockable |
| AI meeting notes / summarization | Notion shipped an AI Meeting Notes block (unverified this session due to rate-limit, but consistent with known Notion AI roadmap) | out of scope for now |

Given no LLM backend is wired up yet, AI features will initially ship as **UI-complete but response-mocked** (static "AI suggestion" cards with plausible copy) — real LLM wiring is a backend milestone, not a frontend one, and is a good candidate for the Claude API once the rest of the app works.

---

## Build order (this session)

1. Collapsible sidebar + responsive layout pass
2. Issue detail side panel (properties, description, tabs)
3. Comments/chat tab + Activity tab (static, functional add-comment)
4. New Issue creation modal
5. List view (second view type, proves the view-switcher pattern)
6. Command palette (⌘K)
7. Labels, multi-assignee, attachments on cards + detail panel
8. AI-mocked suggestions on issue creation/detail (UI only)
9. Analytics + "Your Work" profile page
10. Everything else in Standard/Advanced tiers, prioritized by what's left after the above
