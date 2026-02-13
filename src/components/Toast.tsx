import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const typeClasses = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-primary-600'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${typeClasses[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3`}>
        <span className="text-xl font-bold">{icons[type]}</span>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
