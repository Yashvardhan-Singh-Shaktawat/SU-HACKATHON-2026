import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PermissionGateway() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState('pending'); // pending | requesting | done

  useEffect(() => {
    // Check if we need to show the modal
    const checkPermissions = async () => {
      try {
        const [geo, cam] = await Promise.all([
          navigator.permissions.query({ name: 'geolocation' }),
          navigator.permissions.query({ name: 'camera' }).catch(() => ({ state: 'prompt' }))
        ]);

        if (geo.state === 'prompt' || cam.state === 'prompt') {
          // If never asked, wait 2 seconds then show
          setTimeout(() => setShow(true), 1500);
        }
      } catch (e) {
        // Fallback for browsers that don't support permissions.query for camera
        setShow(true);
      }
    };
    
    checkPermissions();
  }, []);

  const requestAll = async () => {
    setStatus('requesting');
    
    // 1. Request Location
    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
    } catch (e) {
       console.log("Location denied or timed out");
    }

    // 2. Request Camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop()); // Stop immediately
    } catch (e) {
      console.log("Camera denied");
    }

    setStatus('done');
    setTimeout(() => setShow(false), 800);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="card"
            style={{ maxWidth: 450, textAlign: 'center', padding: 40, border: '1px solid var(--accent-glow)', boxShadow: '0 0 40px rgba(0,212,255,0.15)' }}
          >
            <div style={{ fontSize: 50, marginBottom: 20 }}>🛡️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>System Authorization</h2>
            <p style={{ color: 'var(--text-1)', fontSize: 14, lineHeight: 1.6, marginBottom: 30 }}>
              To provide a complete AI experience, WeaveMind requires access to your <strong>Camera</strong> (for live defect detection) and <strong>Location</strong> (for secure tracking).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                className="btn btn-primary" 
                onClick={requestAll}
                disabled={status !== 'pending'}
                style={{ height: 48, fontSize: 16 }}
              >
                {status === 'pending' ? 'Authorize All Systems' : 
                 status === 'requesting' ? 'Requesting Access...' : 'Ready! ✓'}
              </button>
              
              <button 
                className="btn btn-ghost" 
                onClick={() => setShow(false)}
                style={{ fontSize: 12, border: 'none' }}
              >
                Configure Manually Later
              </button>
            </div>

            <div style={{ marginTop: 24, padding: '12px', background: 'var(--bg-2)', borderRadius: 8, fontSize: 11, color: 'var(--text-2)', textAlign: 'left' }}>
              ℹ️ Your browser will prompt you twice. Please click <strong>"Allow"</strong> on both for the best experience.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
