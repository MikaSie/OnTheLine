from app.core.catch import Catch


class CatchService:
    def __init__(self) -> None:
        self._catches: list[Catch] = []

    def create_catch(
        self,
        *,
        lat: float,
        lon: float,
        species: str = "",
        technique: str | None = None,
        notes: str | None = None,
    ) -> Catch:
        new_catch = Catch.new(
            lat=lat,
            lon=lon,
            species=species,
            technique=technique,
            notes=notes,
        )
        self._catches.append(new_catch)
        return new_catch

    def list_catches(self) -> list[Catch]:
        return self._catches

    def get_catch_by_id(self, catch_id: str) -> Catch | None:
        for catch in self._catches:
            if catch.id == catch_id:
                return catch
        return None
