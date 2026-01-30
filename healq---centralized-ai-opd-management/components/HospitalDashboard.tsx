import React, { useState } from 'react';
import { Hospital } from '../types';

interface HospitalDashboardProps {
  hospital: Hospital;
  onUpdateHospital: (hospital: Hospital) => void;
}

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ hospital, onUpdateHospital }) => {
  const [smsLoading, setSmsLoading] = useState<string | null>(null);

  const handleAdvanceToken = (docId: string) => {
    const newDepts = hospital.departments.map(dept => ({
      ...dept,
      doctors: dept.doctors.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            currentToken: doc.currentToken + 1,
            currentQueue: Math.max(0, doc.currentQueue - 1)
          };
        }
        return doc;
      })
    }));
    onUpdateHospital({ ...hospital, departments: newDepts, totalWaitingCount: Math.max(0, hospital.totalWaitingCount - 1) });
  };

  const updateStatusMessage = (docId: string, msg: string) => {
    const newDepts = hospital.departments.map(dept => ({
      ...dept,
      doctors: dept.doctors.map(doc => {
        if (doc.id === docId) {
          return { ...doc, statusMessage: msg };
        }
        return doc;
      })
    }));
    onUpdateHospital({ ...hospital, departments: newDepts });
  };

  const updateDelay = (docId: string, delay: number) => {
    const newDepts = hospital.departments.map(dept => ({
      ...dept,
      doctors: dept.doctors.map(doc => {
        if (doc.id === docId) {
          return { ...doc, delayMinutes: delay };
        }
        return doc;
      })
    }));
    onUpdateHospital({ ...hospital, departments: newDepts });
  };

  const handleSmsBroadcast = (docId: string) => {
    setSmsLoading(docId);
    setTimeout(() => {
      setSmsLoading(null);
    }, 1500);
  };

  const updateBeds = (count: number) => {
    const validCount = isNaN(count) ? 0 : Math.max(0, count);
    onUpdateHospital({
      ...hospital,
      bedAvailability: { ...hospital.bedAvailability, available: validCount }
    });
  };

  const occupancyRate = ((hospital.bedAvailability.total - hospital.bedAvailability.available) / hospital.bedAvailability.total) * 100;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header with quick stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{hospital.name}</h1>
          <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Administrative Console
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Bed Management Card */}
          <div className="bg-slate-50 border-2 border-blue-100 rounded-2xl p-4 flex items-center gap-4 min-w-[240px] relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Live Bed Inventory</p>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={hospital.bedAvailability.available} 
                  onChange={(e) => updateBeds(parseInt(e.target.value))}
                  className="w-20 text-2xl font-black text-slate-900 bg-white border-b-2 border-blue-200 focus:border-blue-600 outline-none transition-colors"
                />
                <span className="text-slate-400 font-bold text-xl">/ {hospital.bedAvailability.total}</span>
              </div>
              <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Available for Admission</p>
            </div>
            <div className="ml-auto flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                <i className="fas fa-bed text-xl"></i>
              </div>
            </div>
            {/* Occupancy Indicator */}
            <div className="absolute bottom-0 left-0 h-1 bg-slate-200 w-full">
              <div 
                className={`h-full transition-all duration-1000 ${occupancyRate > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
           <i className="fas fa-users absolute -right-4 -bottom-4 text-white/5 text-8xl"></i>
           <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Live Queue</p>
           <p className="text-5xl font-black">{hospital.totalWaitingCount}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Doctors</p>
           <p className="text-4xl font-black text-slate-800">
             {hospital.departments.flatMap(d => d.doctors).filter(doc => doc.availability === 'Available').length}
           </p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Today's Visits</p>
           <p className="text-4xl font-black text-slate-800">1,242</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Occupancy Rate</p>
           <p className="text-4xl font-black text-slate-800">{Math.round(occupancyRate)}%</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <i className="fas fa-stethoscope"></i>
            </div>
            OPD Terminal Management
          </h2>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Real-time Sync Enabled
          </div>
        </div>
        
        {hospital.departments.map(dept => (
          <div key={dept.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{dept.name}</h3>
              <span className="text-[10px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                {dept.doctors.length} Doctors Active
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {dept.doctors.map(doc => (
                <div key={doc.id} className="p-8 space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                           <i className="fas fa-user-doctor text-4xl"></i>
                        </div>
                        <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white shadow-sm ${doc.availability === 'Available' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-xl">{doc.name}</p>
                        <p className="text-sm text-slate-500 font-bold flex items-center gap-2">
                          {doc.specialty} <span className="w-1 h-1 rounded-full bg-slate-300"></span> {doc.currentRoom}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-12 lg:px-12 lg:border-x border-slate-100">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Serving</p>
                        <p className="text-4xl font-black text-blue-600">#{doc.currentToken}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Waiting</p>
                        <p className="text-4xl font-black text-slate-900">{doc.currentQueue}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleAdvanceToken(doc.id)}
                        className="px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 group"
                      >
                        NEXT PATIENT <i className="fas fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Status Message */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Public Status Alert</p>
                        <input 
                          type="text"
                          placeholder="e.g. Delayed due to emergency"
                          className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                          value={doc.statusMessage || ''}
                          onChange={(e) => updateStatusMessage(doc.id, e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => updateStatusMessage(doc.id, 'Doctor is on Emergency Rounds')}
                          className="px-3 py-2 text-[10px] font-black bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                        >
                          <i className="fas fa-hospital-user mr-1"></i> ROUNDS
                        </button>
                        <button 
                          onClick={() => updateStatusMessage(doc.id, 'Counter Temporarily Closed')}
                          className="px-3 py-2 text-[10px] font-black bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                        >
                          <i className="fas fa-lock mr-1"></i> CLOSED
                        </button>
                        <button 
                          onClick={() => updateStatusMessage(doc.id, '')}
                          className="px-3 py-2 text-[10px] font-black bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          CLEAR
                        </button>
                      </div>
                    </div>

                    {/* Delay & SMS Broadcast */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-grow">
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Wait Offset (Minutes)</p>
                          <div className="relative">
                             <input 
                              type="number"
                              className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                              value={doc.delayMinutes || 0}
                              onChange={(e) => updateDelay(doc.id, parseInt(e.target.value))}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">MINS</span>
                          </div>
                        </div>
                        <div className="pt-6">
                          <button 
                            onClick={() => handleSmsBroadcast(doc.id)}
                            disabled={smsLoading === doc.id}
                            className={`px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                              smsLoading === doc.id ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95'
                            }`}
                          >
                            <i className={`fas ${smsLoading === doc.id ? 'fa-spinner animate-spin' : 'fa-broadcast-tower'}`}></i>
                            {smsLoading === doc.id ? 'NOTIFYING...' : 'BROADCAST ALERT'}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white/50 rounded-xl border border-slate-200/50">
                        <i className="fas fa-info-circle text-blue-500 text-xs"></i>
                        <p className="text-[9px] text-slate-500 font-bold leading-tight">
                          Broadcasting will instantly notify all {doc.currentQueue} patients currently in the digital queue via in-app alerts and SMS.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalDashboard;