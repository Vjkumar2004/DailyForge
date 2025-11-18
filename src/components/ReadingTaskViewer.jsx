import React, { useEffect, useRef, useState } from 'react';

// Simple reading viewer with scroll-depth approximation and active time.
const ReadingTaskViewer = ({ task, onEngagementChange }) => {
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [readPercent, setReadPercent] = useState(0);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const lastTickRef = useRef(null);

  const minReadPercent = task?.requirements?.minReadPercent ?? 85;
  const minActiveSeconds = task?.requirements?.minActiveSeconds ?? (task?.estimatedTime || 0) * 60 * 0.6;

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
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight <= 0) {
        setReadPercent(100);
        return;
      }
      const percent = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
      setReadPercent(percent);
    };

    el.addEventListener('scroll', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const canComplete =
      !cheatingDetected &&
      (minReadPercent ? readPercent >= minReadPercent : true) &&
      (minActiveSeconds ? activeSeconds >= minActiveSeconds : true);

    if (onEngagementChange) {
      onEngagementChange({
        canComplete,
        readPercent,
        activeSeconds,
        timeSpentSeconds: activeSeconds,
        cheatingDetected,
      });
    }
  }, [activeSeconds, readPercent, cheatingDetected, minReadPercent, minActiveSeconds, onEngagementChange]);

  const contentUrl = task?.readingData?.contentUrl || task?.specificTaskData?.contentUrl;
  const content = task?.readingData?.content || task?.specificTaskData?.articleText || '';

  return (
    <div className="space-y-3">
      {contentUrl && (
        <div className="h-56 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
          <iframe
            src={contentUrl}
            title={task?.title || 'Reading resource'}
            className="h-full w-full"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      )}
      <div
        ref={containerRef}
        className="max-h-56 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-[11px] text-slate-200"
      >
        {content || 'No content provided yet.'}
      </div>
      <p className="text-[11px] text-slate-300">
        Reading progress: <span className="font-mono text-emerald-300">{readPercent}%</span> • Active focus time:{' '}
        <span className="font-mono text-cyan-300">{activeSeconds}s</span>
      </p>
      {cheatingDetected && (
        <p className="text-[11px] text-rose-300">
          We detected tab switches or loss of focus. Please fully engage with the task to complete it.
        </p>
      )}
    </div>
  );
};

export default ReadingTaskViewer;
