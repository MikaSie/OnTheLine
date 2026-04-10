from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

# Actual domain concept


@dataclass(frozen=True)
class CatchEntity:
    catch_id: str
    created_at: datetime
    lat: float
    lon: float
    species: str
    caught_at: datetime
    technique_detail: str | None
    notes: str | None

    @staticmethod
    def new(
        *,
        lat: float,
        lon: float,
        species: str = "",
        created_at: Optional[datetime] = None,
        caught_at: Optional[datetime] = None,
        technique_detail: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> "CatchEntity":
        # --- Type + basic validation ---
        lat = float(lat)
        lon = float(lon)

        if not isinstance(species, str):
            raise ValueError("Species must be a string")

        if technique_detail is not None and not isinstance(technique_detail, str):
            raise ValueError("technique_detail must be a string or None")

        if notes is not None and not isinstance(notes, str):
            raise ValueError("Notes must be a string or None")

        # --- Domain validation ---
        if not -90 <= lat <= 90:
            raise ValueError("Latitude must be between -90 and 90")

        if not -180 <= lon <= 180:
            raise ValueError("Longitude must be between -180 and 180")

        species = species.strip()

        created_at = created_at or datetime.now(timezone.utc)
        caught_at = caught_at or created_at

        return CatchEntity(
            catch_id=str(uuid4()),
            created_at=created_at,
            lat=lat,
            lon=lon,
            species=species,
            caught_at=caught_at,
            technique_detail=technique_detail,
            notes=notes,
        )
