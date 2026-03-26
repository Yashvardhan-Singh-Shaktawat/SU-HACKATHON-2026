import { useState, useEffect } from 'react';
import API from '../utils/api';

export default function LocationTracker() {
  const [status, setStatus] = useState('');
  const [coords, setCoords] = useState({ lat: null, lng: null });

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser');
      return;
    }

    setStatus('Locating...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setCoords({ lat, lng });
        setStatus('Success!');

        try {
          await API.post('/location/save', {
            latitude: lat,
            longitude: lng,
            timestamp: new Date()
          });
          console.log("📍 Location synced to server");
        } catch (err) {
          console.error("Error sending to backend:", err);
          setStatus('Sync error');
        }
      },
      (error) => {
        setStatus(`Error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Auto-get location on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      getLocation();
    }, 2000); // Wait 2s before asking to avoid overwhelming on load
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ fontSize: 20 }}>📍</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Location Tracker</div>
        <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
          {status} {coords.lat && `(${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`}
        </div>
      </div>
      <button 
        onClick={getLocation} 
        className="btn btn-ghost" 
        style={{ fontSize: 11, padding: '4px 8px' }}
      >
        Refresh
      </button>
    </div>
  );
}
