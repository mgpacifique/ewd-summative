# MoveData NYC

A full-stack urban mobility analysis platform built using the New York City Taxi and Limousine Commission (TLC) dataset.

The project processes millions of NYC taxi trip records, stores them in a PostgreSQL/PostGIS database, performs statistical analysis, and presents insights through an interactive web dashboard.

---

# Project Overview

MoveData NYC was developed to explore transportation patterns across New York City using real-world taxi trip data.

The system integrates:

* NYC Yellow Taxi Trip Records
* Taxi Zone Lookup Data
* Taxi Zone Spatial Metadata

Using these datasets, the project provides users with interactive visualizations, geographic exploration tools, and analytical insights into urban mobility.

---

# Features

## Data Processing (ETL)

* Data extraction from raw NYC taxi datasets
* Missing value handling
* Duplicate removal
* Outlier detection and filtering
* Feature engineering
* Data validation and integrity checks

## Database

* PostgreSQL relational database
* PostGIS spatial extension
* Normalized schema design
* Indexed queries for improved performance

## Analytics

* Custom Pearson Correlation Algorithm
* Speed analysis
* Tipping behavior analysis
* Borough comparison analysis
* Exploratory data analysis (EDA)

## Dashboard

* Interactive NYC zone map
* Borough filtering
* Trip metric sorting
* Live data visualization
* Analytical insights and findings

---

# Technology Stack

## Backend

* Python
* Pandas
* GeoPandas
* SQLAlchemy

## Database

* PostgreSQL
* PostGIS

## Frontend

* HTML
* CSS
* JavaScript
* Leaflet

---

# System Architecture

```text
NYC Taxi Dataset
        ↓
ETL Processing Pipeline
        ↓
PostgreSQL + PostGIS
        ↓
Backend API
        ↓
MoveData NYC Dashboard
```

---

# Database Design

The database consists of two primary tables:

## nyc_taxi_zones

Stores:

* Zone ID
* Borough Name
* Zone Name
* Service Zone Type
* Geographic Boundary

## high_volume_trips

Stores:

* Pickup and Dropoff Times
* Passenger Count
* Trip Distance
* Fare Information
* Engineered Features

### Engineered Features

* Trip Duration
* Average Speed
* Tip-to-Fare Ratio
* Rush Hour Indicator

---

# Custom Algorithm

To satisfy the algorithm requirement of the assignment, a custom Pearson Correlation algorithm was implemented without relying on built-in statistical correlation functions.

The algorithm evaluates the relationship between:

* Average Speed (MPH)
* Tip Percentage (%)

### Complexity

Time Complexity:

```text
O(N)
```

Space Complexity:

```text
O(1)
```

### Result

```text
r = -0.0080
```

The result indicates almost no relationship between taxi speed and passenger tipping behavior.

---

# Key Findings

### Finding 1

Most NYC taxi trips occur at relatively low speeds, reflecting the city's heavy traffic conditions.

### Finding 2

Passenger tipping behavior remains fairly consistent across trips.

### Finding 3

Traffic congestion has little to no impact on tip percentages.

### Finding 4

Average travel speeds vary significantly across boroughs.

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd movedata-nyc
```

## Create Virtual Environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS/Linux

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Database Setup

Create a PostgreSQL database and enable PostGIS.

Run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Execute:

```bash
schema.sql
```

to create all required tables and indexes.

---

# Running the ETL Pipeline

Run the ETL notebook:

```bash
etl_backend.ipynb
```

This process:

1. Loads raw taxi data
2. Cleans invalid records
3. Generates engineered features
4. Loads processed data into PostgreSQL

---

# Running the Backend

```bash
python app.py
```

or

```bash
python main.py
```

(Use the correct entry file for your project.)

---

# Running the Frontend

Open:

```text
index.html
```

or launch the frontend through the configured development server.

---

# Dashboard Screenshots

## Main Dashboard
<img width="1354" height="630" alt="Screenshot 2026-06-22 164402" src="https://github.com/user-attachments/assets/20bda6a1-d3d4-4363-98ec-2ea34af77c43" />


## Interactive Map

<img width="953" height="542" alt="Screenshot 2026-06-22 190430" src="https://github.com/user-attachments/assets/5d2e108c-a9e9-447e-973b-33f88624e395" />


## Analytics Page

<img width="1352" height="593" alt="WhatsApp Image 2026-06-22 at 7 11 25 PM" src="https://github.com/user-attachments/assets/eecc93aa-a3fd-4344-a8e1-8351cc2bc376" />


---

# Video Walkthrough

```text
https://vimeo.com/1203597343?share=copy&fl=sv&fe=ci

```

---

# Team Task sheets (Google Sheet)

```text
https://docs.google.com/spreadsheets/d/1m9sMGlsCMGDBu2yGMQ2QlsNltyiYcU76mwJOC0fGT80/edit?usp=sharing

```

---

# Team Members

* MagyeraND — Database Architecture
* Pacifique — Backend Development & ETL
* Miracle — Deployment Engineer & Documentation Lead
* Credo Hedrick Iranzi — Frontend Developer

---

# Future Improvements

Potential future enhancements include:

* Real-time taxi tracking
* Weather integration
* Demand forecasting
* Route optimization
* Machine learning predictions

---

# License

This project was developed for academic purposes as part of the Enterprise Web Development Summative Assignment.
