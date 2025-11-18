import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

const baseTask = {
  type: 'link',
  title: '',
  description: '',
  category: '',
  estimatedTime: 25,
  verificationMethod: 'time',
  rewardPoints: 20,
  bonusPointsForStreak: 5,
  streakEligible: true,
};

const AdminDashboard = ({ room }) => {
  const roomId = room?.roomId || room?._id;
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(baseTask);
  const [specific, setSpecific] = useState({});
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const token = useMemo(() => localStorage.getItem('authToken'), []);
  const navigate = useNavigate();

  const loadTasks = async () => {
    if (!token || !roomId) return;
    setLoadingTasks(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/tasks?roomId=${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.data)) setTasks(data.data);
    } catch (e) {
      setError('Failed to load tasks.');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleEditTask = (task) => {
    setForm({
      type: task.type,
      title: task.title,
      description: task.description || '',
      category: task.category || '',
      estimatedTime: task.estimatedTime || baseTask.estimatedTime,
      verificationMethod: task.verificationMethod || baseTask.verificationMethod,
      rewardPoints: task.rewardPoints ?? baseTask.rewardPoints,
      bonusPointsForStreak: task.bonusPointsForStreak ?? baseTask.bonusPointsForStreak,
      streakEligible: typeof task.streakEligible === 'boolean' ? task.streakEligible : baseTask.streakEligible,
    });
    setSpecific(task.specificTaskData || {});
    setEditingId(task._id);
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!token || !roomId) return;
    setCreating(true);
    setError(null);

    const payload = {
      roomId,
      ...form,
      specificTaskData: specific,
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/tasks/${editingId}`
        : 'http://localhost:5000/api/tasks';

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError(editingId ? 'Failed to update task.' : 'Failed to create task.');
        return;
      }
      setForm(baseTask);
      setSpecific({});
      setEditingId(null);
      await loadTasks();
    } catch (e) {
      setError('Failed to create task.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (e) {
      // optional: swallow delete error
    }
  };

  const analytics = useMemo(() => {
    if (!tasks.length)
      return { clicks: 0, completions: 0, avgTime: 0, dropOffs: 0, usersCompleted: 0 };

    let clicks = 0;
    let completions = 0;
    let totalTime = 0;
    let dropOffs = 0;
    const usersSet = new Set();

    tasks.forEach((t) => {
      const a = t.analytics || {};
      clicks += a.taskClicks || 0;
      completions += a.completions || 0;
      totalTime += a.totalCompletionTime || 0;
      dropOffs += a.dropOffs || 0;

      if (Array.isArray(a.usersCompleted)) {
        a.usersCompleted.forEach((id) => {
          if (id) usersSet.add(String(id));
        });
      }
    });

    const avgTime = completions ? Math.round(totalTime / completions) : 0;
    const usersCompleted = usersSet.size;

    return { clicks, completions, avgTime, dropOffs, usersCompleted };
  }, [tasks]);

  const renderSpecificFields = () => {
    switch (form.type) {
      case 'link':
        return (
          <>
            <div className="space-y-1 text-xs">
              <p className="text-slate-300">URL</p>
              <input
                type="url"
                value={specific.url || ''}
                onChange={(e) => setSpecific((p) => ({ ...p, url: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="space-y-1">
                <p className="text-slate-300">Required active time (min)</p>
                <input
                  type="number"
                  value={specific.requiredActiveTime || ''}
                  onChange={(e) =>
                    setSpecific((p) => ({ ...p, requiredActiveTime: Number(e.target.value || 0) }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                />
              </div>
              <label className="mt-4 inline-flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={!!specific.minimumScrollDepth}
                  onChange={(e) =>
                    setSpecific((p) => ({ ...p, minimumScrollDepth: e.target.checked }))
                  }
                  className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-cyan-400"
                />
                Require full scroll depth
              </label>
            </div>
          </>
        );
      case 'video':
        return (
          <>
            <div className="space-y-1 text-xs">
              <p className="text-slate-300">Video URL</p>
              <input
                type="url"
                value={specific.videoUrl || ''}
                onChange={(e) => setSpecific((p) => ({ ...p, videoUrl: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                placeholder="YouTube / Vimeo link"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="space-y-1">
                <p className="text-slate-300">Required watch duration (min)</p>
                <input
                  type="number"
                  value={specific.requiredWatchDuration || ''}
                  onChange={(e) =>
                    setSpecific((p) => ({ ...p, requiredWatchDuration: Number(e.target.value || 0) }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                />
              </div>
              <label className="mt-4 inline-flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={!!specific.autoplayEnabled}
                  onChange={(e) =>
                    setSpecific((p) => ({ ...p, autoplayEnabled: e.target.checked }))
                  }
                  className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-cyan-400"
                />
                Autoplay enabled
              </label>
            </div>
          </>
        );
      case 'reading':
        return (
          <>
            <div className="space-y-1 text-xs">
              <p className="text-slate-300">Content URL (optional)</p>
              <input
                type="url"
                value={specific.contentUrl || ''}
                onChange={(e) => setSpecific((p) => ({ ...p, contentUrl: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                placeholder="PDF / article URL"
              />
            </div>
            <div className="space-y-1 text-xs mt-2">
              <p className="text-slate-300">Paste article text (optional)</p>
              <textarea
                rows={3}
                value={specific.articleText || ''}
                onChange={(e) => setSpecific((p) => ({ ...p, articleText: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none"
              />
            </div>
            <div className="space-y-1 text-xs mt-2">
              <p className="text-slate-300">Required reading duration (min)</p>
              <input
                type="number"
                value={specific.requiredReadingDuration || ''}
                onChange={(e) =>
                  setSpecific((p) => ({ ...p, requiredReadingDuration: Number(e.target.value || 0) }))
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
              />
            </div>
          </>
        );
      case 'quiz': {
        const questions =
          (Array.isArray(specific.questions) && specific.questions.length > 0
            ? specific.questions
            : [
                {
                  question: '',
                  options: ['', '', '', ''],
                  correctAnswers: [],
                },
              ]);

        const updateQuestion = (index, updater) => {
          setSpecific((p) => {
            const existing = Array.isArray(p.questions) && p.questions.length > 0
              ? [...p.questions]
              : [
                  {
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswers: [],
                  },
                ];
            const current = { ...existing[index] };
            const updated = updater(current);
            existing[index] = updated;
            return {
              ...p,
              questions: existing,
            };
          });
        };

        const toggleCorrect = (qIndex, optionIndex) => {
          updateQuestion(qIndex, (q) => {
            const set = new Set(q.correctAnswers || []);
            if (set.has(optionIndex)) set.delete(optionIndex);
            else set.add(optionIndex);
            q.correctAnswers = Array.from(set);
            return q;
          });
        };

        const addQuestion = () => {
          setSpecific((p) => ({
            ...p,
            questions: [
              ...(Array.isArray(p.questions) && p.questions.length > 0 ? p.questions : questions),
              {
                question: '',
                options: ['', '', '', ''],
                correctAnswers: [],
              },
            ],
          }));
        };

        const removeQuestion = (index) => {
          setSpecific((p) => {
            const existing = Array.isArray(p.questions) ? [...p.questions] : [];
            if (existing.length <= 1) return p; // keep at least one question
            existing.splice(index, 1);
            return {
              ...p,
              questions: existing,
            };
          });
        };

        return (
          <div className="space-y-3 text-xs">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-slate-300">Reference URL (optional)</p>
                <input
                  type="url"
                  value={specific.url || ''}
                  onChange={(e) => setSpecific((p) => ({ ...p, url: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                  placeholder="https://en.wikipedia.org/..."
                />
              </div>
              <div className="space-y-1">
                <p className="text-slate-300">Passing percentage</p>
                <input
                  type="number"
                  value={specific.passingPercentage || ''}
                  onChange={(e) =>
                    setSpecific((p) => ({ ...p, passingPercentage: Number(e.target.value || 0) }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/90 p-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Quiz questions
                </p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-100 hover:border-emerald-400/80 hover:bg-emerald-500/20"
                >
                  Add question
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-slate-200">Question {qIndex + 1}</p>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="rounded-full border border-rose-500/60 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-100 hover:border-rose-400/80 hover:bg-rose-500/20"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="text-slate-300">Question text</p>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) =>
                          updateQuestion(qIndex, (current) => {
                            current.question = e.target.value;
                            return current;
                          })
                        }
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                      />
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {(q.options || ['', '', '', '']).map((opt, idx) => (
                        <label key={idx} className="flex items-center gap-2 text-slate-200">
                          <input
                            type="checkbox"
                            checked={(q.correctAnswers || []).includes(idx)}
                            onChange={() => toggleCorrect(qIndex, idx)}
                            className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-cyan-400"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              updateQuestion(qIndex, (current) => {
                                const copy = Array.isArray(current.options)
                                  ? [...current.options]
                                  : ['', '', '', ''];
                                copy[idx] = e.target.value;
                                current.options = copy;
                                return current;
                              })
                            }
                            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-2 py-1 text-[11px] text-slate-100 outline-none"
                            placeholder={`Option ${idx + 1}`}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-[10px] text-slate-500">
                This quiz builder supports multiple questions with multiple correct answers. The learner must meet the
                passing percentage you set above.
              </p>
            </div>
          </div>
        );
      }
      case 'mixed':
        return (
          <p className="text-[10px] text-slate-400">
            Mixed task: this will behave like a link task plus an attached quiz. Configure base link now and you can
            extend quiz details later.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6 space-y-5">
        {/* Room summary */}
        <section className="rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-xl shadow-slate-950/80">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-xl font-semibold text-slate-50">{room?.name || room?.title}</h1>
              <p className="mt-1 text-xs text-slate-400">
                Room ID: <span className="font-mono text-cyan-300">{roomId}</span> • Category:{' '}
                <span className="text-sky-300">{room?.category || 'Others'}</span> • Privacy:{' '}
                <span className="capitalize">{room?.privacy}</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Created at:{' '}
                {room?.createdAt ? new Date(room.createdAt).toLocaleString() : 'Not available'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/rooms/${roomId}/tasks/new`)}
              className="mt-1 rounded-full border border-cyan-500/70 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-100 hover:bg-cyan-500/20"
            >
              Add tasks now
            </button>
          </div>
        </section>

        {/* Analytics + quick stats */}
        <section className="grid gap-3 md:grid-cols-4 text-xs">
          <div className="rounded-2xl border border-cyan-400/40 bg-slate-950/90 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200">Tasks</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{tasks.length}</p>
            <p className="mt-1 text-[11px] text-slate-400">Total tasks in this room</p>
          </div>
          <div className="rounded-2xl border border-sky-400/40 bg-slate-950/90 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-sky-200">Users</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{analytics.usersCompleted}</p>
            <p className="mt-1 text-[11px] text-slate-400">Learners who finished at least one task</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/40 bg-slate-950/90 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200">Completions</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{analytics.completions}</p>
            <p className="mt-1 text-[11px] text-slate-400">Finished tasks</p>
          </div>
          <div className="rounded-2xl border border-violet-400/40 bg-slate-950/90 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-violet-200">Avg time</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              {analytics.avgTime ? `${analytics.avgTime}s` : '—'}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Avg completion time</p>
          </div>
        </section>

        {/* Layout: task list + creation */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
          {/* Task list */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-4 text-xs shadow-lg shadow-slate-950/80">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Tasks</p>
              {loadingTasks && <span className="text-[11px] text-slate-500">Loading…</span>}
            </div>
            {!loadingTasks && !tasks.length && (
              <p className="mt-3 text-[11px] text-slate-400">
                No tasks yet. Create your first task using the form on the right.
              </p>
            )}
            {!loadingTasks && tasks.length > 0 && (
              <div className="mt-3 space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-50">{task.title}</p>
                      <p className="text-[11px] text-slate-400">
                        <span className="capitalize">{task.type}</span> • {task.rewardPoints || 0} pts •
                        verification: {task.verificationMethod}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-400">
                        {task.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/rooms/${roomId}/tasks/${task._id}`)}
                        className="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-100 hover:border-emerald-400/80 hover:bg-emerald-500/20"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditTask(task)}
                        className="rounded-full border border-sky-500/60 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-100 hover:border-sky-400/80 hover:bg-sky-500/20"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task._id)}
                        className="rounded-full border border-rose-500/60 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-200 hover:border-rose-400/80 hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task creation form */}
          <form
            onSubmit={handleCreateTask}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 p-4 text-xs shadow-lg shadow-slate-950/80"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Create New Task
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Configure tasks for this room – link, video, reading, quiz, or mixed.
                </p>
              </div>
            </div>

            {error && <p className="mt-2 text-[11px] text-rose-300">{error}</p>}

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-slate-300">Task type</p>
                <select
                  value={form.type}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, type: e.target.value }));
                    setSpecific({});
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                >
                  <option value="link">Link Task</option>
                  <option value="video">Video Task</option>
                  <option value="reading">Reading Task</option>
                  <option value="quiz">MCQ / Quiz Task</option>
                  <option value="mixed">Mixed Task</option>
                  <option value="pomodoro">Pomodoro Session</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-slate-300">Estimated time (min)</p>
                <input
                  type="number"
                  value={form.estimatedTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, estimatedTime: Number(e.target.value || 0) }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                />
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="space-y-1">
                <p className="text-slate-300">Title</p>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                  placeholder="Deep work block, YouTube lecture, article, etc."
                />
              </div>
              <div className="space-y-1">
                <p className="text-slate-300">Short description</p>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-slate-300">Task category (optional)</p>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-300">Verification</p>
                  <select
                    value={form.verificationMethod}
                    onChange={(e) => setForm((p) => ({ ...p, verificationMethod: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                  >
                    <option value="time">Time-based</option>
                    <option value="quiz">Quiz</option>
                    <option value="both">Both time + quiz</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Task-specific options
              </p>
              {renderSpecificFields()}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-slate-300">Points on completion</p>
                <input
                  type="number"
                  value={form.rewardPoints}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rewardPoints: Number(e.target.value || 0) }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                />
              </div>
              <div className="space-y-1">
                <p className="text-slate-300">Bonus streak points</p>
                <input
                  type="number"
                  value={form.bonusPointsForStreak}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, bonusPointsForStreak: Number(e.target.value || 0) }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                />
              </div>
              <label className="mt-5 inline-flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.streakEligible}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, streakEligible: e.target.checked }))
                  }
                  className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-cyan-400"
                />
                Count this task towards streak
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={creating || !form.title}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold shadow-lg transition $${
                  creating || !form.title
                    ? 'cursor-not-allowed bg-slate-800 text-slate-500 shadow-none'
                    : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 shadow-cyan-500/40 hover:scale-[1.03]'
                }`}
              >
                {creating ? (editingId ? 'Updating…' : 'Creating…') : editingId ? 'Update task' : 'Create task'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
