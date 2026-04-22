# Suraksha Path - Women Safety Route Analyser 🛡️

**Suraksha Path** is a smart city navigation prototype designed to prioritize personal safety over travel speed. It evaluates multiple routes between a source and destination and assigns a dynamic "Safety Score" based on environmental, infrastructural, and historical data.

## 🚀 Key Features

- **Safety-First Navigation**: Fetches multiple walking routes and highlights the safest option in green, while riskier segments are shown in red/orange.
- **Intelligent Scoring Engine**: A weighted algorithm calculating risk based on:
  - **Street Lighting** (Infrastructural data)
  - **Crime Rates** (Historical data)
  - **Police Proximity** (Distance to nearest emergency services)
- **Real-Time Tools**:
  - **SOS Button**: Instant emergency simulation with location broadcasting.
  - **Community Reporting**: "Report Unsafe Area" toggle for crowdsourced safety updates.
- **Premium Interface**: A modern, dark-themed dashboard with glassmorphism aesthetics and smooth animations.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, MapLibre GL JS (Map Engine)
- **Backend**: Python Flask, Pandas, SciPy (KDTree for spatial lookups)
- **Data**: LocationIQ API (Geocoding & Routing), OpenFreeMap (Free Vector Tiles)
- **Deployment**: Vercel (Serverless Functions)

## 📂 Project Structure

```text
/frontend      # React source code & UI components
/backend       # Flask API, Scoring Logic & Safety Data
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js & npm
- Python 3.8+

### Step 1: Clone the Repository
```bash
git clone https://github.com/tejas-singh-0212/Suraksha-Path.git
cd Suraksha-Path
```

### Step 2: Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

## Data Sources

The safety dataset utilized in this project is carefully designed to reflect genuine urban environments across India.

- **Data Composition**: The dataset is a combination of:
  - Synthetic data generated based on real-world patterns.
  - Information inspired by publicly available data sources.
- **Realistic References**: The underlying assumptions are derived from realistic sources, including:
  - **NCRB (National Crime Records Bureau)** reports.
  - **data.gov.in** datasets.
  - **OpenStreetMap (OSM)** for accurate geographic context.
  - Urban infrastructure assumptions (e.g., lighting quality, police presence, and crowd density).
- **Simulation & Future Scalability**: 
  - Due to the lack of real-time APIs, the current data is simulated but strictly follows realistic statistical correlations.
  - The system features a scalable architecture, designed to seamlessly integrate with real-time live APIs in the future.

## 👥 Team Members
- **Tejas**
- **Mayank**
- **Priyal**
- **Snavi**

---
*Developed for Hackathon 2026. Built with focus on accessibility and real-world safety impact.*