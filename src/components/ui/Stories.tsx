import React from 'react';

export function Stories({ username }: { username: string }) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '16px', 
      padding: '14px 16px', 
      overflowX: 'auto', 
      backgroundColor: '#000000',
      borderBottom: '1px solid #121212'
    }}>
      {/* Self Profile Story Node with Blue Plus Badge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#1a1a1a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #262626' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#a855f7' }}>PFP</span>
          <div style={{ 
            position: 'absolute', bottom: '2px', right: '2px', 
            width: '18px', height: '18px', borderRadius: '50%', 
            backgroundColor: '#0095f6', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', border: '2px solid #000', fontSize: '12px', fontWeight: 'bold', color: '#fff' 
          }}>+</div>
        </div>
        <span style={{ fontSize: '11px', color: '#8e8e8e' }}>Your Story</span>
      </div>

      {/* Other Global Network Users */}
      {['Aadil_724', 'shadow_dev', 'alpha_hub', 'prime_v8'].map((user, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
          <div style={{ padding: '2px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '58px', height: '58px', borderRadius: '50%', backgroundColor: '#000000', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#a855f7', fontWeight: '600' }}>
              NODE
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#f5f5f5' }}>{user}</span>
        </div>
      ))}
    </div>
  );
}
