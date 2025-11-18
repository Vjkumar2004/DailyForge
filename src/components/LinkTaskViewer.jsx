import React, { useEffect, useRef, useState } from 'react';

// Basic link viewer using an iframe and active time + focus tracking.
const LinkTaskViewer = ({ task, onEngagementChange }) => {
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const timerRef = useRef(null);
  const lastTickRef = useRef(null);

  const minActiveSeconds =
    task?.requirements?.minActiveSeconds ?? (task?.linkData?.minSeconds || (task?.estimatedTime || 0) * 60 * 0.6);

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
    if (!isFocused) {
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
  }, [isFocused]);

  useEffect(() => {
    const canComplete = !cheatingDetected && (minActiveSeconds ? activeSeconds >= minActiveSeconds : true);

    if (onEngagementChange) {
      onEngagementChange({
        canComplete,
        activeSeconds,
        timeSpentSeconds: activeSeconds,
        cheatingDetected,
      });
    }
  }, [activeSeconds, cheatingDetected, minActiveSeconds, onEngagementChange]);

  const rawUrl = task?.linkData?.url || task?.specificTaskData?.url;
  const url = rawUrl
    ? `http://localhost:5000/api/proxy-link?url=${encodeURIComponent(rawUrl)}`
    : null;

  return (
    <div className="space-y-3">
      {url && (
        <div className="h-64 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
          <iframe
            src={url}
            title={task?.title || 'Link task'}
            className="h-full w-full"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      )}
      <p className="text-[11px] text-slate-400">
        Read and interact with this page. Leaving the tab or window may block completion.
      </p>
      <p className="text-[11px] text-slate-300">
        Active focus time: <span className="font-mono text-cyan-300">{activeSeconds}s</span>
      </p>
      {cheatingDetected && (
        <p className="text-[11px] text-rose-300">
          We detected tab switches or loss of focus. Please fully engage with the task to complete it.
        </p>
      )}
    </div>
  );
};

export default LinkTaskViewer;
