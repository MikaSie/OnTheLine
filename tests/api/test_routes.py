from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest

from app.core.catch_entity import CatchEntity
from app.main import create_app
from app.services.catch_service import UNSET


@pytest.fixture()
def app():
    app = create_app()
    app.config.update({"TESTING": True})
    yield app


@pytest.fixture()
def client(app):
    return app.test_client()


def test_home_returns_running_message(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.get_json() == {"message": "Fishing log API is running"}


def test_create_catch_returns_201(client):
    fake_created_catch = CatchEntity.new(
        created_at=datetime.now(timezone.utc),
        lat=52.0,
        lon=4.0,
        species="Seabass",
        length_cm=63,
        technique_detail="Jig",
        notes="Nice fish",
    )

    mock_service_instance = MagicMock()
    mock_service_instance.create_catch.return_value = fake_created_catch

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db),
        patch("app.api.routes.CatchService", return_value=mock_service_instance),
    ):
        response = client.post(
            "/catches",
            json={
                "lat": 52.0,
                "lon": 4.0,
                "species": "Seabass",
                "technique_detail": "Jig",
                "notes": "Nice fish",
            },
            content_type="application/json",
        )

    assert response.status_code == 201

    data = response.get_json()
    assert "catch_id" in data
    assert data["lat"] == 52.0
    assert data["lon"] == 4.0
    assert data["species"] == "Seabass"
    assert data["length_cm"] == 63.0
    assert data["technique_detail"] == "Jig"
    assert data["notes"] == "Nice fish"

    mock_service_instance.create_catch.assert_called_once_with(
        lat=52.0,
        lon=4.0,
        species="Seabass",
        caught_at=None,
        length_cm=None,
        technique_detail="Jig",
        notes="Nice fish",
    )
    mock_db.close.assert_called_once()


def test_create_catch_returns_201_through_given_caught_at(client):
    provided_caught_at = datetime(2026, 4, 8, 8, 45, tzinfo=timezone.utc)
    fake_created_catch = CatchEntity.new(
        created_at=datetime.now(timezone.utc),
        lat=52.0,
        lon=4.0,
        species="Seabass",
        caught_at=provided_caught_at,
        technique_detail="Jig",
        notes="Nice fish",
    )

    mock_service_instance = MagicMock()
    mock_service_instance.create_catch.return_value = fake_created_catch

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db),
        patch("app.api.routes.CatchService", return_value=mock_service_instance),
    ):
        response = client.post(
            "/catches",
            json={
                "lat": 52.0,
                "lon": 4.0,
                "species": "Seabass",
                "caught_at": "2026-04-08T08:45:00Z",
                "technique_detail": "Jig",
                "notes": "Nice fish",
            },
            content_type="application/json",
        )

    assert response.status_code == 201

    mock_service_instance.create_catch.assert_called_once()
    called_kwargs = mock_service_instance.create_catch.call_args.kwargs
    assert called_kwargs["lat"] == 52.0
    assert called_kwargs["lon"] == 4.0
    assert called_kwargs["species"] == "Seabass"
    assert called_kwargs["caught_at"].isoformat() == provided_caught_at.isoformat()
    assert called_kwargs["length_cm"] is None
    assert called_kwargs["technique_detail"] == "Jig"
    assert called_kwargs["notes"] == "Nice fish"
    mock_db.close.assert_called_once()


def test_create_catch_returns_201_through_given_length_cm(client):
    fake_created_catch = CatchEntity.new(
        created_at=datetime.now(timezone.utc),
        lat=52.0,
        lon=4.0,
        species="Seabass",
        length_cm=71.5,
        technique_detail="Jig",
        notes="Nice fish",
    )

    mock_service_instance = MagicMock()
    mock_service_instance.create_catch.return_value = fake_created_catch

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db),
        patch("app.api.routes.CatchService", return_value=mock_service_instance),
    ):
        response = client.post(
            "/catches",
            json={
                "lat": 52.0,
                "lon": 4.0,
                "species": "Seabass",
                "length_cm": 71.5,
                "technique_detail": "Jig",
                "notes": "Nice fish",
            },
            content_type="application/json",
        )

    assert response.status_code == 201

    mock_service_instance.create_catch.assert_called_once_with(
        lat=52.0,
        lon=4.0,
        species="Seabass",
        caught_at=None,
        length_cm=71.5,
        technique_detail="Jig",
        notes="Nice fish",
    )
    mock_db.close.assert_called_once()


