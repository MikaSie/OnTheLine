from dataclasses import dataclass
from datetime import datetime


@dataclass
class catch:
    id: str
    timestamp: datetime
    lat: float
    lon: float
    species: str
    technique: str | None
    notes: str | None
    gear: dict | None
