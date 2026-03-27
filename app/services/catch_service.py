from sqlalchemy.orm import Session
from app.core.catch_entity import CatchEntity
from app.db.models import CatchModel

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
            id=db_catch.id,
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
            id=new_catch.id,
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
        catch = self._db.query(CatchModel).filter(CatchModel.id == catch_id).first()
        return self._to_entity(catch) if catch else None

    def update_catch(
        self,
        catch_id: str,
        lat: float,
        lon: float,
        species: str = "",
        technique: str | None = None,
        notes: str | None = None,
    ) -> CatchEntity | None:
        catch = self._db.get(CatchModel, catch_id)

        if catch_id is None:
            return None

        catch.lat = lat
        catch.lon = lon
        catch.species = species
        catch.technique = technique
        catch.notes = notes

        self._db.commit()
        self._db.refresh(catch)

        return self._to_entity(catch)

    def delete_catch(self, catch_id: str) -> bool:
        catch = self._db.get(CatchModel, catch_id)

        if not catch:
            return False

        self._db.delete(catch)
        self._db.commit()
        return True
