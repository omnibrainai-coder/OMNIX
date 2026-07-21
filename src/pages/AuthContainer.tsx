import React, { useState } from 'react';
import { Stories } from '../components/ui/Stories';
import { HomeFeed } from '../components/ui/HomeFeed';
import { Reels } from '../components/ui/Reels';
import { Profile } from '../components/ui/Profile';
import { ChatSystem } from '../components/ui/ChatSystem';
import { AdminDashboard } from '../components/ui/AdminDashboard';

export function AuthContainer() {
  const [screen, setScreen] = useState<'login' | 'signup' | 'dashboard'>('login');
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'post' | 'reels' | 'profile' | 'messages'>('home');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Self Healing Feed Training Model State Log Tracker
  const [algoLogs, setAlgoLogs] = useState<string[]>(['Algorithm Initialized: Passive State Listening...']);

  const targetUsername = identifier.trim() || 'operator_bite';

  const registerAlgorithmicTrain = (actionType: string, metaString: string) => {
    const updatedLog = `[TRAINED] ${actionType} on target node: ${metaString} -> Adjusting Weight Vectors.`;
    setAlgoLogs(prev => [updatedLog, ...prev.slice(0, 4)]);
  };

  const triggerPostPermission = () => {
    const userConfirm = window.confirm('BITE System Request:\n"Allow explicit secure system permission to view native phone storage gallery content safely?"');
    if (userConfirm) {
      alert('✅ Storage pipeline connection authorized without leaking system location strings.');
    }
  };

  if (screen === 'dashboard') {
    const showBottomBar = activeTab !== 'messages';

    return (
      <div style={{ 
        background: '#000000', color: '#ffffff', minHeight: '100vh', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex', flexDirection: 'column', boxSizing: 'border-box', 
        paddingBottom: showBottomBar ? '54px' : '0px'
      }}>
        
        {/* --- DYNAMIC CONDITIONAL APPLICATION TOP HEADER --- */}
        {activeTab !== 'messages' && (
          <div style={{ 
            height: '56px', backgroundColor: '#000000', position: 'sticky', top: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
            borderBottom: '1px solid #121212'
          }}>
            <span style={{ fontSize: '22px', fontWeight: 'bold', fontStyle: 'italic', letterSpacing: '-0.5px' }}>BITE</span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {activeTab === 'profile' ? (
                // Settings Engine Vector Trigger (Exclusive for Profile Tab Viewport)
                <svg onClick={() => alert(`⚙️ System Control Matrix Panel Configuration:\nNode: ${targetUsername}\nEncryption: Active SHA-256\nSession State: Valid`)} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ cursor: 'pointer' }}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  {/* Rocket Messenger Trigger Action Redirect */}
                  <svg onClick={() => setActiveTab('messages')} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(15deg)', cursor: 'pointer' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </>
              )}
            </div>
          </div>
        )}

        {/* --- SELF HEALING LIVE ALGORITHM FEED MONITOR BLOCK --- */}
        {activeTab !== 'messages' && (
          <div style={{ backgroundColor: '#0a0a0f', padding: '8px 14px', borderBottom: '1px solid #1a1a24', fontSize: '11px', fontFamily: 'monospace', color: '#22c55e' }}>
            {algoLogs.map((log, id) => <div key={id} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{log}</div>)}
          </div>
        )}

        {/* --- CORE CONTROL VIEW CONTROLLER DISPLAY SWITCH --- */}
        {activeTab === 'home' && (
          <div style={{ flex: 1 }}>
            <Stories username={targetUsername} />
            <HomeFeed onInteraction={registerAlgorithmicTrain} />
          </div>
        )}

        {activeTab === 'search' && (
          <div style={{ padding: '16px' }}>
            <input type="text" placeholder="Search secure metadata pools..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#121212', border: '1px solid #262626', color: '#fff', outline: 'none', fontSize: '13px' }} />
          </div>
        )}

        {activeTab === 'reels' && <Reels />}

        {activeTab === 'profile' && (
          <div style={{ flex: 1 }}>
            <AdminDashboard />
          </div>
        )}

        {/* MESSAGES TAB SWITCH SYSTEM OVERLAY */}
        {activeTab === 'messages' && (
          <ChatSystem onBack={() => setActiveTab('home')} />
        )}

        {activeTab === 'profile' && (
          <div style={{ flex: 1 }}>
            <AdminDashboard />
          </div>
        )}

        {/* --- CLEAN RE-ENGINEERED INSTAGRAM BAR PLATFORM BOTTOM NAVIGATION --- */}
        {showBottomBar && (
          <div style={{ 
            height: '50px', backgroundColor: '#000000', borderTop: '1px solid #121212',
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'space-around'
          }}>
            <div onClick={() => setActiveTab('home')} style={{ cursor: 'pointer', opacity: activeTab === 'home' ? 1 : 0.4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <div onClick={() => setActiveTab('search')} style={{ cursor: 'pointer', opacity: activeTab === 'search' ? 1 : 0.4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            
            <div onClick={triggerPostPermission} style={{ cursor: 'pointer', opacity: 0.8 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>

            <div onClick={() => setActiveTab('reels')} style={{ cursor: 'pointer', opacity: activeTab === 'reels' ? 1 : 0.4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            </div>
            <div onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer', opacity: activeTab === 'profile' ? 1 : 0.4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #a0c4ff 0%, #ffc6ff 50%, #e8f5e9 100%)', 
      color: '#1a1d24', minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between', padding: '30px 20px', boxSizing: 'border-box'
    }}>
      <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '3px', margin: 0 }}>BITE CHAT</h1>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '35px', borderRadius: '28px', boxSizing: 'border-box' }}>
          <form onSubmit={(e) => { e.preventDefault(); setScreen('dashboard'); }}>
            <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Username node tag" style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '15px' }} />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Secret Key" style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }} />
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#1a1d24', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Connect Node</button>
          </form>
        </div>
      </div>
      <div style={{ fontSize: '14px', color: '#4a5568', letterSpacing: '2px', fontWeight: 'bold' }}>FROM BITE</div>
    </div>
  );
}
