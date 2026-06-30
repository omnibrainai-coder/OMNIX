import React, { useState } from 'react';

interface ActiveUser {
  id: string;
  name: string;
  avatarText: string;
  status: string;
}

interface MessageChannel {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  type: 'channel' | 'network';
}

export default function Comms() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data representing exact telemetry logs from your video layout
  const onlineUsers: ActiveUser[] = [
    { id: '1', name: 'Zaza', avatarText: 'Z', status: 'online' },
    { id: '2', name: 'Kai', avatarText: 'K', status: 'online' },
    { id: '3', name: 'Nova', avatarText: 'N', status: 'online' },
    { id: '4', name: 'Rex', avatarText: 'R', status: 'online' },
    { id: '5', name: 'Vex', avatarText: 'V', status: 'online' }
  ];

  const channels: MessageChannel[] = [
    { id: 'c1', name: 'Zara_X', lastMessage: 'hey, check the new feed drop', time: '2M', unreadCount: 1, type: 'channel' },
    { id: 'c2', name: 'OMNIX.X', lastMessage: 'System update: v2.4 deployed', time: '14M', unreadCount: 1, type: 'channel' },
    { id: 'c3', name: 'Kai_Zero', lastMessage: 'on it, sending the files now', time: '1H', type: 'channel' },
    { id: 'c4', name: 'Nova_AI', lastMessage: 'the grid is expanding fast', time: '3H', type: 'channel' },
    { id: 'c5', name: 'Vex_00', lastMessage: 'encrypted channel activated', time: '1D', type: 'channel' },
    { id: 'c6', name: 'Rex_IV', lastMessage: 'signal lost... reconnecting', time: '2D', type: 'channel' }
  ];

  const networks: MessageChannel[] = [
    { id: 'n1', name: 'SHADOW Core', lastMessage: 'Affan: welcome to the grid', time: '5M', unreadCount: 12, type: 'network' },
    { id: 'n2', name: 'Ghost Protocol', lastMessage: 'new mission briefing dropped', time: '2H', unreadCount: 5, type: 'network' }
  ];

  return (
    <div className="bg-[#030307] min-h-screen text-gray-200 font-mono p-4 space-y-6 selection:bg-[#00ffcc]/30">
      
      {/* SEARCH HUB */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#00ffcc]/50 text-xs">//</div>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages..." 
          className="w-full bg-[#090914] border border-zinc-900 focus:border-[#00ffcc]/30 rounded-xl py-2.5 pl-9 pr-4 text-xs text-[#00ffcc] tracking-wide placeholder-gray-600 focus:outline-none transition-all"
        />
      </div>

      {/* ONLINE NOW HORIZONTAL STREAM */}
      <div className="space-y-2">
        <div className="text-[10px] tracking-widest text-gray-500 font-black">// ONLINE NOW</div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex flex-col items-center space-y-1 cursor-pointer flex-shrink-0 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm font-bold text-[#00ffcc] group-hover:border-[#00ffcc]/50 transition-colors">
                  {user.avatarText}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CHANNELS SECTION */}
      <div className="space-y-3">
        <div className="text-[10px] tracking-widest text-gray-500 font-black">// CHANNELS</div>
        <div className="space-y-2">
          {channels.map((ch) => (
            <div key={ch.id} className="flex items-center justify-between p-3 rounded-xl bg-[#080811]/60 border border-zinc-950 hover:border-zinc-900 transition-all cursor-pointer">
              <div className="flex items-center space-y-0 space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 flex items-center justify-center text-xs text-gray-400 font-bold">
                  {ch.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">{ch.name}</h4>
                  <p className="text-[11px] text-gray-500 truncate max-w-[180px] mt-0.5">{ch.lastMessage}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="text-[9px] text-gray-600">{ch.time}</span>
                {ch.unreadCount && (
                  <span className="bg-[#00ffcc] text-black font-black text-[9px] px-1.5 py-0.5 rounded-full scale-90">
                    {ch.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NETWORKS MULTICAST SECTION */}
      <div className="space-y-3 pb-12">
        <div className="text-[10px] tracking-widest text-gray-500 font-black">// NETWORKS</div>
        <div className="space-y-2">
          {networks.map((net) => (
            <div key={net.id} className="flex items-center justify-between p-3 rounded-xl bg-[#080811]/60 border border-zinc-950 hover:border-zinc-900 transition-all cursor-pointer">
              <div className="flex items-center space-y-0 space-x-3">
                <div className="w-10 h-10 rounded-full bg-cyan-950/20 border border-cyan-900/30 flex items-center justify-center text-xs text-cyan-400 font-black">
                  {net.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-cyan-400">{net.name}</h4>
                  <p className="text-[11px] text-gray-500 truncate max-w-[180px] mt-0.5">{net.lastMessage}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="text-[9px] text-gray-600">{net.time}</span>
                {net.unreadCount && (
                  <span className="bg-cyan-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded-full scale-90 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                    {net.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
