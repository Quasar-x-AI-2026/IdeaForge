
import React, { useState, useEffect } from 'react';
import { Hospital, Doctor, Token, PredictionResult, Slot } from '../types';
import { predictWaitTime, generateSmsConfirmation } from '../services/geminiService';

interface TokenBookingProps {
  hospital: Hospital;
  onBack: () => void;
  onBooked: (token: Token) => void;
}

const TokenBooking: React.FC<TokenBookingProps> = ({ hospital, onBack, onBooked }) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [enableSms, setEnableSms] = useState(true);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const selectedDept = hospital.departments.find(d => d.id === selectedDeptId);
  const selectedDoc = selectedDept?.doctors.find(doc => doc.id === selectedDocId);
  const selectedSlot = selectedDoc?.slots.find(s => s.id === selectedSlotId);

  // Calculate predicted token number based on doctor's current state and slot position
  const getPredictedToken = (slot: Slot) => {
    if (!selectedDoc) return 0;
    const slotIndex = selectedDoc.slots.findIndex(s => s.id === slot.id);
    return selectedDoc.currentToken + selectedDoc.currentQueue + slotIndex + 1;
  };

  useEffect(() => {
    if (selectedDoc && selectedSlot) {
      setIsPredicting(true);
      predictWaitTime(selectedDoc, selectedSlot.bookedCount + 1).then(res => {
        setPrediction(res);
        setIsPredicting(false);
      });
    } else {
      setPrediction(null);
    }
  }, [selectedDoc, selectedSlot]);

  const handleBookToken = async () => {
    if (!selectedDoc || !selectedDept || !selectedSlot || !patientName || !patientPhone) return;

    setIsBooking(true);
    const totalWaitMinutes = (prediction?.estimatedWaitMinutes || 0) + (selectedDoc.delayMinutes || 0);
    const predictedTokenNo = getPredictedToken(selectedSlot);

    const newToken: Token = {
      id: Math.random().toString(36).substr(2, 9),
      tokenNumber: predictedTokenNo,
      patientName,
      patientPhone: enableSms ? patientPhone : undefined,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      departmentName: selectedDept.name,
      doctorName: selectedDoc.name,
      status: 'Waiting',
      bookedAt: new Date().toISOString(),
      estimatedTime: new Date(Date.now() + totalWaitMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      slotTime: selectedSlot.timeRange,
    };

    if (enableSms && patientPhone.length === 10) {
      const smsContent = await generateSmsConfirmation(newToken);
      console.log(`[HealQ SMS] Sent to +91 ${patientPhone}: "${smsContent}"`);
    }

    onBooked(newToken);
    setIsBooking(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 group">
        <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Back to Hospital List
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
          <i className="fas fa-hospital absolute -right-4 -bottom-4 text-white/5 text-9xl"></i>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-blue-400">
                {hospital.type}
              </span>
              <span className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <i className="fas fa-location-dot"></i> {hospital.state}
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight uppercase">{hospital.name}</h2>
            <p className="text-slate-400 font-medium flex items-center gap-2 mt-1">
              <i className="fas fa-map-marker-alt"></i> {hospital.location}
            </p>
          </div>
        </div>

        <div className="p-8 space-y-10">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">1</span>
              Department
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {hospital.departments.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => { setSelectedDeptId(dept.id); setSelectedDocId(null); setSelectedSlotId(null); }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                    selectedDeptId === dept.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <p className="font-black text-xs uppercase tracking-tight">{dept.name}</p>
                  <p className="text-[9px] opacity-60 uppercase font-black tracking-widest mt-1">{dept.doctors.length} Doctors</p>
                </button>
              ))}
            </div>
          </div>

          {selectedDept && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">2</span>
                Physician (Check Live Token Status)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDept.doctors.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => { setSelectedDocId(doc.id); setSelectedSlotId(null); }}
                    className={`p-6 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden group ${
                      selectedDocId === doc.id ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-50/50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white shrink-0 border border-slate-200 shadow-sm flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors">
                        <i className="fas fa-user-doctor text-3xl"></i>
                      </div>
                      <div className="min-w-0 flex-grow">
                        <p className={`font-black uppercase tracking-tight text-lg leading-tight ${selectedDocId === doc.id ? 'text-blue-900' : 'text-slate-800'}`}>
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{doc.specialty}</p>
                        
                        {/* THE ONGOING TOKEN MENTION */}
                        <div className="flex items-center gap-3 mt-4">
                           <div className="flex flex-col bg-emerald-600 text-white px-4 py-2 rounded-2xl border-b-4 border-emerald-800 shadow-lg shadow-emerald-100">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                <span className="text-[8px] font-black uppercase tracking-widest">Ongoing</span>
                              </div>
                              <span className="text-xl font-black leading-none font-mono">#{doc.currentToken}</span>
                           </div>
                           <div className="flex flex-col px-3">
                              <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter mb-1">In Queue</span>
                              <span className="text-xl font-black text-slate-800 leading-none">{doc.currentQueue}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedDoc && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">3</span>
                  Appointment Slot
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedDoc.slots.map(slot => {
                  const predictedToken = getPredictedToken(slot);
                  const occupancyPercent = (slot.bookedCount / slot.maxCapacity) * 100;
                  const isFull = slot.bookedCount >= slot.maxCapacity;

                  return (
                    <button
                      key={slot.id}
                      disabled={isFull}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-6 rounded-[2.5rem] border-2 text-left flex flex-col gap-4 relative overflow-hidden group ${
                        isFull ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-100' :
                        selectedSlotId === slot.id ? 'border-blue-600 bg-blue-50 shadow-2xl shadow-blue-100' : 'border-slate-100 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className={`text-xl font-black uppercase tracking-tight ${selectedSlotId === slot.id ? 'text-blue-900' : 'text-slate-800'}`}>
                            {slot.timeRange}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                              <i className="fas fa-users mr-1"></i> {slot.bookedCount} booked
                            </span>
                          </div>
                        </div>

                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                          selectedSlotId === slot.id ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                           <span className="text-[8px] font-black uppercase">Token</span>
                           <span className="text-lg font-black">#{predictedToken}</span>
                        </div>
                      </div>

                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${occupancyPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${occupancyPercent}%` }}
                        ></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedSlot && (
            <div className="space-y-8 animate-slide-up pt-10 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Patient Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                <i className="fas fa-sparkles absolute -right-6 -bottom-6 text-white/10 text-9xl"></i>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                   <div className="text-center md:text-left">
                      <p className="text-[10px] font-black uppercase text-blue-200 mb-1 tracking-widest">Expected Wait</p>
                      <div className="flex items-baseline justify-center md:justify-start gap-2">
                        <span className="text-5xl font-black">~{prediction?.estimatedWaitMinutes || '--'}</span>
                        <span className="text-sm font-bold opacity-60 uppercase">Mins</span>
                      </div>
                   </div>
                   <div className="text-center md:text-left border-t md:border-t-0 md:border-l border-white/20 pt-6 md:pt-0 md:pl-10">
                      <p className="text-[10px] font-black uppercase text-blue-200 mb-1 tracking-widest">Your Assigned Token</p>
                      <span className="text-5xl font-black text-amber-400">#{getPredictedToken(selectedSlot)}</span>
                   </div>
                </div>
              </div>

              <button
                onClick={handleBookToken}
                disabled={!patientName || patientPhone.length < 10 || isBooking || !selectedSlotId}
                className={`w-full py-6 rounded-3xl text-xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
                  patientName && patientPhone.length >= 10 && !isBooking && selectedSlotId ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isBooking ? (
                  <>
                    <i className="fas fa-spinner animate-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-ticket"></i> Book Token #{selectedSlot ? getPredictedToken(selectedSlot) : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenBooking;
