CREATE EXTENSION IF NOT EXISTS postgis;

DROP TABLE IF EXISTS high_volume_trips;
DROP TABLE IF EXISTS nyc_taxi_zones;

CREATE TABLE nyc_taxi_zones (
    zone_id INT PRIMARY KEY,
    borough_name VARCHAR(30) NOT NULL,
    zone_title VARCHAR(100) NOT NULL,
    service_zone_type VARCHAR(40),
    map_boundary GEOMETRY(Geometry, 4326)
);

