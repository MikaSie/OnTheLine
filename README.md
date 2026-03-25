# OnTheLine

OnTheLine is a fishing tool created for fishermen by fishermen to track catches and perform data analysis on shared data!

<p align="center">
  <img src="docs/media/OnTheLine_Logo_no_bg.png" width="250">
</p>
## Structure

OnTheLine/
├── app/
│   ├── api/
│   │   └── routes.py                   # HTTP endpoints (Flask routes)
│   │
│   ├── core/
│   │   ├── catch.py                    # Domain entity (Catch)
│   │   ├── config.py                   # App configuration (env, settings)
│   │   └── logging.py                  # Logging setup
│   │
│   ├── schemas/
│   │   └── catch.py                    # API input/output schemas
│   │
│   ├── services/
│   │   └── catch_service.py            # Application logic (use cases)
│   │
│   ├── repositories/
│   │   └── catch_repository.py         # Data access layer (storage logic)
│   │
│   └── main.py                         # App factory & startup
│
├── docs/
│       └── OnTheLine_Logo_no_bg.png    #Logo
├── scripts/                            # (future) scripts
├── tests/                              # (future) unit & integration tests
├── LICENSE                             # License
├── pyproject.toml                      # Project dependencies
├── uv.lock                             # Dependency lock file
└── README.md
