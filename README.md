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

## Development

Run linting:

```bash
uv run ruff check .
```

Run tests:

```bash
uv run python -m pytest tests/
```

## Notes

- The SQLite database file is created under `app/db/`.
- Tables are created automatically on app startup.
- The README is intentionally aligned with the code as it exists today, not with older planned architecture notes.

## Future Ideas

- Filtering by species, location, or technique
- User accounts and authentication
- Fishing session tracking
- Analytics and dashboards
- Web UI
- Mobile UI

## License

See [`LICENSE`](LICENSE).
