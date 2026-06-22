# Wedding Planner App

A wedding budget planning dashboard (MVP stage): users sign up, get a set of default budget categories, and track budget/actual/paid amounts per item. See [docs/PRD.md](docs/PRD.md), [docs/Architecture.md](docs/Architecture.md), and [docs/Roadmap.md](docs/Roadmap.md) for deeper context.

## Tech stack

- **Backend:** Node.js + Express, MySQL (`mysql2`), session-based auth (`express-session` + `bcrypt`), `dotenv` for config.
- **Frontend:** Vanilla JS + HTML, Tailwind CSS via CDN (no build step), Chart.js for dashboard charts.
- **Tooling:** npm only. No test framework, no linter/formatter configured yet — this is intentional at MVP stage, not an oversight.

## Folder structure

```
backend/    Express app — controllers/services/routes/middleware/config/utils (see Conventions below)
frontend/   Page-per-folder static HTML (landing, auth, dashboard, category) + shared/ utilities
docs/       PRD, Architecture, Roadmap, Bugs log
```

## Debugging workflow

- **Backend/general changes:** restart the node server (`taskkill //F //IM node.exe` or `pkill -f "node server.js"`, then `npm run <script>` from `backend/`), then manually click through the affected flow in the browser. This is the default for anything that isn't a pure visual/layout change.
- **UI/visual changes against a reference image:** follow the screenshot → compare → fix loop documented in [.claude/skills/website-design-recreation/SKILL.md](.claude/skills/website-design-recreation/SKILL.md) — don't duplicate those steps here.

## Communication style

- Explain reasoning before making non-trivial changes.
- Otherwise proceed autonomously — don't ask for permission on routine edits.
- Always ask first before risky/destructive actions: DB schema/migration changes, file deletions, git history rewrites, force pushes.

## Conventions

- **Commits:** conventional prefixes — `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
- **Code style:** prefer `async`/`await` over raw callbacks or promise chains. Keep the controller → service → route layering consistent: routes stay thin, controllers handle req/res only, services hold business logic and DB calls.

## Deployment

Not yet decided. Keep local-dev-first assumptions (`.env`-based config) until a hosting target is chosen — don't prescribe a platform.
