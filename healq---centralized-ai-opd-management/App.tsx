import React, { useState, useEffect } from 'react';
import { UserRole, Hospital, Token, AmbulanceRequest, Ambulance } from './types';
import PatientDashboard from './components/PatientDashboard';
import TokenBooking from './components/TokenBooking';
import HospitalDashboard from './components/HospitalDashboard';
import QueueTracker from './components/QueueTracker';
import PatientHistory from './components/PatientHistory';
import NotificationToast from './components/NotificationToast';
import AmbulanceBooking from './components/AmbulanceBooking';
import DoctorBotPage from './DoctorBotPage';
import { MOCK_HISTORY, MOCK_HOSPITALS, MOCK_AMBULANCES } from './constants';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [currentView, setCurrentView] = useState<
    'LIST' | 'BOOKING' | 'LIVE_TRACKER' | 'HISTORY' | 'ADMIN' | 'AMBULANCE' | 'BOT'
  >('LIST');
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<Token | null>(null);
  const [history, setHistory] = useState<Token[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [activeAmbulanceRequest, setActiveAmbulanceRequest] = useState<AmbulanceRequest | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId) || null;
  const activeAmbulance = activeAmbulanceRequest
    ? MOCK_AMBULANCES.find(a => a.id === activeAmbulanceRequest.ambulanceId)
    : null;

  useEffect(() => {
    const savedHistory = localStorage.getItem('opd_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    } else {
      setHistory(MOCK_HISTORY);
      localStorage.setItem('opd_history', JSON.stringify(MOCK_HISTORY));
    }
    const path = window.location.pathname;
    if (path === '/bot') {
      setRole(UserRole.PATIENT);
      setCurrentView('BOT');
    } else if (path === '/opd') {
      setRole(UserRole.PATIENT);
      setCurrentView('LIST');
    }
  }, []);

  const navigateToView = (view: typeof currentView) => {
    setIsSwitching(true);
    setCurrentView(view);
    if (view === 'BOT') {
      window.history.pushState(null, '', '/bot');
    } else {
      window.history.pushState(null, '', '/opd');
    }
    setTimeout(() => {
      setIsSwitching(false);
    }, 250);
  };

  const handleBooking = (token: Token) => {
    setActiveToken(token);
    const updatedHistory = [token, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('opd_history', JSON.stringify(updatedHistory));

    navigateToView('LIVE_TRACKER');
    setToast({ message: `Token #${token.tokenNumber} Booked Successfully!`, type: 'success' });
  };

  const handleAmbulanceRequested = (request: AmbulanceRequest) => {
    setActiveAmbulanceRequest(request);
    navigateToView('LIST');
    setToast({
      message: `Emergency Dispatched! ETA: ${request.estimatedArrival} mins`,
      type: 'warning'
    });
  };

  const handleUpdateHospital = (updatedHospital: Hospital) => {
    setHospitals(prev => prev.map(h => h.id === updatedHospital.id ? updatedHospital : h));
  };

  const handleCancelToken = () => {
    if (window.confirm("Are you sure you want to cancel your OPD token?")) {
      if (activeToken) {
        const updatedHistory = history.map(t =>
          t.id === activeToken.id ? { ...t, status: 'Cancelled' as const } : t
        );
        setHistory(updatedHistory);
        localStorage.setItem('opd_history', JSON.stringify(updatedHistory));
      }
      setActiveToken(null);
      navigateToView('LIST');
      setToast({ message: "Token cancelled successfully.", type: 'warning' });
    }
  };

  const switchRole = () => {
    const newRole = role === UserRole.PATIENT ? UserRole.HOSPITAL_ADMIN : UserRole.PATIENT;
    setRole(newRole);
    if (newRole === UserRole.PATIENT) {
      navigateToView('LIST');
    } else {
      setCurrentView('ADMIN');
      window.history.pushState(null, '', '/opd');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isSwitching && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (role === UserRole.PATIENT) {
                navigateToView('LIST');
              } else {
                setCurrentView('ADMIN');
                window.history.pushState(null, '', '/opd');
              }
            }}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-heartbeat text-white text-xl"></i>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">Heal<span className="text-blue-600">Q</span></span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {role === UserRole.PATIENT && (
              <button
                onClick={() => navigateToView('HISTORY')}
                className={`px-3 py-2 text-xs sm:text-sm font-bold transition-colors rounded-lg flex items-center gap-2 ${currentView === 'HISTORY' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <i className="fas fa-calendar-check"></i>
                <span className="hidden sm:inline">My Bookings</span>
              </button>
            )}

            {role === UserRole.PATIENT && (
              <button
                onClick={() => navigateToView('BOT')}
                className={`px-3 py-2 text-xs sm:text-sm font-bold transition-colors rounded-lg flex items-center gap-2 ${currentView === 'BOT'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <i className="fas fa-user-doctor"></i>
                <span className="hidden sm:inline">Doctor Bot</span>
              </button>
            )}

            {role === UserRole.PATIENT && activeToken && currentView !== 'LIVE_TRACKER' && (
              <button
                onClick={() => navigateToView('LIVE_TRACKER')}
                className="hidden lg:flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100 animate-pulse"
              >
                <i className="fas fa-ticket"></i> Active Token: #{activeToken.tokenNumber}
              </button>
            )}

            <button
              onClick={switchRole}
              className="px-3 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors border border-slate-200 rounded-lg flex items-center gap-2"
            >
              <i className={`fas ${role === UserRole.PATIENT ? 'fa-building-medical' : 'fa-user'}`}></i>
              <span className="hidden sm:inline">{role === UserRole.PATIENT ? 'Hospital Login' : 'Patient View'}</span>
            </button>
          </div>
        </div>
      </nav>

      {role === UserRole.PATIENT && activeAmbulanceRequest && (
        <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between shadow-inner animate-fade-in border-b border-red-700">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <i className="fas fa-truck-medical animate-pulse"></i>
              <span className="text-xs font-black uppercase tracking-wider">Emergency Dispatched</span>
            </div>
            <div className="h-4 w-px bg-white/30 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-red-100">ETA: {activeAmbulanceRequest.estimatedArrival} mins</span>
            </div>
            {activeAmbulance && (
              <>
                <div className="h-4 w-px bg-white/30 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-100">Driver: {activeAmbulance.driverName}</span>
                  <a href={`tel:${activeAmbulance.driverPhone}`} className="bg-white text-red-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm hover:bg-red-50 transition-colors">
                    <i className="fas fa-phone-alt"></i> {activeAmbulance.driverPhone}
                  </a>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setActiveAmbulanceRequest(null)}
            className="text-[10px] font-black bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 ml-4 whitespace-nowrap"
          >
            DISMISS
          </button>
        </div>
      )}

      <main className="flex-grow bg-slate-50">
        {role === UserRole.PATIENT ? (
          <>
            {currentView === 'LIST' && (
              <PatientDashboard
                hospitals={hospitals}
                onSelectHospital={(h) => {
                  setSelectedHospitalId(h.id);
                  navigateToView('BOOKING');
                }}
                onRequestAmbulance={() => navigateToView('AMBULANCE')}
              />
            )}
            {currentView === 'BOOKING' && selectedHospital && (
              <TokenBooking
                hospital={selectedHospital}
                onBack={() => navigateToView('LIST')}
                onBooked={handleBooking}
              />
            )}
            {currentView === 'AMBULANCE' && (
              <AmbulanceBooking
                onBack={() => navigateToView('LIST')}
                onRequested={handleAmbulanceRequested}
              />
            )}
            {currentView === 'LIVE_TRACKER' && activeToken && (
              <QueueTracker
                token={activeToken}
                onCancel={handleCancelToken}
                hospitals={hospitals}
              />
            )}
            {currentView === 'HISTORY' && (
              <PatientHistory
                history={history}
                onBack={() => navigateToView('LIST')}
              />
            )}
            {currentView === 'BOT' && (
              <DoctorBotPage
                onNavigate={(view, data) => {
                  if (view === 'BOOKING' && data) {
                    // data is expected to be a hospital object
                    setSelectedHospitalId(data.id);
                    navigateToView('BOOKING');
                  } else {
                    navigateToView(view);
                  }
                }}
              />
            )}
          </>
        ) : (
          <HospitalDashboard
            hospital={hospitals[0]}
            onUpdateHospital={handleUpdateHospital}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs font-medium">© 2024 HealQ Health Systems. Helping reduce queues.</p>
          <div className="flex gap-6 text-slate-400 text-lg">
            <i className="fab fa-twitter hover:text-blue-400 cursor-pointer transition-colors"></i>
            <i className="fab fa-facebook hover:text-blue-600 cursor-pointer transition-colors"></i>
            <i className="fas fa-globe hover:text-slate-600 cursor-pointer transition-colors"></i>
          </div>
        </div>
      </footer>

      {toast && (
        <NotificationToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce-in { 
          0% { transform: scale(0.9) translateY(50px); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default App;
