import React, { useState, useEffect } from 'react';
import "./consentpop.css"

const ConsentPopup = ({ onAccept, onDecline }) => {
  const [isOpen, setIsOpen] = useState(() => {
    const consentStatus = localStorage.getItem('consentStatus');
    return consentStatus !== 'accepted';
  });
  const [isChecked, setIsChecked] = useState(false);

  const handleAccept = () => {
    if (!isChecked) {
      alert("Please agree to the terms before continuing.");
      return;
    }
    setIsOpen(false);
    localStorage.setItem('consentStatus', 'accepted');
    onAccept();
  };

  const handleDecline = () => {
    setIsOpen(false);
    localStorage.setItem('consentStatus', 'declined');
    onDecline();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="consent-container">
          <h2 className="consent-title">
            Hi! We'd like your consent to collect your information!
          </h2>
          
          <p className="consent-subtitle">This may include:</p>
          
          <div className="consent-grid">
            {[
              'Cookie IDs',
              'Demographics',
              'Lifestyle Info',
              'Interests',
              'Device Identifiers',
              'Sensitive Info'
            ].map((item) => (
              <div key={item} className="consent-item">
                <span className="bullet">•</span>
                <span className="item-text">{item}</span>
              </div>
            ))}
          </div>

          <div className="checkbox-container">
            <input
              type="checkbox"
              id="consent"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="consent-checkbox"
            />
            <label htmlFor="consent" className="consent-label">
              I have reviewed and agree to the{' '}
              <a href="#" className="consent-link">General Usage Terms</a>,{' '}
              <a href="#" className="consent-link">Privacy Policy</a>, and{' '}
              <a href="#" className="consent-link">Cookie Policy</a>
            </label>
          </div>

          <button
            onClick={handleAccept}
            className="accept-button"
          >
            I Agree
          </button>
          
          <button
            onClick={handleDecline}
            className="decline-button"
          >
            Disagree
          </button>

          <p className="consent-footer">
            By clicking continue, you accept our terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentPopup;