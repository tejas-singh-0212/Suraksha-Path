# Suraksha Path 🛡️
### *Intelligent, Safety-First Urban Routing*

**Suraksha Path** is a high-fidelity navigation prototype designed to prioritize personal safety over travel speed. Unlike traditional maps that optimize for the "Fastest Path," Suraksha Path analyzes urban infrastructure, historical data, and real-time environmental factors to guide users through the safest possible corridors.

---

## 🌟 Key Features

### 1. **Safety-First Navigation Engine**
Evaluates multiple routing alternatives using the LocationIQ API and re-ranks them based on a proprietary **Safety Index**.
*   **Green Routes**: High safety (Well-lit, high police proximity).
*   **Amber/Red Routes**: High risk (Isolated areas, poor lighting, or high crime history).

### 2. **Live Tracking & "Auto-Follow" Mode**
A premium navigation experience that uses the **Geolocation watchPosition API** to track your movement in real-time. The map auto-centers and follows your progress, showing a pulsing "Blue Dot" just like a commercial GPS.

### 3. **AI-Driven Risk Factor Analysis**
The backend analyzes your specific route geometry and identifies hyper-local dangers. It dynamically flags issues such as:
*   ⚠️ **"Poor Lighting"**
*   ⚠️ **"Isolated Area"**
*   ⚠️ **"High Crime History"**

### 4. **Intense Emergency SOS**
A one-tap emergency trigger designed to grab attention and broadcast data.
*   **Police Siren Audio**: Uses Web Audio API to generate a high-frequency siren.
*   **Visual Alert**: High-intensity red/blue flashing lights to signal distress.
*   **Automatic Logging**: Simulates broadcasting live GPS to authorities.

---

## 🧠 The "Safety Index" Algorithm

The core of Suraksha Path is a spatial analysis engine built with **Python and SciPy**.

### **Technical Deep-Dive: KDTree Spatial Search**
To ensure street-level accuracy without slowing down the UI, we implemented a **KDTree (k-dimensional tree)**. This allows the backend to perform lightning-fast nearest-neighbor lookups between the route's geometry points and our **2,000-point urban safety dataset**.

### **The Formula**
Each point along a route is scored using the following weighted formula:
$$Safety Score = (Lighting \times 0.4) + (Police Proximity \times 0.3) + (Crowd Density \times 0.2) - (Crime Weight \times 0.3)$$
*The result is normalized to a 0-100 scale.*

---

## 🛠️ Tech Stack

-   **Frontend**: React.js (Vite), MapLibre GL, Tailwind CSS, Lucide Icons.
-   **Backend**: Flask (Python), Pandas, NumPy, SciPy (KDTree).
-   **APIs**: LocationIQ (Directions & Geocoding), OpenFreeMap (Dark Mode Vector Tiles).

---

## 📂 Project Structure

```text
/frontend      # React UI, Map Engine, Live Tracking Logic
/backend       # Flask API, KDTree Spatial Search, Safety Data
/data          # Realistic Urban Dataset (Delhi Cluster Model)
```

---

## ⚙️ Installation & Setup

### **1. Clone & Install**
```bash
git clone https://github.com/tejas-singh-0212/Suraksha-Path.git
cd Suraksha-Path
```

### **2. Launch Backend**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### **3. Launch Frontend**
```bash
cd ../frontend
npm install
npm run dev
```

---

## 👥 Team Members
- **Tejas** | **Mayank** | **Priyal** | **Snavi**

---
*Developed for Hackathon 2026. Built with a focus on urban safety and high-performance spatial analysis.*