import pandas as pd
import random

# Generate 100 mock data points around Delhi
lats = [28.6 + random.uniform(0, 0.2) for _ in range(100)]
lngs = [77.1 + random.uniform(0, 0.2) for _ in range(100)]
crime_weight = [random.randint(0, 10) for _ in range(100)]
lighting_score = [random.randint(0, 10) for _ in range(100)]
police_prox = [random.randint(0, 10) for _ in range(100)]
crowd_density = [random.randint(0, 10) for _ in range(100)]

df = pd.DataFrame({
    'lat': lats,
    'lng': lngs,
    'crime_weight': crime_weight,
    'lighting_score': lighting_score,
    'police_prox': police_prox,
    'crowd_density': crowd_density
})

df.to_csv('c:/Hackathon/Suraksha-Path/backend/safety_data.csv', index=False)
print("Generated safety_data.csv")
