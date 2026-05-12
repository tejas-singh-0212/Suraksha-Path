import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

DB_PATH = 'safety.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def calculate_route_safety(coordinates):
    """
    Calculates safety score and risk factors for a route geometry using SQLite.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    scores = []
    lighting_scores = []
    crime_weights = []
    police_proximities = []
    crowd_densities = []
    
    # Sample the route coordinates to speed up calculation
    sample_rate = max(1, len(coordinates) // 20)
    sampled_coords = coordinates[::sample_rate]
    
    for lng, lat in sampled_coords:
        # Bounding box query for nearest point (approx 1km)
        # In a real nationwide app, this radius would be tuned
        radius = 0.01 
        query = """
            SELECT *, 
            ((lat - ?) * (lat - ?) + (lng - ?) * (lng - ?)) AS dist_sq
            FROM safety_points
            WHERE lat BETWEEN ? AND ?
            AND lng BETWEEN ? AND ?
            ORDER BY dist_sq ASC
            LIMIT 1
        """
        cursor.execute(query, (lat, lat, lng, lng, lat - radius, lat + radius, lng - radius, lng + radius))
        row = cursor.fetchone()
        
        if row:
            lighting_scores.append(row['lighting_score'])
            crime_weights.append(row['crime_weight'])
            police_proximities.append(row['police_prox'])
            crowd_densities.append(row['crowd_density'])
            
            # Formula: Score = (Lighting * 0.4) + (Police_Prox * 0.3) - (Crime_Rate * 0.3)
            # Normalizing to 0-100 scale: (S + 3) * 10
            raw_score = (row['lighting_score'] * 0.4) + (row['police_prox'] * 0.3) - (row['crime_weight'] * 0.3)
            normalized_score = (raw_score + 3) * 10
            scores.append(normalized_score)
    
    conn.close()

    if not scores:
        return {"score": 75, "risk_factors": []} # Default if no data found
        
    avg_score = round(np.mean(scores), 2)
    avg_lighting = np.mean(lighting_scores)
    avg_crime = np.mean(crime_weights)
    avg_police = np.mean(police_proximities)
    avg_crowd = np.mean(crowd_densities)
    
    risk_factors = set()
    if avg_lighting < 5:
        risk_factors.add("Poor Lighting")
    if avg_crime > 6:
        risk_factors.add("High Crime Area")
    if avg_police < 4:
        risk_factors.add("Low Police Presence")
    if avg_crowd < 3:
        risk_factors.add("Isolated Area")
        
    return {
        "score": avg_score,
        "risk_factors": list(risk_factors)
    }

@app.route('/api/analyze-route', methods=['POST'])
def analyze_route():
    data = request.json
    routes = data.get('routes', [])
    
    analyzed_routes = []
    for route in routes:
        # Calculate safety score and risk factors based on geometry
        safety_data = calculate_route_safety(route['geometry']['coordinates'])
        route['safety_score'] = safety_data['score']
        route['risk_factors'] = safety_data['risk_factors']
        analyzed_routes.append(route)

    # Sort routes by safety score (highest first)
    analyzed_routes.sort(key=lambda x: x['safety_score'], reverse=True)
    
    return jsonify(analyzed_routes)

if __name__ == '__main__':
    app.run(debug=True, port=5000)