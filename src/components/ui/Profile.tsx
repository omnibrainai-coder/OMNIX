import React, { useState } from 'react';

export function Profile({ username, onLogout }: { username: string, onLogout: () => void }) {
  const [activeSegment, setActiveSegment] = useState<'posts' | 'reels' | 'tags'>('posts');

  return (
    <div style={{ flex: 1, backgroundColor: '#000000', color: '#ffffff' }}>
      
      {/* Upper Status Metadata Segment */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
          <div style={{ width: '76px', height: '76px', borderRadius: '50%', backgroundColor: '#1a1a1a', border: '1px solid #262626', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#8e8e8e' }}>AVATAR</span>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#0095f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: '2px solid #000', cursor: 'pointer' }}>+</div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 'bold' }}>12</div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Posts</div>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 'bold' }}>4.8K</div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Followers</div>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 'bold' }}>382</div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Following</div>
            </div>
          </div>
        </div>

        {/* Bio Info Data */}
        <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{username}</div>
          <div style={{ color: '#8e8e8e', marginBottom: '4px' }}>BITE Operational Node System</div>
          <div style={{ color: '#f5f5f5' }}>🧬 Decentralized Neural Network Engine Grid.</div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button style={{ flex: 1, height: '32px', backgroundColor: '#1c1c1e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>Edit Profile</button>
          <button style={{ flex: 1, height: '32px', backgroundColor: '#1c1c1e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>Share Node</button>
        </div>
      </div>

      {/* Flagship Segment Selection Navigation Bars */}
      <div style={{ display: 'flex', borderTop: '1px solid #121212', borderBottom: '1px solid #121212', height: '44px' }}>
        <div onClick={() => setActiveSegment('posts')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderBottom: activeSegment === 'posts' ? '2px solid #fff' : 'none', opacity: activeSegment === 'posts' ? 1 : 0.4 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </div>
        <div onClick={() => setActiveSegment('reels')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderBottom: activeSegment === 'reels' ? '2px solid #fff' : 'none', opacity: activeSegment === 'reels' ? 1 : 0.4 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
        </div>
        <div onClick={() => setActiveSegment('tags')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderBottom: activeSegment === 'tags' ? '2px solid #fff' : 'none', opacity: activeSegment === 'tags' ? 1 : 0.4 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
      </div>

      {/* Grid Content Dynamic View Layer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', padding: '3px' }}>
        {activeSegment === 'posts' && [1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ aspectRatio: '1/1', backgroundColor: '#0f0f14', border: '1px solid #1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#444' }}>Post Grid {i}</div>
        ))}
        {activeSegment === 'reels' && [1, 2].map(i => (
          <div key={i} style={{ aspectRatio: '3/4', backgroundColor: '#140f1a', border: '1px solid #2b1f3d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#7c3aed' }}>Reel {i}</div>
        ))}
        {activeSegment === 'tags' && [1, 2, 3].map(i => (
          <div key={i} style={{ aspectRatio: '1/1', backgroundColor: '#0f1411', border: '1px solid #1f3d24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#059669' }}>Tagged {i}</div>
        ))}
      </div>

    </div>
  );
}
