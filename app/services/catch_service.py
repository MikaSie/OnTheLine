from sqlalchemy.orm import Session
from app.core.catch_entity import CatchEntity
from app.db.models import CatchModel

UNSET = object()
# Layer that coordinates everything
#  Service currently does this:
# •	receives plain input values
# •	creates a domain Catch
# •	converts that to a CatchModel
# •	saves it in the database
# •	returns a domain Catch


class CatchService:
    def __init__(self, session: Session) -> None:
        self._db = session

    def _to_entity(self, db_catch: CatchModel) -> CatchEntity:
        return CatchEntity(
            catch_id=db_catch.catch_id,
            timestamp=db_catch.timestamp,
            lat=db_catch.lat,
            lon=db_catch.lon,
            species=db_catch.species,
            technique=db_catch.technique,
            notes=db_catch.notes,
        )

    def create_catch(
        self,
        *,
        lat: float,
        lon: float,
        species: str = "",
        technique: str | None = None,
        notes: str | None = None,
    ) -> CatchEntity:

        new_catch = CatchEntity.new(
            lat=lat,
            lon=lon,
            species=species,
            technique=technique,
            notes=notes,
        )

        db_catch = CatchModel(
            catch_id=new_catch.catch_id,
            timestamp=new_catch.timestamp,
            lat=new_catch.lat,
            lon=new_catch.lon,
            species=new_catch.species,
            technique=new_catch.technique,
            notes=new_catch.notes,
        )

        self._db.add(db_catch)
        self._db.commit()

        return new_catch

    def list_catches(self) -> list[CatchEntity]:
        catches = self._db.query(CatchModel).all()
        return [self._to_entity(catch) for catch in catches]

    def get_catch(self, catch_id: str) -> CatchEntity | None:
        catch = (
            self._db.query(CatchModel).filter(CatchModel.catch_id == catch_id).first()
        )
        return self._to_entity(catch) if catch else None

    def update_catch(
        self,
        catch_id: str,
        lat: float | object = UNSET,
        lon: float | object = UNSET,
        species: str | object = UNSET,
        technique: str | None | object = UNSET,
        notes: str | None | object = UNSET,
    ) -> CatchEntity | None:

        old_catch = self._db.get(CatchModel, catch_id)

        if old_catch is None:
            return None

        if lat is UNSET:
            lat = old_catch.lat
        if lon is UNSET:
            lon = old_catch.lon
        if species is UNSET:
            species = old_catch.species
        if technique is UNSET:
            technique = old_catch.technique
        if notes is UNSET:
            notes = old_catch.notes

        validated = CatchEntity.new(
            lat=lat,
            lon=lon,
            species=species,
            technique=technique,
            notes=notes,
            timestamp=old_catch.timestamp,
        )

        old_catch.lat = validated.lat
        old_catch.lon = validated.lon
        old_catch.species = validated.species
        old_catch.technique = validated.technique
        old_catch.notes = validated.notes

        self._db.commit()
        self._db.refresh(old_catch)

        return self._to_entity(old_catch)

    def delete_catch(self, catch_id: str) -> bool:
        catch = self._db.get(CatchModel, catch_id)

        if not catch:
            return False

        self._db.delete(catch)
        self._db.commit()
        return True
