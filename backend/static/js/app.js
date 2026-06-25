// Shared client helpers: CSRF cookie reading, JSON fetch wrapper, feed/stories loaders, logout.

function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

async function ensureCsrf() {
  let token = getCookie('csrf_token');
  if (token) return token;
  const r = await fetch('/api/auth/csrf', { credentials: 'include' });
  if (r.ok) {
    const j = await r.json();
    return j.csrf_token || getCookie('csrf_token');
  }
  return null;
}

async function api(path, method = 'GET', body = null) {
  const headers = { 'Accept': 'application/json' };
  if (method !== 'GET') {
    const csrf = await ensureCsrf();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  let res;
  try {
    res = await fetch(path, {
      method, headers, credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    return { ok: false, status: 0, detail: 'Network error' };
  }
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) return { ok: false, status: res.status, detail: (data && data.detail) || res.statusText, data };
  return { ok: true, status: res.status, data };
}

async function apiUpload(path, formData) {
  const csrf = await ensureCsrf();
  const headers = {};
  if (csrf) headers['X-CSRF-Token'] = csrf;
  let res;
  try {
    res = await fetch(path, { method: 'POST', headers, credentials: 'include', body: formData });
  } catch (e) { return { ok: false, status: 0, detail: 'Network error' }; }
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) return { ok: false, status: res.status, detail: (data && data.detail) || res.statusText, data };
  return { ok: true, status: res.status, data };
}

window.api = api;
window.apiUpload = apiUpload;
window.ensureCsrf = ensureCsrf;

window.loadFeedAndStories = async function () {
  const [feedRes, storyRes] = await Promise.all([
    api('/api/posts/feed', 'GET'),
    api('/api/stories/active', 'GET'),
  ]);
  if (feedRes.ok) {
    const list = document.getElementById('feed-list');
    if (list) {
      list.innerHTML = '';
      (feedRes.data.posts || []).forEach(p => {
        const card = document.createElement('div');
        card.className = 'feed-item';
        card.dataset.testid = 'feed-post-' + p.id;
        card.innerHTML = `
          <img src="data:${p.image_mime};base64,${p.image_b64}" alt="post"/>
          <div class="feed-meta">
            <div class="who">@${p.username}</div>
            <div class="cap">${(p.caption || '').replace(/</g, '&lt;')}</div>
            <button class="like-btn" data-id="${p.id}" data-testid="like-${p.id}">♥ ${p.like_count}</button>
          </div>`;
        list.appendChild(card);
      });
      list.querySelectorAll('.like-btn').forEach(btn => {
        btn.onclick = async () => {
          const r = await api('/api/posts/' + btn.dataset.id + '/like', 'POST');
          if (r.ok) window.loadFeedAndStories();
        };
      });
    }
  }
  if (storyRes.ok) {
    const row = document.getElementById('stories-list');
    if (row) {
      row.innerHTML = '';
      (storyRes.data.stories || []).forEach(s => {
        const img = document.createElement('img');
        img.src = `data:${s.image_mime};base64,${s.image_b64}`;
        img.title = '@' + s.username;
        img.dataset.testid = 'story-' + s.id;
        row.appendChild(img);
      });
    }
  }
};

document.addEventListener('click', async (e) => {
  if (e.target && e.target.id === 'logout-link') {
    e.preventDefault();
    await api('/api/auth/logout', 'POST');
    location.href = '/api/pages/login';
  }
});

// ---------- Report content modal (shared helper) ----------
window.openReportModal = function (targetType, targetId, label) {
  // Remove any existing modal
  document.getElementById('report-modal-overlay')?.remove();
  const reasons = [
    ['spam', 'Spam or scam'],
    ['harassment', 'Harassment or bullying'],
    ['hate', 'Hate speech'],
    ['nudity', 'Nudity or sexual content'],
    ['violence', 'Violence or threats'],
    ['self_harm', 'Self-harm'],
    ['csam', 'Child sexual abuse material'],
    ['impersonation', 'Impersonation'],
    ['other', 'Other (please describe)'],
  ];
  const overlay = document.createElement('div');
  overlay.id = 'report-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.dataset.testid = 'report-modal';
  overlay.innerHTML = `
    <div class="modal-card">
      <h2>Report ${targetType}</h2>
      <p class="muted small">${label || ''}</p>
      <form id="report-form" data-testid="report-form">
        <label>Reason</label>
        <select name="reason" data-testid="report-reason" required>
          ${reasons.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}
        </select>
        <label>Additional details (optional)</label>
        <textarea name="details" data-testid="report-details" maxlength="500"></textarea>
        <div class="modal-actions">
          <button type="button" id="report-cancel" data-testid="report-cancel">Cancel</button>
          <button type="submit" class="danger-btn" data-testid="report-submit">Submit report</button>
        </div>
        <p id="report-msg" data-testid="report-msg"></p>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#report-cancel').onclick = () => overlay.remove();
  overlay.querySelector('#report-form').onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const out = await window.api('/api/reports', 'POST', {
      target_type: targetType,
      target_id: targetId,
      reason: f.get('reason'),
      details: f.get('details') || '',
    });
    const m = overlay.querySelector('#report-msg');
    if (out.ok) {
      m.textContent = out.data.deduped ? 'You already reported this — thanks.' : 'Report submitted. Thanks for keeping OMNIX safe.';
      m.className = 'ok';
      setTimeout(() => overlay.remove(), 1400);
    } else {
      m.textContent = out.detail || 'Failed';
      m.className = 'err';
    }
  };
};
