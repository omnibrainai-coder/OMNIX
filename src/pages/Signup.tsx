import React, { useState } from 'react';

export function Signup() {
  const [phone, setPhone] = useState('');

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending OTP to:', phone);
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #a0c4ff 0%, #ffc6ff 50%, #e8f5e9 100%)', 
      color: '#1a1d24', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'space-between', 
      fontFamily: 'sans-serif',
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      {/* Top Header */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '900', 
          color: '#1a1d24', 
          letterSpacing: '1.5px',
          margin: 0
        }}>
          WHAT'S IS YOUR PHONE NUMBER ?
        </h1>
      </div>

      {/* Main Clean Card */}
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.85)', 
        backdropFilter: 'blur(16px)',
        padding: '35px', 
        borderRadius: '28px', 
        boxShadow: '0 24px 60px rgba(0,0,0,0.1)', 
        width: '100%', 
        maxWidth: '380px', 
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxSizing: 'border-box'
      }}>
        <form onSubmit={handleSendOTP}>
          {/* Phone Number Input */}
          <div style={{ marginBottom: '25px' }}>
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="Please enter phone" 
              style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1a1d24', fontSize: '15px', outline: 'none', boxSizing: 'border-box', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} 
            />
          </div>

          {/* Send OTP Button */}
          <button 
            type="submit" 
            style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: '#1a1d24', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
          >
            Send OTP
          </button>
        </form>
      </div>

      {/* Footer Area with Terms and Signature */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        {/* Clean Legal Links */}
        <div style={{ fontSize: '12px', color: '#5c6370', letterSpacing: '0.5px', fontWeight: 500 }}>
          <a href="#terms" style={{ color: '#5c6370', textDecoration: 'none' }}>Terms & Conditions</a>
          <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
          <a href="#privacy" style={{ color: '#5c6370', textDecoration: 'none' }}>Privacy Policy</a>
        </div>

        {/* Company Signature */}
        <div style={{ 
          fontSize: '14px', 
          color: '#4a5568', 
          letterSpacing: '2px', 
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          FROM BITE
        </div>
      </div>
    </div>
  );
}
