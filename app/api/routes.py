from flask import Blueprint, jsonify, request

from app.db.session import SessionLocal
from app.schemas.catch_schema import CatchCreate, CatchRead
from app.services.catch_service import UNSET, CatchService

routes = Blueprint("routes", __name__)


@routes.route("/")
def home():
    return {"message": "Fishing log API is running"}


@routes.route("/catches", methods=["POST"])
def create_catch():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    if "lat" not in data or "lon" not in data:
        return jsonify({"error": "Fields 'lat' and 'lon' are required"}), 400

    db = SessionLocal()
    catch_service = CatchService(session=db)

    try:
        catch_input = CatchCreate(
            lat=float(data["lat"]),
            lon=float(data["lon"]),
            species=data.get("species", ""),
            technique=data.get("technique"),
            notes=data.get("notes"),
        )

        new_catch = catch_service.create_catch(
            lat=catch_input.lat,
            lon=catch_input.lon,
            species=catch_input.species,
            technique=catch_input.technique,
            notes=catch_input.notes,
        )

        catch_read = CatchRead.model_validate(new_catch)
        return jsonify(catch_read.model_dump()), 201

    except (TypeError, ValueError):
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
        updated_catch = catch_service.update_catch(
            catch_id=catch_id,
            lat=float(data["lat"]) if "lat" in data else UNSET,
            lon=float(data["lon"]) if "lon" in data else UNSET,
            species=data["species"] if "species" in data else UNSET,
            technique=data["technique"] if "technique" in data else UNSET,
            notes=data["notes"] if "notes" in data else UNSET,
        )

        if updated_catch is None:
            return jsonify({"error": "Catch not found"}), 404

        catch_read = CatchRead.model_validate(updated_catch)
        return jsonify(catch_read.model_dump()), 200

    except (TypeError, ValueError):
        return jsonify({"error": "Invalid catch data"}), 400
    finally:
        db.close()
