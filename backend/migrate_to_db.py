import sqlite3
import pandas as pd
import os

def migrate():
    # 1. Load the CSV
    csv_path = 'safety_data.csv'
    db_path = 'safety.db'
    
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    print(f"Reading {csv_path}...")
    df = pd.read_csv(csv_path)

    # 2. Connect to SQLite
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 3. Create table
    print("Creating safety_points table...")
    cursor.execute("DROP TABLE IF EXISTS safety_points")
    cursor.execute('''
        CREATE TABLE safety_points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lat REAL,
            lng REAL,
            crime_weight INTEGER,
            lighting_score INTEGER,
            police_prox INTEGER,
            crowd_density INTEGER
        )
    ''')

    # 4. Insert data
    print(f"Inserting {len(df)} records into the database...")
    df.to_sql('safety_points', conn, if_exists='append', index=False)

    # 5. Create Indexes (Crucial for performance)
    print("Creating spatial indexes on lat/lng...")
    cursor.execute("CREATE INDEX idx_lat ON safety_points(lat)")
    cursor.execute("CREATE INDEX idx_lng ON safety_points(lng)")

    conn.commit()
    conn.close()
    print("Migration complete! 'safety.db' is ready.")

if __name__ == "__main__":
    migrate()
