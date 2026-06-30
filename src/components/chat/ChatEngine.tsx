import React, { useState } from 'react';
export default function OMNIXChatEngine({ chatPartner }: { chatPartner: string }) {
  const [localWallpaper, setLocalWallpaper] = useState('');
  return (
    <div style={{ backgroundImage: `url(${localWallpaper})`, backgroundSize: 'cover', backgroundColor: '#080812', height: '300px', padding: '15px', color: '#fff', fontFamily: 'sans-serif', border: '1px solid #222', borderRadius: '8px', margin: '15px' }}>
      <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '4px' }}>
        <h4>Chat Session: {chatPartner}</h4>
        <div style={{ marginTop: '10px' }}>
          <label style={{ fontSize: '11px', color: '#00ffcc' }}>Set Chat Wallpaper (Image URL): </label>
          <input type='text' placeholder='Paste URL...' style={{ background: '#222', border: '1px solid #00ffcc', color: '#fff', fontSize: '12px', padding: '4px', width: '60%' }} onChange={(e) => setLocalWallpaper(e.target.value)} />
        </div>
      </div>
    </div>
  );
}