import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { api, Alert } from '../lib.jsx';

const slides = [
  { cls: 's1', title: 'Crack board and entrance exams with live batches', text: 'Daily live classes, recorded lectures and chapter-wise tests from expert teachers. New batches start every Monday.', cta: 'Browse batches', to: '/#courses', art: 'Live + Recorded' },
  { cls: 's2', title: 'Teach what you know. We run the classroom.', text: 'Publish lessons, schedule live classes and build MCQ tests from one teacher dashboard.', cta: 'Become a teacher', to: '/register?role=TEACHER', art: 'Your own batch' },
  { cls: 's3', title: 'Practice every day with timed MCQ tests', text: 'Instant scores, correct answers with explanations, and a progress bar for every course you take.', cta: 'Create free account', to: '/register', art: 'Test. Learn. Repeat.' },
];
const hue = s => [...(s || 'x')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const price = c => (c.fee ? 'Rs ' + Number(c.fee).toLocaleString('en-IN') : 'Free');

function Hero() {
  const [i, setI] = useState(0); const [hold, setHold] = useState(false);
  const n = slides.length, s = slides[i];
  useEffect(() => {
    if (hold || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI(x => (x + 1) % n), 6000); return () => clearInterval(t);
  }, [hold, n]);
  return (
    <section className={'hero2 ' + s.cls} aria-roledescription="carousel" aria-label="Featured" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <div className="herocard" aria-live="polite">
        <h1>{s.title}</h1><p>{s.text}</p>
        <Link className="btn big" to={s.to}>{s.cta}</Link>
      </div>
      <div className="heroart" aria-hidden="true"><i /><i /><i /><span>{s.art}</span></div>
      <button className="arrow l" aria-label="Previous slide" onClick={() => setI((i + n - 1) % n)}>&#8249;</button>
      <button className="arrow r" aria-label="Next slide" onClick={() => setI((i + 1) % n)}>&#8250;</button>
      <div className="dots">{slides.map((_, k) => <button key={k} className={k === i ? 'on' : ''} aria-label={'Slide ' + (k + 1)} onClick={() => setI(k)} />)}</div>
    </section>
  );
}

export default function Home() {
  const [sp] = useSearchParams(); const q = sp.get('q') || ''; const loc = useLocation();
  const [list, setList] = useState([]); const [cats, setCats] = useState([]); const [cat, setCat] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { api('/courses').then(a => setCats([...new Set(a.map(c => c.category).filter(Boolean))])).catch(() => {}); }, []);
  useEffect(() => { api('/courses?q=' + encodeURIComponent(q)).then(setList).catch(e => setErr(e.message)); }, [q]);
  useEffect(() => { if (loc.hash) document.querySelector(loc.hash)?.scrollIntoView({ behavior: 'smooth' }); }, [loc.hash, loc.search]);
  const shown = cat ? list.filter(c => c.category === cat) : list;
  return (
    <>
      <Hero />
      <div className="container">
        <section id="courses">
          <h2>{q ? `Results for "${q}"` : 'A broad selection of batches'}</h2>
          <p className="mute">Choose from live and recorded courses taught by approved teachers.</p>
          <div className="chips" role="group" aria-label="Filter by category">
            <button className={!cat ? 'on' : ''} onClick={() => setCat('')}>All</button>
            {cats.map(c => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <Alert>{err}</Alert>
          <div className="grid">
            {shown.map(c => (
              <Link key={c.id} to={`/courses/${c.id}`} className="ccard">
                <div className="thumb" style={{ background: `linear-gradient(135deg, hsl(${hue(c.category)} 55% 34%), hsl(${(hue(c.category) + 40) % 360} 60% 46%))` }}><span>{c.category || 'General'}</span></div>
                <div className="cbody"><h3>{c.title}</h3><small className="mute">{c.teacher?.name}</small>
                  <p className="clip">{c.description}</p>
                  <div className="meta"><b>{price(c)}</b><small className="mute">{c.duration}</small></div></div>
              </Link>))}
          </div>
          {!shown.length && !err && <p className="mute">No batches found. Try another search or category.</p>}
        </section>

        <section className="how">
          <h2>One platform for every role</h2>
          <div className="three">
            <div className="panel"><h3>Students</h3><p>Register, enroll in a batch, join live classes, watch recordings, download notes and take timed tests with instant results.</p><Link to="/register">Join as a student</Link></div>
            <div className="panel"><h3>Teachers</h3><p>Apply, get approved, then publish lessons, schedule live classes, create MCQ tests and track every student's progress.</p><Link to="/register?role=TEACHER">Apply to teach</Link></div>
            <div className="panel"><h3>Admins</h3><p>Approve teachers, publish courses, assign batches, review test results and keep announcements current.</p><Link to="/login">Admin login</Link></div>
          </div>
        </section>
      </div>
    </>
  );
}
