import React from 'react';

export function LaunchSplashScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 20% 20%, #164e63 0%, #0f172a 38%, #020617 100%)', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <style>{`
        @keyframes omnixPulse {
          0% { transform: scale(0.96); opacity: 0.72; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.96); opacity: 0.72; }
        }
        @keyframes omnixSweep {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
      <div style={{ width: '100%', maxWidth: '460px', textAlign: 'center' }}>
        <div style={{ width: '108px', height: '108px', margin: '0 auto 22px', borderRadius: '28px', background: 'linear-gradient(145deg, rgba(34, 211, 238, 0.28), rgba(59, 130, 246, 0.2))', border: '1px solid rgba(125, 211, 252, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 70px rgba(34, 211, 238, 0.2)', animation: 'omnixPulse 2.8s ease-in-out infinite' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '0.16em' }}>BC</div>
        </div>
        <div style={{ fontSize: '14px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#7dd3fc', marginBottom: '8px' }}>ByteChat / OMNIX</div>
        <div style={{ fontSize: '34px', fontWeight: 900, lineHeight: 1.1, marginBottom: '12px' }}>Secure social messaging, live.</div>
        <div style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '20px', lineHeight: 1.6 }}>Initializing encrypted sessions, native billing, and real-time push channels.</div>
        <div style={{ position: 'relative', height: '6px', borderRadius: '999px', background: 'rgba(148, 163, 184, 0.22)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, width: '36%', borderRadius: '999px', background: 'linear-gradient(90deg, #22d3ee, #3b82f6)', animation: 'omnixSweep 1.8s linear infinite' }} />
        </div>
      </div>
    </div>
  );
}