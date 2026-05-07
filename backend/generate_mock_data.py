import pandas as pd
import numpy as np
import random

def generate_realistic_data(num_points=2000):
    # Center of Bengaluru
    base_lat, base_lng = 12.9716, 77.5946
    
    data = []
    
    # Define some "Safe Hubs" in Bengaluru (Well-lit, high police)
    hubs = [
        (12.9733, 77.6117), # MG Road / Brigade Road
        (12.9719, 77.6412), # Indiranagar 100ft Rd
        (12.9352, 77.6245), # Koramangala 5th Block
        (12.9279, 77.6271), # HSR Layout
    ]
    
    # Define some "High Risk Zones" (Industrial outskirts, dimly lit alleys)
    risks = [
        (13.0285, 77.5197), # Peenya Industrial Area
        (12.9857, 77.6057), # Shivajinagar Alleys
        (12.8452, 77.6602), # Electronic City Phase 2 Outskirts
    ]

    for _ in range(num_points):
        # Random point within a ~20km radius of Bengaluru
        lat = base_lat + random.uniform(-0.12, 0.12)
        lng = base_lng + random.uniform(-0.12, 0.12)
        
        # Calculate proximity to hubs and risks
        hub_dist = min([np.sqrt((lat-h[0])**2 + (lng-h[1])**2) for h in hubs])
        risk_dist = min([np.sqrt((lat-r[0])**2 + (lng-r[1])**2) for r in risks])
        
        if hub_dist < 0.025: # Near a safe hub
            crime = random.randint(1, 3)
            light = random.randint(8, 10)
            police = random.randint(7, 10)
            crowd = random.randint(7, 10)
        elif risk_dist < 0.025: # Near a risk zone
            crime = random.randint(7, 10)
            light = random.randint(1, 4)
            police = random.randint(1, 3)
            crowd = random.randint(1, 4)
        else: # Standard residential/commercial
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
    df.to_csv('c:/Hackathon/Suraksha-Path/backend/safety_data.csv', index=False)
    print(f"Generated {num_points} realistic safety data points for Bengaluru.")

if __name__ == "__main__":
    generate_realistic_data()
