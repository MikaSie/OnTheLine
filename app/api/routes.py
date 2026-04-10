from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from app.core.reference_data import SPECIES_OPTIONS
from app.db.session import SessionLocal
from app.schemas.catch_schema import CatchCreate, CatchRead, CatchUpdate
from app.services.catch_service import UNSET, CatchService

routes = Blueprint("routes", __name__)


@routes.route("/")
def home():
    return {"message": "Fishing log API is running"}


@routes.route("/reference-data/species", methods=["GET"])
def get_species_options():
    return jsonify(SPECIES_OPTIONS), 200


@routes.route("/catches", methods=["POST"])
def create_catch():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    if "lat" not in data or "lon" not in data:
        return jsonify({"error": "Fields 'lat' and 'lon' are required"}), 400

    if "species" not in data:
        return jsonify({"error": "Field 'species' is required"}), 400

    db = SessionLocal()
    catch_service = CatchService(session=db)

    try:
        catch_input = CatchCreate(
            lat=float(data["lat"]),
            lon=float(data["lon"]),
            species=data.get("species"),
            caught_at=data.get("caught_at"),
            length_cm=data.get("length_cm"),
            technique_detail=data.get("technique_detail"),
            notes=data.get("notes"),
        )

        new_catch = catch_service.create_catch(
            lat=catch_input.lat,
            lon=catch_input.lon,
            species=catch_input.species,
            caught_at=catch_input.caught_at,
            length_cm=catch_input.length_cm,
            technique_detail=catch_input.technique_detail,
            notes=catch_input.notes,
        )

        catch_read = CatchRead.model_validate(new_catch)
        return jsonify(catch_read.model_dump()), 201

    except (TypeError, ValueError, ValidationError):
        return jsonify({"error": "Invalid catch data"}), 400

    finally:
        db.close()


@routes.route("/catches", methods=["GET"])
def get_catches():
    db = SessionLocal()
    catch_service = CatchService(session=db)

    try:
        catches = catch_service.list_catches()
        catch_reads = [CatchRead.model_validate(catch) for catch in catches]
        return jsonify([catch_read.model_dump() for catch_read in catch_reads])

    finally:
        db.close()


@routes.route("/catches/<catch_id>", methods=["GET"])
def get_catch(catch_id: str):
    db = SessionLocal()
    catch_service = CatchService(session=db)

    try:
        catch = catch_service.get_catch(catch_id)

        if catch is None:
            return jsonify({"error": "Catch not found"}), 404

        catch_read = CatchRead.model_validate(catch)
        return jsonify(catch_read.model_dump()), 200
    finally:
        db.close()


@routes.route("/catches/<catch_id>", methods=["DELETE"])
def delete_catch(catch_id: str):
    db = SessionLocal()
    catch_service = CatchService(session=db)

    try:
        success = catch_service.delete_catch(catch_id)

        if success is False:
            return jsonify({"error": "Catch not found"}), 404

        return {"success": True}, 200
    finally:
        db.close()


@routes.route("/catches/<catch_id>", methods=["PUT"])
def update_catch(catch_id: str):
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    db = SessionLocal()
    catch_service = CatchService(session=db)

    try:
        update_input = CatchUpdate.model_validate(data)

        updated_catch = catch_service.update_catch(
            catch_id=catch_id,
            lat=update_input.lat if "lat" in data else UNSET,
            lon=update_input.lon if "lon" in data else UNSET,
            species=update_input.species if "species" in data else UNSET,
            caught_at=update_input.caught_at if "caught_at" in data else UNSET,
            length_cm=update_input.length_cm if "length_cm" in data else UNSET,
            technique_detail=update_input.technique_detail
            if "technique_detail" in data
            else UNSET,
            notes=update_input.notes if "notes" in data else UNSET,
        )

        if updated_catch is None:
            return jsonify({"error": "Catch not found"}), 404

        catch_read = CatchRead.model_validate(updated_catch)
        return jsonify(catch_read.model_dump()), 200

    except (TypeError, ValueError, ValidationError):
        return jsonify({"error": "Invalid catch data"}), 400
    finally:
        db.close()
