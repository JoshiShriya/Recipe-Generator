import React from 'react';
import type { ModalType } from '../types/types';

interface MessageModalProps {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type: ModalType;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  message,
  onConfirm,
  onCancel,
  type,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center text-gray-800 flex flex-col gap-4 border border-gray-300">
        <p className="text-lg font-semibold">{message}</p>
        <div className="flex justify-center gap-4 mt-4">
          {type === 'confirm' && (
            <button
              onClick={() => {
                onCancel?.();
                onClose();
              }}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;