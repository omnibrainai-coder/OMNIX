import React, { useState } from 'react';

interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface ChatUser {
  id: number;
  name: string;
  avatarColor: string;
  lastMessage: string;
  time: string;
  online: boolean;
  messages: Message[];
}

export function ChatSystem({ onBack }: { onBack: () => void }) {
  const [activeChat, setActiveChat] = useState<ChatUser | null>(null);
  const [typedMessage, setTypedMessage] = useState('');

  const [chatThreads, setChatThreads] = useState<ChatUser[]>([
    {
      id: 1,
      name: 'Aadil_724',
      avatarColor: '#f09433',
      lastMessage: 'Bhai algorithm perfect kam kar raha hai! 🔥',
      time: '10:42 AM',
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Hey bro, UI check kiya?', time: '10:39 AM' },
        { id: 2, sender: 'me', text: 'Haan bhai, ekdam solid chal raha hai.', time: '10:40 AM' },
        { id: 3, sender: 'them', text: 'Bhai algorithm perfect kam kar raha hai! 🔥', time: '10:42 AM' },
      ]
    },
    {
      id: 2,
      name: 'shadow_dev',
      avatarColor: '#a855f7',
      lastMessage: 'Modular folder structure update ho gaya hai.',
      time: '9:15 AM',
      online: false,
      messages: [
        { id: 1, sender: 'them', text: 'Modular folder structure update ho gaya hai.', time: '9:15 AM' }
      ]
    },
    {
      id: 3,
      name: 'alpha_hub',
      avatarColor: '#0095f6',
      lastMessage: 'Secure pipeline connection testing status...',
      time: 'Yesterday',
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Secure pipeline connection testing status...', time: 'Yesterday' }
      ]
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: 'me',
      text: typedMessage,
      time: 'Just now'
    };

    // Thread messages state update
    const updatedThreads = chatThreads.map(thread => {
      if (thread.id === activeChat.id) {
        const newMsgList = [...thread.messages, newMessage];
        const updatedThread = { ...thread, messages: newMsgList, lastMessage: typedMessage, time: 'Just now' };
        setActiveChat(updatedThread); // current view refresh
        return updatedThread;
      }
      return thread;
    });

    setChatThreads(updatedThreads);
    setTypedMessage('');
  };

  // 1. CHAT WINDOW VIEW (Open thread screen)
  if (activeChat) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#000000', height: 'calc(100vh - 56px)', position: 'relative' }}>
        {/* Chat Thread Header */}
        <div style={{ height: '56px', borderBottom: '1px solid #121212', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '14px' }}>
          <button onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>
            ←
          </button>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: activeChat.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
            NODE
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{activeChat.name}</div>
            <div style={{ fontSize: '11px', color: activeChat.online ? '#22c55e' : '#8e8e8e' }}>
              {activeChat.online ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Message Bubble Pipeline Stream */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeChat.messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  maxWidth: '75%', 
                  padding: '10px 14px', 
                  borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  backgroundColor: isMe ? '#371172' : '#1c1c1e',
                  color: '#ffffff',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  <div>{msg.text}</div>
                  <div style={{ fontSize: '9px', color: '#8e8e8e', textAlign: 'right', marginTop: '4px' }}>{msg.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input Bottom Action Tray */}
        <form onSubmit={handleSendMessage} style={{ padding: '12px 14px', borderTop: '1px solid #121212', display: 'flex', gap: '10px', backgroundColor: '#000' }}>
          <input 
            type="text" 
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            placeholder="Write secure encrypted message..." 
            style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', backgroundColor: '#1c1c1e', border: 'none', color: '#fff', outline: 'none', fontSize: '13px' }}
          />
          <button type="submit" style={{ backgroundColor: '#a855f7', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ➔
          </button>
        </form>
      </div>
    );
  }

  // 2. INBOX THREADS LIST VIEW
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#000000' }}>
      {/* Inbox Header */}
      <div style={{ height: '56px', borderBottom: '1px solid #121212', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>
            ←
          </button>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Direct Messages</span>
        </div>
        <span style={{ color: '#a855f7', fontSize: '12px', fontWeight: '600', fontFamily: 'monospace' }}>SHA-256</span>
      </div>

      {/* Inbox Thread Item Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {chatThreads.map((chat) => (
          <div 
            key={chat.id} 
            onClick={() => setActiveChat(chat)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', 
              borderBottom: '1px solid #0a0a0a', cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d0d0d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: chat.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', position: 'relative' }}>
              NODE
              {chat.online && (
                <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '10px', height: '10px', backgroundColor: '#22c55e', borderRadius: '50%', border: '2px solid #000' }}></div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{chat.name}</span>
                <span style={{ fontSize: '11px', color: '#8e8e8e' }}>{chat.time}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#8e8e8e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                {chat.lastMessage}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
