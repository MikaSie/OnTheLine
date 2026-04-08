import pytest
from datetime import datetime, timezone
from app.core.catch_entity import CatchEntity


def test_create_catch_with_valid_input():
    catch = CatchEntity.new(
        lat=52.0,
        lon=4.0,
        species="Sea Trout",
        technique="Spinning",
        notes="Caught near rocks",
    )

    assert isinstance(catch, CatchEntity)
    assert catch.lat == 52.0
    assert catch.lon == 4.0
    assert catch.species == "Sea Trout"
    assert catch.technique == "Spinning"
    assert catch.notes == "Caught near rocks"
    assert isinstance(catch.catch_id, str)


def test_create_catch_uses_given_timestamp():
    fixed_time = datetime(2026, 4, 8, 10, 0, tzinfo=timezone.utc)

    catch = CatchEntity.new(
        lat=52.0,
        lon=4.0,
        timestamp=fixed_time,
    )

    assert catch.timestamp == fixed_time


def test_create_timestamp_when_omitted():
    catch = CatchEntity.new(
        lat=52.0,
        lon=4.0,
    )

    assert isinstance(catch.timestamp, datetime)


def test_convert_lat_lon_to_float():
    catch = CatchEntity.new(
        lat=52,
        lon=4,
    )

    assert isinstance(catch.lat, float)
    assert isinstance(catch.lon, float)
    assert catch.lat == 52.0
    assert catch.lon == 4.0


def test_species_is_stripped():
    catch = CatchEntity.new(
        lat=52.0,
        lon=4.0,
        species="Sea Trout  ",
    )

    assert catch.species == "Sea Trout"


def test_latitude_accepts_boundary_values():
    catch_min = CatchEntity.new(lat=-90, lon=4.0)
    catch_max = CatchEntity.new(lat=90, lon=4.0)

    assert catch_min.lat == -90.0
    assert catch_max.lat == 90.0


def test_latitude_below_range_raises_error():
    with pytest.raises(ValueError, match="Latitude must be between -90 and 90"):
        CatchEntity.new(
            lat=-100,
            lon=4.0,
        )


def test_latitude_above_range_raises_error():
    with pytest.raises(ValueError, match="Latitude must be between -90 and 90"):
        CatchEntity.new(
            lat=100,
            lon=4.0,
        )


def test_longitude_accepts_boundary_values():
    catch_min = CatchEntity.new(lat=52.0, lon=-180)
    catch_max = CatchEntity.new(lat=52.0, lon=180)

    assert catch_min.lon == -180.0
    assert catch_max.lon == 180.0


def test_longitude_below_range_raises_error():
    with pytest.raises(ValueError, match="Longitude must be between -180 and 180"):
        CatchEntity.new(
            lat=52.0,
            lon=-190.0,
        )


def test_longitude_above_range_raises_error():
    with pytest.raises(ValueError, match="Longitude must be between -180 and 180"):
        CatchEntity.new(
            lat=52.0,
            lon=190.0,
        )


def test_species_must_be_string():
    with pytest.raises(ValueError, match="Species must be a string"):
        CatchEntity.new(
            lat=52.0,
            lon=4.0,
            species=123,
        )


def test_technique_must_be_string_or_none():
    with pytest.raises(ValueError, match="Technique must be a string or None"):
        CatchEntity.new(
            lat=52.0,
            lon=4.0,
            technique=123,
        )


def test_technique_can_be_none():
    catch = CatchEntity.new(
        lat=52.0,
        lon=4.0,
        technique=None,
    )

    assert catch.technique is None


def test_notes_must_be_string_or_none():
    with pytest.raises(ValueError, match="Notes must be a string or None"):
        CatchEntity.new(
            lat=52.0,
            lon=4.0,
            notes=123,
        )


def test_notes_can_be_none():
    catch = CatchEntity.new(
        lat=52.0,
        lon=4.0,
        notes=None,
    )

    assert catch.notes is None
