import { useEffect, useState } from 'react';
import { api, useForm, Alert, Announcements, fmt } from '../lib.jsx';

const blankCourse = { title: '', category: '', duration: '', fee: '', description: '' };
export default function Teacher() {
  const [courses, setCourses] = useState([]); const [sel, setSel] = useState(null); const [msg, setMsg] = useState('');
  const [f, on, setF] = useForm(blankCourse);
  const load = () => api('/teacher/courses').then(setCourses).catch(e => setMsg(e.message));
  useEffect(() => { load(); }, []);
  const create = async e => {
    e.preventDefault();
    try { await api('/teacher/courses', { method: 'POST', body: { ...f, fee: f.fee === '' ? null : Number(f.fee) } }); setF(blankCourse); setMsg('Course created. It becomes visible to students once an admin publishes it.'); load(); }
    catch (x) { setMsg(x.message); }
  };
  if (sel) return <Manage course={sel} back={() => { setSel(null); load(); }} />;
  return (
    <>
      <h2>Teacher dashboard</h2>
      <Alert kind="ok">{msg}</Alert>
      <div className="grid">
        {courses.map(c => (
          <div key={c.id} className="card">
            <span className={'pill ' + (c.published ? 'ACTIVE' : 'PENDING')}>{c.published ? 'Live' : 'Draft'}</span>
            <h3>{c.title}</h3><p className="mute">{c.category} - {c.duration}</p>
            <button className="btn sm" onClick={() => setSel(c)}>Manage course</button>
          </div>))}
      </div>
      {!courses.length && <p className="mute">You have no courses yet. Create your first one below, or ask an admin to assign one.</p>}
      <form className="panel" onSubmit={create}>
        <h3>New course</h3>
        <div className="row"><input placeholder="Title" value={f.title} onChange={on('title')} required /><input placeholder="Category" value={f.category} onChange={on('category')} /><input placeholder="Duration (e.g. 6 weeks)" value={f.duration} onChange={on('duration')} /><input type="number" min="0" placeholder="Fee in Rs (0 = free)" value={f.fee} onChange={on('fee')} /></div>
        <textarea placeholder="Description and syllabus" value={f.description} onChange={on('description')} rows={3} />
        <button className="btn">Create course</button>
      </form>
      <Announcements canPost />
    </>
  );
}

