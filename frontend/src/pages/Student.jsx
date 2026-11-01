import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, Alert, Progress, Announcements, fmt } from '../lib.jsx';

export function StudentHome() {
  const [mine, setMine] = useState([]); const [hist, setHist] = useState([]); const [err, setErr] = useState('');
  useEffect(() => {
    api('/student/enrollments').then(setMine).catch(e => setErr(e.message));
    api('/student/attempts').then(setHist).catch(() => {});
  }, []);
  return (
    <>
      <h2>My learning</h2>
      <Alert>{err}</Alert>
      <div className="grid">
        {mine.map(({ course, progress }) => (
          <Link key={course.id} to={`/learn/${course.id}`} className="card course">
            <h3>{course.title}</h3><Progress value={progress} /><small className="mute">{progress}% complete</small>
          </Link>))}
      </div>
      {!mine.length && <p className="mute">You have not enrolled in a course yet. <Link to="/">Browse courses</Link></p>}
      <Announcements />
      <section className="panel"><h3>Test history</h3>
        {hist.length ? <div className="scroll"><table><thead><tr><th>Test</th><th>Score</th><th>Result</th><th>Date</th></tr></thead>
          <tbody>{hist.map(a => <tr key={a.id}><td>{a.testTitle}</td><td>{a.score} / {a.total}</td><td><span className={'pill ' + (a.passed ? 'ACTIVE' : 'SUSPENDED')}>{a.passed ? 'Pass' : 'Fail'}</span></td><td>{fmt(a.submittedAt)}</td></tr>)}</tbody></table></div>
          : <p className="mute">Attempt a test to see your results here.</p>}
      </section>
    </>
  );
}

const embed = u => {
  const m = u && u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  return m ? 'https://www.youtube.com/embed/' + m[1] : null;
};

export function Learn() {
  const { id } = useParams(); const [d, setD] = useState(null); const [err, setErr] = useState('');
  const [done, setDone] = useState([]); const [cur, setCur] = useState(null);
  useEffect(() => {
    api(`/courses/${id}/content`).then(x => { setD(x); setDone(x.completed || []); setCur(x.lessons[0] || null); }).catch(e => setErr(e.message));
  }, [id]);
  const isStudent = JSON.parse(localStorage.getItem('user') || '{}').role === 'STUDENT';
  const complete = async l => {
    try { const r = await api(`/student/complete/${id}/${l.id}`, { method: 'POST' }); setDone(r.completed); } catch (e) { setErr(e.message); }
  };
  if (err && !d) return <Alert>{err}</Alert>;
  if (!d) return <p className="mute">Loading...</p>;
  const pct = d.lessons.length ? Math.round(done.length * 100 / d.lessons.length) : 0;
  return (
    <div className="learn">
      <aside className="panel">
        <h3>{d.course.title}</h3>
        {isStudent && <><Progress value={pct} /><small className="mute">{pct}% complete</small></>}
        <h4>Lessons</h4>
        {d.lessons.map(l => (
          <button key={l.id} className={'lesson ' + (cur?.id === l.id ? 'on' : '')} onClick={() => setCur(l)}>
            {done.includes(l.id) ? 'Done: ' : ''}{l.title}
          </button>))}
        {!d.lessons.length && <p className="mute">The teacher has not added lessons yet.</p>}
        <h4>Tests</h4>
        {d.tests.map(t => isStudent ? <Link key={t.id} className="lesson" to={`/quiz/${t.id}`}>{t.title} ({t.durationMinutes} min)</Link> : <div key={t.id}>{t.title}</div>)}
        {!d.tests.length && <p className="mute">No tests yet.</p>}
      </aside>
      <section className="panel">
        <Alert>{err}</Alert>
        {cur ? (<>
          <h2>{cur.title}</h2><p className="mute">{cur.chapter}</p>
          {cur.videoUrl && (embed(cur.videoUrl)
            ? <div className="video"><iframe src={embed(cur.videoUrl)} title={cur.title} allowFullScreen /></div>
            : <p><a href={cur.videoUrl} target="_blank" rel="noreferrer">Watch recorded lecture</a></p>)}
          {cur.liveLink && <p className="note">Live class: <b>{fmt(cur.liveTime)}</b>. <a className="btn sm" href={cur.liveLink} target="_blank" rel="noreferrer">Join class</a></p>}
          {cur.notes && <p className="notes">{cur.notes}</p>}
          {cur.fileUrl && <p><a href={cur.fileUrl} target="_blank" rel="noreferrer">Download study material</a></p>}
          {isStudent && !done.includes(cur.id) && <button className="btn" onClick={() => complete(cur)}>Mark lesson complete</button>}
        </>) : <p className="mute">Select a lesson to begin.</p>}
      </section>
    </div>
  );
}

export function Quiz() {
  const { id } = useParams(); const [data, setData] = useState(null); const [ans, setAns] = useState({});
  const [left, setLeft] = useState(0); const [res, setRes] = useState(null); const [err, setErr] = useState('');
  const sent = useRef(false); const submitRef = useRef();
  useEffect(() => { api('/student/tests/' + id).then(d => { setData(d); setLeft(d.test.durationMinutes * 60); }).catch(e => setErr(e.message)); }, [id]);
  const submit = async () => {
    if (sent.current) return; sent.current = true;
    try { setRes(await api(`/student/tests/${id}/submit`, { method: 'POST', body: ans })); } catch (e) { sent.current = false; setErr(e.message); }
  };
  submitRef.current = submit;
  useEffect(() => { if (!data || res) return; const t = setInterval(() => setLeft(l => l - 1), 1000); return () => clearInterval(t); }, [data, res]);
  useEffect(() => { if (data && !res && left <= 0) submitRef.current(); }, [left]);

  if (err && !data) return <Alert>{err}</Alert>;
  if (!data) return <p className="mute">Loading test...</p>;
  if (res) return (
    <section className="panel">
      <h2>{data.test.title}: {res.passed ? 'Passed' : 'Not passed'}</h2>
      <p>You scored <b>{res.score}</b> out of {res.total} ({res.percentage}%).</p>
      {res.review.map((r, i) => (
        <div key={i} className={'note ' + (r.right ? 'right' : 'wrong')}>
          <b>{i + 1}. {r.questionText}</b>
          <p>Your answer: {r.yours}. Correct answer: {r.correct}.</p>
          {r.explanation && <p className="mute">{r.explanation}</p>}
        </div>))}
      <Link className="btn" to="/dashboard">Back to dashboard</Link>
    </section>
  );
  const mm = String(Math.max(0, Math.floor(left / 60))).padStart(2, '0'), ss = String(Math.max(0, left % 60)).padStart(2, '0');
  return (
    <section className="panel">
      <div className="quizbar"><h2>{data.test.title}</h2><span className={'timer ' + (left < 60 ? 'low' : '')} role="timer">{mm}:{ss}</span></div>
      <Alert>{err}</Alert>
      {data.questions.map((q, i) => (
        <fieldset key={q.id} className="q"><legend>{i + 1}. {q.questionText} <small className="mute">({q.marks} marks)</small></legend>
          {['A', 'B', 'C', 'D'].map(o => (
            <label key={o} className="opt"><input type="radio" name={'q' + q.id} checked={ans[q.id] === o} onChange={() => setAns({ ...ans, [q.id]: o })} /> {o}. {q['opt' + o]}</label>))}
        </fieldset>))}
      {!data.questions.length && <p className="mute">This test has no questions yet.</p>}
      <button className="btn" onClick={() => confirm('Submit your answers now?') && submit()}>Submit test</button>
    </section>
  );
}
