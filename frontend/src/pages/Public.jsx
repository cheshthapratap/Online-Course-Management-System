import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, useAuth, useForm, Alert } from '../lib.jsx';

export function CourseDetail() {
  const { id } = useParams(); const { user } = useAuth(); const nav = useNavigate();
  const [c, setC] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api('/courses/' + id).then(setC).catch(e => setErr(e.message)); }, [id]);
  const enroll = async () => {
    try { await api('/student/enroll/' + id, { method: 'POST' }); nav('/learn/' + id); }
    catch (e) { if (e.message === 'Already enrolled') nav('/learn/' + id); else setErr(e.message); }
  };
  if (err && !c) return <Alert>{err}</Alert>;
  if (!c) return <p className="mute">Loading...</p>;
  return (
    <section className="panel">
      <span className="tag">{c.category}</span>
      <h1>{c.title}</h1>
      <p>{c.description}</p>
      <p className="mute">Duration: {c.duration || 'Self-paced'}. Taught by {c.teacher?.name}.</p>
      <p><b>{c.fee ? 'Rs ' + c.fee.toLocaleString('en-IN') : 'Free'}</b></p>
      <Alert>{err}</Alert>
      {user?.role === 'STUDENT' && <button className="btn" onClick={enroll}>Enroll in this course</button>}
      {!user && <Link className="btn" to="/login">Log in to enroll</Link>}
      {user && user.role !== 'STUDENT' && <p className="mute">Only student accounts can enroll.</p>}
    </section>
  );
}

export function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  const [f, on] = useForm({ email: '', password: '' }); const [err, setErr] = useState('');
  const submit = async e => {
    e.preventDefault();
    try { const r = await api('/auth/login', { method: 'POST', body: f }); login(r.token, r.user); nav('/dashboard'); }
    catch (x) { setErr(x.message); }
  };
  return (
    <form className="panel narrow" onSubmit={submit}>
      <h2>Log in</h2>
      <Alert>{err}</Alert>
      <label>Email<input type="email" value={f.email} onChange={on('email')} required autoComplete="username" /></label>
      <label>Password<input type="password" value={f.password} onChange={on('password')} required autoComplete="current-password" /></label>
      <button className="btn">Log in</button>
      <p className="mute">New here? <Link to="/register">Create an account</Link></p>
    </form>
  );
}

export function Register() {
  const [sp] = useSearchParams();
  const [f, on] = useForm({ role: sp.get('role') === 'TEACHER' ? 'TEACHER' : 'STUDENT', name: '', email: '', password: '', confirm: '', mobile: '', city: '', qualification: '', guardianName: '', guardianMobile: '' });
  const [err, setErr] = useState(''); const [ok, setOk] = useState('');
  const submit = async e => {
    e.preventDefault(); setErr(''); setOk('');
    if (f.password !== f.confirm) return setErr('Passwords do not match');
    if (!/^[0-9]{10}$/.test(f.mobile)) return setErr('Enter a 10-digit mobile number');
    try { const { confirm, ...body } = f; const r = await api('/auth/register', { method: 'POST', body }); setOk(r.message); }
    catch (x) { setErr(x.message); }
  };
  return (
    <form className="panel narrow" onSubmit={submit}>
      <h2>Create your account</h2>
      <Alert>{err}</Alert><Alert kind="ok">{ok}</Alert>
      <label>I am a<select value={f.role} onChange={on('role')}><option value="STUDENT">Student</option><option value="TEACHER">Teacher (needs admin approval)</option></select></label>
      <label>Full name<input value={f.name} onChange={on('name')} required /></label>
      <label>Email<input type="email" value={f.email} onChange={on('email')} required /></label>
      <label>Mobile number<input value={f.mobile} onChange={on('mobile')} inputMode="numeric" required /></label>
      <label>City<input value={f.city} onChange={on('city')} /></label>
      <label>Highest qualification<input value={f.qualification} onChange={on('qualification')} /></label>
      {f.role === 'STUDENT' && (<>
        <label>Parent/guardian name<input value={f.guardianName} onChange={on('guardianName')} /></label>
        <label>Parent/guardian mobile<input value={f.guardianMobile} onChange={on('guardianMobile')} /></label>
      </>)}
      <label>Password (min 8 characters)<input type="password" minLength={8} value={f.password} onChange={on('password')} required autoComplete="new-password" /></label>
      <label>Confirm password<input type="password" value={f.confirm} onChange={on('confirm')} required autoComplete="new-password" /></label>
      <button className="btn">Create account</button>
      <p className="mute">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
