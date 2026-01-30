import React from 'react';
import { Token } from '../types';

interface PatientHistoryProps {
  history: Token[];
  onBack: () => void;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ history, onBack }) => {
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={onBack} className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 mb-2">
            <i className="fas fa-arrow-left"></i> Back to Search
          </button>
          <h1 className="text-3xl font-bold text-slate-800">My OPD History</h1>
          <p className="text-slate-500">View and manage your past consultations.</p>
        </div>
        <div className="bg-blue-50 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm">
          <i className="fas fa-clock-rotate-left text-xl"></i>
        </div>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <i className="fas fa-calendar-xmark text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-700">No History Found</h3>
          <p className="text-slate-500 mt-2">You haven't booked any OPD tokens yet.</p>
          <button 
            onClick={onBack}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Book My First Token
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedHistory.map((token, index) => (
            <div 
              key={token.id} 
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Timeline Connector */}
              {index !== sortedHistory.length - 1 && (
                <div className="absolute left-9 top-20 bottom-0 w-0.5 bg-slate-100"></div>
              )}
              
              <div className="flex gap-6">
                <div className="shrink-0 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md relative overflow-hidden ${
                    token.status === 'Completed' ? 'bg-emerald-500' : 
                    token.status === 'Cancelled' ? 'bg-red-400' : 'bg-blue-500'
                  }`}>
                    <i className={`fas ${token.status === 'Completed' ? 'fa-check' : token.status === 'Cancelled' ? 'fa-xmark' : 'fa-hourglass-half'} z-10`}></i>
                    {/* Optional: Add hospital image as background hint */}
                  </div>
                  <div className="mt-2 text-[10px] font-black uppercase text-slate-400">
                    {new Date(token.bookedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                    <div className="flex gap-3">
                      {/* Optional small hospital logo here */}
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                          {token.hospitalName}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {token.departmentName} • {token.doctorName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        token.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 
                        token.status === 'Cancelled' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {token.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Token #{token.tokenNumber}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <i className="fas fa-calendar text-blue-400"></i>
                      {new Date(token.bookedAt).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <i className="fas fa-clock text-blue-400"></i>
                      {token.status === 'Completed' ? `Consulted at ${token.estimatedTime}` : `Est. ${token.estimatedTime}`}
                    </div>
                    {token.slotTime && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <i className="fas fa-calendar-check text-blue-400"></i>
                        Slot: {token.slotTime}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistory;