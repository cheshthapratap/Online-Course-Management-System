import { createContext, useContext, useEffect, useState } from 'react';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* empty or non-JSON body */ }
  if (res.status === 401 && token && !path.startsWith('/auth')) { localStorage.clear(); location.href = '/login'; }
  if (!res.ok) throw new Error((data && data.message) || `Request failed (${res.status})`);
  return data;
}

export const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function useForm(init) {
  const [f, setF] = useState(init);
  return [f, k => e => setF({ ...f, [k]: e.target.value }), setF];
}
export const fmt = d => (d ? new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '');

export function Alert({ kind = 'error', children }) {
  return children ? <div className={'alert ' + kind} role="alert">{children}</div> : null;
}
export function Progress({ value }) {
  return <div className="bar" aria-label={`${value}% complete`}><span style={{ width: value + '%' }} /></div>;
}

export function Announcements({ canPost }) {
  const [items, setItems] = useState([]); const [err, setErr] = useState('');
  const [f, on, setF] = useForm({ title: '', message: '' });
  const load = () => api('/announcements').then(setItems).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);
  const post = async e => {
    e.preventDefault();
    try { await api('/announcements', { method: 'POST', body: f }); setF({ title: '', message: '' }); setErr(''); load(); } catch (x) { setErr(x.message); }
  };
  return (
    <section className="panel">
      <h3>Announcements</h3>
      <Alert>{err}</Alert>
      {canPost && (
        <form onSubmit={post} className="row">
          <input placeholder="Title" value={f.title} onChange={on('title')} required />
          <input placeholder="Message" value={f.message} onChange={on('message')} required />
          <button className="btn">Post announcement</button>
        </form>
      )}
      {items.length === 0 && <p className="mute">No announcements yet.</p>}
      {items.map(a => (
        <div key={a.id} className="note"><strong>{a.title}</strong><p>{a.message}</p><small className="mute">{a.author}, {fmt(a.createdAt)}</small></div>
      ))}
    </section>
  );
}
