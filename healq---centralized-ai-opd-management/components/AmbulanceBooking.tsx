
import React, { useState } from 'react';
import { Ambulance, AmbulanceRequest } from '../types';
import { MOCK_AMBULANCES } from '../constants';

interface AmbulanceBookingProps {
  onBack: () => void;
  onRequested: (request: AmbulanceRequest) => void;
}

const AmbulanceBooking: React.FC<AmbulanceBookingProps> = ({ onBack, onRequested }) => {
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAmbulance = MOCK_AMBULANCES.find(a => a.id === selectedAmbulanceId);

  const handleRequest = () => {
    if (!selectedAmbulance || !patientName || !patientPhone || !pickupLocation) return;
    
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      const request: AmbulanceRequest = {
        id: Math.random().toString(36).substr(2, 9),
        ambulanceId: selectedAmbulance.id,
        patientName,
        patientPhone,
        pickupLocation,
        status: 'Requested',
        requestedAt: new Date().toISOString(),
        estimatedArrival: Math.floor(selectedAmbulance.distance * 3 + 2), // Simple heuristic
      };
      
      onRequested(request);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 group">
        <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ambulance Selection List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Select Available Ambulance</h2>
            <span className="text-[10px] font-black uppercase text-slate-400">Nearest first</span>
          </div>

          <div className="space-y-3">
            {MOCK_AMBULANCES.map(amb => (
              <button
                key={amb.id}
                onClick={() => setSelectedAmbulanceId(amb.id)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex items-center gap-4 ${
                  selectedAmbulanceId === amb.id ? 'border-red-500 bg-red-50' : 'border-white bg-white hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedAmbulanceId === amb.id ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <i className="fas fa-truck-medical text-xl"></i>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-800 truncate">{amb.type}</p>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{amb.regNo}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{amb.hospitalName}</p>
                  
                  <div className="mt-2 p-2 bg-white/50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Driver</span>
                      <span className="text-[11px] font-bold text-slate-700">{amb.driverName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <i className="fas fa-phone-alt text-[10px]"></i>
                      <span className="text-[11px] font-black">{amb.driverPhone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                      <i className="fas fa-location-dot"></i> {amb.distance} km away
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <i className="fas fa-clock"></i> ~{Math.floor(amb.distance * 3 + 2)} mins
                    </span>
                  </div>
                </div>
                {selectedAmbulanceId === amb.id && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-red-500 text-white p-1 rounded-bl-lg">
                      <i className="fas fa-check text-[10px]"></i>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Request Form */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 bg-slate-900 text-white">
            <h3 className="text-2xl font-bold">Request Emergency</h3>
            <p className="text-slate-400 text-sm mt-1">Confirm pickup details for the selected vehicle.</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Patient Name</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pickup Location</label>
                <div className="relative">
                  <i className="fas fa-map-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="text"
                    placeholder="Complete address or landmarks"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <i className="fas fa-shield-heart"></i> Emergency Protocol
              </div>
              <p className="text-xs text-red-700 leading-relaxed opacity-80">
                By confirming, you agree that this is a life-critical emergency request. False requests are punishable under local laws. Driver will contact you immediately upon confirmation.
              </p>
            </div>

            <button
              onClick={handleRequest}
              disabled={!selectedAmbulanceId || !patientName || patientPhone.length < 10 || !pickupLocation || isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
                selectedAmbulanceId && patientName && patientPhone.length >= 10 && pickupLocation && !isSubmitting
                ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner animate-spin"></i> DISPATCHING...
                </>
              ) : (
                <>
                  <i className="fas fa-phone-volume animate-pulse"></i> CONFIRM & DISPATCH
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceBooking;
