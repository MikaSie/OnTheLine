from datetime import datetime, timezone

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

    def _ensure_utc(self, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value

    def _to_entity(self, db_catch: CatchModel) -> CatchEntity:
        return CatchEntity(
            catch_id=db_catch.catch_id,
            created_at=self._ensure_utc(db_catch.created_at),
            lat=db_catch.lat,
            lon=db_catch.lon,
            species=db_catch.species,
            caught_at=self._ensure_utc(db_catch.caught_at),
            length_cm=db_catch.length_cm,
            method_category=db_catch.method_category,
            technique_detail=db_catch.technique_detail,
            depth_m=db_catch.depth_m,
            notes=db_catch.notes,
        )

    def create_catch(
        self,
        *,
        lat: float,
        lon: float,
        species: str = "",
        caught_at: datetime | None = None,
        length_cm: float | None = None,
        method_category: str | None = None,
        technique_detail: str | None = None,
        depth_m: float | None = None,
        notes: str | None = None,
    ) -> CatchEntity:

        new_catch = CatchEntity.new(
            lat=lat,
            lon=lon,
            species=species,
            caught_at=caught_at,
            length_cm=length_cm,
            method_category=method_category,
            technique_detail=technique_detail,
            depth_m=depth_m,
            notes=notes,
        )

        db_catch = CatchModel(
            catch_id=new_catch.catch_id,
            created_at=new_catch.created_at,
            lat=new_catch.lat,
            lon=new_catch.lon,
            species=new_catch.species,
            caught_at=new_catch.caught_at,
            length_cm=new_catch.length_cm,
            method_category=new_catch.method_category,
            technique_detail=new_catch.technique_detail,
            depth_m=new_catch.depth_m,
            notes=new_catch.notes,
        )

        self._db.add(db_catch)
        self._db.commit()

        return new_catch

    def list_catches(self) -> list[CatchEntity]:
        catches = self._db.query(CatchModel).all()
        return [self._to_entity(catch) for catch in catches]

    def get_catch(self, catch_id: str) -> CatchEntity | None:
        catch = self._db.query(CatchModel).filter(CatchModel.catch_id == catch_id).first()
        return self._to_entity(catch) if catch else None

    def update_catch(
        self,
        catch_id: str,
        lat: float | object = UNSET,
        lon: float | object = UNSET,
        species: str | object = UNSET,
        caught_at: datetime | None | object = UNSET,
        length_cm: float | None | object = UNSET,
        method_category: str | None | object = UNSET,
        technique_detail: str | None | object = UNSET,
        depth_m: float | None | object = UNSET,
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
        if caught_at is UNSET:
            caught_at = old_catch.caught_at
        if length_cm is UNSET:
            length_cm = old_catch.length_cm
        if method_category is UNSET:
            method_category = old_catch.method_category
        if technique_detail is UNSET:
            technique_detail = old_catch.technique_detail
        if depth_m is UNSET:
            depth_m = old_catch.depth_m
        if notes is UNSET:
            notes = old_catch.notes

        validated = CatchEntity.new(
            lat=lat,
            lon=lon,
            species=species,
            caught_at=caught_at,
            length_cm=length_cm,
            method_category=method_category,
            technique_detail=technique_detail,
            depth_m=depth_m,
            notes=notes,
            created_at=old_catch.created_at,
        )

        old_catch.lat = validated.lat
        old_catch.lon = validated.lon
        old_catch.species = validated.species
        old_catch.caught_at = validated.caught_at
        old_catch.length_cm = validated.length_cm
        old_catch.method_category = validated.method_category
        old_catch.technique_detail = validated.technique_detail
        old_catch.depth_m = validated.depth_m
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
