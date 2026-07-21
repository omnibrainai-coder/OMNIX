import React, { useEffect, useState } from 'react';

interface AdminMetric {
  active_users: number;
  active_sessions?: number;
  posts_count: number;
  stories_count?: number;
  logs_count: number;
  system_cpu_percent?: number;
  system_memory_percent?: number;
  database_status: string;
}

interface AdminUser {
  id: number;
  username: string;
  status: string;
  last_seen: string;
}

interface AdminPost {
  id: string;
  content: string;
  visibility?: string;
  likes?: number;
  location?: string;
  approved?: boolean;
}

interface AdminLog {
  id: number;
  level: string;
  message: string;
  time: string;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export function AdminDashboard({ onBack }: { onBack?: () => void }) {
  const [metrics, setMetrics] = useState<AdminMetric | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = async (showSpinner = false) => {
    try {
      if (showSpinner) {
        setRefreshing(true);
      }

      const [metricsRes, usersRes, postsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/metrics`),
        fetch(`${API_BASE}/api/admin/users`),
        fetch(`${API_BASE}/api/admin/posts`),
        fetch(`${API_BASE}/api/admin/logs`),
      ]);

      if (!metricsRes.ok || !usersRes.ok || !postsRes.ok || !logsRes.ok) {
        throw new Error('Admin endpoints returned an error');
      }

      const metricsData = await metricsRes.json();
      const usersData = await usersRes.json();
      const postsData = await postsRes.json();
      const logsData = await logsRes.json();

      setMetrics(metricsData.metrics ?? null);
      setUsers((usersData.users ?? []).map((user: AdminUser) => ({ ...user, status: user.status ?? 'active' })));
      setPosts((postsData.posts ?? []).map((post: AdminPost) => ({ ...post, approved: typeof post.approved === 'boolean' ? post.approved : true })));
      setLogs(logsData.logs ?? []);
      setError(null);
    } catch (err) {
      console.error('Unable to load admin dashboard', err);
      setMetrics(null);
      setUsers([]);
      setPosts([]);
      setLogs([]);
      setError('Unable to sync with the admin backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAdminData(true);
    const interval = window.setInterval(() => {
      void loadAdminData(false);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const requestAdminAction = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || 'Admin action failed');
    }

    return data;
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    try {
      const endpoint = user.status === 'active' ? `/api/admin/users/${user.id}/block` : `/api/admin/users/${user.id}/unblock`;
      await requestAdminAction(endpoint, { method: 'POST' });
      await loadAdminData(true);
    } catch (err) {
      console.error('Unable to update user state', err);
      setError('The user state could not be updated right now.');
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      await requestAdminAction(`/api/admin/posts/${postId}/approve`, { method: 'POST' });
      await loadAdminData(true);
    } catch (err) {
      console.error('Unable to approve post', err);
      setError('The moderation action could not be completed.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await requestAdminAction(`/api/admin/posts/${postId}`, { method: 'DELETE' });
      await loadAdminData(true);
    } catch (err) {
      console.error('Unable to delete post', err);
      setError('The moderation action could not be completed.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #111827 100%)', color: '#f8fafc', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '0.24em', color: '#38bdf8', textTransform: 'uppercase' }}>Admin dashboard</div>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>System operations</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Live telemetry is polling every 5 seconds.</div>
        </div>
        <button onClick={() => onBack?.()} type="button" style={{ borderRadius: '999px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', padding: '8px 12px', cursor: 'pointer' }}>← Back</button>
      </div>

      {error ? (
        <div style={{ marginBottom: '12px', border: '1px solid #f59e0b', borderRadius: '12px', background: '#1f2937', color: '#fde68a', padding: '10px 12px', fontSize: '13px' }}>{error}</div>
      ) : null}

      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading admin telemetry…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: '16px' }}>
            <div style={{ border: '1px solid #1f2937', borderRadius: '16px', padding: '12px', background: '#0f172a' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Active users</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{metrics?.active_users ?? 0}</div>
            </div>
            <div style={{ border: '1px solid #1f2937', borderRadius: '16px', padding: '12px', background: '#0f172a' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Active sessions</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{metrics?.active_sessions ?? 0}</div>
            </div>
            <div style={{ border: '1px solid #1f2937', borderRadius: '16px', padding: '12px', background: '#0f172a' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Posts</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{metrics?.posts_count ?? 0}</div>
            </div>
            <div style={{ border: '1px solid #1f2937', borderRadius: '16px', padding: '12px', background: '#0f172a' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Stories</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{metrics?.stories_count ?? 0}</div>
            </div>
            <div style={{ border: '1px solid #1f2937', borderRadius: '16px', padding: '12px', background: '#0f172a' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Logs</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{metrics?.logs_count ?? 0}</div>
            </div>
            <div style={{ border: '1px solid #1f2937', borderRadius: '16px', padding: '12px', background: '#0f172a' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>System load</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>CPU {metrics?.system_cpu_percent ?? 0}% • RAM {metrics?.system_memory_percent ?? 0}%</div>
            </div>
            <div style={{ border: '1px solid #1f2937', borderRadius: '16px', padding: '12px', background: '#0f172a' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Database</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{metrics?.database_status ?? 'unknown'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <section style={{ border: '1px solid #1f2937', borderRadius: '16px', padding: '12px', background: '#0f172a' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>User management</span>
                {refreshing ? <span style={{ fontSize: '11px', color: '#38bdf8' }}>syncing…</span> : null}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ paddingBottom: '8px' }}>User</th>
                    <th style={{ paddingBottom: '8px' }}>Status</th>
                    <th style={{ paddingBottom: '8px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderTop: '1px solid #1f2937' }}>
                      <td style={{ padding: '8px 0' }}>
                        <div style={{ fontWeight: 600 }}>{user.username}</div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>{user.last_seen}</div>
                      </td>
                      <td style={{ padding: '8px 0' }}>
                        <span style={{ color: user.status === 'active' ? '#22c55e' : '#f59e0b', textTransform: 'capitalize' }}>{user.status}</span>
                      </td>
                      <td style={{ padding: '8px 0' }}>
                        <button type="button" onClick={() => void handleToggleUserStatus(user)} style={{ borderRadius: '999px', border: '1px solid #334155', background: '#020617', color: '#f8fafc', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}>
                          {user.status === 'active' ? 'Block' : 'Unblock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section style={{ border: '1px solid #1f2937', borderRadius: '16px', padding: '12px', background: '#0f172a' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Moderation queue</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {posts.map((post) => (
                  <div key={post.id} style={{ borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{post.content}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{post.visibility ?? 'public'} • {post.likes ?? 0} likes • {post.location ?? 'Secure feed'}</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => void handleApprovePost(post.id)} style={{ borderRadius: '999px', border: '1px solid #22c55e', background: '#052e16', color: '#f8fafc', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}>
                        {post.approved ? 'Approved' : 'Approve'}
                      </button>
                      <button type="button" onClick={() => void handleDeletePost(post.id)} style={{ borderRadius: '999px', border: '1px solid #ef4444', background: '#450a0a', color: '#f8fafc', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ border: '1px solid #1f2937', borderRadius: '16px', padding: '12px', background: '#0f172a' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>System logs</span>
                <span style={{ fontSize: '11px', color: '#38bdf8' }}>live stream</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {logs.map((log) => (
                  <div key={log.id} style={{ borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{log.level}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{log.time}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{log.message}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
