from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from scipy.spatial import KDTree

app = Flask(__name__)
CORS(app)

# Load safety data
try:
    safety_df = pd.read_csv('safety_data.csv')
except FileNotFoundError:
    # Fallback if file not found during dev
    safety_df = pd.DataFrame(columns=['lat', 'lng', 'crime_weight', 'lighting_score', 'police_prox', 'crowd_density'])

# Prepare KDTree for fast spatial lookup
if not safety_df.empty:
    coords = safety_df[['lat', 'lng']].values
    tree = KDTree(coords)
else:
    tree = None

def calculate_route_safety(coordinates):
    """
    Calculates safety score for a route geometry.
    coordinates: List of [lng, lat] pairs from Mapbox
    """
    if tree is None or safety_df.empty:
        return 75 # Default score if no data
    
    scores = []
    # Mapbox coordinates are [lng, lat], our CSV is [lat, lng]
    # We sample the route coordinates to speed up calculation
    sample_rate = max(1, len(coordinates) // 20)
    sampled_coords = coordinates[::sample_rate]
    
    for lng, lat in sampled_coords:
        # Find nearest point in safety data
        dist, idx = tree.query([lat, lng])
        row = safety_df.iloc[idx]
        
        # Formula: Score = (Lighting * 0.4) + (Police_Prox * 0.3) - (Crime_Rate * 0.3)
        # Normalizing to 0-100 scale: (S + 3) * 10
        raw_score = (row['lighting_score'] * 0.4) + (row['police_prox'] * 0.3) - (row['crime_weight'] * 0.3)
        normalized_score = (raw_score + 3) * 10
        scores.append(normalized_score)
    
    if not scores:
        return 75
        
    return round(np.mean(scores), 2)

@app.route('/api/analyze-route', methods=['POST'])
def analyze_route():
    data = request.json
    routes = data.get('routes', [])
    
    analyzed_routes = []
    for route in routes:
        # Calculate safety score based on geometry
        score = calculate_route_safety(route['geometry']['coordinates'])
        route['safety_score'] = score
        analyzed_routes.append(route)

    # Sort routes by safety score (highest first)
    analyzed_routes.sort(key=lambda x: x['safety_score'], reverse=True)
    
    return jsonify(analyzed_routes)

if __name__ == '__main__':
    app.run(debug=True, port=5000)