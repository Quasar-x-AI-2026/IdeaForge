
import React, { useEffect, useState, useRef } from 'react';
import { Token, Hospital } from '../types';

interface QueueTrackerProps {
  token: Token;
  onCancel: () => void;
  hospitals: Hospital[];
}

const QueueTracker: React.FC<QueueTrackerProps> = ({ token, onCancel, hospitals }) => {
  // Find the live doctor data from the hospitals prop
  const getLiveDoctor = () => {
    const hospital = hospitals.find(h => h.id === token.hospitalId);
    return hospital?.departments.flatMap(d => d.doctors).find(doc => doc.name === token.doctorName);
  };

  const doctor = getLiveDoctor();
  
  const [currentRunningToken, setCurrentRunningToken] = useState(doctor?.currentToken || token.tokenNumber - 4);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const pollInterval = useRef<number | null>(null);

  // Function to sync with "Remote" data (the hospitals prop in this mock)
  const syncData = () => {
    setIsSyncing(true);
    // Simulate network delay
    setTimeout(() => {
      const liveDoc = getLiveDoctor();
      if (liveDoc) {
        setCurrentRunningToken(liveDoc.currentToken);
        setLastSync(new Date());
      }
      setIsSyncing(false);
    }, 600);
  };

  // Set up polling mechanism
  useEffect(() => {
    // Initial sync
    syncData();

    // Poll every 5 seconds to check for admin updates
    pollInterval.current = window.setInterval(() => {
      syncData();
    }, 5000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [token.hospitalId, token.doctorName]);

  // Recalculate estimated wait time based on queue difference and admin delays
  useEffect(() => {
    if (!doctor) return;
    
    const diff = Math.max(0, token.tokenNumber - currentRunningToken);
    const wait = (diff * doctor.averageConsultationTime) + (doctor.delayMinutes || 0);
    setEstimatedWait(wait);
  }, [currentRunningToken, token.tokenNumber, doctor]);

  const isNearing = token.tokenNumber - currentRunningToken <= 2 && token.tokenNumber > currentRunningToken;
  const isNow = token.tokenNumber === currentRunningToken;
  const isPassed = currentRunningToken > token.tokenNumber;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header Section with dynamic status colors */}
        <div className={`p-8 text-white transition-colors duration-500 relative ${
          isNow ? 'bg-emerald-600' : isNearing ? 'bg-amber-500' : isPassed ? 'bg-slate-500' : 'bg-blue-600'
        }`}>
          {/* Real-time Sync Indicator */}
          <div className="absolute top-4 right-8 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-white animate-ping' : 'bg-emerald-400'} shadow-lg`}></div>
            <span className="text-[9px] font-black uppercase tracking-tighter opacity-80">
              {isSyncing ? 'Syncing...' : 'Live Connected'}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 border-2 border-white/20 shadow-lg flex items-center justify-center">
                <i className="fas fa-hospital text-xl"></i>
              </div>
              <div>
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">OPD Tracking ID: {token.id}</p>
                <h2 className="text-2xl font-bold">{token.hospitalName}</h2>
                <p className="text-sm opacity-80">{token.departmentName} • {token.doctorName}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Your Token</p>
              <p className="text-6xl font-black">#{token.tokenNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Currently Serving</p>
              <p className="text-4xl font-bold">#{currentRunningToken}</p>
              <p className="text-[9px] font-bold opacity-50 mt-1">Last Updated: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
          </div>
        </div>

        {/* Progress and Real-time Alerts Section */}
        <div className="p-8 space-y-8">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
              <span>Queue Position</span>
              <span>{Math.max(0, token.tokenNumber - currentRunningToken)} People Ahead</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isNow ? 'bg-emerald-500' : isNearing ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, (currentRunningToken / token.tokenNumber) * 100))}%` }}
              ></div>
            </div>
          </div>

          {/* Real-time Delay Alerts from Hospital Admin */}
          {doctor?.statusMessage || (doctor?.delayMinutes && doctor.delayMinutes > 0) ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                <i className="fas fa-triangle-exclamation text-xl"></i>
              </div>
              <div>
                <p className="font-black text-amber-800 text-xs uppercase tracking-wider mb-1">Live Delay Notification</p>
                <p className="text-sm text-amber-700 leading-relaxed font-medium">
                  {doctor.statusMessage || `The doctor is currently delayed by approx. ${doctor.delayMinutes} minutes due to hospital load.`}
                </p>
              </div>
            </div>
          ) : null}

          {/* Wait Time Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Est. Waiting Time</p>
              <p className={`text-3xl font-black ${isPassed ? 'text-slate-300' : 'text-slate-800'}`}>
                {isNow ? '0' : isPassed ? '--' : estimatedWait} <span className="text-xs uppercase font-bold text-slate-400">Mins</span>
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Booking Slot</p>
              <p className={`text-xl font-bold ${isPassed ? 'text-slate-300' : 'text-slate-800'}`}>
                {isPassed ? 'Passed' : token.estimatedTime}
              </p>
            </div>
          </div>

          {/* Turn Alerts */}
          {isNearing && !isNow && (
            <div className="bg-blue-600 text-white rounded-2xl p-5 flex items-center gap-4 shadow-xl shadow-blue-200 animate-bounce">
              <i className="fas fa-bell text-2xl"></i>
              <div>
                <p className="font-bold">Almost your turn!</p>
                <p className="text-xs opacity-80">Please proceed to {doctor?.currentRoom || 'the OPD room'} immediately. You are next or 2nd in line.</p>
              </div>
            </div>
          )}

          {isNow && (
            <div className="bg-emerald-600 text-white rounded-2xl p-5 flex items-center gap-4 shadow-xl shadow-emerald-200 animate-pulse">
              <i className="fas fa-door-open text-2xl"></i>
              <div>
                <p className="font-bold">Entry Permitted!</p>
                <p className="text-xs opacity-80">Your token #{token.tokenNumber} is being called. Please enter {doctor?.currentRoom || 'the room'} now.</p>
              </div>
            </div>
          )}

          {isPassed && (
            <div className="bg-slate-100 text-slate-600 rounded-2xl p-5 flex items-center gap-4 border border-slate-200">
              <i className="fas fa-circle-exclamation text-2xl text-slate-400"></i>
              <div>
                <p className="font-bold">Appointment Complete</p>
                <p className="text-xs opacity-70">Your turn has passed. If you missed it, please contact the OPD counter.</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex flex-col gap-3">
            <button 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <i className="fas fa-share-nodes"></i> Share Live Link
            </button>
            <button 
              onClick={onCancel}
              className="w-full py-4 bg-white text-red-600 border-2 border-red-50 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95"
            >
              Cancel OPD Token
            </button>
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-6 flex items-center justify-center gap-8 border-t border-slate-100">
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <i className="fas fa-circle-check text-emerald-500"></i> Encrypted
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <i className="fas fa-bolt text-amber-500"></i> Live Sync
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <i className="fas fa-robot text-blue-500"></i> AI Smart Predict
           </div>
        </div>
      </div>
    </div>
  );
};

export default QueueTracker;
