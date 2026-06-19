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
