# Project Roadmap

## Project Name:
Wedding Planner App (working title)

## Goal:
A working web dashboard for couples to track wedding budget (Budget/Actual/Paid/
Pending per item) and task checklist status across the categories used in the
AideaBig spreadsheet template (Bride, Groom, Pakaian, Venue & Deco, Makanan,
Hantaran, Penginapan, Photo & Video, Emcee & Music, Honeymoon, Doorgift, Extra
1-3), with login and a dashboard showing wedding countdown + aggregate totals.
"Done" for v1 = a couple can sign up, see their seeded categories, add/edit
budget items with status and assignee, and see accurate totals on the dashboard.

---

# Phase 0 — Clarity & Planning

## Objective
Define what you are building before writing code.

## Tasks
- Define core idea: wedding budget + checklist dashboard, modeled on AideaBig
- Identify target users: Malaysian couples planning their own wedding
- List core features (max 5 for MVP): dashboard, category budget tracking, task
  checklist, auth, fixed category list
- Define what is NOT included in MVP: guest list, calendar, PDF export, multi-
  currency, planner/multi-tenant mode
- Create PRD.md (done — see docs/PRD.md)

## Output
- Clear project direction
- PRD completed

---

# Phase 1 — Project Setup

## Objective
Set up a clean and scalable foundation.

## Tasks
- Initialize project (Git, README, .gitignore)
- Create folder structure:
  - backend/
  - frontend/
  - docs/
- Setup backend server (Express)
- Setup frontend base page (HTML/CSS/JS)
- Setup environment variables (.env)

## Output
- Local server running
- Basic frontend page loads

---

# Phase 2 — Core Architecture

## Objective
Organize project for scalability.

## Tasks
- Setup backend structure:
  - routes/
  - controllers/
  - services/
  - middleware/
  - config/
  - utils/
- Setup database connection (MySQL)
- Define schema for User, Category, BudgetItem (see Architecture.md Data Model)
- Seed fixed category list on signup (Bride, Groom, Pakaian, Venue & Deco,
  Makanan, Hantaran, Penginapan, Photo & Video, Emcee & Music, Honeymoon,
  Doorgift, Extra 1-3)
- Create Architecture.md (done — see docs/Architecture.md)

## Output
- Clean backend structure
- Database connected

---

# Phase 3 — Authentication

## Objective
Control user access.

## Tasks
- Create login API
- Implement session or token authentication
- Create auth middleware
- Build login page (frontend)
- Handle login + redirect
- Implement logout

## Output
- User login working
- Protected routes enforced

---

# Phase 4 — Core Feature (MVP)

## Objective
Build the main value of the app: budget + checklist tracking per category.

## Tasks
- Create API endpoints: categories list, budget items CRUD, dashboard summary
- Connect backend to database (Category/BudgetItem tables)
- Build frontend: category page (list of budget items with status/assignee),
  dashboard page (countdown + aggregate Budget/Actual/Paid/Pending totals)
- Fetch and display real RM-formatted totals per category and overall
- Ensure full flow works: add item → see it reflected in category subtotal and
  dashboard total

## Output
- Couple can log in, manage budget items per category, and see accurate
  dashboard totals

---

# Phase 5 — Enhancements

## Objective
Improve usability and experience.

## Tasks
- Add search/filter functionality
- Improve UI/UX layout
- Add loading states
- Handle empty states
- Improve responsiveness

## Output
- App feels smooth and usable

---

# Phase 6 — Advanced Features

## Objective
Add powerful or differentiating features (stretch goals beyond MVP).

## Tasks
- Guest list module (RSVP tracking, side, table assignment)
- Calendar/timeline view for wedding-day and pre-wedding events
- PDF export of the budget summary (replicating the AideaBig printable sheet)
- File uploads (if needed, e.g. vendor contracts/quotes)

## Output
- Advanced functionality implemented (only if MVP is stable and time allows)

---

# Phase 7 — Error Handling & Stability

## Objective
Make the app reliable.

## Tasks
- Add backend error handling
- Handle database failures
- Return proper status codes
- Handle frontend API errors
- Show user-friendly messages

## Output
- Stable application behavior

---

# Phase 8 — Security & Optimization

## Objective
Prepare for production-level quality.

## Tasks
- Move secrets to .env
- Validate and sanitize inputs
- Protect routes
- Optimize queries
- Minify frontend assets

## Output
- Secure and optimized app

---

# Phase 9 — UI/UX Polish

## Objective
Make the app look and feel premium and wedding-appropriate.

## Tasks
- Wedding-themed visual style (soft palette, elegant typography), without
  overdesigning the budget tables
- Consistent RM currency formatting throughout
- Refine typography and spacing on dashboard and category pages
- Add subtle animations (e.g. countdown, status changes)
- Ensure mobile responsiveness (couples will check this on their phones)

## Output
- Clean, professional, wedding-appropriate UI

---

# Phase 10 — Testing

## Objective
Ensure everything works correctly.

## Tasks
- Test all user flows:
  - Login
  - Core feature
  - Edge cases
- Fix bugs
- Update Bugs.md

## Output
- Stable release version

---

# Phase 11 — Deployment

## Objective
Make the app live.

## Tasks
- Setup hosting (backend + frontend)
- Configure environment variables
- Deploy backend
- Deploy frontend
- Test production environment

## Output
- Live application

---

# Phase 12 — Post-Launch Improvements

## Objective
Iterate based on real usage.

## Tasks
- Collect user feedback
- Fix real-world issues
- Improve performance
- Add small improvements

## Output
- Version 1.1+

---

# Phase 13 — Scaling & Future

## Objective
Prepare for growth.

## Tasks
- Refactor large files (if needed)
- Introduce caching
- Optimize database queries
- Add monitoring/logging
- Consider frontend framework (if needed)

## Output
- Scalable architecture

---

# Timeline (Optional, illustrative only)

## Week 1
Project setup (Phase 1) + auth (Phase 3): folder structure, server running,
login/signup working end to end.

## Week 2
Core architecture + data model (Phase 2) + start core feature (Phase 4):
User/Category/BudgetItem schema, seeded categories, basic CRUD endpoints.

## Week 3
Finish core feature (Phase 4) + enhancements (Phase 5): dashboard totals,
category pages, status/assignee on items, responsive layout.

## Week 4
Error handling + security (Phases 7-8) + UI polish (Phase 9) + testing
(Phase 10): harden auth, validate inputs, wedding-themed styling, fix bugs.

---

# Notes

- Focus on completing MVP first
- Avoid overengineering early
- Prioritize working features over perfect structure
- Iterate and improve after launch

---