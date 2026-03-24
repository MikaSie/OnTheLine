from flask import Flask, request, jsonify
from ontheline_core.catch import Catch

app = Flask(__name__)

catches = []


@app.route("/")
def home():
    return {"message": "Fishing log API is running"}


@app.route("/catches", methods=["POST"])
def create_catch():
    data = request.get_json()

    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    if "lat" not in data or "lon" not in data:
        return jsonify({"error": "Fields 'lat' and 'lon' are required"}), 400

    try:
        new_catch = Catch.new(
            lat=data["lat"],
            lon=data["lon"],
            species=data.get("species", ""),
            technique=data.get("technique"),
            notes=data.get("notes"),
        )
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid value for lat or lon"}), 400

    catches.append(new_catch)

    return jsonify(new_catch.to_dict()), 201


@app.route("/catches", methods=["GET"])
def get_catches():
    return jsonify([c.to_dict() for c in catches])


if __name__ == "__main__":
    app.run(debug=True)