def test_create_catch_returns_400_invalid_json(client):
    with (
        patch("app.api.routes.SessionLocal") as mock_session,
        patch("app.api.routes.CatchService") as mock_service,
    ):
        response = client.post(
            "/catches",
            data="this is not json",
            content_type="application/json",
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Request body must be valid JSON"}

    mock_session.assert_not_called()
    mock_service.assert_not_called()


def test_create_catch_returns_400_missing_lon(client):
    with (
        patch("app.api.routes.SessionLocal") as mock_session,
        patch("app.api.routes.CatchService") as mock_service,
    ):
        response = client.post(
            "/catches",
            json={
                "lat": 52.0,
                "species": "Seabass",
                "technique_detail": "Jig",
                "notes": "Nice fish",
            },
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Fields 'lat' and 'lon' are required"}

    mock_session.assert_not_called()
    mock_service.assert_not_called()


def test_create_catch_returns_400_missing_lat(client):
    with (
        patch("app.api.routes.SessionLocal") as mock_session,
        patch("app.api.routes.CatchService") as mock_service,
    ):
        response = client.post(
            "/catches",
            json={
                "lon": 4.0,
                "species": "Seabass",
                "technique_detail": "Jig",
                "notes": "Nice fish",
            },
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Fields 'lat' and 'lon' are required"}

    mock_session.assert_not_called()
    mock_service.assert_not_called()


def test_create_catch_returns_400_invalid_float_conversion(client):
    mock_db = MagicMock()
    mock_service_instance = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.post(
            "/catches",
            json={
                "lat": "WRONG",
                "lon": 4.0,
                "species": "Seabass",
                "technique_detail": "Jig",
                "notes": "Nice fish",
            },
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Invalid catch data"}
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_service_instance.create_catch.assert_not_called()
    mock_db.close.assert_called_once()


def test_create_catch_returns_400_invalid_species_type(client):
    mock_db = MagicMock()
    mock_service_instance = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.post(
            "/catches",
            json={
                "lat": 52.0,
                "lon": 4.0,
                "species": 5,
                "technique_detail": "Jig",
                "notes": "Nice fish",
            },
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Invalid catch data"}

    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_service_instance.create_catch.assert_not_called()
    mock_db.close.assert_called_once()


def test_create_catch_returns_400_invalid_technique_detail_type(client):
    mock_db = MagicMock()
    mock_service_instance = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.post(
            "/catches",
            json={
                "lat": 52.0,
                "lon": 4.0,
                "species": "Seabass",
                "technique_detail": 5,
                "notes": "Nice fish",
            },
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Invalid catch data"}

    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_service_instance.create_catch.assert_not_called()
    mock_db.close.assert_called_once()


def test_create_catch_returns_400_invalid_notes_type(client):
    mock_db = MagicMock()
    mock_service_instance = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.post(
            "/catches",
            json={
                "lat": 52.0,
                "lon": 4.0,
                "species": "Seabass",
                "technique_detail": "Jig",
                "notes": 5,
            },
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Invalid catch data"}

    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_service_instance.create_catch.assert_not_called()
    mock_db.close.assert_called_once()


def test_create_catch_returns_400_invalid_length_cm_type(client):
    mock_db = MagicMock()
    mock_service_instance = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.post(
            "/catches",
            json={
                "lat": 52.0,
                "lon": 4.0,
                "species": "Seabass",
                "length_cm": "long",
                "technique_detail": "Jig",
                "notes": "Nice fish",
            },
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Invalid catch data"}

    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_service_instance.create_catch.assert_not_called()
    mock_db.close.assert_called_once()


def test_get_catches_returns_200(client):
    fake_created_catch_1 = CatchEntity.new(
        created_at=datetime.now(timezone.utc),
        lat=52.0,
        lon=4.0,
        species="Seabass",
        technique_detail="Jig",
        notes="Nice fish",
    )

    fake_created_catch_2 = CatchEntity.new(
        created_at=datetime.now(timezone.utc),
        lat=62.0,
        lon=14.0,
        species="Sea trout",
        technique_detail="Spinner",
        notes="Good fight",
    )

    mock_service_instance = MagicMock()
    mock_service_instance.list_catches.return_value = [
        fake_created_catch_1,
        fake_created_catch_2,
    ]

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.get("/catches")

    assert response.status_code == 200

    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 2

    assert data[0]["catch_id"] == fake_created_catch_1.catch_id
    assert data[0]["species"] == "Seabass"

    assert data[1]["catch_id"] == fake_created_catch_2.catch_id
    assert data[1]["species"] == "Sea trout"

    mock_service_instance.list_catches.assert_called_once_with()
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_get_catches_returns_200_empty_list(client):

    mock_service_instance = MagicMock()
    mock_service_instance.list_catches.return_value = []

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.get("/catches")

    assert response.status_code == 200

    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 0

    mock_service_instance.list_catches.assert_called_once_with()
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_get_catch_returns_200(client):
    fake_created_catch = CatchEntity.new(
        created_at=datetime.now(timezone.utc),
        lat=52.0,
        lon=4.0,
        species="Seabass",
        technique_detail="Jig",
        notes="Nice fish",
    )

    mock_service_instance = MagicMock()
    mock_service_instance.get_catch.return_value = fake_created_catch

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.get(f"/catches/{fake_created_catch.catch_id}")

    assert response.status_code == 200

    data = response.get_json()
    assert data["catch_id"] == fake_created_catch.catch_id
    assert data["lat"] == fake_created_catch.lat
    assert data["lon"] == fake_created_catch.lon
    assert data["species"] == fake_created_catch.species
    assert data["technique_detail"] == fake_created_catch.technique_detail
    assert data["notes"] == fake_created_catch.notes

    mock_service_instance.get_catch.assert_called_once_with(fake_created_catch.catch_id)
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_get_catch_returns_404(client):
    random_catch_id = str(uuid4())

    mock_service_instance = MagicMock()
    mock_service_instance.get_catch.return_value = None

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.get(f"/catches/{random_catch_id}")

    assert response.status_code == 404
    assert response.get_json() == {"error": "Catch not found"}

    mock_service_instance.get_catch.assert_called_once_with(random_catch_id)
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_delete_catch_returns_200(client):
    random_catch_id = str(uuid4())
    mock_service_instance = MagicMock()
    mock_service_instance.delete_catch.return_value = True

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.delete(f"/catches/{random_catch_id}")

    assert response.status_code == 200
    assert response.get_json() == {"success": True}

    mock_service_instance.delete_catch.assert_called_once_with(random_catch_id)
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_delete_catch_returns_404(client):
    random_catch_id = str(uuid4())
    mock_service_instance = MagicMock()
    mock_service_instance.delete_catch.return_value = False

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.delete(f"/catches/{random_catch_id}")

    assert response.status_code == 404
    assert response.get_json() == {"error": "Catch not found"}

    mock_service_instance.delete_catch.assert_called_once_with(random_catch_id)
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_update_catch_returns_200(client):
    updated_catch = CatchEntity.new(
        lat=52.0,
        lon=4.0,
        species="Pike",
        length_cm=83,
        technique_detail="Jig",
        notes="Updated catch",
    )

    mock_service_instance = MagicMock()
    mock_service_instance.update_catch.return_value = updated_catch

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.put(
            f"/catches/{updated_catch.catch_id}",
            json={
                "lat": 52.0,
                "lon": 4.0,
                "species": "Pike",
                "technique_detail": "Jig",
                "notes": "Updated catch",
            },
        )

    assert response.status_code == 200

    data = response.get_json()
    assert data["catch_id"] == updated_catch.catch_id
    assert data["lat"] == updated_catch.lat
    assert data["lon"] == updated_catch.lon
    assert data["species"] == updated_catch.species
    assert data["length_cm"] == updated_catch.length_cm
    assert data["technique_detail"] == updated_catch.technique_detail
    assert data["notes"] == updated_catch.notes

    mock_service_instance.update_catch.assert_called_once_with(
        catch_id=updated_catch.catch_id,
        lat=52.0,
        lon=4.0,
        species="Pike",
        caught_at=UNSET,
        length_cm=UNSET,
        technique_detail="Jig",
        notes="Updated catch",
    )
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_update_catch_returns_200_partial_update(client):

    updated_catch = CatchEntity.new(
        created_at=datetime.now(timezone.utc),
        lat=52.0,
        lon=4.0,
        species="Pike",
        technique_detail="Spinnerbait",
        notes="Massive take",
    )

    mock_service_instance = MagicMock()
    mock_service_instance.update_catch.return_value = updated_catch

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.put(
            f"/catches/{updated_catch.catch_id}",
            json={
                "technique_detail": "Spinnerbait",
                "notes": "Massive take",
            },
        )

    assert response.status_code == 200

    data = response.get_json()
    assert data["catch_id"] == updated_catch.catch_id
    assert data["lat"] == updated_catch.lat
    assert data["lon"] == updated_catch.lon
    assert data["species"] == updated_catch.species
    assert data["technique_detail"] == updated_catch.technique_detail
    assert data["notes"] == updated_catch.notes

    mock_service_instance.update_catch.assert_called_once()
    called_kwargs = mock_service_instance.update_catch.call_args.kwargs
    assert called_kwargs["catch_id"] == updated_catch.catch_id
    assert called_kwargs["caught_at"] == UNSET
    assert called_kwargs["technique_detail"] == "Spinnerbait"
    assert called_kwargs["notes"] == "Massive take"

    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_update_catch_passes_through_given_length_cm(client):
    updated_catch = CatchEntity.new(
        lat=52.0,
        lon=4.0,
        species="Pike",
        length_cm=68.5,
        technique_detail="Jig",
        notes="Updated catch",
    )

    mock_service_instance = MagicMock()
    mock_service_instance.update_catch.return_value = updated_catch

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.put(
            f"/catches/{updated_catch.catch_id}",
            json={"length_cm": 68.5},
        )

    assert response.status_code == 200

    mock_service_instance.update_catch.assert_called_once_with(
        catch_id=updated_catch.catch_id,
        lat=UNSET,
        lon=UNSET,
        species=UNSET,
        caught_at=UNSET,
        length_cm=68.5,
        technique_detail=UNSET,
        notes=UNSET,
    )
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_update_catch_passes_through_given_caught_at(client):
    updated_catch = CatchEntity.new(
        lat=52.0,
        lon=4.0,
        species="Pike",
        caught_at=datetime(2026, 4, 9, 6, 30, tzinfo=timezone.utc),
        technique_detail="Jig",
        notes="Updated catch",
    )

    mock_service_instance = MagicMock()
    mock_service_instance.update_catch.return_value = updated_catch

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.put(
            f"/catches/{updated_catch.catch_id}",
            json={"caught_at": "2026-04-09T06:30:00Z"},
        )

    assert response.status_code == 200

    mock_service_instance.update_catch.assert_called_once()
    called_kwargs = mock_service_instance.update_catch.call_args.kwargs
    assert called_kwargs["catch_id"] == updated_catch.catch_id
    assert called_kwargs["lat"] is UNSET
    assert called_kwargs["lon"] is UNSET
    assert called_kwargs["species"] is UNSET
    assert called_kwargs["caught_at"].isoformat() == "2026-04-09T06:30:00+00:00"
    assert called_kwargs["length_cm"] is UNSET
    assert called_kwargs["technique_detail"] is UNSET
    assert called_kwargs["notes"] is UNSET
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_update_catch_returns_400_invalid_json(client):
    random_catch_id = str(uuid4())

    with (
        patch("app.api.routes.SessionLocal") as mock_session,
        patch("app.api.routes.CatchService") as mock_service,
    ):
        response = client.put(
            f"/catches/{random_catch_id}",
            json=None,
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Request body must be valid JSON"}

    mock_session.assert_not_called()
    mock_service.assert_not_called()


def test_update_catch_returns_404_not_found(client):
    random_catch_id = str(uuid4())

    mock_service_instance = MagicMock()
    mock_service_instance.update_catch.return_value = None

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.put(
            f"/catches/{random_catch_id}",
            json={
                "lat": 52.0,
                "lon": 4.0,
                "species": "Pike",
                "technique_detail": "Jig",
                "notes": "Updated catch",
            },
        )

    assert response.status_code == 404
    assert response.get_json() == {"error": "Catch not found"}

    mock_service_instance.update_catch.assert_called_once_with(
        catch_id=random_catch_id,
        lat=52.0,
        lon=4.0,
        species="Pike",
        caught_at=UNSET,
        length_cm=UNSET,
        technique_detail="Jig",
        notes="Updated catch",
    )
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_update_catch_returns_400_value_error(client):
    random_catch_id = str(uuid4())

    mock_service_instance = MagicMock()
    mock_service_instance.update_catch.side_effect = ValueError("Invalid catch data")

    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.put(
            f"/catches/{random_catch_id}",
            json={
                "lat": 52.0,
                "lon": 4.0,
                "species": "Pike",
                "technique_detail": "Jig",
                "notes": "Updated catch",
            },
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Invalid catch data"}

    mock_service_instance.update_catch.assert_called_once_with(
        catch_id=random_catch_id,
        lat=52.0,
        lon=4.0,
        species="Pike",
        caught_at=UNSET,
        length_cm=UNSET,
        technique_detail="Jig",
        notes="Updated catch",
    )
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_update_catch_returns_400_invalid_lat_value(client):
    random_catch_id = str(uuid4())

    mock_service_instance = MagicMock()
    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.put(
            f"/catches/{random_catch_id}",
            json={
                "lat": "WRONG",
                "technique_detail": "Spinnerbait",
            },
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Invalid catch data"}

    mock_service_instance.update_catch.assert_not_called()
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_update_catch_returns_400_invalid_lon_value(client):
    random_catch_id = str(uuid4())

    mock_service_instance = MagicMock()
    mock_db = MagicMock()

    with (
        patch("app.api.routes.SessionLocal", return_value=mock_db) as mock_session,
        patch(
            "app.api.routes.CatchService", return_value=mock_service_instance
        ) as mock_service,
    ):
        response = client.put(
            f"/catches/{random_catch_id}",
            json={
                "lon": "WRONG",
                "notes": "Updated note",
            },
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Invalid catch data"}

    mock_service_instance.update_catch.assert_not_called()
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()
