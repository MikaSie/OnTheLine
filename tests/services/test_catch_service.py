from datetime import datetime, timezone

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.catch_entity import CatchEntity
from app.db.models import Base, CatchModel
from app.services.catch_service import CatchService


def as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


@pytest.fixture
def session():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def service(session):
    return CatchService(session=session)


def test_create_catch_stores_and_returns_entity(service, session):
    catch = service.create_catch(
        lat=52.0,
        lon=4.0,
        species="Sea Trout",
        technique_detail="Spinning",
        notes="Caught near rocks",
    )

    assert isinstance(catch, CatchEntity)
    assert catch.lat == 52.0
    assert catch.lon == 4.0
    assert catch.species == "Sea Trout"
    assert catch.technique_detail == "Spinning"
    assert catch.notes == "Caught near rocks"

    db_catch = session.get(CatchModel, catch.catch_id)
    assert db_catch is not None
    assert db_catch.catch_id == catch.catch_id
    assert db_catch.lat == 52.0
    assert db_catch.lon == 4.0
    assert db_catch.species == "Sea Trout"
    assert as_utc(db_catch.caught_at) == catch.caught_at
    assert db_catch.technique_detail == "Spinning"
    assert db_catch.notes == "Caught near rocks"


def test_create_catch_defaults_caught_at_to_created_at(service, session):
    catch = service.create_catch(
        lat=52.0,
        lon=4.0,
        species="Sea Trout",
    )

    assert catch.caught_at == catch.created_at

    db_catch = session.get(CatchModel, catch.catch_id)
    assert db_catch is not None
    assert as_utc(db_catch.caught_at) == as_utc(db_catch.created_at)


def test_create_catch_uses_given_caught_at(service, session):
    fixed_caught_at = datetime(2026, 4, 8, 8, 45, tzinfo=timezone.utc)

    catch = service.create_catch(
        lat=52.0,
        lon=4.0,
        species="Sea Trout",
        caught_at=fixed_caught_at,
    )

    assert catch.caught_at == fixed_caught_at

    db_catch = session.get(CatchModel, catch.catch_id)
    assert db_catch is not None
    assert as_utc(db_catch.caught_at) == fixed_caught_at


def test_create_catch_propagates_entity_validation_errors(service):
    with pytest.raises(ValueError, match="Latitude must be between -90 and 90"):
        service.create_catch(
            lat=100.0,
            lon=4.0,
        )


def test_list_catches_returns_all_catches(service):
    first = service.create_catch(
        lat=52.0,
        lon=4.0,
        species="Sea Trout",
    )
    second = service.create_catch(
        lat=53.0,
        lon=5.0,
        species="Bass",
    )

    catches = service.list_catches()

    assert len(catches) == 2
    assert all(isinstance(catch, CatchEntity) for catch in catches)

    catch_ids = [catch.catch_id for catch in catches]
    assert first.catch_id in catch_ids
    assert second.catch_id in catch_ids


def test_get_catch_returns_existing_catch(service):
    created = service.create_catch(
        lat=52.0,
        lon=4.0,
        species="Sea Trout",
        technique_detail="Spinning",
        notes="Morning fish",
    )

    found = service.get_catch(created.catch_id)

    assert found is not None
    assert isinstance(found, CatchEntity)
    assert found.catch_id == created.catch_id
    assert found.lat == created.lat
    assert found.lon == created.lon
    assert found.species == created.species
    assert found.technique_detail == created.technique_detail
    assert found.notes == created.notes


def test_get_catch_returns_none_when_missing(service):
    found = service.get_catch("does-not-exist")

    assert found is None


def test_update_catch_updates_existing_catch(service, session):
    created = service.create_catch(
        lat=52.0,
        lon=4.0,
        species="Sea Trout",
        technique_detail="Spinning",
        notes="Morning fish",
    )

    updated = service.update_catch(
        catch_id=created.catch_id,
        lat=40.0,
        lon=10.0,
        species="GT",
        technique_detail="Popping",
        notes="Updated notes",
    )

    assert updated is not None
    assert isinstance(updated, CatchEntity)
    assert updated.catch_id == created.catch_id
    assert updated.lat == 40.0
    assert updated.lon == 10.0
    assert updated.species == "GT"
    assert updated.technique_detail == "Popping"
    assert updated.notes == "Updated notes"
    assert updated.caught_at == created.caught_at

    db_catch = session.get(CatchModel, created.catch_id)
    assert db_catch is not None
    assert db_catch.lat == 40.0
    assert db_catch.lon == 10.0
    assert db_catch.species == "GT"
    assert db_catch.technique_detail == "Popping"
    assert db_catch.notes == "Updated notes"


def test_update_catch_can_update_caught_at(service, session):
    created = service.create_catch(
        lat=52.0,
        lon=4.0,
        species="Sea Trout",
    )
    new_caught_at = datetime(2026, 4, 9, 6, 30, tzinfo=timezone.utc)

    updated = service.update_catch(
        catch_id=created.catch_id,
        caught_at=new_caught_at,
    )

    assert updated is not None
    assert updated.created_at == created.created_at
    assert updated.caught_at == new_caught_at

    db_catch = session.get(CatchModel, created.catch_id)
    assert db_catch is not None
    assert as_utc(db_catch.created_at) == created.created_at
    assert as_utc(db_catch.caught_at) == new_caught_at


def test_update_catch_can_update_only_species(service, session):
    created = service.create_catch(
        lat=52.0,
        lon=4.0,
        species="Sea Trout",
        technique_detail="Spinning",
        notes="Morning fish",
    )

    updated = service.update_catch(
        catch_id=created.catch_id,
        species="Sea Bass",
    )

    assert updated is not None
    assert isinstance(updated, CatchEntity)
    assert updated.catch_id == created.catch_id
    assert updated.lat == 52.0
    assert updated.lon == 4.0
    assert updated.species == "Sea Bass"
    assert updated.technique_detail == "Spinning"
    assert updated.notes == "Morning fish"

    db_catch = session.get(CatchModel, created.catch_id)
    assert db_catch is not None
    assert db_catch.lat == 52.0
    assert db_catch.lon == 4.0
    assert db_catch.species == "Sea Bass"
    assert db_catch.technique_detail == "Spinning"
    assert db_catch.notes == "Morning fish"


def test_update_catch_returns_none_when_missing(service):
    updated = service.update_catch(
        catch_id="does-not-exist",
        lat=40.0,
        lon=10.0,
        species="GT",
        technique_detail="Popping",
        notes="Updated notes",
    )

    assert updated is None


def test_delete_catch_removes_existing_catch(service, session):
    created = service.create_catch(
        lat=52.0,
        lon=4.0,
        species="Sea Trout",
    )

    deleted = service.delete_catch(created.catch_id)

    assert deleted is True
    assert session.get(CatchModel, created.catch_id) is None
    assert service.get_catch(created.catch_id) is None


def test_delete_catch_returns_false_when_missing(service):
    deleted = service.delete_catch("does-not-exist")

    assert deleted is False


def test_update_catch_should_reject_invalid_latitude(service):
    created = service.create_catch(lat=52.0, lon=4.0)

    with pytest.raises(ValueError):
        service.update_catch(
            catch_id=created.catch_id,
            lat=100.0,
            lon=4.0,
        )
