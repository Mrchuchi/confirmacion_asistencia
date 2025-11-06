import React from 'react';
import './SuccessMessage.css';

interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, onClose }) => {
  return (
    <div className="success-message-container">
      <div className="success-content">
        <div className="success-icon">✅</div>
        <div className="success-text">
          <strong>¡Éxito!</strong> {message}
        </div>
        {onClose && (
          <button onClick={onClose} className="success-close-button">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