function Manage({ course, back }) {
  const [tab, setTab] = useState('lessons');
  return (
    <>
      <button className="btn ghost sm" onClick={back}>Back to courses</button>
      <h2>{course.title}</h2>
      <div className="tabs">{['lessons', 'tests', 'students'].map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      {tab === 'lessons' && <Lessons id={course.id} />}
      {tab === 'tests' && <Tests id={course.id} />}
      {tab === 'students' && <Students id={course.id} />}
    </>
  );
}

const blankLesson = { title: '', chapter: '', videoUrl: '', fileUrl: '', liveLink: '', liveTime: '', notes: '' };
function Lessons({ id }) {
  const [items, setItems] = useState([]); const [err, setErr] = useState(''); const [f, on, setF] = useForm(blankLesson);
  const load = () => api(`/courses/${id}/content`).then(d => setItems(d.lessons)).catch(e => setErr(e.message));
  useEffect(() => { load(); }, [id]);
  const add = async e => {
    e.preventDefault();
    try { await api(`/teacher/courses/${id}/lessons`, { method: 'POST', body: { ...f, liveTime: f.liveTime || null } }); setF(blankLesson); setErr(''); load(); } catch (x) { setErr(x.message); }
  };
  const del = async l => { if (confirm(`Delete lesson "${l.title}"?`)) { try { await api('/teacher/lessons/' + l.id, { method: 'DELETE' }); load(); } catch (x) { setErr(x.message); } } };
  return (
    <>
      <Alert>{err}</Alert>
      <form className="panel" onSubmit={add}>
        <h3>Add lesson, recorded video, notes or live class</h3>
        <div className="row"><input placeholder="Lesson title" value={f.title} onChange={on('title')} required /><input placeholder="Chapter / module" value={f.chapter} onChange={on('chapter')} /></div>
        <div className="row"><input placeholder="Video link (YouTube or other)" value={f.videoUrl} onChange={on('videoUrl')} /><input placeholder="Notes file link (PDF, DOCX, PPT)" value={f.fileUrl} onChange={on('fileUrl')} /></div>
        <div className="row"><input placeholder="Live class link (Meet / Zoom)" value={f.liveLink} onChange={on('liveLink')} /><input type="datetime-local" value={f.liveTime} onChange={on('liveTime')} aria-label="Live class date and time" /></div>
        <textarea placeholder="Notes" rows={3} value={f.notes} onChange={on('notes')} />
        <button className="btn">Add lesson</button>
      </form>
      {items.map(l => (
        <div key={l.id} className="note"><strong>{l.chapter ? l.chapter + ': ' : ''}{l.title}</strong>
          {l.liveTime && <p className="mute">Live class: {fmt(l.liveTime)}</p>}
          <button className="btn sm danger" onClick={() => del(l)}>Delete</button></div>))}
      {!items.length && <p className="mute">No lessons yet.</p>}
    </>
  );
}

const blankTest = { title: '', durationMinutes: 10, passMarks: 0, negativeMarks: 0 };
const blankQ = { questionText: '', optA: '', optB: '', optC: '', optD: '', correct: 'A', explanation: '', marks: 1 };
function Tests({ id }) {
  const [items, setItems] = useState([]); const [err, setErr] = useState(''); const [f, on, setF] = useForm(blankTest);
  const [open, setOpen] = useState(null); // {id, mode}
  const [q, onQ, setQ] = useForm(blankQ); const [info, setInfo] = useState(null);
  const load = () => api(`/courses/${id}/content`).then(d => setItems(d.tests)).catch(e => setErr(e.message));
  useEffect(() => { load(); }, [id]);
  const addTest = async e => {
    e.preventDefault();
    try { await api(`/teacher/courses/${id}/tests`, { method: 'POST', body: { ...f, durationMinutes: +f.durationMinutes, passMarks: +f.passMarks, negativeMarks: +f.negativeMarks } }); setF(blankTest); setErr(''); load(); } catch (x) { setErr(x.message); }
  };
  const addQ = async e => {
    e.preventDefault();
    try { await api(`/teacher/tests/${open.id}/questions`, { method: 'POST', body: { ...q, marks: +q.marks } }); setQ(blankQ); setErr(''); setInfo('Question added'); } catch (x) { setErr(x.message); }
  };
  const [rows, setRows] = useState([]);
  const show = async (t, mode) => {
    setOpen({ id: t.id, mode }); setInfo(null);
    if (mode === 'results') setRows(await api(`/teacher/tests/${t.id}/results`).catch(() => []));
  };
  return (
    <>
      <Alert>{err}</Alert>
      <form className="panel" onSubmit={addTest}>
        <h3>New MCQ test</h3>
        <div className="row"><input placeholder="Test title" value={f.title} onChange={on('title')} required />
          <label>Minutes<input type="number" min="1" value={f.durationMinutes} onChange={on('durationMinutes')} /></label>
          <label>Pass marks<input type="number" min="0" step="0.5" value={f.passMarks} onChange={on('passMarks')} /></label>
          <label>Negative marks<input type="number" min="0" step="0.25" value={f.negativeMarks} onChange={on('negativeMarks')} /></label></div>
        <button className="btn">Create test</button>
      </form>
      {items.map(t => (
        <div key={t.id} className="note"><strong>{t.title}</strong> <span className="mute">{t.durationMinutes} min, pass {t.passMarks}</span><br />
          <button className="btn sm" onClick={() => show(t, 'question')}>Add question</button>
          <button className="btn sm ghost" onClick={() => show(t, 'results')}>View results</button>
          {open?.id === t.id && open.mode === 'question' && (
            <form onSubmit={addQ} className="inner">
              <Alert kind="ok">{info}</Alert>
              <input placeholder="Question" value={q.questionText} onChange={onQ('questionText')} required />
              <div className="row"><input placeholder="Option A" value={q.optA} onChange={onQ('optA')} required /><input placeholder="Option B" value={q.optB} onChange={onQ('optB')} required /></div>
              <div className="row"><input placeholder="Option C" value={q.optC} onChange={onQ('optC')} required /><input placeholder="Option D" value={q.optD} onChange={onQ('optD')} required /></div>
              <div className="row"><label>Correct answer<select value={q.correct} onChange={onQ('correct')}>{'ABCD'.split('').map(x => <option key={x}>{x}</option>)}</select></label>
                <label>Marks<input type="number" min="0.5" step="0.5" value={q.marks} onChange={onQ('marks')} /></label></div>
              <input placeholder="Explanation (shown after submission)" value={q.explanation} onChange={onQ('explanation')} />
              <button className="btn sm">Save question</button>
            </form>)}
          {open?.id === t.id && open.mode === 'results' && (
            <div className="inner">{rows.length ? rows.map(r => <div key={r.id}>{r.student?.name}: {r.score}/{r.total} ({r.passed ? 'pass' : 'fail'})</div>) : <span className="mute">No attempts yet.</span>}</div>)}
        </div>))}
      {!items.length && <p className="mute">No tests yet.</p>}
    </>
  );
}

function Students({ id }) {
  const [rows, setRows] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api(`/teacher/courses/${id}/students`).then(setRows).catch(e => setErr(e.message)); }, [id]);
  return (
    <>
      <Alert>{err}</Alert>
      {rows && <div className="scroll"><table><thead><tr><th>Student</th><th>Email</th><th>Progress</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.email}><td>{r.name}</td><td>{r.email}</td><td>{r.progress}%</td></tr>)}</tbody></table></div>}
      {rows && !rows.length && <p className="mute">No students are enrolled yet.</p>}
    </>
  );
}
