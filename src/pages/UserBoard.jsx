import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { useNavigate } from 'react-router-dom';

const UserBoard = ({ room }) => {
  const roomId = room?.roomId || room?._id;
  const [user, setUser] = useState({ points: 0, streak: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = useMemo(() => localStorage.getItem('authToken'), []);

  const loadData = async () => {
    if (!token || !roomId) return;
    setLoading(true);
    setError(null);
    try {
      const [profileRes, tasksRes] = await Promise.all([
        fetch('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/tasks?roomId=${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUser({ points: profile.points || 0, streak: profile.streak || 0 });
      }

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        if (Array.isArray(data.data)) setTasks(data.data);
      }
    } catch (e) {
      setError('Failed to load room board.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const navigate = useNavigate();

  // Users now complete tasks from the Task Detail page, so there is no direct
  // "Mark complete" action on the board list.

  const tasksByType = useMemo(() => {
    const groups = { link: [], video: [], reading: [], quiz: [], pomodoro: [], mixed: [] };
    tasks.forEach((t) => {
      if (groups[t.type]) groups[t.type].push(t);
    });
    return groups;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6 space-y-5">
        {/* Header + streak */}
        <section className="rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-xl shadow-slate-950/80">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">User Board</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-50">{room?.name || room?.title}</h1>
          <p className="mt-1 text-xs text-slate-400">
            Room ID: <span className="font-mono text-cyan-300">{roomId}</span>
          </p>
        </section>

        {/* Streak & points */}
        <section className="grid gap-3 md:grid-cols-3 text-xs">
          <div className="rounded-2xl border border-amber-400/40 bg-slate-950/90 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-amber-200">Streak</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{user.streak} days</p>
            <p className="mt-1 text-[11px] text-slate-400">Stay consistent to keep your streak alive.</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/40 bg-slate-950/90 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200">Points</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{user.points}</p>
            <p className="mt-1 text-[11px] text-slate-400">Earn points by completing tasks in this and other rooms.</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200">Task progress</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{tasks.length}</p>
            <p className="mt-1 text-[11px] text-slate-400">Tasks available in this room.</p>
          </div>
        </section>

        {/* Tasks list */}
        <section className="rounded-3xl border border-white/10 bg-slate-950/90 p-4 text-xs shadow-lg shadow-slate-950/80">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Room Tasks</p>
            {loading && <span className="text-[11px] text-slate-500">Loading…</span>}
          </div>
          {error && <p className="mt-2 text-[11px] text-rose-300">{error}</p>}

          {!loading && !tasks.length && (
            <p className="mt-3 text-[11px] text-slate-400">
              No tasks have been added yet. Check back later or ask the room admin to add some.
            </p>
          )}

          {!loading && tasks.length > 0 && (
            <div className="mt-3 space-y-4">
              {['link', 'video', 'reading', 'quiz', 'pomodoro', 'mixed'].map((type) => (
                <div key={type}>
                  {tasksByType[type].length > 0 && (
                    <>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {type === 'link' && 'Link Tasks'}
                        {type === 'video' && 'Video Tasks'}
                        {type === 'reading' && 'Reading Tasks'}
                        {type === 'quiz' && 'MCQ / Quiz Tasks'}
                        {type === 'pomodoro' && 'Pomodoro Sessions'}
                        {type === 'mixed' && 'Mixed Tasks'}
                      </p>
                      <div className="space-y-2">
                        {tasksByType[type].map((task) => (
                          <div
                            key={task._id}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-50">{task.title}</p>
                              <p className="text-[11px] text-slate-400">
                                {task.description}{' '}
                                <span className="text-sky-300">
                                  • {task.rewardPoints || 0} pts • {task.estimatedTime || 0} min
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => navigate(`/rooms/${roomId}/tasks/${task._id}`)}
                                className="rounded-full border border-slate-600/70 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-100 hover:border-cyan-400/70"
                              >
                                Open
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Note about MCQ */}
        <section className="rounded-3xl border border-violet-400/40 bg-slate-950/90 p-4 text-[11px] text-slate-200 shadow-lg shadow-violet-900/60">
          <p className="font-semibold uppercase tracking-[0.18em] text-violet-200">MCQ / Quiz submissions</p>
          <p className="mt-2 text-slate-300">
            For quiz tasks, you can later extend this board to render each question and collect answers. Once
            submitted, call the same completion endpoint with quiz results for deeper analytics.
          </p>
        </section>
      </main>
    </div>
  );
};

export default UserBoard;
