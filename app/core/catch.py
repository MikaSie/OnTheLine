from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional, Any
from uuid import uuid4


@dataclass(frozen=True)
class Catch:
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
    ) -> "Catch":
        """Create a new Catch with generated id + default timestamp."""
        ts = timestamp or datetime.now(timezone.utc)
        return Catch(
            id=str(uuid4()),
            timestamp=ts,
            lat=float(lat),
            lon=float(lon),
            species=species,
            technique=technique,
            notes=notes,
        )

    def to_dict(self) -> dict[str, Any]:
        """Serialize for JSON responses."""
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "lat": self.lat,
            "lon": self.lon,
            "species": self.species,
            "technique": self.technique,
            "notes": self.notes,
        }


if __name__ == "__main__":
    # Create a new catch
    c = Catch.new(
        lat=-18.2871,
        lon=147.6992,
        species="GT",
        technique="popping",
        notes="Surface explosion at sunrise",
    )

    print("Created Catch:")
    print(c)

    print("\nAs dict:")
    print(c.to_dict())
