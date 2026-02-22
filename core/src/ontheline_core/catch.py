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


if __name__ == "__main__":
    print(
        catch(
            "10102", datetime.now(), 1.14, 0.14, "perch", "carolina-rig", "Fun catch!"
        )
    )
