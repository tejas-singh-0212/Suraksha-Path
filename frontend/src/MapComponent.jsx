import React, { useEffect, useRef } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';

// OpenFreeMap provides free tiles without API keys!
const MAP_STYLE = "https://tiles.openfreemap.org/styles/dark";

function MapComponent({ routes, start, end }) {
  const mapRef = useRef();

  useEffect(() => {
    if (routes.length > 0 && mapRef.current) {
      const allCoords = routes.flatMap(r => r.geometry.coordinates);
      const bounds = allCoords.reduce((acc, coord) => {
        return [
          [Math.min(acc[0][0], coord[0]), Math.min(acc[0][1], coord[1])],
          [Math.max(acc[1][0], coord[0]), Math.max(acc[1][1], coord[1])]
        ];
      }, [[Infinity, Infinity], [-Infinity, -Infinity]]);

      mapRef.current.fitBounds(bounds, { padding: 80, duration: 1000 });
    }
  }, [routes]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl shadow-2xl border border-white/10">
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{
          longitude: 77.2090,
          latitude: 28.6139,
          zoom: 12
        }}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />

        {routes.map((route, index) => {
          const isSafest = index === 0;
          const score = route.safety_score;
          
          let color = '#ef4444'; // Red
          if (score > 80) color = '#22c55e'; // Green
          else if (score > 60) color = '#f59e0b'; // Orange
          
          return (
            <Source key={index} type="geojson" data={route.geometry}>
              <Layer
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{
                  'line-color': isSafest ? color : '#475569',
                  'line-width': isSafest ? 6 : 4,
                  'line-opacity': isSafest ? 1 : 0.4,
                }}
              />
            </Source>
          );
        })}

        {start && (
          <Marker longitude={start[0]} latitude={start[1]}>
            <div className="flex flex-col items-center">
              <div className="bg-white text-slate-900 px-2 py-1 rounded text-[10px] font-bold mb-1 shadow-lg">START</div>
              <MapPin className="text-white fill-primary" size={24} />
            </div>
          </Marker>
        )}

        {end && (
          <Marker longitude={end[0]} latitude={end[1]}>
            <div className="flex flex-col items-center">
              <div className="bg-white text-slate-900 px-2 py-1 rounded text-[10px] font-bold mb-1 shadow-lg">DESTINATION</div>
              <MapPin className="text-white fill-danger" size={24} />
            </div>
          </Marker>
        )}
      </Map>
      
      <div className="absolute top-4 left-4 z-10">
        <div className="glass px-4 py-2 rounded-lg flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 bg-safe rounded-full"></div>
            <span className="text-[10px] text-slate-300">Safest</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 bg-warning rounded-full"></div>
            <span className="text-[10px] text-slate-300">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 bg-danger rounded-full"></div>
            <span className="text-[10px] text-slate-300">Risky</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapComponent;