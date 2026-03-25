from dataclasses import dataclass


@dataclass
class CatchCreate:
    lat: float
    lon: float
    species: str = ""
    technique: str | None = None
    notes: str | None = None
