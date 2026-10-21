# Freelancer Platform

A portfolio and code-quality project demonstrating a Django REST API and React client for a two-sided freelance marketplace. The repository is intended for local development and review; it is not a production deployment.

## Implemented Features

- Client and freelancer accounts with JWT authentication and token refresh.
- Client-owned projects and freelancer proposals, including one accepted proposal per project.
- Project hiring, rejection, completion, ratings, and activity records.
- Project conversations with participant-scoped access and private message attachments.
- Freelancer portfolios, profile uploads, dashboard counts, and a basic per-user wallet balance record.

The wallet is a stored balance field, not a payment or transaction-processing system. The project has no WebSocket messaging service or production deployment configuration.

## Stack

- Python 3.13, Django 5.2, Django REST Framework, Simple JWT
- PostgreSQL for the documented Docker development workflow
- Redis for shared development rate-limit cache
- React 19, Vite, and Axios
- Docker Compose for local service orchestration

## Repository Layout

```text
backend/       Django project, API apps, migrations, and tests
frontend/      React/Vite application and browser-side API clients
compose.yaml   Local PostgreSQL, Redis, Django, and Vite services
.github/       GitHub Actions CI workflow
```

## Requirements

For the recommended Docker workflow, install Docker Desktop with Docker Compose v2. No local Python, Node.js, or PostgreSQL installation is needed.

## Run With Docker

From PowerShell at the repository root:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
docker compose up --build
```

The example credentials are for local-only use. Do not reuse them outside a developer machine. The services are bound to localhost:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8001/api/
- Django admin: http://localhost:8001/admin/
- PostgreSQL: localhost:5432

The backend waits for healthy PostgreSQL and Redis services, applies the committed migrations to the Compose PostgreSQL database, then starts Django's development server. It does not run `makemigrations` automatically. The browser uses `VITE_API_URL=http://localhost:8001/api`; it does not use a Docker-only hostname. Django continues listening on container port 8000, published on host port 8001.

PostgreSQL data is kept in the `postgres_data` named volume. Private message attachments are kept separately in `private_messages`, mounted only into the backend. `docker compose down` stops and removes the containers but retains both volumes. Do not use `docker compose down --volumes` unless you deliberately intend to permanently delete the local database and private attachments.

Useful commands:

```powershell
docker compose logs -f backend
docker compose logs -f db
docker compose exec backend python manage.py check
docker compose exec backend python manage.py makemigrations --check --dry-run
docker compose exec backend python manage.py test
docker compose exec frontend npm run lint
docker compose exec frontend npm test
docker compose exec frontend npm run build
```

Create an administrator when needed:

```powershell
docker compose exec backend python manage.py createsuperuser
```

Equivalent Bash startup:

```bash
test -f .env || cp .env.example .env
docker compose up --build
```

## Database and Migrations

PostgreSQL is the primary documented development database and the backend container receives a URL using the Compose service hostname `db`. Redis is the configured cache when `RATE_LIMIT_CACHE_URL` is present. The backend can still use SQLite for an optional direct, local Django run with `backend/.env.example`; that option is not used by Compose or PostgreSQL CI.

The migration chain includes project budget/proposal/rating constraints, private message attachment storage, and query-path indexes. Before applying migrations 0003–0005 to an existing populated database, back up the data and preflight for non-positive budgets or bids, inverted budget bounds, ratings outside 1–5, duplicate directional ratings, and multiple accepted proposals for a project. Correct violating rows before applying the constraints.

Migration 0004 changes the message attachment storage backend but does not move existing files. For an existing installation, inventory `MEDIA_ROOT/messages/`, prevent public serving of that path, and copy retained files to `PRIVATE_MEDIA_ROOT` while preserving their relative names. Do not delete the source files until the copied attachments have been checked.

## Tests and Checks

The Compose backend test command uses the PostgreSQL service. CI also applies migrations to a fresh PostgreSQL service before running the suite.

```powershell
docker compose exec backend python manage.py test
docker compose exec backend python manage.py check
docker compose exec backend python manage.py makemigrations --check --dry-run
docker compose exec frontend npm run lint
docker compose exec frontend npm test
docker compose exec frontend npm run build
```

The frontend API path test uses Node's built-in test runner. No browser end-to-end test suite is currently configured.

## Environment Files and Local Data

- Copy the root `.env.example` to `.env` for Docker Compose. `.env` is ignored by Git.
- `backend/.env.example` is an optional direct-Django development example.
- Do not commit real secrets, `.env` files, local SQLite databases, `media/`, `private_media/`, `node_modules/`, or `dist/`.
- Compose build contexts exclude local databases, uploads, environment files, and generated dependencies through `.dockerignore` files.

## Troubleshooting

- **PostgreSQL connection refused:** wait for the `db` health check and inspect `docker compose logs db`. Inside Compose, the database host is `db`, not `localhost`.
- **Port already in use:** change `POSTGRES_PORT`, `BACKEND_PORT`, or `FRONTEND_PORT` in the root `.env`, then restart Compose. The default backend host port is 8001; Django listens on container port 8000.
- **Frontend cannot reach the API:** check that `VITE_API_URL` is a browser-reachable URL such as `http://localhost:8001/api`; restart the frontend after changing it.
- **CORS failure:** ensure the browser origin exactly matches one of `DJANGO_CORS_ALLOWED_ORIGINS`, including the scheme and port.
- **Migration constraint failure on existing data:** keep the data, inspect the rows described above, and correct them before retrying. Do not delete the PostgreSQL volume as a troubleshooting shortcut.
- **Dependency changes:** rebuild the frontend image after changing `package.json` or `package-lock.json`; `npm ci` installs exactly the committed lockfile.

## Contributions

Keep changes focused, include regression tests for behavior changes, and run the backend checks and frontend lint/build applicable to the change. Do not commit credentials, database files, uploaded media, or generated build output.
