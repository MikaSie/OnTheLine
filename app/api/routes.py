from flask import Blueprint, jsonify, request

from app.schemas.catch import CatchCreate
from app.services.catch_service import CatchService

routes = Blueprint("routes", __name__)
catch_service = CatchService()


@routes.route("/")
def home():
    return {"message": "Fishing log API is running"}


@routes.route("/catches", methods=["POST"])
def create_catch():
    data = request.get_json()

    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    if "lat" not in data or "lon" not in data:
        return jsonify({"error": "Fields 'lat' and 'lon' are required"}), 400

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
    except (TypeError, ValueError) as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(new_catch.to_dict()), 201


@routes.route("/catches", methods=["GET"])
def get_catches():
    catches = catch_service.list_catches()
    return jsonify([catch.to_dict() for catch in catches])


@routes.route("/catches/<catch_id>", methods=["GET"])
def get_catch(catch_id: str):
    catch = catch_service.get_catch_by_id(catch_id)

    if catch is None:
        return jsonify({"error": "Catch not found"}), 404

    return jsonify(catch.to_dict()), 200
