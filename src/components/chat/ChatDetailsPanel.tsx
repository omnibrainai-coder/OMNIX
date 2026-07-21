import React, { useEffect, useState } from 'react';
import type { ChatDetails, MuteDuration, ReportReason } from '../../types/social';

type Props = {
  details: ChatDetails | null;
  loading: boolean;
  error: string;
  statusMessage: string;
  searchMatches: Array<{ id: number; text: string; sender_name: string; created_at: string }>;
  onClose: () => void;
  onSaveSettings: (payload: {
    custom_wallpaper?: string;
    custom_nickname?: string;
    is_muted?: boolean;
    mute_duration?: MuteDuration;
    notification_sound_enabled?: boolean;
    vibration_enabled?: boolean;
  }) => Promise<void>;
  onResetWallpaper: () => Promise<void>;
  onSearch: (query: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
  onExport: () => Promise<void>;
  onToggleBlock: () => Promise<void>;
  onReport: (reason: ReportReason, description: string) => Promise<void>;
};

export function ChatDetailsPanel({
  details,
  loading,
  error,
  statusMessage,
  searchMatches,
  onClose,
  onSaveSettings,
  onResetWallpaper,
  onSearch,
  onClearHistory,
  onExport,
  onToggleBlock,
  onReport,
}: Props) {
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [wallpaperDraft, setWallpaperDraft] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [muteEnabled, setMuteEnabled] = useState(false);
  const [muteDuration, setMuteDuration] = useState<MuteDuration>('always');
  const [searchDraft, setSearchDraft] = useState('');
  const [reportReason, setReportReason] = useState<ReportReason>('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [busyAction, setBusyAction] = useState('');

  useEffect(() => {
    if (!details) {
      return;
    }

    setNicknameDraft(details.settings.custom_nickname ?? '');
    setWallpaperDraft(details.settings.custom_wallpaper ?? '');
    setSoundEnabled(details.settings.notification_sound_enabled);
    setVibrationEnabled(details.settings.vibration_enabled);
    setMuteEnabled(details.settings.is_muted);
    setMuteDuration(details.settings.mute_until ? '1_week' : 'always');
  }, [details]);

  const runAction = async (actionKey: string, action: () => Promise<void>) => {
    setBusyAction(actionKey);
    try {
      await action();
    } finally {
      setBusyAction('');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.92)',
        backdropFilter: 'blur(16px)',
        zIndex: 40,
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '20px 16px 28px', maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7dd3fc' }}>Chat details</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc' }}>{details?.settings.custom_nickname || details?.profile.display_name || 'Conversation'}</div>
          </div>
          <button type="button" onClick={onClose} style={{ borderRadius: '999px', border: '1px solid #334155', background: 'transparent', color: '#f8fafc', width: '40px', height: '40px', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {loading ? <div style={{ color: '#94a3b8' }}>Loading chat settings…</div> : null}
        {!loading && error ? <div style={{ color: '#fca5a5', marginBottom: '12px' }}>{error}</div> : null}
        {!loading && statusMessage ? <div style={{ color: '#86efac', marginBottom: '12px' }}>{statusMessage}</div> : null}

        {details ? (
          <div style={{ display: 'grid', gap: '14px' }}>
            <section style={{ background: 'rgba(15, 23, 42, 0.82)', border: '1px solid #1e293b', borderRadius: '20px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: details.profile.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020617', fontWeight: 800 }}>
                  {details.profile.display_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>{details.profile.display_name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>@{details.profile.username}</div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>{details.profile.bio}</div>
                </div>
              </div>
            </section>

            <section style={{ background: 'rgba(15, 23, 42, 0.82)', border: '1px solid #1e293b', borderRadius: '20px', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>Shared media</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                {details.shared_media.map((asset) => (
                  <div key={asset.id} style={{ borderRadius: '16px', border: '1px solid #334155', background: '#020617', padding: '12px', minHeight: '88px' }}>
                    <div style={{ fontSize: '11px', color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>{asset.type}</div>
                    <div style={{ fontSize: '13px', color: '#f8fafc', marginBottom: '8px' }}>{asset.label}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', wordBreak: 'break-all' }}>{asset.url}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ background: 'rgba(15, 23, 42, 0.82)', border: '1px solid #1e293b', borderRadius: '20px', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>Personalize</div>
              <div style={{ display: 'grid', gap: '10px' }}>
                <input value={nicknameDraft} onChange={(event) => setNicknameDraft(event.target.value)} placeholder="Custom nickname" style={{ borderRadius: '14px', border: '1px solid #334155', background: '#020617', color: '#f8fafc', padding: '10px 12px' }} />
                <input value={wallpaperDraft} onChange={(event) => setWallpaperDraft(event.target.value)} placeholder="Wallpaper URL or local asset path" style={{ borderRadius: '14px', border: '1px solid #334155', background: '#020617', color: '#f8fafc', padding: '10px 12px' }} />
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => void runAction('save-settings', () => onSaveSettings({ custom_nickname: nicknameDraft, custom_wallpaper: wallpaperDraft }))} style={{ borderRadius: '999px', border: 'none', background: '#0f766e', color: '#ecfeff', padding: '10px 14px', cursor: 'pointer' }}>
                    {busyAction === 'save-settings' ? 'Saving…' : 'Save nickname & wallpaper'}
                  </button>
                  <button type="button" onClick={() => void runAction('reset-wallpaper', onResetWallpaper)} style={{ borderRadius: '999px', border: '1px solid #475569', background: 'transparent', color: '#f8fafc', padding: '10px 14px', cursor: 'pointer' }}>
                    {busyAction === 'reset-wallpaper' ? 'Resetting…' : 'Reset wallpaper'}
                  </button>
                </div>
              </div>
            </section>

            <section style={{ background: 'rgba(15, 23, 42, 0.82)', border: '1px solid #1e293b', borderRadius: '20px', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>Notifications</div>
              <div style={{ display: 'grid', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#e2e8f0' }}>
                  Mute notifications
                  <input type="checkbox" checked={muteEnabled} onChange={(event) => setMuteEnabled(event.target.checked)} />
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(['8_hours', '1_week', 'always'] as MuteDuration[]).map((duration) => (
                    <button key={duration} type="button" onClick={() => setMuteDuration(duration)} style={{ borderRadius: '999px', border: muteDuration === duration ? '1px solid #22d3ee' : '1px solid #334155', background: muteDuration === duration ? 'rgba(34, 211, 238, 0.12)' : 'transparent', color: '#e2e8f0', padding: '8px 12px', cursor: 'pointer' }}>
                      {duration.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#e2e8f0' }}>
                  Custom sound
                  <input type="checkbox" checked={soundEnabled} onChange={(event) => setSoundEnabled(event.target.checked)} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#e2e8f0' }}>
                  Vibration
                  <input type="checkbox" checked={vibrationEnabled} onChange={(event) => setVibrationEnabled(event.target.checked)} />
                </label>
                <button type="button" onClick={() => void runAction('save-notifications', () => onSaveSettings({ is_muted: muteEnabled, mute_duration: muteDuration, notification_sound_enabled: soundEnabled, vibration_enabled: vibrationEnabled }))} style={{ borderRadius: '999px', border: 'none', background: '#2563eb', color: '#eff6ff', padding: '10px 14px', cursor: 'pointer' }}>
                  {busyAction === 'save-notifications' ? 'Saving…' : 'Save notification settings'}
                </button>
              </div>
            </section>

            <section style={{ background: 'rgba(15, 23, 42, 0.82)', border: '1px solid #1e293b', borderRadius: '20px', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>Search in chat</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search messages" style={{ flex: 1, borderRadius: '14px', border: '1px solid #334155', background: '#020617', color: '#f8fafc', padding: '10px 12px' }} />
                <button type="button" onClick={() => void runAction('search-chat', () => onSearch(searchDraft))} style={{ borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#f5f3ff', padding: '10px 14px', cursor: 'pointer' }}>
                  {busyAction === 'search-chat' ? 'Searching…' : 'Search'}
                </button>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {searchMatches.map((match) => (
                  <div key={match.id} style={{ borderRadius: '14px', border: '1px solid #334155', background: '#020617', padding: '10px 12px' }}>
                    <div style={{ fontSize: '11px', color: '#7dd3fc', marginBottom: '4px' }}>{match.sender_name}</div>
                    <div style={{ fontSize: '13px', color: '#f8fafc' }}>{match.text}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{new Date(match.created_at).toLocaleString()}</div>
                  </div>
                ))}
                {!searchMatches.length && searchDraft ? <div style={{ fontSize: '12px', color: '#94a3b8' }}>No matching messages found.</div> : null}
              </div>
            </section>

            <section style={{ background: 'rgba(15, 23, 42, 0.82)', border: '1px solid #1e293b', borderRadius: '20px', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>Quick actions</div>
              <div style={{ display: 'grid', gap: '10px' }}>
                <button type="button" onClick={() => void runAction('block-toggle', onToggleBlock)} style={{ borderRadius: '999px', border: 'none', background: details.relationship.blocked_by_current_user ? '#14532d' : '#7f1d1d', color: '#f8fafc', padding: '10px 14px', cursor: 'pointer' }}>
                  {busyAction === 'block-toggle' ? 'Updating…' : details.relationship.blocked_by_current_user ? 'Unblock user' : 'Block user'}
                </button>
                <button type="button" onClick={() => void runAction('clear-history', onClearHistory)} style={{ borderRadius: '999px', border: '1px solid #475569', background: 'transparent', color: '#f8fafc', padding: '10px 14px', cursor: 'pointer' }}>
                  {busyAction === 'clear-history' ? 'Clearing…' : 'Clear chat history'}
                </button>
                <button type="button" onClick={() => void runAction('export-chat', onExport)} style={{ borderRadius: '999px', border: '1px solid #475569', background: 'transparent', color: '#f8fafc', padding: '10px 14px', cursor: 'pointer' }}>
                  {busyAction === 'export-chat' ? 'Exporting…' : 'Export chat'}
                </button>
              </div>
              <div style={{ display: 'grid', gap: '8px', marginTop: '16px' }}>
                <select value={reportReason} onChange={(event) => setReportReason(event.target.value as ReportReason)} style={{ borderRadius: '14px', border: '1px solid #334155', background: '#020617', color: '#f8fafc', padding: '10px 12px' }}>
                  <option value="spam">Spam</option>
                  <option value="harassment">Harassment</option>
                  <option value="inappropriate_content">Inappropriate Content</option>
                  <option value="fraud">Fraud</option>
                </select>
                <textarea value={reportDescription} onChange={(event) => setReportDescription(event.target.value)} placeholder="Report details" rows={3} style={{ borderRadius: '14px', border: '1px solid #334155', background: '#020617', color: '#f8fafc', padding: '10px 12px', resize: 'vertical' }} />
                <button type="button" onClick={() => void runAction('report-user', () => onReport(reportReason, reportDescription))} style={{ borderRadius: '999px', border: 'none', background: '#92400e', color: '#fffbeb', padding: '10px 14px', cursor: 'pointer' }}>
                  {busyAction === 'report-user' ? 'Submitting…' : 'Report user'}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}