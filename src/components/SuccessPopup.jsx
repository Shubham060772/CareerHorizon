import React, { useState, useEffect } from "react";

const SuccessPopup = ({ isVisible, onClose, message }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div 
        className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-green-500 flex items-center max-w-xs animate-slide-in"
        onClick={onClose}
      >
        <div className="flex-shrink-0 mr-3">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <p className="font-medium text-gray-800">Success!</p>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;