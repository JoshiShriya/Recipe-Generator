// app/hooks/useModal.ts
import { useState } from 'react';
import type { ModalState, ModalType } from '../types/types';

export const useModal = () => {
  const [modal, setModal] = useState<ModalState>({
    message: '',
    type: 'info', // Default type
    isVisible: false
  });

  const showModal = (
    message: string,
    type: ModalType = 'info',
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setModal({
      message,
      type,
      onConfirm,
      onCancel,
      isVisible: true
    });
  };

  const closeModal = () => {
    setModal(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    modalState: modal,
    showModal,
    closeModal
  };
};