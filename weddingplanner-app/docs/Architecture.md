# Architecture — Wedding Planner App

Explains how the app is structured and how the pieces interact.

# System Overview

**Purpose:** Replace the AideaBig wedding-planning spreadsheet with a live web
dashboard for budget tracking and task checklists.

- **Users:** A single engaged couple per account (Malaysian wedding context, RM
  currency). No planner/multi-tenant roles in MVP.
- **Pain point removed:** Spreadsheets are hard to read at a glance, awkward on
  mobile, and easy to break. This app enforces structure (fixed categories, typed
  fields) and gives an instant budget summary.
- **What the system does:** Lets a couple log in, see a dashboard with wedding
  countdown + total budget summary, and manage budget items within fixed
  categories (Bride, Groom, Pakaian, Venue & Deco, Makanan, Hantaran, Penginapan,
  Photo & Video, Emcee & Music, Honeymoon, Doorgift, Extra 1-3).
- **In scope for MVP:** auth, dashboard, category + budget item CRUD, status/
  assignee tracking on items, aggregate budget totals.
- **Out of scope for MVP:** guest list, calendar/timeline, PDF export, multi-
  currency, multi-tenant/planner mode (see PRD.md §5).

# Folder Structure

```
weddingplanner-app/
│
├── backend/
│   ├── config/        # DB connection, env loading
│   ├── controllers/    # one per resource: auth, categories, budgetItems
│   ├── middleware/     # session auth guard, error handler
│   ├── routes/          # /auth, /categories, /budget-items, /dashboard
│   ├── services/        # business logic (e.g. computing dashboard totals)
│   ├── utils/            # currency formatting (RM), date/countdown helpers
│   └── server.js
│
├── docs/
├── frontend/
│   ├── dashboard/      # countdown + budget summary page
│   ├── auth/             # login/signup page
│   ├── categories/      # category detail page (list of budget items)
│   └── shared/            # shared CSS/JS, nav, currency formatting helpers
│
├── .gitignore
└── README.md
```

