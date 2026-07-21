import React, { useMemo, useState } from 'react';

type Report = {
  id: number;
  user: string;
  report: string;
  severity: 'high' | 'medium' | 'low';
  region: string;
};

const metricCards = [
  { label: 'Total Registered Users', value: '12.8K', accent: '#7dd3fc' },
  { label: 'Active Users Online', value: '3.4K', accent: '#34d399' },
  { label: 'Ad Revenue Est. (AdMob / Meta)', value: '$8.2K', accent: '#f9a8d4' },
];

const regions = [
  { name: 'Jammu', users: 1840 },
  { name: 'Delhi', users: 2410 },
  { name: 'Mumbai', users: 1320 },
  { name: 'Bengaluru', users: 980 },
];

const flaggedReports: Report[] = [
  { id: 1, user: 'ops_m', report: 'Spam and phishing attempt', severity: 'high', region: 'Delhi' },
  { id: 2, user: 'nexus_7', report: 'Harassment in chat', severity: 'medium', region: 'Jammu' },
];

export function AdminDashboard() {
  const [role, setRole] = useState<'admin' | 'viewer'>('admin');
  const [reports] = useState(flaggedReports);

  const canModerate = useMemo(() => role === 'admin', [role]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #111827 100%)', color: '#f8fafc', padding: '24px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7dd3fc' }}>Operations Center</div>
          <h2 style={{ margin: '4px 0 0', fontSize: '24px' }}>Admin Dashboard</h2>
        </div>
        <select value={role} onChange={(event) => setRole(event.target.value as 'admin' | 'viewer')} style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px' }}>
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '20px' }}>
        {metricCards.map((card) => (
          <div key={card.label} style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px', boxShadow: '0 12px 40px rgba(2, 6, 23, 0.25)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{card.label}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: card.accent }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1.1fr 0.9fr', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px' }}>Active Users by Region</div>
          {regions.map((region) => (
            <div key={region.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
              <span>{region.name}</span>
              <span style={{ color: '#7dd3fc', fontWeight: 600 }}>{region.users} users</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px' }}>Moderation Queue</div>
          {!canModerate ? (
            <div style={{ color: '#fda4af', padding: '12px 0' }}>Strict admin-role verification required to review flagged reports.</div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {reports.map((report) => (
                <div key={report.id} style={{ background: '#020617', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong>{report.user}</strong>
                    <span style={{ color: report.severity === 'high' ? '#f87171' : report.severity === 'medium' ? '#fbbf24' : '#34d399', fontSize: '12px', fontWeight: 700 }}>{report.severity.toUpperCase()}</span>
                  </div>
                  <div style={{ color: '#cbd5e1', marginBottom: '4px' }}>{report.report}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{report.region}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
