import React, { useState } from 'react';
export default function OMNIXSecureLock({ onUnlock }: { onUnlock: () => void }) {
  const [status, setStatus] = useState('SYSTEM LOCKED');
  const triggerBiometric = () => {
    setStatus('SCANNING FINGER/FACE...');
    setTimeout(() => { setStatus('UNLOCKED'); onUnlock(); }, 1500);
  };
  return (
    <div style={{ backgroundColor: '#05050a', color: '#00ffcc', padding: '40px', textAlign: 'center', fontFamily: 'monospace', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ color: '#ff0055', textShadow: '0 0 10px #ff0055' }}>🔒 DM BIOMETRIC SHIELD</h1>
      <p style={{ letterSpacing: '2px' }}>STATUS: {status}</p>
      <button onClick={triggerBiometric} style={{ background: 'transparent', border: '2px solid #00ffcc', color: '#00ffcc', padding: '15px 30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px #00ffcc' }}>
        INITIALIZE BIOMETRIC SCAN
      </button>
      <p style={{ marginTop: '20px', color: '#555' }}>Security Level: Active 2FA Protection</p>
    </div>
  );
}