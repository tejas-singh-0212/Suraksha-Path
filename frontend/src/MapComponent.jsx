import React, { useEffect, useRef } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';

const MAP_STYLE = "https://tiles.openfreemap.org/styles/dark";

function MapComponent({ routes, start, end, selectedRouteIndex }) {
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

      mapRef.current.fitBounds(bounds, { padding: 80, duration: 1500 });
    }
  }, [routes]);

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{
          longitude: 77.2090, // Default to Delhi
          latitude: 28.6139,
          zoom: 12
        }}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" style={{ marginRight: '20px', marginBottom: '100px' }} />

        {/* Render unselected routes first so they appear BEHIND the selected route */}
        {routes.map((route, index) => {
          if (index === selectedRouteIndex) return null; // Skip selected route for now
          
          return (
            <Source key={`unselected-${index}`} type="geojson" data={route.geometry}>
              <Layer
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{
                  'line-color': '#64748b', // Slate 500
                  'line-width': 4,
                  'line-opacity': 0.3, // Dim unselected
                }}
              />
            </Source>
          );
        })}

        {/* Render Selected Route ON TOP */}
        {routes.length > 0 && routes[selectedRouteIndex] && (
          <Source key={`selected-${selectedRouteIndex}`} type="geojson" data={routes[selectedRouteIndex].geometry}>
            {/* Glow effect layer */}
            <Layer
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': 
                  routes[selectedRouteIndex].safety_score > 80 ? '#10b981' : // Emerald
                  routes[selectedRouteIndex].safety_score > 60 ? '#f59e0b' : // Amber
                  '#ef4444', // Red
                'line-width': 12,
                'line-opacity': 0.2,
                'line-blur': 10
              }}
            />
            {/* Core line layer */}
            <Layer
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': 
                  routes[selectedRouteIndex].safety_score > 80 ? '#10b981' : 
                  routes[selectedRouteIndex].safety_score > 60 ? '#f59e0b' : 
                  '#ef4444',
                'line-width': 5,
                'line-opacity': 1,
              }}
            />
          </Source>
        )}

        {start && (
          <Marker longitude={start[0]} latitude={start[1]} anchor="bottom">
            <div className="flex flex-col items-center transform -translate-y-2 hover:scale-110 transition-transform cursor-pointer">
              <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold mb-1 shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md">START</div>
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900">
                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
              </div>
            </div>
          </Marker>
        )}

        {end && (
          <Marker longitude={end[0]} latitude={end[1]} anchor="bottom">
            <div className="flex flex-col items-center transform -translate-y-2 hover:scale-110 transition-transform cursor-pointer">
              <div className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-[10px] font-bold mb-1 shadow-[0_0_15px_rgba(16,185,129,0.4)]">DESTINATION</div>
              <MapPin className="text-emerald-500 drop-shadow-lg" size={32} weight="fill" />
            </div>
          </Marker>
        )}
      </Map>
      
      {/* Map Legend Overlay */}
      <div className="absolute top-4 right-4 z-10 md:top-6 md:right-6">
        <div className="bg-slate-900/80 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Safety Index</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="text-xs text-slate-200 font-medium"> 80</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
              <span className="text-xs text-slate-200 font-medium">60 - 80</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              <span className="text-xs text-slate-200 font-medium"> 60</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapComponent;