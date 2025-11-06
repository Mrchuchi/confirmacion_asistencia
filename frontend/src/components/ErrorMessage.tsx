import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <div className="error-message-container">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <div className="error-text">
          <strong>Error:</strong> {message}
        </div>
        {onClose && (
          <button onClick={onClose} className="error-close-button">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
