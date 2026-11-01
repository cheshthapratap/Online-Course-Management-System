import { useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthCtx, useAuth } from './lib.jsx';
import Home from './pages/Home.jsx';
import { CourseDetail, Login, Register } from './pages/Public.jsx';
import Admin from './pages/Admin.jsx';
import Teacher from './pages/Teacher.jsx';
import { StudentHome, Learn, Quiz } from './pages/Student.jsx';

function Dashboard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return user.role === 'ADMIN' ? <Admin /> : user.role === 'TEACHER' ? <Teacher /> : <StudentHome />;
}
function Promo() {
  const [open, setOpen] = useState(() => sessionStorage.getItem('promo') !== 'off');
  if (!open) return null;
  return (
    <div className="promo">
      <p>New batches start every Monday. <Link to="/register">Create your account</Link> and join your first live class free.</p>
      <button aria-label="Dismiss announcement" onClick={() => { sessionStorage.setItem('promo', 'off'); setOpen(false); }}>&times;</button>
    </div>
  );
}
function Nav() {
  const { user, logout } = useAuth(); const nav = useNavigate(); const [q, setQ] = useState('');
  const go = e => { e.preventDefault(); nav('/?q=' + encodeURIComponent(q) + '#courses'); };
  return (
    <header className="nav">
      <Link to="/" className="brand">BrightPath</Link>
      <Link to="/#courses" className="navlink">Explore</Link>
      <form className="navsearch" onSubmit={go} role="search">
        <input type="search" placeholder="Search for courses, subjects or teachers" value={q} onChange={e => setQ(e.target.value)} aria-label="Search courses" />
      </form>
      <nav>
        {user ? (<>
          <Link to="/dashboard" className="navlink">Dashboard</Link>
          <span className="mute who">{user.name}</span>
          <button className="btn ghost" onClick={logout}>Log out</button>
        </>) : (<>
          <Link to="/register?role=TEACHER" className="navlink">Teach with us</Link>
          <Link to="/login" className="btn ghost">Log in</Link>
          <Link to="/register" className="btn">Sign up</Link>
        </>)}
      </nav>
    </header>
  );
}
function Footer() {
  return (
    <footer className="foot">
      <div><b>BrightPath Coaching</b><p>Live classes, recorded lectures, notes and tests for students, taught by verified teachers.</p></div>
      <div><b>Students</b><Link to="/register">Create account</Link><Link to="/#courses">Browse batches</Link></div>
      <div><b>Teachers</b><Link to="/register?role=TEACHER">Apply to teach</Link><Link to="/login">Teacher login</Link></div>
    </footer>
  );
}
export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  const login = (token, u) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.clear(); setUser(null); };
  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <Promo />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={
          <main className="container">
            <Routes>
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/learn/:id" element={user ? <Learn /> : <Navigate to="/login" />} />
              <Route path="/quiz/:id" element={user?.role === 'STUDENT' ? <Quiz /> : <Navigate to="/login" />} />
              <Route path="*" element={<p>Page not found. <Link to="/">Back to courses</Link></p>} />
            </Routes>
          </main>} />
      </Routes>
      <Footer />
    </AuthCtx.Provider>
  );
}
