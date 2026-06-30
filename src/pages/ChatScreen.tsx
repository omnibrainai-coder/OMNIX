import React, { useState } from 'react';
export default function OMNIXChatScreen() {
  const [wallpaper, setWallpaper] = useState('');
  return (
    <div style={{ backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover', backgroundColor: '#0b0b12', height: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>
      <h3>OMNIX Chat Session</h3>
      <div style={{ marginTop: '20px' }}>
        <input type='text' placeholder='Paste Custom Wallpaper Image URL Here...' onChange={(e) => setWallpaper(e.target.value)} style={{ padding: '10px', width: '80%', background: '#222', border: '1px solid #ff0055', color: '#fff' }} />
      </div>
    </div>
  );
}