# OnTheLine

A backend-first fishing log built to record catches with location and metadata, validate the data cleanly, and store it for future analysis.

<p align="center">
  <img src="docs/media/OnTheLine_Logo_no_bg.png" width="350" alt="OnTheLine logo">
</p>

## Overview

OnTheLine is a Flask API for logging fishing catches. The current codebase focuses on clean backend architecture, domain validation, and SQLite persistence so it can later support web and mobile clients.

## Current Stack

- Python 3.11+
- Flask
- Pydantic
- SQLAlchemy
- SQLite
- pytest
- Ruff
- uv

## Architecture

The app follows a layered structure:

```text
Request
  -> API routes
  -> Pydantic schemas
  -> service layer
  -> domain entity validation
  -> SQLAlchemy models/session
  -> SQLite database
```

Project layout:

```text
OnTheLine/
├── app/
│   ├── api/         # Flask routes
│   ├── core/        # config, logging, domain entity
│   ├── db/          # SQLAlchemy models and session
│   ├── schemas/     # request/response schemas
│   ├── services/    # application use cases
│   └── main.py      # app entrypoint
├── docs/
├── tests/
├── pyproject.toml
├── uv.lock
└── README.md
```

## Features

- Create catches with generated ID and timestamp
- Validate latitude and longitude ranges in the domain layer
- Store catches in SQLite
- List all catches
- Fetch a catch by ID
- Update an existing catch
- Delete a catch
- Test coverage for core, service, and API behavior

## API Endpoints

- `GET /` - health-style home route
- `POST /catches` - create a catch
- `GET /catches` - list catches
- `GET /catches/<catch_id>` - fetch one catch
- `PUT /catches/<catch_id>` - update one catch
- `DELETE /catches/<catch_id>` - delete one catch

## Getting Started

Install dependencies from the project root:

```bash
uv sync
```

Run the app:

```bash
uv run python -m app.main
```

Open:

```text
http://127.0.0.1:5000
```

## Frontend

A premium React + Vite client now lives in [`frontend/`](frontend/) with:

- React + TypeScript
- Vite
- TanStack Query
- Tailwind CSS
- Radix UI primitives
- React Hook Form + Zod
- Recharts
- Leaflet + React Leaflet with OpenStreetMap tiles

Current frontend highlights:

- Dashboard analytics with charts and a catch map
- Catch detail page with an integrated location map
- Catch create/edit flows with an inline map picker
- Staged location changes on edit so users can preview a new point before confirming it
- Frontend test coverage for map utilities, dashboard map rendering, and catch form/detail flows

Recommended local workflow:

1. Start the Flask API:

```bash
uv run python -m app.main
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Start the frontend dev server:

```bash
npm run dev
```

The Vite app proxies `/api/*` requests to `http://127.0.0.1:5000`, so you can run the backend and frontend side by side without changing the Flask routes.

## Development

Run linting:

```bash
uv run ruff check .
```

Run tests:

```bash
uv run python -m pytest tests/
```

Run frontend checks:

```bash
cd frontend
npm test
npm run lint
```

## Notes

- The SQLite database file is created under `app/db/`.
- Tables are created automatically on app startup.
- The README is intentionally aligned with the code as it exists today, not with older planned architecture notes.

## Future Ideas

- Filtering by species, location, or technique
- Map-based filtering, clustering, and saved spots
- User accounts and authentication
- Fishing session tracking
- Analytics and dashboards
- Mobile UI

## License

See [`LICENSE`](LICENSE).
