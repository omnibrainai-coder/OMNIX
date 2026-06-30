import React, { useState } from 'react';
export default function OMNIXOneWayGhost() {
  const [stealth, setStealth] = useState(true);
  return (
    <div style={{ backgroundColor: '#020208', color: '#fff', padding: '20px', fontFamily: 'monospace', borderRadius: '10px', border: '1px solid #ff0055' }}>
      <h3 style={{ color: '#ff0055' }}>⚡ ONE-WAY HUNTING MODE</h3>
      <p style={{ fontSize: '12px', color: '#aaa' }}>Inbound searches are permanently disabled. Outbound discovery active unless target is also localized in shadow mode.</p>
      <div style={{ marginTop: '15px' }}>
        <span style={{ color: '#00ffcc' }}>Stealth Core Status: {stealth ? 'IMPOSSIBLE_TO_FIND' : 'OPEN'}</span>
      </div>
    </div>
  );
}