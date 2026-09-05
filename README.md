# MoSPI Project Monitor
**SIH26103 · Smart Automation · Web-based Integrated Project-Monitoring Platform**

A platform where contractors submit project reports, an automated engine analyzes each
submission (objectives, scope, budget, timeline, milestones, risk), and an admin reviews
the generated report to approve, reject or request revisions — with a live directory of
contractors, their work, and their full history.

## Stack
- **Backend:** Node.js, Express, SQLite (better-sqlite3), JWT auth, Multer file uploads,
  a rule-based document analysis engine (pdf-parse / mammoth for text extraction).
- **Frontend:** React (Vite), Tailwind CSS, React Router, Recharts.

## Project structure
```
mospi-monitor/
  backend/          Express API, SQLite database, analysis engine
  frontend/         React dashboard (contractor + admin views)
```

## 1. Backend setup
```bash
cd backend
npm install
cp .env.example .env      # edit JWT_SECRET if you like
npm run seed               # creates demo admin + contractors + sample projects
npm run dev                 # or: npm start
```
The API runs at `http://localhost:5000`. Uploaded files are stored in `backend/uploads/`
and the SQLite database is created at `backend/db/monitor.sqlite` (safe to delete to reset).

## 2. Frontend setup
```bash
cd frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173` and talks to the API at `http://localhost:5000/api`
by default (override with a `VITE_API_URL` env variable if needed).

## Demo accounts (created by `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@mospi.gov.in | admin123 |
| Contractor | ramesh@buildright.co.in | contractor123 |
| Contractor | ananya@urbanpath.co.in | contractor123 |
| Contractor | suresh@greenlinecivil.in | contractor123 |

New contractors can also self-register from the login screen.

## How the automated analysis works
When a contractor submits a project with a PDF/DOCX/TXT report, `services/analysisEngine.js`:
1. Extracts the document's text.
2. Checks for six expected sections — objective, scope of work, budget, timeline,
   milestones, and risk mitigation — using pattern matching.
3. Scores completeness (0–100) from section coverage and document length.
4. Flags concrete gaps ("No risk mitigation section found", etc.) and a rough
   budget-to-duration sanity check.
5. Assigns a risk level (Low / Medium / High) and a recommendation (Approve /
   Review Required / Reject – Incomplete).

This report is stored with the project and shown to both the contractor and the admin,
so the admin can make a decision without reading the full document, and the contractor
gets clear, actionable feedback if something is missing.

## Key features
- **Contractor:** register/login, submit a project with a report attachment, see the
  automated analysis instantly, track status and admin remarks, review history.
- **Admin:** dashboard with portfolio-wide stats and charts (by category, over time),
  a filterable review queue, one-click approve / reject / request-revision with remarks,
  a contractor directory with per-contractor project counts and total project value,
  and a full profile + history view per contractor.

## Notes for extending this for the hackathon
- Swap the rule-based analysis engine for a real LLM/NLP call by replacing the body of
  `analyzeProject()` in `backend/services/analysisEngine.js` — the rest of the app
  (storage, display, admin decisioning) doesn't need to change.
- The schema (`backend/db/schema.sql`) is intentionally simple; swapping SQLite for
  Postgres later only requires changing `db/connection.js` and the SQL dialect.
- Add email/SMS notifications on status change by hooking into the decision route in
  `backend/routes/admin.routes.js`.
