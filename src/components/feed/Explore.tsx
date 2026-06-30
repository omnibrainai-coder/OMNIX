import React, { useState } from 'react';

export const Home = () => {
  const [activeTab, setActiveTab] = useState('home'); // home, search, reels, dm, profile
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Aapka security check protocol
  const handleDecrypt = () => {
    if (pinInput === '1234') { // Aapka custom secondary pin
      setIsUnlocked(true);
    } else {
      alert('❌ AUTHORIZATION DENIED: Invalid Node Key');
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-[#e0e0e6] font-mono flex flex-col justify-between max-w-md mx-auto border-x border-[#00ffcc]/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      
      {/* 👑 PREMIUM SHADOW TOP BAR */}
      <div className="p-4 border-b border-[#00ffcc]/10 bg-[#070710]/90 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center">
        <h1 className="text-xl font-black tracking-widest text-[#00ffcc] drop-shadow-[0_0_8px_rgba(0,255,204,0.4)]">SHADOW</h1>
        <div className="flex gap-4 items-center">
          <button onClick={() => setActiveTab('search')} className="text-lg hover:text-[#00ffcc] transition-colors">🔍</button>
          <button onClick={() => setActiveTab('dm')} className="relative text-lg hover:text-[#00ffcc] transition-colors">
            💬
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans animate-pulse">3</span>
          </button>
        </div>
      </div>

      {/* 📱 DYNAMIC HUB (MAIN INTERFACE) */}
      <div className="flex-grow overflow-y-auto pb-24">
        
        {/* ── 1. DYNAMIC HOME FEED ── */}
        {activeTab === 'home' && (
          <div className="p-4 space-y-6">
            {/* Horizontal Stories Node */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {['My_Node', 'X_User', 'Viper_07', 'Ghost'].map((user, idx) => (
                <div key={idx} className="flex flex-col items-center flex-shrink-0">
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#00ffcc] via-blue-600 to-purple-600 shadow-[0_0_10px_rgba(0,255,204,0.2)]">
                    <div className="w-full h-full rounded-full bg-black border border-black flex items-center justify-center text-xs">👤</div>
                  </div>
                  <span className="text-[10px] mt-1 text-gray-400 font-sans">{user}</span>
                </div>
              ))}
              {/* Plus Icon Node to Add Story */}
              <div className="flex flex-col items-center flex-shrink-0 cursor-pointer">
                <div className="w-14 h-14 rounded-full border border-dashed border-[#00ffcc]/40 flex items-center justify-center bg-black/40 text-[#00ffcc]">
                  <span className="text-lg font-bold">+</span>
                </div>
                <span className="text-[10px] mt-1 text-[#00ffcc]/70">Add</span>
              </div>
            </div>

            {/* Custom Cyber Feed Card */}
            <div className="border border-[#00ffcc]/10 rounded-xl bg-[#070710] overflow-hidden shadow-lg">
              <div className="p-3 flex items-center justify-between border-b border-[#00ffcc]/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/30 flex items-center justify-center text-xs text-[#00ffcc]">👤</div>
                  <span className="text-xs font-bold tracking-tight text-gray-200">alpha_operator</span>
                </div>
                <span className="text-[10px] text-[#00ffcc]/60 bg-[#00ffcc]/5 px-2 py-0.5 rounded border border-[#00ffcc]/10">SECURE NODE</span>
              </div>
              <div className="aspect-square bg-gradient-to-br from-[#0a0a14] to-black relative flex items-center justify-center border-b border-[#00ffcc]/5">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                <span className="text-xs text-[#00ffcc]/40 tracking-widest text-center uppercase animate-pulse">[ 🔐 Media Stream Encrypted <br/> Ready for local rendering ]</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex gap-4 text-md text-gray-400">
                  <button className="hover:text-red-500 transition-colors">❤️</button>
                  <button className="hover:text-[#00ffcc] transition-colors">💬</button>
                  <button className="hover:text-cyan-400 transition-colors">⚡</button>
                </div>
                <p className="text-xs leading-relaxed text-gray-300">
                  <span className="font-bold text-[#00ffcc] mr-2">alpha_operator</span> 
                  Successfully deployed custom grid overlay parameters on decentralized system network.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. CYBER SEARCH INTERFACE ── */}
        {activeTab === 'search' && (
          <div className="p-4 space-y-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search encrypted tags or handles..." 
                className="w-full bg-[#0d0d1a] border border-[#00ffcc]/20 rounded-lg p-3 pl-10 text-xs focus:outline-none focus:border-[#00ffcc] text-[#00ffcc] placeholder-cyan-900 transition-all shadow-[inset_0_0_10px_rgba(0,255,204,0.02)]"
              />
              <span className="absolute left-3 top-3.5 text-xs text-cyan-700">🔍</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-2">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="aspect-square bg-[#0a0a16] border border-[#00ffcc]/5 rounded flex items-center justify-center text-[10px] text-gray-600 hover:border-[#00ffcc]/30 transition-all cursor-pointer">
                  GRID_{item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. VERTICAL REELS STREAM PLAYER ── */}
        {activeTab === 'reels' && (
          <div className="h-[72vh] bg-gradient-to-b from-black via-[#040408] to-black relative flex items-center justify-center overflow-hidden border border-[#00ffcc]/5 rounded-xl mx-2 mt-2">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#00ffcc_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Bottom Overlay Info */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/50 to-transparent z-10 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#00ffcc]/20 text-xs flex items-center justify-center">👤</div>
                <span className="text-xs font-bold text-[#00ffcc]">@phantom_dev</span>
              </div>
              <p className="text-[11px] text-gray-400">Testing full height frame rates inside Termux local viewport. #OMNIX #ShadowNet</p>
            </div>

            {/* Simulated Center Player Placeholder */}
            <div className="text-center space-y-2 z-0">
              <div className="text-2xl animate-spin inline-block text-[#00ffcc]/40">🌀</div>
              <p className="text-[10px] tracking-widest text-gray-500">REALTIME SHORT VIDEO NODE<br/>[ SWIPE ACTION ENABLED ]</p>
            </div>

            {/* Floating Control Badges */}
            <div className="absolute right-3 bottom-16 flex flex-col gap-4 text-md bg-black/60 p-2.5 rounded-2xl border border-white/5 backdrop-blur-md z-20 text-gray-400">
              <button className="hover:text-red-500">🔥</button>
              <button className="hover:text-[#00ffcc]">💬</button>
              <button className="hover:text-amber-400">⚡</button>
            </div>
          </div>
        )}

        {/* ── 4. DECRYPTED DM SYSTEM (With Secure Shield) ── */}
        {activeTab === 'dm' && (
          <div className="p-4">
            {!isUnlocked ? (
              <div className="border border-red-900/30 rounded-xl bg-[#0f0707]/90 p-6 text-center space-y-4 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
                <div className="text-2xl animate-pulse">🔒</div>
                <h3 className="text-xs font-bold text-red-400 tracking-widest uppercase">DM Decryption Shield Active</h3>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto">This node requires secondary identity verification passkey to decrypt incoming server packets.</p>
                <div className="flex justify-center gap-2">
                  <input 
                    type="password" 
                    maxLength={4}
                    placeholder="PIN" 
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-20 text-center bg-black border border-red-500/30 rounded p-2 text-xs text-red-500 tracking-widest focus:outline-none focus:border-red-500"
                  />
                  <button 
                    onClick={handleDecrypt}
                    className="bg-red-950/40 border border-red-700/50 hover:bg-red-900/60 text-red-200 text-xs px-4 rounded transition-colors"
                  >
                    DECRYPT
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-[#00ffcc]/10 pb-2">
                  <span className="text-[10px] text-green-400 font-bold tracking-wider">● DECRYPTED STATUS: ACTIVE</span>
                  <button onClick={() => { setIsUnlocked(false); setPinInput(''); }} className="text-[10px] text-red-400 hover:underline">Secure Node</button>
                </div>
                {['Proxy_User', 'Kernel_Error', 'Cipher_Text'].map((chat, idx) => (
                  <div key={idx} className="p-3 border border-[#00ffcc]/5 bg-[#070710] rounded-xl flex items-center justify-between hover:border-[#00ffcc]/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-cyan-950/50 border border-cyan-900/30 flex items-center justify-center text-xs">👤</div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-200">{chat}</h4>
                        <p className="text-[10px] text-gray-500 truncate w-36">Secure handshake established successfully...</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-600">3m ago</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 🧭 GLOWING NAVIGATION HUB (BOTTOM FIXED BAR) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#070710]/95 border-t border-[#00ffcc]/10 p-3.5 grid grid-cols-5 text-center text-lg z-50 backdrop-blur-md shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-[#00ffcc] scale-110 drop-shadow-[0_0_5px_rgba(0,255,204,0.4)] transition-transform' : 'text-gray-600'}>🏠</button>
        <button onClick={() => setActiveTab('search')} className={activeTab === 'search' ? 'text-[#00ffcc] scale-110 drop-shadow-[0_0_5px_rgba(0,255,204,0.4)] transition-transform' : 'text-gray-600'}>🔍</button>
        <button onClick={() => setActiveTab('reels')} className={activeTab === 'reels' ? 'text-[#00ffcc] scale-110 drop-shadow-[0_0_5px_rgba(0,255,204,0.4)] transition-transform' : 'text-gray-600'}>🎬</button>
        <button onClick={() => setActiveTab('dm')} className={activeTab === 'dm' ? 'text-[#00ffcc] scale-110 drop-shadow-[0_0_5px_rgba(0,255,204,0.4)] transition-transform' : 'text-gray-600'}>💬</button>
        <button className="text-gray-600 cursor-not-allowed">⚙️</button>
      </div>

    </div>
  );
};

export default Home;
