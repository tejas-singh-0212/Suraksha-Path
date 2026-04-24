import axios from 'axios';

// LocationIQ is a great alternative for students - No credit card required!
// Get your free key at: https://locationiq.com/
const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_TOKEN || 'pk.55c5c0d2a84a56a6953457198d017772'; // Fallback demo key (limited)

const locationIqApi = axios.create({
  baseURL: 'https://us1.locationiq.com/v1',
});

export const getGeocoding = async (query) => {
  const response = await locationIqApi.get('/search.php', {
    params: {
      key: LOCATIONIQ_KEY,
      q: query,
      format: 'json',
      limit: 1,
    }
  });
  const first = response.data[0];
  if (!first) return null;
  // Convert LocationIQ format to the [lng, lat] format we use
  return {
    center: [parseFloat(first.lon), parseFloat(first.lat)],
    display_name: first.display_name
  };
};

export const getRoutes = async (startCoords, endCoords) => {
  // LocationIQ Routing (Walking profile)
  const response = await locationIqApi.get(`/directions/walking/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}`, {
    params: {
      key: LOCATIONIQ_KEY,
      overview: 'full',
      geometries: 'geojson',
      alternatives: 'true',
      steps: 'true',
    }
  });
  return response.data.routes;
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

export const analyzeRoutes = async (routes) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/analyze-route`, { routes });
    return response.data;
  } catch (error) {
    console.error("Error analyzing routes:", error);
    return routes; // Fallback to original routes if backend fails
  }
};
