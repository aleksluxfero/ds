import React from 'react';

interface ConfirmationDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmColor?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Удалить', 
  confirmColor = 'bg-red-600 hover:bg-red-700' 
}) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
    <div className="bg-[#1a182e] border border-purple-500/20 rounded-lg p-8 shadow-2xl shadow-purple-900/50 max-w-sm mx-4">
      <p className="text-lg text-gray-200 mb-6">{message}</p>
      <div className="flex justify-end space-x-4">
        <button onClick={onCancel} className="px-4 py-2 rounded-md text-gray-300 bg-white/10 hover:bg-white/20 transition-colors">
          Отмена
        </button>
        <button onClick={onConfirm} className={`px-4 py-2 rounded-md text-white ${confirmColor} transition-colors`}>
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmationDialog;
