import React, { useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { useNavigate, useParams } from 'react-router-dom';

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

const AddTask = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(baseTask);
  const [specific, setSpecific] = useState({});
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const token = useMemo(() => localStorage.getItem('authToken'), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !roomId || !form.title) return;
    setCreating(true);
    setError(null);

    const payload = {
      roomId,
      type: form.type,
      title: form.title,
      description: form.description,
      category: form.category,
      estimatedTime: form.estimatedTime,
      verificationMethod: form.verificationMethod,
      rewardPoints: form.rewardPoints,
      bonusPointsForStreak: form.bonusPointsForStreak,
      streakEligible: form.streakEligible,
      specificTaskData: specific,
    };

    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError('Failed to create task.');
        return;
      }
      navigate(`/dashboard/${roomId}`);
    } catch (err) {
      setError('Failed to create task.');
    } finally {
      setCreating(false);
    }
  };

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
            <div className="grid gap-3 sm:grid-cols-2 text-xs mt-2">
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
              <label className="mt-5 inline-flex items-center gap-2 text-xs text-slate-300">
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
            <div className="grid gap-3 sm:grid-cols-2 text-xs mt-2">
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
              <label className="mt-5 inline-flex items-center gap-2 text-xs text-slate-300">
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
              <p className="text-slate-300">Content (markdown or long text)</p>
              <textarea
                rows={4}
                value={specific.articleText || ''}
                onChange={(e) => setSpecific((p) => ({ ...p, articleText: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none"
              />
            </div>
            <div className="space-y-1 text-xs mt-2">
              <p className="text-slate-300">Estimated reading time (min)</p>
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
      case 'quiz':
        return (
          <div className="space-y-2 text-xs">
            <p className="text-slate-300">Quiz configuration</p>
            <p className="text-[10px] text-slate-500">
              Full MCQ builder (questions + options) can be added later. For now you can set number of questions and
              passing percentage.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-slate-300">Number of questions</p>
                <input
                  type="number"
                  value={specific.numberOfQuestions || ''}
                  onChange={(e) =>
                    setSpecific((p) => ({ ...p, numberOfQuestions: Number(e.target.value || 0) }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
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
          </div>
        );
      case 'mixed':
        return (
          <p className="text-[10px] text-slate-400">
            Mixed task: combine multiple behaviours (e.g. link + quiz). You can start by configuring it like a link
            task and extend later.
          </p>
        );
      case 'pomodoro':
        return (
          <div className="space-y-1 text-xs">
            <p className="text-slate-300">Pomodoro duration (min)</p>
            <input
              type="number"
              value={specific.pomodoroDuration || 25}
              onChange={(e) =>
                setSpecific((p) => ({ ...p, pomodoroDuration: Number(e.target.value || 0) }))
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-slate-950/90 p-5 text-xs text-slate-100 shadow-xl shadow-slate-950/80"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Add Task</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Room <span className="font-mono text-cyan-300">{roomId}</span>
          </p>

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
              <p className="text-slate-300">Task title</p>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none"
                placeholder="Watch X video, Complete Y article, etc."
              />
            </div>
            <div className="space-y-1">
              <p className="text-slate-300">Description</p>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-slate-300">Category (optional)</p>
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

          <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Task-specific options
            </p>
            {renderSpecificFields()}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-slate-300">Points</p>
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
                onChange={(e) => setForm((p) => ({ ...p, streakEligible: e.target.checked }))}
                className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-cyan-400"
              />
              Count for streak
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/${roomId}`)}
              className="rounded-full border border-slate-600/70 bg-slate-900/80 px-4 py-1.5 text-slate-100 hover:border-slate-400/70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !form.title}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold shadow-lg transition $${
                creating || !form.title
                  ? 'cursor-not-allowed bg-slate-800 text-slate-500 shadow-none'
                  : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 shadow-cyan-500/40 hover:scale-[1.03]'
              }`}
            >
              {creating ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddTask;
