import React from 'react';

export function Reels() {
  const handleSaveToGallery = () => {
    alert('🔒 Secure Local Write: Content saved securely directly to local device storage gallery.');
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '70vh' }}>
      <div style={{ textAlign: 'center', zIndex: 10, padding: '20px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #a855f7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
        </div>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Vertical Media Feed Active</h3>
        <p style={{ color: '#8e8e8e', fontSize: '12px', marginBottom: '20px' }}>@operator_bite original premium sound</p>

        {/* Flagship Save Action Block */}
        <button 
          onClick={handleSaveToGallery}
          style={{ 
            backgroundColor: '#0095f6', color: '#fff', border: 'none', 
            padding: '10px 20px', borderRadius: '8px', fontSize: '13px', 
            fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' 
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Save to Gallery
        </button>
      </div>
    </div>
  );
}
