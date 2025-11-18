import React, { useEffect, useRef, useState } from 'react';

// Simple pomodoro-style focus timer that pauses when the tab loses focus.
const PomodoroTaskViewer = ({ task, onEngagementChange }) => {
  const requiredMinutes = task?.pomodoroData?.requiredMinutes || task?.estimatedTime || 25;
  const requiredSeconds = requiredMinutes * 60;

  const [activeSeconds, setActiveSeconds] = useState(0);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const timerRef = useRef(null);
  const lastTickRef = useRef(null);

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
          setActiveSeconds((prev) => Math.min(requiredSeconds, prev + diff));
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
  }, [isFocused, requiredSeconds]);

  useEffect(() => {
    const canComplete = !cheatingDetected && activeSeconds >= requiredSeconds;

    if (onEngagementChange) {
      onEngagementChange({
        canComplete,
        activeSeconds,
        timeSpentSeconds: activeSeconds,
        cheatingDetected,
      });
    }
  }, [activeSeconds, requiredSeconds, cheatingDetected, onEngagementChange]);

  const remaining = Math.max(0, requiredSeconds - activeSeconds);
  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400">
        Stay focused in this tab until the timer completes. Switching away may block completion.
      </p>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-400/60 bg-slate-950/90 p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200">Focus Timer</p>
        <p className="mt-2 text-3xl font-semibold text-slate-50 font-mono">
          {m}:{s}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Target: {requiredMinutes} min • Active: {Math.floor(activeSeconds / 60)} min
        </p>
      </div>
      {cheatingDetected && (
        <p className="text-[11px] text-rose-300">
          We detected tab switches or loss of focus. Please fully engage with the task to complete it.
        </p>
      )}
    </div>
  );
};

export default PomodoroTaskViewer;
