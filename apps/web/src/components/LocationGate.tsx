import React, { useState, useEffect } from 'react';
import './LocationGate.css';

interface LocationGateProps {
  onLocationGranted: (location: string) => void;
}

const LocationGate: React.FC<LocationGateProps> = ({ onLocationGranted }) => {
  const [status, setStatus] = useState<'prompt' | 'loading' | 'error'>('prompt');
  const [errorMessage, setErrorMessage] = useState('');

  const requestLocation = () => {
    setStatus('loading');
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode to get a readable string (mocking for hackathon speed or using open API)
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const location = data.address.city || data.address.state || data.address.country || 'Unknown Location';
          onLocationGranted(location);
        } catch (err) {
          console.error('Reverse geocoding failed', err);
          onLocationGranted('Remote / Global');
        }
      },
      (error) => {
        setStatus('error');
        setErrorMessage('Location access denied. PathFinder requires location to provide industry-driven insights.');
      }
    );
  };

  return (
    <div className="location-gate">
      <div className="location-gate__content">
        <div className="location-gate__icon">📍</div>
        <h2 className="location-gate__title">Location Required</h2>
        <p className="location-gate__text">
          PathFinder provides personalized learning paths based on **local job market demands**. 
          Please grant location access to continue.
        </p>

        {status === 'prompt' && (
          <button onClick={requestLocation} className="location-gate__btn">
            Allow Location Access
          </button>
        )}

        {status === 'loading' && (
          <div className="location-gate__loading">
            <div className="spinner"></div>
            <span>Fetching your local market signals...</span>
          </div>
        )}

        {status === 'error' && (
          <div className="location-gate__error">
            <p>{errorMessage}</p>
            <button onClick={requestLocation} className="location-gate__btn location-gate__btn--retry">
              Retry Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationGate;
