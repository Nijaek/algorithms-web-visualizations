# Repository Guidelines

## Project Structure & Module Organization
- `frontend/` (Vite + React + TypeScript + Tailwind): UI components and hooks live under `frontend/src/`; assets and styles are colocated with features.
- `backend/` (Django + DRF): API endpoints and algorithm implementations in `backend/api/`; tests in `backend/api/tests/`; project settings in `backend/neonalgo/`.
- `docker/`: Compose and service Dockerfiles for frontend, backend, and sample Nginx config.
- Root configs: `README.md` for overview, lockfiles and tool configs under `frontend/`, Python requirements in `backend/requirements.txt`.

## Setup, Build, and Run
- Frontend: `cd frontend && npm install`, then `npm run dev` for local dev, `npm run build` for production bundle, `npm run preview` to verify the build.
- Backend: `cd backend && python -m venv .venv && .venv\\Scripts\\activate` (PowerShell), `pip install -r requirements.txt`, `python manage.py runserver` to start the API.
- Docker: From repo root, `docker compose up --build` to run frontend + backend behind Nginx (adjust env vars as needed).

## Coding Style & Naming Conventions
- TypeScript/React: Follow ESLint defaults (`npm run lint`); prefer functional components and hooks; components in `PascalCase`, hooks in `camelCase` prefixed with `use`.
- Styling: Tailwind utility-first; keep feature styles close to components.
- Python: PEP 8 formatting; keep algorithm helpers in `api/algorithms/` with clear docstrings; DRF views/serializers named after resources.
- Indentation: 2 spaces for TS/JS, 4 spaces for Python.

## Testing Guidelines
- Frontend: `npm run test` (Vitest) for unit/component tests; colocate tests near sources with `.test.tsx`/`.test.ts` suffixes.
- Backend: `python manage.py test api` runs Django tests; add new tests under `backend/api/tests/` using `test_*.py` naming.
- Aim for meaningful coverage on new logic (algorithms, hooks, serializers); prefer table-driven cases for algorithm variants.

## Commit & Pull Request Guidelines
- Use clear, actionable commits (prefer Conventional Commits style: `feat: add new sorter`, `fix: handle empty payload`).
- PRs should include: summary of changes, linked issue/feature ID, test evidence (`npm run test`, `python manage.py test`), and screenshots/GIFs for UI updates.
- Keep PRs scoped: one feature/fix per PR; update docs/configs when behavior changes.

## Security & Configuration Tips
- Do not commit secrets; use environment variables (e.g., Django `SECRET_KEY`, API URLs). Provide sample values in `.env.example` if adding new settings.
- Validate user input on both frontend and backend; sanitize algorithm parameters before execution to avoid runtime errors.
