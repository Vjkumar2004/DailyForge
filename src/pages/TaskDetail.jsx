import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import VideoTaskViewer from '../components/VideoTaskViewer.jsx';
import LinkTaskViewer from '../components/LinkTaskViewer.jsx';
import ReadingTaskViewer from '../components/ReadingTaskViewer.jsx';
import QuizTaskViewer from '../components/QuizTaskViewer.jsx';
import PomodoroTaskViewer from '../components/PomodoroTaskViewer.jsx';

const TaskDetail = () => {
  const { roomId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [engagement, setEngagement] = useState({});
  const [canComplete, setCanComplete] = useState(false);
  const [engagementMessage, setEngagementMessage] = useState('');
  const [showArticle, setShowArticle] = useState(false);

  const token = useMemo(() => localStorage.getItem('authToken'), []);

  useEffect(() => {
    const load = async () => {
      if (!token || !taskId) {
        setLoading(false);
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError('Failed to load task.');
          return;
        }
        const data = await res.json();
        setTask(data.data || null);

        // Track click when opening detail
        try {
          await fetch(`http://localhost:5000/api/tasks/${taskId}/track-click`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (e) {
          // ignore
        }
      } catch (e) {
        setError('Failed to load task.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [taskId, token]);

  const handleComplete = async () => {
    if (!token || !task || !canComplete) {
      setEngagementMessage('Please fully engage with the task to complete it.');
      return;
    }
    setCompleting(true);
    setEngagementMessage('');
    try {
      const payload = {
        taskId: task._id,
        watchPercent: engagement.watchPercent,
        readPercent: engagement.readPercent,
        activeSeconds: engagement.activeSeconds,
        correctAnswersCount: engagement.correctAnswersCount,
        timeSpentSeconds: engagement.timeSpentSeconds,
        cheatingDetected: engagement.cheatingDetected,
      };

      const res = await fetch('http://localhost:5000/api/tasks/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setEngagementMessage('Please fully engage with the task to complete it.');
      } else {
        navigate(`/dashboard/${roomId}`);
      }
    } catch (e) {
      setEngagementMessage('Something went wrong. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const handleEngagementChange = (update) => {
    setEngagement((prev) => ({ ...prev, ...update }));

    if (typeof update.canComplete === 'boolean') {
      setCanComplete(update.canComplete);

      if (!update.canComplete) {
        // Tailored message for video tasks: show how much is watched vs required
        if (task?.type === 'video' && typeof update.watchPercent === 'number') {
          const required = task?.requirements?.minWatchPercent ?? 90;
          setEngagementMessage(
            `You have only watched ${update.watchPercent}% of this video. Please watch at least ${required}% before completing.`,
          );
        } else {
          setEngagementMessage('Please fully engage with the task to complete it.');
        }
      } else {
        setEngagementMessage('');
      }
    }
  };

  const articleUrl =
    task?.linkData?.url ||
    task?.specificTaskData?.url ||
    task?.readingData?.contentUrl ||
    task?.specificTaskData?.contentUrl ||
    null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-10 pt-6 text-xs text-slate-100">
        {loading && <p className="text-slate-400">Loading task…</p>}
        {!loading && error && <p className="text-rose-300">{error}</p>}
        {!loading && task && (
          <div className="space-y-4">
            <section className="rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-xl shadow-slate-950/80">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Task</p>
              <h1 className="mt-2 text-lg font-semibold text-slate-50">{task.title}</h1>
              <p className="mt-1 text-[11px] text-slate-400">
                Room <span className="font-mono text-cyan-300">{roomId}</span> •
                <span className="ml-1 capitalize">{task.type}</span> • {task.rewardPoints || 0} pts
              </p>
              {task.description && (
                <p className="mt-3 text-xs text-slate-300">{task.description}</p>
              )}
            </section>

            {/* Simple guidance based on type */}
            <section className="rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-lg shadow-slate-950/80">
              {task.type === 'video' && (
                <VideoTaskViewer task={task} onEngagementChange={handleEngagementChange} />
              )}
              {task.type === 'link' && (
                <LinkTaskViewer task={task} onEngagementChange={handleEngagementChange} />
              )}
              {task.type === 'reading' && (
                <ReadingTaskViewer task={task} onEngagementChange={handleEngagementChange} />
              )}
              {task.type === 'quiz' && (
                <>
                  {(task.specificTaskData?.url || task.linkData?.url) && (
                    <div className="mb-3 h-56 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
                      <iframe
                        src={task.linkData?.url || task.specificTaskData?.url}
                        title={task.title || 'Reference link'}
                        className="h-full w-full"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                      />
                    </div>
                  )}
                  <QuizTaskViewer task={task} onEngagementChange={handleEngagementChange} />
                </>
              )}
              {task.type === 'pomodoro' && (
                <PomodoroTaskViewer task={task} onEngagementChange={handleEngagementChange} />
              )}
              {task.type === 'mixed' && (
                <p className="text-[11px] text-slate-400">
                  Mixed task: this can combine multiple engagement types. For now, please complete the attached
                  resources and quiz before marking complete.
                </p>
              )}
            </section>

            <section className="flex flex-col items-end gap-2 text-xs">
              {engagementMessage && (
                <p className="mb-1 text-[11px] text-amber-300">{engagementMessage}</p>
              )}
              {articleUrl && (
                <button
                  type="button"
                  onClick={() => setShowArticle(true)}
                  className="rounded-full border border-sky-500/60 bg-sky-500/10 px-3 py-1 text-[11px] text-sky-100 hover:bg-sky-500/20"
                >
                  Open article in reader
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate(`/dashboard/${roomId}`)}
                className="rounded-full border border-slate-600/70 bg-slate-900/80 px-4 py-1.5 text-slate-100 hover:border-slate-400/80"
              >
                Back to dashboard
              </button>
              <button
                type="button"
                disabled={completing || !canComplete}
                onClick={handleComplete}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold shadow-lg transition ${
                  completing || !canComplete
                    ? 'cursor-not-allowed bg-slate-800 text-slate-500 shadow-none'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-emerald-500/40 hover:scale-[1.03]'
                }`}
              >
                {completing ? 'Completing…' : 'Mark complete & earn points'}
              </button>
            </section>
          </div>
        )}
      </main>
      {showArticle && articleUrl && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4">
          <div className="relative h-[80vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-slate-950 shadow-2xl shadow-slate-950/80">
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-2 text-[11px] text-slate-200">
              <span className="truncate">{task?.title || 'Article reader'}</span>
              <button
                type="button"
                onClick={() => setShowArticle(false)}
                className="rounded-full border border-slate-600/70 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-100 hover:border-slate-400/80"
              >
                Close
              </button>
            </div>
            <iframe
              src={articleUrl}
              title={task?.title || 'Article'}
              className="h-full w-full"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
