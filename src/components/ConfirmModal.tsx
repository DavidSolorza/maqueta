import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from 'lucide-react';

export type ConfirmType = 'warning' | 'danger' | 'info' | 'success';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const icons = {
    warning: <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
    danger: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
    info: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    success: <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />,
  };

  const buttonStyles = {
    warning: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
    info: 'bg-brand-blue-900 hover:bg-brand-blue-800 dark:bg-brand-blue-800 dark:hover:bg-brand-blue-700',
    success: 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800',
  };

  const iconBgStyles = {
    warning: 'bg-yellow-100 dark:bg-yellow-900/30',
    danger: 'bg-red-100 dark:bg-red-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30',
    success: 'bg-green-100 dark:bg-green-900/30',
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center z-[9999] p-4 pt-20 sm:pt-[100px]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in relative z-[10000]">
        <div className="p-4 sm:p-6">
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 p-3 rounded-full ${iconBgStyles[type]}`}>
              {icons[type]}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 rounded-b-xl sm:rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors text-sm sm:text-base ${buttonStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