- **frontend/** holds one folder per page/view, each self-contained (asset/src/
  index.html), plus a `shared/` folder for cross-page styles and helpers.
- **backend/** is a modular monolith: routes delegate to controllers, controllers
  call services for logic, services talk to the DB via models/queries.
- **docs/** holds planning docs only — no code.

# Data Model

Three core entities, directly mirroring the AideaBig spreadsheet's structure
(sheet → row → 4-column financial model):

### User
| field | type | notes |
|---|---|---|
| id | PK | |
| email | unique, required | login identifier |
| password_hash | required | bcrypt hash, never store plaintext |
| partner_name_1 | optional | e.g. bride's name |
| partner_name_2 | optional | e.g. groom's name |
| wedding_date | optional | drives the countdown on the dashboard |

### Category
| field | type | notes |
|---|---|---|
| id | PK | |
| user_id | FK → User | required |
| name | required | seeded per user on signup from the fixed list (Bride, Groom, Pakaian, Venue & Deco, Makanan, Hantaran, Penginapan, Photo & Video, Emcee & Music, Honeymoon, Doorgift, Extra 1, Extra 2, Extra 3) |

### BudgetItem
| field | type | notes |
|---|---|---|
| id | PK | |
| category_id | FK → Category | required |
| name | required | e.g. "Bridal makeup", "Catering for 300 guests" |
| budget_amount | decimal | planned cost (RM) |
| actual_amount | decimal | quoted/actual cost (RM) |
| paid_amount | decimal | amount paid so far (RM) |
| pending_amount | decimal | derived or stored: actual - paid |
| status | enum | Not Started / In Progress / Done |
| assignee | optional string | e.g. "Bride", "Groom", a family member's name |
| remark | optional text | free-form note, e.g. vendor contact, deposit terms |

**Relationships:** User 1—N Category 1—N BudgetItem. All data is scoped to
`user_id` (directly on Category, transitively on BudgetItem) — every query must
filter by the logged-in user.

# Feature Flows

**Login:** user submits email/password → controller verifies against
`password_hash` → on success, server creates a session → session cookie set →
redirect to Dashboard. On failure, return 401 with a generic "invalid credentials"
message.

**View Dashboard:** authenticated request → service fetches all Categories for
`user_id` with their BudgetItems → sums budget/actual/paid/pending across all items
→ computes days-until `wedding_date` → returns aggregate JSON → frontend renders
countdown + totals + per-category subtotal.

**Add/edit a BudgetItem:** user submits form on a category page → controller
validates required fields (name, category_id belongs to user) and numeric fields
→ service computes `pending_amount` if not provided → saved → category and
dashboard totals recalculated on next fetch (no caching in MVP).

**Mark item status:** user toggles status on a BudgetItem → controller checks the
item's category belongs to the logged-in user → updates `status` → returns
updated item.

**Errors that can occur:** invalid login, validation failure on item fields
(negative amounts, missing name), category/item not found or not owned by user
(403/404), DB connection failure (500 with generic message).

# Technical Decisions

- **Node/Express:** small team, simple REST API, fast to build and matches the
  folder skeleton already in this repo.
- **Database:** MySQL. Schema above maps directly to three tables (`users`,
  `categories`, `budget_items`), defined in `backend/config/schema.sql` and
  applied via `npm run migrate` (`backend/scripts/migrate.js`). Connection pool
  lives in `backend/config/db.js`, configured via `backend/.env` (see
  `.env.example`).
- **Session auth (not JWT):** single-household app, no need for stateless
  cross-service auth; sessions are simpler to invalidate (logout) and sufficient
  for this scale.
- **Modular monolith (not microservices):** the whole app is small (3 entities,
  one user type) — splitting into services would add deployment complexity with
  no benefit at this scale.
- **Raw SQL/lightweight query layer over a full ORM:** schema is small and fixed;
  an ORM would add overhead without much payoff. Can revisit if the schema grows.
- **No file storage needed in MVP:** all data is structured rows, no document
  uploads in scope yet.

# Security Considerations

- Passwords hashed with bcrypt before storage; plaintext never logged or stored.
- All `/categories` and `/budget-items` routes protected by session-auth
  middleware; requests without a valid session are rejected with 401.
- Every DB query for categories/budget items filters by the session's `user_id` —
  no user can read or write another user's data, even by guessing IDs.
- Public routes: login, signup. Everything else requires an active session.
- Sessions stored server-side (or in a signed cookie), expire after inactivity.
- Known risk: no rate limiting on login in MVP — flagged for Phase 8 (Security &
  Optimization) in Roadmap.md.

# Error Handling

- **Database failure:** catch at the service layer, return 500 with a generic
  "something went wrong, try again" message — no raw DB errors exposed to client.
- **Missing category/item:** return 404; if it exists but belongs to another
  user, also return 404 (don't leak existence).
- **Login failure:** return 401 with a generic invalid-credentials message (don't
  reveal whether the email exists).
- **Frontend:** show inline error messages near the relevant form/section rather
  than blocking the whole page; dashboard shows a friendly empty state if a
  category has no items yet.

# Future Architecture Notes

- **Guest list module:** new `Guest` entity (name, RSVP status, side, table) — own
  route/controller/page, no changes to existing entities needed.
- **Calendar/timeline module:** new `Event` entity tied to `user_id`, separate
  page; could reuse the BudgetItem status pattern.
- **PDF/export:** add a `services/reportService.js` once there's enough data to
  warrant exporting; render via a PDF library in backend.
- **Multi-currency:** would require adding a `currency` field to User and
  formatting helpers in `utils/` — not needed while scope is Malaysia-only.
- **Routes splitting from server.js:** already split via `routes/` in this
  structure from Phase 1 onward, so no later migration needed there.
- **Read replicas / connection pool tuning:** revisit `connectionLimit` in
  `config/db.js` if concurrent multi-device usage grows beyond MVP scale.
