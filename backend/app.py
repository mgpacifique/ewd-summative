import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="../frontend", static_url_path="/")
# Enable CORS for all routes so the frontend can interact with it
CORS(app)

@app.route("/")
def index():
    # Serves the main frontend dashboard.
    return app.send_static_file("index.html")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in .env")

engine = create_engine(DATABASE_URL)

@app.route("/api/zones", methods=["GET"])
def get_zones():
    # Returns spatial boundaries of taxi zones in GeoJSON format.
    query = """
    SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
    ) as geojson
    FROM (
        SELECT zone_id, borough_name, zone_title, service_zone_type, map_boundary 
        FROM nyc_taxi_zones
    ) as t;
    """
    with engine.connect() as conn:
        result = conn.execute(text(query)).fetchone()
        if result and result[0]:
            return jsonify(result[0])
        return jsonify({"type": "FeatureCollection", "features": []})

@app.route("/api/trips", methods=["GET"])
def get_trips():
    """Returns trip records with optional filtering and sorting."""
    limit = request.args.get("limit", 15, type=int)
    sort = request.args.get("sort", "trip_miles")
    borough = request.args.get("borough", None)

    allowed_sorts = {
        "trip_miles", "duration_in_seconds", "calculated_speed_mph", "tip_to_fare_ratio"
    }
    if sort not in allowed_sorts:
        sort = "trip_miles"

    query = f"""
    SELECT 
        t.pickup_zone_id, t.dropoff_zone_id, t.trip_miles, 
        t.duration_in_seconds, t.calculated_speed_mph, t.tip_to_fare_ratio,
        z.borough_name
    FROM high_volume_trips t
    JOIN nyc_taxi_zones z ON t.pickup_zone_id = z.zone_id
    """
    
    params = {"limit": limit}
    if borough and borough.strip() != "":
        query += " WHERE z.borough_name = :borough"
        params["borough"] = borough

    # Safe dynamic sort injection since we validated against allowed_sorts
    query += f" ORDER BY t.{sort} DESC LIMIT :limit"

    with engine.connect() as conn:
        result = conn.execute(text(query), params)
        trips = [dict(row._mapping) for row in result]
        return jsonify(trips)

@app.route("/api/stats/speed-vs-tip", methods=["GET"])
def get_speed_vs_tip():
    query = """
    SELECT calculated_speed_mph as speed, tip_to_fare_ratio as tip
    FROM high_volume_trips TABLESAMPLE SYSTEM(1)
    WHERE calculated_speed_mph IS NOT NULL AND tip_to_fare_ratio IS NOT NULL
    LIMIT 500;
    """
    with engine.connect() as conn:
        result = conn.execute(text(query))
        data = [dict(row._mapping) for row in result]
        return jsonify(data)

@app.route("/api/stats/speed-by-borough", methods=["GET"])
def get_speed_by_borough():
    # Hypothesis B: Average travel speeds differ significantly depending on the Borough.
    # Returns the average speed grouped by the pickup borough.
    query = """
    SELECT z.borough_name as borough, ROUND(AVG(t.calculated_speed_mph), 2) as avg_speed
    FROM high_volume_trips t
    JOIN nyc_taxi_zones z ON t.pickup_zone_id = z.zone_id
    WHERE t.calculated_speed_mph IS NOT NULL
    GROUP BY z.borough_name
    ORDER BY avg_speed DESC;
    """
    with engine.connect() as conn:
        result = conn.execute(text(query))
        data = [dict(row._mapping) for row in result]
        return jsonify(data)

if __name__ == "__main__":
    # The frontend expects the backend on port 5000 by default
    app.run(host="127.0.0.1", port=5000, debug=True)
