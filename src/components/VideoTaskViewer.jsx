import React, { useEffect, useRef, useState } from 'react';

// Basic video viewer with focus + active time tracking.
// It reports engagement metrics back up via onEngagementChange.
const VideoTaskViewer = ({ task, onEngagementChange }) => {
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [tracking, setTracking] = useState(false);
  const timerRef = useRef(null);
  const lastTickRef = useRef(null);

  const minWatchPercent = task?.requirements?.minWatchPercent ?? 90;
  const minActiveSeconds = task?.requirements?.minActiveSeconds ?? (task?.estimatedTime || 0) * 60 * 0.8;

  // For now we approximate watchPercent from activeSeconds vs expected duration
  const expectedSeconds = (task?.videoData?.duration || (task?.estimatedTime || 0) * 60) || 0;
  const watchPercent = expectedSeconds > 0 ? Math.min(100, Math.round((activeSeconds / expectedSeconds) * 100)) : 0;

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsFocused(visible);
      if (!visible) {
        setCheatingDetected(true);
      }
    };

    handleVisibilityChange();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isFocused || !tracking) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        lastTickRef.current = null;
      }
      return;
    }

    if (!timerRef.current) {
      lastTickRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - (lastTickRef.current || now)) / 1000);
        lastTickRef.current = now;
        if (diff > 0) {
          setActiveSeconds((prev) => prev + diff);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        lastTickRef.current = null;
      }
    };
  }, [isFocused, tracking]);

  useEffect(() => {
    const canComplete =
      !cheatingDetected &&
      (minWatchPercent ? watchPercent >= minWatchPercent : true) &&
      (minActiveSeconds ? activeSeconds >= minActiveSeconds : true);

    if (onEngagementChange) {
      onEngagementChange({
        canComplete,
        watchPercent,
        activeSeconds,
        timeSpentSeconds: activeSeconds,
        cheatingDetected,
      });
    }
  }, [activeSeconds, watchPercent, cheatingDetected, minWatchPercent, minActiveSeconds, onEngagementChange]);

  const rawUrl = task?.videoData?.videoUrl || task?.specificTaskData?.videoUrl;

  // Convert common YouTube URLs to embed format to avoid "refused to connect" issues
  let url = rawUrl;
  try {
    if (rawUrl) {
      const parsed = new URL(rawUrl);
      const host = parsed.hostname.replace('www.', '');

      if (host === 'youtube.com' || host === 'm.youtube.com') {
        const v = parsed.searchParams.get('v');
        if (v) {
          url = `https://www.youtube.com/embed/${v}`;
        }
      } else if (host === 'youtu.be') {
        const id = parsed.pathname.replace('/', '');
        if (id) {
          url = `https://www.youtube.com/embed/${id}`;
        }
      }
    }
  } catch (e) {
    // fall back to rawUrl
    url = rawUrl;
  }

  return (
    <div className="space-y-3">
      {url && (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/80">
          <iframe
            src={url}
            title={task?.title || 'Video task'}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      <p className="text-[11px] text-slate-400">
        Press <span className="font-semibold text-emerald-300">Start focus tracking</span> when you start the video.
        The timer runs only while this tab is visible.
      </p>
      <button
        type="button"
        onClick={() => setTracking((prev) => !prev)}
        className="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-100 hover:bg-emerald-500/20"
      >
        {tracking ? 'Pause tracking' : 'Start focus tracking'}
      </button>
      <p className="text-[11px] text-slate-300">
        Active focus time: <span className="font-mono text-cyan-300">{activeSeconds}s</span> •
        Watched approx: <span className="font-mono text-emerald-300">{watchPercent}%</span>
      </p>
      {cheatingDetected && (
        <p className="text-[11px] text-rose-300">
          We detected tab switches or loss of focus. Please fully engage with the task to complete it.
        </p>
      )}
    </div>
  );
};

export default VideoTaskViewer;
