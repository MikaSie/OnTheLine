from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from app.core.reference_data import normalize_method_category, normalize_species


@dataclass(frozen=True)
class CatchEntity:
    catch_id: str
    created_at: datetime
    lat: float
    lon: float
    species: str
    caught_at: datetime
    length_cm: float | None
    method_category: str | None
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
        length_cm: Optional[float] = None,
        method_category: Optional[str] = None,
        technique_detail: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> "CatchEntity":
        # --- Type + basic validation ---
        lat = float(lat)
        lon = float(lon)

        # --- Domain validation ---
        if not -90 <= lat <= 90:
            raise ValueError("Latitude must be between -90 and 90")

        if not -180 <= lon <= 180:
            raise ValueError("Longitude must be between -180 and 180")

        if not isinstance(species, str):
            raise ValueError("Species must be a string")

        if length_cm is not None:
            try:
                length_cm = float(length_cm)
            except (TypeError, ValueError) as exc:
                raise ValueError("length_cm must be a number or None") from exc

        if method_category is not None and not isinstance(method_category, str):
            raise ValueError("method_category must be a string or None")

        if technique_detail is not None and not isinstance(technique_detail, str):
            raise ValueError("technique_detail must be a string or None")

        if notes is not None and not isinstance(notes, str):
            raise ValueError("Notes must be a string or None")

        if length_cm is not None and length_cm <= 0:
            raise ValueError("length_cm must be greater than 0")

        if not species:
            raise ValueError("Species is required")

        species = species.strip()
        species = normalize_species(species)

        method_category = method_category.strip() if method_category else None

        if method_category:
            method_category = normalize_method_category(method_category)

        created_at = created_at or datetime.now(timezone.utc)
        caught_at = caught_at or created_at

        return CatchEntity(
            catch_id=str(uuid4()),
            created_at=created_at,
            lat=lat,
            lon=lon,
            species=species,
            caught_at=caught_at,
            length_cm=length_cm,
            method_category=method_category,
            technique_detail=technique_detail,
            notes=notes,
        )
