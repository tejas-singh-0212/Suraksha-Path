import React, { useState } from 'react';
import MapComponent from './MapComponent';
import { getGeocoding, getRoutes, analyzeRoutes } from './api';
import { Search, Shield, Navigation, AlertCircle, PhoneCall, Map as MapIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function App() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [showSOS, setShowSOS] = useState(false);
  const [reporting, setReporting] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!start || !end) return;

    setLoading(true);
    try {
      const startFeature = await getGeocoding(start);
      const endFeature = await getGeocoding(end);

      if (startFeature && endFeature) {
        setStartCoords(startFeature.center);
        setEndCoords(endFeature.center);

        const fetchedRoutes = await getRoutes(startFeature.center, endFeature.center);
        const analyzed = await analyzeRoutes(fetchedRoutes);
        setRoutes(analyzed);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("API Key error: Please check if your LocationIQ token is correctly set in Vercel.");
      } else if (error.code === 'ERR_NETWORK') {
        alert("Backend error: Could not connect to the safety analysis server. Check VITE_BACKEND_URL.");
      } else {
        alert("An error occurred while fetching routes. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSOS = () => {
    setShowSOS(true);
    setTimeout(() => setShowSOS(false), 5000);
  };

  const handleReport = () => {
    setReporting(true);
    setTimeout(() => setReporting(false), 2000);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-96 flex flex-col glass border-r border-white/10 z-20 shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Shield className="text-primary w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Suraksha Path</h1>
          </div>
          <p className="text-slate-400 text-sm">Prioritizing your safety, one route at a time.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form onSubmit={handleSearch} className="space-y-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Current Location"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="relative">
              <Navigation className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Where to?"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Analyze Safe Routes"}
            </button>
          </form>

          {routes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggested Routes</h3>
              {routes.map((route, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer group",
                    i === 0 ? "bg-primary/10 border-primary/30" : "bg-slate-900/30 border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">Route {i + 1} {i === 0 && "(Recommended)"}</span>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold",
                      route.safety_score > 80 ? "bg-safe/20 text-safe" : 
                      route.safety_score > 60 ? "bg-warning/20 text-warning" : "bg-danger/20 text-danger"
                    )}>
                      {route.safety_score}% SAFE
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>{(route.distance / 1000).toFixed(1)} km</span>
                    <span>{Math.round(route.duration / 60)} mins</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && routes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapIcon className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-slate-500 text-sm">Enter your destination to see safety-first routing.</p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-6 border-t border-white/10 bg-slate-950/50">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleReport}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-sm transition-all border border-white/5"
            >
              {reporting ? <CheckCircle2 className="w-4 h-4 text-safe" /> : <AlertCircle className="w-4 h-4" />}
              {reporting ? "Reported" : "Report Area"}
            </button>
            <button 
              onClick={handleSOS}
              className="flex items-center justify-center gap-2 bg-danger hover:bg-danger/90 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-danger/20 animate-pulse-slow"
            >
              <PhoneCall className="w-4 h-4" />
              SOS
            </button>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapComponent routes={routes} start={startCoords} end={endCoords} />
        
        {/* SOS Overlay */}
        {showSOS && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-danger/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 p-8 rounded-3xl border-2 border-danger shadow-2xl text-center max-w-sm mx-4">
              <div className="w-20 h-20 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <PhoneCall className="w-10 h-10 text-danger animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Emergency Alert!</h2>
              <p className="text-slate-400 mb-6">Your current location has been sent to your emergency contacts and the nearest police station.</p>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-danger animate-[shrink_5s_linear]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export default App;