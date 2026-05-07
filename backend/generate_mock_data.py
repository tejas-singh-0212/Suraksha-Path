import pandas as pd
import numpy as np
import random

def generate_realistic_data(num_points=2000):
    # Center of Delhi
    base_lat, base_lng = 28.6139, 77.2090
    
    data = []
    
    # Define some "Safe Hubs" (Markets, Government areas)
    # High lighting, low crime, high police
    hubs = [
        (28.6315, 77.2167), # Connaught Place
        (28.6127, 77.2135), # Rajpath
        (28.5672, 77.2100), # AIIMS area
        (28.5244, 77.1855), # Saket
    ]
    
    # Define some "High Risk Zones" (Alleys, Industrial outskirts)
    # Low lighting, high crime, low police
    risks = [
        (28.7041, 77.1025), # Rohini Outskirts
        (28.6500, 77.2300), # Old Delhi Alleys
        (28.5500, 77.2500), # Okhla industrial
    ]

    for _ in range(num_points):
        # Random point within a ~20km radius
        lat = base_lat + random.uniform(-0.15, 0.15)
        lng = base_lng + random.uniform(-0.15, 0.15)
        
        # Calculate proximity to hubs and risks to influence scores
        hub_dist = min([np.sqrt((lat-h[0])**2 + (lng-h[1])**2) for h in hubs])
        risk_dist = min([np.sqrt((lat-r[0])**2 + (lng-r[1])**2) for r in risks])
        
        if hub_dist < 0.03: # Near a safe hub
            crime = random.randint(1, 3)
            light = random.randint(7, 10)
            police = random.randint(7, 10)
            crowd = random.randint(6, 9)
        elif risk_dist < 0.03: # Near a risk zone
            crime = random.randint(7, 10)
            light = random.randint(1, 4)
            police = random.randint(1, 4)
            crowd = random.randint(1, 4)
        else: # Standard residential/mixed area
            crime = random.randint(3, 7)
            light = random.randint(4, 7)
            police = random.randint(3, 7)
            crowd = random.randint(3, 7)
            
        data.append({
            'lat': lat, 'lng': lng, 
            'crime_weight': crime, 
            'lighting_score': light, 
            'police_prox': police, 
            'crowd_density': crowd
        })
    
    df = pd.DataFrame(data)
    df.to_csv('c:/Hackathon\Suraksha-Path/backend/safety_data.csv', index=False)
    print(f"Generated {num_points} realistic safety data points for Delhi.")

if __name__ == "__main__":
    generate_realistic_data()
