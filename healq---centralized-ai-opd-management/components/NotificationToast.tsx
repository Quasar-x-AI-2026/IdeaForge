
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'warning';
  onClose: () => void;
}

const NotificationToast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-emerald-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce-in z-50`}>
      <i className={`fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <i className="fas fa-times text-sm"></i>
      </button>
    </div>
  );
};

export default NotificationToast;
