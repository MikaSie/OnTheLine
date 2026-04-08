import pytest
from app.main import create_app
from app.core.catch_entity import CatchEntity
from unittest.mock import MagicMock, patch
from datetime import datetime
from uuid import uuid4


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
        timestamp=datetime.now(),
        lat=52.0,
        lon=4.0,
        species="Seabass",
        technique="Jig",
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
                "technique": "Jig",
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
    assert data["technique"] == "Jig"
    assert data["notes"] == "Nice fish"

    mock_service_instance.create_catch.assert_called_once_with(
        lat=52.0,
        lon=4.0,
        species="Seabass",
        technique="Jig",
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
                "technique": "Jig",
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
                "technique": "Jig",
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
                "technique": "Jig",
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
                "technique": "Jig",
                "notes": "Nice fish",
            },
        )

    assert response.status_code == 400
    assert response.get_json() == {"error": "Invalid catch data"}

    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_service_instance.create_catch.assert_not_called()
    mock_db.close.assert_called_once()


def test_create_catch_returns_400_invalid_technique_type(client):
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
                "technique": 5,
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
                "technique": 5,
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
        timestamp=datetime.now(),
        lat=52.0,
        lon=4.0,
        species="Seabass",
        technique="Jig",
        notes="Nice fish",
    )

    fake_created_catch_2 = CatchEntity.new(
        timestamp=datetime.now(),
        lat=62.0,
        lon=14.0,
        species="Sea trout",
        technique="Spinner",
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
        timestamp=datetime.now(),
        lat=52.0,
        lon=4.0,
        species="Seabass",
        technique="Jig",
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
    assert data["technique"] == fake_created_catch.technique
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
    random_catch_id = str(uuid4)
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
    random_catch_id = str(uuid4)
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
        technique="Jig",
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
                "technique": "Jig",
                "notes": "Updated catch",
            },
        )

    assert response.status_code == 200

    data = response.get_json()
    assert data["catch_id"] == updated_catch.catch_id
    assert data["lat"] == updated_catch.lat
    assert data["lon"] == updated_catch.lon
    assert data["species"] == updated_catch.species
    assert data["technique"] == updated_catch.technique
    assert data["notes"] == updated_catch.notes

    mock_service_instance.update_catch.assert_called_once_with(
        catch_id=updated_catch.catch_id,
        lat=52.0,
        lon=4.0,
        species="Pike",
        technique="Jig",
        notes="Updated catch",
    )
    mock_session.assert_called_once()
    mock_service.assert_called_once_with(session=mock_db)
    mock_db.close.assert_called_once()


def test_update_catch_returns_200_partial_update(client):

    updated_catch = CatchEntity.new(
        timestamp=datetime.now(),
        lat=52.0,
        lon=4.0,
        species="Pike",
        technique="Spinnerbait",
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
                "technique": "Spinnerbait",
                "notes": "Massive take",
            },
        )

    assert response.status_code == 200

    data = response.get_json()
    assert data["catch_id"] == updated_catch.catch_id
    assert data["lat"] == updated_catch.lat
    assert data["lon"] == updated_catch.lon
    assert data["species"] == updated_catch.species
    assert data["technique"] == updated_catch.technique
    assert data["notes"] == updated_catch.notes

    mock_service_instance.update_catch.assert_called_once()
    called_kwargs = mock_service_instance.update_catch.call_args.kwargs
    assert called_kwargs["catch_id"] == updated_catch.catch_id
    assert called_kwargs["technique"] == "Spinnerbait"
    assert called_kwargs["notes"] == "Massive take"

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
                "technique": "Jig",
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
        technique="Jig",
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
                "technique": "Jig",
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
        technique="Jig",
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
                "technique": "Spinnerbait",
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
