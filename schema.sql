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

CREATE TABLE high_volume_trips (
    id BIGSERIAL PRIMARY KEY,
    vendor_type_id INT,
    pickup_time TIMESTAMP NOT NULL,
    dropoff_time TIMESTAMP NOT NULL,
    passenger_count INT,
    trip_miles NUMERIC(8, 2) NOT NULL,
    rate_code INT,
    store_and_forward_flag CHAR(1),
    pickup_zone_id INT NOT NULL,
    dropoff_zone_id INT NOT NULL,
    payment_method_id INT,
    base_fare NUMERIC(8, 2) NOT NULL,
    surcharge_extra NUMERIC(8, 2) DEFAULT 0.00,
    mta_tax_amount NUMERIC(8, 2) DEFAULT 0.00,
    driver_tip NUMERIC(8, 2) DEFAULT 0.00,
    toll_fees NUMERIC(8, 2) DEFAULT 0.00,
    improvement_fee NUMERIC(8, 2) DEFAULT 0.00,
    grand_total NUMERIC(10, 2) NOT NULL,
    congestion_fee NUMERIC(8, 2) DEFAULT 0.00,
    airport_surcharge NUMERIC(8, 2) DEFAULT 0.00,

    duration_in_seconds INT NOT NULL,
    calculated_speed_mph NUMERIC(5, 2),
    tip_to_fare_ratio NUMERIC(5, 2) DEFAULT 0.00,
    is_rush_hour_trip SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_pickup_location
        FOREIGN KEY (pickup_zone_id)
        REFERENCES nyc_taxi_zones(zone_id),

    CONSTRAINT fk_dropoff_location
        FOREIGN KEY (dropoff_zone_id)
        REFERENCES nyc_taxi_zones(zone_id),

    CONSTRAINT chk_positive_miles
        CHECK (trip_miles >= 0.0),

    CONSTRAINT chk_positive_total
        CHECK (grand_total >= 0.0),

    CONSTRAINT chk_valid_passenger_range
        CHECK (passenger_count >= 0 AND passenger_count <= 10),

    CONSTRAINT chk_chronological_time
        CHECK (dropoff_time >= pickup_time),

    CONSTRAINT chk_valid_rush_hour_flag
        CHECK (is_rush_hour_trip IN (0, 1))
);

CREATE INDEX idx_trips_pickup_time
    ON high_volume_trips(pickup_time);

CREATE INDEX idx_trips_pickup_zone
    ON high_volume_trips(pickup_zone_id);

CREATE INDEX idx_trips_dropoff_zone
    ON high_volume_trips(dropoff_zone_id);

CREATE INDEX idx_trips_zone_and_time_composite
    ON high_volume_trips(pickup_zone_id, pickup_time);

CREATE INDEX idx_zones_spatial_map
    ON nyc_taxi_zones USING GIST(map_boundary);
