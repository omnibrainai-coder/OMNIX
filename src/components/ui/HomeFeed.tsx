import React, { useState } from 'react';

interface Post {
  id: number;
  author: string;
  likes: number;
  caption: string;
  tags: string[];
  mentions: string[];
  location: string;
}

export function HomeFeed({ onInteraction }: { onInteraction: (type: string, tag: string) => void }) {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const samplePosts: Post[] = [
    { id: 1, author: 'Aadil_724', likes: 1424, caption: 'Building the cleanest ecosystem network live.', tags: ['#Ecosystem', '#BITE', '#Privacy'], mentions: ['@shadow_dev'], location: 'Secure Server Grid' },
    { id: 2, author: 'shadow_dev', likes: 890, caption: 'Self-healing recommendation pipeline integrated successfully.', tags: ['#Algorithm', '#AI', '#NextGen'], mentions: ['@Aadil_724'], location: 'Distributed Node 4' }
  ];

  const toggleLike = (postId: number, tags: string[]) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
      onInteraction('Unlike Triggered', tags.join(', '));
    } else {
      setLikedPosts([...likedPosts, postId]);
      onInteraction('Like Action Registered', tags.join(', '));
    }
  };

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '10px 0' }}>
      {samplePosts.map((post) => (
        <div key={post.id} style={{ marginBottom: '24px', borderBottom: '1px solid #121212' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#a855f7' }}>AV</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{post.author}</div>
                <div style={{ fontSize: '10px', color: '#8e8e8e' }}>{post.location}</div>
              </div>
            </div>
          </div>

          {/* Post Media Layout */}
          <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #121212' }}>
            <span style={{ color: '#3b82f6', fontSize: '13px', fontFamily: 'monospace' }}>[ Clean Media Architecture Grid ]</span>
          </div>

          {/* Action Interface Vector Row */}
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
              <svg onClick={() => toggleLike(post.id, post.tags)} width="24" height="24" viewBox="0 0 24 24" fill={likedPosts.includes(post.id) ? '#ef4444' : 'none'} stroke={likedPosts.includes(post.id) ? '#ef4444' : 'currentColor'} strokeWidth="2" style={{ cursor: 'pointer', transition: 'transform 0.1s ease' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>

            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{post.likes + (likedPosts.includes(post.id) ? 1 : 0)} likes</div>
            <div style={{ fontSize: '13px', lineHeight: '1.4', color: '#f5f5f5' }}>
              <b>{post.author}</b> {post.caption}
            </div>
            
            {/* Algorithmic Interaction Metadata Strings */}
            <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {post.tags.map((tg, idx) => <span key={idx} style={{ color: '#0095f6', fontSize: '12px', cursor: 'pointer' }} onClick={() => onInteraction('Hashtag Clicked', tg)}>{tg}</span>)}
              {post.mentions.map((mn, idx) => <span key={idx} style={{ color: '#a855f7', fontSize: '12px', cursor: 'pointer' }} onClick={() => onInteraction('Mention Clicked', mn)}>{mn}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
