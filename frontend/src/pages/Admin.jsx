import { useEffect, useState } from 'react';
import { api, Alert, Announcements } from '../lib.jsx';

export default function Admin() {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState({}); const [users, setUsers] = useState([]); const [courses, setCourses] = useState([]); const [results, setResults] = useState([]);
  const [err, setErr] = useState('');
  const load = () => Promise.all([api('/admin/stats'), api('/admin/users'), api('/admin/courses'), api('/admin/results')])
    .then(([s, u, c, r]) => { setStats(s); setUsers(u); setCourses(c); setResults(r); }).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);
  const act = async (fn) => { try { await fn(); setErr(''); load(); } catch (e) { setErr(e.message); } };
  const teachers = users.filter(u => u.role === 'TEACHER' && u.status === 'ACTIVE');
  const cards = [['Students', stats.students], ['Teachers', stats.teachers], ['Courses', stats.courses], ['Enrollments', stats.enrollments], ['Awaiting approval', stats.pendingTeachers]];
  return (
    <>
      <h2>Admin dashboard</h2>
      <div className="stats">{cards.map(([k, v]) => <div key={k} className="stat"><b>{v ?? '-'}</b><span>{k}</span></div>)}</div>
      <Alert>{err}</Alert>
      <div className="tabs">{['users', 'courses', 'results', 'announcements'].map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>

      {tab === 'users' && <div className="scroll"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{users.map(u => (
          <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td><span className={'pill ' + u.status}>{u.status}</span></td>
            <td>{u.role !== 'ADMIN' && (<>
              {u.status !== 'ACTIVE' && <button className="btn sm" onClick={() => act(() => api(`/admin/users/${u.id}/status?value=ACTIVE`, { method: 'PUT' }))}>{u.status === 'PENDING' ? 'Approve' : 'Activate'}</button>}
              {u.status === 'PENDING' && <button className="btn sm ghost" onClick={() => act(() => api(`/admin/users/${u.id}/status?value=SUSPENDED`, { method: 'PUT' }))}>Reject</button>}
              {u.status === 'ACTIVE' && <button className="btn sm ghost" onClick={() => act(() => api(`/admin/users/${u.id}/status?value=SUSPENDED`, { method: 'PUT' }))}>Suspend</button>}
            </>)}</td></tr>))}</tbody></table></div>}

      {tab === 'courses' && <div className="scroll"><table>
        <thead><tr><th>Title</th><th>Category</th><th>Teacher</th><th>Published</th><th>Actions</th></tr></thead>
        <tbody>{courses.map(c => (
          <tr key={c.id}><td>{c.title}</td><td>{c.category}</td>
            <td><select value={c.teacher?.id || ''} onChange={e => act(() => api(`/admin/courses/${c.id}/teacher/${e.target.value}`, { method: 'PUT' }))} aria-label="Assign teacher">
              <option value="" disabled>Assign...</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></td>
            <td><span className={'pill ' + (c.published ? 'ACTIVE' : 'PENDING')}>{c.published ? 'Live' : 'Draft'}</span></td>
            <td><button className="btn sm" onClick={() => act(() => api(`/admin/courses/${c.id}/publish?value=${!c.published}`, { method: 'PUT' }))}>{c.published ? 'Unpublish' : 'Publish'}</button>
              <button className="btn sm danger" onClick={() => confirm(`Delete "${c.title}" and all its content?`) && act(() => api('/admin/courses/' + c.id, { method: 'DELETE' }))}>Delete</button></td></tr>))}</tbody></table></div>}

      {tab === 'results' && <div className="scroll"><table>
        <thead><tr><th>Student</th><th>Test</th><th>Score</th><th>Result</th></tr></thead>
        <tbody>{results.map(r => <tr key={r.id}><td>{r.student?.name}</td><td>{r.testTitle}</td><td>{r.score} / {r.total}</td><td><span className={'pill ' + (r.passed ? 'ACTIVE' : 'SUSPENDED')}>{r.passed ? 'Pass' : 'Fail'}</span></td></tr>)}</tbody></table>
        {!results.length && <p className="mute">No test attempts yet.</p>}</div>}

      {tab === 'announcements' && <Announcements canPost />}
    </>
  );
}
