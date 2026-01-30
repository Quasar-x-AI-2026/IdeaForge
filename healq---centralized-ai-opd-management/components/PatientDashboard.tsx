
import React, { useState, useMemo, useEffect } from 'react';
import { Hospital } from '../types';

interface PatientDashboardProps {
  hospitals: Hospital[];
  onSelectHospital: (hospital: Hospital) => void;
  onRequestAmbulance: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ hospitals, onSelectHospital, onRequestAmbulance }) => {
  const [filterType, setFilterType] = useState<'All' | 'Government' | 'Private'>('All');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [isLocating, setIsLocating] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Get unique states from hospitals list
  const availableStates = useMemo(() => {
    const states = new Set(hospitals.map(h => h.state));
    return ['All States', ...Array.from(states).sort()];
  }, [hospitals]);

  // Ticker Logic: Cycle through major hospitals and their ongoing tokens
  const tickerItems = useMemo(() => {
    return hospitals.slice(0, 10).map(h => {
      const doctors = h.departments.flatMap(d => d.doctors);
      const avgToken = doctors.length > 0 ? Math.floor(doctors.reduce((acc, d) => acc + d.currentToken, 0) / doctors.length) : 0;
      return { name: h.name, token: avgToken, dept: h.departments[0]?.name || 'OPD' };
    });
  }, [hospitals]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tickerItems]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => setIsLocating(false),
      () => setIsLocating(false)
    );
  };

  const displayedHospitals = useMemo(() => {
    let result = [...hospitals];
    if (filterType !== 'All') {
      result = result.filter(h => h.type === filterType);
    }
    if (selectedState !== 'All States') {
      result = result.filter(h => h.state === selectedState);
    }
    return result;
  }, [hospitals, filterType, selectedState]);

  const getOngoingTokenDisplay = (h: Hospital) => {
    const doctors = h.departments.flatMap(d => d.doctors);
    if (doctors.length === 0) return '--';
    const minToken = Math.min(...doctors.map(d => d.currentToken));
    const maxToken = Math.max(...doctors.map(d => d.currentToken));
    
    if (minToken === maxToken) return `#${minToken}`;
    return `#${minToken} - #${maxToken}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Live OPD Ticker */}
      <div className="bg-slate-900 rounded-2xl p-4 flex items-center gap-4 overflow-hidden border-b-4 border-blue-600 shadow-xl">
        <div className="flex items-center gap-2 shrink-0 border-r border-slate-700 pr-4">
           <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Live OPD Feed</span>
        </div>
        <div className="flex-grow relative h-6 overflow-hidden">
           <div 
             className="absolute w-full transition-all duration-700 ease-in-out flex items-center justify-between"
             style={{ transform: `translateY(-${tickerIndex * 100}%)` }}
           >
             {tickerItems.map((item, idx) => (
               <div key={idx} className="h-6 flex items-center justify-between w-full shrink-0">
                 <p className="text-blue-400 text-xs font-bold uppercase truncate max-w-[60%]">
                    {item.name} <span className="text-slate-500 mx-2">|</span> {item.dept}
                 </p>
                 <p className="text-emerald-400 text-sm font-black tracking-tighter">
                   NOW SERVING: #{item.token}
                 </p>
               </div>
             ))}
           </div>
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            Heal<span className="text-blue-600">Q</span> Dashboard
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
             Centralized network for tracking ongoing tokens across 150+ facilities and nationwide.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLocate}
            disabled={isLocating}
            className={`bg-white text-slate-700 border-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${isLocating ? 'opacity-50' : 'hover:bg-slate-50 active:scale-95'}`}
          >
            <i className={`fas ${isLocating ? 'fa-spinner animate-spin' : 'fa-location-crosshairs text-blue-500'}`}></i>
            Nearest Hospital
          </button>
          <button 
            onClick={onRequestAmbulance}
            className="bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95"
          >
            <i className="fas fa-truck-medical"></i>
            SOS Emergency
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
          {(['All', 'Government', 'Private'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterType === type ? 'bg-white text-blue-600 shadow-md border border-slate-100' : 'text-slate-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region:</span>
           <select 
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-xs font-black uppercase text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {availableStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedHospitals.map(h => (
          <div 
            key={h.id} 
            className="group bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col"
            onClick={() => onSelectHospital(h)}
          >
            <div className="h-52 bg-slate-900 relative flex items-center justify-center overflow-hidden">
              <i className="fas fa-hospital text-9xl text-white/5 group-hover:scale-125 transition-transform duration-700"></i>
              
              <div className="absolute top-6 left-6">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/10 text-white backdrop-blur-md border border-white/10">
                  {h.type}
                </span>
              </div>

              {/* LIVE TOKEN BOARD - Centralized Ongoing Status */}
              <div className="absolute inset-x-6 bottom-6">
                 <div className="bg-emerald-600 text-white p-5 rounded-[2rem] shadow-2xl shadow-emerald-900/40 flex items-center justify-between border border-emerald-500 group-hover:scale-105 transition-transform">
                    <div className="flex flex-col">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Serving Now</span>
                       </div>
                       <span className="text-3xl font-black leading-none font-mono">{getOngoingTokenDisplay(h)}</span>
                    </div>
                    <div className="h-12 w-px bg-white/20"></div>
                    <div className="flex flex-col text-right">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">In Queue</span>
                       <span className="text-3xl font-black leading-none">{h.totalWaitingCount}</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-8 flex-grow space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-2">
                  {h.name}
                </h3>
                <p className="text-xs text-slate-500 font-bold flex items-center gap-2 mt-2">
                  <i className="fas fa-map-pin text-rose-500"></i> {h.location}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {h.facilities.slice(0, 3).map((f, i) => (
                  <span key={i} className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    {f}
                  </span>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Availability Status</span>
                   <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Open Now</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                   <i className="fas fa-arrow-right"></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientDashboard;
