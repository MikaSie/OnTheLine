from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional, Any
from uuid import uuid4

# Actual domain concept


@dataclass(frozen=True)
class CatchEntity:
    id: str
    timestamp: datetime
    lat: float
    lon: float
    species: str
    technique: str | None
    notes: str | None

    @staticmethod
    def new(
        *,
        lat: float,
        lon: float,
        species: str = "",
        technique: Optional[str] = None,
        notes: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> "CatchEntity":
        # --- Type + basic validation ---
        lat = float(lat)
        lon = float(lon)

        if not isinstance(species, str):
            raise ValueError("Species must be a string")

        if technique is not None and not isinstance(technique, str):
            raise ValueError("Technique must be a string or None")

        if notes is not None and not isinstance(notes, str):
            raise ValueError("Notes must be a string or None")

        # --- Domain validation ---
        if not -90 <= lat <= 90:
            raise ValueError("Latitude must be between -90 and 90")

        if not -180 <= lon <= 180:
            raise ValueError("Longitude must be between -180 and 180")

        species = species.strip()

        ts = timestamp or datetime.now(timezone.utc)

        return CatchEntity(
            id=str(uuid4()),
            timestamp=ts,
            lat=lat,
            lon=lon,
            species=species,
            technique=technique,
            notes=notes,
        )
