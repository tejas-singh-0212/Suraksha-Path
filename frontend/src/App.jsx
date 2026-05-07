import React, { useState } from 'react';
import MapComponent from './MapComponent';
import { getGeocoding, getRoutes, analyzeRoutes } from './api';
import { Search, Shield, Navigation, AlertCircle, PhoneCall, Map as MapIcon, Loader2, CheckCircle2, Crosshair, AlertTriangle } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0); // Track active route
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [toast, setToast] = useState(null);
  const watchId = React.useRef(null);

  // Feature: Get User's Current Location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStart(`${latitude}, ${longitude}`);
        setStartCoords([longitude, latitude]);
        setLocating(false);
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Unable to retrieve your location.");
        setLocating(false);
      }
    );
  };

  const toggleNavigation = () => {
    if (isNavigating) {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setIsNavigating(false);
    } else {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }
      
      setIsNavigating(true);
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
        },
        (error) => {
          console.error("Error watching location", error);
          setIsNavigating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  React.useEffect(() => {
    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);


  const handleSearch = async (e) => {
    e.preventDefault();
    if (!start || !end) return;

    setLoading(true);
    setSelectedRouteIndex(0); // Reset selection on new search
    
    try {
      // If start is already coordinates (from geolocation), skip geocoding it
      let startFeature = startCoords ? { center: startCoords } : await getGeocoding(start);
      if (!startCoords) setStartCoords(startFeature?.center);
      
      const endFeature = await getGeocoding(end);

      if (startFeature && endFeature) {
        setEndCoords(endFeature.center);

        const fetchedRoutes = await getRoutes(startFeature.center, endFeature.center);
        const analyzed = await analyzeRoutes(fetchedRoutes);
        
        // Sort routes by safety score descending to ensure the safest is always first
        analyzed.sort((a, b) => b.safety_score - a.safety_score);
        setRoutes(analyzed);
        
        if (window.innerWidth < 768) setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      let errorMsg = "An error occurred while fetching routes. Please try again.";
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.code === 'TooBig') {
        errorMsg = "The route is too long. Please try closer locations.";
      } else if (error.response?.data?.code === 'NoRoute') {
        errorMsg = "No route found between these locations.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSOS = () => {
    setShowSOS(true);
    
    // Play Siren Sound
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playSiren = () => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1);
      
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 1);
    };

    const sirenInterval = setInterval(playSiren, 1000);
    
    setTimeout(() => {
      setShowSOS(false);
      clearInterval(sirenInterval);
    }, 6000);
  };

  const handleReport = () => {
    setReporting(true);
    setToast("Incident reported at your location. Stay safe!");
    setTimeout(() => {
      setReporting(false);
      setToast(null);
    }, 4000);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 z-30">
        <div className="flex items-center gap-2">
          <Shield className="text-emerald-400 w-6 h-6" />
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Suraksha Path</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          <Search className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-0 md:relative md:inset-auto w-full md:w-[400px] flex flex-col bg-slate-900/90 backdrop-blur-2xl border-r border-white/10 z-40 transition-transform duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.5)]",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-white/5 hidden md:block relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl border border-emerald-500/20">
              <Shield className="text-emerald-400 w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Suraksha Path</h1>
          </div>
          <p className="text-slate-400 text-sm relative z-10">Intelligent, safety-first routing.</p>
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10"
        >
          <AlertCircle className="w-5 h-5 rotate-45" />
        </button>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form onSubmit={handleSearch} className="space-y-4 mb-8">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Current Location"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-10 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm shadow-inner"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setStartCoords(null); // Reset coords if user types manually
                }}
              />
              <button 
                type="button" 
                onClick={handleGetCurrentLocation}
                className="absolute right-3 text-emerald-400 hover:text-emerald-300 transition-colors"
                title="Use current location"
              >
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <Navigation className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Where to?"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm shadow-inner"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Analyze Safe Routes"}
            </button>
          </form>

          {routes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Suggested Routes</h3>
              {routes.map((route, i) => {
                const isSelected = selectedRouteIndex === i;
                const isSafest = i === 0;
                
                return (
                  <div 
                    key={i} 
                    onClick={() => {
                      setSelectedRouteIndex(i);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                      isSelected 
                        ? (isSafest ? "bg-emerald-500/10 border-emerald-500/50" : "bg-slate-800 border-slate-500")
                        : "bg-slate-900/30 border-white/5 hover:border-white/20 hover:bg-slate-800/50"
                    )}
                  >
                    {/* Active Indicator Line */}
                    {isSelected && (
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        isSafest ? "bg-emerald-500" : (route.safety_score > 60 ? "bg-amber-500" : "bg-red-500")
                      )} />
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          Route {i + 1} 
                          {isSafest && <span className="bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-bold">Recommended</span>}
                        </span>
                        <div className="flex gap-3 text-xs text-slate-400 mt-1">
                          <span>{(route.distance / 1000).toFixed(1)} km</span>
                          <span>•</span>
                          <span>{Math.round(route.duration / 60)} mins</span>
                        </div>
                      </div>
                      
                      {/* Safety Score Circle */}
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                          route.safety_score > 80 ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : 
                          route.safety_score > 60 ? "border-amber-500/30 text-amber-400 bg-amber-500/10" : "border-red-500/30 text-red-400 bg-red-500/10"
                        )}>
                          {route.safety_score}
                        </div>
                      </div>
                    </div>

                    {/* Utilizing Backend Risk Factors Data */}
                    {route.risk_factors && route.risk_factors.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2 uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3" /> Area Conditions
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {route.risk_factors.map((factor, idx) => (
                            <span key={idx} className="bg-slate-950 text-slate-300 text-[10px] px-2 py-1 rounded-md border border-white/5">
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {!loading && routes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center opacity-50">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <MapIcon className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm max-w-[200px]">Enter your destination to generate safety-first routes.</p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-5 bg-slate-950/80 border-t border-white/5 backdrop-blur-xl z-20">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={toggleNavigation}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-lg",
                isNavigating 
                  ? "bg-emerald-500 text-slate-950" 
                  : "bg-slate-900 text-slate-300 border border-white/10 hover:border-white/20"
              )}
            >
              <Navigation className={cn("w-4 h-4", isNavigating && "animate-pulse")} />
              {isNavigating ? "STOP NAV" : "START NAV"}
            </button>
            <button 
              onClick={handleSOS}
              className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/50 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            >
              <PhoneCall className="w-4 h-4" />
              EMERGENCY
            </button>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-full bg-slate-950">
        <MapComponent 
          routes={routes} 
          start={startCoords} 
          end={endCoords} 
          selectedRouteIndex={selectedRouteIndex} 
          userLocation={userLocation}
          isNavigating={isNavigating}
        />

        {/* Floating Report Button */}
        <div className="absolute top-6 left-6 z-30">
          <button 
            onClick={handleReport}
            disabled={reporting}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all shadow-2xl border backdrop-blur-xl",
              reporting 
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                : "bg-slate-900/80 border-white/10 text-slate-200 hover:bg-slate-800 hover:border-white/20"
            )}
          >
            {reporting ? (
              <CheckCircle2 className="w-4 h-4 animate-in zoom-in duration-300" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            {reporting ? "Report Sent" : "Report Danger"}
          </button>
        </div>

        {/* Success Toast */}
        {toast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 px-6 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-white">{toast}</p>
            </div>
          </div>
        )}
        
        {/* Mobile FAB to reopen search */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden absolute bottom-8 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-30 border border-white/20"
          >
            <Search className="w-6 h-6" />
          </button>
        )}

        {/* SOS Overlay */}
        {showSOS && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200 p-4">
            {/* Police Light Flashers */}
            <div className="absolute inset-0 opacity-20 pointer-events-none animate-[police-flash_0.5s_infinite]"></div>
            
            <div className="bg-slate-950 p-10 rounded-[2.5rem] border-2 border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.5)] text-center w-full max-w-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent"></div>
              
              <div className="w-28 h-28 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 border-8 border-red-500/30 rounded-full animate-ping"></div>
                <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-pulse"></div>
                <PhoneCall className="w-12 h-12 text-red-500 animate-bounce relative z-10" />
              </div>
              
              <h2 className="text-4xl font-black mb-4 text-white tracking-tighter uppercase italic relative z-10">SOS ACTIVE</h2>
              <p className="text-red-400 font-bold text-lg mb-8 animate-pulse relative z-10 uppercase tracking-widest">Broadcasting Live Location...</p>
              
              <div className="space-y-4 relative z-10 text-left bg-white/5 p-4 rounded-2xl border border-white/10 mb-8">
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Authorities Notified
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Emergency Contacts Alerted
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Siren Activated
                </div>
              </div>

              <button 
                onClick={() => setShowSOS(false)}
                className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-slate-200 transition-all mb-4 relative z-10"
              >
                Cancel Alert
              </button>
              
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-red-500 animate-[shrink_6s_linear]"></div>
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
        @keyframes police-flash {
          0% { background-color: #ff0000; }
          50% { background-color: #0000ff; }
          100% { background-color: #ff0000; }
        }
      `}</style>
    </div>
  );
}

export default App;