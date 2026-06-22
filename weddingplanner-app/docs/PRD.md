# PRD — Wedding Planner App

## 1. Core Idea

A personal wedding planning dashboard for couples — a web app version of the classic
"wedding planning spreadsheet," modeled on the AideaBig Google Sheet template
(`Copy of Wedding Planner by AideaBig.zip`). Instead of a static spreadsheet, the
couple gets a live dashboard: budget tracking, a task checklist, and category-based
organization, all in one place.

## 2. Main Problem

Couples planning a wedding (Malaysian context) typically track everything in a
shared Google Sheet: budget per category, who's paid for what, what's done vs.
pending. Spreadsheets work but don't give an at-a-glance summary, are awkward to
use on mobile, and don't enforce structure (anyone can break a formula). This app
replaces the spreadsheet with a purpose-built tool that keeps the same mental model
(categories → budget items → status) but is easier to update and easier to read.

## 3. Target User

- An engaged couple in Malaysia planning their own wedding (not a professional
  wedding planner managing multiple clients).
- Budget and currency in Ringgit (RM).
- May have a close family member helping out, but the MVP assumes a single shared
  account per couple — no multi-user roles yet.

## 4. Core Features (MVP, max 5)

1. **Dashboard / Overview** — countdown to the wedding date, total budget vs. total
   actual/paid/pending across all categories, at-a-glance summary.
2. **Category-based budget tracking** — pre-seeded categories from the AideaBig
   template (see below), each holding line items with Budget / Actual / Paid /
   Pending amounts.
3. **Task checklist per item** — each budget line item has a status (Not Started /
   In Progress / Done) and an optional assignee (e.g. bride, groom, family member).
4. **Account / auth** — one account per couple (email + password), all data scoped
   to the logged-in account.
5. **Category list matching real wedding planning needs** — Bride, Groom, Pakaian
   (Attire), Venue & Deco, Makanan (Catering), Hantaran (Gifts), Penginapan
   (Accommodation), Photo & Video, Emcee & Music, Honeymoon, Doorgift, and a few
   flexible "Extra" categories.

### What makes a user say "okay this is actually useful" immediately
Seeing their total wedding budget and how much is already paid vs. still pending,
without having to scroll through a spreadsheet or recalculate totals by hand.

### First action on landing
Log in (or sign up) and land on the Dashboard showing the countdown and budget
summary — immediately useful, no empty-state confusion.

## 5. Out of Scope for MVP

- Guest list management / RSVP tracking
- Calendar / timeline / scheduling view
- Multi-couple or wedding-planner-as-a-business mode (multi-tenant)
- PDF export / printable reports
- Payment processing integrations
- Multi-currency support (RM only for now)

## 6. Reference

Existing real-world data model to copy from: `Copy of Wedding Planner by AideaBig.zip`
in this `docs/` folder — an 18-sheet Malaysian wedding planning spreadsheet covering
Overview, Bride, Groom, Guest List, Calendar, Pakaian, Venue & Deco, Makanan,
Hantaran, Penginapan, Photo & Video, Emcee & Music, Honeymoon, Doorgift, and three
flexible Extra categories. Each sheet uses a 4-column financial model (Budget /
Actual / Paid / Pending) plus item-level status and assignee — this is the structure
the MVP's data model should mirror.

## 7. Folder Structure

```
weddingplanner-app/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── docs/
│   ├── Architecture.md
│   ├── Bugs.md
│   ├── PRD.md
│   ├── Roadmap.md
│   └── Copy of Wedding Planner by AideaBig.zip
│
├── frontend/
│   ├── dashboard/
│   │   ├── asset/
│   │   ├── src/
│   │   └── index.html
│   ├── auth/
│   │   ├── asset/
│   │   ├── src/
│   │   └── index.html
│   └── shared/
│
├── .gitignore
└── README.md
```

Agent may rename/add/remove folders as needed, but should respect this structure
as the starting point — frontend organized by page/feature, backend organized by
responsibility (routes/controllers/services), docs kept separate from code.
